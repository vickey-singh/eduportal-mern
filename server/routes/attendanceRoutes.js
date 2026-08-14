const express = require('express')

const router = express.Router()


const Attendance =
  require('../models/Attendance')

const Student =
  require('../models/Student')

const StudentNotification =
  require('../models/StudentNotification')

const teacherAuth =
  require('../middleware/teacherAuth')


// ======================================
// CREATE STUDENT ATTENDANCE NOTIFICATION
// ======================================

const createAttendanceNotification =
  async (

    studentId,
    studentName,
    status,
    date,
    relatedId

  ) => {

    try {

      const message =

        status === 'Removed'

          ? `Your attendance record for ${date} has been removed.`

          : `Your attendance for ${date} has been marked as ${status}.`


      await StudentNotification.create({

        studentId,

        type:
          'Attendance',

        title:
          'Attendance Updated',

        message,

        link:
          '/student/attendance',

        relatedId:
          String(relatedId),

        isRead:
          false,

      })

    }

    catch (error) {

      console.log(

        'Create Student Attendance Notification Error:',
        error

      )

      // Notification fail hone par
      // attendance operation fail nahi hoga.

    }

  }


// ======================================
// GET STUDENTS FOR TEACHER ATTENDANCE
// ======================================
//
// GET
// /api/teacher/attendance/students
//
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
            'Course is required',

        })

      }


      // ==================================
      // STUDENT FILTER
      // ==================================

      const studentFilter = {

        course:
          course.trim(),

      }


      if (batchTime) {

        studentFilter.batchTime =
          batchTime.trim()

      }


      // ==================================
      // GET STUDENTS
      // ==================================

      const students =
        await Student.find(
          studentFilter
        )
        .sort({

          name: 1,

        })


      // ==================================
      // EXISTING ATTENDANCE
      // ==================================

      let attendanceMap = {}


      if (date) {

        const attendanceQuery = {

          course:
            course.trim(),

          date,

        }


        if (batchTime) {

          attendanceQuery.batchTime =
            batchTime.trim()

        }


        const attendanceRecords =
          await Attendance.find(
            attendanceQuery
          )


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
      // RESPONSE
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

            course:
              student.course,

            batchTime:
              student.batchTime || '',

            contact:
              student.contact || '',

            email:
              student.email || '',

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

        'Get Attendance Students Error:',
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
// SAVE / UPDATE SINGLE ATTENDANCE
// ======================================
//
// POST
// /api/attendance
//
// ======================================

router.post(

  '/attendance',

  teacherAuth,

  async (req, res) => {

    try {

      const {

        student,
        date,
        status,

      } = req.body


      // ==================================
      // VALIDATION
      // ==================================

      if (

        !student ||
        !date ||
        !status

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student, date and status are required',

        })

      }


      if (

        ![
          'Present',
          'Absent',
        ].includes(status)

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid attendance status',

        })

      }


      // ==================================
      // GET STUDENT
      // ==================================

      const studentData =
        await Student.findById(
          student
        )


      if (!studentData) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }


      // ==================================
      // SAVE / UPDATE
      // ==================================

      const attendance =
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
      // CREATE NOTIFICATION
      // ==================================

      await createAttendanceNotification(

        studentData._id,

        studentData.name,

        attendance.status,

        attendance.date,

        attendance._id

      )


      return res.status(200).json({

        success: true,

        message:
          'Attendance Saved Successfully',

        attendance,

      })

    }

    catch (error) {

      console.log(

        'Save Attendance Error:',
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
// SAVE MULTIPLE ATTENDANCE
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
            'Date and attendance data are required',

        })

      }


      if (
        attendance.length === 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'No attendance data provided',

        })

      }


      // ==================================
      // RESULTS
      // ==================================

      const results = []


      // ==================================
      // PROCESS EACH STUDENT
      // ==================================

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

        await createAttendanceNotification(

          studentData._id,

          studentData.name,

          record.status,

          record.date,

          record._id

        )


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

        'Bulk Attendance Error:',
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
// GET STUDENT ATTENDANCE
// ======================================

router.get(

  '/attendance/student/:studentId',

  async (req, res) => {

    try {

      const {

        studentId,

      } = req.params


      const student =
        await Student.findById(
          studentId
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }


      const attendance =
        await Attendance.find({

          student:
            studentId,

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

        'Get Student Attendance Error:',
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
// MONTHLY ATTENDANCE
// ======================================

router.get(

  '/attendance/student/:studentId/monthly',

  async (req, res) => {

    try {

      const {

        studentId,

      } = req.params


      const {

        year,
        month,

      } = req.query


      if (

        !year ||
        !month

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Year and month are required',

        })

      }


      const monthString =
        String(month)
          .padStart(
            2,
            '0'
          )


      const startDate =
        `${year}-${monthString}-01`


      const endMonth =
        Number(month) + 1


      let endDate


      if (
        endMonth > 12
      ) {

        endDate =
          `${Number(year) + 1}-01-01`

      }

      else {

        endDate =
          `${year}-${String(
            endMonth
          ).padStart(
            2,
            '0'
          )}-01`

      }


      const attendance =
        await Attendance.find({

          student:
            studentId,

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


      return res.status(200).json({

        success: true,

        year:
          Number(year),

        month:
          Number(month),

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

        'Monthly Attendance Error:',
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
// YEARLY ATTENDANCE
// ======================================

router.get(

  '/attendance/student/:studentId/yearly',

  async (req, res) => {

    try {

      const {

        studentId,

      } = req.params


      const {

        year,

      } = req.query


      if (!year) {

        return res.status(400).json({

          success: false,

          message:
            'Year is required',

        })

      }


      const startDate =
        `${year}-01-01`


      const endDate =
        `${Number(year) + 1}-01-01`


      const attendance =
        await Attendance.find({

          student:
            studentId,

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

              total:
                0,

              present:
                0,

              absent:
                0,

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

          else if (

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
      // ADD PERCENTAGE
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


      return res.status(200).json({

        success: true,

        year:
          Number(year),

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

        'Yearly Attendance Error:',
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
// DELETE ATTENDANCE
// ======================================

router.delete(

  '/attendance/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const attendance =
        await Attendance.findById(
          req.params.id
        )


      if (!attendance) {

        return res.status(404).json({

          success: false,

          message:
            'Attendance Record Not Found',

        })

      }


      // ==================================
      // DELETE ATTENDANCE
      // ==================================

      await Attendance.findByIdAndDelete(

        req.params.id

      )


      // ==================================
      // NOTIFY STUDENT
      // ==================================

      await createAttendanceNotification(

        attendance.student,

        attendance.studentName,

        'Removed',

        attendance.date,

        attendance._id

      )


      return res.status(200).json({

        success: true,

        message:
          'Attendance Deleted Successfully',

      })

    }

    catch (error) {

      console.log(

        'Delete Attendance Error:',
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