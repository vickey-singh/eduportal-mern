const express = require('express')

const router = express.Router()

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const Student =
  require('../models/Student')

const Timetable =
  require('../models/Timetable')

const Attendance =
  require('../models/Attendance')

const Assignment =
  require('../models/Assignment')

const StudyMaterial =
  require('../models/StudyMaterial')

const Exam =
  require('../models/Exam')

const Marks =
  require('../models/Marks')

const Announcement =
  require('../models/Announcement')

const TeacherMessage =
  require('../models/TeacherMessage')

const Faculty =
  require('../models/Faculty')

const razorpay =
  require('../config/razorpay')

const crypto =
  require('crypto')

const Payment =
  require('../models/Payment')

const Receipt =
  require('../models/Receipt')

const saveReceipt =
  require('../utils/saveReceipt')

const createNotification =
  require('../utils/createNotification')

const StudentAccount =
  require('../models/StudentAccount')

const studentAuth =
  require('../middleware/studentAuth')


// ======================================
// HELPER
// CONVERT DOB TO DDMMYYYY
// ======================================

const normalizeDOB =
  (dob) => {

    if (!dob) {

      return ''

    }


    const value =
      String(dob)
        .trim()


    // ==================================
    // DDMMYYYY
    // ==================================

    if (
      /^\d{8}$/.test(value)
    ) {

      return value

    }


    // ==================================
    // DD/MM/YYYY
    // ==================================

    if (
      /^\d{2}\/\d{2}\/\d{4}$/.test(
        value
      )
    ) {

      const [
        day,
        month,
        year,
      ] =
        value.split('/')


      return (
        `${day}${month}${year}`
      )

    }


    // ==================================
    // DD-MM-YYYY
    // ==================================

    if (
      /^\d{2}-\d{2}-\d{4}$/.test(
        value
      )
    ) {

      const [
        day,
        month,
        year,
      ] =
        value.split('-')


      return (
        `${day}${month}${year}`
      )

    }


    // ==================================
    // YYYY-MM-DD
    // ==================================

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        value
      )
    ) {

      const [
        year,
        month,
        day,
      ] =
        value.split('-')


      return (
        `${day}${month}${year}`
      )

    }


    // ==================================
    // FALLBACK
    // ==================================

    return (

      value
        .replace(
          /[^0-9]/g,
          ''
        )

    )

  }


// ======================================
// STUDENT PORTAL LOGIN
// ======================================
//
// Student ID:
// Admission Number
//
// Password:
// DOB → DDMMYYYY
// ======================================

router.post(

  '/student/login',

  async (req, res) => {

    try {

      const {

        studentId,

        password,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !studentId ||
        !password
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student ID and password are required.',

        })

      }


      // ==================================
      // CLEAN INPUT
      // ==================================

      const admissionNumber =
        String(
          studentId
        )
          .trim()


      const enteredPassword =
        String(
          password
        )
          .trim()


      // ==================================
      // FIND STUDENT
      // ==================================

      const student =
        await Student.findOne({

          admissionNumber,

        })


      if (!student) {

        return res.status(401).json({

          success: false,

          message:
            'Invalid Student ID or password.',

        })

      }


      // ==================================
      // CHECK STUDENT ACCOUNT
      // ======================================

      let account =
        await StudentAccount.findOne({

          studentId:
            student._id,

        })


      // ======================================
      // CREATE ACCOUNT IF NOT EXISTS
      // ======================================
      //
      // Existing students ke liye account
      // automatically create ho jayega.
      //
      // Initial password:
      // DOB → DDMMYYYY
      // ======================================

      if (!account) {

        const studentDOB =
          normalizeDOB(
            student.dob
          )


        if (!studentDOB) {

          return res.status(400).json({

            success: false,

            message:
              'Student date of birth is not available. Please contact Admin.',

          })

        }


        const passwordHash =
          await bcrypt.hash(

            studentDOB,

            10

          )


        account =
          await StudentAccount.create({

            studentId:
              student._id,

            admissionNumber:
              student.admissionNumber,

            passwordHash,

            isStudent: true,

            accountStatus:
              'Active',

          })

      }


      // ======================================
      // ACCOUNT STATUS
      // ======================================

      if (
        !account.isStudent ||
        account.accountStatus !== 'Active'
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Student account is inactive. Please contact Admin.',

        })

      }


      // ======================================
      // COMPARE PASSWORD
      // ======================================

      const isMatch =
        await bcrypt.compare(

          enteredPassword,

          account.passwordHash

        )


      if (!isMatch) {

        return res.status(401).json({

          success: false,

          message:
            'Invalid Student ID or password.',

        })

      }


      // ======================================
      // GENERATE JWT
      // ======================================

      const token =
        jwt.sign(

          {

            id:
              student._id,

            accountId:
              account._id,

            role:
              'student',

            admissionNumber:
              student.admissionNumber,

          },

          'Prerna Institute Of Excellence_secret_key',

          {

            expiresIn:
              '7d',

          }

        )


      // ======================================
      // STUDENT RESPONSE
      // ======================================

      return res.status(200).json({

        success: true,

        message:
          'Login Successful',

        token,

        student,

      })

    }

    catch (error) {

      console.log(
        'Student Portal Login Error:',
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
// GET LOGGED-IN STUDENT
// ======================================

router.get(

  '/student/me',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // FIND STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      // ==================================
      // STUDENT NOT FOUND
      // ==================================

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        student,

      })

    }

    catch (error) {

      console.log(
        'Get Student Profile Error:',
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
// GET MY COURSES / CLASSES
// ======================================

router.get(

  '/student/courses',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // FIND STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // FIND COURSE
      // ==================================

      const Course =
        require('../models/Course')


      const course =
        await Course.findOne({

          courseName:
            student.course,

        })


      // ==================================
      // COURSE NOT FOUND
      // ==================================

      if (!course) {

        return res.status(404).json({

          success: false,

          message:
            'Course information not found.',

        })

      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        course: {

          courseName:
            course.courseName,

          courseCode:
            course.courseCode,

          description:
            course.description,

          duration:
            course.duration,

          batchTime:
            student.batchTime ||
            course.batchTime ||
            '',

          totalFee:
            course.totalFee,

          registrationFee:
            course.registrationFee,

          installmentAllowed:
            course.installmentAllowed,

          status:
            course.status,

        },

        admissionDate:
          student.admissionDate,

      })

    }

    catch (error) {

      console.log(
        'Get Student Courses Error:',
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
// GET STUDENT TIMETABLE
// ======================================
//
// GET /api/student/timetable
//
// Student ka course + batchTime
// Teacher ke Timetable se match hoga.
// ======================================

router.get(

  '/student/timetable',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET LOGGED-IN STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      // ==================================
      // STUDENT NOT FOUND
      // ==================================

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // CHECK COURSE
      // ==================================

      if (!student.course) {

        return res.status(404).json({

          success: false,

          message:
            'Student course is not assigned.',

        })

      }


      // ==================================
      // CHECK BATCH
      // ==================================

      if (!student.batchTime) {

        return res.status(404).json({

          success: false,

          message:
            'Student batch is not assigned.',

        })

      }


      // ==================================
      // GET TIMETABLE
      // ==================================

      const timetable =
        await Timetable.find({

          course: {

            $regex:
              `^${student.course.trim()}$`,

            $options:
              'i',

          },

          batchTime: {

            $regex:
              `^${student.batchTime.trim()}$`,

            $options:
              'i',

          },

          status:
            'Active',

        })

        .populate({

          path:
            'teacherId',

          select:
            'name teacherId designation subject',

        })

        .sort({

          day: 1,

          startTime: 1,

        })


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        count:
          timetable.length,

        course:
          student.course,

        batchTime:
          student.batchTime,

        timetable,

      })

    }

    catch (error) {

      console.log(

        'Get Student Timetable Error:',

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
// GET MY DAILY / ALL ATTENDANCE
// ======================================
//
// GET /api/student/attendance
//
// Logged-in student only.
// ======================================

router.get(

  '/student/attendance',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // GET ATTENDANCE
      // ==================================

      const attendance =
        await Attendance.find({

          student:
            student._id,

        })

        .sort({

          date: -1,

        })


      // ==================================
      // SUMMARY
      // ==================================

      const total =
        attendance.length


      const present =
        attendance.filter(

          (item) =>
            item.status === 'Present'

        ).length


      const absent =
        attendance.filter(

          (item) =>
            item.status === 'Absent'

        ).length


      const percentage =
        total > 0

          ? Number(

              (
                present /
                total

              ) * 100

            ).toFixed(2)

          : 0


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        student: {

          _id:
            student._id,

          name:
            student.name,

          admissionNumber:
            student.admissionNumber,

          course:
            student.course,

          batchTime:
            student.batchTime || '',

        },

        summary: {

          total,

          present,

          absent,

          percentage,

        },

        attendance,

      })

    }

    catch (error) {

      console.log(

        'Student Daily Attendance Error:',

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
// GET MY MONTHLY ATTENDANCE
// ======================================
//
// GET /api/student/attendance/monthly
//
// Query:
// ?year=2026&month=8
// ======================================

router.get(

  '/student/attendance/monthly',

  studentAuth,

  async (req, res) => {

    try {

      const {

        year,

        month,

      } = req.query


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !year ||
        !month
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Year and month are required.',

        })

      }


      const numericYear =
        Number(year)


      const numericMonth =
        Number(month)


      if (

        !Number.isInteger(
          numericYear
        ) ||

        !Number.isInteger(
          numericMonth
        ) ||

        numericMonth < 1 ||

        numericMonth > 12

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid year or month.',

        })

      }


      // ==================================
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // DATE RANGE
      // ==================================

      const monthString =
        String(
          numericMonth
        ).padStart(
          2,
          '0'
        )


      const startDate =
        `${numericYear}-${monthString}-01`


      const nextMonth =
        numericMonth + 1


      let endDate


      if (
        nextMonth > 12
      ) {

        endDate =
          `${numericYear + 1}-01-01`

      }

      else {

        endDate =
          `${numericYear}-${String(
            nextMonth
          ).padStart(
            2,
            '0'
          )}-01`

      }


      // ==================================
      // GET ATTENDANCE
      // ==================================

      const attendance =
        await Attendance.find({

          student:
            student._id,

          date: {

            $gte:
              startDate,

            $lt:
              endDate,

          },

        })

        .sort({

          date: 1,

        })


      // ==================================
      // SUMMARY
      // ==================================

      const total =
        attendance.length


      const present =
        attendance.filter(

          (item) =>
            item.status === 'Present'

        ).length


      const absent =
        attendance.filter(

          (item) =>
            item.status === 'Absent'

        ).length


      const percentage =
        total > 0

          ? Number(

              (
                present /
                total

              ) * 100

            ).toFixed(2)

          : 0


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        year:
          numericYear,

        month:
          numericMonth,

        summary: {

          total,

          present,

          absent,

          percentage,

        },

        attendance,

      })

    }

    catch (error) {

      console.log(

        'Student Monthly Attendance Error:',

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
// GET MY YEARLY ATTENDANCE
// ======================================
//
// GET /api/student/attendance/yearly
//
// Query:
// ?year=2026
// ======================================

router.get(

  '/student/attendance/yearly',

  studentAuth,

  async (req, res) => {

    try {

      const {

        year,

      } = req.query


      // ==================================
      // VALIDATION
      // ==================================

      if (!year) {

        return res.status(400).json({

          success: false,

          message:
            'Year is required.',

        })

      }


      const numericYear =
        Number(year)


      if (
        !Number.isInteger(
          numericYear
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid year.',

        })

      }


      // ==================================
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // DATE RANGE
      // ==================================

      const startDate =
        `${numericYear}-01-01`


      const endDate =
        `${numericYear + 1}-01-01`


      // ==================================
      // GET ATTENDANCE
      // ==================================

      const attendance =
        await Attendance.find({

          student:
            student._id,

          date: {

            $gte:
              startDate,

            $lt:
              endDate,

          },

        })

        .sort({

          date: 1,

        })


      // ==================================
      // YEARLY SUMMARY
      // ==================================

      const total =
        attendance.length


      const present =
        attendance.filter(

          (item) =>
            item.status === 'Present'

        ).length


      const absent =
        attendance.filter(

          (item) =>
            item.status === 'Absent'

        ).length


      const percentage =
        total > 0

          ? Number(

              (
                present /
                total

              ) * 100

            ).toFixed(2)

          : 0


      // ==================================
      // MONTHLY SUMMARY
      // ==================================

      const monthlySummary = {}


      attendance.forEach(

        (item) => {

          const month =
            item.date.substring(
              0,
              7
            )


          if (
            !monthlySummary[month]
          ) {

            monthlySummary[month] = {

              total: 0,

              present: 0,

              absent: 0,

              percentage: 0,

            }

          }


          monthlySummary[
            month
          ].total += 1


          if (
            item.status ===
            'Present'
          ) {

            monthlySummary[
              month
            ].present += 1

          }


          if (
            item.status ===
            'Absent'
          ) {

            monthlySummary[
              month
            ].absent += 1

          }

        }

      )


      // ==================================
      // MONTHLY PERCENTAGE
      // ==================================

      Object.keys(
        monthlySummary
      ).forEach(

        (month) => {

          const data =
            monthlySummary[
              month
            ]


          data.percentage =
            data.total > 0

              ? Number(

                  (
                    data.present /
                    data.total

                  ) * 100

                ).toFixed(2)

              : 0

        }

      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        year:
          numericYear,

        summary: {

          total,

          present,

          absent,

          percentage,

        },

        monthlySummary,

        attendance,

      })

    }

    catch (error) {

      console.log(

        'Student Yearly Attendance Error:',

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
// GET STUDENT ASSIGNMENTS
// ======================================
//
// GET /api/student/assignments
//
// Logged-in student ke course + batch
// ke assignments milenge.
// ======================================

router.get(

  '/student/assignments',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET LOGGED-IN STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      // ==================================
      // STUDENT NOT FOUND
      // ==================================

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // COURSE CHECK
      // ==================================

      if (!student.course) {

        return res.status(404).json({

          success: false,

          message:
            'Student course is not assigned.',

        })

      }


      // ==================================
      // BATCH CHECK
      // ==================================

      if (!student.batchTime) {

        return res.status(404).json({

          success: false,

          message:
            'Student batch is not assigned.',

        })

      }


      // ==================================
      // GET ASSIGNMENTS
      // ======================================

      const assignments =
        await Assignment.find({

          course: {

            $regex:
              `^${student.course.trim()}$`,

            $options:
              'i',

          },

          batchTime: {

            $regex:
              `^${student.batchTime.trim()}$`,

            $options:
              'i',

          },

          status:
            'Active',

        })

        .sort({

          dueDate: 1,

          createdAt: -1,

        })


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        course:
          student.course,

        batchTime:
          student.batchTime,

        count:
          assignments.length,

        assignments,

      })

    }

    catch (error) {

      console.log(

        'Get Student Assignments Error:',

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
// GET STUDENT STUDY MATERIALS
// ======================================
//
// GET /api/student/materials
//
// Logged-in student ke course + batch
// ke Active study materials milenge.
// ======================================

router.get(

  '/student/materials',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET LOGGED-IN STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      // ==================================
      // STUDENT NOT FOUND
      // ==================================

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // COURSE CHECK
      // ==================================

      if (!student.course) {

        return res.status(404).json({

          success: false,

          message:
            'Student course is not assigned.',

        })

      }


      // ==================================
      // BATCH CHECK
      // ==================================

      if (!student.batchTime) {

        return res.status(404).json({

          success: false,

          message:
            'Student batch is not assigned.',

        })

      }


      // ==================================
      // GET MATERIALS
      // ==================================

      const materials =
        await StudyMaterial.find({

          course: {

            $regex:
              `^${student.course.trim()}$`,

            $options:
              'i',

          },

          batchTime: {

            $regex:
              `^${student.batchTime.trim()}$`,

            $options:
              'i',

          },

          status:
            'Active',

        })

        .populate({

          path:
            'teacherId',

          select:
            'name teacherId designation subject',

        })

        .sort({

          createdAt: -1,

        })


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        course:
          student.course,

        batchTime:
          student.batchTime,

        count:
          materials.length,

        materials,

      })

    }

    catch (error) {

      console.log(

        'Get Student Study Materials Error:',

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
// GET STUDENT MARKS & EXAMS
// ======================================
//
// GET /api/student/exams
//
// Logged-in student ke exams + marks
// return karega.
// ======================================

router.get(

  '/student/exams',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET LOGGED-IN STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      // ==================================
      // STUDENT NOT FOUND
      // ==================================

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // COURSE CHECK
      // ==================================

      if (!student.course) {

        return res.status(404).json({

          success: false,

          message:
            'Student course is not assigned.',

        })

      }


      // ==================================
      // BATCH CHECK
      // ==================================

      if (!student.batchTime) {

        return res.status(404).json({

          success: false,

          message:
            'Student batch is not assigned.',

        })

      }


      // ==================================
      // GET EXAMS
      // ==================================

      const exams =
        await Exam.find({

          course: {

            $regex:
              `^${student.course.trim()}$`,

            $options:
              'i',

          },

          batchTime: {

            $regex:
              `^${student.batchTime.trim()}$`,

            $options:
              'i',

          },

          status: {

            $ne:
              'Cancelled',

          },

        })

        .sort({

          examDate: -1,

          createdAt: -1,

        })


      // ==================================
      // GET STUDENT MARKS
      // ==================================

      const marks =
        await Marks.find({

          studentId:
            student._id,

        })


      // ==================================
      // CREATE MARKS MAP
      // ==================================

      const marksMap = {}


      marks.forEach(

        (mark) => {

          marksMap[
            mark.examId.toString()
          ] = mark

        }

      )


      // ==================================
      // COMBINE EXAM + MARKS
      // ==================================

      const results =
        exams.map(

          (exam) => {

            const mark =
              marksMap[
                exam._id.toString()
              ]


            const obtainedMarks =
              mark
                ? mark.obtainedMarks
                : null


            const percentage =

              mark && exam.totalMarks > 0

                ? Number(

                    (

                      (
                        mark.obtainedMarks /
                        exam.totalMarks

                      ) * 100

                    ).toFixed(2)

                  )

                : null


            return {

              examId:
                exam._id,

              examName:
                exam.examName,

              examType:
                exam.examType,

              subject:
                exam.subject,

              course:
                exam.course,

              batchTime:
                exam.batchTime,

              examDate:
                exam.examDate,

              totalMarks:
                exam.totalMarks,

              passingMarks:
                exam.passingMarks,

              description:
                exam.description,

              teacherName:
                exam.teacherName,

              status:
                exam.status,

              obtainedMarks,

              percentage,

              result:
                mark
                  ? mark.result
                  : null,

              remarks:
                mark
                  ? mark.remarks
                  : '',

              marksAvailable:
                Boolean(mark),

            }

          }

        )


      // ==================================
      // OVERALL SUMMARY
      // ==================================

      const completedResults =
        results.filter(

          (item) =>
            item.marksAvailable

        )


      const totalExams =
        results.length


      const examsWithMarks =
        completedResults.length


      const passedExams =
        completedResults.filter(

          (item) =>
            item.result ===
            'Pass'

        ).length


      const failedExams =
        completedResults.filter(

          (item) =>
            item.result ===
            'Fail'

        ).length


      // ==================================
      // OVERALL PERCENTAGE
      // ==================================

      let overallPercentage = 0


      if (
        completedResults.length > 0
      ) {

        const totalObtained =
          completedResults.reduce(

            (
              total,
              item
            ) =>

              total +
              Number(
                item.obtainedMarks || 0
              ),

            0

          )


        const totalMaximum =
          completedResults.reduce(

            (
              total,
              item
            ) =>

              total +
              Number(
                item.totalMarks || 0
              ),

            0

          )


        if (
          totalMaximum > 0
        ) {

          overallPercentage =
            Number(

              (

                (
                  totalObtained /
                  totalMaximum

                ) * 100

              ).toFixed(2)

            )

        }

      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        student: {

          _id:
            student._id,

          name:
            student.name,

          admissionNumber:
            student.admissionNumber,

          course:
            student.course,

          batchTime:
            student.batchTime,

        },

        summary: {

          totalExams,

          examsWithMarks,

          passedExams,

          failedExams,

          overallPercentage,

        },

        exams:
          results,

      })

    }

    catch (error) {

      console.log(

        'Get Student Exams Error:',

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
// GET STUDENT ANNOUNCEMENTS
// ======================================
//
// GET /api/student/announcements
//
// Logged-in student ke course + batch
// ke active announcements milenge.
// Expired announcements automatically hide
// honge.
// ======================================

router.get(

  '/student/announcements',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET LOGGED-IN STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      // ==================================
      // STUDENT NOT FOUND
      // ==================================

      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // COURSE CHECK
      // ==================================

      if (!student.course) {

        return res.status(404).json({

          success: false,

          message:
            'Student course is not assigned.',

        })

      }


      // ==================================
      // BATCH CHECK
      // ==================================

      if (!student.batchTime) {

        return res.status(404).json({

          success: false,

          message:
            'Student batch is not assigned.',

        })

      }


      // ==================================
      // TODAY
      // ==================================

      const today =
        new Date()
          .toISOString()
          .split('T')[0]


      // ==================================
      // GET ANNOUNCEMENTS
      // ==================================
      //
      // Conditions:
      // 1. Same course
      // 2. Same batch
      // 3. Active
      // 4. No expiry OR expiry >= today
      //
      // ==================================

      const announcements =
        await Announcement.find({

          course: {

            $regex:
              `^${student.course.trim()}$`,

            $options:
              'i',

          },

          batchTime: {

            $regex:
              `^${student.batchTime.trim()}$`,

            $options:
              'i',

          },

          status:
            'Active',

          $or: [

            {

              expiryDate: {

                $exists: false,

              },

            },

            {

              expiryDate: '',

            },

            {

              expiryDate: {

                $gte:
                  today,

              },

            },

          ],

        })

        .populate({

          path:
            'teacherId',

          select:
            'name teacherId designation subject',

        })

        .sort({

          priority: -1,

          createdAt: -1,

        })


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        course:
          student.course,

        batchTime:
          student.batchTime,

        count:
          announcements.length,

        announcements,

      })

    }

    catch (error) {

      console.log(

        'Get Student Announcements Error:',

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
// GET STUDENT MESSAGES
// ======================================
//
// GET /api/student/messages
//
// Student ke sent + received messages.
// ======================================

router.get(

  '/student/messages',

  studentAuth,

  async (req, res) => {

    try {

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      const messages =
        await TeacherMessage.find({

          $or: [

            {

              senderType:
                'Student',

              senderId:
                student._id,

            },

            {

              receiverType:
                'Student',

              receiverId:
                student._id,

            },

          ],

          status:
            'Sent',

        })

        .sort({

          createdAt: 1,

        })


      return res.status(200).json({

        success: true,

        count:
          messages.length,

        messages,

      })

    }

    catch (error) {

      console.log(

        'Get Student Messages Error:',

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
// GET STUDENT TEACHERS
// ======================================
//
// GET /api/student/messages/teachers
//
// Student ke course + batch ke assigned
// teachers milenge.
// ======================================

router.get(

  '/student/messages/teachers',

  studentAuth,

  async (req, res) => {

    try {

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      const teachers =
        await Faculty.find({

          isTeacher:
            true,

          accountStatus:
            'Active',

          'assignedClasses': {

            $elemMatch: {

              batchTime: {

                $regex:
                  `^${student.batchTime?.trim()}$`,

                $options:
                  'i',

              },

            },

          },

        })

        .populate(
          'assignedClasses.courseId'
        )


      // ==================================
      // FILTER COURSE + BATCH
      // ==================================

      const matchedTeachers = []


      teachers.forEach(

        (teacher) => {

          const assigned =
            (
              teacher.assignedClasses ||
              []
            ).some(

              (assignment) => {

                const courseName =
                  assignment.courseId
                    ?.courseName


                const courseMatch =

                  courseName
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


          if (assigned) {

            matchedTeachers.push({

              _id:
                teacher._id,

              name:
                teacher.name,

              designation:
                teacher.designation || '',

              subject:
                teacher.subject || '',

            })

          }

        }

      )


      return res.status(200).json({

        success: true,

        count:
          matchedTeachers.length,

        teachers:
          matchedTeachers,

      })

    }

    catch (error) {

      console.log(

        'Get Student Message Teachers Error:',

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
// SEND STUDENT MESSAGE
// ======================================
//
// POST /api/student/messages
// ======================================

router.post(

  '/student/messages',

  studentAuth,

  async (req, res) => {

    try {

      const {

        teacherId,

        subject,

        message,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !teacherId ||
        !subject ||
        !message
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Teacher, subject and message are required.',

        })

      }


      // ==================================
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // GET TEACHER
      // ==================================

      const teacher =
        await Faculty.findById(
          teacherId
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
      // TEACHER ACCOUNT CHECK
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
      // VERIFY TEACHER ASSIGNMENT
      // ==================================

      const assigned =
        (
          teacher.assignedClasses ||
          []
        ).some(

          (assignment) => {

            const courseName =
              assignment.courseId
                ?.courseName


            const courseMatch =

              courseName
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
            'You are not allowed to message this teacher.',

        })

      }


      // ==================================
      // CREATE MESSAGE
      // ==================================

      const newMessage =
        await TeacherMessage.create({

          senderType:
            'Student',

          senderId:
            student._id,

          receiverType:
            'Teacher',

          receiverId:
            teacher._id,

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

        'Send Student Message Error:',

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
// MARK STUDENT MESSAGE AS READ
// ======================================
//
// PUT /api/student/messages/:id/read
// ======================================

router.put(

  '/student/messages/:id/read',

  studentAuth,

  async (req, res) => {

    try {

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      const message =
        await TeacherMessage.findOne({

          _id:
            req.params.id,

          receiverType:
            'Student',

          receiverId:
            student._id,

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

        'Mark Student Message Read Error:',

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
// GET STUDENT FEES & PAYMENT DETAILS
// ======================================
//
// GET /api/student/fees
//
// Logged-in student only.
// Student ID frontend se nahi aayegi.
// req.student.id se student identify hoga.
// ======================================

router.get(

  '/student/fees',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET LOGGED-IN STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // PAYMENT HISTORY
      // ==================================

      const paymentHistory =
        (
          student.paymentHistory ||
          []
        )
          .slice()
          .sort(

            (a, b) => {

              return (
                new Date(
                  b.paymentDate ||
                  b.createdAt ||
                  0
                ) -

                new Date(
                  a.paymentDate ||
                  a.createdAt ||
                  0
                )
              )

            }

          )


      // ==================================
      // SELECTED PAYMENT PLAN
      // ==================================

      let installmentAmount = 0


      switch (
        student.paymentPlan
      ) {

        case 'monthly':

          installmentAmount =
            Number(
              student.monthlyInstallment ||
              0
            )

          break


        case 'three_month':

          installmentAmount =
            Number(
              student.threeMonthInstallment ||
              0
            )

          break


        case 'six_month':

          installmentAmount =
            Number(
              student.sixMonthInstallment ||
              0
            )

          break


        case 'full':

          installmentAmount =
            Number(
              student.fullPaymentFee ||
              student.remainingFees ||
              0
            )

          break


        default:

          installmentAmount =
            0

      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        student: {

          _id:
            student._id,

          name:
            student.name,

          admissionNumber:
            student.admissionNumber,

          email:
            student.email,

          contact:
            student.contact,

          course:
            student.course,

          batchTime:
            student.batchTime,

        },

        fees: {

          // ==================================
          // REGISTRATION
          // ==================================

          registrationFee:
            Number(
              student.registrationFee ||
              0
            ),

          registrationFeePaid:
            Number(
              student.registrationFeePaid ||
              0
            ),

          registrationFeeStatus:
            student.registrationFeeStatus ||
            'Pending',


          // ==================================
          // COURSE FEE
          // ==================================

          totalFees:
            Number(
              student.totalFees ||
              0
            ),

          paidFees:
            Number(
              student.paidFees ||
              0
            ),

          remainingFees:
            Number(
              student.remainingFees ||
              0
            ),

          feesStatus:
            student.feesStatus ||
            'Pending',


          // ==================================
          // PAYMENT PLAN
          // ==================================

          paymentPlan:
            student.paymentPlan ||
            '',

          installmentAmount,


          monthlyInstallment:
            Number(
              student.monthlyInstallment ||
              0
            ),

          threeMonthInstallment:
            Number(
              student.threeMonthInstallment ||
              0
            ),

          sixMonthInstallment:
            Number(
              student.sixMonthInstallment ||
              0
            ),

          fullPaymentFee:
            Number(
              student.fullPaymentFee ||
              0
            ),


          // ==================================
          // DUE DATE
          // ==================================

          dueDate:
            student.dueDate ||
            '',


          // ==================================
          // LAST PAYMENT MODE
          // ==================================

          paymentMode:
            student.paymentMode ||
            'Offline',

        },


        // ==================================
        // PAYMENT HISTORY
        // ==================================

        paymentHistory,

      })

    }

    catch (error) {

      console.log(

        'Get Student Fees Error:',

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
// GET STUDENT RECEIPTS
// ======================================
//
// GET /api/student/fees/receipts
//
// Only receipts belonging to the
// logged-in student will be returned.
// ======================================

router.get(

  '/student/fees/receipts',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // GET RECEIPTS
      // ==================================

      const receipts =
        await Receipt.find({

          admissionNumber:
            student.admissionNumber,

        })

        .sort({

          paymentDate: -1,

          createdAt: -1,

        })


      return res.status(200).json({

        success: true,

        count:
          receipts.length,

        receipts,

      })

    }

    catch (error) {

      console.log(

        'Get Student Receipts Error:',

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
// GET SINGLE STUDENT RECEIPT
// ======================================
//
// GET /api/student/fees/receipts/:receiptNumber
//
// Receipt number ke saath bhi
// student ownership verify hogi.
// ======================================

router.get(

  '/student/fees/receipts/:receiptNumber',

  studentAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // GET RECEIPT
      // ==================================

      const receipt =
        await Receipt.findOne({

          receiptNumber:
            req.params.receiptNumber,

          admissionNumber:
            student.admissionNumber,

        })


      if (!receipt) {

        return res.status(404).json({

          success: false,

          message:
            'Receipt not found.',

        })

      }


      return res.status(200).json({

        success: true,

        receipt,

      })

    }

    catch (error) {

      console.log(

        'Get Student Receipt Error:',

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
// CREATE STUDENT RAZORPAY ORDER
// ======================================
//
// POST /api/student/fees/create-order
//
// Body:
//
// {
//   amount: 5000,
//   paymentPlan: "monthly"
// }
//
// Student ID frontend se nahi aayegi.
// ======================================

router.post(

  '/student/fees/create-order',

  studentAuth,

  async (req, res) => {

    try {

      const {

        amount,

        paymentPlan,

      } = req.body


      // ==================================
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // REMAINING FEE
      // ==================================

      const remaining =
        Number(
          student.remainingFees ||
          0
        )


      if (
        remaining <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course fee is already fully paid.',

        })

      }


      // ==================================
      // PAYMENT AMOUNT
      // ==================================

      const paymentAmount =
        Number(amount)


      if (
        !paymentAmount ||
        paymentAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Enter a valid payment amount.',

        })

      }


      // ==================================
      // CANNOT EXCEED REMAINING
      // ==================================

      if (
        paymentAmount >
        remaining
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Payment cannot be greater than remaining fee of ₹${remaining}.`,

        })

      }


      // ==================================
      // PAYMENT PLAN
      // ==================================

      let selectedPlan =
        student.paymentPlan ||
        ''


      // ==================================
      // FIRST ONLINE PAYMENT
      // ==================================

      if (!selectedPlan) {

        if (!paymentPlan) {

          return res.status(400).json({

            success: false,

            message:
              'Please select a payment plan.',

          })

        }


        selectedPlan =
          paymentPlan

      }


      // ==================================
      // VALID PAYMENT PLAN
      // ==================================

      const validPlans = [

        'monthly',

        'three_month',

        'six_month',

        'full',

      ]


      if (
        !validPlans.includes(
          selectedPlan
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid payment plan.',

        })

      }


      // ==================================
      // PREVENT PLAN CHANGE
      // ==================================

      if (

        student.paymentPlan &&

        paymentPlan &&

        paymentPlan !==
          student.paymentPlan

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment plan cannot be changed.',

        })

      }


      // ==================================
      // PLAN AMOUNT
      // ==================================

      let planAmount = 0


      switch (
        selectedPlan
      ) {

        case 'monthly':

          planAmount =
            Number(
              student.monthlyInstallment ||
              0
            )

          break


        case 'three_month':

          planAmount =
            Number(
              student.threeMonthInstallment ||
              0
            )

          break


        case 'six_month':

          planAmount =
            Number(
              student.sixMonthInstallment ||
              0
            )

          break


        case 'full':

          planAmount =
            Number(
              student.fullPaymentFee ||
              remaining
            )

          break

      }


      // ==================================
      // FULL PAYMENT
      // ==================================

      if (
        selectedPlan === 'full'
      ) {

        const fullPaymentAmount =
          Math.min(

            planAmount > 0
              ? planAmount
              : remaining,

            remaining

          )


        if (
          paymentAmount !==
          fullPaymentAmount
        ) {

          return res.status(400).json({

            success: false,

            message:
              `Full payment amount must be ₹${fullPaymentAmount}.`,

          })

        }

      }


      // ==================================
      // INSTALLMENT
      // ==================================

      else {

        const minimumAmount =
          Math.min(

            planAmount,

            remaining

          )


        if (
          minimumAmount <= 0
        ) {

          return res.status(400).json({

            success: false,

            message:
              'Selected payment plan amount is not configured.',

          })

        }


        if (
          paymentAmount <
          minimumAmount
        ) {

          return res.status(400).json({

            success: false,

            message:
              `Minimum payment for this plan is ₹${minimumAmount}.`,

          })

        }

      }


      // ==================================
      // RAZORPAY ORDER
      // ==================================

      const options = {

        amount:
          Math.round(
            paymentAmount * 100
          ),

        currency:
          'INR',

        receipt:
          `student_fee_${Date.now()}`,

        notes: {

          studentId:
            student._id.toString(),

          admissionNumber:
            student.admissionNumber,

          paymentPlan:
            selectedPlan,

        },

      }


      const order =
        await razorpay.orders.create(
          options
        )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        order,

        paymentPlan:
          selectedPlan,

        amount:
          paymentAmount,

      })

    }

    catch (error) {

      console.log(

        'Student Create Payment Order Error:',

        error

      )


      return res.status(500).json({

        success: false,

        message:
          'Unable to create Razorpay order.',

      })

    }

  }

)


// ======================================
// VERIFY STUDENT ONLINE PAYMENT
// ======================================
//
// POST /api/student/fees/verify
//
// Body:
//
// {
//   amountPaid,
//   paymentPlan,
//   transactionId,
//   orderId,
//   signature
// }
// ======================================

router.post(

  '/student/fees/verify',

  studentAuth,

  async (req, res) => {

    try {

      const {

        amountPaid,

        paymentPlan,

        transactionId,

        orderId,

        signature,

      } = req.body


      // ==================================
      // BASIC VALIDATION
      // ==================================

      if (

        !amountPaid ||

        !transactionId ||

        !orderId ||

        !signature

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Incomplete payment information.',

        })

      }


      // ==================================
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.student.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // CHECK REMAINING
      // ==================================

      const remaining =
        Number(
          student.remainingFees ||
          0
        )


      if (
        remaining <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course fee is already fully paid.',

        })

      }


      // ==================================
      // DUPLICATE PAYMENT CHECK
      // ==================================

      const duplicatePayment =
        await Payment.findOne({

          $or: [

            {

              transactionId,

            },

            {

              razorpayPaymentId:
                transactionId,

            },

          ],

        })


      if (
        duplicatePayment
      ) {

        return res.status(400).json({

          success: false,

          message:
            'This payment has already been processed.',

        })

      }


      // ==================================
      // RAZORPAY SIGNATURE
      // ==================================

      const signatureBody =

        orderId +
        '|' +
        transactionId


      const expectedSignature =

        crypto

          .createHmac(

            'sha256',

            process.env.RAZORPAY_KEY_SECRET

          )

          .update(
            signatureBody
          )

          .digest('hex')


      if (
        expectedSignature !==
        signature
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment verification failed.',

        })

      }


      // ==================================
      // PAYMENT AMOUNT
      // ==================================

      const amount =
        Number(amountPaid)


      if (
        !amount ||
        amount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid payment amount.',

        })

      }


      // ==================================
      // CANNOT EXCEED REMAINING
      // ==================================

      if (
        amount >
        remaining
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Payment cannot be greater than remaining fee of ₹${remaining}.`,

        })

      }


      // ==================================
      // PAYMENT PLAN
      // ==================================

      let selectedPlan =
        student.paymentPlan ||
        paymentPlan ||
        ''


      if (!selectedPlan) {

        return res.status(400).json({

          success: false,

          message:
            'Payment plan is required.',

        })

      }


      // ==================================
      // VALID PLAN
      // ==================================

      const validPlans = [

        'monthly',

        'three_month',

        'six_month',

        'full',

      ]


      if (
        !validPlans.includes(
          selectedPlan
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid payment plan.',

        })

      }


      // ==================================
      // PREVENT PLAN CHANGE
      // ==================================

      if (

        student.paymentPlan &&

        student.paymentPlan !==
          selectedPlan

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment plan cannot be changed.',

        })

      }


      // ==================================
      // PLAN AMOUNT
      // ==================================

      let planAmount = 0


      switch (
        selectedPlan
      ) {

        case 'monthly':

          planAmount =
            Number(
              student.monthlyInstallment ||
              0
            )

          break


        case 'three_month':

          planAmount =
            Number(
              student.threeMonthInstallment ||
              0
            )

          break


        case 'six_month':

          planAmount =
            Number(
              student.sixMonthInstallment ||
              0
            )

          break


        case 'full':

          planAmount =
            Number(
              student.fullPaymentFee ||
              remaining
            )

          break

      }


      // ==================================
      // FULL PAYMENT
      // ==================================

      if (
        selectedPlan === 'full'
      ) {

        const fullPaymentAmount =
          Math.min(

            planAmount > 0
              ? planAmount
              : remaining,

            remaining

          )


        if (
          amount !==
          fullPaymentAmount
        ) {

          return res.status(400).json({

            success: false,

            message:
              `Full payment amount must be ₹${fullPaymentAmount}.`,

          })

        }

      }


      // ==================================
      // INSTALLMENT
      // ==================================

      else {

        const minimumAmount =
          Math.min(

            planAmount,

            remaining

          )


        if (
          minimumAmount <= 0
        ) {

          return res.status(400).json({

            success: false,

            message:
              'Selected payment plan amount is not configured.',

          })

        }


        if (
          amount <
          minimumAmount
        ) {

          return res.status(400).json({

            success: false,

            message:
              `Minimum payment for this plan is ₹${minimumAmount}.`,

          })

        }

      }


      // ==================================
      // PAYMENT TYPE
      // ==================================

      const paymentType =

        selectedPlan === 'full'

          ? 'Full'

          : 'Installment'


      // ==================================
      // PAYMENT DATE
      // ==================================

      const finalPaymentDate =

        new Date()


      // ==================================
      // UPDATE PAID FEES
      // ==================================

      student.paidFees =

        Number(
          student.paidFees ||
          0
        ) +

        amount


      // ==================================
      // UPDATE REMAINING
      // ==================================

      student.remainingFees =

        Math.max(

          0,

          Number(
            student.totalFees ||
            0
          ) -

          Number(
            student.paidFees ||
            0
          )

        )


      // ==================================
      // FEES STATUS
      // ==================================

      if (
        student.remainingFees === 0
      ) {

        student.feesStatus =
          'Paid'

      }

      else if (
        student.paidFees > 0
      ) {

        student.feesStatus =
          'Partial'

      }

      else {

        student.feesStatus =
          'Pending'

      }


      // ==================================
      // LOCK PAYMENT PLAN
      // ==================================

      student.paymentPlan =
        selectedPlan


      // ==================================
      // PAYMENT MODE
      // ==================================

      student.paymentMode =
        'Online'


      // ==================================
      // PAYMENT HISTORY
      // ==================================

      student.paymentHistory.push({

        amount,

        paymentCategory:
          'CourseFee',

        paymentMethod:
          'Razorpay',

        paymentType,

        paymentPlan:
          selectedPlan,

        paymentMode:
          'Online',

        paymentStatus:
          'Success',

        transactionId,

        orderId,

        paymentDate:
          finalPaymentDate
            .toISOString()
            .split('T')[0],

      })


      // ==================================
      // SAVE STUDENT
      // ==================================

      await student.save()


      // ==================================
      // SAVE RECEIPT
      // ==================================

      const receipt =
        await saveReceipt({

          student,

          amountPaid:
            amount,

          paymentType,

          paymentCategory:
            'CourseFee',

          paymentPlan:
            selectedPlan,

          transactionId,

          orderId,

        })


      // ==================================
      // SAVE PAYMENT COLLECTION
      // ==================================

      const payment =
        await Payment.create({

          studentName:
            student.name,

          admissionNumber:
            student.admissionNumber,

          email:
            student.email,

          phone:
            student.contact,

          course:
            student.course,

          totalFee:
            student.totalFees,

          registrationFee:
            student.registrationFee,

          paymentCategory:
            'CourseFee',

          paymentPlan:
            selectedPlan,

          paymentType,

          amountPaid:
            amount,

          paymentMethod:
            'Razorpay',

          paymentMode:
            'Online',

          paymentStatus:
            'Success',

          transactionId,

          razorpayOrderId:
            orderId,

          razorpayPaymentId:
            transactionId,

          razorpaySignature:
            signature,

        })


      // ==================================
      // ADMIN NOTIFICATION
      // ==================================

      try {

        await createNotification({

          type:
            'Payment',

          title:
            'Course Fee Payment Received',

          message:
            `${student.name} has made a course fee payment of ₹${amount}.`,

          link:
            '/admin/payments',

          relatedId:
            payment._id.toString(),

        })

      }

      catch (notificationError) {

        console.log(

          'Payment Notification Error:',

          notificationError

        )

      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Payment verified successfully.',

        payment,

        receipt,

        fees: {

          totalFees:
            student.totalFees,

          paidFees:
            student.paidFees,

          remainingFees:
            student.remainingFees,

          feesStatus:
            student.feesStatus,

          paymentPlan:
            student.paymentPlan,

        },

      })

    }

    catch (error) {

      console.log(

        'Student Payment Verification Error:',

        error

      )


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Payment verification failed.',

      })

    }

  }

)

// ======================================
// EXPORT
// ======================================

module.exports =
  router