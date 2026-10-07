const express =
  require('express')

const crypto =
  require('crypto')

const router =
  express.Router()

const upload =
  require('../middleware/upload')

const razorpay =
  require('../config/razorpay')

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const StudentAccount = require('../models/StudentAccount')


const Student =
  require('../models/Student')

const Payment =
  require('../models/Payment')

const Receipt =
  require('../models/Receipt')

const createNotification =
  require('../utils/createNotification')

const studentAuth =
  require('../middleware/studentAuth')

const adminAuth =
  require('../middleware/adminAuth')


// ======================================
// FEE ENGINE HELPERS
// ======================================

const ALLOWED_PAYMENT_PLANS = [
  'full',
  'monthly',
  'installment',
]


const toDate = (value) => {

  if (!value) return null

  if (value instanceof Date) {

    const d = new Date(value)

    return Number.isNaN(d.getTime())
      ? null
      : d

  }

  const text =
    String(value).trim()

  let date = null

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {

    const [year, month, day] =
      text.split('-').map(Number)

    date =
      new Date(
        year,
        month - 1,
        day
      )

  }

  else if (/^\d{2}-\d{2}-\d{4}$/.test(text)) {

    const [day, month, year] =
      text.split('-').map(Number)

    date =
      new Date(
        year,
        month - 1,
        day
      )

  }

  else if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {

    const [day, month, year] =
      text.split('/').map(Number)

    date =
      new Date(
        year,
        month - 1,
        day
      )

  }

  else {

    date = new Date(text)

  }

  if (Number.isNaN(date.getTime())) {
    return null
  }

  date.setHours(0, 0, 0, 0)

  return date

}


const addMonths = (
  dateValue,
  months
) => {

  const date =
    toDate(dateValue)

  if (!date) return null

  const day =
    date.getDate()

  date.setDate(1)

  date.setMonth(
    date.getMonth() +
    Number(months)
  )

  const lastDay =
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate()

  date.setDate(
    Math.min(day, lastDay)
  )

  return date

}


const calculateFeesStatus = (
  totalFees,
  paidFees
) => {

  const total =
    Number(totalFees || 0)

  const paid =
    Number(paidFees || 0)

  const remaining =
    Math.max(
      0,
      total - paid
    )

  let status = 'Partial'

  if (remaining <= 0) {
    status = 'Paid'
  }

  return {
    remaining,
    status,
  }

}


// ======================================
// UPDATE EACH INSTALLMENT STATUS
// ======================================

const refreshInstallmentStatuses = (
  student
) => {

  const schedule =
    Array.isArray(
      student.installmentSchedule
    )
      ? student.installmentSchedule
      : []

  const today =
    toDate(new Date())

  schedule.forEach((item) => {

    // Waived is a final concession state, not a payment.
    if (item.status === 'Waived') {
      return
    }

    const amount =
      Number(item.amount || 0)

    const paid =
      Number(item.paidAmount || 0)

    if (
      amount > 0 &&
      paid >= amount
    ) {

      item.paidAmount =
        amount

      item.status =
        'Paid'

      return

    }

    const dueDate =
      toDate(item.dueDate)

    if (
      dueDate &&
      dueDate <= today
    ) {

      item.status =
        'Due'

    }

    else {

      item.status =
        'Pending'

    }

  })

}


// ======================================
// MASTER DUE DATE
// ======================================
//
// Multiple Due installments:
// latest Due date is shown.
//
// No Due installment:
// next Pending date is shown.
//
// Fully paid:
// null.
//
// ======================================

const refreshMasterFeeState = (
  student
) => {

  refreshInstallmentStatuses(
    student
  )

  const schedule =
    Array.isArray(
      student.installmentSchedule
    )
      ? student.installmentSchedule
      : []

  const due =
    schedule.filter(
      item =>
        item.status === 'Due'
    )

  const pending =
    schedule.filter(
      item =>
        item.status === 'Pending'
    )

  if (due.length > 0) {

    due.sort(
      (a, b) =>
        new Date(a.dueDate) -
        new Date(b.dueDate)
    )

    student.dueDate =
      due[due.length - 1].dueDate

    student.feesStatus =
      'Due'

    return

  }

  if (pending.length > 0) {

    pending.sort(
      (a, b) =>
        new Date(a.dueDate) -
        new Date(b.dueDate)
    )

    student.dueDate =
      pending[0].dueDate

    student.feesStatus =
      Number(student.remainingFees || 0) > 0
        ? 'Partial'
        : 'Paid'

    return

  }

  student.dueDate = null

  student.feesStatus =
    Number(student.remainingFees || 0) <= 0
      ? 'Paid'
      : 'Partial'

}


// ======================================
// MONTHLY SCHEDULE
// ======================================

const createMonthlySchedule = ({
  totalFees,
  paidFees,
  monthlyAmount,
  firstDueDate,
}) => {

  const total =
    Number(totalFees || 0)

  const paid =
    Number(paidFees || 0)

  const remaining =
    Math.max(
      0,
      total - paid
    )

  const monthly =
    Number(monthlyAmount || 0)

  const firstDate =
    toDate(firstDueDate)

  if (
    remaining <= 0 ||
    monthly <= 0 ||
    !firstDate
  ) {

    return []

  }

  const schedule = []

  let balance =
    remaining

  let number = 1

  let dueDate =
    firstDate

  while (
    balance > 0 &&
    number <= 120
  ) {

    const amount =
      Math.min(
        monthly,
        balance
      )

    schedule.push({

      installmentNumber:
        number,

      amount,

      originalAmount:
        amount,

      adjustmentAmount:
        0,

      adjustmentType:
        'None',

      adjustmentReason:
        '',

      adjustedBy:
        '',

      adjustedAt:
        null,

      dueDate:
        new Date(dueDate),

      paidAmount:
        0,

      status:
        'Pending',

      paidDate:
        null,

    })

    balance -= amount

    number += 1

    dueDate =
      addMonths(
        dueDate,
        1
      )

  }

  return schedule

}


// ======================================
// FULL PAYMENT SCHEDULE
// ======================================

const createFullSchedule = ({
  totalFees,
  paidFees,
  dueDate,
}) => {

  const total =
    Number(totalFees || 0)

  const paid =
    Number(paidFees || 0)

  const remaining =
    Math.max(
      0,
      total - paid
    )

  if (remaining <= 0) {
    return []
  }

  return [{

    installmentNumber: 1,

    amount:
      remaining,

    originalAmount:
      remaining,

    adjustmentAmount:
      0,

    adjustmentType:
      'None',

    adjustmentReason:
      '',

    adjustedBy:
      '',

    adjustedAt:
      null,

    dueDate:
      toDate(
        dueDate ||
        new Date()
      ),

    paidAmount:
      0,

    status:
      'Pending',

    paidDate:
      null,

  }]

}


// ======================================
// CUSTOM INSTALLMENT SCHEDULE
// ======================================

const normalizeCustomSchedule = (
  schedule
) => {

  if (!Array.isArray(schedule)) {
    return []
  }

  return schedule.map(
    (item, index) => {

      const amount =
        Number(item?.amount || 0)

      const paidAmount =
        Math.max(
          0,
          Number(item?.paidAmount || 0)
        )

      const originalAmount =
        Number(
          item?.originalAmount ||
          amount
        )

      let status =
        item?.status || 'Pending'

      if (amount === 0) {
        status = 'Waived'
      }
      else if (paidAmount >= amount) {
        status = 'Paid'
      }
      else {
        status = 'Pending'
      }

      const adjustmentType =
        ['None', 'PartialWaiver', 'FullWaiver']
          .includes(item?.adjustmentType)
          ? item.adjustmentType
          : (
              amount === 0
                ? 'FullWaiver'
                : (
                    originalAmount > amount
                      ? 'PartialWaiver'
                      : 'None'
                  )
            )

      return {

        installmentNumber:
          Number(
            item?.installmentNumber ||
            index + 1
          ),

        amount,

        originalAmount:
          originalAmount > 0
            ? originalAmount
            : amount,

        adjustmentAmount:
          Math.max(
            0,
            Number(
              item?.adjustmentAmount || 0
            )
          ),

        adjustmentType,

        adjustmentReason:
          String(
            item?.adjustmentReason || ''
          ).trim(),

        adjustedBy:
          String(
            item?.adjustedBy || ''
          ).trim(),

        adjustedAt:
          item?.adjustedAt
            ? toDate(item.adjustedAt)
            : null,

        dueDate:
          toDate(item?.dueDate),

        paidAmount,

        status,

        paidDate:
          item?.paidDate
            ? toDate(item.paidDate)
            : null,

      }

    }
  )

}


// ======================================
// CUSTOM SCHEDULE VALIDATION
// ======================================

const validateCustomSchedule = (
  schedule,
  totalFees,
  paidFees
) => {

  if (
    !Array.isArray(schedule) ||
    schedule.length === 0
  ) {
    return {
      valid: false,
      message:
        'Installment schedule is required.',
    }
  }

  const total =
    Number(totalFees || 0)

  const paid =
    Number(paidFees || 0)

  const remaining =
    Math.max(
      0,
      total - paid
    )

  const hasPaidAmount =
    schedule.some(
      item =>
        Number(item?.paidAmount || 0) > 0
    )

  let payableTotal = 0
  let paidTotal = 0

  for (const item of schedule) {

    const amount =
      Number(item?.amount || 0)

    const itemPaid =
      Number(item?.paidAmount || 0)

    const originalAmount =
      Number(
        item?.originalAmount ||
        amount
      )

    const isWaived =
      item?.status === 'Waived' ||
      (
        amount === 0 &&
        item?.adjustmentType === 'FullWaiver'
      )

    if (
      amount < 0 ||
      (amount === 0 && !isWaived)
    ) {
      return {
        valid: false,
        message:
          'Installment amount must be greater than zero unless the installment is waived.',
      }
    }

    if (!toDate(item?.dueDate)) {
      return {
        valid: false,
        message:
          'Every installment must have a valid due date.',
      }
    }

    if (itemPaid < 0) {
      return {
        valid: false,
        message:
          'Paid installment amount cannot be negative.',
      }
    }

    if (itemPaid > amount + 0.01) {
      return {
        valid: false,
        message:
          `Paid amount ₹${itemPaid} cannot be greater than installment amount ₹${amount}.`,
      }
    }

    if (
      originalAmount < amount - 0.01
    ) {
      return {
        valid: false,
        message:
          'Original installment amount cannot be less than the current payable amount.',
      }
    }

    if (isWaived) {
      if (itemPaid > 0) {
        return {
          valid: false,
          message:
            'A waived installment cannot contain a paid amount.',
        }
      }
      continue
    }

    payableTotal += amount
    paidTotal += itemPaid
  }

  if (hasPaidAmount) {

    if (
      Math.abs(
        paidTotal - paid
      ) > 0.01
    ) {
      return {
        valid: false,
        message:
          `Installment paid total ₹${paidTotal} must equal paid fee ₹${paid}.`,
      }
    }

    if (
      payableTotal - paidTotal >
      remaining + 0.01
    ) {
      return {
        valid: false,
        message:
          `Installment remaining ₹${payableTotal - paidTotal} cannot be greater than remaining fee ₹${remaining}.`,
      }
    }

  }
  else {

    const hasWaiver =
      schedule.some(
        item =>
          item?.status === 'Waived' ||
          item?.adjustmentType === 'PartialWaiver' ||
          item?.adjustmentType === 'FullWaiver' ||
          Number(item?.originalAmount || 0) >
            Number(item?.amount || 0)
      )

    if (
      payableTotal >
      remaining + 0.01
    ) {
      return {
        valid: false,
        message:
          `Installment payable total ₹${payableTotal} cannot be greater than remaining fee ₹${remaining}.`,
      }
    }

    if (
      !hasWaiver &&
      Math.abs(
        payableTotal - remaining
      ) > 0.01
    ) {
      return {
        valid: false,
        message:
          `Installment total ₹${payableTotal} must equal remaining fee ₹${remaining}.`,
      }
    }
  }

  return {
    valid: true,
  }
}


// ======================================
// PRESERVE EXISTING MONTHLY ADJUSTMENTS
// ======================================
//
// Editing a student must not silently erase a previously
// approved month-specific fee adjustment/waiver.
//

const preserveExistingInstallmentAdjustments = (
  oldSchedule,
  newSchedule
) => {

  if (
    !Array.isArray(oldSchedule) ||
    !Array.isArray(newSchedule)
  ) {
    return newSchedule
  }

  const oldMap =
    new Map(
      oldSchedule.map(
        (item, index) => [
          Number(
            item?.installmentNumber ||
            index + 1
          ),
          item,
        ]
      )
    )

  return newSchedule.map(
    (item, index) => {

      const number =
        Number(
          item?.installmentNumber ||
          index + 1
        )

      const oldItem =
        oldMap.get(number)

      if (!oldItem) {
        return item
      }

      const oldOriginal =
        Number(
          oldItem?.originalAmount ||
          oldItem?.amount ||
          0
        )

      const oldAmount =
        Number(
          oldItem?.amount || 0
        )

      const wasAdjusted =
        oldItem?.status === 'Waived' ||
        oldItem?.adjustmentType === 'PartialWaiver' ||
        oldItem?.adjustmentType === 'FullWaiver' ||
        oldOriginal > oldAmount

      if (!wasAdjusted) {
        return item
      }

      const newOriginal =
        Number(
          item?.originalAmount ||
          item?.amount ||
          0
        )

      // If the normal fee itself changed, do not copy the old
      // temporary adjustment onto the new fee.
      if (
        Math.abs(
          newOriginal - oldOriginal
        ) > 0.01
      ) {
        return item
      }

      const next = {
        ...item,

        amount:
          oldAmount,

        originalAmount:
          oldOriginal,

        adjustmentAmount:
          Number(
            oldItem?.adjustmentAmount || 0
          ),

        adjustmentType:
          oldItem?.adjustmentType || 'None',

        adjustmentReason:
          String(
            oldItem?.adjustmentReason || ''
          ),

        adjustedBy:
          String(
            oldItem?.adjustedBy || ''
          ),

        adjustedAt:
          oldItem?.adjustedAt
            ? toDate(oldItem.adjustedAt)
            : null,

        paidAmount:
          Number(
            oldItem?.paidAmount || 0
          ),

        paidDate:
          oldItem?.paidDate
            ? toDate(oldItem.paidDate)
            : null,
      }

      if (
        oldItem?.status === 'Waived' ||
        oldAmount === 0
      ) {
        next.amount = 0
        next.paidAmount = 0
        next.status = 'Waived'
        next.paidDate = null
      }
      else if (
        next.paidAmount >= next.amount
      ) {
        next.paidAmount = next.amount
        next.status = 'Paid'
      }
      else {
        next.status = 'Pending'
      }

      return next
    }
  )
}

// ======================================
// BUILD PLAN SCHEDULE
// ======================================

const buildScheduleForPlan = ({
  paymentPlan,
  totalFees,
  paidFees,
  admissionDate,
  dueDate,
  monthlyAmount,
  installments,
}) => {

  if (
    !ALLOWED_PAYMENT_PLANS.includes(
      paymentPlan
    )
  ) {

    return {
      schedule: [],
      error:
        'Payment plan must be full, monthly or installment.',
    }

  }

  if (
    paymentPlan === 'full'
  ) {

    return {

      schedule:
        createFullSchedule({

          totalFees,
          paidFees,
          dueDate:
            dueDate ||
            admissionDate,

        }),

    }

  }

  if (
    paymentPlan === 'monthly'
  ) {

    if (
      !monthlyAmount ||
      Number(monthlyAmount) <= 0
    ) {

      return {

        schedule: [],

        error:
          'Monthly installment amount is required.',

      }

    }

    const firstDue =
      toDate(dueDate) ||
      addMonths(
        admissionDate,
        1
      )

    return {

      schedule:
        createMonthlySchedule({

          totalFees,

          paidFees,

          monthlyAmount,

          firstDueDate:
            firstDue,

        }),

    }

  }

  const normalized =
    normalizeCustomSchedule(
      installments
    )

  const validation =
    validateCustomSchedule(

      normalized,

      totalFees,

      paidFees

    )

  if (!validation.valid) {

    return {

      schedule: [],

      error:
        validation.message,

    }

  }

  return {

    schedule:
      normalized,

  }

}


// ======================================
// APPLY PAYMENT TO OLDEST UNPAID
// ======================================

const allocatePayment = (
  student,
  paymentAmount,
  paymentDate
) => {

  let remainingPayment =
    Number(paymentAmount || 0)

  const paidInstallments = []

  const schedule =
    Array.isArray(
      student.installmentSchedule
    )
      ? student.installmentSchedule
      : []

  refreshInstallmentStatuses(
    student
  )

  const targets =
    schedule
      .filter(
        item =>
          item.status !== 'Paid' &&
          item.status !== 'Waived'
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate) -
          new Date(b.dueDate)
      )

  for (
    const item of targets
  ) {

    if (
      remainingPayment <= 0
    ) {

      break

    }

    const amount =
      Number(item.amount || 0)

    const alreadyPaid =
      Number(item.paidAmount || 0)

    const remaining =
      Math.max(
        0,
        amount - alreadyPaid
      )

    if (
      remaining <= 0
    ) {

      continue

    }

    const allocation =
      Math.min(
        remainingPayment,
        remaining
      )

    item.paidAmount =
      alreadyPaid +
      allocation

    remainingPayment -=
      allocation

    if (
      item.paidAmount >=
      item.amount
    ) {

      item.paidAmount =
        item.amount

      item.status =
        'Paid'

      item.paidDate =
        toDate(paymentDate)

      paidInstallments.push(
        item.installmentNumber
      )

    }

  }

  return {

    allocatedAmount:
      Number(paymentAmount || 0) -
      remainingPayment,

    unallocatedAmount:
      remainingPayment,

    paidInstallments,

  }

}


// ======================================
// ACADEMIC SESSION
// ======================================

const calculateAcademicSession =
  (admissionDate) => {

    if (!admissionDate) {
      return ''
    }

    const date =
      toDate(admissionDate)

    if (!date) {
      return ''
    }

    const year =
      date.getFullYear()

    const month =
      date.getMonth() + 1

    if (month >= 4) {

      return `${year}-${year + 1}`

    }

    return `${year - 1}-${year}`

  }


const getCurrentAcademicSession =
  () => {

    return calculateAcademicSession(
      new Date()
    )

  }


// ======================================
// ADMISSION NUMBER
// ======================================

const generateAdmissionNumber =
  async () => {

    const students =
      await Student.find({

        admissionNumber: {

          $regex:
            /^PIE\d+$/i,

        },

      })
        .select(
          'admissionNumber'
        )
        .lean()

    let highestNumber = 0

    for (
      const student of students
    ) {

      const currentNumber =
        parseInt(

          String(
            student.admissionNumber || ''
          )
            .replace(
              /^PIE/i,
              ''
            ),

          10

        ) || 0

      if (
        currentNumber >
        highestNumber
      ) {

        highestNumber =
          currentNumber

      }

    }

    return (
      `PIE${String(
        highestNumber + 1
      ).padStart(4, '0')}`
    )

  }


// ======================================
// ADD STUDENT
// ======================================

router.post(
  '/students',
  upload.single('image'),
  async (req, res) => {

    try {

      const {

        name,
        dob,
        aadharNumber,
        rollNumber,
        biometricUserId,
        course,
        batchTime,
        contact,
        email,
        admissionDate,
        fatherName,
        motherName,
        fatherOccupation,
        motherOccupation,
        fatherMobile,
        motherMobile,
        permanentAddress,
        currentAddress,
        schoolCollegeName,
        admissionType,
        registrationFee,
        registrationFeePaid,
        totalFees,
        paidFees,
        paymentPlan,
        monthlyAmount,
        dueDate,
        installments,
        studentStatus,

      } = req.body

      if (
        !name ||
        !String(name).trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student name is required.',

        })

      }

      // ======================================
      // OPTIONAL FIELDS
      // ======================================
      //
      // Student can now be added with ONLY
      // the name. Missing contact and admission
      // date are safely filled with defaults.
      //
      // Admission date defaults to today so the
      // student still receives the correct
      // academic session and admission number.
      // ======================================

      const cleanContact =
        String(contact || '').trim()

      const effectiveAdmissionDate =
        admissionDate ||
        new Date()

      const admissionNumber =
        await generateAdmissionNumber()

      const session =
        calculateAcademicSession(
          effectiveAdmissionDate
        )

      if (!session) {

        return res.status(400).json({

          success: false,

          message:
            'Unable to determine academic session.',

        })

      }

      // ======================================
      // BIOMETRIC USER ID DUPLICATE CHECK
      // ======================================

      const cleanBiometricUserId =
        String(biometricUserId || '').trim()

      if (cleanBiometricUserId) {

        const existingBiometricStudent =
          await Student.findOne({
            biometricUserId:
              cleanBiometricUserId,
          })

        if (existingBiometricStudent) {

          return res.status(400).json({

            success: false,

            message:
              `Biometric User ID ${cleanBiometricUserId} is already assigned to another student.`,

          })

        }

      }

      const totalFee =
        Number(totalFees || 0)

      const paidFee =
        Number(paidFees || 0)

      const registration =
        Number(registrationFee || 0)

      const registrationPaid =
        Number(
          registrationFeePaid || 0
        )

      if (
        totalFee < 0 ||
        paidFee < 0 ||
        registration < 0 ||
        registrationPaid < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Fee values cannot be negative.',

        })

      }

      if (
        paidFee > totalFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be greater than total fee.',

        })

      }

      if (
        registrationPaid >
        registration
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration paid cannot be greater than registration fee.',

        })

      }

      const finalPlan =
        String(
          paymentPlan || ''
        )
          .trim()
          .toLowerCase()

      let schedule = []

      if (finalPlan) {

        const result =
          buildScheduleForPlan({

            paymentPlan:
              finalPlan,

            totalFees:
              totalFee,

            paidFees:
              paidFee,

            admissionDate:
              admissionDate,

            dueDate:
              dueDate,

            monthlyAmount:
              monthlyAmount,

            installments:
              typeof installments === 'string'
                ? JSON.parse(installments || '[]')
                : installments,

          })

        if (result.error) {

          return res.status(400).json({

            success: false,

            message:
              result.error,

          })

        }

        schedule =
          result.schedule

      }

      const feeState =
        calculateFeesStatus(
          totalFee,
          paidFee
        )

      const registrationStatus =
        registration > 0 &&
        registrationPaid >= registration
          ? 'Paid'
          : 'Pending'

      const newStudent =
        new Student({

          name:
            String(name).trim(),

          dob:
            dob || '',

          aadharNumber:
            aadharNumber || '',

          admissionNumber,

          rollNumber:
            rollNumber || '',

          biometricUserId:
            cleanBiometricUserId || undefined,

          course:
            course || '',

          batchTime:
            batchTime || '',

          contact:
            cleanContact,

          email:
            email
              ? String(email)
                  .trim()
                  .toLowerCase()
              : '',

          admissionDate:
            effectiveAdmissionDate,

          session,

          studentStatus:
            studentStatus || 'Active',

          image:
            req.file
              ? req.file.path
              : '',

          fatherName:
            fatherName || '',

          motherName:
            motherName || '',

          fatherOccupation:
            fatherOccupation || '',

          motherOccupation:
            motherOccupation || '',

          fatherMobile:
            fatherMobile || '',

          motherMobile:
            motherMobile || '',

          permanentAddress:
            permanentAddress || '',

          currentAddress:
            currentAddress || '',

          schoolCollegeName:
            schoolCollegeName || '',

          admissionType:
            admissionType || 'Offline',

          registrationFee:
            registration,

          registrationFeePaid:
            registrationPaid,

          registrationFeeStatus:
            registrationStatus,

          totalFees:
            totalFee,

          paidFees:
            paidFee,

          remainingFees:
            feeState.remaining,

          feesStatus:
            feeState.status,

          paymentPlan:
            finalPlan,

          installmentCount:
            schedule.length,

          installmentSchedule:
            schedule,

          paymentMode:
            'Offline',

          paymentHistory:
            [],

        })

      if (
        schedule.length > 0
      ) {

        refreshMasterFeeState(
          newStudent
        )

      }

      if (
        paidFee > 0
      ) {

        newStudent.paymentHistory.push({

          amount:
            paidFee,

          paymentCategory:
            'CourseFee',

          paymentMethod:
            'Cash',

          paymentType:
            finalPlan === 'full'
              ? 'Full'
              : 'Installment',

          paymentPlan:
            finalPlan,

          paymentMode:
            'Offline',

          paymentStatus:
            'Success',

          transactionId:
            '',

          orderId:
            '',

          paymentDate:
            toDate(effectiveAdmissionDate),

        })

      }

      if (
        registrationPaid > 0
      ) {

        newStudent.paymentHistory.push({

          amount:
            registrationPaid,

          paymentCategory:
            'Registration',

          paymentMethod:
            'Cash',

          paymentType:
            'Full',

          paymentPlan:
            '',

          paymentMode:
            'Offline',

          paymentStatus:
            'Success',

          transactionId:
            '',

          orderId:
            '',

          paymentDate:
            toDate(effectiveAdmissionDate),

        })

      }

      const savedStudent =
        await newStudent.save()


      // ======================================
      // REGISTRATION PAYMENT
      // SAVE INTO PAYMENT COLLECTION
      // ======================================
      //
      // Student.paymentHistory already contains
      // the registration payment.
      //
      // This second record is required for:
      // Admin -> Payments
      // Admin -> Revenue
      //
      // ======================================

      let registrationPayment = null

      if (
        registrationPaid > 0
      ) {

        registrationPayment =
          await Payment.create({

            studentName:
              savedStudent.name,

            admissionNumber:
              savedStudent.admissionNumber,

            email:
              savedStudent.email || '',

            phone:
              savedStudent.contact || '',

            course:
              savedStudent.course,

            totalFee:
              savedStudent.totalFees || 0,

            registrationFee:
              savedStudent.registrationFee || 0,

            paymentCategory:
              'Registration',

            paymentPlan:
              '',

            paymentType:
              'Full',

            amountPaid:
              registrationPaid,

            paymentMethod:
              'Cash',

            paymentMode:
              'Offline',

            paymentStatus:
              'Success',

            transactionId:
              '',

            razorpayOrderId:
              '',

            razorpayPaymentId:
              '',

            razorpaySignature:
              '',

          })

      }


      let coursePayment = null

      if (
        paidFee > 0
      ) {

        coursePayment =
          await Payment.create({

            studentName:
              savedStudent.name,

            admissionNumber:
              savedStudent.admissionNumber,

            email:
              savedStudent.email,

            phone:
              savedStudent.contact,

            course:
              savedStudent.course,

            totalFee:
              savedStudent.totalFees,

            registrationFee:
              savedStudent.registrationFee,

            paymentCategory:
              'CourseFee',

            paymentPlan:
              savedStudent.paymentPlan,

            paymentType:
              savedStudent.paymentPlan === 'full'
                ? 'Full'
                : 'Installment',

            amountPaid:
              paidFee,

            paymentMethod:
              'Cash',

            paymentMode:
              'Offline',

            paymentStatus:
              'Success',

            transactionId:
              '',

            razorpayOrderId:
              '',

            razorpayPaymentId:
              '',

            razorpaySignature:
              '',

          })

      }

      try {

        await createNotification({

          type:
            'Admission',

          title:
            'New Admission',

          message:
            `${savedStudent.name} has taken admission` +
            (
              savedStudent.course
                ? ` in ${savedStudent.course}`
                : ''
            ),

          link:
            '/admin/students',

          relatedId:
            savedStudent._id.toString(),

        })

      }

      catch (notificationError) {

        console.log(
          'Admission Notification Error:',
          notificationError
        )

      }

      return res.status(201).json({

        success: true,

        message:
          'Student Added Successfully',

        student:
          savedStudent,

        coursePayment,

      })

    }

    catch (error) {

      console.log(
        'Add Student Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }
)


// ======================================
// GET ALL STUDENTS
// ======================================

// ======================================
// HELPER
// CONVERT DOB TO DDMMYYYY
// ======================================

const normalizeDOB =
  (dob) => {

    if (!dob) {
      return ''
    }

    const date =
      dob instanceof Date
        ? new Date(dob)
        : new Date(String(dob))

    if (Number.isNaN(date.getTime())) {
      return String(dob)
        .replace(/[^0-9]/g, '')
    }

    const day =
      String(date.getDate()).padStart(2, '0')

    const month =
      String(date.getMonth() + 1).padStart(2, '0')

    const year =
      date.getFullYear()

    return `${day}${month}${year}`
  }


// ======================================
// STUDENT PORTAL LOGIN
// ======================================
//
// Student ID = Admission Number
// Password   = DOB in DDMMYYYY
//
// Example:
// Admission Number: PIE0001
// DOB: 16/01/2001
// Password: 16012001
//
// ======================================

router.post(

  '/student/login',

  async (req, res) => {

    try {

      const studentId =
        String(
          req.body?.studentId || ''
        ).trim()

      const password =
        String(
          req.body?.password || ''
        ).trim()


      // ==================================
      // VALIDATION
      // ==================================

      if (!studentId || !password) {

        return res.status(400).json({

          success: false,

          message:
            'Student ID and password are required.',

        })

      }


      // ==================================
      // FIND STUDENT
      // Case-insensitive + trimmed
      // ==================================

      const student =
        await Student.findOne({

          admissionNumber: {

            $regex:
              `^${studentId.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}$`,

            $options: 'i',

          },

        })


      console.log(
        '======================================'
      )

      console.log(
        'STUDENT LOGIN DEBUG'
      )

      console.log(
        'Student ID:',
        studentId
      )

      console.log(
        'Student Found:',
        !!student
      )

      console.log(
        'Admission Number:',
        student?.admissionNumber || 'NOT FOUND'
      )

      console.log(
        'DOB:',
        student?.dob || 'NOT FOUND'
      )


      if (!student) {

        return res.status(401).json({

          success: false,

          message:
            'Invalid Student ID or password.',

        })

      }


      // ==================================
      // DEFAULT DOB PASSWORD
      // ==================================

      const defaultPassword =
        normalizeDOB(
          student.dob
        )


      console.log(
        'Expected DOB Password:',
        defaultPassword
      )


      if (!defaultPassword) {

        return res.status(400).json({

          success: false,

          message:
            'Student DOB is not available. Please contact Admin.',

        })

      }


      // ==================================
      // FIND STUDENT ACCOUNT
      // ==================================

      let account =
        await StudentAccount.findOne({

          studentId:
            student._id,

        })


      console.log(
        'StudentAccount Found:',
        !!account
      )


      // ==================================
      // CREATE ACCOUNT IF MISSING
      // ==================================

      if (!account) {

        const passwordHash =
          await bcrypt.hash(

            defaultPassword,

            10

          )


        account =
          await StudentAccount.create({

            studentId:
              student._id,

            admissionNumber:
              student.admissionNumber,

            passwordHash,

            isStudent:
              true,

            accountStatus:
              'Active',

          })


        console.log(
          'StudentAccount Created:',
          account._id
        )

      }


      // ==================================
      // ACCOUNT STATUS
      // ==================================

      if (
        account.isStudent !== true ||
        account.accountStatus !== 'Active'
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Student account is inactive. Please contact Admin.',

        })

      }


      // ==================================
      // PASSWORD CHECK
      // ==================================

      let isMatch =
        await bcrypt.compare(

          password,

          account.passwordHash

        )


      // ==================================
      // FIRST-LOGIN FALLBACK
      // ==================================
      //
      // If an old account exists but its hash does
      // not match, allow the DOB password to reset
      // the initial account password.
      //
      // This keeps old/stale StudentAccount records
      // from blocking a newly created student.
      //
      // ==================================

      if (
        !isMatch &&
        password === defaultPassword
      ) {

        account.passwordHash =
          await bcrypt.hash(

            defaultPassword,

            10

          )

        account.isStudent = true

        account.accountStatus =
          'Active'

        await account.save()

        isMatch = true

      }


      if (!isMatch) {

        console.log(
          'Student Login: Password mismatch'
        )

        return res.status(401).json({

          success: false,

          message:
            'Invalid Student ID or password.',

        })

      }


      // ==================================
      // JWT SECRET
      // ==================================

      const secret =
        process.env.JWT_SECRET ||
        'Prerna Institute Of Excellence_secret_key'


      // ==================================
      // GENERATE JWT
      // ==================================

      const token =
        jwt.sign(

          {

            id:
              student._id,

            studentId:
              student._id,

            accountId:
              account._id,

            role:
              'student',

            admissionNumber:
              student.admissionNumber,

          },

          secret,

          {

            expiresIn:
              '7d',

          }

        )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Login Successful',

        token,

        student: {

          ...student.toObject(),

        },

      })

    }

    catch (error) {

      console.log(
        'Student Portal Login Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


router.get(
  '/students',
  async (req, res) => {

    try {

      const {
        session,
        search,
        course,
        batchTime,
        feesStatus,
        studentStatus,
      } = req.query

      const query = {}

      if (
        session &&
        session !== 'All'
      ) {

        query.session =
          session

      }

      if (
        search &&
        search.trim()
      ) {

        const value =
          search.trim()

        query.$or = [

          {
            name: {
              $regex:
                value,
              $options:
                'i',
            },
          },

          {
            admissionNumber: {
              $regex:
                value,
              $options:
                'i',
            },
          },

          {
            rollNumber: {
              $regex:
                value,
              $options:
                'i',
            },
          },

        ]

      }

      if (
        course &&
        course !== 'All'
      ) {

        query.course =
          course

      }

      if (
        batchTime &&
        batchTime !== 'All'
      ) {

        query.batchTime =
          batchTime

      }

      if (
        feesStatus &&
        feesStatus !== 'All'
      ) {

        query.feesStatus =
          feesStatus

      }

      if (
        studentStatus &&
        studentStatus !== 'All'
      ) {

        query.studentStatus =
          studentStatus

      }

      // ======================================
      // FAST STUDENT LIST
      // ======================================
      // IMPORTANT:
      // Do NOT save every student while loading
      // the Admin Student page.
      //
      // Previously this route was doing:
      //   Student.find()
      //   -> refresh each student
      //   -> await student.save()
      //   -> next student
      //
      // That caused N database writes on every
      // Student page load and made the page slow.
      //
      // Now we use lean() and only prepare the
      // response in memory.
      // ======================================

      const students =
        await Student.find(query)
          .sort({
            admissionDate: -1,
            createdAt: -1,
          })
          .lean()

      const result =
        students.map(
          (student) => {

            refreshMasterFeeState(
              student
            )

            if (
              !student.session &&
              student.admissionDate
            ) {

              student.session =
                calculateAcademicSession(
                  student.admissionDate
                )

            }

            return student

          }
        )

      return res.status(200).json(
        result
      )

    }

    catch (error) {

      console.log(
        'Get Students Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


// ======================================
// UPDATE STUDENT
// ======================================

router.put(
  '/students/:id',
  upload.single('image'),
  async (req, res) => {

    try {

      const {
        name,
        dob,
        aadharNumber,
        rollNumber,
        biometricUserId,
        course,
        batchTime,
        contact,
        email,
        admissionDate,
        fatherName,
        motherName,
        fatherOccupation,
        motherOccupation,
        fatherMobile,
        motherMobile,
        permanentAddress,
        currentAddress,
        schoolCollegeName,
        admissionType,
        registrationFee,
        registrationFeePaid,
        totalFees,
        paidFees,
        paymentPlan,
        monthlyAmount,
        dueDate,
        installments,
        studentStatus,
      } = req.body

      const student =
        await Student.findById(
          req.params.id
        )

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }

      // ======================================
      // BIOMETRIC USER ID DUPLICATE CHECK
      // ======================================
      
      const cleanBiometricUserId =
        String(biometricUserId || '').trim()
      
      if (cleanBiometricUserId) {
      
        const existingBiometricStudent =
          await Student.findOne({
            biometricUserId:
              cleanBiometricUserId,
      
            _id: {
              $ne: student._id,
            },
      
          })
      
        if (existingBiometricStudent) {
      
          return res.status(400).json({
      
            success: false,
      
            message:
              `Biometric User ID ${cleanBiometricUserId} is already assigned to another student.`,
      
          })
      
        }
      
      }

      const totalFee =
        Number(totalFees || 0)

      const paidFee =
        Number(paidFees || 0)

      const registration =
        Number(registrationFee || 0)

      const registrationPaid =
        Number(
          registrationFeePaid || 0
        )

      if (
        paidFee > totalFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be greater than total fee.',

        })

      }

      if (
        registrationPaid >
        registration
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration paid cannot be greater than registration fee.',

        })

      }

      const finalPlan =
        String(
          paymentPlan ||
          student.paymentPlan ||
          ''
        )
          .trim()
          .toLowerCase()

      let newSchedule = []

      if (finalPlan) {

        const parsedInstallments =
          typeof installments === 'string'
            ? JSON.parse(
                installments || '[]'
              )
            : installments

        // Existing monthly students created by older
        // versions may not have monthlyAmount stored
        // separately. Recover it from the first
        // existing installment before rebuilding.
        let effectiveMonthlyAmount =
          Number(monthlyAmount || 0)

        if (
          finalPlan === 'monthly' &&
          effectiveMonthlyAmount <= 0 &&
          Array.isArray(
            student.installmentSchedule
          )
        ) {

          const firstExistingInstallment =
            student.installmentSchedule.find(
              (item) =>
                Number(item?.amount || 0) > 0
            )

          effectiveMonthlyAmount =
            Number(
              firstExistingInstallment?.amount || 0
            )

        }

        const result =
          buildScheduleForPlan({

            paymentPlan:
              finalPlan,

            totalFees:
              totalFee,

            paidFees:
              paidFee,

            admissionDate:
              admissionDate ||
              student.admissionDate ||
              new Date(),

            dueDate:
              dueDate,

            monthlyAmount:
              effectiveMonthlyAmount,

            installments:
              parsedInstallments,

          })

        if (result.error) {

          return res.status(400).json({

            success: false,

            message:
              result.error,

          })

        }

        newSchedule =
          result.schedule

        if (
          finalPlan === 'monthly'
        ) {
          newSchedule =
            preserveExistingInstallmentAdjustments(
              student.installmentSchedule,
              newSchedule
            )
        }

      }

      student.name =
        name || ''

      student.dob =
        dob || ''

      student.aadharNumber =
        aadharNumber || ''

      student.rollNumber =
        rollNumber || ''

      student.biometricUserId =
        cleanBiometricUserId || undefined

      student.course =
        course || ''

      student.batchTime =
        batchTime || ''

      student.contact =
        contact || ''

      student.email =
        email
          ? String(email)
              .trim()
              .toLowerCase()
          : ''

      student.admissionDate =
        admissionDate ||
        student.admissionDate

      student.session =
        calculateAcademicSession(
          student.admissionDate
        )

      student.studentStatus =
        studentStatus ||
        student.studentStatus ||
        'Active'

      if (req.file) {

        student.image =
          req.file.path

      }

      student.fatherName =
        fatherName || ''

      student.motherName =
        motherName || ''

      student.fatherOccupation =
        fatherOccupation || ''

      student.motherOccupation =
        motherOccupation || ''

      student.fatherMobile =
        fatherMobile || ''

      student.motherMobile =
        motherMobile || ''

      student.permanentAddress =
        permanentAddress || ''

      student.currentAddress =
        currentAddress || ''

      student.schoolCollegeName =
        schoolCollegeName || ''

      student.admissionType =
        admissionType || 'Offline'

      student.registrationFee =
        registration

      student.registrationFeePaid =
        registrationPaid

      student.registrationFeeStatus =
        registration > 0 &&
        registrationPaid >= registration
          ? 'Paid'
          : 'Pending'

      student.totalFees =
        totalFee

      student.paidFees =
        paidFee

      student.remainingFees =
        Math.max(
          0,
          totalFee - paidFee
        )

      student.paymentPlan =
        finalPlan

      student.installmentSchedule =
        newSchedule

      student.installmentCount =
        newSchedule.length

      // Important:
      // Editing the student completely rebuilds
      // the current fee schedule from the admin's
      // selected plan.
      refreshMasterFeeState(
        student
      )

      if (
        student.remainingFees <= 0
      ) {

        student.feesStatus =
          'Paid'

        student.dueDate =
          null

      }

      const updatedStudent =
        await student.save()

      return res.status(200).json({

        success: true,

        message:
          'Student Updated Successfully',

        student:
          updatedStudent,

      })

    }

    catch (error) {

      console.log(
        'Update Student Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }
)


// ======================================
// DELETE STUDENT
// ======================================

router.delete(
  '/students/:id',
  async (req, res) => {

    try {

      const student =
        await Student.findById(
          req.params.id
        )

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }

      const receiptResult =
        await Receipt.deleteMany({

          studentId:
            student._id,

        })

      const paymentResult =
        await Payment.deleteMany({

          admissionNumber:
            student.admissionNumber,

        })

      await Student.findByIdAndDelete(
        student._id
      )

      return res.status(200).json({

        success: true,

        message:
          'Student Deleted Successfully',

        deletedReceipts:
          receiptResult.deletedCount,

        deletedPayments:
          paymentResult.deletedCount,

      })

    }

    catch (error) {

      console.log(
        'Delete Student Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)

// ======================================
// ADMIN ADJUST MONTHLY FEE
// ======================================
//
// PUT
// /students/:id/installment/:installmentId/adjust
//
// ONLY ADMIN
//
// Example:
//
// Original Monthly Fee = ₹1000
//
// Half Month Absent:
// Adjusted Fee = ₹500
//
// Full Month Absent:
// Adjusted Fee = ₹0
//
// ======================================

router.put(
  '/students/:id/installment/:installmentId/adjust',

  adminAuth,

  async (req, res) => {

    try {

      const {
        id,
        installmentId,
      } = req.params


      const {
        adjustedAmount,
        reason,
      } = req.body


      // ==================================
      // VALIDATE ADJUSTED AMOUNT
      // ==================================

      const newAmount =
        Number(adjustedAmount)


      if (
        Number.isNaN(newAmount) ||
        newAmount < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Adjusted amount must be 0 or greater.',

        })

      }


      // ==================================
      // REASON REQUIRED
      // ==================================

      const adjustmentReason =
        String(reason || '').trim()


      if (!adjustmentReason) {

        return res.status(400).json({

          success: false,

          message:
            'Adjustment reason is required.',

        })

      }


      // ==================================
      // FIND STUDENT
      // ==================================

      const student =
        await Student.findById(id)


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // FIND INSTALLMENT
      // ==================================

      const installment =
        student.installmentSchedule.id(
          installmentId
        )


      if (!installment) {

        return res.status(404).json({

          success: false,

          message:
            'Installment not found.',

        })

      }


      // ==================================
      // ORIGINAL MONTHLY FEE
      // ==================================

      const currentAmount =
        Number(
          installment.amount || 0
        )


      const existingOriginalAmount =
        Number(
          installment.originalAmount || 0
        )


      const originalAmount =
        existingOriginalAmount > 0
          ? existingOriginalAmount
          : currentAmount


      // ==================================
      // ALREADY PAID AMOUNT
      // ==================================

      const paidAmount =
        Number(
          installment.paidAmount || 0
        )


      // ==================================
      // CANNOT REDUCE BELOW PAID AMOUNT
      // ==================================

      if (
        newAmount < paidAmount
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Adjusted amount cannot be less than already paid amount ₹${paidAmount}.`,

        })

      }


      // ==================================
      // CALCULATE WAIVER
      // ==================================

      const adjustmentAmount =
        Math.max(
          originalAmount - newAmount,
          0
        )


      // ==================================
      // ADJUSTMENT TYPE
      // ==================================

      let adjustmentType =
        'None'


      if (
        newAmount === 0
      ) {

        adjustmentType =
          'FullWaiver'

      }

      else if (
        newAmount < originalAmount
      ) {

        adjustmentType =
          'PartialWaiver'

      }


      // ==================================
      // ADMIN NAME
      // ==================================

      let adjustedBy =
        'Admin'


      if (req.admin) {

        adjustedBy =
          req.admin.name ||
          req.admin.email ||
          req.admin.username ||
          'Admin'

      }

      else if (req.user) {

        adjustedBy =
          req.user.name ||
          req.user.email ||
          req.user.username ||
          'Admin'

      }


      // ==================================
      // SAVE ADJUSTMENT INFORMATION
      // ==================================

      installment.amount =
        newAmount

      installment.originalAmount =
        originalAmount

      installment.adjustmentAmount =
        adjustmentAmount

      installment.adjustmentType =
        adjustmentType

      installment.adjustmentReason =
        adjustmentReason

      installment.adjustedBy =
        adjustedBy

      installment.adjustedAt =
        new Date()


      // ==================================
      // FULL WAIVER
      // ==================================

      if (
        newAmount === 0
      ) {

        installment.status =
          'Waived'

        installment.paidAmount =
          0

        installment.paidDate =
          null

      }


      // ==================================
      // FULLY PAID
      // ==================================

      else if (
        paidAmount >= newAmount
      ) {

        installment.paidAmount =
          newAmount

        installment.status =
          'Paid'

        if (
          !installment.paidDate
        ) {

          installment.paidDate =
            new Date()

        }

      }


      // ==================================
      // PENDING
      // ==================================

      else {

        installment.status =
          'Pending'

        installment.paidDate =
          null

      }


      // ==================================
      // REFRESH MASTER FEE STATE
      // ==================================
      //
      // A waiver is a concession, not a payment.
      // Therefore paidFees and remainingFees are NOT changed here.
      // ==================================

      refreshMasterFeeState(
        student
      )

      await student.save()


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          newAmount === 0
            ? 'Monthly fee waived successfully.'
            : 'Monthly fee adjusted successfully.',

        student,

        installment,

      })

    }

    catch (error) {

      console.log(
        'Adjust Monthly Fee Error:',
        error
      )


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }
)


// ======================================
// OFFLINE COURSE FEE PAYMENT
// ======================================

router.put(
  '/students/add-payment/:id',
  async (req, res) => {

    try {

      const {
        amount,
        paymentMethod,
        paymentDate,
      } = req.body

      const student =
        await Student.findById(
          req.params.id
        )

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }

      

      const paymentAmount =
        Number(amount)

      if (
        !paymentAmount ||
        paymentAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid Payment Amount',

        })

      }

      const remainingFee =
        Number(
          student.remainingFees || 0
        )

      if (
        remainingFee <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course Fee Already Paid',

        })

      }

      if (
        paymentAmount >
        remainingFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Payment cannot be greater than remaining fee of ₹${remainingFee}.`,

        })

      }

      const finalPaymentDate =
        toDate(
          paymentDate ||
          new Date()
        )

      if (!finalPaymentDate) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid payment date.',

        })

      }

      // ==================================
      // PAYMENT IS ALLOCATED TO THE
      // OLDEST UNPAID INSTALLMENT FIRST
      // ==================================

      const allocation =
        allocatePayment(

          student,

          paymentAmount,

          finalPaymentDate

        )

      if (
        allocation.allocatedAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'No unpaid installment is available for this payment.',

        })

      }

      student.paidFees =
        Math.min(

          Number(
            student.totalFees || 0
          ),

          Number(
            student.paidFees || 0
          ) +

          allocation.allocatedAmount

        )

      student.remainingFees =
        Math.max(

          0,

          Number(
            student.totalFees || 0
          ) -

          Number(
            student.paidFees || 0
          )

        )

      student.paymentMode =
        'Offline'

      student.paymentHistory.push({

        amount:
          allocation.allocatedAmount,

        paymentCategory:
          'CourseFee',

        paymentMethod:
          paymentMethod ||
          'Cash',

        paymentType:
          student.paymentPlan === 'full'
            ? 'Full'
            : 'Installment',

        paymentPlan:
          student.paymentPlan || '',

        paymentMode:
          'Offline',

        paymentStatus:
          'Success',

        transactionId:
          '',

        orderId:
          '',

        installmentNumber:
          allocation.paidInstallments.length === 1
            ? allocation.paidInstallments[0]
            : null,

        paymentDate:
          finalPaymentDate,

      })

      refreshMasterFeeState(
        student
      )

      if (
        student.remainingFees <= 0
      ) {

        student.feesStatus =
          'Paid'

        student.dueDate =
          null

      }

      await student.save()

      const payment =
        await Payment.create({

          studentName:
            student.name,

          admissionNumber:
            student.admissionNumber,

          email:
            student.email,

          phone:
            student.contact,

          course:
            student.course,

          totalFee:
            student.totalFees,

          registrationFee:
            student.registrationFee,

          paymentCategory:
            'CourseFee',

          paymentPlan:
            student.paymentPlan || '',

          paymentType:
            student.paymentPlan === 'full'
              ? 'Full'
              : 'Installment',

          amountPaid:
            allocation.allocatedAmount,

          paymentMethod:
            paymentMethod ||
            'Cash',

          paymentMode:
            'Offline',

          paymentStatus:
            'Success',

          transactionId:
            '',

          razorpayOrderId:
            '',

          razorpayPaymentId:
            '',

          razorpaySignature:
            '',

        })

      return res.status(200).json({

        success: true,

        message:
          'Offline Payment Added Successfully',

        paidInstallments:
          allocation.paidInstallments,

        student,

        payment,

      })

    }

    catch (error) {

      console.log(
        'Add Offline Payment Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }
)


// ======================================
// CREATE RAZORPAY ORDER
// ======================================

router.post(
  '/student/fees/create-order',
  studentAuth,
  async (req, res) => {

    try {

      const {
        amount,
      } = req.body

      const studentId =
        req.student?.id

      if (!studentId) {

        return res.status(401).json({

          success: false,

          message:
            'Student authentication required.',

        })

      }

      const student =
        await Student.findById(
          studentId
        )

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }

      const paymentAmount =
        Number(amount)

      const remainingFee =
        Number(
          student.remainingFees || 0
        )

      if (
        !paymentAmount ||
        paymentAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid payment amount.',

        })

      }

      if (
        paymentAmount >
        remainingFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Payment cannot be greater than remaining fee of ₹${remainingFee}.`,

        })

      }

      if (
        !student.paymentPlan
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment plan has not been created by admin.',

        })

      }

      const order =
        await razorpay.orders.create({

          amount:
            Math.round(
              paymentAmount * 100
            ),

          currency:
            'INR',

          receipt:
            `PIE_${student.admissionNumber}_${Date.now()}`,

          notes: {

            studentId:
              student._id.toString(),

            admissionNumber:
              student.admissionNumber,

            paymentPlan:
              student.paymentPlan,

            paymentCategory:
              'CourseFee',

          },

        })

      return res.status(200).json({

        success: true,

        order: {

          id:
            order.id,

          amount:
            order.amount,

          currency:
            order.currency,

        },

        keyId:
          process.env.RAZORPAY_KEY_ID,

        paymentPlan:
          student.paymentPlan,

        amount:
          paymentAmount,

      })

    }

    catch (error) {

      console.log(
        'Create Razorpay Order Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          error?.error?.description ||
          error?.message ||
          'Unable to create Razorpay order.',

      })

    }

  }
)


// ======================================
// VERIFY RAZORPAY PAYMENT
// ======================================

router.post(
  '/student/fees/verify',
  studentAuth,
  async (req, res) => {

    try {

      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      } = req.body

      if (
        !razorpay_payment_id ||
        !razorpay_order_id ||
        !razorpay_signature
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Incomplete Razorpay payment details.',

        })

      }

      const order =
        await razorpay.orders.fetch(
          razorpay_order_id
        )

      if (!order) {

        return res.status(404).json({

          success: false,

          message:
            'Razorpay order not found.',

        })

      }

      const signatureBody =
        `${razorpay_order_id}|${razorpay_payment_id}`

      const expectedSignature =
        crypto
          .createHmac(
            'sha256',
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(signatureBody)
          .digest('hex')

      const receivedBuffer =
        Buffer.from(
          razorpay_signature,
          'utf8'
        )

      const expectedBuffer =
        Buffer.from(
          expectedSignature,
          'utf8'
        )

      if (
        receivedBuffer.length !==
          expectedBuffer.length ||
        !crypto.timingSafeEqual(
          receivedBuffer,
          expectedBuffer
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Razorpay signature verification failed.',

        })

      }

      const razorpayPayment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        )

      if (
        !razorpayPayment ||
        razorpayPayment.status !==
          'captured'
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Razorpay payment was not captured.',

        })

      }

      const orderAmount =
        Number(order.amount || 0) / 100

      const paidAmount =
        Number(
          razorpayPayment.amount || 0
        ) / 100

      if (
        orderAmount !==
        paidAmount
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment amount does not match order amount.',

        })

      }

      const authenticatedStudentId =
        req.student?.id

      const orderStudentId =
        order?.notes?.studentId

      if (
        !authenticatedStudentId ||
        String(authenticatedStudentId) !==
          String(orderStudentId)
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Student verification failed.',

        })

      }

      const student =
        await Student.findById(
          authenticatedStudentId
        )

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }

      if (
        order?.notes?.admissionNumber &&
        order.notes.admissionNumber !==
          student.admissionNumber
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Admission verification failed.',

        })

      }

      const existingPayment =
        await Payment.findOne({

          $or: [

            {
              transactionId:
                razorpay_payment_id,
            },

            {
              razorpayPaymentId:
                razorpay_payment_id,
            },

            {
              razorpayOrderId:
                razorpay_order_id,
            },

          ],

        })

      if (existingPayment) {

        return res.status(200).json({

          success: true,

          message:
            'Payment already processed.',

          alreadyProcessed:
            true,

          student,

          payment:
            existingPayment,

        })

      }

      const remainingFee =
        Number(
          student.remainingFees || 0
        )

      if (
        paidAmount >
        remainingFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment is greater than current remaining fee.',

        })

      }

      const paymentDate =
        new Date()

      const allocation =
        allocatePayment(

          student,

          paidAmount,

          paymentDate

        )

      if (
        allocation.allocatedAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'No unpaid installment is available.',

        })

      }

      student.paidFees =
        Math.min(

          Number(
            student.totalFees || 0
          ),

          Number(
            student.paidFees || 0
          ) +

          allocation.allocatedAmount

        )

      student.remainingFees =
        Math.max(

          0,

          Number(
            student.totalFees || 0
          ) -

          Number(
            student.paidFees || 0
          )

        )

      student.paymentMode =
        'Online'

      student.paymentHistory.push({

        amount:
          allocation.allocatedAmount,

        paymentCategory:
          'CourseFee',

        paymentMethod:
          'Razorpay',

        paymentType:
          student.paymentPlan === 'full'
            ? 'Full'
            : 'Installment',

        paymentPlan:
          student.paymentPlan || '',

        paymentMode:
          'Online',

        paymentStatus:
          'Success',

        transactionId:
          razorpay_payment_id,

        orderId:
          razorpay_order_id,

        installmentNumber:
          allocation.paidInstallments.length === 1
            ? allocation.paidInstallments[0]
            : null,

        paymentDate,

      })

      refreshMasterFeeState(
        student
      )

      if (
        student.remainingFees <= 0
      ) {

        student.feesStatus =
          'Paid'

        student.dueDate =
          null

      }

      await student.save()

      const payment =
        await Payment.create({

          studentName:
            student.name,

          admissionNumber:
            student.admissionNumber,

          email:
            student.email,

          phone:
            student.contact,

          course:
            student.course,

          totalFee:
            student.totalFees,

          registrationFee:
            student.registrationFee,

          paymentCategory:
            'CourseFee',

          paymentPlan:
            student.paymentPlan,

          paymentType:
            student.paymentPlan === 'full'
              ? 'Full'
              : 'Installment',

          amountPaid:
            allocation.allocatedAmount,

          paymentMethod:
            'Razorpay',

          paymentMode:
            'Online',

          paymentStatus:
            'Success',

          transactionId:
            razorpay_payment_id,

          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,

          razorpaySignature:
            razorpay_signature,

        })

      try {

        await createNotification({

          type:
            'Payment',

          title:
            'Online Payment Received',

          message:
            `${student.name} paid ₹${allocation.allocatedAmount}`,

          link:
            '/admin/payments',

          relatedId:
            payment._id.toString(),

        })

      }

      catch (notificationError) {

        console.log(
          'Online Payment Notification Error:',
          notificationError
        )

      }

      return res.status(200).json({

        success: true,

        message:
          'Payment verified successfully.',

        paidInstallments:
          allocation.paidInstallments,

        student,

        payment,

      })

    }

    catch (error) {

      console.log(
        'Verify Razorpay Payment Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          error?.error?.description ||
          error?.message ||
          'Unable to verify Razorpay payment.',

      })

    }

  }
)


// ======================================
// VERIFY STUDENT
// ======================================

router.post(
  '/students/verify',
  async (req, res) => {

    try {

      const {
        admissionNumber,
        name,
        phone,
      } = req.body

      if (
        !admissionNumber ||
        !name ||
        !phone
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Admission Number, Name and Mobile are required.',

        })

      }

      const student =
        await Student.findOne({

          admissionNumber:
            admissionNumber.trim(),

          name:
            name.trim(),

          contact:
            phone.trim(),

        })

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }

      if (
        !student.studentStatus
      ) {

        student.studentStatus =
          'Active'

      }

      refreshMasterFeeState(
        student
      )

      await student.save()

      return res.status(200).json({

        success: true,

        student,

      })

    }

    catch (error) {

      console.log(
        'Verify Student Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


// ======================================
// CHECK EXISTING STUDENT
// ======================================

router.post(
  '/students/check',
  async (req, res) => {

    try {

      const {
        email,
        phone,
      } = req.body

      const conditions = []

      if (
        email &&
        String(email).trim()
      ) {

        conditions.push({

          email:
            String(email)
              .trim()
              .toLowerCase(),

        })

      }

      if (
        phone &&
        String(phone).trim()
      ) {

        conditions.push({

          contact:
            String(phone).trim(),

        })

      }

      if (
        conditions.length === 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Email or phone is required.',

        })

      }

      const student =
        await Student.findOne({

          $or:
            conditions,

        })

      return res.status(200).json({

        success: true,

        exists:
          !!student,

      })

    }

    catch (error) {

      console.log(
        'Check Student Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


// ======================================
// EXPORT
// ======================================

module.exports =
  router
