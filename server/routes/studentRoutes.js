const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Student =
  require('../models/Student')


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


  let status = 'Pending'


  if (
    total > 0 &&
    remaining === 0
  ) {

    status = 'Paid'

  }

  else if (
    paid > 0 &&
    remaining > 0
  ) {

    status = 'Partial'

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
      // IMAGE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : ''


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


      // ======================================
      // VALIDATE PAID FEE
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
      // REGISTRATION FEE
      // ======================================

      const registration =
        Number(
          registrationFee || 0
        )


      const registrationPaid =
        Number(
          registrationFeePaid || 0
        )


      if (
        registrationPaid < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration paid amount cannot be negative.',

        })

      }


      if (
        registrationPaid >
        registration
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration paid amount cannot be greater than registration fee.',

        })

      }


      const registrationStatus =
        registration > 0 &&
        registrationPaid >= registration

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

          name,

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
          // PAYMENT PLANS
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
      // OFFLINE INITIAL PAYMENT HISTORY
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

          paymentDate:
            admissionDate ||
            new Date()
              .toISOString()
              .split('T')[0],

        })

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
            paymentPlan === 'full'
              ? 'Full'
              : 'Installment',

          paymentPlan:
            paymentPlan || '',

          paymentMode:
            'Offline',

          paymentStatus:
            'Success',

          paymentDate:
            admissionDate ||
            new Date()
              .toISOString()
              .split('T')[0],

        })

      }


      // ======================================
      // SAVE
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
      // EXISTING STUDENT
      // ======================================

      const existingStudent =
        await Student.findById(
          req.params.id
        )


      if (!existingStudent) {

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
          ? `/uploads/${req.file.filename}`
          : existingStudent.image


      // ======================================
      // TOTAL COURSE FEE
      // ======================================

      const newTotalFees =
        Number(
          totalFees ??
          existingStudent.totalFees ??
          0
        )


      // ======================================
      // PAID COURSE FEE
      // ======================================
      // IMPORTANT:
      //
      // Admin can manually change paidFees.
      // This is required for offline admission
      // and fee correction.
      // ======================================

      const newPaidFees =
        Number(
          paidFees ??
          existingStudent.paidFees ??
          0
        )


      // ======================================
      // VALIDATE PAID FEE
      // ======================================

      if (
        newPaidFees < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be negative.',

        })

      }


      if (
        newPaidFees >
        newTotalFees
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be greater than total course fee.',

        })

      }


      // ======================================
      // COURSE FEE CALCULATION
      // ======================================

      const {
        remaining:
          newRemainingFees,

        status:
          newFeesStatus,

      } =
        calculateFeesStatus(
          newTotalFees,
          newPaidFees
        )


      // ======================================
      // REGISTRATION FEE
      // ======================================

      const newRegistrationFee =
        Number(
          registrationFee ??
          existingStudent.registrationFee ??
          0
        )


      const newRegistrationPaid =
        Number(
          registrationFeePaid ??
          existingStudent.registrationFeePaid ??
          0
        )


      if (
        newRegistrationPaid <
        0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration paid amount cannot be negative.',

        })

      }


      if (
        newRegistrationPaid >
        newRegistrationFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration paid amount cannot be greater than registration fee.',

        })

      }


      const newRegistrationStatus =

        newRegistrationFee > 0 &&

        newRegistrationPaid >=
          newRegistrationFee

          ? 'Paid'

          : 'Pending'


      // ======================================
      // UPDATE STUDENT
      // ======================================

      const updatedStudent =
        await Student.findByIdAndUpdate(

          req.params.id,

          {

            // ==================================
            // BASIC
            // ==================================

            name,

            dob:
              dob ??
              existingStudent.dob,

            aadharNumber:
              aadharNumber ??
              existingStudent.aadharNumber,

            admissionNumber,

            course,

            batchTime:
              batchTime ??
              existingStudent.batchTime,

            contact,

            email,

            admissionDate,

            image,


            // ==================================
            // PARENTS
            // ==================================

            fatherName:
              fatherName ??
              existingStudent.fatherName,

            motherName:
              motherName ??
              existingStudent.motherName,

            fatherOccupation:
              fatherOccupation ??
              existingStudent.fatherOccupation,

            motherOccupation:
              motherOccupation ??
              existingStudent.motherOccupation,

            fatherMobile:
              fatherMobile ??
              existingStudent.fatherMobile,

            motherMobile:
              motherMobile ??
              existingStudent.motherMobile,


            // ==================================
            // ADDRESS
            // ==================================

            permanentAddress:
              permanentAddress ??
              existingStudent.permanentAddress,

            currentAddress:
              currentAddress ??
              existingStudent.currentAddress,


            // ==================================
            // EDUCATION
            // ==================================

            schoolCollegeName:
              schoolCollegeName ??
              existingStudent.schoolCollegeName,


            // ==================================
            // ADMISSION
            // ==================================

            admissionType:
              admissionType ??
              existingStudent.admissionType,


            // ==================================
            // REGISTRATION
            // ==================================

            registrationFee:
              newRegistrationFee,

            registrationFeePaid:
              newRegistrationPaid,

            registrationFeeStatus:
              newRegistrationStatus,


            // ==================================
            // COURSE FEE
            // ==================================

            totalFees:
              newTotalFees,

            paidFees:
              newPaidFees,

            remainingFees:
              newRemainingFees,

            feesStatus:
              newFeesStatus,


            // ==================================
            // PAYMENT PLANS
            // ==================================

            monthlyInstallment:
              Number(
                monthlyInstallment ??
                existingStudent.monthlyInstallment ??
                0
              ),

            threeMonthInstallment:
              Number(
                threeMonthInstallment ??
                existingStudent.threeMonthInstallment ??
                0
              ),

            sixMonthInstallment:
              Number(
                sixMonthInstallment ??
                existingStudent.sixMonthInstallment ??
                0
              ),

            fullPaymentFee:
              Number(
                fullPaymentFee ??
                existingStudent.fullPaymentFee ??
                0
              ),


            // ==================================
            // PAYMENT PLAN
            // ==================================

            paymentPlan:
              paymentPlan ??
              existingStudent.paymentPlan ??
              '',


            // ==================================
            // DUE DATE
            // ==================================

            dueDate:
              dueDate ??
              existingStudent.dueDate,

          },

          {

            new: true,

            runValidators: true,

          }

        )


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
// ADD COURSE FEE PAYMENT
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
      // CANNOT EXCEED REMAINING
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

      let finalPaymentPlan =
        student.paymentPlan || ''


      // ======================================
      // FIRST COURSE PAYMENT
      // ======================================

      if (!finalPaymentPlan) {

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


        finalPaymentPlan =
          paymentPlan


        // ==================================
        // LOCK PLAN
        // ==================================

        student.paymentPlan =
          finalPaymentPlan

      }


      // ======================================
      // PLAN CANNOT CHANGE
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

            `Payment plan is already fixed as ${student.paymentPlan}.`,

        })

      }


      // ======================================
      // MINIMUM PAYMENT
      // ======================================

      let minimumAmount = 0


      switch (
        finalPaymentPlan
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
      // FINAL PAYMENT
      // ======================================
      //
      // If remaining fee is less than the
      // normal installment amount, student
      // can pay only the remaining amount.
      // ======================================

      const payableMinimum =
        Math.min(
          minimumAmount,
          remainingFee
        )


      // ======================================
      // MINIMUM CHECK
      // ======================================

      if (
        finalPaymentPlan !== 'full' &&
        payableMinimum > 0 &&
        paymentAmount <
          payableMinimum
      ) {

        return res.status(400).json({

          success: false,

          message:

            `Minimum payment for ${finalPaymentPlan} is ₹${payableMinimum}.`,

        })

      }


      // ======================================
      // FULL PAYMENT
      // ======================================

      if (
        finalPaymentPlan === 'full'
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
      // PAYMENT HISTORY
      // ======================================

      student.paymentHistory.push({

        amount:
          paymentAmount,

        paymentCategory:
          'CourseFee',

        paymentMethod:
          paymentMethod || 'Cash',

        paymentType:
          finalPaymentPlan === 'full'
            ? 'Full'
            : 'Installment',

        paymentPlan:
          finalPaymentPlan,

        paymentMode:
          'Offline',

        paymentStatus:
          'Success',

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
      // STATUS
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
      // SAVE
      // ======================================

      await student.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Payment Added Successfully',

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


module.exports = router