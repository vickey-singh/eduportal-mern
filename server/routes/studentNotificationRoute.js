const express = require('express')

const router = express.Router()

const StudentNotification =
  require('../models/StudentNotification')

const studentAuth =
  require('../middleware/studentAuth')


// ======================================
// GET STUDENT NOTIFICATIONS
// ======================================
//
// Sirf logged-in student ki notifications
// milengi.
//
// ======================================

router.get(

  '/student/notifications',

  studentAuth,

  async (req, res) => {

    try {

      const studentId =
        req.student.id


      const notifications =
        await StudentNotification.find({

          studentId,

        })
          .sort({
            createdAt: -1,
          })


      return res.status(200).json({

        success: true,

        notifications,

      })

    }

    catch (error) {

      console.log(
        'Get Student Notifications Error:',
        error
      )


      return res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// GET STUDENT UNREAD COUNT
// ======================================

router.get(

  '/student/notifications/unread-count',

  studentAuth,

  async (req, res) => {

    try {

      const studentId =
        req.student.id


      const count =
        await StudentNotification.countDocuments({

          studentId,

          isRead: false,

        })


      return res.status(200).json({

        success: true,

        count,

      })

    }

    catch (error) {

      console.log(
        'Student Unread Count Error:',
        error
      )


      return res.status(500).json({

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
//
// Important:
// Student sirf apni notification ko
// read kar sakta hai.
//
// ======================================

router.put(

  '/student/notifications/:id/read',

  studentAuth,

  async (req, res) => {

    try {

      const studentId =
        req.student.id


      const notification =
        await StudentNotification.findOne({

          _id:
            req.params.id,

          studentId,

        })


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
      // MARK AS READ
      // ==================================

      notification.isRead =
        true


      await notification.save()


      return res.status(200).json({

        success: true,

        message:
          'Notification Marked As Read',

        notification,

      })

    }

    catch (error) {

      console.log(
        'Mark Student Notification Read Error:',
        error
      )


      return res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// MARK ALL STUDENT NOTIFICATIONS
// AS READ
// ======================================

router.put(

  '/student/notifications/read-all',

  studentAuth,

  async (req, res) => {

    try {

      const studentId =
        req.student.id


      await StudentNotification.updateMany(

        {

          studentId,

          isRead: false,

        },

        {

          $set: {

            isRead: true,

          },

        }

      )


      return res.status(200).json({

        success: true,

        message:
          'All Student Notifications Marked As Read',

      })

    }

    catch (error) {

      console.log(
        'Mark All Student Notifications Error:',
        error
      )


      return res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// DELETE ONE STUDENT NOTIFICATION
// ======================================
//
// Student sirf apni notification delete
// kar sakta hai.
//
// ======================================

router.delete(

  '/student/notifications/:id',

  studentAuth,

  async (req, res) => {

    try {

      const studentId =
        req.student.id


      const notification =
        await StudentNotification.findOneAndDelete({

          _id:
            req.params.id,

          studentId,

        })


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


      return res.status(200).json({

        success: true,

        message:
          'Notification Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Student Notification Error:',
        error
      )


      return res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// DELETE ALL STUDENT NOTIFICATIONS
// ======================================
//
// IMPORTANT:
// Sirf logged-in student ki notifications
// delete hongi.
//
// Kisi doosre student ya Admin ki
// notifications delete nahi hongi.
//
// ======================================

router.delete(

  '/student/notifications',

  studentAuth,

  async (req, res) => {

    try {

      const studentId =
        req.student.id


      const result =
        await StudentNotification.deleteMany({

          studentId,

        })


      return res.status(200).json({

        success: true,

        message:
          'All Student Notifications Cleared Successfully',

        deletedCount:
          result.deletedCount,

      })

    }

    catch (error) {

      console.log(
        'Clear Student Notifications Error:',
        error
      )


      return res.status(500).json({

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