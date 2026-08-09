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
// ADD PAYMENT
// ======================================

router.post(
  '/payments',
  async (req, res) => {

    try {

      const payment =
        new Payment(
          req.body
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
// CREATE RAZORPAY ORDER
// ======================================

router.post(
  '/payments/create-order',
  async (req, res) => {

    try {

      const {
        amount,
      } = req.body


      if (
        !amount ||
        Number(amount) <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid payment amount',

        })

      }


      const options = {

        amount:
          Number(amount) * 100,

        currency:
          'INR',

        receipt:
          `receipt_${Date.now()}`,

      }


      const order =
        await razorpay.orders.create(
          options
        )


      res.status(200).json({

        success: true,

        order,

      })

    }

    catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message:
          'Unable to create Razorpay order',

      })

    }

  }
)


// ======================================
// VERIFY REGISTRATION PAYMENT
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


      // ======================================
      // VERIFY REQUIRED RAZORPAY DATA
      // ======================================

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


      // ======================================
      // VERIFY SIGNATURE
      // ======================================

      const body =
        razorpay_order_id +
        '|' +
        razorpay_payment_id


      const expectedSignature =
        crypto
          .createHmac(
            'sha256',
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(body)
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


      // ======================================
      // CHECK EXISTING STUDENT
      // ======================================

      const existingStudent =
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


      if (existingStudent) {

        return res.status(400).json({

          success: false,

          message:
            'Student Already Exists',

        })

      }


      // ======================================
      // FIND COURSE
      // ======================================

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


      // ======================================
      // COURSE FEES
      // ======================================

      const totalFee =
        Number(
          course.totalFee || 0
        )


      const registrationFee =
        Number(
          course.registrationFee || 0
        )


      // ======================================
      // REGISTRATION PAYMENT
      // ======================================

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
            'Registration Fee is not available for this course.',

        })

      }


      if (
        amountPaid !==
        registrationFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration Fee must be paid in full.',

        })

      }


      // ======================================
      // GENERATE ADMISSION NUMBER
      // ======================================

      const lastStudent =
        await Student.findOne()
          .sort({
            createdAt: -1,
          })


      let admissionNumber


      if (!lastStudent) {

        admissionNumber =
          'ADM0001'

      }

      else {

        const lastNumber =
          parseInt(

            (
              lastStudent.admissionNumber ||
              'ADM0000'
            )
              .replace(
                'ADM',
                ''
              )

          )


        admissionNumber =
          `ADM${String(
            lastNumber + 1
          ).padStart(
            4,
            '0'
          )}`

      }


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
          ? `/uploads/${req.file.filename}`
          : ''


      // ======================================
      // CREATE STUDENT
      // ======================================

      const student =
        new Student({

          // ==================================
          // BASIC INFO
          // ==================================

          name:
            req.body.studentName,

          dob:
            req.body.dob || '',

          aadharNumber:
            req.body.aadharNumber || '',

          admissionNumber,

          course:
            course.courseName,

          batchTime:
            req.body.batchTime || '',

          contact:
            req.body.phone,

          email:
            req.body.email,

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
          // STUDENT-SPECIFIC FEE OPTIONS
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
              course.fullPaymentFee || 0
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


      // ======================================
      // SAVE STUDENT
      // ======================================

      await student.save()


      // ======================================
      // SAVE RECEIPT
      // ======================================

      const receipt =
        await saveReceipt({

          student,

          amountPaid,

          paymentType:
            'Full',

          transactionId:
            razorpay_payment_id,

          orderId:
            razorpay_order_id,

        })


      // ======================================
      // SAVE PAYMENT
      // ======================================

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

          minimumInstallment:
            student.monthlyInstallment,

          paymentType:
            'Full',

          amountPaid,

          paymentMethod:
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
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Registration Payment Verified Successfully',

        payment,

        student,

        receiptNumber:
          receipt.receiptNumber,

      })


      // ======================================
      // EMAILS
      // ======================================

      sendAdmissionEmail({

        student,

        receipt,

        amountPaid,

        transactionId:
          razorpay_payment_id,

      }).catch((err) => {

        console.error(
          'Student Email:',
          err
        )

      })


      sendAdminNotification({

        student,

        receipt,

        amountPaid,

        transactionId:
          razorpay_payment_id,

      }).catch((err) => {

        console.error(
          'Admin Email:',
          err
        )

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


      const student =
        await Student.findOne({

          admissionNumber,

          name,

          contact:
            phone,

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


      const student =
        await Student.findOne({

          $or: [

            {
              email,
            },

            {
              contact:
                phone,
            },

          ],

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
// EXISTING STUDENT PAYMENT
// ======================================

router.post(
  '/students/pay',
  async (req, res) => {

    try {

      const {

        admissionNumber,

        amountPaid,

        paymentPlan,

      } = req.body


      // ======================================
      // FIND STUDENT
      // ======================================

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


      // ======================================
      // COURSE COMPLETED
      // ======================================

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


      // ======================================
      // SELECT / LOCK PLAN
      // ======================================

      let selectedPlan =
        student.paymentPlan || ''


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


      // ======================================
      // PLAN LOCK
      // ======================================

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


      // ======================================
      // STUDENT-SPECIFIC MINIMUM
      // ======================================

      let minimumAmount = 0


      switch (
        selectedPlan
      ) {

        case 'monthly':

          minimumAmount =
            Number(
              student.monthlyInstallment ||
              0
            )

          break


        case 'three_month':

          minimumAmount =
            Number(
              student.threeMonthInstallment ||
              0
            )

          break


        case 'six_month':

          minimumAmount =
            Number(
              student.sixMonthInstallment ||
              0
            )

          break


        case 'full':

          minimumAmount =
            Number(
              student.fullPaymentFee ||
              0
            )

          break

      }


      // ======================================
      // PAYMENT AMOUNT
      // ======================================

      const amount =
        Number(
          amountPaid
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


      // ======================================
      // REMAINING FEE
      // ======================================

      const remaining =
        Number(
          student.remainingFees
        )


      // ======================================
      // CANNOT EXCEED REMAINING
      // ======================================

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


      // ======================================
      // FULL PAYMENT
      // ======================================

      if (
        selectedPlan === 'full'
      ) {

        /*
         * Full payment uses the discounted
         * full-payment amount, but if the
         * remaining fee is lower, the student
         * only pays the remaining amount.
         */

        const fullPaymentAmount =
          Math.min(
            Number(
              student.fullPaymentFee || 0
            ),
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


      // ======================================
      // INSTALLMENT
      // ======================================

      else {

        const requiredMinimum =
          Math.min(
            minimumAmount,
            remaining
          )


        if (
          requiredMinimum > 0 &&
          amount <
            requiredMinimum
        ) {

          return res.status(400).json({

            success: false,

            message:

              `Minimum payment for this plan is ₹${requiredMinimum}.`,

          })

        }

      }


      // ======================================
      // DATE
      // ======================================

      const today =
        new Date()


      const paymentDate =
        today
          .toISOString()
          .split('T')[0]


      // ======================================
      // UPDATE STUDENT
      // ======================================

      student.paidFees =

        Number(
          student.paidFees || 0
        ) +

        amount


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


      // ======================================
      // STATUS
      // ======================================

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


      // ======================================
      // LOCK PAYMENT PLAN
      // ======================================

      student.paymentPlan =
        selectedPlan


      // ======================================
      // PAYMENT HISTORY
      // ======================================

      student.paymentHistory.push({

        amount,

        paymentCategory:
          'CourseFee',

        paymentMethod:
          'Online',

        paymentType:
          selectedPlan === 'full'
            ? 'Full'
            : 'Installment',

        paymentPlan:
          selectedPlan,

        paymentMode:
          'Online',

        paymentStatus:
          'Success',

        transactionId:
          req.body.transactionId || '',

        orderId:
          req.body.orderId || '',

        paymentDate,

      })


      // ======================================
      // SAVE
      // ======================================

      await student.save()


      // ======================================
      // RECEIPT
      // ======================================

      const receipt =
        await saveReceipt({

          student,

          amountPaid:
            amount,

          paymentType:
            selectedPlan === 'full'
              ? 'Full'
              : 'Installment',

          transactionId:
            req.body.transactionId || '',

          orderId:
            req.body.orderId || '',

        })


      // ======================================
      // PAYMENT RECORD
      // ======================================

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

          minimumInstallment:
            minimumAmount,

          paymentType:
            selectedPlan === 'full'
              ? 'Full'
              : 'Installment',

          amountPaid:
            amount,

          paymentMethod:
            'Online',

          paymentStatus:
            'Success',

          transactionId:
            req.body.transactionId || '',

          razorpayOrderId:
            req.body.orderId || '',

          razorpayPaymentId:
            req.body.transactionId || '',

        })


      await payment.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

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

      console.log(error)

      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


module.exports = router