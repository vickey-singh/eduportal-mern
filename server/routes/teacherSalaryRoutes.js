const express = require('express')

const router = express.Router()

const Faculty =
  require('../models/Faculty')

const teacherAuth =
  require('../middleware/teacherAuth')


// ======================================
// GET LOGGED-IN TEACHER SALARY
// ======================================
//
// GET
// /api/teacher/salary
//
// Authorization:
// Bearer <teacherToken>
//
// ======================================

router.get(

  '/teacher/salary',

  teacherAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET TEACHER ID FROM JWT
      // ==================================

      const teacherId =
        req.teacher?.id ||
        req.teacher?._id ||
        req.teacher?.facultyId


      if (!teacherId) {

        return res.status(401).json({

          success: false,

          message:
            'Teacher identity not found.',

        })

      }


      // ==================================
      // FIND TEACHER
      // ==================================

      const teacher =
        await Faculty.findById(
          teacherId
        ).select(

          'name teacherId monthlySalary salaryRecords'

        )


      if (!teacher) {

        return res.status(404).json({

          success: false,

          message:
            'Teacher profile not found.',

        })

      }


      // ==================================
      // CURRENT MONTH
      // ==================================

      const now =
        new Date()


      const currentMonth =
        now.getMonth() + 1


      const currentYear =
        now.getFullYear()


      // ==================================
      // FIND CURRENT MONTH RECORD
      // ==================================

      let currentRecord =
        teacher.salaryRecords.find(

          (record) => (

            record.month ===
              currentMonth &&

            record.year ===
              currentYear

          )

        )


      // ==================================
      // AUTO CREATE CURRENT MONTH DUE
      // ==================================

      if (

        !currentRecord &&

        Number(
          teacher.monthlySalary || 0
        ) > 0

      ) {

        teacher.salaryRecords.push({

          month:
            currentMonth,

          year:
            currentYear,

          amount:
            Number(
              teacher.monthlySalary
            ),

          status:
            'Due',

          paymentDate:
            null,

          paymentMethod:
            '',

          remarks:
            '',

        })


        await teacher.save()


        currentRecord =
          teacher.salaryRecords[
            teacher.salaryRecords.length - 1
          ]

      }


      // ==================================
      // CALCULATE SUMMARY
      // ==================================

      let totalPaid = 0

      let totalDue = 0


      teacher.salaryRecords.forEach(

        (record) => {

          const amount =
            Number(
              record.amount || 0
            )


          if (
            record.status === 'Paid'
          ) {

            totalPaid +=
              amount

          }

          else {

            totalDue +=
              amount

          }

        }

      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        teacher: {

          name:
            teacher.name,

          teacherId:
            teacher.teacherId,

        },

        salary: {

          monthlySalary:
            Number(
              teacher.monthlySalary || 0
            ),

          currentMonth: {

            month:
              currentMonth,

            year:
              currentYear,

            record:
              currentRecord || null,

          },

          records:
            teacher.salaryRecords,

          summary: {

            totalPaid,

            totalDue,

          },

        },

      })

    }

    catch (error) {

      console.log(

        'Teacher Salary Error:',

        error

      )


      return res.status(500).json({

        success: false,

        message:
          'Unable to load salary information.',

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