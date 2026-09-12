const express = require('express')

const router = express.Router()

const Student = require('../models/Student')
const Attendance = require('../models/Attendance')


// ======================================
// ZKTECO ADMS HANDSHAKE
// GET /iclock/cdata
// ======================================

router.get('/cdata', (req, res) => {

  console.log('')
  console.log('======================================')
  console.log('ZKTECO ADMS HANDSHAKE')
  console.log('======================================')

  console.log('Query:', req.query)

  const serialNumber = req.query.SN || ''

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


// ======================================
// ZKTECO ADMS DATA
// POST /iclock/cdata
// ======================================

router.post(
  '/cdata',
  express.text({ type: '*/*' }),
  async (req, res) => {

    console.log('')
    console.log('======================================')
    console.log('ZKTECO ADMS DATA RECEIVED')
    console.log('======================================')

    console.log('Query:', req.query)
    console.log('Body:', req.body)

    const table = req.query.table || ''


    console.log('Table:', table)


    // ======================================
    // ATTENDANCE LOG
    // ======================================

    if (table === 'ATTLOG') {

      console.log('')
      console.log('******** ATTENDANCE LOG ********')
      console.log('Attendance Data:')
      console.log(req.body)
      console.log('********************************')
      console.log('')


      try {

        // ======================================
        // CHECK BODY
        // ======================================

        if (!req.body) {

          console.log('ATTLOG body is empty')

          return res
            .type('text/plain')
            .send('OK')

        }


        // ======================================
        // SPLIT MULTIPLE ATTENDANCE RECORDS
        // ======================================

        const attendanceRecords =
          req.body
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)


        // ======================================
        // PROCESS EACH RECORD
        // ======================================

        for (const record of attendanceRecords) {

          try {

            console.log('')
            console.log('Processing ATTLOG:')
            console.log(record)


            // ======================================
            // SPLIT TAB-SEPARATED DATA
            // ======================================

            const fields = record.split(/\t+/)


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


            // ======================================
            // VALIDATE REQUIRED DATA
            // ======================================

            if (
              !biometricUserId ||
              !timestamp
            ) {

              console.log(
                'Invalid ATTLOG record. Skipping.'
              )

              continue

            }


            // ======================================
            // FIND STUDENT
            // ======================================

            const student =
              await Student.findOne({
                biometricUserId:
                  biometricUserId
              })


            // ======================================
            // STUDENT NOT FOUND
            // ======================================

            if (!student) {

              console.log('')
              console.log(
                'STUDENT NOT FOUND'
              )

              console.log(
                'Biometric User ID:',
                biometricUserId
              )

              console.log(
                'Please check biometricUserId in Student.'
              )

              console.log('')

              continue

            }


            console.log('')
            console.log('STUDENT FOUND')
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


            // ======================================
            // GET INDIA DATE
            // ======================================

            const attendanceDate =
              new Date(timestamp)
                .toLocaleDateString(
                  'en-CA',
                  {
                    timeZone:
                      'Asia/Kolkata'
                  }
                )


            console.log(
              'Attendance Date:',
              attendanceDate
            )


            // ======================================
            // CHECK EXISTING ATTENDANCE
            // ======================================

            const existingAttendance =
              await Attendance.findOne({
                student: student._id,
                date: attendanceDate
              })


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


            // ======================================
            // CREATE ATTENDANCE
            // ======================================

            const attendance =
              await Attendance.create({

                student:
                  student._id,

                studentName:
                  student.name,

                admissionNumber:
                  student.admissionNumber || '',

                course:
                  student.course || '',

                batchTime:
                  student.batchTime || '',

                date:
                  attendanceDate,

                status:
                  'Present',

              })


            // ======================================
            // SUCCESS LOG
            // ======================================

            console.log('')
            console.log(
              '======================================'
            )

            console.log(
              'ATTENDANCE SAVED SUCCESSFULLY'
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

          }
          catch (recordError) {

            console.error('')
            console.error(
              'ERROR PROCESSING ATTLOG RECORD'
            )

            console.error(
              recordError
            )

            console.error('')

          }

        }

      }
      catch (error) {

        console.error('')
        console.error(
          'ATTLOG PROCESSING ERROR'
        )

        console.error(error)

        console.error('')

      }

    }


    // ======================================
    // OPERATION LOG
    // ======================================

    if (table === 'OPERLOG') {

      console.log('')
      console.log('******** OPERATION LOG ********')

      console.log(
        req.body
      )

      console.log(
        '*******************************'
      )

      console.log('')

    }


    // ======================================
    // ZKTECO RESPONSE
    // ======================================

    res.type('text/plain')

    res.send('OK')

  }
)


// ======================================
// ZKTECO ADMS GET REQUEST
// GET /iclock/getrequest
// ======================================

router.get('/getrequest', (req, res) => {

  console.log('')
  console.log('======================================')
  console.log('ZKTECO GETREQUEST')
  console.log('======================================')

  console.log('Query:', req.query)


  // ======================================
  // NO COMMAND CURRENTLY
  // ======================================

  res.type('text/plain')

  res.send('OK')

})


// ======================================
// ZKTECO DEVICE COMMAND
// POST /iclock/devicecmd
// ======================================

router.post('/devicecmd', (req, res) => {

  console.log('')
  console.log('======================================')
  console.log('ZKTECO DEVICE COMMAND')
  console.log('======================================')

  console.log('Query:', req.query)

  console.log('Body:', req.body)


  res.type('text/plain')

  res.send('OK')

})


module.exports = router