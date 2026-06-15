const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Student =
  require('../models/Student')


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

        admissionNumber,

        course,

        totalFees,

        paidFees,

        contact,

        email,

        admissionDate,

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
      // FEES CALCULATION
      // ======================================

      const remainingFees =
        totalFees - paidFees

      // ======================================
      // FEES STATUS
      // ======================================

      let feesStatus =
        'Pending'

      if (remainingFees === 0) {

        feesStatus = 'Paid'

      }

      else if (

        paidFees > 0 &&

        remainingFees > 0

      ) {

        feesStatus = 'Partial'

      }

      // ======================================
      // CREATE STUDENT
      // ======================================

      const newStudent =
        new Student({

          name,

          admissionNumber,

          course,

          totalFees,

          paidFees,

          remainingFees,

          feesStatus,

          contact,

          email,

          admissionDate,

          dueDate,

          image,

          paymentHistory:

            Number(paidFees) > 0
          
              ? [
          
                  {
          
                    amount: paidFees,
          
                    paymentMethod:
                      'Admission Payment',
          
                    paymentDate:
                      admissionDate,
          
                  },
          
                ]
          
              : [],

        })

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

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

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

      res.status(200).json(
        students
      )

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

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

      await Student.findByIdAndDelete(
        req.params.id
      )

      res.status(200).json({

        success: true,

        message:
          'Student Deleted Successfully',

      })

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

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

        admissionNumber,

        course,

        totalFees,

        paidFees,

        contact,

        email,

        admissionDate,

        dueDate,

      } = req.body

      // ======================================
      // EXISTING STUDENT
      // ======================================

      const existingStudent =
        await Student.findById(
          req.params.id
        )

      // ======================================
      // IMAGE UPDATE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : existingStudent.image

      // ======================================
      // FEES CALCULATION
      // ======================================

      const remainingFees =
        totalFees - paidFees

      // ======================================
      // FEES STATUS
      // ======================================

      let feesStatus =
        'Pending'

      if (remainingFees === 0) {

        feesStatus = 'Paid'

      }

      else if (

        paidFees > 0 &&

        remainingFees > 0

      ) {

        feesStatus = 'Partial'

      }

      // ======================================
      // UPDATE STUDENT
      // ======================================

      const updatedStudent =
        await Student.findByIdAndUpdate(

          req.params.id,

          {

            name,

            admissionNumber,

            course,

            totalFees,

            paidFees,

            remainingFees,

            feesStatus,

            contact,

            email,

            admissionDate,

            dueDate,

            image,

          },

          {
            new: true,
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

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

      })

    }

  }

)


// ======================================
// ADD PAYMENT
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
      // ADD PAYMENT HISTORY
      // ======================================

      student.paymentHistory.push({

        amount,

        paymentMethod,

        paymentDate,

      })

      // ======================================
      // UPDATE PAID FEES
      // ======================================

      student.paidFees =

        Number(student.paidFees)

        +

        Number(amount)

      // ======================================
      // UPDATE REMAINING FEES
      // ======================================

      student.remainingFees =

        Number(student.totalFees)

        -

        Number(student.paidFees)

      // ======================================
      // UPDATE FEES STATUS
      // ======================================

      if (

        student.remainingFees <= 0

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
      // SAVE STUDENT
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

    } catch (error) {

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