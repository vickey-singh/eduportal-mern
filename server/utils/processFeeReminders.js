
const Student = require('../models/Student')
const FeeReminderLog = require('../models/FeeReminderLog')
const sendFeeReminderEmail = require('./sendFeeReminderEmail')

const TIME_ZONE = 'Asia/Kolkata'

const getDateKey = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = {}

  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value
    }
  }

  return `${values.year}-${values.month}-${values.day}`
}

const addDays = (dateKey, days) => {
  const [year, month, day] = dateKey.split('-').map(Number)

  const date = new Date(
    Date.UTC(year, month - 1, day + days)
  )

  return date.toISOString().slice(0, 10)
}

const daysBetween = (fromKey, toKey) => {
  const from = new Date(`${fromKey}T00:00:00.000Z`)
  const to = new Date(`${toKey}T00:00:00.000Z`)

  return Math.round((to - from) / 86400000)
}

const getReminderStage = (dueDateKey, todayKey) => {
  const daysUntilDue = daysBetween(todayKey, dueDateKey)

  if (daysUntilDue === 3) {
    return 'before_due'
  }

  if (daysUntilDue === 0) {
    return 'due_today'
  }

  const daysOverdue = -daysUntilDue

  if (daysOverdue === 3) {
    return 'overdue_3_days'
  }

  if (
    daysOverdue > 3 &&
    (daysOverdue - 3) % 7 === 0
  ) {
    return 'overdue_weekly'
  }

  return null
}

const isValidEmail = (email) => {
  return (
    typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  )
}

const getCourseName = (course) => {
  if (!course) return ''

  if (typeof course === 'object') {
    return course.courseName || course.name || ''
  }

  return String(course)
}

const processFeeReminders = async ({ dryRun = true } = {}) => {
  const todayKey = getDateKey(new Date())

  if (!todayKey) {
    throw new Error('Unable to determine the current date')
  }

  const students = await Student.find({
    remainingFees: { $gt: 0 },
  }).lean()

  const summary = {
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
    if (
      student.studentStatus &&
      student.studentStatus !== 'Active'
    ) {
      summary.skippedInactive++
      continue
    }

    const installments = Array.isArray(student.installmentSchedule)
      ? student.installmentSchedule
      : []

    if (installments.length === 0) {
      summary.skippedNoDueInstallment++
      continue
    }

    for (const installment of installments) {
      if (
        installment.status === 'Paid' ||
        installment.status === 'Waived' ||
        installment.adjustmentType === 'FullWaiver'
      ) {
        continue
      }

      const amount = Number(installment.amount) || 0
      const paidAmount = Number(installment.paidAmount) || 0
      const remainingAmount = Math.max(amount - paidAmount, 0)

      if (remainingAmount <= 0) {
        continue
      }

      if (!installment.dueDate) {
        continue
      }

      const dueDateKey = getDateKey(installment.dueDate)

      if (!dueDateKey) {
        continue
      }

      const reminderStage = getReminderStage(
        dueDateKey,
        todayKey
      )

      if (!reminderStage) {
        continue
      }

      const email = String(student.email || '').trim()

      if (!isValidEmail(email)) {
        summary.skippedNoEmail++
        continue
      }

      const installmentId = installment._id
        ? String(installment._id)
        : `number-${installment.installmentNumber}`

      const reminderKey = [
        String(student._id),
        installmentId,
        dueDateKey,
        reminderStage,
        todayKey,
      ].join(':')

      summary.eligibleReminders++

      const previewItem = {
        studentName: student.name || '',
        admissionNumber: student.admissionNumber || '',
        email,
        installmentNumber: installment.installmentNumber,
        dueDate: dueDateKey,
        remainingAmount,
        reminderStage,
      }

      if (dryRun) {
        summary.preview.push(previewItem)
        continue
      }

      let log

      try {
        log = await FeeReminderLog.findOne({
          reminderKey,
        })

        if (log && log.status !== 'Failed') {
          summary.skippedAlreadyProcessed++
          continue
        }

        if (log) {
          log.status = 'Sending'
          log.attemptCount = (log.attemptCount || 0) + 1
          log.errorMessage = ''
          await log.save()
        } else {
          try {
            log = await FeeReminderLog.create({
              studentId: student._id,
              installmentId: installment._id || null,
              admissionNumber: student.admissionNumber || '',
              studentEmail: email,
              reminderStage,
              dueDate: installment.dueDate,
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
        }

        await sendFeeReminderEmail({
          to: email,
          studentName: student.name,
          admissionNumber: student.admissionNumber,
          course: getCourseName(student.course),
          installmentNumber: installment.installmentNumber,
          dueDate: installment.dueDate,
          installmentAmount: amount,
          paidAmount,
          remainingAmount,
          reminderStage,
        })

        log.status = 'Sent'
        log.sentAt = new Date()
        log.errorMessage = ''
        await log.save()

        summary.emailsSent++
      } catch (error) {
        summary.emailsFailed++

        if (log) {
          try {
            log.status = 'Failed'
            log.errorMessage = String(
              error.message || 'Email delivery failed'
            ).slice(0, 1000)

            await log.save()
          } catch (logError) {
            console.error(
              'Could not update fee reminder log:',
              logError.message
            )
          }
        }

        summary.errors.push({
          admissionNumber: student.admissionNumber || '',
          installmentNumber: installment.installmentNumber,
          message: error.message || 'Unknown error',
        })

        console.error(
          'Fee reminder failed:',
          student.admissionNumber,
          error.message
        )
      }
    }
  }

  return summary
}

module.exports = processFeeReminders
