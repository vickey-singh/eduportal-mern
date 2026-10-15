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

const adminAuth = require('../middleware/adminAuth')

const mongoose = require('mongoose')

const AttendanceSettings = require('../models/AttendanceSettings')

const AttendanceHoliday = require('../models/AttendanceHoliday')

// ======================================
// ATTENDANCE CALENDAR HELPERS
// ======================================

const DEFAULT_WORKING_DAYS = Object.freeze({
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: false,
})

const WEEKDAY_KEYS = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
]

const isValidDateKey = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
}

const getWeekdayKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return WEEKDAY_KEYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
}

const getAttendanceDayStatus = async (dateKey) => {
  const [settings, holiday] = await Promise.all([
    AttendanceSettings.findOne({ key: 'default' }).lean(),
    AttendanceHoliday.findOne({ startDate: { $lte: dateKey }, endDate: { $gte: dateKey } })
      .select('name startDate endDate')
      .lean(),
  ])

  // A saved holiday takes priority over the weekly working-day setting.
  if (holiday) {
    return { isWorkingDay: false, reason: 'holiday', holidayName: holiday.name }
  }

  const workingDays = { ...DEFAULT_WORKING_DAYS, ...(settings?.workingDays || {}) }
  const weekday = getWeekdayKey(dateKey)
  if (!workingDays[weekday]) {
    return { isWorkingDay: false, reason: 'weekly_off', holidayName: null }
  }

  return { isWorkingDay: true, reason: null, holidayName: null }
}

const normalizeWorkingDays = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const output = {}
  for (const day of Object.keys(DEFAULT_WORKING_DAYS)) {
    if (typeof input[day] !== 'boolean') return null
    output[day] = input[day]
  }
  return output
}

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

            ] = {

              status: record.status,

              remarks: record.remarks || '',

            }

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

              attendanceMap[student._id.toString()]?.status || '',

            attendanceRemarks:

              attendanceMap[student._id.toString()]?.remarks || '',

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

            ] = {

              status: record.status,

              remarks: record.remarks || '',

            }

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

              attendanceMap[student._id.toString()]?.status || '',

            attendanceRemarks:

              attendanceMap[student._id.toString()]?.remarks || '',

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

        remarks = '',

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

      if (!['Present', 'Absent', 'Late'].includes(status)) {

        return res.status(400).json({

          success: false,

          message: 'Invalid attendance status',

        })

      }

      if (typeof remarks !== 'string' || remarks.length > 500) {

        return res.status(400).json({

          success: false,

          message: 'Remarks must be text and cannot exceed 500 characters',

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

            remarks: remarks.trim(),

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

          remarks = '',

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

        if (!['Present', 'Absent', 'Late'].includes(status)) {

          continue

        }

        if (typeof remarks !== 'string' || remarks.length > 500) {

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

              remarks: remarks.trim(),

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

          remarks = '',

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

        if (!['Present', 'Absent', 'Late'].includes(status)) {

          continue

        }

        if (typeof remarks !== 'string' || remarks.length > 500) {

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

              remarks: remarks.trim(),

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

      const late =

        attendance.filter(

          (item) => item.status === 'Late'

        ).length

      const percentage =

        total > 0

          ? Number(

              (

                (present + late) /

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

          late,

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

      const late =

        attendance.filter(

          (item) => item.status === 'Late'

        ).length

      const percentage =

        total > 0

          ? Number(

              (

                (present + late) /

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

          late,

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

      const late =

        attendance.filter(

          (item) => item.status === 'Late'

        ).length

      const percentage =

        total > 0

          ? Number(

              (

                (present + late) /

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

              late:

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

          else if (item.status === 'Late') {

            monthlySummary[month].late += 1

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

                    (data.present + data.late) /

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

          late,

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
// ADMIN: WORKING DAYS AND HOLIDAY MANAGEMENT
// ======================================
// These routes use the existing adminAuth middleware. Holiday date ranges are inclusive.

router.get('/admin/attendance/settings', adminAuth, async (req, res) => {
  try {
    let settings = await AttendanceSettings.findOne({ key: 'default' }).lean()
    if (!settings) {
      settings = await AttendanceSettings.create({ key: 'default', workingDays: DEFAULT_WORKING_DAYS })
      settings = settings.toObject()
    }
    return res.status(200).json({
      success: true,
      settings: {
        workingDays: { ...DEFAULT_WORKING_DAYS, ...(settings.workingDays || {}) },
      },
    })
  } catch (error) {
    console.error('Get Attendance Settings Error:', error)
    return res.status(500).json({ success: false, message: 'Could not load attendance settings.' })
  }
})

router.put('/admin/attendance/settings', adminAuth, async (req, res) => {
  try {
    const workingDays = normalizeWorkingDays(req.body?.workingDays)
    if (!workingDays) {
      return res.status(400).json({
        success: false,
        message: 'workingDays must contain true/false values for Monday through Sunday.',
      })
    }

    const settings = await AttendanceSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: { workingDays } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean()

    return res.status(200).json({ success: true, message: 'Working days saved.', settings })
  } catch (error) {
    console.error('Update Attendance Settings Error:', error)
    return res.status(500).json({ success: false, message: 'Could not save working days.' })
  }
})

router.get('/admin/attendance/holidays', adminAuth, async (req, res) => {
  try {
    const holidays = await AttendanceHoliday.find({})
      .sort({ startDate: 1, name: 1 })
      .lean()
    return res.status(200).json({ success: true, holidays })
  } catch (error) {
    console.error('Get Attendance Holidays Error:', error)
    return res.status(500).json({ success: false, message: 'Could not load holidays.' })
  }
})

const validateHolidayPayload = (body) => {
  const name = String(body?.name || '').trim()
  const startDate = String(body?.startDate || '').trim()
  const endDate = String(body?.endDate || '').trim()
  if (!name || name.length > 120) return { error: 'Holiday name is required (maximum 120 characters).' }
  if (!isValidDateKey(startDate) || !isValidDateKey(endDate)) {
    return { error: 'Start and end dates must be valid dates in YYYY-MM-DD format.' }
  }
  if (endDate < startDate) return { error: 'End date cannot be earlier than start date.' }
  return { value: { name, startDate, endDate } }
}

router.post('/admin/attendance/holidays', adminAuth, async (req, res) => {
  try {
    const validation = validateHolidayPayload(req.body)
    if (validation.error) return res.status(400).json({ success: false, message: validation.error })
    const { name, startDate, endDate } = validation.value

    const overlap = await AttendanceHoliday.findOne({ startDate: { $lte: endDate }, endDate: { $gte: startDate } }).lean()
    if (overlap) {
      return res.status(409).json({
        success: false,
        message: `This date range overlaps with the existing holiday "${overlap.name}" (${overlap.startDate} to ${overlap.endDate}).`,
      })
    }

    const holiday = await AttendanceHoliday.create({ name, startDate, endDate })
    return res.status(201).json({ success: true, message: 'Holiday added successfully.', holiday })
  } catch (error) {
    console.error('Create Attendance Holiday Error:', error)
    return res.status(500).json({ success: false, message: 'Could not add holiday.' })
  }
})

router.put('/admin/attendance/holidays/:id', adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid holiday ID.' })
    }
    const validation = validateHolidayPayload(req.body)
    if (validation.error) return res.status(400).json({ success: false, message: validation.error })
    const { name, startDate, endDate } = validation.value

    const overlap = await AttendanceHoliday.findOne({
      _id: { $ne: req.params.id },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).lean()
    if (overlap) {
      return res.status(409).json({
        success: false,
        message: `This date range overlaps with the existing holiday "${overlap.name}" (${overlap.startDate} to ${overlap.endDate}).`,
      })
    }

    const holiday = await AttendanceHoliday.findByIdAndUpdate(
      req.params.id,
      { $set: { name, startDate, endDate } },
      { new: true, runValidators: true }
    )
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found.' })
    return res.status(200).json({ success: true, message: 'Holiday updated successfully.', holiday })
  } catch (error) {
    console.error('Update Attendance Holiday Error:', error)
    return res.status(500).json({ success: false, message: 'Could not update holiday.' })
  }
})

router.delete('/admin/attendance/holidays/:id', adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid holiday ID.' })
    }
    const holiday = await AttendanceHoliday.findByIdAndDelete(req.params.id)
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found.' })
    return res.status(200).json({ success: true, message: 'Holiday deleted successfully.' })
  } catch (error) {
    console.error('Delete Attendance Holiday Error:', error)
    return res.status(500).json({ success: false, message: 'Could not delete holiday.' })
  }
})

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

      if (!isValidDateKey(attendanceDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date. Use a valid YYYY-MM-DD date.',
        })
      }

      // Never create Absent records or send absent emails on holidays / weekly off.
      const dayStatus = await getAttendanceDayStatus(attendanceDate)
      if (!dayStatus.isWorkingDay) {
        console.log('Biometric attendance finalization skipped:', {
          date: attendanceDate,
          reason: dayStatus.reason,
          holidayName: dayStatus.holidayName,
        })
        return res.status(200).json({
          success: true,
          skipped: true,
          date: attendanceDate,
          reason: dayStatus.reason,
          message: dayStatus.reason === 'holiday'
            ? `Attendance skipped: ${dayStatus.holidayName}.`
            : 'Attendance skipped: weekly off.',
          biometricStudents: 0,
          absentCreated: 0,
          alreadyMarked: 0,
          absentEmailSummary: {
            totalAbsent: 0,
            emailsSent: 0,
            emailsFailed: 0,
            emailsSkipped: 0,
          },
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
