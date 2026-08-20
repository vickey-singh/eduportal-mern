const razorpay =
  require('../config/razorpay')

const crypto =
  require('crypto')

const express =
  require('express')

const router =
  express.Router()

const Receipt =
  require('../models/Receipt')

const Payment =
  require('../models/Payment')

const Student =
  require('../models/Student')

const Course =
  require('../models/Course')

const saveReceipt =
  require('../utils/saveReceipt')

const sendAdmissionEmail =
  require('../utils/sendAdmissionEmail')

const sendAdminNotification =
  require('../utils/sendAdminNotification')

const createNotification =
  require('../utils/createNotification')

const upload =
  require('../middleware/upload')


// ======================================
// FEE HELPERS
// ======================================

const ALLOWED_PLANS = [
  'full',
  'monthly',
  'installment',
]


const toDate = (value) => {

  if (!value) {
    return null
  }

  if (value instanceof Date) {

    const date =
      new Date(value)

    date.setHours(
      0,
      0,
      0,
      0
    )

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date

  }

  const text =
    String(value).trim()

  let date

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(text)
  ) {

    const [
      year,
      month,
      day,
    ] =
      text
        .split('-')
        .map(Number)

    date =
      new Date(
        year,
        month - 1,
        day
      )

  }

  else if (
    /^\d{2}-\d{2}-\d{4}$/.test(text)
  ) {

    const [
      day,
      month,
      year,
    ] =
      text
        .split('-')
        .map(Number)

    date =
      new Date(
        year,
        month - 1,
        day
      )

  }

  else {

    date =
      new Date(text)

  }

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null
  }

  date.setHours(
    0,
    0,
    0,
    0
  )

  return date

}


// ======================================
// REFRESH INSTALLMENT STATUS
// ======================================

const refreshInstallmentStatuses =
  (student) => {

    const schedule =
      Array.isArray(
        student.installmentSchedule
      )
        ? student.installmentSchedule
        : []

    const today =
      toDate(
        new Date()
      )

    schedule.forEach(
      (item) => {

        const amount =
          Number(
            item.amount || 0
          )

        const paidAmount =
          Number(
            item.paidAmount || 0
          )

        if (
          amount > 0 &&
          paidAmount >= amount
        ) {

          item.paidAmount =
            amount

          item.status =
            'Paid'

          return
        }

        const dueDate =
          toDate(
            item.dueDate
          )

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

      }
    )

  }


// ======================================
// REFRESH MASTER FEE STATE
// ======================================

const refreshMasterFeeState =
  (student) => {

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
          item.status ===
          'Due'
      )

    const pending =
      schedule.filter(
        item =>
          item.status ===
          'Pending'
      )

    const remaining =
      Number(
        student.remainingFees || 0
      )

    if (
      remaining <= 0
    ) {

      student.feesStatus =
        'Paid'

      student.dueDate =
        null

      return

    }

    // Multiple installments can be Due.
    // The master dueDate shows the latest
    // currently Due installment.

    if (
      due.length > 0
    ) {

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

    // Nothing is Due yet.
    // Show the next upcoming installment.

    if (
      pending.length > 0
    ) {

      pending.sort(
        (a, b) =>
          new Date(a.dueDate) -
          new Date(b.dueDate)
      )

      student.dueDate =
        pending[0].dueDate

      student.feesStatus =
        'Partial'

      return

    }

    student.dueDate =
      null

    student.feesStatus =
      'Partial'

  }


// ======================================
// ALLOCATE PAYMENT
// ======================================
//
// Payment is applied to the oldest
// unpaid installment first.
//
// This allows:
//
// ₹5,000 payment
// → first Due installment cleared.
//
// If two months are Due and student
// pays one month, only the oldest Due
// installment becomes Paid.
// ======================================

const allocatePayment =
  (
    student,
    amount,
    paymentDate
  ) => {

    let remaining =
      Number(amount || 0)

    const paidInstallments =
      []

    const schedule =
      Array.isArray(
        student.installmentSchedule
      )
        ? student.installmentSchedule
        : []

    refreshInstallmentStatuses(
      student
    )

    const unpaid =
      schedule
        .filter(
          item =>
            item.status !==
            'Paid'
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate) -
            new Date(b.dueDate)
        )

    for (
      const item of unpaid
    ) {

      if (
        remaining <= 0
      ) {
        break
      }

      const installmentAmount =
        Number(
          item.amount || 0
        )

      const alreadyPaid =
        Number(
          item.paidAmount || 0
        )

      const balance =
        Math.max(
          0,
          installmentAmount -
          alreadyPaid
        )

      if (
        balance <= 0
      ) {
        continue
      }

      const allocation =
        Math.min(
          remaining,
          balance
        )

      item.paidAmount =
        alreadyPaid +
        allocation

      remaining -=
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
          toDate(
            paymentDate
          )

        paidInstallments.push(
          item.installmentNumber
        )

      }

    }

    return {

      allocatedAmount:
        Number(amount || 0) -
        remaining,

      unallocatedAmount:
        remaining,

      paidInstallments,

    }

  }


// ======================================
// APPLY PAYMENT TO STUDENT
// ======================================

const applyCoursePayment =
  async ({
    student,
    amount,
    paymentMethod,
    paymentMode,
    transactionId,
    orderId,
    signature,
    paymentDate,
  }) => {

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

      throw new Error(
        'Enter a valid payment amount.'
      )

    }

    if (
      paymentAmount >
      remainingFee
    ) {

      throw new Error(
        `Payment cannot be greater than remaining fee of ₹${remainingFee}.`
      )

    }

    const finalPaymentDate =
      toDate(
        paymentDate ||
        new Date()
      )

    const allocation =
      allocatePayment(
        student,
        paymentAmount,
        finalPaymentDate
      )

    if (
      allocation.allocatedAmount <= 0
    ) {

      throw new Error(
        'No unpaid installment is available.'
      )

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
      paymentMode ||
      'Offline'

    refreshMasterFeeState(
      student
    )

    const paymentType =
      student.paymentPlan ===
      'full'
        ? 'Full'
        : 'Installment'

    student.paymentHistory.push({

      amount:
        allocation.allocatedAmount,

      paymentCategory:
        'CourseFee',

      paymentMethod:
        paymentMethod ||
        'Cash',

      paymentType,

      paymentPlan:
        student.paymentPlan || '',

      paymentMode:
        paymentMode ||
        'Offline',

      paymentStatus:
        'Success',

      transactionId:
        transactionId || '',

      orderId:
        orderId || '',

      paymentDate:
        finalPaymentDate,

      installmentNumber:
        allocation.paidInstallments.length === 1
          ? allocation.paidInstallments[0]
          : null,

    })

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

        paymentType,

        amountPaid:
          allocation.allocatedAmount,

        paymentMethod:
          paymentMethod ||
          'Cash',

        paymentMode:
          paymentMode ||
          'Offline',

        paymentStatus:
          'Success',

        transactionId:
          transactionId || '',

        razorpayOrderId:
          orderId || '',

        razorpayPaymentId:
          transactionId || '',

        razorpaySignature:
          signature || '',

      })

    return {

      student,

      payment,

      allocation,

    }

  }


// ======================================
// GET ALL PAYMENTS
// ======================================

router.get(
  '/payments',
  async (req, res) => {

    try {

      const payments =
        await Payment.find()
          .sort({
            createdAt: -1,
          })

      res.status(200).json(
        payments
      )

    }

    catch (error) {

      console.log(
        'Get Payments Error:',
        error
      )

      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


// ======================================
// ADD OFFLINE PAYMENT
// ======================================

router.post(
  '/payments',
  async (req, res) => {

    try {

      const payment =
        new Payment({

          ...req.body,

          paymentMode:
            req.body.paymentMode ||
            'Offline',

        })

      await payment.save()

      res.status(201).json({

        success: true,

        message:
          'Payment Saved Successfully',

        payment,

      })

    }

    catch (error) {

      console.log(
        'Add Payment Error:',
        error
      )

      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


// ======================================
// CREATE RAZORPAY ORDER
// ======================================

router.post(
  '/payments/create-order',
  async (req, res) => {

    try {

      const {
        amount,
      } = req.body

      const paymentAmount =
        Number(amount)

      if (
        !paymentAmount ||
        paymentAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid payment amount',

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
            `receipt_${Date.now()}`,

        })

      res.status(200).json({

        success: true,

        order,

      })

    }

    catch (error) {

      console.log(
        'Create Order Error:',
        error
      )

      res.status(500).json({

        success: false,

        message:
          'Unable to create Razorpay order',

      })

    }

  }
)


// ======================================
// VERIFY ONLINE REGISTRATION PAYMENT
// ======================================
//
// Registration payment creates admission.
// Course fee remains unpaid until admin
// creates/selects the plan.
// ======================================

router.post(
  '/payments/verify',
  upload.single('image'),
  async (req, res) => {

    try {

      const {

        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,

      } = req.body

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid Razorpay payment data',

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
          .update(
            signatureBody
          )
          .digest('hex')

      if (
        expectedSignature !==
        razorpay_signature
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment Verification Failed',

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

          ],

        })

      if (
        existingPayment
      ) {

        return res.status(400).json({

          success: false,

          message:
            'This payment has already been processed.',

        })

      }

      const studentEmail =
        String(
          req.body.email || ''
        )
          .trim()
          .toLowerCase()

      const studentPhone =
        String(
          req.body.phone || ''
        )
          .trim()

      const studentName =
        String(
          req.body.studentName || ''
        )
          .trim()

      if (!studentName) {

        return res.status(400).json({

          success: false,

          message:
            'Student name is required.',

        })

      }

      if (!studentPhone) {

        return res.status(400).json({

          success: false,

          message:
            'Mobile number is required.',

        })

      }

      if (!req.body.course) {

        return res.status(400).json({

          success: false,

          message:
            'Course is required for online admission.',

        })

      }

      const existingConditions = [

        {
          contact:
            studentPhone,
        },

      ]

      if (studentEmail) {

        existingConditions.push({

          email:
            studentEmail,

        })

      }

      const alreadyExistingStudent =
        await Student.findOne({

          $or:
            existingConditions,

        })

      if (
        alreadyExistingStudent
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student Already Exists. Please use Existing Student Payment.',

        })

      }

      const course =
        await Course.findOne({

          courseName:
            req.body.course,

        })

      if (!course) {

        return res.status(404).json({

          success: false,

          message:
            'Course Not Found',

        })

      }

      const totalFee =
        Number(
          course.totalFee || 0
        )

      const registrationFee =
        Number(
          course.registrationFee || 0
        )

      const amountPaid =
        Number(
          req.body.amountPaid ||
          registrationFee
        )

      if (
        registrationFee <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration fee is not available for this course.',

        })

      }

      if (
        amountPaid !==
        registrationFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Registration payment must be ₹${registrationFee}.`,

        })

      }

      const existingStudents =
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

      let highestAdmissionNumber =
        0

      for (
        const existingStudent
        of existingStudents
      ) {

        const number =
          parseInt(

            String(
              existingStudent.admissionNumber
            )
              .replace(
                /^PIE/i,
                ''
              ),

            10

          ) || 0

        if (
          number >
          highestAdmissionNumber
        ) {

          highestAdmissionNumber =
            number

        }

      }

      const admissionNumber =
        `PIE${String(
          highestAdmissionNumber + 1
        ).padStart(
          4,
          '0'
        )}`

      const today =
        new Date()

      const admissionDate =
        today
          .toISOString()
          .split('T')[0]

      const currentYear =
        today.getFullYear()

      const currentMonth =
        today.getMonth() + 1

      let sessionStartYear =
        currentYear

      if (
        currentMonth < 3
      ) {

        sessionStartYear =
          currentYear - 1

      }

      const session =
        `${sessionStartYear}-${sessionStartYear + 1}`

      const image =
        req.file
          ? req.file.path
          : ''

      const student =
        new Student({

          name:
            studentName,

          dob:
            req.body.dob || '',

          aadharNumber:
            req.body.aadharNumber || '',

          admissionNumber,

          course:
            course.courseName,

          batchTime:
            course.batchTime || '',

          contact:
            studentPhone,

          email:
            studentEmail,

          admissionDate,

          session,

          studentStatus:
            'Active',

          image,

          fatherName:
            req.body.fatherName || '',

          motherName:
            req.body.motherName || '',

          fatherOccupation:
            req.body.fatherOccupation || '',

          motherOccupation:
            req.body.motherOccupation || '',

          fatherMobile:
            req.body.fatherMobile || '',

          motherMobile:
            req.body.motherMobile || '',

          permanentAddress:
            req.body.permanentAddress || '',

          currentAddress:
            req.body.currentAddress || '',

          schoolCollegeName:
            req.body.schoolCollegeName || '',

          admissionType:
            'Online',

          registrationFee,

          registrationFeePaid:
            amountPaid,

          registrationFeeStatus:
            'Paid',

          totalFees:
            totalFee,

          paidFees:
            0,

          remainingFees:
            totalFee,

          feesStatus:
            totalFee > 0
              ? 'Partial'
              : 'Paid',

          paymentPlan:
            '',

          dueDate:
            null,

          paymentMode:
            'Online',

          paymentHistory: [

            {

              amount:
                amountPaid,

              paymentCategory:
                'Registration',

              paymentMethod:
                'Razorpay',

              paymentType:
                'Full',

              paymentPlan:
                '',

              paymentMode:
                'Online',

              paymentStatus:
                'Success',

              transactionId:
                razorpay_payment_id,

              orderId:
                razorpay_order_id,

              paymentDate:
                admissionDate,

            },

          ],

        })

      await student.save()

      const receipt =
        await saveReceipt({

          student,

          amountPaid,

          paymentType:
            'Full',

          paymentCategory:
            'Registration',

          paymentPlan:
            '',

          transactionId:
            razorpay_payment_id,

          orderId:
            razorpay_order_id,

        })

      const payment =
        new Payment({

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
            'Registration',

          paymentPlan:
            '',

          paymentType:
            'Full',

          amountPaid,

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

      await payment.save()

      try {

        await createNotification({

          type:
            'Admission',

          title:
            'New Online Admission',

          message:
            `${student.name} has taken admission for ${student.course}`,

          link:
            '/admin/students',

          relatedId:
            student._id.toString(),

        })

      }

      catch (notificationError) {

        console.error(
          'Admission Notification Error:',
          notificationError
        )

      }

      res.status(200).json({

        success: true,

        message:
          'Registration Payment Verified Successfully',

        payment,

        student,

        receiptNumber:
          receipt.receiptNumber,

      })

      sendAdmissionEmail({

        student,

        receipt,

        amountPaid,

        transactionId:
          razorpay_payment_id,

      }).catch((error) => {

        console.error(
          'Student Email Error:',
          error
        )

      })

      sendAdminNotification({

        student,

        receipt,

        amountPaid,

        transactionId:
          razorpay_payment_id,

      }).catch((error) => {

        console.error(
          'Admin Email Error:',
          error
        )

      })

    }

    catch (error) {

      console.log(
        'Registration Payment Error:',
        error
      )

      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


// ======================================
// VERIFY EXISTING STUDENT
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

      refreshMasterFeeState(
        student
      )

      await student.save()

      res.status(200).json({

        success: true,

        student,

      })

    }

    catch (error) {

      console.log(
        'Verify Student Error:',
        error
      )

      res.status(500).json({

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

      if (email) {

        conditions.push({

          email:
            email
              .trim()
              .toLowerCase(),

        })

      }

      if (phone) {

        conditions.push({

          contact:
            phone.trim(),

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

      res.status(200).json({

        success: true,

        exists:
          !!student,

      })

    }

    catch (error) {

      console.log(
        'Check Existing Student Error:',
        error
      )

      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


// ======================================
// EXISTING STUDENT ONLINE PAYMENT
// ======================================

router.post(
  '/students/pay',
  async (req, res) => {

    try {

      const {

        admissionNumber,

        amountPaid,

        paymentMethod,

        transactionId,

        orderId,

        signature,

        paymentDate,

      } = req.body

      if (
        !admissionNumber ||
        !amountPaid ||
        !transactionId ||
        !orderId ||
        !signature
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Incomplete payment information.',

        })

      }

      const student =
        await Student.findOne({

          admissionNumber,

        })

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }

      if (
        Number(
          student.remainingFees || 0
        ) <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course Fee is already fully paid.',

        })

      }

      const duplicatePayment =
        await Payment.findOne({

          $or: [

            {
              transactionId,
            },

            {
              razorpayPaymentId:
                transactionId,
            },

          ],

        })

      if (
        duplicatePayment
      ) {

        return res.status(400).json({

          success: false,

          message:
            'This payment has already been processed.',

        })

      }

      const signatureBody =
        `${orderId}|${transactionId}`

      const expectedSignature =
        crypto
          .createHmac(
            'sha256',
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            signatureBody
          )
          .digest('hex')

      if (
        expectedSignature !==
        signature
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment Verification Failed',

        })

      }

      const amount =
        Number(amountPaid)

      const remaining =
        Number(
          student.remainingFees || 0
        )

      if (
        !amount ||
        amount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Enter a valid payment amount.',

        })

      }

      if (
        amount >
        remaining
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Payment cannot be greater than remaining fee of ₹${remaining}.`,

        })

      }

      // ==================================
      // PLAN MUST ALREADY BE CREATED BY ADMIN
      // ==================================

      if (
        !ALLOWED_PLANS.includes(
          student.paymentPlan
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment plan has not been created by admin yet.',

        })

      }

      // ==================================
      // FULL PLAN
      // ==================================

      if (
        student.paymentPlan ===
        'full' &&
        amount !== remaining
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Full payment must be ₹${remaining}.`,

        })

      }

      const result =
        await applyCoursePayment({

          student,

          amount,

          paymentMethod:
            paymentMethod ||
            'Razorpay',

          paymentMode:
            'Online',

          transactionId,

          orderId,

          signature,

          paymentDate,

        })

      const receipt =
        await saveReceipt({

          student:
            result.student,

          amountPaid:
            result.allocation
              .allocatedAmount,

          paymentType:
            result.student.paymentPlan ===
            'full'
              ? 'Full'
              : 'Installment',

          paymentCategory:
            'CourseFee',

          paymentPlan:
            result.student.paymentPlan,

          transactionId,

          orderId,

        })

      try {

        await createNotification({

          type:
            'Payment',

          title:
            'Course Fee Payment Received',

          message:
            `${result.student.name} has made a course fee payment of ₹${result.allocation.allocatedAmount}.`,

          link:
            '/admin/payments',

          relatedId:
            result.payment._id.toString(),

        })

      }

      catch (notificationError) {

        console.error(
          'Payment Notification Error:',
          notificationError
        )

      }

      return res.status(200).json({

        success: true,

        message:
          'Payment Successful',

        student:
          result.student,

        payment:
          result.payment,

        receiptNumber:
          receipt.receiptNumber,

        paidInstallments:
          result.allocation
            .paidInstallments,

      })

    }

    catch (error) {

      console.log(
        'Existing Student Payment Error:',
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
// GET PAYMENT REVENUE
// ======================================

router.get(
  '/payments/revenue',
  async (req, res) => {

    try {

      const totalRevenueResult =
        await Payment.aggregate([

          {
            $match: {

              paymentStatus:
                'Success',

            },

          },

          {
            $group: {

              _id: null,

              totalRevenue: {
                $sum:
                  '$amountPaid',
              },

              totalPayments: {
                $sum: 1,
              },

            },

          },

        ])

      const totalRevenue =
        totalRevenueResult[0]
          ?.totalRevenue || 0

      const totalPayments =
        totalRevenueResult[0]
          ?.totalPayments || 0

      const todayIST =
        new Date()
          .toLocaleDateString(
            'en-CA',
            {
              timeZone:
                'Asia/Kolkata',
            }
          )

      const todayRevenueResult =
        await Payment.aggregate([

          {
            $match: {

              paymentStatus:
                'Success',

            },

          },

          {
            $addFields: {

              paymentDateIST: {

                $dateToString: {

                  format:
                    '%Y-%m-%d',

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

            },

          },

          {
            $match: {

              paymentDateIST:
                todayIST,

            },

          },

          {
            $group: {

              _id: null,

              revenue: {
                $sum:
                  '$amountPaid',
              },

              payments: {
                $sum: 1,
              },

            },

          },

        ])

      const todayRevenue =
        todayRevenueResult[0]
          ?.revenue || 0

      const todayPayments =
        todayRevenueResult[0]
          ?.payments || 0

      const currentMonth =
        todayIST.substring(
          0,
          7
        )

      const monthRevenueResult =
        await Payment.aggregate([

          {
            $match: {

              paymentStatus:
                'Success',

            },

          },

          {
            $addFields: {

              paymentMonthIST: {

                $dateToString: {

                  format:
                    '%Y-%m',

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

            },

          },

          {
            $match: {

              paymentMonthIST:
                currentMonth,

            },

          },

          {
            $group: {

              _id: null,

              revenue: {
                $sum:
                  '$amountPaid',
              },

              payments: {
                $sum: 1,
              },

            },

          },

        ])

      const monthlyRevenue =
        monthRevenueResult[0]
          ?.revenue || 0

      const monthlyPayments =
        monthRevenueResult[0]
          ?.payments || 0

      const registrationResult =
        await Payment.aggregate([

          {
            $match: {

              paymentStatus:
                'Success',

              paymentCategory:
                'Registration',

            },

          },

          {
            $group: {

              _id: null,

              revenue: {
                $sum:
                  '$amountPaid',
              },

            },

          },

        ])

      const registrationRevenue =
        registrationResult[0]
          ?.revenue || 0

      const courseFeeResult =
        await Payment.aggregate([

          {
            $match: {

              paymentStatus:
                'Success',

              paymentCategory:
                'CourseFee',

            },

          },

          {
            $group: {

              _id: null,

              revenue: {
                $sum:
                  '$amountPaid',
              },

            },

          },

        ])

      const courseFeeRevenue =
        courseFeeResult[0]
          ?.revenue || 0

      const onlineRevenueResult =
        await Payment.aggregate([

          {
            $match: {

              paymentStatus:
                'Success',

              paymentMode:
                'Online',

            },

          },

          {
            $group: {

              _id: null,

              revenue: {
                $sum:
                  '$amountPaid',
              },

            },

          },

        ])

      const onlineRevenue =
        onlineRevenueResult[0]
          ?.revenue || 0

      const offlineRevenueResult =
        await Payment.aggregate([

          {
            $match: {

              paymentStatus:
                'Success',

              paymentMode:
                'Offline',

            },

          },

          {
            $group: {

              _id: null,

              revenue: {
                $sum:
                  '$amountPaid',
              },

            },

          },

        ])

      const offlineRevenue =
        offlineRevenueResult[0]
          ?.revenue || 0

      res.status(200).json({

        success: true,

        revenue: {

          totalRevenue,

          todayRevenue,

          monthlyRevenue,

          totalPayments,

          todayPayments,

          monthlyPayments,

          registrationRevenue,

          courseFeeRevenue,

          onlineRevenue,

          offlineRevenue,

        },

      })

    }

    catch (error) {

      console.log(
        'Revenue Error:',
        error
      )

      res.status(500).json({

        success: false,

        message:
          'Unable to fetch revenue data',

      })

    }

  }
)


// ======================================
// GET REVENUE REPORT
// ======================================

router.get(
  '/payments/revenue-report',
  async (req, res) => {

    try {

      const dailyRevenue =
        await Payment.aggregate([

          {
            $match: {

              paymentStatus:
                'Success',

            },

          },

          {
            $group: {

              _id: {

                year: {

                  $year: {

                    date:
                      '$createdAt',

                    timezone:
                      'Asia/Kolkata',

                  },

                },

                month: {

                  $month: {

                    date:
                      '$createdAt',

                    timezone:
                      'Asia/Kolkata',

                  },

                },

                day: {

                  $dayOfMonth: {

                    date:
                      '$createdAt',

                    timezone:
                      'Asia/Kolkata',

                  },

                },

              },

              revenue: {
                $sum:
                  '$amountPaid',
              },

              payments: {
                $sum: 1,
              },

            },

          },

          {
            $sort: {

              '_id.year':
                1,

              '_id.month':
                1,

              '_id.day':
                1,

            },

          },

        ])

      const monthlyRevenue =
        await Payment.aggregate([

          {
            $match: {

              paymentStatus:
                'Success',

            },

          },

          {
            $group: {

              _id: {

                year: {

                  $year: {

                    date:
                      '$createdAt',

                    timezone:
                      'Asia/Kolkata',

                  },

                },

                month: {

                  $month: {

                    date:
                      '$createdAt',

                    timezone:
                      'Asia/Kolkata',

                  },

                },

              },

              revenue: {
                $sum:
                  '$amountPaid',
              },

              payments: {
                $sum: 1,
              },

            },

          },

          {
            $sort: {

              '_id.year':
                1,

              '_id.month':
                1,

            },

          },

        ])

      res.status(200).json({

        success: true,

        dailyRevenue,

        monthlyRevenue,

      })

    }

    catch (error) {

      console.log(
        'Revenue Report Error:',
        error
      )

      res.status(500).json({

        success: false,

        message:
          'Unable to fetch revenue report',

      })

    }

  }
)


// ======================================
// EXPORT
// ======================================

module.exports =
  router
