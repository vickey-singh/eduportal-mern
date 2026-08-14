const express = require('express')

const router = express.Router()

const FacultyAttendance =
  require('../models/FacultyAttendance')

const teacherAuth =
  require('../middleware/teacherAuth')


// ======================================
// GET DAILY ATTENDANCE
// ======================================
//
// GET
// /api/teacher/attendance/daily
//
// Logged-in teacher ka hi attendance.
// ======================================

router.get(

  '/teacher/attendance/daily',

  teacherAuth,

  async (req, res) => {

    try {

      const records =
        await FacultyAttendance.find({

          facultyId:
            req.teacher.id,

        })

        .sort({

          date: -1,

        })


      return res.status(200).json({

        success: true,

        records,

      })

    }

    catch (error) {

      console.log(

        'Teacher Daily Attendance Error:',

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
// GET MONTHLY ATTENDANCE
// ======================================
//
// GET
// /api/teacher/attendance/monthly
//
// ?year=2026&month=8
// ======================================

router.get(

  '/teacher/attendance/monthly',

  teacherAuth,

  async (req, res) => {

    try {

      const {
        year,
        month,
      } = req.query


      if (
        !year ||
        !month
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Year and month are required.',

        })

      }


      const startDate =
        `${year}-${String(month).padStart(2, '0')}-01`


      const lastDay =
        new Date(

          Number(year),

          Number(month),

          0

        ).getDate()


      const endDate =
        `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`


      const records =
        await FacultyAttendance.find({

          facultyId:
            req.teacher.id,

          date: {

            $gte:
              startDate,

            $lte:
              endDate,

          },

        })

        .sort({

          date: 1,

        })


      // ==================================
      // CALCULATE SUMMARY
      // ==================================

      const present =
        records.filter(

          (item) =>
            item.status === 'Present'

        ).length


      const absent =
        records.filter(

          (item) =>
            item.status === 'Absent'

        ).length


      const total =
        present + absent


      const percentage =

        total > 0

          ? (
              present /
              total
            ) * 100

          : 0


      return res.status(200).json({

        success: true,

        year:
          Number(year),

        month:
          Number(month),

        summary: {

          present,

          absent,

          total,

          percentage:
            Number(
              percentage.toFixed(2)
            ),

        },

        records,

      })

    }

    catch (error) {

      console.log(

        'Teacher Monthly Attendance Error:',

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
// GET YEARLY ATTENDANCE
// ======================================
//
// GET
// /api/teacher/attendance/yearly
//
// ?year=2026
// ======================================

router.get(

  '/teacher/attendance/yearly',

  teacherAuth,

  async (req, res) => {

    try {

      const {
        year,
      } = req.query


      if (!year) {

        return res.status(400).json({

          success: false,

          message:
            'Year is required.',

        })

      }


      const startDate =
        `${year}-01-01`


      const endDate =
        `${year}-12-31`


      const records =
        await FacultyAttendance.find({

          facultyId:
            req.teacher.id,

          date: {

            $gte:
              startDate,

            $lte:
              endDate,

          },

        })

        .sort({

          date: 1,

        })


      // ==================================
      // CALCULATE SUMMARY
      // ==================================

      const present =
        records.filter(

          (item) =>
            item.status === 'Present'

        ).length


      const absent =
        records.filter(

          (item) =>
            item.status === 'Absent'

        ).length


      const total =
        present + absent


      const percentage =

        total > 0

          ? (
              present /
              total
            ) * 100

          : 0


      return res.status(200).json({

        success: true,

        year:
          Number(year),

        summary: {

          present,

          absent,

          total,

          percentage:
            Number(
              percentage.toFixed(2)
            ),

        },

        records,

      })

    }

    catch (error) {

      console.log(

        'Teacher Yearly Attendance Error:',

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