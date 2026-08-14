const express = require('express')

const router = express.Router()

const Announcement =
  require('../models/Announcement')

const Faculty =
  require('../models/Faculty')

const Student =
  require('../models/Student')

const StudentNotification =
  require('../models/StudentNotification')

const teacherAuth =
  require('../middleware/teacherAuth')


// ======================================
// HELPER
// CHECK TEACHER COURSE + BATCH
// ======================================

const isTeacherAssigned =
  (
    teacher,
    course,
    batchTime
  ) => {

    return (

      teacher.assignedClasses || []

    ).some(

      (assignment) => {

        const assignedCourse =
          assignment.courseId


        if (!assignedCourse) {

          return false

        }


        const courseMatch =
          assignedCourse.courseName
            ?.trim()
            .toLowerCase() ===

          course
            ?.trim()
            .toLowerCase()


        const batchMatch =
          assignment.batchTime
            ?.trim()
            .toLowerCase() ===

          batchTime
            ?.trim()
            .toLowerCase()


        return (
          courseMatch &&
          batchMatch
        )

      }

    )

  }


// ======================================
// HELPER
// CREATE ANNOUNCEMENT NOTIFICATIONS
// ======================================
//
// Same course + same batch ke
// students ko notification milega.
// ======================================

const createAnnouncementNotifications =
  async (

    course,
    batchTime,
    title,
    message,
    relatedId

  ) => {

    try {

      const students =
        await Student.find({

          course:
            course.trim(),

          batchTime:
            batchTime.trim(),

        })
        .select('_id')


      if (
        students.length === 0
      ) {

        return

      }


      const notifications =
        students.map(

          (student) => ({

            studentId:
              student._id,

            type:
              'Announcement',

            title,

            message,

            link:
              '/student/announcements',

            relatedId:
              String(relatedId),

            isRead:
              false,

          })

        )


      await StudentNotification.insertMany(

        notifications

      )

    }

    catch (error) {

      console.log(

        'Announcement Notification Error:',
        error

      )

    }

  }


// ======================================
// GET TEACHER ANNOUNCEMENTS
// ======================================
//
// GET /api/teacher/announcements
// ======================================

router.get(

  '/teacher/announcements',

  teacherAuth,

  async (req, res) => {

    try {

      const teacher =
        await Faculty.findById(
          req.teacher.id
        )
        .populate(
          'assignedClasses.courseId'
        )


      if (!teacher) {

        return res.status(404).json({

          success: false,

          message:
            'Teacher not found.',

        })

      }


      if (
        teacher.isTeacher !== true
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Teacher account is not enabled.',

        })

      }


      if (
        teacher.accountStatus ===
        'Inactive'
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Teacher account is inactive.',

        })

      }


      const announcements =
        await Announcement.find({

          teacherId:
            teacher._id,

        })
        .sort({

          createdAt: -1,

        })


      return res.status(200).json({

        success: true,

        count:
          announcements.length,

        announcements,

      })

    }

    catch (error) {

      console.log(

        'Get Teacher Announcements Error:',
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
// CREATE ANNOUNCEMENT
// ======================================
//
// POST /api/teacher/announcements
// ======================================

router.post(

  '/teacher/announcements',

  teacherAuth,

  async (req, res) => {

    try {

      const {

        title,

        message,

        course,

        batchTime,

        priority,

        expiryDate,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (

        !title ||
        !message ||
        !course ||
        !batchTime

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Title, message, course and batch are required.',

        })

      }


      // ==================================
      // GET TEACHER
      // ==================================

      const teacher =
        await Faculty.findById(
          req.teacher.id
        )
        .populate(
          'assignedClasses.courseId'
        )


      if (!teacher) {

        return res.status(404).json({

          success: false,

          message:
            'Teacher not found.',

        })

      }


      // ==================================
      // ACCOUNT CHECK
      // ==================================

      if (
        teacher.isTeacher !== true
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Teacher account is not enabled.',

        })

      }


      if (
        teacher.accountStatus ===
        'Inactive'
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Teacher account is inactive.',

        })

      }


      // ==================================
      // COURSE + BATCH AUTHORIZATION
      // ==================================

      const assigned =
        isTeacherAssigned(

          teacher,

          course,

          batchTime

        )


      if (!assigned) {

        return res.status(403).json({

          success: false,

          message:
            'This course or batch is not assigned to you.',

        })

      }


      // ==================================
      // PRIORITY VALIDATION
      // ==================================

      const allowedPriorities = [

        'Normal',

        'Important',

        'Urgent',

      ]


      const finalPriority =
        priority ||
        'Normal'


      if (

        !allowedPriorities.includes(
          finalPriority
        )

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid priority.',

        })

      }


      // ==================================
      // CREATE
      // ==================================

      const announcement =
        await Announcement.create({

          title:
            title.trim(),

          message:
            message.trim(),

          course:
            course.trim(),

          batchTime:
            batchTime.trim(),

          teacherId:
            teacher._id,

          priority:
            finalPriority,

          status:
            'Active',

          expiryDate:
            expiryDate?.trim() || '',

        })


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createAnnouncementNotifications(

        announcement.course,

        announcement.batchTime,

        'New Announcement',

        announcement.message,

        announcement._id

      )


      return res.status(201).json({

        success: true,

        message:
          'Announcement created successfully.',

        announcement,

      })

    }

    catch (error) {

      console.log(

        'Create Announcement Error:',
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
// UPDATE ANNOUNCEMENT
// ======================================
//
// PUT /api/teacher/announcements/:id
// ======================================

router.put(

  '/teacher/announcements/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const announcement =
        await Announcement.findById(
          req.params.id
        )


      if (!announcement) {

        return res.status(404).json({

          success: false,

          message:
            'Announcement not found.',

        })

      }


      // ==================================
      // OWNER CHECK
      // ==================================

      if (

        announcement.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to modify this announcement.',

        })

      }


      const {

        title,

        message,

        course,

        batchTime,

        priority,

        status,

        expiryDate,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (

        !title ||
        !message ||
        !course ||
        !batchTime

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Title, message, course and batch are required.',

        })

      }


      // ==================================
      // GET TEACHER
      // ==================================

      const teacher =
        await Faculty.findById(
          req.teacher.id
        )
        .populate(
          'assignedClasses.courseId'
        )


      if (!teacher) {

        return res.status(404).json({

          success: false,

          message:
            'Teacher not found.',

        })

      }


      // ==================================
      // COURSE + BATCH CHECK
      // ==================================

      const assigned =
        isTeacherAssigned(

          teacher,

          course,

          batchTime

        )


      if (!assigned) {

        return res.status(403).json({

          success: false,

          message:
            'This course or batch is not assigned to you.',

        })

      }


      // ==================================
      // PRIORITY
      // ==================================

      const allowedPriorities = [

        'Normal',

        'Important',

        'Urgent',

      ]


      const finalPriority =
        priority ||
        announcement.priority


      if (

        !allowedPriorities.includes(
          finalPriority
        )

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid priority.',

        })

      }


      // ==================================
      // UPDATE
      // ==================================

      announcement.title =
        title.trim()


      announcement.message =
        message.trim()


      announcement.course =
        course.trim()


      announcement.batchTime =
        batchTime.trim()


      announcement.priority =
        finalPriority


      announcement.expiryDate =
        expiryDate?.trim() || ''


      if (status) {

        announcement.status =
          status

      }


      await announcement.save()


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createAnnouncementNotifications(

        announcement.course,

        announcement.batchTime,

        'Announcement Updated',

        announcement.message,

        announcement._id

      )


      return res.status(200).json({

        success: true,

        message:
          'Announcement updated successfully.',

        announcement,

      })

    }

    catch (error) {

      console.log(

        'Update Announcement Error:',
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
// DELETE ANNOUNCEMENT
// ======================================
//
// DELETE /api/teacher/announcements/:id
// ======================================

router.delete(

  '/teacher/announcements/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const announcement =
        await Announcement.findById(
          req.params.id
        )


      if (!announcement) {

        return res.status(404).json({

          success: false,

          message:
            'Announcement not found.',

        })

      }


      // ==================================
      // OWNER CHECK
      // ==================================

      if (

        announcement.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to delete this announcement.',

        })

      }


      // ==================================
      // SAVE DATA BEFORE DELETE
      // ==================================

      const announcementCourse =
        announcement.course


      const announcementBatchTime =
        announcement.batchTime


      const announcementTitle =
        announcement.title


      const announcementId =
        announcement._id


      // ==================================
      // DELETE
      // ==================================

      await Announcement.findByIdAndDelete(

        req.params.id

      )


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createAnnouncementNotifications(

        announcementCourse,

        announcementBatchTime,

        'Announcement Removed',

        `${announcementTitle} has been removed.`,

        announcementId

      )


      return res.status(200).json({

        success: true,

        message:
          'Announcement deleted successfully.',

      })

    }

    catch (error) {

      console.log(

        'Delete Announcement Error:',
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
// EXPORT
// ======================================

module.exports =
  router