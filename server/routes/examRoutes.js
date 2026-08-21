const express = require('express')

const router = express.Router()

const Exam =
  require('../models/Exam')

const Faculty =
  require('../models/Faculty')

const Student =
  require('../models/Student')

const StudentNotification =
  require('../models/StudentNotification')

const Marks =
  require('../models/Marks')

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
// CREATE EXAM NOTIFICATIONS
// ======================================
//
// Same course + same batch ke
// students ko notification milega.
// ======================================

const createExamNotifications =
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
              'Exam',

            title,

            message,

            link:
              '/student/marks',

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

        'Exam Notification Error:',
        error

      )

    }

  }


// ======================================
// HELPER
// CREATE MARKS NOTIFICATIONS
// ======================================
//
// Same course + same batch ke
// students ko notification milega.
// ======================================

const createMarksNotifications =
  async (

    studentId,
    studentName,
    examName,
    obtainedMarks,
    totalMarks,
    result,
    relatedId

  ) => {

    try {

      await StudentNotification.create({

        studentId,

        type:
          'Marks',

        title:
          'Marks Updated',

        message:
          `${examName} marks have been updated. You scored ${obtainedMarks}/${totalMarks} (${result}).`,

        link:
          '/student/marks',

        relatedId:
          String(relatedId),

        isRead:
          false,

      })

    }

    catch (error) {

      console.log(

        'Marks Notification Error:',
        error

      )

    }

  }


// ======================================
// GET TEACHER EXAMS
// ======================================
//
// GET /api/teacher/exams
// ======================================

router.get(

  '/teacher/exams',

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


      const exams =
        await Exam.find({

          teacherId:
            teacher._id,

        })
        .sort({

          examDate: 1,

          createdAt: -1,

        })


      return res.status(200).json({

        success: true,

        exams,

      })

    }

    catch (error) {

      console.log(

        'Get Teacher Exams Error:',
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
// CREATE EXAM
// ======================================
//
// POST /api/teacher/exams
// ======================================

router.post(

  '/teacher/exams',

  teacherAuth,

  async (req, res) => {

    try {

      const {

        examName,

        examType,

        subject,

        course,

        batchTime,

        examDate,

        totalMarks,

        passingMarks,

        description,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (

        !examName ||
        !course ||
        !batchTime ||
        !examDate ||
        totalMarks ===
          undefined

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Exam name, course, batch, exam date and total marks are required.',

        })

      }


      // ==================================
      // MARK VALIDATION
      // ==================================

      const maximumMarks =
        Number(totalMarks)


      const minimumMarks =
        Number(
          passingMarks || 0
        )


      if (

        Number.isNaN(
          maximumMarks
        ) ||

        maximumMarks <= 0

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Total marks must be greater than 0.',

        })

      }


      if (

        Number.isNaN(
          minimumMarks
        ) ||

        minimumMarks < 0 ||

        minimumMarks >
          maximumMarks

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Passing marks must be between 0 and total marks.',

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
      // CREATE EXAM
      // ==================================

      const exam =
        new Exam({

          examName:
            examName.trim(),

          examType:
            examType || 'Class Test',

          subject:
            subject?.trim() || '',

          course:
            course.trim(),

          batchTime:
            batchTime.trim(),

          examDate,

          totalMarks:
            maximumMarks,

          passingMarks:
            minimumMarks,

          description:
            description?.trim() || '',

          teacherId:
            teacher._id,

          teacherName:
            teacher.name,

          status:
            'Upcoming',

        })


      await exam.save()


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createExamNotifications(

        exam.course,

        exam.batchTime,

        'New Exam',

        `${exam.examName} has been scheduled for your class on ${exam.examDate}.`,

        exam._id

      )


      return res.status(201).json({

        success: true,

        message:
          'Exam created successfully.',

        exam,

      })

    }

    catch (error) {

      console.log(

        'Create Exam Error:',
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
// UPDATE EXAM
// ======================================
//
// PUT /api/teacher/exams/:id
// ======================================

router.put(

  '/teacher/exams/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const exam =
        await Exam.findById(
          req.params.id
        )


      if (!exam) {

        return res.status(404).json({

          success: false,

          message:
            'Exam not found.',

        })

      }


      // ==================================
      // OWNERSHIP CHECK
      // ==================================

      if (

        exam.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to modify this exam.',

        })

      }


      const {

        examName,

        examType,

        subject,

        course,

        batchTime,

        examDate,

        totalMarks,

        passingMarks,

        description,

        status,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (

        !examName ||
        !course ||
        !batchTime ||
        !examDate ||
        totalMarks ===
          undefined

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Required exam fields are missing.',

        })

      }


      const maximumMarks =
        Number(totalMarks)


      const minimumMarks =
        Number(
          passingMarks || 0
        )


      if (

        Number.isNaN(
          maximumMarks
        ) ||

        maximumMarks <= 0

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Total marks must be greater than 0.',

        })

      }


      if (

        Number.isNaN(
          minimumMarks
        ) ||

        minimumMarks < 0 ||

        minimumMarks >
          maximumMarks

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Passing marks are invalid.',

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

      exam.examName =
        examName.trim()


      exam.examType =
        examType || 'Class Test'


      exam.subject =
        subject?.trim() || ''


      exam.course =
        course.trim()


      exam.batchTime =
        batchTime.trim()


      exam.examDate =
        examDate


      exam.totalMarks =
        maximumMarks


      exam.passingMarks =
        minimumMarks


      exam.description =
        description?.trim() || ''


      if (status) {

        exam.status =
          status

      }


      await exam.save()


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createExamNotifications(

        exam.course,

        exam.batchTime,

        'Exam Updated',

        `${exam.examName} has been updated. Please check the latest exam details.`,

        exam._id

      )


      return res.status(200).json({

        success: true,

        message:
          'Exam updated successfully.',

        exam,

      })

    }

    catch (error) {

      console.log(

        'Update Exam Error:',
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
// DELETE EXAM
// ======================================
//
// DELETE /api/teacher/exams/:id
// ======================================

router.delete(

  '/teacher/exams/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const exam =
        await Exam.findById(
          req.params.id
        )


      if (!exam) {

        return res.status(404).json({

          success: false,

          message:
            'Exam not found.',

        })

      }


      // ==================================
      // OWNERSHIP CHECK
      // ==================================

      if (

        exam.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to delete this exam.',

        })

      }


      // ==================================
      // SAVE DATA BEFORE DELETE
      // ==================================

      const examCourse =
        exam.course

      const examBatchTime =
        exam.batchTime

      const examName =
        exam.examName

      const examId =
        exam._id


      // ==================================
      // DELETE EXAM
      // ==================================

      await Exam.findByIdAndDelete(

        req.params.id

      )


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createExamNotifications(

        examCourse,

        examBatchTime,

        'Exam Removed',

        `${examName} has been removed.`,

        examId

      )


      return res.status(200).json({

        success: true,

        message:
          'Exam deleted successfully.',

      })

    }

    catch (error) {

      console.log(

        'Delete Exam Error:',
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
// GET STUDENTS FOR EXAM MARKS
// ======================================
//
// GET /api/teacher/exams/:examId/students
// ======================================

router.get(

  '/teacher/exams/:examId/students',

  teacherAuth,

  async (req, res) => {

    try {

      const exam =
        await Exam.findById(
          req.params.examId
        )


      if (!exam) {

        return res.status(404).json({

          success: false,

          message:
            'Exam not found.',

        })

      }


      // ==================================
      // OWNERSHIP CHECK
      // ==================================

      if (

        exam.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to access this exam.',

        })

      }


      // ==================================
      // GET STUDENTS
      // ==================================

      const students =
        await Student.find({

          course:
            exam.course,

          batchTime:
            exam.batchTime,

        })

        .sort({

          name: 1,

        })


      // ==================================
      // GET EXISTING MARKS
      // ==================================

      const existingMarks =
        await Marks.find({

          examId:
            exam._id,

        })


      const marksMap = {}


      existingMarks.forEach(

        (mark) => {

          marksMap[
            mark.studentId.toString()
          ] = mark

        }

      )


      // ==================================
      // RESPONSE
      // ==================================

      const result =
        students.map(

          (student) => {

            const existing =
              marksMap[
                student._id.toString()
              ]


            return {

              _id:
                student._id,

              name:
                student.name,

              admissionNumber:
                student.admissionNumber,

              rollNumber:
                student.rollNumber || '',

              course:
                student.course,

              batchTime:
                student.batchTime,

              obtainedMarks:
                existing
                  ? existing.obtainedMarks
                  : '',

              remarks:
                existing
                  ? existing.remarks
                  : '',

              result:
                existing
                  ? existing.result
                  : '',

            }

          }

        )


      return res.status(200).json({

        success: true,

        exam,

        students:
          result,

      })

    }

    catch (error) {

      console.log(

        'Get Exam Students Error:',
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
// SAVE BULK MARKS
// ======================================
//
// POST /api/teacher/exams/:examId/marks
// ======================================

router.post(

  '/teacher/exams/:examId/marks',

  teacherAuth,

  async (req, res) => {

    try {

      const {

        marks,

      } = req.body


      if (
        !Array.isArray(marks)
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Marks data is required.',

        })

      }


      const exam =
        await Exam.findById(
          req.params.examId
        )


      if (!exam) {

        return res.status(404).json({

          success: false,

          message:
            'Exam not found.',

        })

      }


      // ==================================
      // OWNERSHIP
      // ==================================

      if (

        exam.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to modify this exam.',

        })

      }


      const savedMarks = []


      // ==================================
      // PROCESS MARKS
      // ==================================

      for (
        const item of marks
      ) {

        if (
          !item.studentId
        ) {

          continue

        }


        const student =
          await Student.findById(
            item.studentId
          )


        if (!student) {

          continue

        }


        // ==================================
        // STUDENT COURSE + BATCH CHECK
        // ==================================

        const sameCourse =
          student.course
            ?.trim()
            .toLowerCase() ===
          exam.course
            ?.trim()
            .toLowerCase()


        const sameBatch =
          student.batchTime
            ?.trim()
            .toLowerCase() ===
          exam.batchTime
            ?.trim()
            .toLowerCase()


        if (
          !sameCourse ||
          !sameBatch
        ) {

          continue

        }


        // ==================================
        // MARK VALIDATION
        // ==================================

        const obtained =
          Number(
            item.obtainedMarks
          )


        if (

          Number.isNaN(obtained) ||

          obtained < 0 ||

          obtained >
            exam.totalMarks

        ) {

          continue

        }


        const result =
          obtained >=
          exam.passingMarks

            ? 'Pass'

            : 'Fail'


        // ==================================
        // SAVE / UPDATE MARKS
        // ==================================

        const mark =
          await Marks.findOneAndUpdate(

            {

              examId:
                exam._id,

              studentId:
                student._id,

            },

            {

              examId:
                exam._id,

              studentId:
                student._id,

              studentName:
                student.name,

              admissionNumber:
                student.admissionNumber,

              rollNumber:
                student.rollNumber || '',

              obtainedMarks:
                obtained,

              remarks:
                item.remarks || '',

              result,

            },

            {

              returnDocument:
                'after',

              upsert:
                true,

              runValidators:
                true,

              setDefaultsOnInsert:
                true,

            }

          )


        // ==================================
        // STUDENT NOTIFICATION
        // ==================================

        await createMarksNotifications(

          student._id,

          student.name,

          exam.examName,

          obtained,

          exam.totalMarks,

          result,

          mark._id

        )


        // ==================================
        // ADD RESULT
        // ==================================

        savedMarks.push(
          mark
        )

      }


      // ==================================
      // MARK EXAM COMPLETED
      // ==================================

      exam.status =
        'Completed'


      await exam.save()


      return res.status(200).json({

        success: true,

        message:
          'Marks saved successfully.',

        marks:
          savedMarks,

      })

    }

    catch (error) {

      console.log(

        'Save Exam Marks Error:',
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