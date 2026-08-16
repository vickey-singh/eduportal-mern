const express = require('express')

const router = express.Router()

const Faculty =
  require('../models/Faculty')


// ======================================
// HELPER
// ======================================

// Current month/year

const getCurrentMonthYear = () => {

  const now =
    new Date()

  return {

    month:
      now.getMonth() + 1,

    year:
      now.getFullYear(),

  }

}


// ======================================
// GET FACULTY SALARY
// ======================================
//
// GET
// /api/faculty-salary/:facultyId
//
// ======================================

router.get(

  '/faculty-salary/:facultyId',

  async (req, res) => {

    try {

      const {
        facultyId,
      } = req.params


      const faculty =
        await Faculty.findById(
          facultyId
        )


      if (!faculty) {

        return res.status(404).json({

          success: false,

          message:
            'Faculty not found.',

        })

      }


      // ==================================
      // CURRENT MONTH
      // ==================================

      const {
        month,
        year,
      } =
        getCurrentMonthYear()


      // ==================================
      // CHECK CURRENT MONTH RECORD
      // ==================================

      let currentRecord =
        faculty.salaryRecords.find(

          (record) => (

            record.month === month &&

            record.year === year

          )

        )


      // ==================================
      // AUTO CREATE DUE RECORD
      // ==================================

      if (
        !currentRecord &&
        Number(
          faculty.monthlySalary || 0
        ) > 0
      ) {

        const monthlySalary =
          Number(
            faculty.monthlySalary
          )


        faculty.salaryRecords.push({

          month,

          year,

          // ==============================
          // GROSS SALARY
          // ==============================

          amount:
            monthlySalary,


          // ==============================
          // DEDUCTION
          // ==============================

          deduction:
            0,


          // ==============================
          // DEDUCTION REASON
          // ==============================

          deductionReason:
            '',


          // ==============================
          // NET SALARY
          // ==============================

          netAmount:
            monthlySalary,


          // ==============================
          // STATUS
          // ==============================

          status:
            'Due',


          paymentDate:
            null,


          paymentMethod:
            '',


          remarks:
            '',

        })


        await faculty.save()


        currentRecord =
          faculty.salaryRecords[
            faculty.salaryRecords.length - 1
          ]

      }


      // ==================================
      // BACKWARD COMPATIBILITY
      // ==================================
      //
      // Purane salary records ke liye
      // deduction = 0
      // netAmount = amount
      //
      // ==================================

      faculty.salaryRecords.forEach(

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

            record.deductionReason ===
            undefined ||

            record.deductionReason ===
            null

          ) {

            record.deductionReason =
              ''

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


      // ==================================
      // TOTAL CALCULATION
      // ==================================

      let totalPaid = 0

      let totalDue = 0

      let totalDeduction = 0


      faculty.salaryRecords.forEach(

        (record) => {

          // ==============================
          // GROSS
          // ==============================

          const amount =
            Number(
              record.amount || 0
            )


          // ==============================
          // DEDUCTION
          // ==============================

          const deduction =
            Number(
              record.deduction || 0
            )


          // ==============================
          // NET
          // ==============================

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


          // ==============================
          // TOTAL DEDUCTION
          // ==============================

          totalDeduction +=
            deduction


          // ==============================
          // PAID / DUE
          // ==============================

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


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        faculty: {

          _id:
            faculty._id,

          name:
            faculty.name,

          employeeId:
            faculty.employeeId,

          monthlySalary:
            faculty.monthlySalary,

        },


        currentMonth: {

          month,

          year,

          record:
            currentRecord || null,

        },


        salaryRecords:
          faculty.salaryRecords,


        summary: {

          totalPaid,

          totalDue,

          totalDeduction,

        },

      })

    }

    catch (error) {

      console.log(

        'Get Faculty Salary Error:',

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
// UPDATE MONTHLY SALARY
// ======================================
//
// PUT
// /api/faculty-salary/:facultyId
//
// Body:
//
// {
//   "monthlySalary": 25000
// }
//
// ======================================

router.put(

  '/faculty-salary/:facultyId',

  async (req, res) => {

    try {

      const {
        facultyId,
      } = req.params


      const {
        monthlySalary,
      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      const salary =
        Number(
          monthlySalary
        )


      if (

        Number.isNaN(
          salary
        ) ||

        salary < 0

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Please enter a valid salary amount.',

        })

      }


      // ==================================
      // FIND FACULTY
      // ==================================

      const faculty =
        await Faculty.findById(
          facultyId
        )


      if (!faculty) {

        return res.status(404).json({

          success: false,

          message:
            'Faculty not found.',

        })

      }


      // ==================================
      // UPDATE MONTHLY SALARY
      // ==================================

      faculty.monthlySalary =
        salary


      // ==================================
      // CURRENT MONTH
      // ==================================

      const {
        month,
        year,
      } =
        getCurrentMonthYear()


      // ==================================
      // CHECK CURRENT MONTH RECORD
      // ==================================

      const existingRecord =
        faculty.salaryRecords.find(

          (record) => (

            record.month === month &&

            record.year === year

          )

        )


      // ==================================
      // CREATE CURRENT MONTH RECORD
      // ==================================

      if (!existingRecord) {

        faculty.salaryRecords.push({

          month,

          year,

          amount:
            salary,

          deduction:
            0,

          deductionReason:
            '',

          netAmount:
            salary,

          status:
            'Due',

          paymentDate:
            null,

          paymentMethod:
            '',

          remarks:
            '',

        })

      }


      // ==================================
      // IF CURRENT RECORD IS DUE
      // ==================================
      //
      // Salary update hone par current
      // unpaid record ka gross/net update
      // hoga.
      //
      // Paid record ko touch nahi karenge.
      //
      // ==================================

      else if (

        existingRecord.status ===
        'Due'

      ) {

        existingRecord.amount =
          salary


        existingRecord.netAmount =
          Math.max(

            0,

            salary -

            Number(
              existingRecord.deduction || 0
            )

          )

      }


      // ==================================
      // SAVE
      // ==================================

      await faculty.save()


      return res.status(200).json({

        success: true,

        message:
          'Monthly salary updated successfully.',

        monthlySalary:
          faculty.monthlySalary,

      })

    }

    catch (error) {

      console.log(

        'Update Faculty Salary Error:',

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
// MARK SALARY AS PAID
// ======================================
//
// PUT
// /api/faculty-salary/:facultyId/pay
//
// Body:
//
// {
//   "month": 8,
//   "year": 2026,
//   "basicSalary": 20000,
//   "deductionAmount": 2000,
//   "deductionReason": "3 days absent",
//   "finalSalary": 18000,
//   "paymentDate": "2026-08-16",
//   "paymentMethod": "Cash",
//   "remarks": ""
// }
//
// ======================================

router.put(

  '/faculty-salary/:facultyId/pay',

  async (req, res) => {

    try {

      const {
        facultyId,
      } = req.params


      const {

        month,

        year,

        basicSalary,

        deductionAmount,

        deductionReason,

        finalSalary,

        paymentDate,

        paymentMethod,

        remarks,

      } =
        req.body


      // ==================================
      // VALIDATION
      // ==================================

      const salaryMonth =
        Number(
          month
        )


      const salaryYear =
        Number(
          year
        )


      if (

        !salaryMonth ||

        salaryMonth < 1 ||

        salaryMonth > 12 ||

        !salaryYear

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid salary month or year.',

        })

      }


      // ==================================
      // FIND FACULTY
      // ==================================

      const faculty =
        await Faculty.findById(
          facultyId
        )


      if (!faculty) {

        return res.status(404).json({

          success: false,

          message:
            'Faculty not found.',

        })

      }


      // ==================================
      // FIND SALARY RECORD
      // ==================================

      const salaryRecord =
        faculty.salaryRecords.find(

          (record) => (

            record.month ===
              salaryMonth &&

            record.year ===
              salaryYear

          )

        )


      if (!salaryRecord) {

        return res.status(404).json({

          success: false,

          message:
            'Salary record not found for this month.',

        })

      }


      // ==================================
      // BASIC / GROSS SALARY
      // ==================================

      const grossSalary =
        Number(

          basicSalary !==
            undefined

            ? basicSalary

            : salaryRecord.amount

        )


      if (

        Number.isNaN(
          grossSalary
        ) ||

        grossSalary < 0

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid salary amount.',

        })

      }


      // ==================================
      // DEDUCTION
      // ==================================

      const deduction =
        Number(

          deductionAmount !==
            undefined

            ? deductionAmount

            : 0

        )


      if (

        Number.isNaN(
          deduction
        ) ||

        deduction < 0

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid deduction amount.',

        })

      }


      // ==================================
      // DEDUCTION CANNOT EXCEED SALARY
      // ==================================

      if (
        deduction >
        grossSalary
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Deduction cannot be greater than salary.',

        })

      }


      // ==================================
      // DEDUCTION REASON
      // ==================================

      const reason =
        String(

          deductionReason ||
          ''

        ).trim()


      if (

        deduction > 0 &&

        !reason

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Deduction reason is required.',

        })

      }


      // ==================================
      // CALCULATE NET SALARY
      // ==================================
      //
      // Backend khud calculate karega.
      //
      // Frontend se finalSalary aaye ya
      // na aaye, calculation trusted nahi
      // ki jayegi.
      //
      // ==================================

      const calculatedNetSalary =
        Math.max(

          0,

          grossSalary -
          deduction

        )


      // ==================================
      // OPTIONAL FRONTEND FINAL SALARY
      // ==================================
      //
      // Agar frontend finalSalary bhejta
      // hai to sirf validation ke liye
      // check karenge.
      //
      // Database mein backend calculated
      // value hi save hogi.
      //
      // ==================================

      if (
        finalSalary !==
        undefined
      ) {

        const frontendFinalSalary =
          Number(
            finalSalary
          )


        if (

          Number.isNaN(
            frontendFinalSalary
          ) ||

          frontendFinalSalary !==
            calculatedNetSalary

        ) {

          return res.status(400).json({

            success: false,

            message:
              'Final salary calculation is invalid.',

          })

        }

      }


      // ==================================
      // SAVE GROSS SALARY
      // ==================================

      salaryRecord.amount =
        grossSalary


      // ==================================
      // SAVE DEDUCTION
      // ==================================

      salaryRecord.deduction =
        deduction


      // ==================================
      // SAVE REASON
      // ==================================

      salaryRecord.deductionReason =
        reason


      // ==================================
      // SAVE NET SALARY
      // ==================================

      salaryRecord.netAmount =
        calculatedNetSalary


      // ==================================
      // MARK PAID
      // ==================================

      salaryRecord.status =
        'Paid'


      // ==================================
      // PAYMENT DATE
      // ==================================

      salaryRecord.paymentDate =
        paymentDate

          ? new Date(
              paymentDate
            )

          : new Date()


      // ==================================
      // PAYMENT METHOD
      // ==================================

      salaryRecord.paymentMethod =
        paymentMethod ||
        ''


      // ==================================
      // REMARKS
      // ==================================

      salaryRecord.remarks =
        remarks ||
        ''


      // ==================================
      // SAVE
      // ==================================

      await faculty.save()


      return res.status(200).json({

        success: true,

        message:
          'Salary marked as paid successfully.',

        salaryRecord,

      })

    }

    catch (error) {

      console.log(

        'Pay Faculty Salary Error:',

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
// MARK SALARY AS DUE
// ======================================
//
// PUT
// /api/faculty-salary/:facultyId/due
//
// Body:
//
// {
//   "month": 8,
//   "year": 2026
// }
//
// ======================================

router.put(

  '/faculty-salary/:facultyId/due',

  async (req, res) => {

    try {

      const {
        facultyId,
      } = req.params


      const {

        month,

        year,

      } =
        req.body


      const faculty =
        await Faculty.findById(
          facultyId
        )


      if (!faculty) {

        return res.status(404).json({

          success: false,

          message:
            'Faculty not found.',

        })

      }


      const salaryRecord =
        faculty.salaryRecords.find(

          (record) => (

            record.month ===
              Number(month) &&

            record.year ===
              Number(year)

          )

        )


      if (!salaryRecord) {

        return res.status(404).json({

          success: false,

          message:
            'Salary record not found.',

        })

      }


      // ==================================
      // MARK DUE
      // ==================================

      salaryRecord.status =
        'Due'


      salaryRecord.paymentDate =
        null


      salaryRecord.paymentMethod =
        ''


      // ==================================
      // RESET DEDUCTION
      // ==================================
      //
      // Paid salary ko Due karne par
      // previous payment deduction bhi
      // reset hoga.
      //
      // Dobara Paid karte waqt admin
      // fresh deduction enter karega.
      //
      // ==================================

      salaryRecord.deduction =
        0


      salaryRecord.deductionReason =
        ''


      salaryRecord.netAmount =
        Number(
          salaryRecord.amount || 0
        )


      salaryRecord.remarks =
        ''


      // ==================================
      // SAVE
      // ==================================

      await faculty.save()


      return res.status(200).json({

        success: true,

        message:
          'Salary marked as due.',

        salaryRecord,

      })

    }

    catch (error) {

      console.log(

        'Mark Salary Due Error:',

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