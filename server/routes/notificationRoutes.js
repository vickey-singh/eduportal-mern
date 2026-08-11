const express = require('express')

const router = express.Router()

const Notification =
  require('../models/Notification')


// ======================================
// GET ALL NOTIFICATIONS
// ======================================

router.get(
  '/notifications',
  async (req, res) => {

    try {

      const notifications =
        await Notification.find()
          .sort({
            createdAt: -1,
          })


      res.status(200).json({

        success: true,

        notifications,

      })

    }

    catch (error) {

      console.log(
        'Get Notifications Error:',
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
// GET UNREAD COUNT
// ======================================

router.get(
  '/notifications/unread-count',
  async (req, res) => {

    try {

      const count =
        await Notification.countDocuments({

          isRead: false,

        })


      res.status(200).json({

        success: true,

        count,

      })

    }

    catch (error) {

      console.log(
        'Unread Count Error:',
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
// MARK ONE NOTIFICATION AS READ
// ======================================

router.put(
  '/notifications/:id/read',
  async (req, res) => {

    try {

      const notification =
        await Notification.findById(
          req.params.id
        )


      // ==================================
      // CHECK NOTIFICATION
      // ==================================

      if (!notification) {

        return res.status(404).json({

          success: false,

          message:
            'Notification Not Found',

        })

      }


      // ==================================
      // MARK READ
      // ==================================

      notification.isRead = true


      await notification.save()


      res.status(200).json({

        success: true,

        message:
          'Notification Marked As Read',

        notification,

      })

    }

    catch (error) {

      console.log(
        'Mark Notification Read Error:',
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
// MARK ALL NOTIFICATIONS AS READ
// ======================================

router.put(
  '/notifications/read-all',
  async (req, res) => {

    try {

      await Notification.updateMany(

        {
          isRead: false,
        },

        {
          $set: {
            isRead: true,
          },
        }

      )


      res.status(200).json({

        success: true,

        message:
          'All Notifications Marked As Read',

      })

    }

    catch (error) {

      console.log(
        'Mark All Notifications Read Error:',
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
// DELETE ONE NOTIFICATION
// ======================================

router.delete(
  '/notifications/:id',
  async (req, res) => {

    try {

      const notification =
        await Notification.findByIdAndDelete(
          req.params.id
        )


      // ==================================
      // CHECK NOTIFICATION
      // ==================================

      if (!notification) {

        return res.status(404).json({

          success: false,

          message:
            'Notification Not Found',

        })

      }


      res.status(200).json({

        success: true,

        message:
          'Notification Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Notification Error:',
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
// DELETE ALL NOTIFICATIONS
// ======================================
//
// IMPORTANT:
// Ye sirf Notification collection
// delete karega.
//
// Student / Payment / Feedback / Message
// delete nahi honge.
// ======================================

router.delete(
  '/notifications',
  async (req, res) => {

    try {

      const result =
        await Notification.deleteMany({})


      res.status(200).json({

        success: true,

        message:
          'All Notifications Cleared Successfully',

        deletedCount:
          result.deletedCount,

      })

    }

    catch (error) {

      console.log(
        'Clear All Notifications Error:',
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