const express = require('express')

const router = express.Router()

const jwt = require('jsonwebtoken')

const Student =
  require('../models/Student')


// ======================================
// HELPER
// CONVERT DOB TO DDMMYYYY
// ======================================

const normalizeDOB =
  (dob) => {

    if (!dob) {

      return ''

    }


    const value =
      String(dob)
        .trim()


    // ==================================
    // ALREADY DDMMYYYY
    // ==================================

    if (
      /^\d{8}$/.test(value)
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
    // FALLBACK
    // ==================================

    return (

      value
        .replace(
          /[^0-9]/g,
          ''
        )

    )

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
// ======================================

router.post(

  '/student/login',

  async (req, res) => {

    try {

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
      // ==================================

      const student =
        await Student.findOne({

          admissionNumber,

        })


      if (!student) {

        return res.status(401).json({

          success: false,

          message:
            'Invalid Student ID or password.',

        })

      }


      // ==================================
      // GET STUDENT DOB
      // ==================================

      const studentDOB =
        normalizeDOB(
          student.dob
        )


      // ==================================
      // COMPARE PASSWORD
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

          'Prerna Institute Of Excellence_secret_key',

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

      })

    }

  }

)


// ======================================
// EXPORT
// ======================================

module.exports =
  router