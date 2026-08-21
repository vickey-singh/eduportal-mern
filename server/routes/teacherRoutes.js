const express = require('express')

const router = express.Router()

const bcrypt =
  require('bcryptjs')

const jwt =
  require('jsonwebtoken')

const Faculty =
  require('../models/Faculty')

const Student =
  require('../models/Student')

const Attendance =
  require('../models/Attendance')

const StudentNotification =
  require('../models/StudentNotification')

const teacherAuth =
  require('../middleware/teacherAuth')


// ======================================
// TEACHER LOGIN
// ======================================

router.post(

  '/teacher/login',

  async (req, res) => {

    try {

      const {

        teacherId,
        password,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !teacherId ||
        !password
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Teacher ID and password are required.',

        })

      }


      // ==================================
      // FIND TEACHER
      // ==================================

      const teacher =
        await Faculty.findOne({

          teacherId:
            teacherId
              .trim()
              .toUpperCase(),

          isTeacher:
            true,

        })


      // ==================================
      // TEACHER NOT FOUND
      // ==================================

      if (!teacher) {

        return res.status(401).json({

          success: false,

          message:
            'Invalid Teacher ID or password.',

        })

      }


      // ==================================
      // ACCOUNT STATUS
      // ==================================

      if (
        teacher.accountStatus ===
        'Inactive'
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Teacher account is inactive. Please contact Admin.',

        })

      }


      // ==================================
      // PASSWORD CHECK
      // ==================================

      const isMatch =
        await bcrypt.compare(

          password,

          teacher.passwordHash

        )


      if (!isMatch) {

        return res.status(401).json({

          success: false,

          message:
            'Invalid Teacher ID or password.',

        })

      }


      // ==================================
      // GENERATE JWT
      // ==================================

      const token =
        jwt.sign(

          {

            id:
              teacher._id,

            teacherId:
              teacher.teacherId,

            role:
              'teacher',

          },

          'Prerna Institute Of Excellence_secret_key',

          {

            expiresIn:
              '7d',

          }

        )


      // ==================================
      // TEACHER DATA
      // ======================================

      const teacherData = {

        id:
          teacher._id,

        teacherId:
          teacher.teacherId,

        name:
          teacher.name,

        designation:
          teacher.designation,

        experience:
          teacher.experience,

        subject:
          teacher.subject,

        image:
          teacher.image,

        description:
          teacher.description,

      }


      // ==================================
      // RESPONSE
      // ==================================

      res.status(200).json({

        success: true,

        message:
          'Teacher Login Successful',

        token,

        teacher:
          teacherData,

      })

    }

    catch (error) {

      console.log(
        'Teacher Login Error:',
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
// GET LOGGED-IN TEACHER
// ======================================

router.get(

  '/teacher/me',

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
        .select(
          '-passwordHash'
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


      return res.status(200).json({

        success: true,

        teacher,

      })

    }

    catch (error) {

      console.log(
        'Get Teacher Error:',
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
// GET TEACHER'S ASSIGNED STUDENTS
// ======================================

router.get(

  '/teacher/students',

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


      // ==================================
      // BUILD COURSE + BATCH FILTER
      // ==================================

      const assignedFilters = []


      for (
        const assignment
        of teacher.assignedClasses || []
      ) {

        const course =
          assignment.courseId


        if (
          !course ||
          !course.courseName
        ) {

          continue

        }


        assignedFilters.push({

          course:
            course.courseName,

          batchTime:
            assignment.batchTime || '',

        })

      }


      // ==================================
      // NO ASSIGNMENT
      // ==================================

      if (
        assignedFilters.length === 0
      ) {

        return res.status(200).json({

          success: true,

          students: [],

          count: 0,

        })

      }


      // ==================================
      // GET STUDENTS
      // ==================================

      const students =
        await Student.find({

          $or:
            assignedFilters,

        })

        .select(

          'name ' +

          'admissionNumber ' +

          'rollNumber ' +

          'course ' +

          'batchTime ' +

          'fatherName ' +

          'admissionDate ' +

          'image'

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

        'Get Teacher Students Error:',
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
// GET TEACHER ATTENDANCE STUDENTS
// ======================================

router.get(

  '/teacher/attendance/students',

  teacherAuth,

  async (req, res) => {

    try {

      const {

        course,
        batchTime,
        date,

      } = req.query


      // ==================================
      // VALIDATION
      // ==================================

      if (!course) {

        return res.status(400).json({

          success: false,

          message:
            'Course is required.',

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
      // CHECK COURSE + BATCH ASSIGNMENT
      // ==================================

      const assignment =
        (
          teacher.assignedClasses || []
        )
        .find(

          (item) => {

            const assignedCourse =
              item.courseId


            if (!assignedCourse) {

              return false

            }


            const courseMatch =
              assignedCourse.courseName
                ?.trim()
                .toLowerCase() ===
              course
                .trim()
                .toLowerCase()


            const batchMatch =
              !batchTime ||
              item.batchTime
                ?.trim()
                .toLowerCase() ===
              batchTime
                .trim()
                .toLowerCase()


            return (
              courseMatch &&
              batchMatch
            )

          }

        )


      if (!assignment) {

        return res.status(403).json({

          success: false,

          message:
            'This course or batch is not assigned to you.',

        })

      }


      // ==================================
      // STUDENT FILTER
      // ======================================

      const studentFilter = {

        course,

      }


      if (batchTime) {

        studentFilter.batchTime =
          batchTime

      }


      // ==================================
      // GET STUDENTS
      // ==================================

      const students =
        await Student.find(
          studentFilter
        )

        .select(

          'name ' +

          'admissionNumber ' +

          'rollNumber ' +

          'course ' +

          'batchTime ' +

          'fatherName ' +

          'admissionDate ' +

          'image'

        )

        .sort({

          name: 1,

        })


      // ==================================
      // GET EXISTING ATTENDANCE
      // ==================================

      let attendanceMap = {}


      if (date) {

        const studentIds =
          students.map(
            (student) =>
              student._id
          )


        const attendanceRecords =
          await Attendance.find({

            student: {

              $in:
                studentIds,

            },

            date,

          })


        attendanceRecords.forEach(
          (record) => {

            attendanceMap[
              record.student.toString()
            ] =
              record.status

          }
        )

      }


      // ==================================
      // RESPONSE DATA
      // ==================================

      const result =
        students.map(

          (student) => ({

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
              student.batchTime || '',

            fatherName:
              student.fatherName || '',

            admissionDate:
              student.admissionDate || '',

            attendanceStatus:
              attendanceMap[
                student._id.toString()
              ] || '',

          })

        )


      return res.status(200).json({

        success: true,

        students:
          result,

      })

    }

    catch (error) {

      console.log(

        'Teacher Attendance Students Error:',
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
// SAVE TEACHER BULK ATTENDANCE
// ======================================
//
// POST
// /api/teacher/attendance/bulk
//
// ======================================

router.post(

  '/teacher/attendance/bulk',

  teacherAuth,

  async (req, res) => {

    try {

      const {

        date,

        attendance,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !date ||
        !Array.isArray(attendance)
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Date and attendance data are required.',

        })

      }


      if (
        attendance.length === 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Attendance data is empty.',

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
      // PROCESS ATTENDANCE
      // ==================================

      const results = []


      for (
        const item of attendance
      ) {

        const {

          student,

          status,

        } = item


        // ==================================
        // VALIDATION
        // ==================================

        if (
          !student ||
          !status
        ) {

          continue

        }


        if (
          ![
            'Present',
            'Absent',
          ].includes(status)
        ) {

          continue

        }


        // ==================================
        // GET STUDENT
        // ==================================

        const studentData =
          await Student.findById(
            student
          )


        if (!studentData) {

          continue

        }


        // ==================================
        // CHECK TEACHER ASSIGNMENT
        // ==================================

        const isAssigned =
          (
            teacher.assignedClasses ||
            []
          )
          .some(

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
                studentData.course
                  ?.trim()
                  .toLowerCase()


              const batchMatch =
                assignment.batchTime
                  ?.trim()
                  .toLowerCase() ===
                studentData.batchTime
                  ?.trim()
                  .toLowerCase()


              return (
                courseMatch &&
                batchMatch
              )

            }

          )


        // ==================================
        // NOT ASSIGNED
        // ==================================

        if (!isAssigned) {

          continue

        }


        // ==================================
        // SAVE / UPDATE ATTENDANCE
        // ==================================

        const record =
          await Attendance.findOneAndUpdate(

            {

              student,

              date,

            },

            {

              student,

              studentName:
                studentData.name,

              admissionNumber:
                studentData.admissionNumber,

              rollNumber:
                studentData.rollNumber || '',

              course:
                studentData.course,

              batchTime:
                studentData.batchTime || '',

              date,

              status,

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
        // CREATE STUDENT NOTIFICATION
        // ==================================

        try {

          await StudentNotification.create({

            studentId:
              studentData._id,

            type:
              'Attendance',

            title:
              'Attendance Updated',

            message:
              `Your attendance for ${date} has been marked as ${status}.`,

            link:
              '/student/attendance',

            relatedId:
              String(record._id),

            isRead:
              false,

          })

        }

        catch (notificationError) {

          console.log(

            'Student Attendance Notification Error:',
            notificationError

          )

        }


        // ==================================
        // ADD RESULT
        // ==================================

        results.push(
          record
        )

      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Attendance Saved Successfully',

        attendance:
          results,

      })

    }

    catch (error) {

      console.log(

        'Teacher Bulk Attendance Error:',
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