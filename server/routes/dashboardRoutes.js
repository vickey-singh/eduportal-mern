const express = require('express')

const router = express.Router()


// ======================================
// IMPORT MODELS
// ======================================

const Student =
  require('../models/Student')

const Faculty =
  require('../models/Faculty')

const Achievement =
  require('../models/Achievement')

const Gallery =
  require('../models/Gallery')

const Testimonial =
  require('../models/Testimonial')

const Feedback =
  require('../models/Feedback')

const Message =
  require('../models/Message')


// ======================================
// DASHBOARD ANALYTICS
// ======================================

router.get(

  '/dashboard',

  async (req, res) => {

    try {

      // ======================================
      // COUNT DOCUMENTS
      // ======================================

      const totalStudents =
        await Student.countDocuments()


      const totalFaculty =
        await Faculty.countDocuments()


      const totalAchievements =
        await Achievement.countDocuments()


      const totalGallery =
        await Gallery.countDocuments()


      const totalTestimonials =
        await Testimonial.countDocuments()


      const totalFeedbacks =
        await Feedback.countDocuments()


      const totalMessages =
        await Message.countDocuments()


      // ======================================
      // TODAY
      // ======================================

      const today =
        new Date()

      today.setHours(
        0,
        0,
        0,
        0
      )


      // ======================================
      // FEES ANALYTICS
      // ======================================

      const paidStudents =
        await Student.countDocuments({

          feesStatus: 'Paid',

        })


      const partialStudents =
        await Student.countDocuments({

          feesStatus: 'Partial',

        })


      // ======================================
      // ACTUAL FEE DUE STUDENTS
      // ======================================
      //
      // Student will be considered Due only when:
      //
      // 1. Remaining fee > 0
      // 2. Due date exists
      // 3. Due date has arrived
      //
      // ======================================

      const allStudents =
        await Student.find()


      const dueStudents =
        allStudents.filter(

          (student) => {

            // ------------------------------
            // FULLY PAID
            // ------------------------------

            if (
              Number(
                student.remainingFees || 0
              ) <= 0
            ) {

              return false

            }


            // ------------------------------
            // NO DUE DATE
            // ------------------------------

            if (
              !student.dueDate
            ) {

              return false

            }


            // ------------------------------
            // DUE DATE
            // ------------------------------

            const dueDate =
              new Date(
                student.dueDate
              )


            if (
              Number.isNaN(
                dueDate.getTime()
              )
            ) {

              return false

            }


            dueDate.setHours(
              0,
              0,
              0,
              0
            )


            // ------------------------------
            // ACTUAL DUE CHECK
            // ------------------------------

            return (
              dueDate <= today
            )

          }

        )


      // ======================================
      // PENDING STUDENTS
      // ======================================

      const pendingStudents =
        dueStudents.length


      // ======================================
      // TOTAL PENDING FEES
      // ======================================
      //
      // IMPORTANT:
      //
      // This is now the amount of fees
      // belonging to students whose
      // installment is actually due.
      //
      // ======================================

      const totalPendingFees =
        dueStudents.reduce(

          (
            total,
            student
          ) =>

            total +

            Number(
              student.remainingFees || 0
            ),

          0

        )


      // ======================================
      // RECENT FEE ALERTS
      // ======================================

      const feeAlerts =
        dueStudents

          .sort(

            (
              a,
              b
            ) => {

              const dateA =
                new Date(
                  a.dueDate
                ).getTime()


              const dateB =
                new Date(
                  b.dueDate
                ).getTime()


              return (
                dateA -
                dateB
              )

            }

          )

          .slice(
            0,
            5
          )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        totalStudents,

        totalFaculty,

        totalAchievements,

        totalGallery,

        totalTestimonials,

        totalFeedbacks,

        totalMessages,

        paidStudents,

        partialStudents,

        pendingStudents,

        totalPendingFees,

        feeAlerts,

      })

    }

    catch (error) {

      console.log(
        'Dashboard Error:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// EXPORT ROUTER
// ======================================

module.exports =
  router