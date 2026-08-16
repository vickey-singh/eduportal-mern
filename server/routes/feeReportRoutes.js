const express = require('express')

const router = express.Router()

const Student =
  require('../models/Student')


// ======================================
// GET FEE REPORT
// ======================================
//
// GET
// /api/admin/fee-reports
//
// Query:
// ?course=SSC%20CGL
// &status=Due
// &batchTime=Morning
// &paymentPlan=monthly
//
// ======================================

router.get(

  '/admin/fee-reports',

  async (req, res) => {

    try {

      const {

        course,

        status,

        batchTime,

        paymentPlan,

      } = req.query


      // ==================================
      // BUILD FILTER
      // ==================================

      const filter = {}


      // ==================================
      // COURSE FILTER
      // ==================================

      if (

        course &&

        course !== 'All'

      ) {

        filter.course =
          course

      }


      // ==================================
      // BATCH TIME FILTER
      // ==================================

      if (

        batchTime &&

        batchTime !== 'All'

      ) {

        filter.batchTime =
          batchTime

      }


      // ==================================
      // PAYMENT PLAN FILTER
      // ==================================

      if (

        paymentPlan &&

        paymentPlan !== 'All'

      ) {

        filter.paymentPlan =
          paymentPlan

      }


      // ==================================
      // FEE STATUS FILTER
      // ==================================

      if (

        status &&

        status !== 'All'

      ) {


        // ================================
        // DUE STUDENTS
        // ================================

        if (
          status === 'Due'
        ) {

          filter.remainingFees = {

            $gt: 0,

          }

        }


        // ================================
        // PARTIAL PAYMENT
        // ================================

        else if (
          status === 'Partial'
        ) {

          filter.feesStatus =
            'Partial'

        }


        // ================================
        // FULLY PAID
        // ================================

        else if (
          status === 'Paid'
        ) {

          filter.remainingFees = {

            $eq: 0,

          }

        }

      }


      // ==================================
      // GET STUDENTS
      // ==================================

      const students =
        await Student.find(filter)

          .select({

            admissionNumber: 1,

            name: 1,

            fatherName: 1,

            contact: 1,

            course: 1,

            batchTime: 1,

            paymentPlan: 1,

            totalFees: 1,

            paidFees: 1,

            remainingFees: 1,

            feesStatus: 1,

            admissionDate: 1,

          })

          .sort({

            course: 1,

            batchTime: 1,

            name: 1,

          })

          .lean()


      // ==================================
      // CALCULATE SUMMARY
      // ==================================

      let totalCourseFee = 0

      let totalPaid = 0

      let totalDue = 0


      students.forEach(

        (student) => {

          totalCourseFee +=
            Number(
              student.totalFees || 0
            )


          totalPaid +=
            Number(
              student.paidFees || 0
            )


          totalDue +=
            Number(
              student.remainingFees || 0
            )

        }

      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        filters: {

          course:
            course || 'All',

          status:
            status || 'All',

          batchTime:
            batchTime || 'All',

          paymentPlan:
            paymentPlan || 'All',

        },

        summary: {

          totalStudents:
            students.length,

          totalCourseFee,

          totalPaid,

          totalDue,

        },

        students,

      })

    }

    catch (error) {

      console.log(

        'Fee Report Error:',

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
// GET FEE REPORT FILTER OPTIONS
// ======================================
//
// GET
// /api/admin/fee-reports/options
//
// ======================================

router.get(

  '/admin/fee-reports/options',

  async (req, res) => {

    try {

      // ==================================
      // COURSES
      // ==================================

      const courses =
        await Student.distinct(
          'course'
        )


      // ==================================
      // BATCH TIMES
      // ==================================

      const batchTimes =
        await Student.distinct(
          'batchTime'
        )


      // ==================================
      // PAYMENT PLANS
      // ======================================

      const paymentPlans =
        await Student.distinct(
          'paymentPlan'
        )


      // ==================================
      // CLEAN COURSES
      // ==================================

      const cleanCourses =
        courses

          .filter(

            (item) =>

              item &&

              String(
                item
              ).trim() !== ''

          )

          .sort()


      // ==================================
      // CLEAN BATCH TIMES
      // ==================================

      const cleanBatchTimes =
        batchTimes

          .filter(

            (item) =>

              item &&

              String(
                item
              ).trim() !== ''

          )

          .sort()


      // ==================================
      // CLEAN PAYMENT PLANS
      // ==================================

      const cleanPaymentPlans =
        paymentPlans

          .filter(

            (item) =>

              item &&

              String(
                item
              ).trim() !== ''

          )


      // ==================================
      // RESPONSE
      // ======================================

      return res.status(200).json({

        success: true,

        courses:
          cleanCourses,

        batchTimes:
          cleanBatchTimes,

        paymentPlans:
          cleanPaymentPlans,

      })

    }

    catch (error) {

      console.log(

        'Fee Report Options Error:',

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