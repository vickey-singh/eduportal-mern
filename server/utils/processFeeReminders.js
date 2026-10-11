
const Student = require('../models/Student')
const FeeReminderLog = require('../models/FeeReminderLog')
const sendFeeReminderEmail = require('./sendFeeReminderEmail')

const TIME_ZONE = 'Asia/Kolkata'
const DAY_MS = 24 * 60 * 60 * 1000

const EXCLUDED_INSTALLMENT_STATUSES = new Set([
  'paid',
  'waived',
  'fullwaiver',
  'full waiver',
])

const VALID_MODES = new Set(['bulk', 'scheduled'])

// --------------------------------------------------
// DATE HELPERS
// --------------------------------------------------

const getDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-CA', {
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

const dateKeyToUTC = (key) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)

  if (!match) return NaN

  const [, year, month, day] = match

  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day)
  )
}

const daysBetween = (fromKey, toKey) => {
  const from = dateKeyToUTC(fromKey)
  const to = dateKeyToUTC(toKey)

  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return NaN
  }

  return Math.round((to - from) / DAY_MS)
}

// --------------------------------------------------
// REMINDER STAGE
// --------------------------------------------------

const getReminderStage = (dueDate, todayKey) => {
  const dueDateKey = getDateKey(dueDate)

  if (!dueDateKey) return null

  const daysUntilDue = daysBetween(todayKey, dueDateKey)

  if (daysUntilDue === 3) return 'before_due'
  if (daysUntilDue === 0) return 'due_today'

  const overdueDays = -daysUntilDue

  if (overdueDays === 3) return 'overdue_3_days'

  // First weekly reminder at 10 days overdue,
  // then every 7 days: 17, 24, 31, etc.
  if (
    overdueDays >= 10 &&
    (overdueDays - 10) % 7 === 0
  ) {
    return 'overdue_weekly'
  }

  return null
}

// --------------------------------------------------
// STUDENT / INSTALLMENT HELPERS
// --------------------------------------------------

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

  return EXCLUDED_INSTALLMENT_STATUSES.has(status)
}

const getInstallmentNumber = (installment) =>
  installment?.installmentNumber ??
  installment?.installmentNo ??
  ''

const getInstallmentSchedule = (student) =>
  Array.isArray(student.installmentSchedule)
    ? student.installmentSchedule
    : []

// --------------------------------------------------
// CURRENTLY DUE INSTALLMENTS
// Used by manual bulk reminder only.
// Future installments are excluded.
// --------------------------------------------------

const getCurrentlyDueInstallments = (student, todayKey) => {
  return getInstallmentSchedule(student)
    .filter((installment) => {
      if (
        !installment.dueDate ||
        isExcludedInstallment(installment)
      ) {
        return false
      }

      const dueDateKey = getDateKey(installment.dueDate)

      if (!dueDateKey) return false

      return (
        dueDateKey <= todayKey &&
        getInstallmentBalance(installment) > 0
      )
    })
    .map((installment) => ({
      installmentNumber: getInstallmentNumber(installment),
      amount: Number(installment.amount) || 0,
      paidAmount: Number(installment.paidAmount) || 0,
      remainingAmount: getInstallmentBalance(installment),
      dueDate: installment.dueDate,
      status: installment.status || '',
      _id: installment._id || null,
    }))
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() -
        new Date(b.dueDate).getTime()
    )
}

// --------------------------------------------------
// RESPONSE HELPERS
// --------------------------------------------------

const createSummary = (mode, todayKey, dryRun, students) => ({
  mode,
  date: todayKey,
  timeZone: TIME_ZONE,
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
})

const makePreviewItem = ({
  student,
  installment,
  reminderStage,
  remainingAmount,
  bulk = false,
}) => ({
  studentName: student.name || 'Student',
  admissionNumber: student.admissionNumber || '',
  email: String(student.email || '').trim(),
  installmentNumber: bulk
    ? 'Currently due installments'
    : getInstallmentNumber(installment),
  dueDate: installment?.dueDate
    ? getDateKey(installment.dueDate)
    : null,
  remainingAmount,
  ...(bulk
    ? { dueInstallments: installment.dueInstallments }
    : {}),
  reminderStage,
})

// --------------------------------------------------
// DUPLICATE CHECK
// --------------------------------------------------

const isReminderAlreadyProcessed = async (reminderKey) => {
  const log = await FeeReminderLog.findOne({
    reminderKey,
  })
    .select('status')
    .lean()

  // Failed reminders are allowed to retry.
  // Sending and Sent logs are not sent again.
  return Boolean(log && log.status !== 'Failed')
}

// --------------------------------------------------
// SEND ONE REMINDER WITH LOGGING
// --------------------------------------------------

const sendReminder = async ({
  student,
  installment,
  reminderStage,
  reminderKey,
  scheduledDate,
  summary,
}) => {
  let log

  try {
    log = await FeeReminderLog.findOne({ reminderKey })

    if (log && log.status !== 'Failed') {
      summary.skippedAlreadyProcessed++
      return
    }

    if (!log) {
      try {
        log = await FeeReminderLog.create({
          studentId: student._id,
          installmentId: installment._id || null,
          admissionNumber: student.admissionNumber || '',
          studentEmail: String(student.email).trim().toLowerCase(),
          reminderStage,
          dueDate: installment.dueDate || null,
          scheduledDate,
          reminderKey,
          status: 'Sending',
          attemptCount: 1,
        })
      } catch (error) {
        // The unique reminderKey index protects against
        // concurrent requests creating the same reminder.
        if (error.code === 11000) {
          summary.skippedAlreadyProcessed++
          return
        }

        throw error
      }
    } else {
      log.status = 'Sending'
      log.attemptCount = (log.attemptCount || 0) + 1
      log.errorMessage = ''
      await log.save()
    }

    await sendFeeReminderEmail({
      student,
      installment,
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
      installmentNumber: getInstallmentNumber(installment),
      message: error.message || 'Unknown email error',
    })

    try {
      await FeeReminderLog.findOneAndUpdate(
        { reminderKey },
        {
          $set: {
            status: 'Failed',
            errorMessage: String(
              error.message || 'Unknown email error'
            ).slice(0, 1000),
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

// --------------------------------------------------
// BULK REMINDERS
// Manual one-time reminder per student.
// --------------------------------------------------

const processBulkReminders = async ({
  students,
  todayKey,
  dryRun,
}) => {
  const summary = createSummary(
    'bulk',
    todayKey,
    dryRun,
    students
  )

  for (const student of students) {
    if (isInactiveStudent(student)) {
      summary.skippedInactive++
      continue
    }

    const dueInstallments = getCurrentlyDueInstallments(
      student,
      todayKey
    )

    if (dueInstallments.length === 0) {
      summary.skippedNoDueInstallment++
      continue
    }

    const currentDueAmount = dueInstallments.reduce(
      (total, installment) =>
        total + installment.remainingAmount,
      0
    )

    if (currentDueAmount <= 0) {
      summary.skippedNoDueInstallment++
      continue
    }

    if (!isValidEmail(student.email)) {
      summary.skippedNoEmail++
      continue
    }

    const earliestDueInstallment = dueInstallments[0]

    const bulkInstallment = {
      remainingAmount: currentDueAmount,
      dueDate: earliestDueInstallment.dueDate,
      dueInstallments,
    }

    // A bulk reminder is intentionally one successful
    // bulk email per student, not a daily recurring email.
    const reminderKey = `${student._id}:bulk_due:v1`

    try {
      if (await isReminderAlreadyProcessed(reminderKey)) {
        summary.skippedAlreadyProcessed++
        continue
      }
    } catch (error) {
      summary.errors.push({
        admissionNumber: student.admissionNumber || '',
        message: `Could not check reminder log: ${error.message}`,
      })
      continue
    }

    summary.eligibleReminders++

    summary.preview.push(
      makePreviewItem({
        student,
        installment: {
          ...bulkInstallment,
          installmentNumber: 'Currently due installments',
        },
        reminderStage: 'bulk_due',
        remainingAmount: currentDueAmount,
        bulk: true,
      })
    )

    if (dryRun) continue

    await sendReminder({
      student,
      installment: bulkInstallment,
      reminderStage: 'bulk_due',
      reminderKey,
      scheduledDate: todayKey,
      summary,
    })
  }

  return summary
}

// --------------------------------------------------
// AUTOMATIC SCHEDULED REMINDERS
// --------------------------------------------------

const processScheduledReminders = async ({
  students,
  todayKey,
  dryRun,
}) => {
  const summary = createSummary(
    'scheduled',
    todayKey,
    dryRun,
    students
  )

  for (const student of students) {
    if (isInactiveStudent(student)) {
      summary.skippedInactive++
      continue
    }

    if ((Number(student.remainingFees) || 0) <= 0) {
      continue
    }

    const schedule = getInstallmentSchedule(student)

    const eligibleInstallments = []

    for (const installment of schedule) {
      if (
        isExcludedInstallment(installment) ||
        !installment.dueDate
      ) {
        continue
      }

      const remainingAmount = getInstallmentBalance(installment)

      if (remainingAmount <= 0) continue

      const reminderStage = getReminderStage(
        installment.dueDate,
        todayKey
      )

      if (!reminderStage) continue

      eligibleInstallments.push({
        installment,
        reminderStage,
        remainingAmount,
      })
    }

    if (eligibleInstallments.length === 0) {
      summary.skippedNoDueInstallment++
      continue
    }

    // Count missing/invalid email once per student,
    // not once per installment.
    if (!isValidEmail(student.email)) {
      summary.skippedNoEmail++
      continue
    }

    for (const item of eligibleInstallments) {
      const {
        installment,
        reminderStage,
        remainingAmount,
      } = item

      const dueDateKey = getDateKey(installment.dueDate)

      const installmentId =
        installment._id ||
        installment.id ||
        getInstallmentNumber(installment) ||
        dueDateKey

      // Includes the current date so each scheduled
      // stage can be processed only once per day.
      const reminderKey = [
        student._id,
        String(installmentId),
        dueDateKey,
        reminderStage,
        todayKey,
      ].join(':')

      try {
        if (await isReminderAlreadyProcessed(reminderKey)) {
          summary.skippedAlreadyProcessed++
          continue
        }
      } catch (error) {
        summary.errors.push({
          admissionNumber: student.admissionNumber || '',
          installmentNumber: getInstallmentNumber(installment),
          message: `Could not check reminder log: ${error.message}`,
        })
        continue
      }

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

      await sendReminder({
        student,
        installment: {
          _id: installment._id || null,
          installmentNumber: getInstallmentNumber(installment),
          amount: Number(installment.amount) || 0,
          paidAmount: Number(installment.paidAmount) || 0,
          remainingAmount,
          dueDate: installment.dueDate,
        },
        reminderStage,
        reminderKey,
        scheduledDate: todayKey,
        summary,
      })
    }
  }

  return summary
}

// --------------------------------------------------
// MAIN PROCESSOR
// --------------------------------------------------

const processFeeReminders = async ({
  mode = 'scheduled',
  dryRun = true,
  admissionNumber = '',
} = {}) => {
  if (!VALID_MODES.has(mode)) {
    throw new Error(
      'Invalid reminder mode. Use bulk or scheduled.'
    )
  }

  const todayKey = getDateKey(new Date())

  const studentQuery = {
    remainingFees: { $gt: 0 },
  }

  if (admissionNumber) {
    studentQuery.admissionNumber = admissionNumber.trim()
  }

  const students = await Student.find(studentQuery)
    .select(
      'name admissionNumber email remainingFees studentStatus installmentSchedule'
    )
    .lean()

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
