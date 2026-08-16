const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Student =
  require('../models/Student')

const Payment =
  require('../models/Payment')

const Receipt =
  require('../models/Receipt')

const createNotification =
  require('../utils/createNotification')


// ======================================
// HELPER: CALCULATE FEE STATUS
// ======================================

const calculateFeesStatus = (
  totalFees,
  paidFees
) => {

  const total =
    Number(totalFees || 0)

  const paid =
    Number(paidFees || 0)

  const remaining =
    Math.max(
      0,
      total - paid
    )

  let status =
    'Pending'


  if (
    total > 0 &&
    remaining === 0
  ) {

    status =
      'Paid'

  }

  else if (
    paid > 0 &&
    remaining > 0
  ) {

    status =
      'Partial'

  }


  return {

    remaining,

    status,

  }

}


// ======================================
// HELPER: CALCULATE ACADEMIC SESSION
// ======================================
//
// Session April -> March
//
// 01-04-2026 to 31-03-2027
//          = 2026-2027
//
// 01-04-2027 to 31-03-2028
//          = 2027-2028
//
// ======================================

const calculateAcademicSession =
  (admissionDate) => {

    if (!admissionDate) {

      return ''

    }


    const value =
      String(admissionDate)
        .trim()


    if (!value) {

      return ''

    }


    let date


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
        day
      ] =
        value
          .split('-')
          .map(Number)


      date =
        new Date(
          year,
          month - 1,
          day
        )

    }


    // ==================================
    // DD-MM-YYYY
    // ==================================

    else if (
      /^\d{2}-\d{2}-\d{4}$/.test(
        value
      )
    ) {

      const [
        day,
        month,
        year
      ] =
        value
          .split('-')
          .map(Number)


      date =
        new Date(
          year,
          month - 1,
          day
        )

    }


    // ==================================
    // DD/MM/YYYY
    // ==================================

    else if (
      /^\d{2}\/\d{2}\/\d{4}$/.test(
        value
      )
    ) {

      const [
        day,
        month,
        year
      ] =
        value
          .split('/')
          .map(Number)


      date =
        new Date(
          year,
          month - 1,
          day
        )

    }


    // ==================================
    // OTHER VALID DATE
    // ==================================

    else {

      date =
        new Date(value)

    }


    // ==================================
    // INVALID DATE
    // ==================================

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return ''

    }


    const year =
      date.getFullYear()


    const month =
      date.getMonth() + 1


    // ==================================
    // APRIL = NEW SESSION
    // ==================================

    if (
      month >= 4
    ) {

      return `${year}-${year + 1}`

    }


    // ==================================
    // JANUARY-MARCH
    // ==================================

    return `${year - 1}-${year}`

  }


// ======================================
// HELPER: CURRENT SESSION
// ======================================

const getCurrentAcademicSession =
  () => {

    return calculateAcademicSession(
      new Date()
    )

  }


// ======================================
// HELPER: GENERATE NEXT ADMISSION NUMBER
// ======================================

const generateAdmissionNumber =
  async () => {

    const students =
      await Student.find({

        admissionNumber: {

          $regex:
            /^PIE\d+$/,

        },

      })

        .select(
          'admissionNumber'
        )

        .lean()


    let highestNumber =
      0


    for (
      const student of students
    ) {

      const currentNumber =
        parseInt(

          String(
            student.admissionNumber || ''
          )
            .replace(
              'PIE',
              ''
            ),

          10

        ) || 0


      if (
        currentNumber >
        highestNumber
      ) {

        highestNumber =
          currentNumber

      }

    }


    const nextNumber =
      highestNumber + 1


    return (

      `PIE${String(
        nextNumber
      ).padStart(
        4,
        '0'
      )}`

    )

  }


// ======================================
// ADD STUDENT
// ======================================

router.post(

  '/students',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        name,

        dob,

        aadharNumber,

        course,

        batchTime,

        contact,

        email,

        admissionDate,

        fatherName,

        motherName,

        fatherOccupation,

        motherOccupation,

        fatherMobile,

        motherMobile,

        permanentAddress,

        currentAddress,

        schoolCollegeName,

        admissionType,

        registrationFee,

        registrationFeePaid,

        totalFees,

        monthlyInstallment,

        threeMonthInstallment,

        sixMonthInstallment,

        fullPaymentFee,

        paidFees,

        paymentPlan,

        dueDate,

      } = req.body


      // ======================================
      // GENERATE ADMISSION NUMBER
      // ======================================

      const admissionNumber =
        await generateAdmissionNumber()


      console.log(
        'Generated Admission Number:',
        admissionNumber
      )


      // ======================================
      // CALCULATE SESSION
      // ======================================

      const session =
        calculateAcademicSession(
          admissionDate
        )


      if (!session) {

        return res.status(400).json({

          success: false,

          message:
            'Valid admission date is required to calculate academic session.',

        })

      }


      console.log(
        'Academic Session:',
        session
      )


      // ======================================
      // IMAGE
      // ======================================

      const image =
        req.file
          ? req.file.path
          : ''


      // ======================================
      // NUMERIC VALUES
      // ======================================

      const totalFee =
        Number(
          totalFees || 0
        )


      const paidFee =
        Number(
          paidFees || 0
        )


      const registration =
        Number(
          registrationFee || 0
        )


      const registrationPaid =
        Number(
          registrationFeePaid || 0
        )


      // ======================================
      // VALIDATION
      // ======================================

      if (
        paidFee < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be negative.',

        })

      }


      if (
        paidFee >
        totalFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be greater than total course fee.',

        })

      }


      if (
        registrationPaid < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration fee paid cannot be negative.',

        })

      }


      if (
        registrationPaid >
        registration
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration fee paid cannot be greater than registration fee.',

        })

      }


      // ======================================
      // COURSE FEE STATUS
      // ======================================

      const {

        remaining,

        status,

      } =
        calculateFeesStatus(

          totalFee,

          paidFee

        )


      // ======================================
      // REGISTRATION STATUS
      // ======================================

      const registrationStatus =

        registrationPaid >=
          registration &&
        registration > 0

          ? 'Paid'

          : 'Pending'


      // ======================================
      // CREATE STUDENT
      // ======================================

      const newStudent =
        new Student({

          name:
            name || '',

          dob:
            dob || '',

          aadharNumber:
            aadharNumber || '',

          admissionNumber:
            admissionNumber,

          // ==================================
          // COURSE OPTIONAL
          // ==================================

          course:
            course || '',

          batchTime:
            batchTime || '',

          // ==================================
          // CONTACT REQUIRED
          // ==================================

          contact:
            contact || '',

          // ==================================
          // EMAIL OPTIONAL
          // ==================================

          email:
            email || '',

          admissionDate:
            admissionDate,

          session:
            session,

          // ==================================
          // NEW STUDENT STATUS
          // ==================================

          studentStatus:
            'Active',

          image:
            image,

          fatherName:
            fatherName || '',

          motherName:
            motherName || '',

          fatherOccupation:
            fatherOccupation || '',

          motherOccupation:
            motherOccupation || '',

          fatherMobile:
            fatherMobile || '',

          motherMobile:
            motherMobile || '',

          permanentAddress:
            permanentAddress || '',

          currentAddress:
            currentAddress || '',

          schoolCollegeName:
            schoolCollegeName || '',

          admissionType:
            admissionType || 'Offline',

          // ==================================
          // REGISTRATION FEE OPTIONAL
          // ==================================

          registrationFee:
            registration,

          registrationFeePaid:
            registrationPaid,

          registrationFeeStatus:
            registrationStatus,

          // ==================================
          // COURSE FEE OPTIONAL
          // ==================================

          totalFees:
            totalFee,

          paidFees:
            paidFee,

          remainingFees:
            remaining,

          feesStatus:
            status,

          // ==================================
          // INSTALLMENTS OPTIONAL
          // ==================================

          monthlyInstallment:
            Number(
              monthlyInstallment || 0
            ),

          threeMonthInstallment:
            Number(
              threeMonthInstallment || 0
            ),

          sixMonthInstallment:
            Number(
              sixMonthInstallment || 0
            ),

          fullPaymentFee:
            Number(
              fullPaymentFee || 0
            ),

          // ==================================
          // PAYMENT PLAN OPTIONAL
          // ==================================

          paymentPlan:
            paymentPlan || '',

          dueDate:
            dueDate || '',

          paymentMode:
            'Offline',

          paymentHistory:
            [],

        })


      // ======================================
      // OFFLINE REGISTRATION PAYMENT
      // ======================================

      if (
        registrationPaid > 0
      ) {

        newStudent.paymentHistory.push({

          amount:
            registrationPaid,

          paymentCategory:
            'Registration',

          paymentMethod:
            'Cash',

          paymentType:
            'Full',

          paymentPlan:
            '',

          paymentMode:
            'Offline',

          paymentStatus:
            'Success',

          transactionId:
            '',

          orderId:
            '',

          paymentDate:

            admissionDate ||

            new Date()
              .toISOString()
              .split('T')[0],

        })

      }


      // ======================================
      // OFFLINE COURSE FEE PAYMENT
      // ======================================

      if (
        paidFee > 0
      ) {

        newStudent.paymentHistory.push({

          amount:
            paidFee,

          paymentCategory:
            'CourseFee',

          paymentMethod:
            'Cash',

          paymentType:

            paymentPlan === 'full'

              ? 'Full'

              : 'Installment',

          paymentPlan:
            paymentPlan || '',

          paymentMode:
            'Offline',

          paymentStatus:
            'Success',

          transactionId:
            '',

          orderId:
            '',

          paymentDate:

            admissionDate ||

            new Date()
              .toISOString()
              .split('T')[0],

        })

      }


      // ======================================
      // SAVE STUDENT
      // ======================================

      const savedStudent =
        await newStudent.save()


      // ======================================
      // SAVE REGISTRATION PAYMENT
      // ======================================

      let registrationPayment =
        null


      if (
        registrationPaid > 0
      ) {

        registrationPayment =
          await Payment.create({

            studentName:
              savedStudent.name,

            admissionNumber:
              savedStudent.admissionNumber,

            email:
              savedStudent.email,

            phone:
              savedStudent.contact,

            course:
              savedStudent.course,

            totalFee:
              savedStudent.totalFees,

            registrationFee:
              savedStudent.registrationFee,

            paymentCategory:
              'Registration',

            paymentPlan:
              '',

            paymentType:
              'Full',

            amountPaid:
              registrationPaid,

            paymentMethod:
              'Cash',

            paymentMode:
              'Offline',

            paymentStatus:
              'Success',

            transactionId:
              '',

            razorpayOrderId:
              '',

            razorpayPaymentId:
              '',

            razorpaySignature:
              '',

          })

      }


      // ======================================
      // SAVE COURSE FEE PAYMENT
      // ======================================

      let coursePayment =
        null


      if (
        paidFee > 0
      ) {

        coursePayment =
          await Payment.create({

            studentName:
              savedStudent.name,

            admissionNumber:
              savedStudent.admissionNumber,

            email:
              savedStudent.email,

            phone:
              savedStudent.contact,

            course:
              savedStudent.course,

            totalFee:
              savedStudent.totalFees,

            registrationFee:
              savedStudent.registrationFee,

            paymentCategory:
              'CourseFee',

            paymentPlan:
              savedStudent.paymentPlan || '',

            paymentType:

              savedStudent.paymentPlan ===
              'full'

                ? 'Full'

                : 'Installment',

            amountPaid:
              paidFee,

            paymentMethod:
              'Cash',

            paymentMode:
              'Offline',

            paymentStatus:
              'Success',

            transactionId:
              '',

            razorpayOrderId:
              '',

            razorpayPaymentId:
              '',

            razorpaySignature:
              '',

          })

      }


      // ======================================
      // CREATE ADMISSION NOTIFICATION
      // ======================================

      try {

        await createNotification({

          type:
            'Admission',

          title:
            'New Admission',

          message:

            `${savedStudent.name} has taken admission` +

            (

              savedStudent.course
                ? ` in ${savedStudent.course}`
                : ''

            ),

          link:
            '/admin/students',

          relatedId:
            savedStudent._id.toString(),

        })

      }

      catch (
        notificationError
      ) {

        console.log(
          'Admission Notification Error:',
          notificationError
        )

      }


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Student Added Successfully',

        student:
          savedStudent,

        registrationPayment,

        coursePayment,

      })

    }

    catch (error) {

      console.log(
        'Add Student Error:',
        error
      )


      if (
        error.code === 11000 &&
        error.keyPattern?.admissionNumber
      ) {

        return res.status(409).json({

          success: false,

          message:
            'Admission number conflict. Please try again.',

        })

      }


      res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


// ======================================
// GET ALL STUDENTS
// ======================================
//
// Supported filters:
//
// ?session=2026-2027
//
// ?search=PIE0001
//
// ?course=SSC CGL
//
// ?batchTime=Morning
//
// ?feesStatus=Paid
//
// ?feesStatus=Partial
//
// ?feesStatus=Pending
//
// ?feesStatus=All
//
// ?studentStatus=Active
//
// ?studentStatus=Inactive
//
// ?studentStatus=All
//
// ======================================

router.get(

  '/students',

  async (req, res) => {

    try {

      const {

        session,

        search,

        course,

        batchTime,

        feesStatus,

        studentStatus,

      } = req.query


      // ======================================
      // QUERY
      // ======================================

      const query = {}


      // ======================================
      // SESSION FILTER
      // ======================================

      if (
        session &&
        session !== 'All'
      ) {

        query.session =
          session

      }


      // ======================================
      // SEARCH
      // ======================================
      //
      // Name OR Admission Number
      //
      // ======================================

      if (
        search &&
        search.trim()
      ) {

        const searchValue =
          search.trim()


        query.$or = [

          {

            name: {

              $regex:
                searchValue,

              $options:
                'i',

            },

          },

          {

            admissionNumber: {

              $regex:
                searchValue,

              $options:
                'i',

            },

          },

        ]

      }


      // ======================================
      // COURSE FILTER
      // ======================================

      if (
        course &&
        course !== 'All'
      ) {

        query.course =
          course

      }


      // ======================================
      // BATCH FILTER
      // ======================================

      if (
        batchTime &&
        batchTime !== 'All'
      ) {

        query.batchTime =
          batchTime

      }


      // ======================================
      // FEE STATUS FILTER
      // ======================================

      if (
        feesStatus &&
        feesStatus !== 'All'
      ) {

        query.feesStatus =
          feesStatus

      }


      // ======================================
      // STUDENT STATUS FILTER
      // ======================================

      if (
        studentStatus &&
        studentStatus !== 'All'
      ) {

        if (
          studentStatus === 'Active'
        ) {

          query.$and = [

            ...(query.$and || []),

            {

              $or: [

                {

                  studentStatus:
                    'Active',

                },

                {

                  studentStatus:
                    {
                      $exists: false,
                    },

                },

                {

                  studentStatus:
                    '',

                },

              ],

            },

          ]

        }

        else {

          query.studentStatus =
            studentStatus

        }

      }


      // ======================================
      // FIND STUDENTS
      // ======================================

      let students =
        await Student.find(
          query
        )

          .sort({

            admissionDate:
              -1,

            createdAt:
              -1,

          })


      // ======================================
      // BACKFILL OLD STUDENT SESSION
      // ======================================

      const updates = []


      for (
        const student of students
      ) {

        if (
          !student.session &&
          student.admissionDate
        ) {

          const calculatedSession =
            calculateAcademicSession(
              student.admissionDate
            )


          if (
            calculatedSession
          ) {

            student.session =
              calculatedSession


            updates.push(
              student.save()
            )

          }

        }

      }


      if (
        updates.length > 0
      ) {

        await Promise.all(
          updates
        )

      }


      // ======================================
      // SESSION FILTER AFTER BACKFILL
      // ======================================

      if (
        session &&
        session !== 'All'
      ) {

        students =
          students.filter(

            (student) => (

              student.session ===
              session

            )

          )

      }


      // ======================================
      // OLD STUDENT STATUS NORMALIZATION
      // ======================================

      students =
        students.map(

          (student) => {

            const studentObject =
              student.toObject()


            if (
              !studentObject.studentStatus
            ) {

              studentObject.studentStatus =
                'Active'

            }


            return studentObject

          }

        )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json(
        students
      )

    }

    catch (error) {

      console.log(
        'Get Students Error:',
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
// DELETE STUDENT
// ======================================

router.delete(

  '/students/:id',

  async (req, res) => {

    try {

      // ==================================
      // FIND STUDENT
      // ==================================

      const student =
        await Student.findById(
          req.params.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }


      // ==================================
      // DELETE RECEIPTS
      // ==================================

      const receiptResult =
        await Receipt.deleteMany({

          studentId:
            student._id,

        })


      // ==================================
      // DELETE PAYMENTS
      // ==================================

      const paymentResult =
        await Payment.deleteMany({

          admissionNumber:
            student.admissionNumber,

        })


      // ==================================
      // DELETE STUDENT
      // ==================================

      await Student.findByIdAndDelete(
        student._id
      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Student Deleted Successfully',

        deletedReceipts:
          receiptResult.deletedCount,

        deletedPayments:
          paymentResult.deletedCount,

      })

    }

    catch (error) {

      console.log(
        'Delete Student Error:',
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
// UPDATE STUDENT
// ======================================

router.put(

  '/students/:id',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        name,

        dob,

        aadharNumber,

        course,

        batchTime,

        contact,

        email,

        admissionDate,

        fatherName,

        motherName,

        fatherOccupation,

        motherOccupation,

        fatherMobile,

        motherMobile,

        permanentAddress,

        currentAddress,

        schoolCollegeName,

        admissionType,

        registrationFee,

        registrationFeePaid,

        totalFees,

        paidFees,

        monthlyInstallment,

        threeMonthInstallment,

        sixMonthInstallment,

        fullPaymentFee,

        paymentPlan,

        dueDate,

        studentStatus,

      } = req.body


      // ======================================
      // FIND STUDENT
      // ======================================

      const student =
        await Student.findById(
          req.params.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }


      // ======================================
      // IMAGE
      // ======================================

      const image =
        req.file
          ? req.file.path
          : student.image


      // ======================================
      // NUMERIC VALUES
      // ======================================

      const totalFee =
        Number(
          totalFees || 0
        )


      const paidFee =
        Number(
          paidFees || 0
        )


      const registration =
        Number(
          registrationFee || 0
        )


      const registrationPaid =
        Number(
          registrationFeePaid || 0
        )


      // ======================================
      // VALIDATION
      // ======================================

      if (
        paidFee < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be negative.',

        })

      }


      if (
        paidFee >
        totalFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Paid fee cannot be greater than total course fee.',

        })

      }


      if (
        registrationPaid < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration fee paid cannot be negative.',

        })

      }


      if (
        registrationPaid >
        registration
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration fee paid cannot be greater than registration fee.',

        })

      }


      // ======================================
      // FEE STATUS
      // ======================================

      const {

        remaining,

        status,

      } =
        calculateFeesStatus(

          totalFee,

          paidFee

        )


      // ======================================
      // REGISTRATION STATUS
      // ======================================

      const registrationStatus =

        registrationPaid >=
          registration &&
        registration > 0

          ? 'Paid'

          : 'Pending'


      // ======================================
      // CALCULATE SESSION
      // ======================================

      const session =
        calculateAcademicSession(
          admissionDate
        )


      if (!session) {

        return res.status(400).json({

          success: false,

          message:
            'Valid admission date is required to calculate academic session.',

        })

      }


      // ======================================
      // VALIDATE STUDENT STATUS
      // ======================================

      const finalStudentStatus =

        studentStatus === 'Inactive'

          ? 'Inactive'

          : 'Active'


      // ======================================
      // UPDATE STUDENT
      // ======================================

      student.name =
        name || ''


      student.dob =
        dob || ''


      student.aadharNumber =
        aadharNumber || ''


      // ======================================
      // COURSE OPTIONAL
      // ======================================

      student.course =
        course || ''


      student.batchTime =
        batchTime || ''


      // ======================================
      // CONTACT
      // ======================================

      student.contact =
        contact || ''


      // ======================================
      // EMAIL OPTIONAL
      // ======================================

      student.email =
        email || ''


      student.admissionDate =
        admissionDate


      student.session =
        session


      // ======================================
      // STUDENT STATUS
      // ======================================

      student.studentStatus =
        finalStudentStatus


      student.image =
        image


      // ======================================
      // PARENTS
      // ======================================

      student.fatherName =
        fatherName || ''


      student.motherName =
        motherName || ''


      student.fatherOccupation =
        fatherOccupation || ''


      student.motherOccupation =
        motherOccupation || ''


      student.fatherMobile =
        fatherMobile || ''


      student.motherMobile =
        motherMobile || ''


      // ======================================
      // ADDRESS
      // ======================================

      student.permanentAddress =
        permanentAddress || ''


      student.currentAddress =
        currentAddress || ''


      // ======================================
      // EDUCATION
      // ======================================

      student.schoolCollegeName =
        schoolCollegeName || ''


      // ======================================
      // ADMISSION
      // ======================================

      student.admissionType =
        admissionType || 'Offline'


      // ======================================
      // REGISTRATION
      // ======================================

      student.registrationFee =
        registration


      student.registrationFeePaid =
        registrationPaid


      student.registrationFeeStatus =
        registrationStatus


      // ======================================
      // COURSE FEE
      // ======================================

      student.totalFees =
        totalFee


      student.paidFees =
        paidFee


      student.remainingFees =
        remaining


      student.feesStatus =
        status


      // ======================================
      // PAYMENT OPTIONS
      // ======================================

      student.monthlyInstallment =
        Number(
          monthlyInstallment || 0
        )


      student.threeMonthInstallment =
        Number(
          threeMonthInstallment || 0
        )


      student.sixMonthInstallment =
        Number(
          sixMonthInstallment || 0
        )


      student.fullPaymentFee =
        Number(
          fullPaymentFee || 0
        )


      // ======================================
      // PAYMENT PLAN
      // ======================================

      student.paymentPlan =
        paymentPlan || ''


      // ======================================
      // DUE DATE
      // ======================================

      student.dueDate =
        dueDate || ''


      // ======================================
      // SAVE
      // ======================================

      const updatedStudent =
        await student.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Student Updated Successfully',

        student:
          updatedStudent,

      })

    }

    catch (error) {

      console.log(
        'Update Student Error:',
        error
      )

      res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


// ======================================
// ADD OFFLINE COURSE FEE PAYMENT
// ======================================

router.put(

  '/students/add-payment/:id',

  async (req, res) => {

    try {

      const {

        amount,

        paymentMethod,

        paymentDate,

        paymentPlan,

      } = req.body


      // ======================================
      // FIND STUDENT
      // ======================================

      const student =
        await Student.findById(
          req.params.id
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }


      // ======================================
      // PAYMENT AMOUNT
      // ======================================

      const paymentAmount =
        Number(amount)


      if (
        !paymentAmount ||
        paymentAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid Payment Amount',

        })

      }


      // ======================================
      // REMAINING COURSE FEE
      // ======================================

      const remainingFee =
        Number(
          student.remainingFees || 0
        )


      if (
        remainingFee <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course Fee Already Paid',

        })

      }


      // ======================================
      // PAYMENT CANNOT EXCEED REMAINING
      // ======================================

      if (
        paymentAmount >
        remainingFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Payment cannot be greater than remaining fee of ₹${remainingFee}.`,

        })

      }


      // ======================================
      // PAYMENT PLAN
      // ======================================

      let selectedPlan =
        student.paymentPlan || ''


      // ======================================
      // FIRST PAYMENT PLAN
      // ======================================

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


      // ======================================
      // PREVENT PLAN CHANGE
      // ======================================

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


      // ======================================
      // PAYMENT MINIMUM
      // ======================================

      let minimumAmount =
        0


      switch (
        selectedPlan
      ) {

        case 'monthly':

          minimumAmount =
            Number(
              student.monthlyInstallment || 0
            )

          break


        case 'three_month':

          minimumAmount =
            Number(
              student.threeMonthInstallment || 0
            )

          break


        case 'six_month':

          minimumAmount =
            Number(
              student.sixMonthInstallment || 0
            )

          break


        case 'full':

          minimumAmount =
            remainingFee

          break


        default:

          minimumAmount =
            0

      }


      // ======================================
      // PAYABLE MINIMUM
      // ======================================

      const payableMinimum =
        Math.min(

          minimumAmount,

          remainingFee

        )


      // ======================================
      // MINIMUM PAYMENT CHECK
      // ======================================

      if (

        selectedPlan !== 'full' &&

        payableMinimum > 0 &&

        paymentAmount <
          payableMinimum

      ) {

        return res.status(400).json({

          success: false,

          message:
            `Minimum payment for ${selectedPlan} is ₹${payableMinimum}.`,

        })

      }


      // ======================================
      // FULL PAYMENT CHECK
      // ======================================

      if (
        selectedPlan === 'full'
      ) {

        if (
          paymentAmount !==
          remainingFee
        ) {

          return res.status(400).json({

            success: false,

            message:
              `Full payment amount must be ₹${remainingFee}.`,

          })

        }

      }


      // ======================================
      // PAYMENT DATE
      // ======================================

      const finalPaymentDate =
        paymentDate ||

        new Date()
          .toISOString()
          .split('T')[0]


      // ======================================
      // PAYMENT METHOD
      // ======================================

      const finalPaymentMethod =
        paymentMethod ||
        'Cash'


      // ======================================
      // PAYMENT TYPE
      // ======================================

      const paymentType =

        selectedPlan === 'full'

          ? 'Full'

          : 'Installment'


      // ======================================
      // UPDATE PAYMENT HISTORY
      // ======================================

      student.paymentHistory.push({

        amount:
          paymentAmount,

        paymentCategory:
          'CourseFee',

        paymentMethod:
          finalPaymentMethod,

        paymentType,

        paymentPlan:
          selectedPlan,

        paymentMode:
          'Offline',

        paymentStatus:
          'Success',

        transactionId:
          '',

        orderId:
          '',

        paymentDate:
          finalPaymentDate,

      })


      // ======================================
      // UPDATE PAID FEES
      // ======================================

      student.paidFees =

        Number(
          student.paidFees || 0
        ) +

        paymentAmount


      // ======================================
      // UPDATE REMAINING
      // ======================================

      student.remainingFees =

        Math.max(

          0,

          Number(
            student.totalFees || 0
          ) -

          Number(
            student.paidFees || 0
          )

        )


      // ======================================
      // UPDATE STATUS
      // ======================================

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


      // ======================================
      // LAST PAYMENT MODE
      // ======================================

      student.paymentMode =
        'Offline'


      // ======================================
      // SAVE STUDENT
      // ======================================

      await student.save()


      // ======================================
      // SAVE PAYMENT COLLECTION
      // ======================================

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
            paymentAmount,

          paymentMethod:
            finalPaymentMethod,

          paymentMode:
            'Offline',

          paymentStatus:
            'Success',

          transactionId:
            '',

          razorpayOrderId:
            '',

          razorpayPaymentId:
            '',

          razorpaySignature:
            '',

        })


      // ======================================
      // PAYMENT NOTIFICATION
      // ======================================

      try {

        await createNotification({

          type:
            'Payment',

          title:
            'Payment Received',

          message:

            `${student.name} paid ₹${paymentAmount}` +

            (

              student.course
                ? ` for ${student.course}`
                : ''

            ),

          link:
            '/admin/payments',

          relatedId:
            payment._id.toString(),

        })

      }

      catch (
        notificationError
      ) {

        console.log(
          'Payment Notification Error:',
          notificationError
        )

      }


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Offline Payment Added Successfully',

        student,

        payment,

      })

    }

    catch (error) {

      console.log(
        'Add Offline Payment Error:',
        error
      )

      res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


// ======================================
// VERIFY STUDENT
// ======================================

router.post(

  '/students/verify',

  async (req, res) => {

    try {

      const {

        admissionNumber,

        name,

        phone,

      } = req.body


      if (
        !admissionNumber ||
        !name ||
        !phone
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Admission Number, Name and Mobile are required.',

        })

      }


      const student =
        await Student.findOne({

          admissionNumber:
            admissionNumber.trim(),

          name:
            name.trim(),

          contact:
            phone.trim(),

        })


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student Not Found',

        })

      }


      res.status(200).json({

        success: true,

        student,

      })

    }

    catch (error) {

      console.log(
        'Verify Student Error:',
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
// CHECK EXISTING STUDENT
// ======================================

router.post(

  '/students/check',

  async (req, res) => {

    try {

      const {

        email,

        phone,

      } = req.body


      const conditions =
        []


      if (email) {

        conditions.push({

          email:
            email
              .trim()
              .toLowerCase(),

        })

      }


      if (phone) {

        conditions.push({

          contact:
            phone.trim(),

        })

      }


      if (
        conditions.length === 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Email or phone is required.',

        })

      }


      const student =
        await Student.findOne({

          $or:
            conditions,

        })


      res.status(200).json({

        success: true,

        exists:
          !!student,

      })

    }

    catch (error) {

      console.log(
        'Check Student Error:',
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
// EXPORT
// ======================================

module.exports =
  router