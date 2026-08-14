const express = require('express')

const router = express.Router()


// ======================================
// MODELS
// ======================================

const Student =
  require('../models/Student')

const Exam =
  require('../models/Exam')

const Marks =
  require('../models/Marks')


// ======================================
// STUDENT AUTH
// ======================================

const studentAuth =
  require('../middleware/studentAuth')


// ======================================
// GET STUDENT EXAM & MARKS REPORT
// ======================================
//
// GET /api/student/reports/exams
//
// Logged-in student ka:
// - Exam
// - Subject
// - Exam Date
// - Total Marks
// - Passing Marks
// - Obtained Marks
// - Percentage
// - Result
// - Remarks
//
// JWT se student identify hoga.
// ======================================

router.get(

  '/student/reports/exams',

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
      // GET STUDENT EXAMS
      // ==================================
      //
      // Course + Batch ke basis par
      // student ke exams milenge.
      // ==================================

      const exams =
        await Exam.find({

          course:
            student.course,

          batchTime:
            student.batchTime,

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
      // MARKS MAP
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
      // PREPARE REPORT
      // ==================================

      const reports =
        exams.map(

          (exam) => {

            const mark =
              marksMap[
                exam._id.toString()
              ]


            // ==================================
            // OBTAINED MARKS
            // ==================================

            const obtainedMarks =
              mark
                ? Number(
                    mark.obtainedMarks
                  )
                : null


            // ==================================
            // PERCENTAGE
            // ==================================

            const percentage =

              obtainedMarks !== null &&

              Number(exam.totalMarks) > 0

                ? Number(

                    (
                      obtainedMarks /

                      Number(
                        exam.totalMarks
                      )

                    ) * 100

                  ).toFixed(2)

                : null


            // ==================================
            // RESULT
            // ==================================

            let result = ''


            if (mark) {

              result =
                mark.result || ''

            }


            // ==================================
            // RESPONSE
            // ==================================

            return {

              examId:
                exam._id,

              examName:
                exam.examName,

              examType:
                exam.examType,

              subject:
                exam.subject || '',

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

              obtainedMarks,

              percentage,

              result,

              remarks:
                mark?.remarks || '',

              examStatus:
                exam.status,

              marksAvailable:
                Boolean(mark),

            }

          }

        )


      // ==================================
      // ONLY EXAMS WITH MARKS
      // ==================================

      const completedReports =
        reports.filter(

          (item) =>
            item.marksAvailable === true

        )


      // ==================================
      // PERFORMANCE SUMMARY
      // ==================================

      const totalExams =
        completedReports.length


      const passed =
        completedReports.filter(

          (item) =>
            item.result === 'Pass'

        ).length


      const failed =
        completedReports.filter(

          (item) =>
            item.result === 'Fail'

        ).length


      // ==================================
      // AVERAGE PERCENTAGE
      // ==================================

      let averagePercentage = 0


      if (
        totalExams > 0
      ) {

        const totalPercentage =
          completedReports.reduce(

            (sum, item) => {

              return (
                sum +
                Number(
                  item.percentage || 0
                )
              )

            },

            0

          )


        averagePercentage =
          Number(

            (
              totalPercentage /
              totalExams

            ).toFixed(2)

          )

      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,


        // ==================================
        // STUDENT
        // ==================================

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


        // ==================================
        // SUMMARY
        // ==================================

        summary: {

          totalExams,

          passed,

          failed,

          averagePercentage,

        },


        // ==================================
        // REPORTS
        // ==================================

        reports,

      })

    }

    catch (error) {

      console.log(

        'Student Exam Report Error:',

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