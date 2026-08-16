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

        faculty.salaryRecords.push({

          month,

          year,

          amount:
            Number(
              faculty.monthlySalary
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


        await faculty.save()


        currentRecord =
          faculty.salaryRecords[
            faculty.salaryRecords.length - 1
          ]

      }


      // ==================================
      // TOTAL CALCULATION
      // ==================================

      let totalPaid = 0

      let totalDue = 0


      faculty.salaryRecords.forEach(

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
      // MARK PAID
      // ==================================

      salaryRecord.status =
        'Paid'


      salaryRecord.paymentDate =
        paymentDate
          ? new Date(
              paymentDate
            )
          : new Date()


      salaryRecord.paymentMethod =
        paymentMethod ||
        ''


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


      salaryRecord.status =
        'Due'


      salaryRecord.paymentDate =
        null


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