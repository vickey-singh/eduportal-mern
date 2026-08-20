const express =
  require('express')

const router =
  express.Router()

const Student =
  require('../models/Student')


// ======================================
// CONSTANTS
// ======================================

const PAYMENT_PLANS = [
  'full',
  'monthly',
  'installment',
]


// ======================================
// DATE HELPER
// ======================================

const toDate = (value) => {

  if (!value) {
    return null
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null

  }

  date.setHours(
    0,
    0,
    0,
    0
  )

  return date

}


// ======================================
// REFRESH INSTALLMENT STATUS
// ======================================
//
// Status:
//
// Paid
// Due
// Pending
//
// Example:
//
// 01 Sep -> Paid
// 01 Oct -> Due
// 01 Nov -> Due
// 01 Dec -> Pending
//
// ======================================

const refreshInstallmentStatuses = (
  schedule
) => {

  if (
    !Array.isArray(schedule)
  ) {

    return []

  }

  const today =
    toDate(
      new Date()
    )

  return schedule.map(
    (item) => {

      const amount =
        Number(
          item.amount || 0
        )

      const paidAmount =
        Number(
          item.paidAmount || 0
        )

      let status =
        'Pending'

      // ------------------------------
      // FULLY PAID
      // ------------------------------

      if (
        amount > 0 &&
        paidAmount >= amount
      ) {

        status =
          'Paid'

      }

      // ------------------------------
      // DUE
      // ------------------------------

      else {

        const dueDate =
          toDate(
            item.dueDate
          )

        if (
          dueDate &&
          dueDate <= today
        ) {

          status =
            'Due'

        }

      }

      return {

        ...item,

        amount,

        paidAmount,

        status,

      }

    }
  )

}


// ======================================
// GET OVERALL STUDENT FEE STATUS
// ======================================
//
// IMPORTANT:
//
// Overall student status:
//
// Paid
// Due
// Partial
//
// If even ONE installment is Due:
// student = Due
//
// If no installment is Due but
// remaining fee exists:
// student = Partial
//
// If remaining fee = 0:
// student = Paid
//
// ======================================

const getOverallFeeStatus = (
  student,
  schedule
) => {

  const remainingFees =
    Number(
      student.remainingFees || 0
    )

  // ------------------------------
  // FULLY PAID
  // ------------------------------

  if (
    remainingFees <= 0
  ) {

    return 'Paid'

  }

  // ------------------------------
  // CHECK DUE INSTALLMENTS
  // ------------------------------

  const dueInstallments =
    schedule.filter(
      item =>
        item.status ===
        'Due'
    )

  if (
    dueInstallments.length > 0
  ) {

    return 'Due'

  }

  // ------------------------------
  // OTHERWISE PARTIAL
  // ------------------------------

  return 'Partial'

}


// ======================================
// GET DISPLAY DUE DATE
// ======================================
//
// If multiple installments are Due:
//
// latest Due date is shown.
//
// If no installment is Due:
//
// next Pending date is shown.
//
// ======================================

const getDisplayDueDate = (
  schedule
) => {

  if (
    !Array.isArray(schedule) ||
    schedule.length === 0
  ) {

    return null

  }

  // ------------------------------
  // CURRENT DUE
  // ------------------------------

  const due =
    schedule
      .filter(
        item =>
          item.status ===
          'Due'
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate) -
          new Date(b.dueDate)
      )

  if (
    due.length > 0
  ) {

    return (
      due[due.length - 1]
        .dueDate || null
    )

  }

  // ------------------------------
  // NEXT PENDING
  // ------------------------------

  const pending =
    schedule
      .filter(
        item =>
          item.status ===
          'Pending'
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate) -
          new Date(b.dueDate)
      )

  if (
    pending.length > 0
  ) {

    return (
      pending[0]
        .dueDate || null
    )

  }

  return null

}


// ======================================
// FORMAT STUDENT FOR REPORT
// ======================================

const formatStudent = (
  student
) => {

  const rawSchedule =
    Array.isArray(
      student.installmentSchedule
    )
      ? student.installmentSchedule
      : []

  const schedule =
    refreshInstallmentStatuses(
      rawSchedule
    )

  const feesStatus =
    getOverallFeeStatus(
      student,
      schedule
    )

  const displayDueDate =
    getDisplayDueDate(
      schedule
    )

  const dueInstallments =
    schedule.filter(
      item =>
        item.status ===
        'Due'
    )

  const pendingInstallments =
    schedule.filter(
      item =>
        item.status ===
        'Pending'
    )

  const paidInstallments =
    schedule.filter(
      item =>
        item.status ===
        'Paid'
    )

  const dueAmount =
    dueInstallments.reduce(

      (
        total,
        item
      ) =>

        total +

        Math.max(

          0,

          Number(
            item.amount || 0
          ) -

          Number(
            item.paidAmount || 0
          )

        ),

      0

    )

  const pendingAmount =
    pendingInstallments.reduce(

      (
        total,
        item
      ) =>

        total +

        Math.max(

          0,

          Number(
            item.amount || 0
          ) -

          Number(
            item.paidAmount || 0
          )

        ),

      0

    )

  const paidInstallmentAmount =
    paidInstallments.reduce(

      (
        total,
        item
      ) =>

        total +

        Number(
          item.paidAmount || 0
        ),

      0

    )

  return {

    _id:
      student._id,

    admissionNumber:
      student.admissionNumber,

    name:
      student.name,

    fatherName:
      student.fatherName,

    contact:
      student.contact,

    course:
      student.course,

    batchTime:
      student.batchTime,

    paymentPlan:
      student.paymentPlan || '',

    totalFees:
      Number(
        student.totalFees || 0
      ),

    paidFees:
      Number(
        student.paidFees || 0
      ),

    remainingFees:
      Number(
        student.remainingFees || 0
      ),

    feesStatus,

    dueDate:
      displayDueDate,

    admissionDate:
      student.admissionDate,

    // ==================================
    // INSTALLMENT DATA
    // ==================================

    installmentCount:
      schedule.length,

    installmentSchedule:
      schedule,

    dueInstallments,

    pendingInstallments,

    paidInstallments,

    dueInstallmentCount:
      dueInstallments.length,

    pendingInstallmentCount:
      pendingInstallments.length,

    paidInstallmentCount:
      paidInstallments.length,

    dueAmount,

    pendingAmount,

    paidInstallmentAmount,

  }

}


// ======================================
// GET FEE REPORT
// ======================================
//
// GET
// /api/admin/fee-reports
//
// Query:
//
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
      // BUILD DATABASE FILTER
      // ==================================

      const filter = {}


      // ==================================
      // COURSE
      // ==================================

      if (

        course &&

        course !== 'All'

      ) {

        filter.course =
          course

      }


      // ==================================
      // BATCH TIME
      // ==================================

      if (

        batchTime &&

        batchTime !== 'All'

      ) {

        filter.batchTime =
          batchTime

      }


      // ==================================
      // PAYMENT PLAN
      // ==================================

      if (

        paymentPlan &&

        paymentPlan !== 'All'

      ) {

        if (
          PAYMENT_PLANS.includes(
            paymentPlan
          )
        ) {

          filter.paymentPlan =
            paymentPlan

        }

        else {

          return res.status(400).json({

            success: false,

            message:
              'Invalid payment plan.',

          })

        }

      }


      // ==================================
      // IMPORTANT
      // ==================================
      //
      // Fee status is NOT filtered directly
      // in MongoDB because Due status is
      // calculated from installmentSchedule
      // against today's date.
      //
      // ==================================

      const students =
        await Student.find(
          filter
        )

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

            dueDate: 1,

            admissionDate: 1,

            installmentCount: 1,

            installmentSchedule: 1,

          })

          .sort({

            course: 1,

            batchTime: 1,

            name: 1,

          })

          .lean()


      // ==================================
      // FORMAT STUDENTS
      // ==================================

      let formattedStudents =
        students.map(
          formatStudent
        )


      // ==================================
      // STATUS FILTER
      // ==================================

      if (

        status &&

        status !== 'All'

      ) {

        const allowedStatuses = [

          'Paid',

          'Partial',

          'Due',

        ]

        if (
          !allowedStatuses.includes(
            status
          )
        ) {

          return res.status(400).json({

            success: false,

            message:
              'Invalid fee status.',

          })

        }

        formattedStudents =
          formattedStudents.filter(
            student =>
              student.feesStatus ===
              status
          )

      }


      // ==================================
      // SUMMARY
      // ==================================

      let totalCourseFee =
        0

      let totalPaid =
        0

      let totalDue =
        0

      let totalDueAmount =
        0

      let totalPendingAmount =
        0

      let totalInstallments =
        0

      let totalDueInstallments =
        0

      let totalPendingInstallments =
        0

      let totalPaidInstallments =
        0


      formattedStudents.forEach(

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


          totalDueAmount +=

            Number(
              student.dueAmount || 0
            )


          totalPendingAmount +=

            Number(
              student.pendingAmount || 0
            )


          totalInstallments +=

            Number(
              student.installmentCount || 0
            )


          totalDueInstallments +=

            Number(
              student.dueInstallmentCount || 0
            )


          totalPendingInstallments +=

            Number(
              student.pendingInstallmentCount || 0
            )


          totalPaidInstallments +=

            Number(
              student.paidInstallmentCount || 0
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
            formattedStudents.length,

          totalCourseFee,

          totalPaid,

          totalDue,

          // Amount from installments
          // whose due date has arrived.

          totalDueAmount,

          // Amount from future installments.

          totalPendingAmount,

          totalInstallments,

          totalDueInstallments,

          totalPendingInstallments,

          totalPaidInstallments,

        },

        students:
          formattedStudents,

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
      // NEW PAYMENT PLANS ONLY
      // ==================================
      //
      // Do NOT read old plans from DB.
      //
      // Old:
      // three_month
      // six_month
      //
      // New:
      // full
      // monthly
      // installment
      //
      // ==================================

      const paymentPlans =
        PAYMENT_PLANS


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        courses:
          cleanCourses,

        batchTimes:
          cleanBatchTimes,

        paymentPlans,

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