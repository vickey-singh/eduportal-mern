const express = require('express')
const router = express.Router()
const Attendance =
  require('../models/Attendance')
const Student =
  require('../models/Student')
const StudentNotification =
  require('../models/StudentNotification')
const sendAbsentEmail = require('../utils/sendAbsentEmail')
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
// SEND ABSENT EMAILS FOR A DATE
// ======================================

const sendAbsentAttendanceEmails = async (attendanceDate) => {
  const summary = {
    totalAbsent: 0,
    emailsSent: 0,
    emailsFailed: 0,
    emailsSkipped: 0,
  }

  try {
    const absentRecords = await Attendance.find({
      date: attendanceDate,
      status: 'Absent',
    }).populate('student', 'name email admissionNumber course batchTime')

    summary.totalAbsent = absentRecords.length

    // Recover a stuck Sending status after ten minutes.
    const staleBefore = new Date(Date.now() - 10 * 60 * 1000)

    for (const record of absentRecords) {
      let claimedRecord = null

      try {
        // Atomically claim the record to reduce duplicate sends
        // when the scheduled endpoint overlaps another request.
        claimedRecord = await Attendance.findOneAndUpdate(
          {
            _id: record._id,
            date: attendanceDate,
            status: 'Absent',
            $or: [
              { absentEmailStatus: { $in: ['NotSent', 'Failed'] } },
              { absentEmailStatus: { $exists: false } },
              {
                absentEmailStatus: 'Sending',
                absentEmailAttemptedAt: { $lt: staleBefore },
              },
              {
                absentEmailStatus: 'Sending',
                absentEmailAttemptedAt: { $exists: false },
              },
            ],
          },
          {
            $set: {
              absentEmailStatus: 'Sending',
              absentEmailAttemptedAt: new Date(),
              absentEmailError: '',
            },
          },
          { new: true }
        )

        if (!claimedRecord) {
          summary.emailsSkipped += 1
          continue
        }

        const student = record.student
        const email = student?.email?.trim()

        if (!email) {
          await Attendance.updateOne(
            { _id: claimedRecord._id, absentEmailStatus: 'Sending' },
            {
              $set: {
                absentEmailStatus: 'Failed',
                absentEmailError: 'Student email address is missing.',
              },
            }
          )

          summary.emailsFailed += 1
          console.warn('Absent email failed: student email missing.', {
            attendanceId: String(record._id),
            admissionNumber: record.admissionNumber,
            date: attendanceDate,
          })
          continue
        }

        await sendAbsentEmail({
          student: {
            name: student.name || record.studentName,
            email,
            admissionNumber:
              student.admissionNumber || record.admissionNumber,
            course: student.course || record.course,
            batchTime: student.batchTime || record.batchTime || '',
          },
          attendanceDate,
        })

        await Attendance.updateOne(
          { _id: claimedRecord._id, absentEmailStatus: 'Sending' },
          {
            $set: {
              absentEmailStatus: 'Sent',
              absentEmailSentAt: new Date(),
              absentEmailError: '',
            },
          }
        )

        summary.emailsSent += 1
      } catch (error) {
        summary.emailsFailed += 1

        console.error('Absent Student Email Failed:', {
          attendanceId: String(record._id),
          date: attendanceDate,
          error: error.response?.data || error.message,
        })

        // Email failures must not interrupt attendance finalization.
        try {
          if (claimedRecord) {
            await Attendance.updateOne(
              { _id: record._id, absentEmailStatus: 'Sending' },
              {
                $set: {
                  absentEmailStatus: 'Failed',
                  absentEmailError: String(
                    error.response?.data?.message ||
                    error.message ||
                    'Email sending failed'
                  ).slice(0, 500),
                },
              }
            )
          }
        } catch (statusError) {
          console.error(
            'Could not update absent email status:',
            statusError.message
          )
        }
      }
    }
  } catch (error) {
    console.error(
      'Absent Email Processing Error:',
      error.response?.data || error.message
    )
  }

  console.log('Absent Email Summary:', {
    date: attendanceDate,
    ...summary,
  })

  return summary
}


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
        course: course.trim(),
        studentStatus: 'Active',
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
            rollNumber:
              student.rollNumber || '',
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
// GET STUDENTS FOR ADMIN ATTENDANCE
// ======================================
//
// GET
// /api/admin/attendance/students
//
// Admin Attendance page ke liye.
//
// TeacherAuth nahi lagega.
//
// Course select karne par course ke
// saare students aur unke actual batchTime
// return honge.
//
// ======================================
router.get(
  '/admin/attendance/students',
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
        course: course.trim(),
        studentStatus: 'Active',
      }
      // ==================================
      // BATCH TIME FILTER
      // ==================================
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
            rollNumber:
              student.rollNumber || '',
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
        'Get Admin Attendance Students Error:',
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
// SAVE MULTIPLE ATTENDANCE FOR ADMIN
// ======================================
//
// POST
// /api/admin/attendance/bulk
//
// Admin Attendance page ke liye.
//
// TeacherAuth nahi lagega.
//
// ======================================
router.post(
  '/admin/attendance/bulk',
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
        'Admin Bulk Attendance Error:',
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
          rollNumber:
            student.rollNumber || '',
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
      res.status(500).json({
        success: false,
        message:
          'Server Error',
      })
    }
  }
)
// ======================================
// AUTOMATIC BIOMETRIC ABSENT
// ======================================
//
// POST
// /api/attendance/biometric/auto-absent
//
// Only students with biometricUserId are included.
// Existing attendance is never overwritten.
// Students without biometricUserId are ignored.
// There is no punch cutoff time.
// This endpoint should be called once per day by a scheduler.
// ======================================
router.post(
  '/attendance/biometric/auto-absent',
  async (req, res) => {
    try {
      const cronSecret =
        process.env.ATTENDANCE_CRON_SECRET
      if (!cronSecret) {
        return res.status(500).json({
          success: false,
          message: 'ATTENDANCE_CRON_SECRET is not configured.',
        })
      }
      const requestSecret =
        req.headers['x-attendance-cron-secret']
      if (!requestSecret || requestSecret !== cronSecret) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
      }
      const requestedDate =
        String(req.body?.date || req.query?.date || '').trim()
      const attendanceDate =
        requestedDate ||
        new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
      if (!/^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date. Use YYYY-MM-DD format.',
        })
      }
      // ==================================
      // ONLY BIOMETRIC-ENROLLED STUDENTS
      // ==================================
      const students =
        await Student.find({
          studentStatus: 'Active',
          biometricUserId: {
            $exists: true,
            $nin: ['', null],
          },
        })
          .select(
            '_id name admissionNumber course batchTime biometricUserId'
          )
          .lean()
      // ==================================
      // EXISTING ATTENDANCE
      // ==================================
      const studentIds = students.map(
        (student) => student._id
      )
      const existingAttendance =
        studentIds.length > 0
          ? await Attendance.find({
              date: attendanceDate,
              student: {
                $in: studentIds,
              },
            })
              .select('student status')
              .lean()
          : []
      const existingMap = new Map()
      existingAttendance.forEach((record) => {
        existingMap.set(
          String(record.student),
          record.status
        )
      })
      // ==================================
      // CREATE ABSENT ONLY WHEN NO RECORD
      // ==================================
      let absentCreated = 0
      let alreadyMarked = 0
      for (const student of students) {
        const studentKey = String(student._id)
        // Present / Absent / manually entered record
        // already exists. Never overwrite it.
        if (existingMap.has(studentKey)) {
          alreadyMarked += 1
          continue
        }
        try {
          const record =
            await Attendance.create({
              student: student._id,
              studentName: student.name,
              admissionNumber:
                student.admissionNumber,
              course: student.course,
              batchTime:
                student.batchTime || '',
              date: attendanceDate,
              status: 'Absent',
            })
          absentCreated += 1
          await createAttendanceNotification(
            student._id,
            student.name,
            'Absent',
            attendanceDate,
            record._id
          )
        }
        catch (error) {
          // Duplicate record created concurrently.
          if (error?.code === 11000) {
            alreadyMarked += 1
            continue
          }
          throw error
        }
      }
      // Email processing is isolated and cannot fail attendance finalization.
      const absentEmailSummary =
        await sendAbsentAttendanceEmails(attendanceDate)
      return res.status(200).json({
        success: true,
        message:
          'Biometric attendance finalized successfully.',
        date: attendanceDate,
        biometricStudents:
          students.length,
        absentCreated,
        alreadyMarked,
        absentEmailSummary,
      })
    }
    catch (error) {
      console.log(
        'Automatic Biometric Absent Error:',
        error
      )
      return res.status(500).json({
        success: false,
        message: 'Server Error',
      })
    }
  }
)
// ======================================
// EXPORT
// ======================================
module.exports =
  router
