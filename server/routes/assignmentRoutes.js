const express = require('express')

const router = express.Router()

const Assignment =
  require('../models/Assignment')

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
// CREATE ASSIGNMENT NOTIFICATIONS
// ======================================
//
// Sirf same course + same batch ke
// students ko notification milega.
// ======================================

const createAssignmentNotifications =
  async (

    course,
    batchTime,
    type,
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

            type,

            title,

            message,

            link:
              '/student/assignments',

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

        'Assignment Notification Error:',
        error

      )

    }

  }


// ======================================
// GET TEACHER ASSIGNMENTS
// ======================================
//
// GET
// /api/teacher/assignments
//
// ======================================

router.get(

  '/teacher/assignments',

  teacherAuth,

  async (req, res) => {

    try {

      const teacher =
        await Faculty.findById(
          req.teacher.id
        )


      if (!teacher) {

        return res.status(404).json({

          success: false,

          message:
            'Teacher not found.',

        })

      }


      const assignments =
        await Assignment.find({

          teacherId:
            teacher._id,

        })
        .sort({

          createdAt: -1,

        })


      return res.status(200).json({

        success: true,

        assignments,

      })

    }

    catch (error) {

      console.log(

        'Get Teacher Assignments Error:',
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
// CREATE ASSIGNMENT
// ======================================
//
// POST
// /api/teacher/assignments
//
// ======================================

router.post(

  '/teacher/assignments',

  teacherAuth,

  async (req, res) => {

    try {

      const {

        title,

        description,

        course,

        batchTime,

        subject,

        assignedDate,

        dueDate,

        attachment,

        attachmentName,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (

        !title ||
        !course ||
        !batchTime ||
        !assignedDate ||
        !dueDate

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Title, course, batch, assigned date and due date are required.',

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
      // TEACHER STATUS
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
      // CREATE ASSIGNMENT
      // ==================================

      const assignment =
        new Assignment({

          title:
            title.trim(),

          description:
            description?.trim() || '',

          course:
            course.trim(),

          batchTime:
            batchTime.trim(),

          subject:
            subject?.trim() || '',

          assignedDate,

          dueDate,

          attachment:
            attachment || '',

          attachmentName:
            attachmentName || '',

          teacherId:
            teacher._id,

          teacherName:
            teacher.name,

          status:
            'Active',

        })


      await assignment.save()


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createAssignmentNotifications(

        assignment.course,

        assignment.batchTime,

        'Assignment',

        'New Assignment',

        `${assignment.title} has been added for your class.`,

        assignment._id

      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(201).json({

        success: true,

        message:
          'Assignment created successfully.',

        assignment,

      })

    }

    catch (error) {

      console.log(

        'Create Assignment Error:',
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
// UPDATE ASSIGNMENT
// ======================================
//
// PUT
// /api/teacher/assignments/:id
//
// ======================================

router.put(

  '/teacher/assignments/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const assignment =
        await Assignment.findById(
          req.params.id
        )


      if (!assignment) {

        return res.status(404).json({

          success: false,

          message:
            'Assignment not found.',

        })

      }


      // ==================================
      // OWNERSHIP CHECK
      // ==================================

      if (

        assignment.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to modify this assignment.',

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
      // REQUEST DATA
      // ==================================

      const {

        title,

        description,

        course,

        batchTime,

        subject,

        assignedDate,

        dueDate,

        attachment,

        attachmentName,

        status,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (

        !title ||
        !course ||
        !batchTime ||
        !assignedDate ||
        !dueDate

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Required assignment fields are missing.',

        })

      }


      // ==================================
      // ASSIGNMENT CHECK
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
      // UPDATE
      // ==================================

      assignment.title =
        title.trim()


      assignment.description =
        description?.trim() || ''


      assignment.course =
        course.trim()


      assignment.batchTime =
        batchTime.trim()


      assignment.subject =
        subject?.trim() || ''


      assignment.assignedDate =
        assignedDate


      assignment.dueDate =
        dueDate


      assignment.attachment =
        attachment || ''


      assignment.attachmentName =
        attachmentName || ''


      if (status) {

        assignment.status =
          status

      }


      await assignment.save()


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createAssignmentNotifications(

        assignment.course,

        assignment.batchTime,

        'Assignment',

        'Assignment Updated',

        `${assignment.title} has been updated.`,

        assignment._id

      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Assignment updated successfully.',

        assignment,

      })

    }

    catch (error) {

      console.log(

        'Update Assignment Error:',
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
// DELETE ASSIGNMENT
// ======================================
//
// DELETE
// /api/teacher/assignments/:id
//
// ======================================

router.delete(

  '/teacher/assignments/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const assignment =
        await Assignment.findById(
          req.params.id
        )


      if (!assignment) {

        return res.status(404).json({

          success: false,

          message:
            'Assignment not found.',

        })

      }


      // ==================================
      // OWNERSHIP CHECK
      // ==================================

      if (

        assignment.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to delete this assignment.',

        })

      }


      // ==================================
      // SAVE COURSE + BATCH
      // BEFORE DELETE
      // ==================================

      const assignmentCourse =
        assignment.course


      const assignmentBatchTime =
        assignment.batchTime


      const assignmentTitle =
        assignment.title


      const assignmentId =
        assignment._id


      // ==================================
      // DELETE
      // ==================================

      await Assignment.findByIdAndDelete(

        req.params.id

      )


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createAssignmentNotifications(

        assignmentCourse,

        assignmentBatchTime,

        'Assignment',

        'Assignment Removed',

        `${assignmentTitle} has been removed.`,

        assignmentId

      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Assignment deleted successfully.',

      })

    }

    catch (error) {

      console.log(

        'Delete Assignment Error:',
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