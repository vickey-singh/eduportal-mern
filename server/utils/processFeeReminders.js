
const Student = require('../models/Student')
const FeeReminderLog = require('../models/FeeReminderLog')
const sendFeeReminderEmail = require('./sendFeeReminderEmail')

const TIME_ZONE = 'Asia/Kolkata'

const getDateKey = (value = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value)

  const values = {}

  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value
    }
  }

  return `${values.year}-${values.month}-${values.day}`
}

const dateKeyToUTC = (key) => {
  const [year, month, day] = key.split('-').map(Number)
  return Date.UTC(year, month - 1, day)
}

const daysBetween = (fromKey, toKey) =>
  Math.round(
    (dateKeyToUTC(toKey) - dateKeyToUTC(fromKey)) /
      (24 * 60 * 60 * 1000)
  )

const getReminderStage = (dueDate, todayKey) => {
  if (!dueDate) return null

  const dueDateKey = getDateKey(new Date(dueDate))
  const daysUntilDue = daysBetween(todayKey, dueDateKey)

  if (daysUntilDue === 3) {
    return 'before_due'
  }

  if (daysUntilDue === 0) {
    return 'due_today'
  }

  const overdueDays = -daysUntilDue

  if (overdueDays === 3) {
    return 'overdue_3_days'
  }

  if (overdueDays >= 10 && (overdueDays - 10) % 7 === 0) {
    return 'overdue_weekly'
  }

  return null
}

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || '').trim()
  )

const isInactiveStudent = (student) => {
  if (!student.studentStatus) return false

  return (
    String(student.studentStatus).trim().toLowerCase() !==
    'active'
  )
}

const getInstallmentBalance = (installment) => {
  const amount = Number(installment?.amount) || 0
  const paidAmount = Number(installment?.paidAmount) || 0

  return Math.max(0, amount - paidAmount)
}

const isExcludedInstallment = (installment) => {
  const status = String(installment?.status || '')
    .trim()
    .toLowerCase()

  return [
    'paid',
    'waived',
    'fullwaiver',
    'full waiver',
  ].includes(status)
}

const makePreviewItem = ({
  student,
  installment,
  reminderStage,
  remainingAmount,
  bulk = false,
}) => ({
  studentName: student.name || 'Student',
  admissionNumber: student.admissionNumber || '',
  email: student.email || '',
  installmentNumber: bulk
    ? 'All outstanding fees'
    : installment?.installmentNumber ??
      installment?.installmentNo ??
      '',
  dueDate: bulk
    ? student.dueDate
      ? getDateKey(new Date(student.dueDate))
      : null
    : installment?.dueDate
      ? getDateKey(new Date(installment.dueDate))
      : null,
  remainingAmount,
  reminderStage,
})

const processBulkReminders = async ({
  students,
  todayKey,
  dryRun,
}) => {
  const summary = {
    mode: 'bulk',
    date: todayKey,
    dryRun,
    studentsChecked: students.length,
    eligibleReminders: 0,
    emailsSent: 0,
    emailsFailed: 0,
    skippedNoEmail: 0,
    skippedNoDueInstallment: 0,
    skippedAlreadyProcessed: 0,
    skippedInactive: 0,
    errors: [],
    preview: [],
  }

  for (const student of students) {
    const remainingFees = Number(student.remainingFees) || 0

    if (remainingFees <= 0 || student.feesStatus !== 'Due') {
      continue
    }

    if (isInactiveStudent(student)) {
      summary.skippedInactive++
      continue
    }

    if (!isValidEmail(student.email)) {
      summary.skippedNoEmail++
      continue
    }

    summary.eligibleReminders++

    summary.preview.push(
      makePreviewItem({
        student,
        reminderStage: 'bulk_due',
        remainingAmount: remainingFees,
        bulk: true,
      })
    )

    if (dryRun) continue

    // Stable key: a successful bulk reminder is sent only once
    // per student. A Failed log can be retried with the same key.
    const reminderKey = `${student._id}:bulk_due:v1`

    try {
      let log = await FeeReminderLog.findOne({ reminderKey })

      if (log && log.status !== 'Failed') {
        summary.skippedAlreadyProcessed++
        continue
      }

      if (!log) {
        try {
          log = await FeeReminderLog.create({
            studentId: student._id,
            installmentId: null,
            admissionNumber: student.admissionNumber || '',
            studentEmail: String(student.email).trim().toLowerCase(),
            reminderStage: 'bulk_due',
            dueDate: student.dueDate || null,
            scheduledDate: todayKey,
            reminderKey,
            status: 'Sending',
            attemptCount: 1,
          })
        } catch (createError) {
          // Another request may have created this unique key.
          if (createError.code === 11000) {
            summary.skippedAlreadyProcessed++
            continue
          }

          throw createError
        }
      } else {
        log.status = 'Sending'
        log.attemptCount = (log.attemptCount || 0) + 1
        log.errorMessage = ''
        await log.save()
      }

      await sendFeeReminderEmail({
        student,
        reminderStage: 'bulk_due',
      })

      log.status = 'Sent'
      log.sentAt = new Date()
      log.errorMessage = ''
      await log.save()

      summary.emailsSent++
    } catch (error) {
      summary.emailsFailed++

      summary.errors.push({
        admissionNumber: student.admissionNumber || '',
        message: error.message || 'Unknown email error',
      })

      try {
        await FeeReminderLog.findOneAndUpdate(
          { reminderKey },
          {
            $set: {
              status: 'Failed',
              errorMessage: String(error.message || 'Unknown error').slice(0, 1000),
            },
          }
        )
      } catch (logError) {
        summary.errors.push({
          admissionNumber: student.admissionNumber || '',
          message: `Could not update reminder log: ${logError.message}`,
        })
      }
    }
  }

  return summary
}

const processScheduledReminders = async ({
  students,
  todayKey,
  dryRun,
}) => {
  const summary = {
    mode: 'scheduled',
    date: todayKey,
    dryRun,
    studentsChecked: students.length,
    eligibleReminders: 0,
    emailsSent: 0,
    emailsFailed: 0,
    skippedNoEmail: 0,
    skippedNoDueInstallment: 0,
    skippedAlreadyProcessed: 0,
    skippedInactive: 0,
    errors: [],
    preview: [],
  }

  for (const student of students) {
    if (isInactiveStudent(student)) {
      summary.skippedInactive++
      continue
    }

    const remainingFees = Number(student.remainingFees) || 0

    if (remainingFees <= 0) continue

    const schedule = Array.isArray(student.installmentSchedule)
      ? student.installmentSchedule
      : []

    let studentHadDueReminder = false

    for (const installment of schedule) {
      if (isExcludedInstallment(installment)) continue

      const remainingAmount = getInstallmentBalance(installment)

      if (remainingAmount <= 0) continue

      if (!installment.dueDate) continue

      const reminderStage = getReminderStage(
        installment.dueDate,
        todayKey
      )

      if (!reminderStage) continue

      studentHadDueReminder = true

      if (!isValidEmail(student.email)) {
        summary.skippedNoEmail++
        continue
      }

      const dueDateKey = getDateKey(new Date(installment.dueDate))

      const installmentId =
        installment._id ||
        installment.id ||
        installment.installmentNumber ||
        installment.installmentNo ||
        dueDateKey

      const reminderKey = [
        student._id,
        String(installmentId),
        dueDateKey,
        reminderStage,
        todayKey,
      ].join(':')

      summary.eligibleReminders++

      summary.preview.push(
        makePreviewItem({
          student,
          installment,
          reminderStage,
          remainingAmount,
        })
      )

      if (dryRun) continue

      let log

      try {
        log = await FeeReminderLog.findOne({ reminderKey })

        if (log && log.status !== 'Failed') {
          summary.skippedAlreadyProcessed++
          continue
        }

        if (!log) {
          try {
            log = await FeeReminderLog.create({
              studentId: student._id,
              installmentId:
                installment._id || null,
              admissionNumber: student.admissionNumber || '',
              studentEmail: String(student.email).trim().toLowerCase(),
              reminderStage,
              dueDate: new Date(installment.dueDate),
              scheduledDate: todayKey,
              reminderKey,
              status: 'Sending',
              attemptCount: 1,
            })
          } catch (createError) {
            if (createError.code === 11000) {
              summary.skippedAlreadyProcessed++
              continue
            }

            throw createError
          }
        } else {
          log.status = 'Sending'
          log.attemptCount = (log.attemptCount || 0) + 1
          log.errorMessage = ''
          await log.save()
        }

        await sendFeeReminderEmail({
          student,
          installment: {
            installmentNumber:
              installment.installmentNumber ??
              installment.installmentNo ??
              '',
            amount: Number(installment.amount) || 0,
            paidAmount: Number(installment.paidAmount) || 0,
            remainingAmount,
            dueDate: installment.dueDate,
          },
          reminderStage,
        })

        log.status = 'Sent'
        log.sentAt = new Date()
        log.errorMessage = ''
        await log.save()

        summary.emailsSent++
      } catch (error) {
        summary.emailsFailed++

        summary.errors.push({
          admissionNumber: student.admissionNumber || '',
          installmentNumber:
            installment.installmentNumber ??
            installment.installmentNo ??
            '',
          message: error.message || 'Unknown email error',
        })

        try {
          await FeeReminderLog.findOneAndUpdate(
            { reminderKey },
            {
              $set: {
                status: 'Failed',
                errorMessage: String(error.message || 'Unknown error').slice(0, 1000),
              },
            }
          )
        } catch (logError) {
          summary.errors.push({
            admissionNumber: student.admissionNumber || '',
            message: `Could not update reminder log: ${logError.message}`,
          })
        }
      }
    }

    if (!studentHadDueReminder && schedule.length === 0) {
      summary.skippedNoDueInstallment++
    }
  }

  return summary
}

const processFeeReminders = async ({
  mode = 'scheduled',
  dryRun = true,
} = {}) => {
  if (!['bulk', 'scheduled'].includes(mode)) {
    throw new Error('Invalid reminder mode. Use bulk or scheduled.')
  }

  const todayKey = getDateKey(new Date())

  // Only read student records. This processor does not change
  // Student documents or payment records.
  const students = await Student.find({
    remainingFees: { $gt: 0 },
  }).lean()

  if (mode === 'bulk') {
    return processBulkReminders({
      students,
      todayKey,
      dryRun,
    })
  }

  return processScheduledReminders({
    students,
    todayKey,
    dryRun,
  })
}

module.exports = processFeeReminders
