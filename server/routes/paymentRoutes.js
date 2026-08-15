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
// ADD PAYMENT
// ======================================
//
// General manual payment route.
//
// Default:
// paymentMode = Offline
//
// ======================================

router.post(
  '/payments',
  async (req, res) => {

    try {

      const paymentData = {

        ...req.body,

        paymentMode:
          req.body.paymentMode ||
          'Offline',

      }


      const payment =
        new Payment(
          paymentData
        )


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


      // ==================================
      // VALIDATION
      // ==================================

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


      // ==================================
      // RAZORPAY ORDER
      // ==================================

      const options = {

        amount:
          Math.round(
            paymentAmount * 100
          ),

        currency:
          'INR',

        receipt:
          `receipt_${Date.now()}`,

      }


      const order =
        await razorpay.orders.create(
          options
        )


      // ==================================
      // RESPONSE
      // ==================================

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


      // ==================================
      // RAZORPAY DATA VALIDATION
      // ==================================

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


      // ==================================
      // SIGNATURE VERIFICATION
      // ==================================

      const signatureBody =

        razorpay_order_id +

        '|' +

        razorpay_payment_id


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


      // ==================================
      // DUPLICATE PAYMENT CHECK
      // ==================================

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


      if (existingPayment) {

        return res.status(400).json({

          success: false,

          message:
            'This payment has already been processed.',

        })

      }


      // ==================================
      // CHECK EXISTING STUDENT
      // ==================================

      const alreadyExistingStudent =
        await Student.findOne({

          $or: [

            {
              email:
                req.body.email,
            },

            {
              contact:
                req.body.phone,
            },

          ],

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


      // ==================================
      // FIND COURSE
      // ==================================

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


      // ==================================
      // COURSE FEES
      // ==================================

      const totalFee =
        Number(
          course.totalFee || 0
        )


      const registrationFee =
        Number(
          course.registrationFee || 0
        )


      // ==================================
      // REGISTRATION PAYMENT
      // ==================================

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


      // ==================================
      // PAYMENT AMOUNT MUST MATCH
      // REGISTRATION FEE
      // ==================================

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


      // ======================================
      // ADMISSION NUMBER
      // ======================================
      //
      // New online admission format:
      //
      // PIE001
      // PIE002
      // PIE003
      //
      // ======================================

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
        const student of existingStudents
      ) {

        const number =
          parseInt(

            String(
              student.admissionNumber
            )
              .replace(
                /^PIE/i,
                ''
              )

          ) || 0


        if (
          number >
          highestAdmissionNumber
        ) {

          highestAdmissionNumber =
            number

        }

      }


      const nextAdmissionNumber =
        highestAdmissionNumber + 1


      const admissionNumber =
        `PIE${String(
          nextAdmissionNumber
        ).padStart(
          3,
          '0'
        )}`


      // ======================================
      // DATE
      // ======================================

      const today =
        new Date()


      const admissionDate =
        today
          .toISOString()
          .split('T')[0]


      // ======================================
      // IMAGE
      // ======================================

      const image =
        req.file
          ? req.file.path
          : ''


      // ======================================
      // CREATE STUDENT
      // ======================================

      const student =
        new Student({

          name:
            req.body.studentName || '',

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
            req.body.phone || '',

          email:
            req.body.email || '',

          admissionDate,

          image,


          // ==================================
          // PARENTS
          // ==================================

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


          // ==================================
          // ADDRESS
          // ==================================

          permanentAddress:
            req.body.permanentAddress || '',

          currentAddress:
            req.body.currentAddress || '',


          // ==================================
          // EDUCATION
          // ==================================

          schoolCollegeName:
            req.body.schoolCollegeName || '',


          // ==================================
          // ADMISSION
          // ==================================

          admissionType:
            'Online',


          // ==================================
          // REGISTRATION FEE
          // ==================================

          registrationFee,

          registrationFeePaid:
            amountPaid,

          registrationFeeStatus:
            'Paid',


          // ==================================
          // COURSE FEE
          // ==================================

          totalFees:
            totalFee,

          paidFees:
            0,

          remainingFees:
            totalFee,

          feesStatus:
            totalFee > 0
              ? 'Pending'
              : 'Paid',


          // ==================================
          // PAYMENT PLANS
          // ==================================

          monthlyInstallment:
            Number(
              course.monthlyInstallment || 0
            ),

          threeMonthInstallment:
            Number(
              course.threeMonthInstallment || 0
            ),

          sixMonthInstallment:
            Number(
              course.sixMonthInstallment || 0
            ),

          fullPaymentFee:
            Number(
              course.fullPaymentFee ||
              totalFee
            ),


          paymentPlan:
            '',


          dueDate:
            '',


          paymentMode:
            'Online',


          // ==================================
          // PAYMENT HISTORY
          // ==================================

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


      // ==================================
      // SAVE STUDENT
      // ==================================

      await student.save()


      // ==================================
      // SAVE RECEIPT
      // ==================================

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


      // ==================================
      // SAVE PAYMENT
      // ==================================

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


      // ======================================
      // ADMIN NOTIFICATION
      // ======================================

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

        console.log(
          'New Admission Notification Created ✅'
        )

      }

      catch (notificationError) {

        console.error(
          'Admission Notification Error:',
          notificationError
        )

      }


      // ==================================
      // RESPONSE
      // ==================================

      res.status(200).json({

        success: true,

        message:
          'Registration Payment Verified Successfully',

        payment,

        student,

        receiptNumber:
          receipt.receiptNumber,

      })


      // ==================================
      // STUDENT EMAIL
      // ==================================

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


      // ==================================
      // ADMIN EMAIL
      // ==================================

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


      res.status(200).json({

        success: true,

        student,

      })

    }

    catch (error) {

      console.log(error)

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
            email.trim()
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

      console.log(error)

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

        paymentPlan,

        paymentMethod,

        transactionId,

        orderId,

        signature,

        paymentDate,

      } = req.body


      // ==================================
      // BASIC VALIDATION
      // ==================================

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


      // ==================================
      // FIND STUDENT
      // ==================================

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


      // ==================================
      // ALREADY PAID
      // ==================================

      if (
        Number(
          student.remainingFees
        ) <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course Fee is already fully paid.',

        })

      }


      // ==================================
      // DUPLICATE PAYMENT CHECK
      // ======================================

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


      // ==================================
      // RAZORPAY SIGNATURE
      // ==================================

      const signatureBody =

        orderId +
        '|' +
        transactionId


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


      // ==================================
      // PAYMENT AMOUNT
      // ==================================

      const amount =
        Number(amountPaid)


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


      // ==================================
      // REMAINING FEE
      // ==================================

      const remaining =
        Number(
          student.remainingFees || 0
        )


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
      // PAYMENT PLAN
      // ==================================

      let selectedPlan =
        student.paymentPlan || ''


      // ==================================
      // FIRST COURSE PAYMENT
      // ==================================

      if (!selectedPlan) {

        if (!paymentPlan) {

          return res.status(400).json({

            success: false,

            message:
              'Please select a payment plan.',

          })

        }


        const allowedPlans = [

          'monthly',

          'three_month',

          'six_month',

          'full',

        ]


        if (
          !allowedPlans.includes(
            paymentPlan
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              'Invalid payment plan.',

          })

        }


        selectedPlan =
          paymentPlan

      }


      // ==================================
      // PLAN LOCK
      // ==================================

      if (

        student.paymentPlan &&

        paymentPlan &&

        paymentPlan !==
          student.paymentPlan

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment plan cannot be changed.',

        })

      }


      // ==================================
      // PLAN AMOUNT
      // ==================================

      let planAmount =
        0


      switch (
        selectedPlan
      ) {

        case 'monthly':

          planAmount =
            Number(
              student.monthlyInstallment || 0
            )

          break


        case 'three_month':

          planAmount =
            Number(
              student.threeMonthInstallment || 0
            )

          break


        case 'six_month':

          planAmount =
            Number(
              student.sixMonthInstallment || 0
            )

          break


        case 'full':

          planAmount =
            Number(
              student.fullPaymentFee ||
              remaining
            )

          break


        default:

          return res.status(400).json({

            success: false,

            message:
              'Invalid payment plan.',

          })

      }


      // ==================================
      // FULL PAYMENT
      // ==================================

      if (
        selectedPlan === 'full'
      ) {

        const fullPaymentAmount =

          Math.min(

            planAmount > 0
              ? planAmount
              : remaining,

            remaining

          )


        if (
          amount !==
          fullPaymentAmount
        ) {

          return res.status(400).json({

            success: false,

            message:
              `Full payment amount must be ₹${fullPaymentAmount}.`,

          })

        }

      }


      // ==================================
      // INSTALLMENT
      // ==================================

      else {

        const minimumAmount =
          Math.min(

            planAmount,

            remaining

          )


        if (
          minimumAmount <= 0
        ) {

          return res.status(400).json({

            success: false,

            message:
              'Selected payment plan amount is not configured.',

          })

        }


        if (
          amount <
          minimumAmount
        ) {

          return res.status(400).json({

            success: false,

            message:
              `Minimum payment for this plan is ₹${minimumAmount}.`,

          })

        }

      }


      // ==================================
      // PAYMENT TYPE
      // ==================================

      const paymentType =

        selectedPlan === 'full'

          ? 'Full'

          : 'Installment'


      // ==================================
      // PAYMENT DATE
      // ==================================

      const finalPaymentDate =

        paymentDate ||

        new Date()
          .toISOString()
          .split('T')[0]


      // ==================================
      // PAYMENT MODE
      // ==================================

      const finalPaymentMethod =
        paymentMethod ||
        'Razorpay'


      const finalPaymentMode =
        'Online'


      // ==================================
      // UPDATE PAID FEES
      // ==================================

      student.paidFees =

        Number(
          student.paidFees || 0
        ) +

        amount


      // ==================================
      // UPDATE REMAINING
      // ==================================

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


      // ==================================
      // FEES STATUS
      // ==================================

      if (
        student.remainingFees === 0
      ) {

        student.feesStatus =
          'Paid'

      }

      else {

        student.feesStatus =
          'Partial'

      }


      // ==================================
      // LOCK PAYMENT PLAN
      // ==================================

      student.paymentPlan =
        selectedPlan


      // ==================================
      // PAYMENT MODE
      // ==================================

      student.paymentMode =
        'Online'


      // ==================================
      // PAYMENT HISTORY
      // ==================================

      student.paymentHistory.push({

        amount,

        paymentCategory:
          'CourseFee',

        paymentMethod:
          finalPaymentMethod,

        paymentType,

        paymentPlan:
          selectedPlan,

        paymentMode:
          finalPaymentMode,

        paymentStatus:
          'Success',

        transactionId,

        orderId,

        paymentDate:
          finalPaymentDate,

      })


      // ==================================
      // SAVE STUDENT
      // ==================================

      await student.save()


      // ==================================
      // SAVE RECEIPT
      // ==================================

      const receipt =
        await saveReceipt({

          student,

          amountPaid:
            amount,

          paymentType,

          paymentCategory:
            'CourseFee',

          paymentPlan:
            selectedPlan,

          transactionId,

          orderId,

        })


      // ==================================
      // SAVE PAYMENT
      // ==================================

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
            'CourseFee',

          paymentPlan:
            selectedPlan,

          paymentType,

          amountPaid:
            amount,

          paymentMethod:
            finalPaymentMethod,

          paymentMode:
            'Online',

          paymentStatus:
            'Success',

          transactionId,

          razorpayOrderId:
            orderId,

          razorpayPaymentId:
            transactionId,

          razorpaySignature:
            signature,

        })


      await payment.save()


      // ======================================
      // ADMIN NOTIFICATION
      // ======================================

      try {

        await createNotification({

          type:
            'Payment',

          title:
            'Course Fee Payment Received',

          message:
            `${student.name} has made a course fee payment of ₹${amount}.`,

          link:
            '/admin/payments',

          relatedId:
            payment._id.toString(),

        })

        console.log(
          'Course Fee Payment Notification Created ✅'
        )

      }

      catch (notificationError) {

        console.error(
          'Payment Notification Error:',
          notificationError
        )

      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Payment Successful',

        student,

        payment,

        receiptNumber:
          receipt.receiptNumber,

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
          'Server Error',

      })

    }

  }
)


// ============================================================
// GET PAYMENT REVENUE
// ============================================================
//
// Supported:
//
// 1. Current/default:
//    /payments/revenue
//
// 2. Custom Monthly:
//    /payments/revenue?month=8&year=2026
//
// 3. Custom Yearly:
//    /payments/revenue?year=2026
//
// Only successful payments are counted.
//
// ============================================================

router.get(
  '/payments/revenue',
  async (req, res) => {

    try {

      const {
        month,
        year,
      } = req.query


      // ======================================
      // CURRENT INDIA DATE
      // ======================================

      const todayIST =
        new Date()
          .toLocaleDateString(
            'en-CA',
            {
              timeZone:
                'Asia/Kolkata',
            }
          )


      const currentYear =
        Number(
          todayIST.substring(
            0,
            4
          )
        )


      const currentMonth =
        Number(
          todayIST.substring(
            5,
            7
          )
        )


      // ======================================
      // SELECTED YEAR
      // ======================================
      //
      // If year is provided:
      // use selected year.
      //
      // Otherwise:
      // current year.
      //
      // ======================================

      const selectedYear =
        year
          ? Number(year)
          : currentYear


      // ======================================
      // SELECTED MONTH
      // ======================================
      //
      // month provided:
      // Monthly report.
      //
      // month not provided:
      // Yearly report.
      //
      // ======================================

      const selectedMonth =
        month
          ? Number(month)
          : null


      // ======================================
      // VALIDATE YEAR
      // ======================================

      if (

        !Number.isInteger(
          selectedYear
        )

        ||

        selectedYear < 2000

        ||

        selectedYear > 2100

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid year.',

        })

      }


      // ======================================
      // VALIDATE MONTH
      // ======================================

      if (

        selectedMonth !== null

        &&

        (

          !Number.isInteger(
            selectedMonth
          )

          ||

          selectedMonth < 1

          ||

          selectedMonth > 12

        )

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid month.',

        })

      }


      // ======================================
      // COMMON SUCCESSFUL PAYMENT MATCH
      // ======================================

      const baseMatch = {

        paymentStatus:
          'Success',

      }


      // ======================================
      // DATE MATCH
      // ======================================

      const dateMatch = {

        revenueYear:
          selectedYear,

        ...(

          selectedMonth !== null

            ? {

                revenueMonth:
                  selectedMonth,

              }

            : {}

        ),

      }


      // ======================================
      // TOTAL REVENUE
      // ======================================

      const totalRevenueResult =
        await Payment.aggregate([

          {
            $match:
              baseMatch,
          },

          {
            $addFields: {

              revenueYear: {

                $year: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

              revenueMonth: {

                $month: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

            },

          },

          {
            $match:
              dateMatch,
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


      const totalRevenue =
        totalRevenueResult[0]?.revenue || 0


      const totalPayments =
        totalRevenueResult[0]?.payments || 0


      // ======================================
      // REGISTRATION REVENUE
      // ======================================

      const registrationResult =
        await Payment.aggregate([

          {
            $match: {

              ...baseMatch,

              paymentCategory:
                'Registration',

            },

          },

          {
            $addFields: {

              revenueYear: {

                $year: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

              revenueMonth: {

                $month: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

            },

          },

          {
            $match:
              dateMatch,
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
        registrationResult[0]?.revenue || 0


      // ======================================
      // COURSE FEE REVENUE
      // ======================================

      const courseFeeResult =
        await Payment.aggregate([

          {
            $match: {

              ...baseMatch,

              paymentCategory:
                'CourseFee',

            },

          },

          {
            $addFields: {

              revenueYear: {

                $year: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

              revenueMonth: {

                $month: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

            },

          },

          {
            $match:
              dateMatch,
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
        courseFeeResult[0]?.revenue || 0


      // ======================================
      // ONLINE REVENUE
      // ======================================

      const onlineRevenueResult =
        await Payment.aggregate([

          {
            $match: {

              ...baseMatch,

              paymentMode:
                'Online',

            },

          },

          {
            $addFields: {

              revenueYear: {

                $year: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

              revenueMonth: {

                $month: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

            },

          },

          {
            $match:
              dateMatch,
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
        onlineRevenueResult[0]?.revenue || 0


      // ======================================
      // OFFLINE REVENUE
      // ======================================

      const offlineRevenueResult =
        await Payment.aggregate([

          {
            $match: {

              ...baseMatch,

              paymentMode:
                'Offline',

            },

          },

          {
            $addFields: {

              revenueYear: {

                $year: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

              revenueMonth: {

                $month: {

                  date:
                    '$createdAt',

                  timezone:
                    'Asia/Kolkata',

                },

              },

            },

          },

          {
            $match:
              dateMatch,
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
        offlineRevenueResult[0]?.revenue || 0


      // ======================================
      // TODAY REVENUE
      // ======================================
      //
      // Only show today's revenue when the
      // selected period contains today.
      //
      // Otherwise:
      // 0
      //
      // ======================================

      let todayRevenue = 0

      let todayPayments = 0


      if (

        selectedYear ===
          currentYear

        &&

        (

          selectedMonth === null

          ||

          selectedMonth ===
            currentMonth

        )

      ) {

        const todayRevenueResult =
          await Payment.aggregate([

            {
              $match:
                baseMatch,
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


        todayRevenue =
          todayRevenueResult[0]?.revenue || 0


        todayPayments =
          todayRevenueResult[0]?.payments || 0

      }


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        filters: {

          year:
            selectedYear,

          month:
            selectedMonth,

        },

        revenue: {

          totalRevenue,

          todayRevenue,

          monthlyRevenue:
            totalRevenue,

          totalPayments,

          todayPayments,

          monthlyPayments:
            totalPayments,

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


// ============================================================
// GET REVENUE REPORT
// ============================================================
//
// Supported:
//
// /payments/revenue-report
//
// /payments/revenue-report?year=2026
//
// Returns:
//
// dailyRevenue
// monthlyRevenue
//
// ============================================================

router.get(
  '/payments/revenue-report',
  async (req, res) => {

    try {

      // ======================================
      // CURRENT INDIA DATE
      // ======================================

      const todayIST =
        new Date()
          .toLocaleDateString(
            'en-CA',
            {
              timeZone:
                'Asia/Kolkata',
            }
          )


      const currentYear =
        Number(
          todayIST.substring(
            0,
            4
          )
        )


      // ======================================
      // SELECTED YEAR
      // ======================================

      const selectedYear =
        req.query.year
          ? Number(
              req.query.year
            )
          : currentYear


      // ======================================
      // VALIDATE YEAR
      // ======================================

      if (

        !Number.isInteger(
          selectedYear
        )

        ||

        selectedYear < 2000

        ||

        selectedYear > 2100

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid year.',

        })

      }


      // ======================================
      // DAILY REVENUE
      // ======================================
      //
      // Example:
      //
      // 2026
      //   August
      //     13 -> ₹5000
      //     14 -> ₹3000
      //
      // ======================================

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
            $match: {

              '_id.year':
                selectedYear,

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


      // ======================================
      // MONTHLY REVENUE
      // ======================================
      //
      // Example:
      //
      // January  -> ₹20,000
      // February -> ₹35,000
      // March    -> ₹10,000
      //
      // ======================================

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
            $match: {

              '_id.year':
                selectedYear,

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


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        year:
          selectedYear,

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
// EXPORT ROUTER
// ======================================

module.exports =
  router