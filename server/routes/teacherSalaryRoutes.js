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

        const monthlySalary =
          Number(
            teacher.monthlySalary || 0
          )


        teacher.salaryRecords.push({

          month:
            currentMonth,

          year:
            currentYear,

          // ================================
          // GROSS SALARY
          // ================================

          amount:
            monthlySalary,

          // ================================
          // NO DEDUCTION INITIALLY
          // ================================

          deduction:
            0,

          deductionReason:
            '',

          // ================================
          // NET SALARY
          // ================================

          netAmount:
            monthlySalary,

          // ================================
          // STATUS
          // ================================

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


      // ======================================
      // BACKWARD COMPATIBILITY
      // ======================================
      //
      // Old salary records mein deduction
      // aur netAmount nahi hoga.
      //
      // Un records ke liye:
      //
      // deduction = 0
      // netAmount = amount
      //
      // ======================================

      teacher.salaryRecords.forEach(

        (record) => {

          if (

            record.deduction ===
            undefined ||

            record.deduction ===
            null

          ) {

            record.deduction =
              0

          }


          if (

            record.netAmount ===
            undefined ||

            record.netAmount ===
            null

          ) {

            record.netAmount =
              Math.max(

                0,

                Number(
                  record.amount || 0
                ) -

                Number(
                  record.deduction || 0
                )

              )

          }

        }

      )


      // ======================================
      // CALCULATE SUMMARY
      // ======================================

      let totalPaid = 0

      let totalDue = 0

      let totalDeduction = 0


      teacher.salaryRecords.forEach(

        (record) => {

          // ================================
          // GROSS
          // ================================

          const amount =
            Number(
              record.amount || 0
            )


          // ================================
          // DEDUCTION
          // ================================

          const deduction =
            Number(
              record.deduction || 0
            )


          // ================================
          // NET
          // ================================

          const netAmount =
            Math.max(

              0,

              Number(

                record.netAmount !==
                  undefined &&
                record.netAmount !==
                  null

                  ? record.netAmount

                  : amount -
                    deduction

              )

            )


          // ================================
          // TOTAL DEDUCTION
          // ================================

          totalDeduction +=
            deduction


          // ================================
          // PAID / DUE
          // ================================

          if (
            record.status === 'Paid'
          ) {

            totalPaid +=
              netAmount

          }

          else {

            totalDue +=
              netAmount

          }

        }

      )


      // ======================================
      // RESPONSE
      // ======================================

      return res.status(200).json({

        success: true,

        teacher: {

          name:
            teacher.name,

          teacherId:
            teacher.teacherId,

        },

        salary: {

          // ================================
          // CURRENT MONTHLY SALARY
          // ================================

          monthlySalary:
            Number(
              teacher.monthlySalary || 0
            ),


          // ================================
          // CURRENT MONTH
          // ================================

          currentMonth: {

            month:
              currentMonth,

            year:
              currentYear,

            record:
              currentRecord || null,

          },


          // ================================
          // ALL RECORDS
          // ================================

          records:
            teacher.salaryRecords,


          // ================================
          // SUMMARY
          // ================================

          summary: {

            totalPaid,

            totalDue,

            totalDeduction,

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