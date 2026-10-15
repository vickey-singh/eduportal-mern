const express = require('express')
const router = express.Router()
const Faculty =
  require('../models/Faculty')
const FacultyAttendance =
  require('../models/FacultyAttendance')
const adminAuth =
  require('../middleware/adminAuth')
const AttendanceSettings =
  require('../models/AttendanceSettings')
const AttendanceHoliday =
  require('../models/AttendanceHoliday')
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
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]
const getWeekdayKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return WEEKDAY_KEYS[
    new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  ]
}
const getAttendanceDayStatus = async (dateKey) => {
  const [settings, holiday] = await Promise.all([
    AttendanceSettings.findOne({ key: 'default' }).lean(),
    AttendanceHoliday.findOne({
      startDate: { $lte: dateKey },
      endDate: { $gte: dateKey },
    })
      .select('name startDate endDate')
      .lean(),
  ])

  // A saved holiday takes priority over the weekly working-day setting.
  if (holiday) {
    return {
      isWorkingDay: false,
      reason: 'holiday',
      holidayName: holiday.name,
    }
  }

  const workingDays = {
    ...DEFAULT_WORKING_DAYS,
    ...(settings?.workingDays || {}),
  }
  const weekday = getWeekdayKey(dateKey)

  if (!workingDays[weekday]) {
    return {
      isWorkingDay: false,
      reason: 'weekly_off',
      holidayName: null,
    }
  }

  return {
    isWorkingDay: true,
    reason: null,
    holidayName: null,
  }
}
// ======================================
// HELPER
// GET DATE RANGE
// ======================================
const getDateRange =
  (year, month) => {
    const startDate =
      `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay =
      new Date(
        Number(year),
        Number(month),
        0
      ).getDate()
    const endDate =
      `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    return {
      startDate,
      endDate,
    }
  }
// ======================================
// GET ALL FACULTY ATTENDANCE
// FOR SELECTED DATE
// ======================================
//
// GET
// /api/faculty-attendance?date=2026-08-14
//
// Admin ko saari faculty show hogi.
// Existing attendance bhi show hogi.
// ======================================
router.get(
  '/faculty-attendance',
  adminAuth,
  async (req, res) => {
    try {
      const date =
        req.query.date
      if (!date) {
        return res.status(400).json({
          success: false,
          message:
            'Date is required.',
        })
      }
      // ==================================
      // GET ALL ACTIVE FACULTY
      // ==================================
      const faculty =
        await Faculty.find({
          accountStatus:
            'Active',
        })
        .select(
          '_id name designation subject employeeId teacherId accountStatus image'
        )
        .sort({
          name: 1,
        })
      // ==================================
      // GET ATTENDANCE FOR DATE
      // ==================================
      const attendance =
        await FacultyAttendance.find({
          date,
        })
      // ==================================
      // COMBINE FACULTY + ATTENDANCE
      // ==================================
      const result =
        faculty.map(
          (member) => {
            const record =
              attendance.find(
                (item) =>
                  item.facultyId
                    .toString() ===
                  member._id.toString()
              )
            return {
              facultyId:
                member._id,
              name:
                member.name,
              designation:
                member.designation,
              subject:
                member.subject,
              employeeId:
                member.employeeId || '',
              teacherId:
                member.teacherId || '',
              image:
                member.image || '',
              status:
                record?.status || '',
              remarks:
                record?.remarks || '',
              attendanceId:
                record?._id || null,
            }
          }
        )
      return res.status(200).json({
        success: true,
        date,
        faculty:
          result,
      })
    }
    catch (error) {
      console.log(
        'Get Faculty Attendance Error:',
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
// SAVE SINGLE ATTENDANCE
// ======================================
//
// POST
// /api/faculty-attendance
// ======================================
router.post(
  '/faculty-attendance',
  adminAuth,
  async (req, res) => {
    try {
      const {
        facultyId,
        date,
        status,
        remarks = '',
      } = req.body
      // ==================================
      // VALIDATION
      // ==================================
      if (
        !facultyId ||
        !date ||
        !status
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Faculty, date and status are required.',
        })
      }
      if (
        ![
          'Present',
          'Absent',
          'Late',
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid attendance status.',
        })
      }
      if (
        typeof remarks !== 'string' ||
        remarks.length > 500
      ) {
        return res.status(400).json({
          success: false,
          message: 'Remarks must be text and cannot exceed 500 characters.',
        })
      }

      // ==================================
      // GET FACULTY
      // ==================================
      const faculty =
        await Faculty.findById(
          facultyId
        )
      if (!faculty) {
        return res.status(404).json({
          success: false,
          message:
            'Faculty not found.',
        })
      }
      // ==================================
      // UPSERT ATTENDANCE
      // ==================================
      const attendance =
        await FacultyAttendance.findOneAndUpdate(
          {
            facultyId,
            date,
          },
          {
            facultyId,
            facultyName:
              faculty.name,
            date,
            status,
            remarks: remarks.trim(),
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        )
      return res.status(200).json({
        success: true,
        message:
          'Faculty attendance saved successfully.',
        attendance,
      })
    }
    catch (error) {
      console.log(
        'Save Faculty Attendance Error:',
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
// SAVE BULK ATTENDANCE
// ======================================
//
// POST
// /api/faculty-attendance/bulk
//
// Ek date ke saare faculty ka
// attendance ek saath save hoga.
// ======================================
router.post(
  '/faculty-attendance/bulk',
  adminAuth,
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
            'No attendance records provided.',
        })
      }
      // ==================================
      // PREPARE OPERATIONS
      // ==================================
      const operations = []
      for (
        const item of attendance
      ) {
        if (
          !item.facultyId ||
          ![
            'Present',
            'Absent',
            'Late',
          ].includes(
            item.status
          )
        ) {
          continue
        }
        const remarks = item.remarks ?? ''
        if (
          typeof remarks !== 'string' ||
          remarks.length > 500
        ) {
          continue
        }
        const faculty =
          await Faculty.findById(
            item.facultyId
          )
        if (!faculty) {
          continue
        }
        operations.push({
          updateOne: {
            filter: {
              facultyId:
                item.facultyId,
              date,
            },
            update: {
              facultyId:
                item.facultyId,
              facultyName:
                faculty.name,
              date,
              status:
                item.status,
              remarks: remarks.trim(),
            },
            upsert: true,
          },
        })
      }
      // ==================================
      // NO VALID RECORDS
      // ==================================
      if (
        operations.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            'No valid attendance records found.',
        })
      }
      // ==================================
      // BULK WRITE
      // ==================================
      await FacultyAttendance.bulkWrite(
        operations
      )
      return res.status(200).json({
        success: true,
        message:
          'Faculty attendance saved successfully.',
        count:
          operations.length,
      })
    }
    catch (error) {
      console.log(
        'Bulk Faculty Attendance Error:',
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
// GET DAILY RECORDS
// ======================================
//
// GET
// /api/faculty-attendance/:facultyId/daily
//
// Optional:
// ?date=2026-08-14
// ======================================
router.get(
  '/faculty-attendance/:facultyId/daily',
  adminAuth,
  async (req, res) => {
    try {
      const {
        facultyId,
      } = req.params
      const date =
        req.query.date
      const query = {
        facultyId,
      }
      if (date) {
        query.date =
          date
      }
      const records =
        await FacultyAttendance.find(
          query
        )
        .sort({
          date: -1,
        })
      return res.status(200).json({
        success: true,
        records,
      })
    }
    catch (error) {
      console.log(
        'Get Daily Faculty Attendance Error:',
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
// GET MONTHLY ATTENDANCE
// ======================================
//
// GET
// /api/faculty-attendance/:facultyId/monthly
//
// ?year=2026&month=8
// ======================================
router.get(
  '/faculty-attendance/:facultyId/monthly',
  adminAuth,
  async (req, res) => {
    try {
      const {
        facultyId,
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
            'Year and month are required.',
        })
      }
      const {
        startDate,
        endDate,
      } =
        getDateRange(
          year,
          month
        )
      const records =
        await FacultyAttendance.find({
          facultyId,
          date: {
            $gte:
              startDate,
            $lte:
              endDate,
          },
        })
        .sort({
          date: 1,
        })
      // ==================================
      // SUMMARY
      // ==================================
      const present =
        records.filter(
          (item) =>
            item.status ===
            'Present'
        ).length
      const absent =
        records.filter(
          (item) =>
            item.status ===
            'Absent'
        ).length
      const late =
        records.filter(
          (item) =>
            item.status ===
            'Late'
        ).length
      const total =
        present + absent + late
      const percentage =
        total > 0
          ? (
              (present + late) /
              total
            ) * 100
          : 0
      return res.status(200).json({
        success: true,
        year:
          Number(year),
        month:
          Number(month),
        summary: {
          present,
          absent,
          late,
          total,
          percentage:
            Number(
              percentage.toFixed(2)
            ),
        },
        records,
      })
    }
    catch (error) {
      console.log(
        'Get Monthly Faculty Attendance Error:',
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
// GET YEARLY ATTENDANCE
// ======================================
//
// GET
// /api/faculty-attendance/:facultyId/yearly
//
// ?year=2026
// ======================================
router.get(
  '/faculty-attendance/:facultyId/yearly',
  adminAuth,
  async (req, res) => {
    try {
      const {
        facultyId,
      } = req.params
      const {
        year,
      } = req.query
      if (!year) {
        return res.status(400).json({
          success: false,
          message:
            'Year is required.',
        })
      }
      const startDate =
        `${year}-01-01`
      const endDate =
        `${year}-12-31`
      const records =
        await FacultyAttendance.find({
          facultyId,
          date: {
            $gte:
              startDate,
            $lte:
              endDate,
          },
        })
        .sort({
          date: 1,
        })
      // ==================================
      // SUMMARY
      // ==================================
      const present =
        records.filter(
          (item) =>
            item.status ===
            'Present'
        ).length
      const absent =
        records.filter(
          (item) =>
            item.status ===
            'Absent'
        ).length
      const late =
        records.filter(
          (item) =>
            item.status ===
            'Late'
        ).length
      const total =
        present + absent + late
      const percentage =
        total > 0
          ? (
              (present + late) /
              total
            ) * 100
          : 0
      return res.status(200).json({
        success: true,
        year:
          Number(year),
        summary: {
          present,
          absent,
          late,
          total,
          percentage:
            Number(
              percentage.toFixed(2)
            ),
        },
        records,
      })
    }
    catch (error) {
      console.log(
        'Get Yearly Faculty Attendance Error:',
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
//
// DELETE
// /api/faculty-attendance/:id
//
// Sirf admin delete kar sakta hai.
// ======================================
router.delete(
  '/faculty-attendance/:id',
  adminAuth,
  async (req, res) => {
    try {
      const attendance =
        await FacultyAttendance.findById(
          req.params.id
        )
      if (!attendance) {
        return res.status(404).json({
          success: false,
          message:
            'Attendance record not found.',
        })
      }
      await FacultyAttendance.findByIdAndDelete(
        req.params.id
      )
      return res.status(200).json({
        success: true,
        message:
          'Faculty attendance deleted successfully.',
      })
    }
    catch (error) {
      console.log(
        'Delete Faculty Attendance Error:',
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
// ======================================
// AUTO FINALIZE BIOMETRIC ATTENDANCE
// ======================================
// POST /api/faculty-attendance/auto-finalize
//
// Rule:
// - Only Active faculty with biometricUserId are considered.
// - Existing Present/Absent/Late records are never overwritten.
// - Faculty with no record by 8 PM are inserted as Absent.
// - Faculty without biometricUserId are ignored.
//
// Render Cron should call this endpoint once at 8:00 PM IST.
// Secure it with ATTENDANCE_CRON_SECRET.
// ======================================
const getIndiaDate = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const values = {}
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value
    }
  }
  return `${values.year}-${values.month}-${values.day}`
}
router.post(
  '/faculty-attendance/auto-finalize',
  async (req, res) => {
    try {
      const cronSecret = process.env.ATTENDANCE_CRON_SECRET
      const requestSecret = req.get('x-cron-secret')
      if (!cronSecret) {
        console.error(
          'ATTENDANCE_CRON_SECRET is not configured.'
        )
        return res.status(500).json({
          success: false,
          message: 'Cron secret is not configured.',
        })
      }
      if (!requestSecret || requestSecret !== cronSecret) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized cron request.',
        })
      }
      const date = getIndiaDate()

      // Never create Absent records on holidays or weekly offs.
      // Uses the same working-day and holiday settings as student attendance.
      const dayStatus = await getAttendanceDayStatus(date)
      if (!dayStatus.isWorkingDay) {
        console.log('Faculty biometric attendance finalization skipped:', {
          date,
          reason: dayStatus.reason,
          holidayName: dayStatus.holidayName,
        })
        return res.status(200).json({
          success: true,
          skipped: true,
          date,
          reason: dayStatus.reason,
          message:
            dayStatus.reason === 'holiday'
              ? `Faculty attendance skipped: ${dayStatus.holidayName}.`
              : 'Faculty attendance skipped: weekly off.',
          biometricFaculty: 0,
          present: 0,
          absent: 0,
          createdAbsent: 0,
        })
      }

      // Only biometric-enrolled active faculty are auto-finalized.
      const faculty = await Faculty.find({
        accountStatus: 'Active',
        biometricUserId: {
          $exists: true,
          $nin: [null, ''],
        },
      })
        .select('_id name biometricUserId')
        .lean()
      if (faculty.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No biometric faculty found for finalization.',
          date,
          biometricFaculty: 0,
          present: 0,
          absent: 0,
        })
      }
      const facultyIds = faculty.map(
        (member) => member._id
      )
      // Existing records can be Present (biometric/manual)
      // or Absent (manual). Never overwrite either one.
      const existingAttendance =
        await FacultyAttendance.find({
          date,
          facultyId: { $in: facultyIds },
        })
          .select('facultyId status')
          .lean()
      const existingIds = new Set(
        existingAttendance.map(
          (record) => record.facultyId.toString()
        )
      )
      const absentFaculty = faculty.filter(
        (member) =>
          !existingIds.has(member._id.toString())
      )
      if (absentFaculty.length > 0) {
        await FacultyAttendance.bulkWrite(
          absentFaculty.map((member) => ({
            updateOne: {
              filter: {
                facultyId: member._id,
                date,
              },
              update: {
                $setOnInsert: {
                  facultyId: member._id,
                  facultyName: member.name,
                  date,
                  status: 'Absent',
                },
              },
              upsert: true,
            },
          })),
          { ordered: false }
        )
      }
      // Read final state so the response reflects the actual DB state.
      const finalAttendance =
        await FacultyAttendance.find({
          date,
          facultyId: { $in: facultyIds },
        })
          .select('facultyId status')
          .lean()
      const present = finalAttendance.filter(
        (record) => record.status === 'Present'
      ).length
      const absent = finalAttendance.filter(
        (record) => record.status === 'Absent'
      ).length
      const late = finalAttendance.filter(
        (record) => record.status === 'Late'
      ).length
      return res.status(200).json({
        success: true,
        message:
          'Faculty biometric attendance finalized successfully.',
        date,
        biometricFaculty: faculty.length,
        present,
        absent,
        late,
        createdAbsent: absentFaculty.length,
      })
    } catch (error) {
      console.error(
        'Auto Finalize Faculty Attendance Error:',
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
module.exports = router
