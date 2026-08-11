const express = require('express')

const router = express.Router()

const Attendance =
  require('../models/Attendance')

const Student =
  require('../models/Student')


// ======================================
// GET STUDENTS FOR ATTENDANCE
// ======================================
// Course + Batch Time ke basis par students
// ======================================

router.get(
  '/attendance/students',
  async (req, res) => {

    try {

      const {
        course,
        batchTime,
        date,
      } = req.query


      // ======================================
      // CHECK REQUIRED DATA
      // ======================================

      if (!course) {

        return res.status(400).json({

          success: false,

          message:
            'Course is required',

        })

      }


      // ======================================
      // STUDENT FILTER
      // ======================================

      const studentFilter = {

        course,

      }


      // Batch Time diya gaya ho
      if (batchTime) {

        studentFilter.batchTime =
          batchTime

      }


      // ======================================
      // GET STUDENTS
      // ======================================

      const students =
        await Student.find(
          studentFilter
        )
        .sort({
          name: 1,
        })


      // ======================================
      // IF DATE PROVIDED
      // GET EXISTING ATTENDANCE
      // ======================================

      let attendanceMap = {}


      if (date) {

        const attendanceRecords =
          await Attendance.find({

            course,

            batchTime:
              batchTime || undefined,

            date,

          })


        attendanceRecords.forEach(
          (record) => {

            attendanceMap[
              record.student.toString()
            ] = record.status

          }
        )

      }


      // ======================================
      // ADD ATTENDANCE STATUS
      // ======================================

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


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

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

      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


// ======================================
// SAVE / UPDATE ATTENDANCE
// ======================================

router.post(
  '/attendance',
  async (req, res) => {

    try {

      const {

        student,
        date,
        status,

      } = req.body


      // ======================================
      // CHECK REQUIRED DATA
      // ======================================

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


      // ======================================
      // CHECK STATUS
      // ======================================

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


      // ======================================
      // GET STUDENT
      // ======================================

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


      // ======================================
      // CREATE / UPDATE ATTENDANCE
      // ======================================

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

            new: true,

            upsert: true,

            runValidators: true,

            setDefaultsOnInsert: true,

          }

        )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

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

      res.status(500).json({

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
// Teacher ek batch ke saare students ko
// ek saath save kar sakega.
// ======================================

router.post(
  '/attendance/bulk',
  async (req, res) => {

    try {

      const {
        date,
        attendance,
      } = req.body


      // ======================================
      // CHECK DATA
      // ======================================

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


      // ======================================
      // PROCESS EACH STUDENT
      // ======================================

      const results = []


      for (
        const item of attendance
      ) {

        const {

          student,
          status,

        } = item


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


        // ======================================
        // GET STUDENT
        // ======================================

        const studentData =
          await Student.findById(
            student
          )


        if (!studentData) {

          continue

        }


        // ======================================
        // SAVE / UPDATE
        // ======================================

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

              new: true,

              upsert: true,

              runValidators: true,

              setDefaultsOnInsert: true,

            }

          )


        results.push(
          record
        )

      }


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

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

      res.status(500).json({

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
// Daily / Monthly / Yearly details
// ======================================

router.get(
  '/attendance/student/:studentId',
  async (req, res) => {

    try {

      const {
        studentId,
      } = req.params


      // ======================================
      // GET STUDENT
      // ======================================

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


      // ======================================
      // GET ALL ATTENDANCE
      // ======================================

      const attendance =
        await Attendance.find({

          student:
            studentId,

        })
        .sort({
          date: -1,
        })


      // ======================================
      // SUMMARY
      // ======================================

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


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

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

      res.status(500).json({

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


      // ======================================
      // MONTH FORMAT
      // ======================================

      const monthString =
        String(month)
          .padStart(2, '0')


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
          ).padStart(2, '0')}-01`

      }


      // ======================================
      // GET RECORDS
      // ======================================

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


      // ======================================
      // SUMMARY
      // ======================================

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


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

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

      res.status(500).json({

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


      // ======================================
      // DATE RANGE
      // ======================================

      const startDate =
        `${year}-01-01`


      const endDate =
        `${Number(year) + 1}-01-01`


      // ======================================
      // GET ATTENDANCE
      // ======================================

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


      // ======================================
      // SUMMARY
      // ======================================

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


      // ======================================
      // MONTH-WISE SUMMARY
      // ======================================

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


      // ======================================
      // ADD PERCENTAGE
      // ======================================

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


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

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

      res.status(500).json({

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
  async (req, res) => {

    try {

      const attendance =
        await Attendance.findByIdAndDelete(
          req.params.id
        )


      if (!attendance) {

        return res.status(404).json({

          success: false,

          message:
            'Attendance Record Not Found',

        })

      }


      res.status(200).json({

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


module.exports =
  router