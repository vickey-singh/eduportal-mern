const express = require('express')

const router = express.Router()


// ======================================
// MODEL
// ======================================

const Student =
  require('../models/Student')


// ======================================
// STUDENT AUTH
// ======================================

const studentAuth =
  require('../middleware/studentAuth')


// ======================================
// GET STUDENT PROFILE
// ======================================
//
// GET /api/student/profile
//
// Logged-in student ka profile
// JWT se automatically identify hoga.
// ======================================

router.get(

  '/student/profile',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // FIND LOGGED-IN STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        ).select('-__v')


      // ==================================
      // STUDENT NOT FOUND
      // ==================================

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // SUCCESS
      // ==================================

      return res.status(200).json({

        success: true,

        student,

      })

    }

    catch (error) {

      console.log(

        'Student Profile Error:',

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