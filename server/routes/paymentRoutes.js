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
// General offline/manual payment.
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
//
// NEW ONLINE ADMISSION
//
// POST
// /api/payments/create-order
//
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
//
// NEW ONLINE ADMISSION
//
// POST
// /api/payments/verify
//
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


      if (
        existingPayment
      ) {

        return res.status(400).json({

          success: false,

          message:
            'This payment has already been processed.',

        })

      }


      // ==================================
      // INPUT DATA
      // ==================================

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


      // ==================================
      // BASIC STUDENT VALIDATION
      // ==================================

      if (
        !studentName
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student name is required.',

        })

      }


      if (
        !studentPhone
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Mobile number is required.',

        })

      }


      if (
        !req.body.course
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course is required for online admission.',

        })

      }


      // ==================================
      // CHECK EXISTING STUDENT
      // ==================================
      //
      // Email optional hai.
      // Isliye email blank ho to
      // email condition query mein nahi jayegi.
      //
      // ==================================

      const existingConditions = [

        {
          contact:
            studentPhone,
        },

      ]


      if (
        studentEmail
      ) {

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


      // ==================================
      // ADMISSION NUMBER
      // ======================================
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


      // ==================================
      // DATE
      // ==================================

      const today =
        new Date()


      const admissionDate =
        today
          .toISOString()
          .split('T')[0]


      // ==================================
      // ACADEMIC SESSION
      // ==================================
      //
      // March to March
      //
      // March 2026 - February 2027
      // => 2026-2027
      //
      // January / February 2027
      // => 2026-2027
      //
      // March 2027
      // => 2027-2028
      //
      // ==================================

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


      // ==================================
      // IMAGE
      // ==================================

      const image =
        req.file
          ? req.file.path
          : ''


      // ==================================
      // CREATE STUDENT
      // ==================================

      const student =
        new Student({

          // ==================================
          // BASIC
          // ==================================

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

          // ==================================
          // STUDENT STATUS
          // ==================================

          studentStatus:
            'Active',

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


          // ==================================
          // PAYMENT PLAN
          // ==================================

          paymentPlan:
            '',


          // ==================================
          // DUE DATE
          // ==================================

          dueDate:
            '',


          // ==================================
          // PAYMENT MODE
          // ==================================

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
      // ADMIN / TEACHER EMAIL
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


      // ==================================
      // VALIDATION
      // ==================================

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


      // ==================================
      // FIND STUDENT
      // ==================================

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


      // ==================================
      // RESPONSE
      // ==================================

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
      // ==================================

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


      // ==================================
      // CANNOT EXCEED REMAINING
      // ==================================

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
      // ======================================

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
      // ONLINE PAYMENT
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


// ======================================
// GET PAYMENT REVENUE
// ======================================

router.get(
  '/payments/revenue',
  async (req, res) => {

    try {

      // ==================================
      // TOTAL REVENUE
      // ==================================

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
                $sum: '$amountPaid',
              },

              totalPayments: {
                $sum: 1,
              },

            },

          },

        ])


      const totalRevenue =
        totalRevenueResult[0]?.totalRevenue || 0


      const totalPayments =
        totalRevenueResult[0]?.totalPayments || 0


      // ==================================
      // TODAY REVENUE
      // ==================================

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
                $sum: '$amountPaid',
              },

              payments: {
                $sum: 1,
              },

            },

          },

        ])


      const todayRevenue =
        todayRevenueResult[0]?.revenue || 0


      const todayPayments =
        todayRevenueResult[0]?.payments || 0


      // ==================================
      // THIS MONTH REVENUE
      // ==================================

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
                $sum: '$amountPaid',
              },

              payments: {
                $sum: 1,
              },

            },

          },

        ])


      const monthlyRevenue =
        monthRevenueResult[0]?.revenue || 0


      const monthlyPayments =
        monthRevenueResult[0]?.payments || 0


      // ==================================
      // REGISTRATION REVENUE
      // ==================================

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
                $sum: '$amountPaid',
              },

            },

          },

        ])


      const registrationRevenue =
        registrationResult[0]?.revenue || 0


      // ==================================
      // COURSE FEE REVENUE
      // ==================================

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
                $sum: '$amountPaid',
              },

            },

          },

        ])


      const courseFeeRevenue =
        courseFeeResult[0]?.revenue || 0


      // ==================================
      // ONLINE REVENUE
      // ==================================

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
                $sum: '$amountPaid',
              },

            },

          },

        ])


      const onlineRevenue =
        onlineRevenueResult[0]?.revenue || 0


      // ==================================
      // OFFLINE REVENUE
      // ==================================

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
                $sum: '$amountPaid',
              },

            },

          },

        ])


      const offlineRevenue =
        offlineRevenueResult[0]?.revenue || 0


      // ==================================
      // RESPONSE
      // ==================================

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

      // ==================================
      // DAILY REVENUE
      // ==================================

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
                $sum: '$amountPaid',
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


      // ==================================
      // MONTHLY REVENUE
      // ==================================

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
                $sum: '$amountPaid',
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


      // ==================================
      // RESPONSE
      // ==================================

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
// EXPORT ROUTER
// ======================================

module.exports =
  router