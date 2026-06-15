const express = require('express')

const router = express.Router()

const Feedback =
  require('../models/Feedback')


// ======================================
// ADD FEEDBACK
// ======================================

router.post(

  '/feedback',

  async (req, res) => {

    try {

      const {

        studentName,

        course,

        message,

        rating,

      } = req.body


      // ======================================
      // CREATE FEEDBACK
      // ======================================

      const newFeedback =
        new Feedback({

          studentName,

          course,

          message,

          rating,

          status: 'pending',

        })


      // ======================================
      // SAVE
      // ======================================

      const savedFeedback =
        await newFeedback.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Feedback Submitted Successfully',

        feedback:
          savedFeedback,

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


// ======================================
// GET ALL FEEDBACKS
// ======================================

router.get(

  '/feedback',

  async (req, res) => {

    try {

      const feedbacks =
        await Feedback.find()

      res.status(200).json(
        feedbacks
      )

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

      })

    }

  }

)


// ======================================
// APPROVE FEEDBACK
// ======================================

router.put(

  '/feedback/approve/:id',

  async (req, res) => {

    try {

      const approvedFeedback =
        await Feedback.findByIdAndUpdate(

          req.params.id,

          {

            status: 'approved',

          },

          {
            new: true,
          }

        )

      res.status(200).json({

        success: true,

        message:
          'Feedback Approved Successfully',

        feedback:
          approvedFeedback,

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


// ======================================
// REJECT FEEDBACK
// ======================================

router.put(

  '/feedback/reject/:id',

  async (req, res) => {

    try {

      const rejectedFeedback =
        await Feedback.findByIdAndUpdate(

          req.params.id,

          {

            status: 'rejected',

          },

          {
            new: true,
          }

        )

      res.status(200).json({

        success: true,

        message:
          'Feedback Rejected Successfully',

        feedback:
          rejectedFeedback,

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


// ======================================
// GET APPROVED FEEDBACKS
// ======================================

router.get(

  '/feedback/approved',

  async (req, res) => {

    try {

      const feedbacks =
        await Feedback.find({

          status: 'approved',

        })

      res.status(200).json(
        feedbacks
      )

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

      })

    }

  }

)


// ======================================
// DELETE FEEDBACK
// ======================================

router.delete(

  '/feedback/:id',

  async (req, res) => {

    try {

      await Feedback.findByIdAndDelete(
        req.params.id
      )

      res.status(200).json({

        success: true,

        message:
          'Feedback Deleted Successfully',

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