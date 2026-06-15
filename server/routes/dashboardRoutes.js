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

      const pendingStudents =
        await Student.countDocuments({
      
          remainingFees: {
      
            $gt: 0,
      
          },
      
        })

      // ======================================
      // TOTAL PENDING FEES
      // ======================================

      const students =
        await Student.find()

      const totalPendingFees =
        students.reduce(

          (total, item) =>

            total +
            item.remainingFees,

          0

        )

      // ======================================
      // RECENT FEE ALERTS
      // ======================================

      const feeAlerts =
        await Student.find({

          remainingFees: {

            $gt: 0,

          },

        })

          .sort({

            dueDate: 1,

          })

          .limit(5)

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

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

      })

    }

  }

)

module.exports = router