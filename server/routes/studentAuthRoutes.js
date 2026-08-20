const express = require('express')

const router = express.Router()

const jwt =
  require('jsonwebtoken')

const Student =
  require('../models/Student')


// ======================================
// HELPER
// CONVERT DOB TO DDMMYYYY
// ======================================

const normalizeDOB =
  (dob) => {

    // ==================================
    // EMPTY DOB
    // ==================================

    if (!dob) {

      return ''

    }


    // ==================================
    // MONGOOSE / JAVASCRIPT DATE OBJECT
    // ==================================

    if (
      dob instanceof Date
    ) {

      if (
        Number.isNaN(
          dob.getTime()
        )
      ) {

        return ''

      }


      const day =
        String(
          dob.getUTCDate()
        ).padStart(
          2,
          '0'
        )


      const month =
        String(
          dob.getUTCMonth() + 1
        ).padStart(
          2,
          '0'
        )


      const year =
        dob.getUTCFullYear()


      return (
        `${day}${month}${year}`
      )

    }


    // ==================================
    // STRING VALUE
    // ==================================

    const value =
      String(
        dob
      ).trim()


    // ==================================
    // ALREADY DDMMYYYY
    // ==================================

    if (
      /^\d{8}$/.test(
        value
      )
    ) {

      return value

    }


    // ==================================
    // DD/MM/YYYY
    // ==================================

    if (
      /^\d{2}\/\d{2}\/\d{4}$/.test(
        value
      )
    ) {

      const [

        day,

        month,

        year,

      ] =
        value.split('/')


      return (
        `${day}${month}${year}`
      )

    }


    // ==================================
    // DD-MM-YYYY
    // ==================================

    if (
      /^\d{2}-\d{2}-\d{4}$/.test(
        value
      )
    ) {

      const [

        day,

        month,

        year,

      ] =
        value.split('-')


      return (
        `${day}${month}${year}`
      )

    }


    // ==================================
    // YYYY-MM-DD
    // ==================================

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        value
      )
    ) {

      const [

        year,

        month,

        day,

      ] =
        value.split('-')


      return (
        `${day}${month}${year}`
      )

    }


    // ==================================
    // ISO DATE STRING
    // ==================================

    if (
      /^\d{4}-\d{2}-\d{2}T/.test(
        value
      )
    ) {

      const [

        datePart,

      ] =
        value.split('T')


      const [

        year,

        month,

        day,

      ] =
        datePart.split('-')


      if (
        year &&
        month &&
        day
      ) {

        return (
          `${day}${month}${year}`
        )

      }

    }


    // ==================================
    // FALLBACK
    // ==================================

    const digits =
      value.replace(
        /[^0-9]/g,
        ''
      )


    // ==================================
    // DDMMYYYY
    // ==================================

    if (
      digits.length === 8
    ) {

      return digits

    }


    return ''

  }


// ======================================
// STUDENT LOGIN
// ======================================
//
// Student ID:
// Admission Number
//
// Password:
// DOB → DDMMYYYY
//
// Example:
//
// Admission Number:
// PIE0001
//
// DOB:
// 16/01/2001
//
// Password:
// 16012001
//
// ======================================

router.post(

  '/student/login',

  async (req, res) => {

    try {

      // ==================================
      // REQUEST DATA
      // ==================================

      const {

        studentId,

        password,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !studentId ||
        !password
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student ID and password are required.',

        })

      }


      // ==================================
      // CLEAN INPUT
      // ==================================

      const admissionNumber =
        String(
          studentId
        )
          .trim()


      const enteredPassword =
        String(
          password
        )
          .trim()


      // ==================================
      // FIND STUDENT
      // ======================================

      const student =
        await Student.findOne({

          admissionNumber:
            admissionNumber,

        })


      // ==================================
      // STUDENT NOT FOUND
      // ==================================

      if (!student) {

        return res.status(401).json({

          success: false,

          message:
            'Invalid Student ID or password.',

        })

      }


      // ==================================
      // GET DOB PASSWORD
      // ==================================

      const studentDOB =
        normalizeDOB(
          student.dob
        )


      // ==================================
      // DEBUG
      // ==================================

      console.log(
        '======================================'
      )

      console.log(
        'STUDENT LOGIN DEBUG'
      )

      console.log(
        'Student ID:',
        admissionNumber
      )

      console.log(
        'Student Found:',
        !!student
      )

      console.log(
        'Admission Number:',
        student.admissionNumber
      )

      console.log(
        'DOB:',
        student.dob
      )

      console.log(
        'DOB Password:',
        studentDOB
      )

      console.log(
        'Entered Password:',
        enteredPassword
      )

      console.log(
        '======================================'
      )


      // ==================================
      // DOB NOT AVAILABLE
      // ==================================

      if (!studentDOB) {

        return res.status(400).json({

          success: false,

          message:
            'Student DOB is not available. Please contact Admin.',

        })

      }


      // ==================================
      // PASSWORD CHECK
      // ==================================

      if (
        studentDOB !==
        enteredPassword
      ) {

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
      // SUCCESS
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Login Successful',

        token,

        student,

      })

    }

    catch (error) {

      console.log(
        'Student Login Error:',
        error
      )


      return res.status(500).json({

        success: false,

        message:
          'Server Error',

        error:
          error.message,

      })

    }

  }

)


// ======================================
// EXPORT
// ======================================

module.exports =
  router