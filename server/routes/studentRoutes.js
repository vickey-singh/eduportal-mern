const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Student =
  require('../models/Student')

const Payment =
  require('../models/Payment')


// ======================================
// HELPER: CALCULATE FEE STATUS
// ======================================

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


  let status =
    'Pending'


  if (
    total > 0 &&
    remaining === 0
  ) {

    status =
      'Paid'

  }

  else if (
    paid > 0 &&
    remaining > 0
  ) {

    status =
      'Partial'

  }


  return {

    remaining,

    status,

  }

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

        // ==================================
        // BASIC
        // ==================================

        name,

        dob,

        aadharNumber,

        admissionNumber,

        course,

        batchTime,

        contact,

        email,

        admissionDate,


        // ==================================
        // PARENTS
        // ==================================

        fatherName,

        motherName,

        fatherOccupation,

        motherOccupation,

        fatherMobile,

        motherMobile,


        // ==================================
        // ADDRESS
        // ==================================

        permanentAddress,

        currentAddress,


        // ==================================
        // EDUCATION
        // ==================================

        schoolCollegeName,


        // ==================================
        // ADMISSION
        // ==================================

        admissionType,


        // ==================================
        // REGISTRATION FEE
        // ==================================

        registrationFee,

        registrationFeePaid,


        // ==================================
        // COURSE FEE
        // ==================================

        totalFees,

        monthlyInstallment,

        threeMonthInstallment,

        sixMonthInstallment,

        fullPaymentFee,

        paidFees,


        // ==================================
        // PAYMENT PLAN
        // ==================================

        paymentPlan,

        dueDate,

      } = req.body


      // ======================================
      // CLOUDINARY IMAGE
      // ======================================

      const image =
        req.file
          ? req.file.path
          : ''


      // ======================================
      // NUMERIC VALUES
      // ======================================

      const totalFee =
        Number(
          totalFees || 0
        )


      const paidFee =
        Number(
          paidFees || 0
        )


      const registration =
        Number(
          registrationFee || 0
        )


      const registrationPaid =
        Number(
          registrationFeePaid || 0
        )


      // ======================================
      // VALIDATION
      // ======================================

      if (
        paidFee < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be negative.',

        })

      }


      if (
        paidFee >
        totalFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be greater than total course fee.',

        })

      }


      if (
        registrationPaid < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration fee paid cannot be negative.',

        })

      }


      if (
        registrationPaid >
        registration
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration fee paid cannot be greater than registration fee.',

        })

      }


      // ======================================
      // COURSE FEE STATUS
      // ======================================

      const {

        remaining,

        status,

      } =
        calculateFeesStatus(

          totalFee,

          paidFee

        )


      // ======================================
      // REGISTRATION STATUS
      // ======================================

      const registrationStatus =

        registrationPaid >=
        registration

          && registration > 0

          ? 'Paid'

          : 'Pending'


      // ======================================
      // CREATE STUDENT
      // ======================================

      const newStudent =
        new Student({

          // ==================================
          // BASIC
          // ==================================

          name:
            name || '',

          dob:
            dob || '',

          aadharNumber:
            aadharNumber || '',

          admissionNumber,

          course,

          batchTime:
            batchTime || '',

          contact,

          email,

          admissionDate,


          // ==================================
          // IMAGE
          // ==================================

          image,


          // ==================================
          // PARENTS
          // ==================================

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


          // ==================================
          // ADDRESS
          // ==================================

          permanentAddress:
            permanentAddress || '',

          currentAddress:
            currentAddress || '',


          // ==================================
          // EDUCATION
          // ==================================

          schoolCollegeName:
            schoolCollegeName || '',


          // ==================================
          // ADMISSION
          // ==================================

          admissionType:
            admissionType || 'Offline',


          // ==================================
          // REGISTRATION FEE
          // ==================================

          registrationFee:
            registration,

          registrationFeePaid:
            registrationPaid,

          registrationFeeStatus:
            registrationStatus,


          // ==================================
          // COURSE FEE
          // ==================================

          totalFees:
            totalFee,

          paidFees:
            paidFee,

          remainingFees:
            remaining,

          feesStatus:
            status,


          // ==================================
          // PAYMENT OPTIONS
          // ==================================

          monthlyInstallment:
            Number(
              monthlyInstallment || 0
            ),

          threeMonthInstallment:
            Number(
              threeMonthInstallment || 0
            ),

          sixMonthInstallment:
            Number(
              sixMonthInstallment || 0
            ),

          fullPaymentFee:
            Number(
              fullPaymentFee || 0
            ),


          // ==================================
          // PAYMENT PLAN
          // ==================================

          paymentPlan:
            paymentPlan || '',


          // ==================================
          // DUE DATE
          // ==================================

          dueDate:
            dueDate || '',


          // ==================================
          // PAYMENT MODE
          // ==================================

          paymentMode:
            'Offline',


          // ==================================
          // PAYMENT HISTORY
          // ==================================

          paymentHistory: [],

        })


      // ======================================
      // OFFLINE INITIAL REGISTRATION PAYMENT
      // ======================================

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

            admissionDate ||

            new Date()
              .toISOString()
              .split('T')[0],

        })

      }


      // ======================================
      // OFFLINE INITIAL COURSE PAYMENT
      // ======================================

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

            paymentPlan === 'full'

              ? 'Full'

              : 'Installment',

          paymentPlan:
            paymentPlan || '',

          paymentMode:
            'Offline',

          paymentStatus:
            'Success',

          transactionId:
            '',

          orderId:
            '',

          paymentDate:

            admissionDate ||

            new Date()
              .toISOString()
              .split('T')[0],

        })

      }


      // ======================================
      // SAVE STUDENT
      // ======================================

      const savedStudent =
        await newStudent.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Student Added Successfully',

        student:
          savedStudent,

      })

    }

    catch (error) {

      console.log(
        'Add Student Error:',
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
// GET ALL STUDENTS
// ======================================

router.get(

  '/students',

  async (req, res) => {

    try {

      const students =
        await Student.find()

          .sort({
            createdAt: -1,
          })


      res.status(200).json(
        students
      )

    }

    catch (error) {

      console.log(
        'Get Students Error:',
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
// DELETE STUDENT
// ======================================

router.delete(

  '/students/:id',

  async (req, res) => {

    try {

      const student =
        await Student.findByIdAndDelete(
          req.params.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }


      res.status(200).json({

        success: true,

        message:
          'Student Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Student Error:',
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
// UPDATE STUDENT
// ======================================

router.put(

  '/students/:id',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        // ==================================
        // BASIC
        // ==================================

        name,

        dob,

        aadharNumber,

        admissionNumber,

        course,

        batchTime,

        contact,

        email,

        admissionDate,


        // ==================================
        // PARENTS
        // ==================================

        fatherName,

        motherName,

        fatherOccupation,

        motherOccupation,

        fatherMobile,

        motherMobile,


        // ==================================
        // ADDRESS
        // ==================================

        permanentAddress,

        currentAddress,


        // ==================================
        // EDUCATION
        // ==================================

        schoolCollegeName,


        // ==================================
        // ADMISSION
        // ==================================

        admissionType,


        // ==================================
        // REGISTRATION
        // ==================================

        registrationFee,

        registrationFeePaid,


        // ==================================
        // COURSE FEE
        // ==================================

        totalFees,

        paidFees,

        monthlyInstallment,

        threeMonthInstallment,

        sixMonthInstallment,

        fullPaymentFee,


        // ==================================
        // PAYMENT PLAN
        // ==================================

        paymentPlan,

        dueDate,

      } = req.body


      // ======================================
      // FIND STUDENT
      // ======================================

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
      // IMAGE
      // ======================================

      const image =
        req.file
          ? req.file.path
          : student.image


      // ======================================
      // FEES
      // ======================================

      const totalFee =
        Number(
          totalFees || 0
        )


      const paidFee =
        Number(
          paidFees || 0
        )


      const registration =
        Number(
          registrationFee || 0
        )


      const registrationPaid =
        Number(
          registrationFeePaid || 0
        )


      // ======================================
      // VALIDATION
      // ======================================

      if (
        paidFee < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be negative.',

        })

      }


      if (
        paidFee >
        totalFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be greater than total course fee.',

        })

      }


      // ======================================
      // FEE STATUS
      // ======================================

      const {

        remaining,

        status,

      } =
        calculateFeesStatus(

          totalFee,

          paidFee

        )


      // ======================================
      // UPDATE STUDENT
      // ======================================

      student.name =
        name || ''

      student.dob =
        dob || ''

      student.aadharNumber =
        aadharNumber || ''

      student.admissionNumber =
        admissionNumber

      student.course =
        course

      student.batchTime =
        batchTime || ''

      student.contact =
        contact

      student.email =
        email

      student.admissionDate =
        admissionDate

      student.image =
        image


      // ======================================
      // PARENTS
      // ======================================

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


      // ======================================
      // ADDRESS
      // ======================================

      student.permanentAddress =
        permanentAddress || ''

      student.currentAddress =
        currentAddress || ''


      // ======================================
      // EDUCATION
      // ======================================

      student.schoolCollegeName =
        schoolCollegeName || ''


      // ======================================
      // ADMISSION
      // ======================================

      student.admissionType =
        admissionType || 'Offline'


      // ======================================
      // REGISTRATION
      // ======================================

      student.registrationFee =
        registration

      student.registrationFeePaid =
        registrationPaid

      student.registrationFeeStatus =

        registrationPaid >=
          registration &&
        registration > 0

          ? 'Paid'

          : 'Pending'


      // ======================================
      // COURSE FEE
      // ======================================

      student.totalFees =
        totalFee

      student.paidFees =
        paidFee

      student.remainingFees =
        remaining

      student.feesStatus =
        status


      // ======================================
      // PAYMENT OPTIONS
      // ======================================

      student.monthlyInstallment =
        Number(
          monthlyInstallment || 0
        )

      student.threeMonthInstallment =
        Number(
          threeMonthInstallment || 0
        )

      student.sixMonthInstallment =
        Number(
          sixMonthInstallment || 0
        )

      student.fullPaymentFee =
        Number(
          fullPaymentFee || 0
        )


      // ======================================
      // PAYMENT PLAN
      // ======================================

      student.paymentPlan =
        paymentPlan || ''


      // ======================================
      // DUE DATE
      // ======================================

      student.dueDate =
        dueDate || ''


      // ======================================
      // SAVE
      // ======================================

      const updatedStudent =
        await student.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

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

      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// ADD OFFLINE COURSE FEE PAYMENT
// ======================================

router.put(

  '/students/add-payment/:id',

  async (req, res) => {

    try {

      const {

        amount,

        paymentMethod,

        paymentDate,

        paymentPlan,

      } = req.body


      // ======================================
      // FIND STUDENT
      // ======================================

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
      // PAYMENT AMOUNT
      // ======================================

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


      // ======================================
      // REMAINING FEE
      // ======================================

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


      // ======================================
      // PAYMENT CANNOT EXCEED REMAINING
      // ======================================

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


      // ======================================
      // PAYMENT PLAN
      // ======================================

      let selectedPlan =
        student.paymentPlan || ''


      // ======================================
      // FIRST PAYMENT PLAN
      // ======================================

      if (!selectedPlan) {

        if (!paymentPlan) {

          return res.status(400).json({

            success: false,

            message:
              'Please select a payment plan.',

          })

        }


        selectedPlan =
          paymentPlan

      }


      // ======================================
      // PREVENT PLAN CHANGE
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
      // PAYMENT MINIMUM
      // ======================================

      let minimumAmount = 0


      switch (
        selectedPlan
      ) {

        case 'monthly':

          minimumAmount =
            Number(
              student.monthlyInstallment || 0
            )

          break


        case 'three_month':

          minimumAmount =
            Number(
              student.threeMonthInstallment || 0
            )

          break


        case 'six_month':

          minimumAmount =
            Number(
              student.sixMonthInstallment || 0
            )

          break


        case 'full':

          minimumAmount =
            remainingFee

          break


        default:

          minimumAmount = 0

      }


      // ======================================
      // PAYABLE MINIMUM
      // ======================================

      const payableMinimum =
        Math.min(
          minimumAmount,
          remainingFee
        )


      // ======================================
      // MINIMUM PAYMENT CHECK
      // ======================================

      if (

        selectedPlan !== 'full' &&

        payableMinimum > 0 &&

        paymentAmount <
          payableMinimum

      ) {

        return res.status(400).json({

          success: false,

          message:
            `Minimum payment for ${selectedPlan} is ₹${payableMinimum}.`,

        })

      }


      // ======================================
      // FULL PAYMENT CHECK
      // ======================================

      if (
        selectedPlan === 'full'
      ) {

        if (
          paymentAmount !==
          remainingFee
        ) {

          return res.status(400).json({

            success: false,

            message:
              `Full payment amount must be ₹${remainingFee}.`,

          })

        }

      }


      // ======================================
      // PAYMENT DATE
      // ======================================

      const finalPaymentDate =
        paymentDate ||

        new Date()
          .toISOString()
          .split('T')[0]


      // ======================================
      // PAYMENT METHOD
      // ======================================

      const finalPaymentMethod =
        paymentMethod ||
        'Cash'


      // ======================================
      // PAYMENT TYPE
      // ======================================

      const paymentType =

        selectedPlan === 'full'

          ? 'Full'

          : 'Installment'


      // ======================================
      // UPDATE STUDENT PAYMENT HISTORY
      // ======================================

      student.paymentHistory.push({

        amount:
          paymentAmount,

        paymentCategory:
          'CourseFee',

        paymentMethod:
          finalPaymentMethod,

        paymentType,

        paymentPlan:
          selectedPlan,

        paymentMode:
          'Offline',

        paymentStatus:
          'Success',

        transactionId:
          '',

        orderId:
          '',

        paymentDate:
          finalPaymentDate,

      })


      // ======================================
      // UPDATE PAID FEES
      // ======================================

      student.paidFees =

        Number(
          student.paidFees || 0
        ) +

        paymentAmount


      // ======================================
      // UPDATE REMAINING
      // ======================================

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
      // UPDATE STATUS
      // ======================================

      if (
        student.remainingFees === 0
      ) {

        student.feesStatus =
          'Paid'

      }

      else if (
        student.paidFees > 0
      ) {

        student.feesStatus =
          'Partial'

      }

      else {

        student.feesStatus =
          'Pending'

      }


      // ======================================
      // PAYMENT MODE
      // ======================================

      student.paymentMode =
        'Offline'


      // ======================================
      // SAVE STUDENT
      // ======================================

      await student.save()


      // ======================================
      // SAVE PAYMENT COLLECTION
      // ======================================
      //
      // This is important because
      // Payment Management and Revenue
      // read from Payment collection.
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

          paymentCategory:
            'CourseFee',

          paymentPlan:
            selectedPlan,

          paymentType,

          amountPaid:
            paymentAmount,

          paymentMethod:
            finalPaymentMethod,

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


      // ======================================
      // SAVE PAYMENT
      // ======================================

      await payment.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Payment Added Successfully',

        student,

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

      console.log(
        'Check Student Error:',
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
// EXPORT ROUTER
// ======================================

module.exports =
  router