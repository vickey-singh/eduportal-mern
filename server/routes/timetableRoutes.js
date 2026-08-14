const express = require('express')

const router = express.Router()


const Timetable =
  require('../models/Timetable')


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
// CREATE STUDENT NOTIFICATIONS
// ======================================
//
// Same course + same batch ke
// students ko notification milega.
//
// ======================================

const createTimetableNotifications =
  async (

    course,

    batchTime,

    title,

    message,

    relatedId

  ) => {

    try {

      // ==================================
      // FIND STUDENTS
      // ==================================

      const students =
        await Student.find({

          course:
            course.trim(),

          batchTime:
            batchTime.trim(),

        })
        .select('_id')


      // ==================================
      // NO STUDENTS
      // ==================================

      if (
        students.length === 0
      ) {

        return

      }


      // ==================================
      // CREATE NOTIFICATIONS
      // ==================================

      const notifications =
        students.map(
          (student) => ({

            studentId:
              student._id,

            type:
              'Timetable',

            title,

            message,

            link:
              '/student/timetable',

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

        'Create Timetable Student Notification Error:',

        error

      )

      // ==================================
      // IMPORTANT
      // Notification fail hone par
      // timetable operation fail nahi hoga.
      // ==================================

    }

  }


// ======================================
// GET TEACHER TIMETABLE
// ======================================
//
// GET /api/teacher/timetable
// ======================================

router.get(

  '/teacher/timetable',

  teacherAuth,

  async (req, res) => {

    try {

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
      // GET TIMETABLE
      // ==================================

      const timetable =
        await Timetable.find({

          teacherId:
            teacher._id,

        })

        .sort({

          day: 1,

          startTime: 1,

        })


      return res.status(200).json({

        success: true,

        count:
          timetable.length,

        timetable,

      })

    }

    catch (error) {

      console.log(

        'Get Teacher Timetable Error:',

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
// CREATE TIMETABLE
// ======================================
//
// POST /api/teacher/timetable
// ======================================

router.post(

  '/teacher/timetable',

  teacherAuth,

  async (req, res) => {

    try {

      const {

        course,

        batchTime,

        day,

        subject,

        startTime,

        endTime,

        room,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (

        !course ||
        !batchTime ||
        !day ||
        !subject ||
        !startTime ||
        !endTime

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course, batch, day, subject, start time and end time are required.',

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
      // CHECK DUPLICATE
      // ==================================

      const existing =
        await Timetable.findOne({

          course,

          batchTime,

          day,

          startTime,

          endTime,

        })


      if (existing) {

        return res.status(409).json({

          success: false,

          message:
            'A timetable entry already exists for this time.',

        })

      }


      // ==================================
      // CREATE
      // ==================================

      const timetable =
        await Timetable.create({

          course:
            course.trim(),

          batchTime:
            batchTime.trim(),

          day,

          subject:
            subject.trim(),

          startTime:
            startTime.trim(),

          endTime:
            endTime.trim(),

          room:
            room?.trim() || '',

          teacherId:
            teacher._id,

          status:
            'Active',

        })


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createTimetableNotifications(

        timetable.course,

        timetable.batchTime,

        'Timetable Updated',

        `New timetable added for ${timetable.course} (${timetable.batchTime}). ${timetable.day}, ${timetable.startTime} - ${timetable.endTime}.`,

        timetable._id

      )


      return res.status(201).json({

        success: true,

        message:
          'Timetable created successfully.',

        timetable,

      })

    }

    catch (error) {

      console.log(

        'Create Timetable Error:',

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
// UPDATE TIMETABLE
// ======================================
//
// PUT /api/teacher/timetable/:id
// ======================================

router.put(

  '/teacher/timetable/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const timetable =
        await Timetable.findById(
          req.params.id
        )


      if (!timetable) {

        return res.status(404).json({

          success: false,

          message:
            'Timetable entry not found.',

        })

      }


      // ==================================
      // OWNER CHECK
      // ==================================

      if (

        timetable.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to modify this timetable.',

        })

      }


      // ==================================
      // SAVE OLD COURSE + BATCH
      // ==================================

      const oldCourse =
        timetable.course

      const oldBatchTime =
        timetable.batchTime


      const {

        course,

        batchTime,

        day,

        subject,

        startTime,

        endTime,

        room,

        status,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (

        !course ||
        !batchTime ||
        !day ||
        !subject ||
        !startTime ||
        !endTime

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course, batch, day, subject, start time and end time are required.',

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
      // UPDATE
      // ==================================

      timetable.course =
        course.trim()

      timetable.batchTime =
        batchTime.trim()

      timetable.day =
        day

      timetable.subject =
        subject.trim()

      timetable.startTime =
        startTime.trim()

      timetable.endTime =
        endTime.trim()

      timetable.room =
        room?.trim() || ''


      if (status) {

        timetable.status =
          status

      }


      await timetable.save()


      // ==================================
      // CHECK COURSE / BATCH CHANGE
      // ==================================

      const courseChanged =
        oldCourse.trim().toLowerCase() !==
        timetable.course.trim().toLowerCase()


      const batchChanged =
        oldBatchTime.trim().toLowerCase() !==
        timetable.batchTime.trim().toLowerCase()


      // ==================================
      // IF COURSE / BATCH CHANGED
      // ==================================

      if (
        courseChanged ||
        batchChanged
      ) {

        // ================================
        // OLD STUDENTS
        // ================================

        await createTimetableNotifications(

          oldCourse,

          oldBatchTime,

          'Timetable Updated',

          'A timetable assigned to your class has been changed. Please check your timetable.',

          timetable._id

        )


        // ================================
        // NEW STUDENTS
        // ================================

        await createTimetableNotifications(

          timetable.course,

          timetable.batchTime,

          'Timetable Updated',

          `Your timetable has been updated for ${timetable.course} (${timetable.batchTime}). Please check your timetable.`,

          timetable._id

        )

      }

      else {

        // ================================
        // SAME COURSE + BATCH
        // ================================

        await createTimetableNotifications(

          timetable.course,

          timetable.batchTime,

          'Timetable Updated',

          `Your timetable has been updated for ${timetable.course} (${timetable.batchTime}). ${timetable.day}, ${timetable.startTime} - ${timetable.endTime}.`,

          timetable._id

        )

      }


      return res.status(200).json({

        success: true,

        message:
          'Timetable updated successfully.',

        timetable,

      })

    }

    catch (error) {

      console.log(

        'Update Timetable Error:',

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
// DELETE TIMETABLE
// ======================================
//
// DELETE /api/teacher/timetable/:id
// ======================================

router.delete(

  '/teacher/timetable/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const timetable =
        await Timetable.findById(
          req.params.id
        )


      if (!timetable) {

        return res.status(404).json({

          success: false,

          message:
            'Timetable entry not found.',

        })

      }


      // ==================================
      // OWNER CHECK
      // ==================================

      if (

        timetable.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to delete this timetable.',

        })

      }


      // ==================================
      // SAVE DATA BEFORE DELETE
      // ==================================

      const course =
        timetable.course

      const batchTime =
        timetable.batchTime

      const timetableId =
        timetable._id


      // ==================================
      // DELETE TIMETABLE
      // ==================================

      await Timetable.findByIdAndDelete(

        req.params.id

      )


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createTimetableNotifications(

        course,

        batchTime,

        'Timetable Removed',

        `The timetable for ${course} (${batchTime}) has been changed or removed. Please check your timetable.`,

        timetableId

      )


      return res.status(200).json({

        success: true,

        message:
          'Timetable deleted successfully.',

      })

    }

    catch (error) {

      console.log(

        'Delete Timetable Error:',

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