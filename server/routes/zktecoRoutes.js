const express = require('express')

const router = express.Router()

const Student =
  require('../models/Student')

const Attendance =
  require('../models/Attendance')

const Faculty =
  require('../models/Faculty')

const FacultyAttendance =
  require('../models/FacultyAttendance')


// ======================================================
// GET /iclock/cdata
// ZKTECO DEVICE HANDSHAKE
// ======================================================

router.get('/cdata', (req, res) => {

  console.log('')
  console.log('======================================')
  console.log('ZKTECO GET /cdata')
  console.log('======================================')

  const serialNumber =
    req.query.SN || ''

  console.log(
    'Serial Number:',
    serialNumber
  )

  res.type('text/plain')

  res.send(

    'GET OPTION FROM: ' +
      serialNumber +
      '\n' +

    'STAMP=9999\n' +

    'ATTLOGSTAMP=9999\n' +

    'OPERLOGStamp=9999\n' +

    'ErrorDelay=30\n' +

    'Delay=10\n' +

    'TransTimes=00:00;23:59\n' +

    'TransInterval=1\n' +

    'TransFlag=TransData AttLog\tOpLog\tEnrollUser\tChgUser\tEnrollFP\tChgFP\tFPImag\n' +

    'TimeZone=5.5\n' +

    'Realtime=1\n' +

    'Encrypt=None\n' +

    'OK'

  )

})


// ======================================================
// POST /iclock/cdata
// ZKTECO ATTENDANCE DATA
// ======================================================

router.post(
  '/cdata',
  express.text({
    type: '*/*'
  }),
  async (req, res) => {

    console.log('')
    console.log('======================================')
    console.log('ZKTECO POST /cdata')
    console.log('======================================')

    const table =
      req.query.table || ''

    console.log(
      'Table:',
      table
    )


    // ==================================================
    // ATTLOG
    // ==================================================

    if (table === 'ATTLOG') {

      try {

        if (!req.body) {

          console.log(
            'ATTLOG BODY EMPTY'
          )

          return res
            .type('text/plain')
            .send('OK')

        }


        // ==================================================
        // SPLIT ATTENDANCE RECORDS
        // ==================================================

        const attendanceRecords =
          req.body
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)


        console.log(
          'Attendance Records:',
          attendanceRecords.length
        )


        // ==================================================
        // PROCESS EACH RECORD
        // ==================================================

        for (
          const record
          of attendanceRecords
        ) {

          try {

            console.log('')
            console.log(
              '--------------------------------------'
            )

            console.log(
              'RAW RECORD:',
              record
            )


            // ==================================================
            // SPLIT DEVICE DATA
            // ==================================================

            const fields =
              record.split(/\t+/)


            const biometricUserId =
              (fields[0] || '').trim()


            const timestamp =
              (fields[1] || '').trim()


            console.log(
              'Biometric User ID:',
              biometricUserId
            )

            console.log(
              'Timestamp:',
              timestamp
            )


            // ==================================================
            // VALIDATE BIOMETRIC USER ID
            // ==================================================

            if (!biometricUserId) {

              console.log(
                'BIOMETRIC USER ID MISSING'
              )

              continue

            }


            // ==================================================
            // VALIDATE TIMESTAMP
            // ==================================================

            if (!timestamp) {

              console.log(
                'TIMESTAMP MISSING'
              )

              continue

            }


            // ==================================================
            // FIND STUDENT
            // ==================================================

            const student =
              await Student.findOne({

                biometricUserId:
                  biometricUserId

              })


            // ==================================================
            // FIND FACULTY IF NOT STUDENT
            // ==================================================

            let faculty = null


            if (!student) {

              faculty =
                await Faculty.findOne({

                  biometricUserId:
                    biometricUserId

                })

            }


            // ==================================================
            // USER NOT FOUND
            // ==================================================

            if (
              !student &&
              !faculty
            ) {

              console.log('')
              console.log(
                'STUDENT / FACULTY NOT FOUND'
              )

              console.log(
                'Biometric User ID:',
                biometricUserId
              )

              console.log(
                'Please check biometricUserId'
              )

              console.log('')

              continue

            }


            // ==================================================
            // STUDENT FOUND
            // ==================================================

            if (student) {

              console.log('')
              console.log(
                'STUDENT FOUND'
              )

              console.log(
                'Name:',
                student.name
              )

              console.log(
                'Admission Number:',
                student.admissionNumber
              )

              console.log(
                'Course:',
                student.course
              )

            }


            // ==================================================
            // FACULTY FOUND
            // ==================================================

            if (faculty) {

              console.log('')
              console.log(
                'FACULTY FOUND'
              )

              console.log(
                'Name:',
                faculty.name
              )

              console.log(
                'Employee ID:',
                faculty.employeeId || ''
              )

            }


            // ==================================================
            // GET ATTENDANCE DATE
            // ==================================================

            const attendanceDate =
              timestamp
                .trim()
                .split(' ')[0]


            // ==================================================
            // VALIDATE ATTENDANCE DATE
            // ==================================================

            if (
              !/^\d{4}-\d{2}-\d{2}$/
                .test(attendanceDate)
            ) {

              console.log(
                'INVALID ATTENDANCE DATE:',
                attendanceDate
              )

              continue

            }


            console.log(
              'Attendance Date:',
              attendanceDate
            )


            // ==================================================
            // FACULTY ATTENDANCE
            // ==================================================

            if (faculty) {

              // ----------------------------------------------
              // CHECK DUPLICATE FACULTY ATTENDANCE
              // ----------------------------------------------

              const existingFacultyAttendance =
                await FacultyAttendance.findOne({

                  facultyId:
                    faculty._id,

                  date:
                    attendanceDate

                })


              if (
                existingFacultyAttendance
              ) {

                console.log('')
                console.log(
                  'FACULTY ATTENDANCE ALREADY EXISTS'
                )

                console.log(
                  'Faculty:',
                  faculty.name
                )

                console.log(
                  'Date:',
                  attendanceDate
                )

                console.log('')

                continue

              }


              // ----------------------------------------------
              // CREATE FACULTY ATTENDANCE
              // ----------------------------------------------

              const facultyAttendance =
                await FacultyAttendance.create({

                  facultyId:
                    faculty._id,

                  facultyName:
                    faculty.name || '',

                  date:
                    attendanceDate,

                  status:
                    'Present'

                })


              // ----------------------------------------------
              // SUCCESS LOG
              // ----------------------------------------------

              console.log('')

              console.log(
                '======================================'
              )

              console.log(
                'FACULTY ATTENDANCE SAVED SUCCESSFULLY'
              )

              console.log(
                'Faculty:',
                faculty.name
              )

              console.log(
                'Biometric ID:',
                biometricUserId
              )

              console.log(
                'Date:',
                attendanceDate
              )

              console.log(
                'Attendance ID:',
                facultyAttendance._id
              )

              console.log(
                '======================================'
              )

              console.log('')

              continue

            }


            // ==================================================
            // STUDENT ATTENDANCE
            // ==================================================

            const existingAttendance =
              await Attendance.findOne({

                student:
                  student._id,

                date:
                  attendanceDate

              })


            // ==================================================
            // DUPLICATE STUDENT ATTENDANCE
            // ==================================================

            if (existingAttendance) {

              console.log('')
              console.log(
                'ATTENDANCE ALREADY EXISTS'
              )

              console.log(
                'Student:',
                student.name
              )

              console.log(
                'Date:',
                attendanceDate
              )

              console.log('')

              continue

            }


            // ==================================================
            // CREATE STUDENT ATTENDANCE
            // ==================================================

            const attendance =
              await Attendance.create({

                student:
                  student._id,

                studentName:
                  student.name,

                admissionNumber:
                  student.admissionNumber ||
                  '',

                course:
                  student.course ||
                  '',

                batchTime:
                  student.batchTime ||
                  '',

                date:
                  attendanceDate,

                status:
                  'Present'

              })


            // ==================================================
            // STUDENT SUCCESS LOG
            // ==================================================

            console.log('')

            console.log(
              '======================================'
            )

            console.log(
              'STUDENT ATTENDANCE SAVED SUCCESSFULLY'
            )

            console.log(
              'Student:',
              student.name
            )

            console.log(
              'Biometric ID:',
              biometricUserId
            )

            console.log(
              'Date:',
              attendanceDate
            )

            console.log(
              'Attendance ID:',
              attendance._id
            )

            console.log(
              '======================================'
            )

            console.log('')


          } catch (recordError) {

            console.error('')

            console.error(
              'ATTENDANCE RECORD PROCESSING ERROR'
            )

            console.error(
              recordError
            )

            console.error('')

          }

        }


      } catch (error) {

        console.error('')
        console.error(
          'ATTLOG PROCESSING ERROR'
        )

        console.error(error)

        console.error('')

      }

    }


    // ==================================================
    // OPERLOG
    // ==================================================

    if (
      table === 'OPERLOG'
    ) {

      console.log('')
      console.log(
        'ZKTECO OPERLOG RECEIVED'
      )

      console.log(
        req.body
      )

    }


    // ==================================================
    // DEVICE RESPONSE
    // ==================================================

    res
      .type('text/plain')
      .send('OK')

  }
)


// ======================================================
// GET /iclock/getrequest
// ======================================================

router.get(
  '/getrequest',
  (req, res) => {

    console.log('')
    console.log(
      'ZKTECO GET /getrequest'
    )

    res
      .type('text/plain')
      .send('OK')

  }
)


// ======================================================
// POST /iclock/devicecmd
// ======================================================

router.post(
  '/devicecmd',
  (req, res) => {

    console.log('')
    console.log(
      'ZKTECO POST /devicecmd'
    )

    console.log(
      req.body
    )

    res
      .type('text/plain')
      .send('OK')

  }
)


// ======================================================
// EXPORT
// ======================================================

module.exports = router