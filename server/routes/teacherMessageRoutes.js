const express = require('express')

const router = express.Router()

const TeacherMessage =
  require('../models/TeacherMessage')

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
// GET TEACHER STUDENTS
// ======================================
//
// GET /api/teacher/messages/students
// ======================================

router.get(

  '/teacher/messages/students',

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


      const assignedClasses =
        teacher.assignedClasses || []


      const assignedCourses =
        assignedClasses.map(

          (assignment) => ({

            course:
              assignment.courseId
                ?.courseName || '',

            batchTime:
              assignment.batchTime || '',

          })

        )


      const queryConditions =
        assignedCourses.map(

          (assignment) => ({

            course:
              assignment.course,

            batchTime:
              assignment.batchTime,

          })

        )


      if (
        queryConditions.length === 0
      ) {

        return res.status(200).json({

          success: true,

          count: 0,

          students: [],

        })

      }


      const students =
        await Student.find({

          $or:
            queryConditions,

        })

        .select(

          '_id name fatherName admissionNumber course batchTime'

        )

        .sort({

          name: 1,

        })


      return res.status(200).json({

        success: true,

        count:
          students.length,

        students,

      })

    }

    catch (error) {

      console.log(

        'Get Teacher Message Students Error:',

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
// GET TEACHER MESSAGES
// ======================================
//
// GET /api/teacher/messages
//
// OLD → NEW ORDER
// Newest message will appear at bottom.
// ======================================

router.get(

  '/teacher/messages',

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


      // ==================================
      // GET MESSAGES
      // ==================================

      const messages =
        await TeacherMessage.find({

          $or: [

            {

              senderType:
                'Teacher',

              senderId:
                teacher._id,

            },

            {

              receiverType:
                'Teacher',

              receiverId:
                teacher._id,

            },

          ],

          status:
            'Sent',

        })

        // ==================================
        // OLD → NEW
        // ==================================

        .sort({

          createdAt: 1,

        })

        .lean()


      // ==================================
      // GET STUDENT IDS
      // ==================================

      const studentIds = []


      messages.forEach(

        (message) => {

          // ==================================
          // STUDENT SENDER
          // ==================================

          if (

            message.senderType ===
            'Student'

          ) {

            studentIds.push(

              message.senderId

            )

          }


          // ==================================
          // STUDENT RECEIVER
          // ==================================

          if (

            message.receiverType ===
            'Student'

          ) {

            studentIds.push(

              message.receiverId

            )

          }

        }

      )


      // ==================================
      // REMOVE DUPLICATE IDS
      // ==================================

      const uniqueStudentIds = [

        ...new Set(

          studentIds.map(

            (id) =>
              id.toString()

          )

        ),

      ]


      // ==================================
      // GET STUDENT DETAILS
      // ==================================

      const students =
        await Student.find({

          _id: {

            $in:
              uniqueStudentIds,

          },

        })

        .select(

          '_id name fatherName admissionNumber course batchTime'

        )

        .lean()


      // ==================================
      // CREATE STUDENT MAP
      // ==================================

      const studentMap = {}


      students.forEach(

        (student) => {

          studentMap[
            student._id.toString()
          ] =
            student

        }

      )


      // ==================================
      // ADD STUDENT DETAILS
      // ==================================

      const enrichedMessages =
        messages.map(

          (message) => {

            let student = null


            // ==================================
            // STUDENT SENT MESSAGE
            // ==================================

            if (

              message.senderType ===
              'Student'

            ) {

              student =
                studentMap[

                  message.senderId
                    .toString()

                ] ||

                null

            }


            // ==================================
            // TEACHER SENT MESSAGE
            // ==================================

            if (

              message.receiverType ===
              'Student'

            ) {

              student =
                studentMap[

                  message.receiverId
                    .toString()

                ] ||

                null

            }


            return {

              ...message,

              student,

            }

          }

        )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        count:
          enrichedMessages.length,

        messages:
          enrichedMessages,

      })

    }

    catch (error) {

      console.log(

        'Get Teacher Messages Error:',

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
// SEND MESSAGE
// ======================================
//
// POST /api/teacher/messages
// ======================================

router.post(

  '/teacher/messages',

  teacherAuth,

  async (req, res) => {

    try {

      const {

        studentId,

        course,

        subject,

        message,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !studentId ||
        !course ||
        !subject ||
        !message
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student, course, subject and message are required.',

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
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(
          studentId
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // VERIFY STUDENT COURSE
      // ==================================

      if (

        student.course
          ?.trim()
          .toLowerCase() !==

        course
          ?.trim()
          .toLowerCase()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'Student does not belong to the selected course.',

        })

      }


      // ==================================
      // VERIFY TEACHER ASSIGNMENT
      // ==================================

      const assignedClasses =
        teacher.assignedClasses || []


      const assigned =
        assignedClasses.some(

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

              student.course
                ?.trim()
                .toLowerCase()


            const batchMatch =
              assignment.batchTime
                ?.trim()
                .toLowerCase() ===

              student.batchTime
                ?.trim()
                .toLowerCase()


            return (

              courseMatch &&
              batchMatch

            )

          }

        )


      if (!assigned) {

        return res.status(403).json({

          success: false,

          message:
            'You are not assigned to this student.',

        })

      }


      // ==================================
      // CREATE MESSAGE
      // ==================================

      const newMessage =
        await TeacherMessage.create({

          senderType:
            'Teacher',

          senderId:
            teacher._id,

          receiverType:
            'Student',

          receiverId:
            student._id,

          course:
            student.course,

          subject:
            subject.trim(),

          message:
            message.trim(),

          isRead:
            false,

          status:
            'Sent',

        })


      // ==================================
      // CREATE STUDENT NOTIFICATION
      // ==================================

      await StudentNotification.create({

        studentId:
          student._id,

        type:
          'Message',

        title:
          'New Message',

        message:
          `${teacher.name} sent you a new message: ${subject.trim()}`,

        link:
          '/student/messages',

        relatedId:
          String(newMessage._id),

        isRead:
          false,

      })


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(201).json({

        success: true,

        message:
          'Message sent successfully.',

        data:
          newMessage,

      })

    }

    catch (error) {

      console.log(

        'Send Teacher Message Error:',

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
// MARK MESSAGE AS READ
// ======================================
//
// PUT /api/teacher/messages/:id/read
// ======================================

router.put(

  '/teacher/messages/:id/read',

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


      const message =
        await TeacherMessage.findOne({

          _id:
            req.params.id,

          receiverType:
            'Teacher',

          receiverId:
            teacher._id,

        })


      if (!message) {

        return res.status(404).json({

          success: false,

          message:
            'Message not found.',

        })

      }


      message.isRead =
        true


      await message.save()


      return res.status(200).json({

        success: true,

        message:
          'Message marked as read.',

      })

    }

    catch (error) {

      console.log(

        'Mark Teacher Message Read Error:',

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
// DELETE MESSAGE
// ======================================
//
// DELETE /api/teacher/messages/:id
// ======================================

router.delete(

  '/teacher/messages/:id',

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


      const message =
        await TeacherMessage.findOne({

          _id:
            req.params.id,

          senderType:
            'Teacher',

          senderId:
            teacher._id,

        })


      if (!message) {

        return res.status(404).json({

          success: false,

          message:
            'Message not found or unauthorized.',

        })

      }


      message.status =
        'Deleted'


      await message.save()


      return res.status(200).json({

        success: true,

        message:
          'Message deleted successfully.',

      })

    }

    catch (error) {

      console.log(

        'Delete Teacher Message Error:',

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