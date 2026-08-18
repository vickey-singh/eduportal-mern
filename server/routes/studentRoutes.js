const express =
  require('express')

const crypto =
  require('crypto')

const router =
  express.Router()

const upload =
  require('../middleware/upload')

const razorpay =
  require('../config/razorpay')

const Student =
  require('../models/Student')

const Payment =
  require('../models/Payment')

const Receipt =
  require('../models/Receipt')

const createNotification =
  require('../utils/createNotification')

const studentAuth =
  require('../middleware/studentAuth')


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
// HELPER: GET INSTALLMENT MONTHS
// ======================================

const getInstallmentMonths = (
  paymentPlan
) => {

  switch (
    paymentPlan
  ) {

    case 'monthly':
      return 1

    case 'three_month':
      return 3

    case 'six_month':
      return 6

    default:
      return 0

  }

}


// ======================================
// HELPER: ADD MONTHS TO DATE
// ======================================

const addMonthsToDate = (
  dateValue,
  months
) => {

  if (
    !dateValue ||
    !months
  ) {

    return ''

  }


  const value =
    String(dateValue)
      .trim()


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
      day,
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
      year,
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
      year,
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


  else {

    date =
      new Date(value)

  }


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return ''

  }


  // ==================================
  // ADD MONTHS
  // ==================================

  date.setMonth(
    date.getMonth() +
    Number(months)
  )


  // ==================================
  // FORMAT YYYY-MM-DD
  // ==================================

  const year =
    date.getFullYear()


  const month =
    String(
      date.getMonth() + 1
    )
      .padStart(
        2,
        '0'
      )


  const day =
    String(
      date.getDate()
    )
      .padStart(
        2,
        '0'
      )


  return (
    `${year}-${month}-${day}`
  )

}


// ======================================
// HELPER: INITIAL DUE DATE
// ======================================

const calculateInitialDueDate = (
  admissionDate,
  paymentPlan
) => {

  const months =
    getInstallmentMonths(
      paymentPlan
    )


  if (
    !months ||
    !admissionDate
  ) {

    return ''

  }


  return addMonthsToDate(
    admissionDate,
    months
  )

}


// ======================================
// HELPER: NEXT DUE DATE AFTER PAYMENT
// ======================================

const calculateNextDueDate = (
  currentDueDate,
  admissionDate,
  paymentPlan,
  paymentDate
) => {

  const months =
    getInstallmentMonths(
      paymentPlan
    )


  // ==================================
  // FULL PAYMENT
  // ==================================

  if (
    paymentPlan === 'full'
  ) {

    return ''

  }


  if (
    !months
  ) {

    return ''

  }


  // ==================================
  // GET CURRENT DUE DATE
  // ==================================

  let nextDueDate =
    currentDueDate


  // ==================================
  // OLD STUDENT / NO DUE DATE
  // ==================================

  if (
    !nextDueDate
  ) {

    nextDueDate =
      calculateInitialDueDate(
        admissionDate,
        paymentPlan
      )

  }


  if (
    !nextDueDate
  ) {

    return ''

  }


  // ==================================
  // PAYMENT DATE
  // ==================================

  const finalPaymentDate =
    paymentDate ||

    new Date()
      .toISOString()
      .split('T')[0]


  // ==================================
  // EARLY PAYMENT
  // ==================================
  //
  // Example:
  //
  // Due Date    = 01-02-2026
  // Payment     = 20-01-2026
  //
  // Next Due should remain:
  // 01-02-2026
  //
  // NOT:
  // 01-03-2026
  //
  // ==================================

  if (
    finalPaymentDate <
    nextDueDate
  ) {

    return nextDueDate

  }


  // ==================================
  // PAYMENT ON / AFTER DUE DATE
  // ==================================

  let candidate =
    addMonthsToDate(
      nextDueDate,
      months
    )


  // ==================================
  // LATE PAYMENT
  // ==================================
  //
  // Due:     01-02
  // Payment: 08-04
  //
  // Schedule:
  // 01-03
  // 01-04
  // 01-05
  //
  // Next Due:
  // 01-05
  //
  // ==================================

  while (
    candidate &&
    candidate <=
      finalPaymentDate
  ) {

    candidate =
      addMonthsToDate(
        candidate,
        months
      )

  }


  return candidate

}

// ======================================
// HELPER: CALCULATE ACADEMIC SESSION
// ======================================
//
// April -> March
//
// 01-04-2026 to 31-03-2027
// = 2026-2027
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
    // OTHER DATE
    // ==================================

    else {

      date =
        new Date(value)

    }


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
    // APRIL - DECEMBER
    // ==================================

    if (
      month >= 4
    ) {

      return `${year}-${year + 1}`

    }


    // ==================================
    // JANUARY - MARCH
    // ==================================

    return `${year - 1}-${year}`

  }


// ======================================
// HELPER: CURRENT SESSION
// ======================================

const getCurrentAcademicSession =
  () => {

    const now =
      new Date()

    const year =
      now.getFullYear()

    const month =
      now.getMonth() + 1

    if (
      month >= 4
    ) {

      return `${year}-${year + 1}`

    }

    return `${year - 1}-${year}`

  }


// ======================================
// HELPER: GENERATE ADMISSION NUMBER
// ======================================

const generateAdmissionNumber =
  async () => {

    const students =
      await Student.find({

        admissionNumber: {

          $regex:
            /^PIE\d+$/i,

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
              /^PIE/i,
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


      // ==================================
      // REQUIRED BASIC FIELDS
      // ==================================

      if (
        !name ||
        !String(name).trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student name is required.',

        })

      }


      if (
        !contact ||
        !String(contact).trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student mobile number is required.',

        })

      }


      if (
        !admissionDate
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Admission date is required.',

        })

      }


      // ==================================
      // GENERATE ADMISSION NUMBER
      // ==================================

      const admissionNumber =
        await generateAdmissionNumber()


      console.log(
        'Generated Admission Number:',
        admissionNumber
      )


      // ==================================
      // SESSION
      // ==================================

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


      // ==================================
      // IMAGE
      // ==================================

      const image =
        req.file
          ? req.file.path
          : ''


      // ==================================
      // NUMERIC VALUES
      // ==================================

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


      // ==================================
      // VALIDATION
      // ==================================

      if (
        totalFee < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Total fee cannot be negative.',

        })

      }


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
        registration < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration fee cannot be negative.',

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


      // ==================================
      // COURSE FEE STATUS
      // ==================================

      const {

        remaining,

        status,

      } =
        calculateFeesStatus(

          totalFee,

          paidFee

        )


      // ==================================
      // REGISTRATION STATUS
      // ==================================

      const registrationStatus =

        registrationPaid >=
          registration &&
        registration > 0

          ? 'Paid'

          : 'Pending'


      // ==================================
      // CREATE STUDENT
      // ==================================

      const newStudent =
        new Student({

          name:
            String(name).trim(),

          dob:
            dob || '',

          aadharNumber:
            aadharNumber || '',

          admissionNumber,

          // COURSE OPTIONAL
          course:
            course || '',

          batchTime:
            batchTime || '',

          contact:
            String(contact).trim(),

          // EMAIL OPTIONAL
          email:
            email
              ? String(email)
                  .trim()
                  .toLowerCase()
              : '',

          admissionDate,

          session,

          // NEW STUDENT ACTIVE
          studentStatus:
            'Active',

          image,

          // ==================================
          // PARENTS
          // ==================================

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

          // ==================================
          // ADDRESS
          // ==================================

          permanentAddress:
            permanentAddress || '',

          currentAddress:
            currentAddress || '',

          // ==================================
          // EDUCATION
          // ==================================

          schoolCollegeName:
            schoolCollegeName || '',

          // ==================================
          // ADMISSION
          // ==================================

          admissionType:
            admissionType || 'Offline',

          // ==================================
          // REGISTRATION
          // ==================================

          registrationFee:
            registration,

          registrationFeePaid:
            registrationPaid,

          registrationFeeStatus:
            registrationStatus,

          // ==================================
          // COURSE FEE
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
          // PAYMENT OPTIONS
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

          paymentPlan:
            paymentPlan || '',

          dueDate:
            paymentPlan === 'full'
              ? ''
              : calculateInitialDueDate(
                  admissionDate,
                  paymentPlan
                ),

          paymentMode:
            'Offline',

          paymentHistory:
            [],

        })


      // ==================================
      // REGISTRATION PAYMENT HISTORY
      // ==================================

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


      // ==================================
      // COURSE FEE PAYMENT HISTORY
      // ==================================

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


      // ==================================
      // SAVE STUDENT
      // ==================================

      const savedStudent =
        await newStudent.save()


      // ==================================
      // SAVE REGISTRATION PAYMENT
      // ==================================

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


      // ==================================
      // SAVE COURSE PAYMENT
      // ==================================

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


      // ==================================
      // NOTIFICATION
      // ==================================

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


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(201).json({

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


      return res.status(500).json({

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


      const query = {}


      // ==================================
      // SESSION
      // ==================================

      if (
        session &&
        session !== 'All'
      ) {

        query.session =
          session

      }


      // ==================================
      // SEARCH
      // ==================================

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


      // ==================================
      // COURSE
      // ==================================

      if (
        course &&
        course !== 'All'
      ) {

        query.course =
          course

      }


      // ==================================
      // BATCH
      // ==================================

      if (
        batchTime &&
        batchTime !== 'All'
      ) {

        query.batchTime =
          batchTime

      }


      // ==================================
      // FEE STATUS
      // ==================================

      if (
        feesStatus &&
        feesStatus !== 'All'
      ) {

        query.feesStatus =
          feesStatus

      }


      // ==================================
      // STUDENT STATUS
      // ==================================

      if (
        studentStatus &&
        studentStatus !== 'All'
      ) {

        if (
          studentStatus === 'Active'
        ) {

          query.$or = [

            ...(query.$or || []),

            {

              studentStatus:
                'Active',

            },

            {

              studentStatus: {

                $exists:
                  false,

              },

            },

            {

              studentStatus:
                '',

            },

          ]

        }

        else {

          query.studentStatus =
            studentStatus

        }

      }


      // ==================================
      // FIND
      // ==================================

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


      // ==================================
      // BACKFILL SESSION
      // ==================================

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


      // ==================================
      // SESSION FILTER AFTER BACKFILL
      // ==================================

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


      // ==================================
      // OLD STATUS NORMALIZATION
      // ==================================

      students =
        students.map(

          (student) => {

            const data =
              student.toObject()


            if (
              !data.studentStatus
            ) {

              data.studentStatus =
                'Active'

            }


            return data

          }

        )


      return res.status(200).json(
        students
      )

    }

    catch (error) {

      console.log(
        'Get Students Error:',
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
      // IMAGE
      // ==================================

      const image =
        req.file
          ? req.file.path
          : student.image


      // ==================================
      // NUMBERS
      // ==================================

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


      // ==================================
      // VALIDATION
      // ==================================

      if (
        totalFee < 0 ||
        paidFee < 0 ||
        registration < 0 ||
        registrationPaid < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Fee values cannot be negative.',

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
        registrationPaid >
        registration
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Registration fee paid cannot be greater than registration fee.',

        })

      }


      // ==================================
      // FEE STATUS
      // ==================================

      const {

        remaining,

        status,

      } =
        calculateFeesStatus(

          totalFee,

          paidFee

        )


      // ==================================
      // REGISTRATION STATUS
      // ==================================

      const registrationStatus =

        registrationPaid >=
          registration &&
        registration > 0

          ? 'Paid'

          : 'Pending'


      // ==================================
      // SESSION
      // ==================================

      const session =
        calculateAcademicSession(
          admissionDate
        )


      if (!session) {

        return res.status(400).json({

          success: false,

          message:
            'Valid admission date is required.',

        })

      }


      // ==================================
      // STATUS
      // ==================================

      const finalStudentStatus =

        studentStatus ===
        'Inactive'

          ? 'Inactive'

          : 'Active'


      // ==================================
      // UPDATE
      // ==================================

      student.name =
        name || ''

      student.dob =
        dob || ''

      student.aadharNumber =
        aadharNumber || ''

      student.course =
        course || ''

      student.batchTime =
        batchTime || ''

      student.contact =
        contact || ''

      student.email =
        email
          ? String(email)
              .trim()
              .toLowerCase()
          : ''

      student.admissionDate =
        admissionDate

      student.session =
        session

      student.studentStatus =
        finalStudentStatus

      student.image =
        image


      // ==================================
      // PARENTS
      // ==================================

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


      // ==================================
      // ADDRESS
      // ==================================

      student.permanentAddress =
        permanentAddress || ''

      student.currentAddress =
        currentAddress || ''


      // ==================================
      // EDUCATION
      // ==================================

      student.schoolCollegeName =
        schoolCollegeName || ''


      // ==================================
      // ADMISSION
      // ==================================

      student.admissionType =
        admissionType || 'Offline'


      // ==================================
      // REGISTRATION
      // ==================================

      student.registrationFee =
        registration

      student.registrationFeePaid =
        registrationPaid

      student.registrationFeeStatus =
        registrationStatus


      // ==================================
      // COURSE FEE
      // ==================================

      student.totalFees =
        totalFee

      student.paidFees =
        paidFee

      student.remainingFees =
        remaining

      student.feesStatus =
        status


      // ==================================
      // INSTALLMENTS
      // ==================================

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


      // ==================================
      // PLAN
      // ==================================

      student.paymentPlan =
        paymentPlan || ''


      // ==================================
      // DUE DATE
      // ==================================

      student.dueDate =
        dueDate || ''


      const updatedStudent =
        await student.save()


      return res.status(200).json({

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

      return res.status(500).json({

        success: false,

        message:
          error.message ||
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


      // ==================================
      // PAYMENT PLAN
      // ==================================

      let selectedPlan =
        student.paymentPlan || ''


      if (!selectedPlan) {

        selectedPlan =
          paymentPlan || ''

      }


      if (!selectedPlan) {

        return res.status(400).json({

          success: false,

          message:
            'Please select a payment plan.',

        })

      }


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


      // ==================================
      // MINIMUM PAYMENT
      // ==================================

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


      const payableMinimum =
        Math.min(
          minimumAmount,
          remainingFee
        )


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


      if (
        selectedPlan === 'full' &&
        paymentAmount !== remainingFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Full payment amount must be ₹${remainingFee}.`,

        })

      }


      // ==================================
      // PAYMENT DETAILS
      // ==================================

      const finalPaymentDate =
        paymentDate ||

        new Date()
          .toISOString()
          .split('T')[0]


      const finalPaymentMethod =
        paymentMethod ||
        'Cash'


      const paymentType =

        selectedPlan === 'full'
          ? 'Full'
          : 'Installment'


      // ==================================
      // PAYMENT HISTORY
      // ==================================

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


      // ==================================
      // UPDATE FEES
      // ==================================

      student.paidFees =

        Number(
          student.paidFees || 0
        ) +

        paymentAmount


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


      // ==================================
      // UPDATE NEXT DUE DATE
      // ==================================
      
      if (
        student.remainingFees === 0
      ) {
      
        student.dueDate =
          ''
      
      }
      
      else {
      
        student.dueDate =
          calculateNextDueDate(
      
            student.dueDate,
      
            student.admissionDate,
      
            selectedPlan,
      
            finalPaymentDate
      
          )
      
      }
      
      
      // ==================================
      // PAYMENT PLAN
      // ==================================
      
      student.paymentPlan =
        selectedPlan
      
      
      // ==================================
      // PAYMENT MODE
      // ==================================
      
      student.paymentMode =
        'Offline'


      // ==================================
      // SAVE STUDENT
      // ==================================

      await student.save()


      // ==================================
      // SAVE PAYMENT
      // ==================================

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


      // ==================================
      // NOTIFICATION
      // ==================================

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


      return res.status(200).json({

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

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


// ======================================
// CREATE LIVE RAZORPAY COURSE FEE ORDER
// ======================================
//
// POST
// /api/student/fees/create-order
//
// Student identity comes from JWT.
// Frontend does NOT send studentId.
//
// ======================================

router.post(

  '/student/fees/create-order',

  studentAuth,

  async (req, res) => {

    try {

      const {
        amount,
        paymentPlan,
      } = req.body


      // ==================================
      // GET STUDENT FROM JWT
      // ==================================

      const studentId =
        req.student?.id


      if (!studentId) {

        return res.status(400).json({

          success: false,

          message:
            'Student ID is required.',

        })

      }


      // ==================================
      // PAYMENT AMOUNT
      // ==================================

      const paymentAmount =
        Number(amount)


      if (
        !paymentAmount ||
        paymentAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid payment amount.',

        })

      }


      // ==================================
      // FIND STUDENT
      // ==================================

      const student =
        await Student.findById(
          studentId
        )


      if (!student) {

        return res.status(404).json({

          success: false,

          message:
            'Student not found.',

        })

      }


      // ==================================
      // REMAINING FEE
      // ==================================

      const remainingFee =
        Math.max(

          0,

          Number(
            student.totalFees || 0
          ) -

          Number(
            student.paidFees || 0
          )

        )


      if (
        remainingFee <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course fee is already fully paid.',

        })

      }


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


      // ==================================
      // PAYMENT PLAN
      // ==================================

      let selectedPlan =
        student.paymentPlan || ''


      if (!selectedPlan) {

        selectedPlan =
          paymentPlan || ''

      }


      if (!selectedPlan) {

        return res.status(400).json({

          success: false,

          message:
            'Please select a payment plan.',

        })

      }


      const allowedPlans = [

        'monthly',
        'three_month',
        'six_month',
        'full',

      ]


      if (
        !allowedPlans.includes(
          selectedPlan
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid payment plan.',

        })

      }


      // ==================================
      // PLAN CANNOT CHANGE
      // ==================================

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


      // ==================================
      // MINIMUM PAYMENT
      // ==================================

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

      }


      const payableMinimum =
        Math.min(

          minimumAmount,

          remainingFee

        )


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


      // ==================================
      // FULL PAYMENT
      // ==================================

      if (
        selectedPlan === 'full' &&

        paymentAmount !==
          remainingFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Full payment amount must be ₹${remainingFee}.`,

        })

      }


      // ==================================
      // CREATE RAZORPAY ORDER
      // ==================================

      const order =
        await razorpay.orders.create({

          amount:
            Math.round(
              paymentAmount * 100
            ),

          currency:
            'INR',

          receipt:
            `PIE_${student.admissionNumber}_${Date.now()}`,

          notes: {

            studentId:
              student._id.toString(),

            admissionNumber:
              student.admissionNumber,

            paymentPlan:
              selectedPlan,

            paymentCategory:
              'CourseFee',

          },

        })


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Razorpay order created successfully.',

        order: {

          id:
            order.id,

          amount:
            order.amount,

          currency:
            order.currency,

        },

        keyId:
          process.env.RAZORPAY_KEY_ID,

        paymentPlan:
          selectedPlan,

        amount:
          paymentAmount,

      })

    }

    catch (error) {

      console.log(
        'Create Razorpay Order Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:

          error?.error?.description ||

          error?.message ||

          'Unable to create Razorpay order.',

      })

    }

  }

)


// ======================================
// VERIFY LIVE RAZORPAY COURSE PAYMENT
// ======================================
//
// POST
// /api/student/fees/verify
//
// ======================================

router.post(

  '/student/fees/verify',
   
  studentAuth,

  async (req, res) => {

    try {

      const {

        razorpay_payment_id,

        razorpay_order_id,

        razorpay_signature,

      } = req.body


      // ==================================
      // BASIC VALIDATION
      // ==================================

      if (

        !razorpay_payment_id ||

        !razorpay_order_id ||

        !razorpay_signature

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Incomplete Razorpay payment details.',

        })

      }


      // ==================================
      // FETCH ORDER FROM RAZORPAY
      // ==================================

      const order =
        await razorpay.orders.fetch(
          razorpay_order_id
        )


      if (!order) {

        return res.status(404).json({

          success: false,

          message:
            'Razorpay order not found.',

        })

      }


      // ==================================
      // SIGNATURE VERIFICATION
      // ==================================

      const signatureBody =

        razorpay_order_id +
        '|' +
        razorpay_payment_id


      const expectedSignature =

        crypto

          .createHmac(

            'sha256',

            process.env.RAZORPAY_KEY_SECRET

          )

          .update(
            signatureBody
          )

          .digest('hex')


      const receivedBuffer =
        Buffer.from(
          razorpay_signature,
          'utf8'
        )


      const expectedBuffer =
        Buffer.from(
          expectedSignature,
          'utf8'
        )


      if (

        receivedBuffer.length !==
        expectedBuffer.length ||

        !crypto.timingSafeEqual(

          receivedBuffer,

          expectedBuffer

        )

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Razorpay signature verification failed.',

        })

      }


      // ==================================
      // FETCH PAYMENT FROM RAZORPAY
      // ==================================

      const razorpayPayment =
        await razorpay.payments.fetch(

          razorpay_payment_id

        )


      if (!razorpayPayment) {

        return res.status(404).json({

          success: false,

          message:
            'Razorpay payment not found.',

        })

      }


      // ==================================
      // PAYMENT STATUS
      // ==================================

      if (
        razorpayPayment.status !==
        'captured'
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Razorpay payment status is ${razorpayPayment.status}.`,

        })

      }


      // ==================================
      // ORDER / PAYMENT AMOUNT
      // ==================================

      const orderAmount =
        Number(
          order.amount || 0
        ) / 100


      const paymentAmountFromRazorpay =
        Number(
          razorpayPayment.amount || 0
        ) / 100


      if (
        !orderAmount ||
        orderAmount <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid Razorpay order amount.',

        })

      }


      // ==================================
      // PAYMENT AMOUNT MUST MATCH ORDER
      // ==================================

      if (
        paymentAmountFromRazorpay !==
        orderAmount
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Razorpay payment amount does not match order amount.',

        })

      }


      // ==================================
      // STUDENT ID
      // ==================================
      
      const authenticatedStudentId =
        req.student?.id
      
      const orderStudentId =
        order?.notes?.studentId
      
      
      if (
        !authenticatedStudentId ||
        !orderStudentId
      ) {
      
        return res.status(400).json({
      
          success: false,
      
          message:
            'Student information not found.',
      
        })
      
      }
      
      
      // ==================================
      // VERIFY ORDER BELONGS TO LOGGED-IN STUDENT
      // ==================================
      
      if (
        String(authenticatedStudentId) !==
        String(orderStudentId)
      ) {
      
        return res.status(403).json({
      
          success: false,
      
          message:
            'Student verification failed.',
      
        })
      
      }
      
      
      // ==================================
      // FIND STUDENT
      // ==================================
      
      const student =
        await Student.findById(
          authenticatedStudentId
        )
      
      
      if (!student) {
      
        return res.status(404).json({
      
          success: false,
      
          message:
            'Student not found.',
      
        })
      
      }


      // ==================================
      // VERIFY ADMISSION NUMBER
      // ==================================

      if (

        order?.notes?.admissionNumber &&

        order.notes.admissionNumber !==
          student.admissionNumber

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Student verification failed.',

        })

      }


      // ==================================
      // REMAINING FEE
      // ==================================

      const remainingFee =
        Math.max(

          0,

          Number(
            student.totalFees || 0
          ) -

          Number(
            student.paidFees || 0
          )

        )


      if (
        remainingFee <= 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course fee is already fully paid.',

        })

      }


      if (
        orderAmount >
        remainingFee
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment amount is greater than current remaining fee.',

        })

      }


      // ==================================
      // DUPLICATE PAYMENT CHECK
      // ==================================

      const existingPayment =
        await Payment.findOne({

          $or: [

            {

              transactionId:
                razorpay_payment_id,

            },

            {

              razorpayPaymentId:
                razorpay_payment_id,

            },

            {

              razorpayOrderId:
                razorpay_order_id,

            },

          ],

        })


      if (
        existingPayment
      ) {

        return res.status(200).json({

          success: true,

          message:
            'Payment has already been processed.',

          alreadyProcessed:
            true,

          student,

          payment:
            existingPayment,

        })

      }


      // ==================================
      // PAYMENT PLAN
      // ==================================

      const selectedPlan =

        student.paymentPlan ||

        order?.notes?.paymentPlan ||

        ''


      if (!selectedPlan) {

        return res.status(400).json({

          success: false,

          message:
            'Payment plan not found.',

        })

      }


      // ==================================
      // PAYMENT TYPE
      // ==================================

      const paymentType =

        selectedPlan === 'full'
          ? 'Full'
          : 'Installment'


      // ==================================
      // PAYMENT DATE
      // ==================================

      const paymentDate =

        new Date()
          .toISOString()
          .split('T')[0]


      // ==================================
      // PAYMENT HISTORY
      // ==================================

      student.paymentHistory.push({

        amount:
          orderAmount,

        paymentCategory:
          'CourseFee',

        paymentMethod:
          'Razorpay',

        paymentType,

        paymentPlan:
          selectedPlan,

        paymentMode:
          'Online',

        paymentStatus:
          'Success',

        transactionId:
          razorpay_payment_id,

        orderId:
          razorpay_order_id,

        paymentDate,

      })


      // ==================================
      // UPDATE PAID FEES
      // ==================================

      student.paidFees =

        Number(
          student.paidFees || 0
        ) +

        orderAmount


      // ==================================
      // UPDATE REMAINING
      // ==================================

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


      // ==================================
      // FEE STATUS
      // ==================================

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


      // ==================================
      // UPDATE NEXT DUE DATE
      // ==================================
      
      if (
        student.remainingFees === 0
      ) {
      
        student.dueDate =
          ''
      
      }
      
      else {
      
        student.dueDate =
          calculateNextDueDate(
      
            student.dueDate,
      
            student.admissionDate,
      
            selectedPlan,
      
            paymentDate
      
          )
      
      }
      
      
      // ==================================
      // PAYMENT MODE
      // ==================================
      
      student.paymentMode =
        'Online'


      // ==================================
      // SAVE STUDENT
      // ==================================

      await student.save()


      // ==================================
      // SAVE PAYMENT
      // ==================================

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
            orderAmount,

          paymentMethod:
            'Razorpay',

          paymentMode:
            'Online',

          paymentStatus:
            'Success',

          transactionId:
            razorpay_payment_id,

          razorpayOrderId:
            razorpay_order_id,

          razorpayPaymentId:
            razorpay_payment_id,

          razorpaySignature:
            razorpay_signature,

        })


      // ==================================
      // NOTIFICATION
      // ==================================

      try {

        await createNotification({

          type:
            'Payment',

          title:
            'Online Payment Received',

          message:

            `${student.name} paid ₹${orderAmount}` +

            (

              student.course
                ? ` for ${student.course}`
                : ''

            ) +

            ' through Razorpay.',

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
          'Online Payment Notification Error:',
          notificationError
        )

      }


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Payment verified successfully.',

        student,

        payment,

      })

    }

    catch (error) {

      console.log(
        'Verify Razorpay Payment Error:',
        error
      )

      return res.status(500).json({

        success: false,

        message:

          error?.error?.description ||

          error?.message ||

          'Unable to verify Razorpay payment.',

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


      // ==================================
      // OLD STUDENT STATUS
      // ==================================

      if (
        !student.studentStatus
      ) {

        student.studentStatus =
          'Active'

        await student.save()

      }


      return res.status(200).json({

        success: true,

        student,

      })

    }

    catch (error) {

      console.log(
        'Verify Student Error:',
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


      if (
        email &&
        String(email).trim()
      ) {

        conditions.push({

          email:

            String(email)
              .trim()
              .toLowerCase(),

        })

      }


      if (
        phone &&
        String(phone).trim()
      ) {

        conditions.push({

          contact:

            String(phone)
              .trim(),

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


      return res.status(200).json({

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