const express = require('express')

const router = express.Router()

const Faculty =
  require('../models/Faculty')

const Student =
  require('../models/Student')

const Exam =
  require('../models/Exam')

const Marks =
  require('../models/Marks')

const teacherAuth =
  require('../middleware/teacherAuth')


// ======================================
// HELPER
// GET TEACHER
// ======================================

const getTeacher =
  async (teacherId) => {

    return await Faculty.findById(
      teacherId
    )
      .populate(
        'assignedClasses.courseId'
      )

  }


// ======================================
// HELPER
// CHECK TEACHER ASSIGNED CLASS
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
// GET ASSIGNED COURSE + BATCH PAIRS
// ======================================

const getAssignedClasses =
  (teacher) => {

    return (

      teacher.assignedClasses || []

    )

      .map(

        (assignment) => {

          const course =
            assignment.courseId
              ?.courseName
              ?.trim()


          const batchTime =
            assignment.batchTime
              ?.trim()


          if (
            !course ||
            !batchTime
          ) {

            return null

          }


          return {

            course,

            batchTime,

          }

        }

      )

      .filter(Boolean)

  }


// ======================================
// HELPER
// CHECK ACTIVE TEACHER
// ======================================

const validateTeacher =
  (teacher) => {

    if (!teacher) {

      return {

        valid: false,

        status: 404,

        message:
          'Teacher not found.',

      }

    }


    if (
      teacher.isTeacher !== true
    ) {

      return {

        valid: false,

        status: 403,

        message:
          'Teacher account is not enabled.',

      }

    }


    if (
      teacher.accountStatus ===
      'Inactive'
    ) {

      return {

        valid: false,

        status: 403,

        message:
          'Teacher account is inactive.',

      }

    }


    return {

      valid: true,

    }

  }


// ======================================
// 1. REPORT SUMMARY
// ======================================
//
// GET
// /api/teacher/reports/summary
//
// Teacher ke assigned classes ka
// overall summary.
// ======================================

router.get(

  '/teacher/reports/summary',

  teacherAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET TEACHER
      // ==================================

      const teacher =
        await getTeacher(
          req.teacher.id
        )


      // ==================================
      // VALIDATE TEACHER
      // ==================================

      const validation =
        validateTeacher(
          teacher
        )


      if (!validation.valid) {

        return res.status(
          validation.status
        ).json({

          success: false,

          message:
            validation.message,

        })

      }


      // ==================================
      // ASSIGNED CLASSES
      // ==================================

      const assignedClasses =
        getAssignedClasses(
          teacher
        )


      if (
        assignedClasses.length === 0
      ) {

        return res.status(200).json({

          success: true,

          summary: {

            totalStudents: 0,

            totalExams: 0,

            totalMarksRecords: 0,

            passCount: 0,

            failCount: 0,

            averagePercentage: 0,

          },

        })

      }


      // ==================================
      // STUDENT QUERY
      // ==================================

      const studentConditions =
        assignedClasses.map(

          (assignment) => ({

            course:
              assignment.course,

            batchTime:
              assignment.batchTime,

          })

        )


      // ==================================
      // GET STUDENTS
      // ==================================

      const students =
        await Student.find({

          $or:
            studentConditions,

        })
        .select(

          '_id name admissionNumber course batchTime'

        )


      // ==================================
      // STUDENT IDS
      // ==================================

      const studentIds =
        students.map(

          (student) =>
            student._id

        )


      // ==================================
      // GET EXAMS
      // ==================================

      const examConditions =
        assignedClasses.map(

          (assignment) => ({

            course:
              assignment.course,

            batchTime:
              assignment.batchTime,

            teacherId:
              teacher._id,

          })

        )


      const exams =
        await Exam.find({

          $or:
            examConditions,

        })
        .select(

          '_id examName subject course batchTime totalMarks passingMarks examDate status'

        )


      // ==================================
      // EXAM IDS
      // ==================================

      const examIds =
        exams.map(

          (exam) =>
            exam._id

        )


      // ==================================
      // GET MARKS
      // ==================================

      const marks =
        await Marks.find({

          studentId: {

            $in:
              studentIds,

          },

          examId: {

            $in:
              examIds,

          },

        })
        .select(

          'examId studentId obtainedMarks result'

        )


      // ==================================
      // CALCULATE SUMMARY
      // ======================================

      let totalObtained = 0

      let totalMaximum = 0

      let passCount = 0

      let failCount = 0


      marks.forEach(

        (mark) => {

          const exam =
            exams.find(

              (item) =>

                item._id.toString() ===
                mark.examId.toString()

            )


          if (!exam) {

            return

          }


          totalObtained +=
            Number(
              mark.obtainedMarks || 0
            )


          totalMaximum +=
            Number(
              exam.totalMarks || 0
            )


          if (
            mark.result ===
            'Pass'
          ) {

            passCount++

          }

          else {

            failCount++

          }

        }

      )


      // ==================================
      // AVERAGE PERCENTAGE
      // ==================================

      let averagePercentage = 0


      if (
        totalMaximum > 0
      ) {

        averagePercentage =

          (
            totalObtained /
            totalMaximum
          ) * 100

      }


      return res.status(200).json({

        success: true,

        summary: {

          totalStudents:
            students.length,

          totalExams:
            exams.length,

          totalMarksRecords:
            marks.length,

          passCount,

          failCount,

          averagePercentage:

            Number(
              averagePercentage.toFixed(2)
            ),

        },

      })

    }

    catch (error) {

      console.log(

        'Teacher Report Summary Error:',

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
// 2. STUDENT PERFORMANCE REPORT
// ======================================
//
// GET
// /api/teacher/reports/students
//
// Har student ka combined performance.
// ======================================

router.get(

  '/teacher/reports/students',

  teacherAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET TEACHER
      // ==================================

      const teacher =
        await getTeacher(
          req.teacher.id
        )


      // ==================================
      // VALIDATE
      // ==================================

      const validation =
        validateTeacher(
          teacher
        )


      if (!validation.valid) {

        return res.status(
          validation.status
        ).json({

          success: false,

          message:
            validation.message,

        })

      }


      // ==================================
      // ASSIGNED CLASSES
      // ==================================

      const assignedClasses =
        getAssignedClasses(
          teacher
        )


      if (
        assignedClasses.length === 0
      ) {

        return res.status(200).json({

          success: true,

          count: 0,

          students: [],

        })

      }


      // ==================================
      // STUDENTS
      // ==================================

      const studentConditions =
        assignedClasses.map(

          (assignment) => ({

            course:
              assignment.course,

            batchTime:
              assignment.batchTime,

          })

        )


      const students =
        await Student.find({

          $or:
            studentConditions,

        })
        .select(

          '_id name fatherName admissionNumber course batchTime'

        )
        .sort({

          name: 1,

        })


      // ==================================
      // EXAMS
      // ==================================

      const examConditions =
        assignedClasses.map(

          (assignment) => ({

            course:
              assignment.course,

            batchTime:
              assignment.batchTime,

            teacherId:
              teacher._id,

          })

        )


      const exams =
        await Exam.find({

          $or:
            examConditions,

        })
        .select(

          '_id examName subject course batchTime totalMarks passingMarks examDate status'

        )


      // ==================================
      // MARKS
      // ==================================

      const studentIds =
        students.map(

          (student) =>
            student._id

        )


      const examIds =
        exams.map(

          (exam) =>
            exam._id

        )


      const marks =
        await Marks.find({

          studentId: {

            $in:
              studentIds,

          },

          examId: {

            $in:
              examIds,

          },

        })
        .select(

          'examId studentId obtainedMarks result'

        )


      // ==================================
      // BUILD STUDENT REPORT
      // ==================================

      const studentReports =
        students.map(

          (student) => {

            const studentMarks =
              marks.filter(

                (mark) =>

                  mark.studentId
                    .toString() ===
                  student._id.toString()

              )


            let totalObtained = 0

            let totalMaximum = 0

            let passCount = 0

            let failCount = 0


            studentMarks.forEach(

              (mark) => {

                const exam =
                  exams.find(

                    (item) =>

                      item._id
                        .toString() ===
                      mark.examId
                        .toString()

                  )


                if (!exam) {

                  return

                }


                totalObtained +=
                  Number(
                    mark.obtainedMarks || 0
                  )


                totalMaximum +=
                  Number(
                    exam.totalMarks || 0
                  )


                if (
                  mark.result ===
                  'Pass'
                ) {

                  passCount++

                }

                else {

                  failCount++

                }

              }

            )


            const percentage =

              totalMaximum > 0

                ? (
                    totalObtained /
                    totalMaximum
                  ) * 100

                : 0


            let overallResult =
              'Not Evaluated'


            if (
              studentMarks.length > 0
            ) {

              overallResult =

                failCount > 0

                  ? 'Fail'

                  : 'Pass'

            }


            return {

              studentId:
                student._id,

              name:
                student.name,

              fatherName:
                student.fatherName || '',

              admissionNumber:
                student.admissionNumber,

              course:
                student.course,

              batchTime:
                student.batchTime || '',

              examsGiven:
                studentMarks.length,

              totalObtained,

              totalMarks:
                totalMaximum,

              percentage:
                Number(
                  percentage.toFixed(2)
                ),

              passCount,

              failCount,

              overallResult,

            }

          }

        )


      return res.status(200).json({

        success: true,

        count:
          studentReports.length,

        students:
          studentReports,

      })

    }

    catch (error) {

      console.log(

        'Teacher Student Reports Error:',

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
// 3. INDIVIDUAL STUDENT REPORT
// ======================================
//
// GET
// /api/teacher/reports/student/:studentId
//
// Ek student ka complete combined result.
// ======================================

router.get(

  '/teacher/reports/student/:studentId',

  teacherAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET TEACHER
      // ==================================

      const teacher =
        await getTeacher(
          req.teacher.id
        )


      // ==================================
      // VALIDATE
      // ==================================

      const validation =
        validateTeacher(
          teacher
        )


      if (!validation.valid) {

        return res.status(
          validation.status
        ).json({

          success: false,

          message:
            validation.message,

        })

      }


      // ==================================
      // GET STUDENT
      // ==================================

      const student =
        await Student.findById(

          req.params.studentId

        )
        .select(

          '_id name fatherName admissionNumber course batchTime'

        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // TEACHER ASSIGNMENT CHECK
      // ==================================

      const assigned =
        isTeacherAssigned(

          teacher,

          student.course,

          student.batchTime

        )


      if (!assigned) {

        return res.status(403).json({

          success: false,

          message:
            'You are not assigned to this student.',

        })

      }


      // ==================================
      // GET EXAMS
      // ==================================

      const exams =
        await Exam.find({

          teacherId:
            teacher._id,

          course:
            student.course,

          batchTime:
            student.batchTime,

        })
        .select(

          '_id examName examType subject examDate totalMarks passingMarks status'

        )
        .sort({

          examDate: 1,

        })


      // ==================================
      // GET MARKS
      // ==================================

      const examIds =
        exams.map(

          (exam) =>
            exam._id

        )


      const marks =
        await Marks.find({

          studentId:
            student._id,

          examId: {

            $in:
              examIds,

          },

        })
        .select(

          'examId obtainedMarks remarks result'

        )


      // ==================================
      // COMBINE EXAM + MARKS
      // ======================================

      const results =
        exams.map(

          (exam) => {

            const mark =
              marks.find(

                (item) =>

                  item.examId
                    .toString() ===
                  exam._id.toString()

              )


            const obtainedMarks =
              mark
                ? Number(
                    mark.obtainedMarks || 0
                  )
                : null


            const percentage =

              mark &&
              exam.totalMarks > 0

                ? (
                    obtainedMarks /
                    exam.totalMarks
                  ) * 100

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

              examDate:
                exam.examDate,

              totalMarks:
                exam.totalMarks,

              passingMarks:
                exam.passingMarks,

              obtainedMarks,

              percentage:

                percentage === null

                  ? null

                  : Number(
                      percentage.toFixed(2)
                    ),

              result:

                mark
                  ? mark.result
                  : 'Not Attempted',

              remarks:

                mark?.remarks || '',

            }

          }

        )


      // ==================================
      // COMBINED TOTAL
      // ==================================

      let totalObtained = 0

      let totalMarks = 0

      let attemptedExams = 0

      let passCount = 0

      let failCount = 0


      results.forEach(

        (result) => {

          if (
            result.obtainedMarks ===
            null
          ) {

            return

          }


          attemptedExams++


          totalObtained +=
            Number(
              result.obtainedMarks
            )


          totalMarks +=
            Number(
              result.totalMarks
            )


          if (
            result.result ===
            'Pass'
          ) {

            passCount++

          }

          else if (
            result.result ===
            'Fail'
          ) {

            failCount++

          }

        }

      )


      const percentage =

        totalMarks > 0

          ? (
              totalObtained /
              totalMarks
            ) * 100

          : 0


      let overallResult =
        'Not Evaluated'


      if (
        attemptedExams > 0
      ) {

        overallResult =

          failCount > 0

            ? 'Fail'

            : 'Pass'

      }


      return res.status(200).json({

        success: true,

        student: {

          studentId:
            student._id,

          name:
            student.name,

          fatherName:
            student.fatherName || '',

          admissionNumber:
            student.admissionNumber,

          course:
            student.course,

          batchTime:
            student.batchTime || '',

        },

        summary: {

          attemptedExams,

          totalExams:
            results.length,

          totalObtained,

          totalMarks,

          percentage:
            Number(
              percentage.toFixed(2)
            ),

          passCount,

          failCount,

          overallResult,

        },

        results,

      })

    }

    catch (error) {

      console.log(

        'Individual Teacher Report Error:',

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