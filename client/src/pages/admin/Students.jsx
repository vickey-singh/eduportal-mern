import { useEffect, useState } from 'react'

import { API_BASE_URL } from '../../config/api'

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudentById,
  addStudentPayment,
} from '../../services/studentService'

import {
  getCourses,
} from '../../services/courseService'

import '../../assets/styles/admin.css'

import PaymentForm from './PaymentForm'
import PaymentHistory from './PaymentHistory'
import ReceiptButton from './ReceiptButton'


// ======================================
// CURRENT ACADEMIC SESSION
// ======================================

const getCurrentSession = () => {

  const today =
    new Date()

  const year =
    today.getFullYear()

  const month =
    today.getMonth() + 1


  if (month >= 4) {

    return `${year}-${year + 1}`

  }


  return `${year - 1}-${year}`

}


// ======================================
// GENERATE SESSION LIST
// ======================================

const getSessionList = () => {

  const currentSession =
    getCurrentSession()

  const currentStartYear =
    Number(
      currentSession.split('-')[0]
    )


  const sessions = []


  for (
    let i = 0;
    i <= 10;
    i++
  ) {

    const startYear =
      currentStartYear - i

    sessions.push(
      `${startYear}-${startYear + 1}`
    )

  }


  return sessions

}


// ======================================
// GET ACTUAL FEE STATUS
// ======================================

const getActualFeeStatus = (
  student
) => {

  const remainingFees =
    Number(
      student?.remainingFees || 0
    )


  // ==================================
  // FULLY PAID
  // ==================================

  if (
    remainingFees <= 0
  ) {

    return 'Paid'

  }


  // ==================================
  // NO DUE DATE
  // ==================================

  if (
    !student?.dueDate
  ) {

    return 'Partial'

  }


  const dueDate =
    new Date(
      student.dueDate
    )


  // ==================================
  // INVALID DATE
  // ==================================

  if (
    Number.isNaN(
      dueDate.getTime()
    )
  ) {

    return 'Partial'

  }


  const today =
    new Date()


  today.setHours(
    0,
    0,
    0,
    0
  )


  dueDate.setHours(
    0,
    0,
    0,
    0
  )


  // ==================================
  // DUE
  // ==================================

  if (
    dueDate <= today
  ) {

    return 'Due'

  }


  // ==================================
  // PARTIAL
  // ==================================

  return 'Partial'

}


// ======================================
// FORMAT DATE
// ======================================

const formatDate = (
  date
) => {

  if (!date) {

    return '-'

  }


  const parsedDate =
    new Date(date)


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {

    return date

  }


  return parsedDate.toLocaleDateString(

    'en-IN',

    {

      day: '2-digit',

      month: 'short',

      year: 'numeric',

    }

  )

}


// ======================================
// FEE STATUS CLASS
// ======================================

const getFeeStatusClass = (
  status
) => {

  switch (status) {

    case 'Paid':

      return 'paid'


    case 'Partial':

      return 'partial'


    case 'Due':

      return 'due'


    default:

      return 'partial'

  }

}


// ======================================
// PAYMENT PLAN LABEL
// ======================================

const getPaymentPlanLabel = (
  plan
) => {

  switch (plan) {

    case 'monthly':
      return 'Monthly'

    case 'installment':
      return 'Custom Installment'

    case 'full':
      return 'Full Payment'

    default:
      return 'Not Selected'

  }

}


// ======================================
// FEE DUE SUMMARY
// ======================================

const getStudentDueSummary = (
  student
) => {

  const remaining =
    Number(
      student?.remainingFees || 0
    )

  if (
    remaining <= 0
  ) {

    return {

      dueAmount: 0,

      dueCount: 0,

      dueDate: null,

      hasDue: false,

    }

  }


  // ==================================
  // FULL PAYMENT
  // ==================================

  if (
    student?.paymentPlan === 'full'
  ) {

    return {

      dueAmount:
        remaining,

      dueCount:
        1,

      dueDate:
        student?.dueDate || null,

      hasDue:
        remaining > 0,

    }

  }


  const schedule =
    Array.isArray(
      student?.installmentSchedule
    )
      ? student.installmentSchedule
      : []


  const today =
    new Date()

  today.setHours(
    23,
    59,
    59,
    999
  )


  // ==================================
  // CURRENTLY DUE
  // ==================================

  const dueItems =
    schedule.filter(
      (item) => {

        const amount =
          Number(
            item?.amount || 0
          )

        const paidAmount =
          Number(
            item?.paidAmount || 0
          )

        const balance =
          Math.max(
            0,
            amount - paidAmount
          )

        if (
          balance <= 0
        ) {

          return false

        }


        if (
          item?.status === 'Due'
        ) {

          return true

        }


        if (
          !item?.dueDate
        ) {

          return false

        }


        const dueDate =
          new Date(
            item.dueDate
          )

        if (
          Number.isNaN(
            dueDate.getTime()
          )
        ) {

          return false

        }


        return (
          dueDate <= today
        )

      }
    )


  const dueAmount =
    dueItems.reduce(

      (
        total,
        item
      ) => {

        const amount =
          Number(
            item?.amount || 0
          )

        const paidAmount =
          Number(
            item?.paidAmount || 0
          )

        return (
          total +
          Math.max(
            0,
            amount - paidAmount
          )
        )

      },

      0

    )


  const latestDueItem =
    [...dueItems]
      .filter(
        item =>
          item?.dueDate
      )
      .sort(
        (a, b) =>
          new Date(b.dueDate) -
          new Date(a.dueDate)
      )[0]


  // ==================================
  // CURRENT DUE EXISTS
  // ==================================

  if (
    dueItems.length > 0
  ) {

    return {

      dueAmount:
        Math.min(
          dueAmount,
          remaining
        ),

      dueCount:
        dueItems.length,

      dueDate:
        latestDueItem?.dueDate ||
        student?.dueDate ||
        null,

      hasDue:
        dueAmount > 0,

    }

  }


  // ==================================
  // NEXT PENDING
  // ==================================

  const nextPending =
    schedule
      .filter(
        (item) => {

          const amount =
            Number(
              item?.amount || 0
            )

          const paidAmount =
            Number(
              item?.paidAmount || 0
            )

          const balance =
            Math.max(
              0,
              amount - paidAmount
            )

          if (
            balance <= 0 ||
            !item?.dueDate
          ) {

            return false

          }

          const dueDate =
            new Date(
              item.dueDate
            )

          return (
            !Number.isNaN(
              dueDate.getTime()
            ) &&
            dueDate > today
          )

        }
      )
      .sort(
        (a, b) =>
          new Date(a.dueDate) -
          new Date(b.dueDate)
      )[0]


  return {

    dueAmount:
      0,

    dueCount:
      0,

    dueDate:
      nextPending?.dueDate ||
      student?.dueDate ||
      null,

    hasDue:
      false,

  }

}


// ======================================
// DATE HELPERS
// ======================================

const getDateInputValue = (date) => {

  if (!date) return ''

  const parsed =
    new Date(date)

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return ''
  }

  const year =
    parsed.getFullYear()

  const month =
    String(
      parsed.getMonth() + 1
    ).padStart(2, '0')

  const day =
    String(
      parsed.getDate()
    ).padStart(2, '0')

  return `${year}-${month}-${day}`

}


const addOneMonth = (dateValue) => {

  if (!dateValue) return ''

  const date =
    new Date(
      `${dateValue}T00:00:00`
    )

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return ''
  }

  const day =
    date.getDate()

  date.setDate(1)

  date.setMonth(
    date.getMonth() + 1
  )

  const lastDay =
    new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate()

  date.setDate(
    Math.min(day, lastDay)
  )

  return getDateInputValue(date)

}


const createEmptyInstallment = (
  number
) => ({

  installmentNumber:
    number,

  amount:
    '',

  dueDate:
    '',

  paidAmount:
    0,

  status:
    'Pending',

})


function Students() {

  // ======================================
  // STUDENTS
  // ======================================

  const [studentData, setStudentData] =
    useState([])


  // ======================================
  // COURSES
  // ======================================

  const [courses, setCourses] =
    useState([])


  // ======================================
  // SESSION
  // ======================================

  const [sessionFilter, setSessionFilter] =
    useState('All')


  const [sessions] =
    useState(
      getSessionList()
    )


  // ======================================
  // SEARCH
  // ======================================

  const [searchTerm, setSearchTerm] =
    useState('')


  // ======================================
  // COURSE FILTER
  // ======================================

  const [courseFilter, setCourseFilter] =
    useState('All')


  // ======================================
  // BATCH FILTER
  // ======================================

  const [batchFilter, setBatchFilter] =
    useState('All')


  // ======================================
  // FEE STATUS FILTER
  // ======================================

  const [statusFilter, setStatusFilter] =
    useState('All')


  // ======================================
  // STUDENT STATUS FILTER
  // ======================================

  const [
    studentStatusFilter,
    setStudentStatusFilter
  ] =
    useState('All')


  // ======================================
  // FORM
  // ======================================

  const [formData, setFormData] =
    useState({

      name: '',
      dob: '',
      aadharNumber: '',
      admissionNumber: '',
      rollNumber: '',
      biometricUserId: '',
      course: '',
      batchTime: '',

      contact: '',
      email: '',

      fatherName: '',
      motherName: '',
      fatherOccupation: '',
      motherOccupation: '',
      fatherMobile: '',
      motherMobile: '',

      permanentAddress: '',
      currentAddress: '',

      schoolCollegeName: '',

      admissionType: 'Offline',
      admissionDate: '',

      studentStatus: 'Active',

      registrationFee: '',
      registrationFeePaid: '',

      totalFees: '',
      paidFees: '',

      monthlyAmount: '',

      paymentPlan: '',

      dueDate: '',

      installments: [],

      image: null,

    })


  // ======================================
  // EDIT
  // ======================================

  const [editId, setEditId] =
    useState(null)


  // ======================================
  // SUBMIT LOADING
  // ======================================

  const [isSubmitting, setIsSubmitting] =
    useState(false)


  // ======================================
  // FETCH LOADING
  // ======================================

  const [isLoading, setIsLoading] =
    useState(false)


  // ======================================
  // PAGINATION
  // ======================================

  const [currentPage, setCurrentPage] =
    useState(1)

  const studentsPerPage = 15


  // ======================================
  // VIEW STUDENT
  // ======================================

  const [selectedStudent, setSelectedStudent] =
    useState(null)


  // ======================================
  // PAYMENT DATA
  // ======================================

  const [paymentData, setPaymentData] =
    useState({

      amount: '',

      paymentMethod: 'Cash',

      paymentDate:
        new Date()
          .toISOString()
          .split('T')[0],

      paymentPlan: '',

    })


  // ======================================
  // FETCH INITIAL DATA
  // ======================================

  useEffect(() => {

    fetchStudents()

    fetchCourses()

  }, [])


  // ======================================
  // SESSION CHANGE
  // ======================================

  useEffect(() => {

    // The initial effect already loads students.
    // Skip the duplicate request for the default
    // session on first mount.
    if (sessionFilter === 'All') {
      return
    }

    fetchStudents()

  }, [
    sessionFilter
  ])


  // ======================================
  // GET STUDENTS
  // ======================================

  const fetchStudents = async () => {

    try {

      setIsLoading(true)


      const response =
        await getStudents({

          session:
            sessionFilter,

        })


      setStudentData(
        response || []
      )

    }

    catch (error) {

      console.log(
        'Get Students Error:',
        error
      )

      setStudentData([])

    }

    finally {

      setIsLoading(false)

    }

  }


  // ======================================
  // GET COURSES
  // ======================================

  const fetchCourses = async () => {

    try {

      const response =
        await getCourses()

      setCourses(
        response || []
      )

    }

    catch (error) {

      console.log(
        'Get Courses Error:',
        error
      )

    }

  }


  // ======================================
  // RESET FORM
  // ======================================

  const resetForm = () => {

    setFormData({

      name: '',
      dob: '',
      aadharNumber: '',
      admissionNumber: '',
      rollNumber: '',
      biometricUserId: '',
      course: '',
      batchTime: '',

      contact: '',
      email: '',

      fatherName: '',
      motherName: '',
      fatherOccupation: '',
      motherOccupation: '',
      fatherMobile: '',
      motherMobile: '',

      permanentAddress: '',
      currentAddress: '',

      schoolCollegeName: '',

      admissionType: 'Offline',
      admissionDate: '',

      studentStatus: 'Active',

      registrationFee: '',
      registrationFeePaid: '',

      totalFees: '',
      paidFees: '',

      monthlyAmount: '',

      paymentPlan: '',

      dueDate: '',

      installments: [],

      image: null,

    })


    setEditId(null)

  }


  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target


    if (name === 'course') {
    
      const selectedCourse =
        courses.find(
          (course) =>
            course.courseName === value
        )
    
      if (selectedCourse) {
    
        setFormData(
          (previous) => ({
    
            ...previous,
    
            course:
              value,
    
            totalFees:
              selectedCourse.totalFee ?? '',
    
            registrationFee:
              selectedCourse.registrationFee ?? '',
    
            monthlyAmount:
              selectedCourse.minimumInstallment ??
              selectedCourse.monthlyAmount ??
              '',
    
            batchTime:
              selectedCourse.batchTime ??
              previous.batchTime ??
              '',
    
            paymentPlan:
              previous.paymentPlan || '',
    
            dueDate:
              previous.dueDate || '',
    
            installments:
              previous.installments || [],
    
          })
        )
    
        return
    
      }
    
    }
    

    setFormData(
      (previous) => ({

        ...previous,

        [name]:
          value,

      })
    )

  }


  // ======================================
  // PAYMENT PLAN CHANGE
  // ======================================

  const handlePaymentPlanChange = (e) => {

    const plan =
      e.target.value

    setFormData(
      (previous) => {

        let nextInstallments =
          previous.installments || []

        // ==================================
        // CUSTOM INSTALLMENT
        // ==================================
        //
        // If changing from Monthly/Full to
        // Custom Installment, start the new
        // schedule from REMAINING FEE only.
        //
        // Example:
        // Total = 12000
        // Paid  = 3000
        // Due   = 9000
        //
        // New installment schedule = 9000
        // NOT 12000.
        // ==================================

        if (
          plan === 'installment'
        ) {

          const totalFees =
            Number(
              previous.totalFees || 0
            )

          const paidFees =
            Number(
              previous.paidFees || 0
            )

          const remainingFee =
            Math.max(
              0,
              totalFees - paidFees
            )

          // Preserve an already existing
          // custom installment schedule.
          if (
            previous.paymentPlan ===
              'installment' &&
            nextInstallments.length > 0
          ) {

            return {

              ...previous,

              paymentPlan:
                plan,

              installments:
                nextInstallments,

            }

          }

          // Create a fresh schedule from
          // remaining course fee.
          const firstInstallment =
            createEmptyInstallment(1)

          firstInstallment.amount =
            remainingFee

          firstInstallment.dueDate =
            previous.dueDate || ''

          nextInstallments = [
            firstInstallment
          ]

        }

        if (
          plan !== 'installment'
        ) {

          nextInstallments = []

        }

        let nextDueDate =
          previous.dueDate || ''

        if (
          plan === 'monthly' &&
          previous.admissionDate &&
          !nextDueDate
        ) {

          nextDueDate =
            addOneMonth(
              previous.admissionDate
            )

        }

        if (
          plan === 'full' &&
          previous.admissionDate &&
          !nextDueDate
        ) {

          nextDueDate =
            previous.admissionDate

        }

        return {

          ...previous,

          paymentPlan:
            plan,

          dueDate:
            nextDueDate,

          installments:
            nextInstallments,

        }

      }
    )

  }


  // ======================================
  // INSTALLMENT COUNT
  // ======================================

  const setInstallmentCount = (
    count
  ) => {

    const safeCount =
      Math.max(
        1,
        Number(count || 1)
      )

    setFormData(
      (previous) => {

        const current =
          previous.installments || []

        const next = []

        for (
          let i = 0;
          i < safeCount;
          i++
        ) {

          next.push({

            ...(current[i] ||
              createEmptyInstallment(
                i + 1
              )),

            installmentNumber:
              i + 1,

          })

        }

        return {

          ...previous,

          installments:
            next,

        }

      }
    )

  }


  // ======================================
  // INSTALLMENT FIELD
  // ======================================

  const handleInstallmentChange = (
    index,
    field,
    value
  ) => {

    setFormData(
      (previous) => {

        const installments =
          [
            ...(previous.installments || [])
          ]

        installments[index] = {

          ...installments[index],

          [field]:
            value,

        }

        return {

          ...previous,

          installments,

        }

      }
    )

  }


  // ======================================
  // REMOVE INSTALLMENT
  // ======================================

  const removeInstallment = (
    index
  ) => {

    setFormData(
      (previous) => {

        const installments =
          [
            ...(previous.installments || [])
          ]

        if (
          installments.length <= 1
        ) {

          return previous

        }

        installments.splice(
          index,
          1
        )

        return {

          ...previous,

          installments:
            installments.map(
              (item, itemIndex) => ({

                ...item,

                installmentNumber:
                  itemIndex + 1,

              })
            ),

        }

      }
    )

  }


  // ======================================
  // AUTO MONTHLY DUE DATE
  // ======================================

  useEffect(() => {

    if (
      formData.paymentPlan !==
      'monthly'
    ) {

      return

    }

    if (
      !formData.admissionDate
    ) {

      return

    }

    if (
      editId &&
      formData.dueDate
    ) {

      return

    }

    const nextDate =
      addOneMonth(
        formData.admissionDate
      )

    if (
      nextDate &&
      nextDate !==
        formData.dueDate
    ) {

      setFormData(
        (previous) => ({

          ...previous,

          dueDate:
            nextDate,

        })
      )

    }

  }, [
    formData.paymentPlan,
    formData.admissionDate,
    editId,
  ])


  // ======================================
  // IMAGE
  // ======================================

  const handleImageChange = (e) => {

    setFormData(
      (previous) => ({

        ...previous,

        image:
          e.target.files?.[0] || null,

      })
    )

  }


  // ======================================
  // REMAINING COURSE FEE
  // ======================================

  const remainingFees = Math.max(

    0,

    Number(
      formData.totalFees || 0
    ) -

    Number(
      formData.paidFees || 0
    )

  )


  // ======================================
  // REGISTRATION STATUS
  // ======================================

  const registrationStatus =

    Number(
      formData.registrationFee || 0
    ) > 0

      ? 'Paid'

      : 'Pending'


  // ======================================
  // SUBMIT STUDENT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      if (isSubmitting) {

        return

      }


      try {

        setIsSubmitting(true)


        const totalFees =
          Number(
            formData.totalFees || 0
          )


        const paidFees =
          Number(
            formData.paidFees || 0
          )


        const registrationFee =
          Number(
            formData.registrationFee || 0
          )


        const registrationFeePaid =
          registrationFee


        if (
          paidFees < 0 ||
          paidFees > totalFees
        ) {

          alert(
            'Paid Course Fee must be between 0 and Total Course Fee.'
          )

          return

        }


        if (
          paidFees > 0 &&
          !formData.paymentPlan
        ) {

          alert(
            'Please select Full Payment, Monthly or Installment.'
          )

          return

        }

        if (
          formData.paymentPlan ===
          'installment'
        ) {

          const schedule =
            formData.installments || []

          if (
            schedule.length === 0
          ) {

            alert(
              'Please create at least one installment.'
            )

            return

          }


          // ==================================
          // CUSTOM INSTALLMENT VALIDATION
          // ==================================
          //
          // IMPORTANT:
          // Already paid installment amount
          // must NOT be counted again.
          //
          // Example:
          //
          // Total Fee      = ₹12,000
          // Paid           = ₹3,000
          // Remaining      = ₹9,000
          //
          // Existing:
          // ₹1,000 Paid
          // ₹1,000 Paid
          // ₹1,000 Paid
          //
          // New Pending:
          // ₹3,000
          // ₹3,000
          // ₹3,000
          //
          // Valid schedule total for remaining
          // fee = ₹9,000.
          // ==================================

          const scheduleTotal =
            schedule.reduce(
              (sum, item) => {

                const amount =
                  Number(
                    item.amount || 0
                  )

                const paidAmount =
                  Number(
                    item.paidAmount || 0
                  )

                const balance =
                  Math.max(
                    0,
                    amount - paidAmount
                  )

                return (
                  sum +
                  balance
                )

              },
              0
            )


          const remainingCourseFee =
            Math.max(
              0,
              totalFees -
              paidFees
            )


          if (
            Math.abs(
              scheduleTotal -
              remainingCourseFee
            ) > 0.01
          ) {

            alert(
              `Installment total ₹${scheduleTotal} must equal remaining fee ₹${remainingCourseFee}.`
            )

            return

          }


          const invalid =
            schedule.some(
              (item) =>
                Number(item.amount || 0) <= 0 ||
                !item.dueDate
            )

          if (invalid) {

            alert(
              'Every installment needs a valid amount and due date.'
            )

            return

          }

        }


        const data =
          new FormData()


        data.append(
          'name',
          formData.name
        )

        data.append(
          'dob',
          formData.dob
        )

        data.append(
          'aadharNumber',
          formData.aadharNumber
        )

        data.append(
          'rollNumber',
          formData.rollNumber
        )

        data.append(
          'biometricUserId',
          formData.biometricUserId
        )

        data.append(
          'course',
          formData.course
        )

        data.append(
          'batchTime',
          formData.batchTime
        )

        data.append(
          'contact',
          formData.contact
        )

        data.append(
          'email',
          formData.email
        )


        // ==================================
        // PARENTS
        // ==================================

        data.append(
          'fatherName',
          formData.fatherName
        )

        data.append(
          'motherName',
          formData.motherName
        )

        data.append(
          'fatherOccupation',
          formData.fatherOccupation
        )

        data.append(
          'motherOccupation',
          formData.motherOccupation
        )

        data.append(
          'fatherMobile',
          formData.fatherMobile
        )

        data.append(
          'motherMobile',
          formData.motherMobile
        )


        // ==================================
        // ADDRESS
        // ==================================

        data.append(
          'permanentAddress',
          formData.permanentAddress
        )

        data.append(
          'currentAddress',
          formData.currentAddress
        )


        // ==================================
        // EDUCATION
        // ==================================

        data.append(
          'schoolCollegeName',
          formData.schoolCollegeName
        )


        // ==================================
        // ADMISSION
        // ==================================

        data.append(
          'admissionType',
          formData.admissionType
        )

        data.append(
          'admissionDate',
          formData.admissionDate
        )


        // ==================================
        // STUDENT STATUS
        // ==================================

        data.append(
          'studentStatus',
          formData.studentStatus || 'Active'
        )


        // ==================================
        // REGISTRATION
        // ==================================

        data.append(
          'registrationFee',
          registrationFee
        )

        data.append(
          'registrationFeePaid',
          registrationFeePaid
        )


        // ==================================
        // COURSE FEE
        // ==================================

        data.append(
          'totalFees',
          totalFees
        )

        data.append(
          'paidFees',
          editId
            ? paidFees
            : 0
        )


        // ==================================
        // PAYMENT PLAN
        // ==================================

        data.append(
          'paymentPlan',
          formData.paymentPlan || ''
        )

        data.append(
          'monthlyAmount',
          formData.monthlyAmount || 0
        )

        data.append(
          'installments',
          JSON.stringify(
            formData.installments || []
          )
        )


        // ==================================
        // DUE DATE
        // ==================================

        data.append(
          'dueDate',
          formData.dueDate || ''
        )


        // ==================================
        // IMAGE
        // ==================================

        if (formData.image) {

          data.append(
            'image',
            formData.image
          )

        }


        // ==================================
        // CREATE
        // ======================================

        if (!editId) {

          const response =
            await createStudent(
              data
            )


          if (
            response?.student
          ) {

            const newStudent =
              response.student


            if (
              sessionFilter === 'All' ||
              newStudent.session ===
                sessionFilter
            ) {

              setStudentData(
                (previous) => [

                  newStudent,

                  ...previous,

                ]
              )

            }

          }


          alert(
            response.message ||
            'Student Added Successfully'
          )

        }


        // ==================================
        // UPDATE
        // ==================================

        else {

          const response =
            await updateStudent(

              editId,

              data

            )


          setStudentData(
            (previous) =>

              previous.map(

                (student) =>

                  student._id === editId

                    ? response.student

                    : student

              )

          )


          if (
            selectedStudent?._id ===
            editId
          ) {

            setSelectedStudent(
              response.student
            )

          }


          alert(
            response.message ||
            'Student Updated Successfully'
          )

        }


        resetForm()

        await fetchStudents()

      }

      catch (error) {

        console.log(error)

        alert(

          error.response?.data?.message ||

          'Student operation failed.'

        )

      }

      finally {

        setIsSubmitting(false)

      }

    }


  // ======================================
  // EDIT STUDENT
  // ======================================

  const editStudent =
    (student) => {

      setFormData({

        name:
          student.name || '',

        dob:
          student.dob || '',

        aadharNumber:
          student.aadharNumber || '',

        admissionNumber:
          student.admissionNumber || '',

        rollNumber:
          student.rollNumber || '',

        biometricUserId:
          student.biometricUserId || '',

        course:
          student.course || '',

        batchTime:
          student.batchTime || '',

        contact:
          student.contact || '',

        email:
          student.email || '',

        fatherName:
          student.fatherName || '',

        motherName:
          student.motherName || '',

        fatherOccupation:
          student.fatherOccupation || '',

        motherOccupation:
          student.motherOccupation || '',

        fatherMobile:
          student.fatherMobile || '',

        motherMobile:
          student.motherMobile || '',

        permanentAddress:
          student.permanentAddress || '',

        currentAddress:
          student.currentAddress || '',

        schoolCollegeName:
          student.schoolCollegeName || '',

        admissionType:
          student.admissionType ||
          'Offline',

        admissionDate:
          getDateInputValue(
            student.admissionDate
          ),

        studentStatus:
          student.studentStatus ||
          'Active',

        registrationFee:
          student.registrationFee || 0,

        registrationFeePaid:
          student.registrationFee || 0,

        totalFees:
          student.totalFees || 0,

        paidFees:
          student.paidFees || 0,

        monthlyAmount:
          student.monthlyAmount ||
          student.monthlyInstallment ||
          '',

        paymentPlan:
          student.paymentPlan || '',

        dueDate:
          getDateInputValue(
            student.dueDate
          ),

        installments:
          Array.isArray(
            student.installmentSchedule
          )
            ? student.installmentSchedule.map(
                (item, index) => ({

                  installmentNumber:
                    item.installmentNumber ||
                    index + 1,

                  amount:
                    item.amount ?? '',

                  dueDate:
                    getDateInputValue(
                      item.dueDate
                    ),

                  paidAmount:
                    item.paidAmount || 0,

                  status:
                    item.status ||
                    'Pending',

                })
              )
            : [],

        image:
          null,

      })


      setEditId(
        student._id
      )


      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      })

    }


  // ======================================
  // DELETE
  // ======================================

  const deleteStudent =
    async (id) => {

      const confirmed =
        window.confirm(

          'Are you sure you want to delete this student?'

        )


      if (!confirmed) {

        return

      }


      try {

        await deleteStudentById(
          id
        )


        setStudentData(
          (previous) =>

            previous.filter(

              (student) =>
                student._id !== id

            )

        )


        if (
          selectedStudent?._id === id
        ) {

          setSelectedStudent(
            null
          )

        }


        alert(
          'Student Deleted Successfully'
        )

      }

      catch (error) {

        console.log(error)

        alert(
          error.response?.data?.message ||
          'Delete failed.'
        )

      }

    }


  // ======================================
  // VIEW STUDENT
  // ======================================

  const viewStudent =
    (student) => {

      setSelectedStudent(
        student
      )


      setPaymentData({

        amount: '',

        paymentMethod: 'Cash',

        paymentDate:
          new Date()
            .toISOString()
            .split('T')[0],

        paymentPlan:
          student.paymentPlan || '',

      })

    }


  // ======================================
  // ADD PAYMENT
  // ======================================

  const addPayment =
    async (studentId) => {

      try {

        const response =
          await addStudentPayment(

            studentId,

            paymentData

          )


        setStudentData(
          (previous) =>

            previous.map(

              (student) =>

                student._id === studentId

                  ? response.student

                  : student

            )

        )


        setSelectedStudent(
          response.student
        )


        setPaymentData({

          amount: '',

          paymentMethod: 'Cash',

          paymentDate:
            new Date()
              .toISOString()
              .split('T')[0],

          paymentPlan:
            response.student
              .paymentPlan || '',

        })


        alert(

          response.message ||
          'Payment Added Successfully'

        )

      }

      catch (error) {

        console.log(error)

        alert(

          error.response?.data?.message ||

          'Payment failed.'

        )

      }

    }


  // ======================================
  // AVAILABLE COURSES
  // ======================================

  const courseOptions = [

    ...new Set(

      studentData

        .map(
          (student) =>
            student.course
        )

        .filter(Boolean)

    )

  ]


  // ======================================
  // AVAILABLE BATCHES
  // ======================================

  const batchOptions = [

    ...new Set(

      studentData

        .map(
          (student) =>
            student.batchTime
        )

        .filter(Boolean)

    )

  ]


  // ======================================
  // FRONTEND FILTER
  // ======================================

  const filteredStudents =
    studentData.filter(
      (student) => {

        const search =
          searchTerm
            .toLowerCase()
            .trim()


        const name =
          (
            student.name || ''
          )
            .toLowerCase()


        const admissionNumber =
          (
            student.admissionNumber || ''
          )
            .toLowerCase()


        const rollNumber =
          (
            student.rollNumber || ''
          )
            .toLowerCase()


        const matchesSearch =

          !search ||

          name.includes(search) ||

          admissionNumber.includes(search) ||

          rollNumber.includes(search)


        const matchesCourse =

          courseFilter === 'All' ||

          student.course ===
            courseFilter


        const matchesBatch =

          batchFilter === 'All' ||

          student.batchTime ===
            batchFilter


        const actualFeeStatus =
          getActualFeeStatus(
            student
          )


        const matchesStatus =

          statusFilter === 'All' ||

          actualFeeStatus ===
            statusFilter


        const actualStudentStatus =
          student.studentStatus ||
          'Active'


        const matchesStudentStatus =

          studentStatusFilter === 'All' ||

          actualStudentStatus ===
            studentStatusFilter


        return (

          matchesSearch &&

          matchesCourse &&

          matchesBatch &&

          matchesStatus &&

          matchesStudentStatus

        )

      }

    )


  // ======================================
  // PAGINATION DATA
  // ======================================

  const totalPages =
    Math.ceil(
      filteredStudents.length /
      studentsPerPage
    )

  const startIndex =
    (currentPage - 1) *
    studentsPerPage

  const currentStudents =
    filteredStudents.slice(
      startIndex,
      startIndex + studentsPerPage
    )


  // ======================================
  // RESET PAGINATION ON FILTER CHANGE
  // ======================================

  useEffect(() => {

    setCurrentPage(1)

  }, [
    searchTerm,
    courseFilter,
    batchFilter,
    statusFilter,
    studentStatusFilter,
    sessionFilter,
  ])


  // ======================================
  // KEEP PAGE VALID
  // ======================================

  useEffect(() => {

    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {

      setCurrentPage(
        totalPages
      )

    }

    if (
      totalPages === 0 &&
      currentPage !== 1
    ) {

      setCurrentPage(1)

    }

  }, [
    totalPages,
    currentPage,
  ])


  // ======================================
  // IMAGE URL
  // ======================================

  const getImageUrl =
    (image) => {

      if (!image) {

        return ''

      }


      if (
        image.startsWith('http')
      ) {

        return image

      }


      return `${API_BASE_URL}${image}`

    }


  return (

    <div className="applications-section">


      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="applications-header">

        <h2>
          Student Management
        </h2>

        <p>
          Manage complete student admission,
          fees and payment information.
        </p>

      </div>


      {/* ====================================== */}
      {/* FORM */}
      {/* ====================================== */}

      <div className="admin-form-wrapper">

        <form
          onSubmit={
            handleSubmit
          }
        >

          {editId && (

            <div className="alert alert-warning">

              <strong>
                Editing Student
              </strong>

              <br />

              Individual student fees can be
              changed here without changing
              the original course fee.

            </div>

          )}


          {/* ================================== */}
          {/* PERSONAL INFORMATION */}
          {/* ================================== */}

          <h4 className="mb-3">
            Personal Information
          </h4>


          <div className="row">


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Student Name
              </label>

              <input
                type="text"
                className="form-control"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Date of Birth
              </label>

              <input
                type="date"
                className="form-control"
                name="dob"
                value={
                  formData.dob
                }
                onChange={
                  handleChange
                }
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Aadhaar Number
              </label>

              <input
                type="text"
                className="form-control"
                name="aadharNumber"
                value={
                  formData.aadharNumber
                }
                onChange={
                  handleChange
                }
                maxLength="12"
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Student Mobile Number
              </label>

              <input
                type="tel"
                className="form-control"
                name="contact"
                value={
                  formData.contact
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Gmail / Email
              </label>

              <input
                type="email"
                className="form-control"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Student Photo
              </label>

              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={
                  handleImageChange
                }
              />

            </div>

          </div>


          {/* ================================== */}
          {/* PARENTS */}
          {/* ================================== */}

          <h4 className="mt-4 mb-3">
            Parents Information
          </h4>


          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Father's Name
              </label>

              <input
                type="text"
                className="form-control"
                name="fatherName"
                value={
                  formData.fatherName
                }
                onChange={
                  handleChange
                }
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Mother's Name
              </label>

              <input
                type="text"
                className="form-control"
                name="motherName"
                value={
                  formData.motherName
                }
                onChange={
                  handleChange
                }
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Father's Occupation
              </label>

              <input
                type="text"
                className="form-control"
                name="fatherOccupation"
                value={
                  formData.fatherOccupation
                }
                onChange={
                  handleChange
                }
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Mother's Occupation
              </label>

              <input
                type="text"
                className="form-control"
                name="motherOccupation"
                value={
                  formData.motherOccupation
                }
                onChange={
                  handleChange
                }
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Father's Mobile Number
              </label>

              <input
                type="tel"
                className="form-control"
                name="fatherMobile"
                value={
                  formData.fatherMobile
                }
                onChange={
                  handleChange
                }
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Mother's Mobile Number
              </label>

              <input
                type="tel"
                className="form-control"
                name="motherMobile"
                value={
                  formData.motherMobile
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>


          {/* ================================== */}
          {/* ADDRESS */}
          {/* ================================== */}

          <h4 className="mt-4 mb-3">
            Address
          </h4>


          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Permanent Address
              </label>

              <textarea
                className="form-control"
                rows="4"
                name="permanentAddress"
                value={
                  formData.permanentAddress
                }
                onChange={
                  handleChange
                }
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Current Address
              </label>

              <textarea
                className="form-control"
                rows="4"
                name="currentAddress"
                value={
                  formData.currentAddress
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>


          {/* ================================== */}
          {/* EDUCATION */}
          {/* ================================== */}

          <h4 className="mt-4 mb-3">
            Education
          </h4>


          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                School / College Name
              </label>

              <input
                type="text"
                className="form-control"
                name="schoolCollegeName"
                value={
                  formData.schoolCollegeName
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>


          {/* ================================== */}
          {/* ADMISSION */}
          {/* ================================== */}

          <h4 className="mt-4 mb-3">
            Admission Information
          </h4>


          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Course
              </label>

              <select
                className="form-control"
                name="course"
                value={
                  formData.course
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select Course
                </option>

                {courses.map(
                  (course) => (

                    <option
                      key={
                        course._id
                      }
                      value={
                        course.courseName
                      }
                    >

                      {
                        course.courseName
                      }

                    </option>

                  )
                )}

              </select>

              <small className="text-muted">
                Optional. Course can be added later.
              </small>

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Roll Number
              </label>

              <input
                type="text"
                className="form-control"
                name="rollNumber"
                placeholder="Enter Roll Number"
                value={
                  formData.rollNumber
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Biometric User ID
              </label>
            
              <input
                type="text"
                className="form-control"
                name="biometricUserId"
                placeholder="e.g. 1001"
                value={formData.biometricUserId}
                onChange={handleChange}
              />
            
              <small className="text-muted">
                Enter the User ID assigned on the ZKTeco device.
              </small>
            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Batch Time
              </label>

              <input
                type="text"
                className="form-control"
                name="batchTime"
                placeholder="e.g. 7:00 AM - 9:00 AM"
                value={
                  formData.batchTime
                }
                onChange={
                  handleChange
                }
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Admission Type
              </label>

              <select
                className="form-control"
                name="admissionType"
                value={
                  formData.admissionType
                }
                onChange={
                  handleChange
                }
              >

                <option value="Offline">
                  Offline
                </option>

                <option value="Online">
                  Online
                </option>

              </select>

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Admission Date
              </label>

              <input
                type="date"
                className="form-control"
                name="admissionDate"
                value={
                  formData.admissionDate
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Student Status
              </label>

              <select
                className="form-control"
                name="studentStatus"
                value={
                  formData.studentStatus ||
                  'Active'
                }
                onChange={
                  handleChange
                }
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

              <small className="text-muted">

                Use Inactive when a student is
                temporarily away or not attending.

              </small>

            </div>

          </div>


          {/* ================================== */}
          {/* FEES */}
          {/* ================================== */}

          <h4 className="mt-4 mb-3">
            Fee Information
          </h4>


          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Registration Fee
              </label>

              <input
                type="number"
                className="form-control"
                name="registrationFee"
                value={
                  formData.registrationFee
                }
                onChange={
                  handleChange
                }
                min="0"
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Total Course Fee
              </label>

              <input
                type="number"
                className="form-control"
                name="totalFees"
                value={
                  formData.totalFees
                }
                onChange={
                  handleChange
                }
                min="0"
              />

              <small className="text-muted">

                Optional. Course fee can be added later.

              </small>

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Remaining Course Fee
              </label>

              <input
                type="number"
                className="form-control"
                value={
                  remainingFees
                }
                readOnly
              />

            </div>


          </div>


          {/* ================================== */}
          {/* PAYMENT PLAN */}
          {/* ================================== */}

          <h5 className="mt-3 mb-3">
            Payment Plan
          </h5>


          <div className="row">

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Payment Plan
              </label>

              <select
                className="form-control"
                name="paymentPlan"
                value={
                  formData.paymentPlan
                }
                onChange={
                  handlePaymentPlanChange
                }
              >

                <option value="">
                  Select Payment Plan
                </option>

                <option value="full">
                  Full Payment
                </option>

                <option value="monthly">
                  Monthly
                </option>

                <option value="installment">
                  Installment
                </option>

              </select>

              <small className="text-muted">
                Student portal par plan choose nahi karega.
                Admin yahan plan create/change karega.
              </small>

            </div>


            {formData.paymentPlan === 'monthly' && (

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  Monthly Amount
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="monthlyAmount"
                  value={
                    formData.monthlyAmount
                  }
                  onChange={
                    handleChange
                  }
                  min="1"
                />

                <small className="text-muted">
                  Monthly due dates backend automatically
                  create karega.
                </small>

              </div>

            )}


            {(formData.paymentPlan === 'monthly' ||
              formData.paymentPlan === 'full') && (

              <div className="col-md-6 mb-3">

                <label className="form-label">
                  First / Payment Due Date
                </label>

                <input
                  type="date"
                  className="form-control"
                  name="dueDate"
                  value={
                    formData.dueDate || ''
                  }
                  onChange={
                    handleChange
                  }
                />

                <small className="text-muted">
                  Monthly mein yahi first due date hogi.
                </small>

              </div>

            )}

          </div>


          {/* ================================== */}
          {/* CUSTOM INSTALLMENTS */}
          {/* ================================== */}

          {formData.paymentPlan === 'installment' && (

            <div className="border rounded p-3 mt-2">

              <div className="d-flex justify-content-between align-items-center mb-3">

                <div>

                  <h6 className="mb-1">
                    Custom Installment Schedule
                  </h6>

                  <small className="text-muted">
                    Admin jitne installments chahe bana sakta hai.
                    Har installment ka amount aur due date manually set kare.
                  </small>

                </div>

                <div
                  style={{
                    minWidth: '150px',
                  }}
                >

                  <label className="form-label mb-1">
                    No. of Installments
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="120"
                    value={
                      formData.installments?.length || 1
                    }
                    onChange={(e) =>
                      setInstallmentCount(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>


              <div className="table-responsive">

                <table className="table table-bordered align-middle">

                  <thead>

                    <tr>

                      <th>
                        #
                      </th>

                      <th>
                        Amount
                      </th>

                      <th>
                        Due Date
                      </th>

                      {editId && (
                        <th>
                          Paid
                        </th>
                      )}

                      {editId && (
                        <th>
                          Status
                        </th>
                      )}

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {(formData.installments || []).map(
                      (item, index) => (

                        <tr
                          key={
                            index
                          }
                        >

                          <td>
                            {index + 1}
                          </td>

                          <td>

                            <input
                              type="number"
                              className="form-control"
                              min="1"
                              value={
                                item.amount ?? ''
                              }
                              onChange={(e) =>
                                handleInstallmentChange(
                                  index,
                                  'amount',
                                  e.target.value
                                )
                              }
                            />

                          </td>

                          <td>

                            <input
                              type="date"
                              className="form-control"
                              value={
                                item.dueDate || ''
                              }
                              onChange={(e) =>
                                handleInstallmentChange(
                                  index,
                                  'dueDate',
                                  e.target.value
                                )
                              }
                            />

                          </td>

                          {editId && (

                            <td>
                              ₹{
                                Number(
                                  item.paidAmount || 0
                                )
                              }
                            </td>

                          )}

                          {editId && (

                            <td>

                              <span
                                className={
                                  `status ${
                                    (
                                      item.status ||
                                      'Pending'
                                    ).toLowerCase()
                                  }`
                                }
                              >
                                {
                                  item.status ||
                                  'Pending'
                                }
                              </span>

                            </td>

                          )}

                          <td>

                            <button
                              type="button"
                              className="table-btn reject-btn"
                              onClick={() =>
                                removeInstallment(
                                  index
                                )
                              }
                              disabled={
                                (
                                  formData.installments ||
                                  []
                                ).length <= 1
                              }
                            >
                              Remove
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>


              <div className="alert alert-info mb-0">

                <strong>
                  Schedule Total:
                </strong>

                {' ₹'}

                {
                  (
                    formData.installments ||
                    []
                  ).reduce(
                    (sum, item) =>
                      sum +
                      Number(
                        item.amount || 0
                      ),
                    0
                  )
                }

                {' | '}

                <strong>
                  Remaining Fee:
                </strong>

                {' ₹'}

                {
                  remainingFees
                }

              </div>

            </div>

          )}


          {/* ================================== */}
          {/* SUMMARY */}
          {/* ================================== */}

          <div className="alert alert-info mt-3">

            <div className="row">

              <div className="col-md-3">

                <strong>
                  Registration:
                </strong>

                <br />

                ₹{
                  Number(
                    formData.registrationFee ||
                    0
                  )
                }

              </div>


              <div className="col-md-3">

                <strong>
                  Course Fee:
                </strong>

                <br />

                ₹{
                  Number(
                    formData.totalFees ||
                    0
                  )
                }

              </div>


              <div className="col-md-3">

                <strong>
                  Course Remaining:
                </strong>

                <br />

                ₹{
                  remainingFees
                }

              </div>

            </div>

          </div>


          {/* ================================== */}
          {/* BUTTONS */}
          {/* ================================== */}

          <div className="d-flex gap-2 mt-3">

            <button
              type="submit"
              className="table-btn approve-btn"
              disabled={
                isSubmitting
              }
            >

              {
                isSubmitting
                  ? 'Please Wait...'
                  : editId
                    ? 'Update Student'
                    : 'Add Student'
              }

            </button>


            {editId && (

              <button
                type="button"
                className="table-btn reject-btn"
                onClick={
                  resetForm
                }
                disabled={
                  isSubmitting
                }
              >

                Cancel

              </button>

            )}

          </div>

        </form>

      </div>


      {/* ====================================== */}
      {/* FILTERS */}
      {/* ====================================== */}

      <div className="mt-4 mb-3">

        <div className="row g-2">


          {/* SESSION */}

          <div className="col-md-3">

            <label className="form-label fw-bold">
              Session
            </label>

            <select
              className="form-control"
              value={
                sessionFilter
              }
              onChange={(e) => {

                setSessionFilter(
                  e.target.value
                )

                setSearchTerm('')

                setCourseFilter('All')

                setBatchFilter('All')

                setStatusFilter('All')

                setStudentStatusFilter('All')

              }}
            >

              <option value="All">
                All Sessions
              </option>

              {sessions.map(
                (session) => (

                  <option
                    key={
                      session
                    }
                    value={
                      session
                    }
                  >

                    {
                      session
                    }

                  </option>

                )
              )}

            </select>

          </div>


          {/* SEARCH */}

          <div className="col-md-3">

            <label className="form-label fw-bold">
              Search
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="Name / Admission No. / Roll No."
              value={
                searchTerm
              }
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>


          {/* COURSE */}

          <div className="col-md-2">

            <label className="form-label fw-bold">
              Course
            </label>

            <select
              className="form-control"
              value={
                courseFilter
              }
              onChange={(e) =>
                setCourseFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Courses
              </option>

              {courseOptions.map(
                (course) => (

                  <option
                    key={
                      course
                    }
                    value={
                      course
                    }
                  >

                    {
                      course
                    }

                  </option>

                )
              )}

            </select>

          </div>


          {/* BATCH */}

          <div className="col-md-2">

            <label className="form-label fw-bold">
              Batch
            </label>

            <select
              className="form-control"
              value={
                batchFilter
              }
              onChange={(e) =>
                setBatchFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Batches
              </option>

              {batchOptions.map(
                (batch) => (

                  <option
                    key={
                      batch
                    }
                    value={
                      batch
                    }
                  >

                    {
                      batch
                    }

                  </option>

                )
              )}

            </select>

          </div>


          {/* FEE STATUS */}

          <div className="col-md-2">

            <label className="form-label fw-bold">
              Fee Status
            </label>

            <select
              className="form-control"
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Students
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Partial">
                Partial
              </option>

              <option value="Due">
                Due
              </option>

            </select>

          </div>


          {/* STUDENT STATUS */}

          <div className="col-md-2">

            <label className="form-label fw-bold">
              Student Status
            </label>

            <select
              className="form-control"
              value={
                studentStatusFilter
              }
              onChange={(e) =>
                setStudentStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Students
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>

      </div>


      {/* ====================================== */}
      {/* RESULT COUNT */}
      {/* ====================================== */}

      <div className="mb-3">

        <strong>
          Session:
        </strong>

        {' '}

        {
          sessionFilter === 'All'
            ? 'All Sessions'
            : sessionFilter
        }

        {' | '}

        <strong>
          Students:
        </strong>

        {' '}

        {filteredStudents.length}

      </div>


      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div
        className="table-responsive"
        style={{
          overflowX: 'auto',
        }}
      >

        <table
          className="table applications-table"
          style={{
            minWidth: '1750px',
          }}
        >

          <thead>

            <tr>

              <th>
                Student
              </th>

              <th>
                Admission No.
              </th>

              <th>
                Roll No.
              </th>

              <th>
                Course
              </th>

              <th>
                Batch
              </th>

              <th>
                Contact
              </th>

              <th>
                Registration
              </th>

              <th>
                Total Fee
              </th>

              <th>
                Paid
              </th>

              <th>
                Remaining
              </th>

              <th>
                Plan
              </th>

              <th>
                Due Date
              </th>

              <th>
                Fee Status
              </th>

              <th>
                Student Status
              </th>

              <th>
                Admission Date
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {isLoading ? (

              <tr>

                <td
                  colSpan="15"
                  className="text-center py-4"
                >

                  Loading Students...

                </td>

              </tr>

            ) : filteredStudents.length === 0 ? (

              <tr>

                <td
                  colSpan="15"
                  className="text-center py-4"
                >

                  No Students Found for{' '}

                  {
                    sessionFilter === 'All'
                      ? 'All Sessions'
                      : `Session ${sessionFilter}`
                  }

                </td>

              </tr>

            ) : (

              currentStudents.map(
                (student) => {

                  const actualFeeStatus =
                    getActualFeeStatus(
                      student
                    )


                  return (

                    <tr
                      key={
                        student._id
                      }
                    >

                      <td>
                        {
                          student.name
                        }
                      </td>


                      <td>
                        {
                          student.admissionNumber
                        }
                      </td>


                      <td>
                        {
                          student.rollNumber ||
                          '-'
                        }
                      </td>


                      <td>
                        {
                          student.course ||
                          '-'
                        }
                      </td>


                      <td>
                        {
                          student.batchTime ||
                          '-'
                        }
                      </td>


                      <td>
                        {
                          student.contact
                        }
                      </td>


                      <td>

                        ₹{
                          student.registrationFee ||
                          0
                        }

                        <br />

                        <small>

                          Paid: ₹{
                            student.registrationFeePaid ||
                            0
                          }

                        </small>

                      </td>


                      <td>

                        ₹{
                          student.totalFees ||
                          0
                        }

                      </td>


                      <td>

                        ₹{
                          student.paidFees ||
                          0
                        }

                      </td>


                      <td>

                        ₹{
                          student.remainingFees ||
                          0
                        }

                      </td>


                      <td>

                        {
                          getPaymentPlanLabel(
                            student.paymentPlan
                          )
                        }

                      </td>


                      <td>

                        {
                          student.dueDate
                            ? formatDate(
                                student.dueDate
                              )
                            : '-'
                        }

                      </td>


                      <td>

                        <span
                          className={
                            `status ${getFeeStatusClass(
                              actualFeeStatus
                            )}`
                          }
                        >

                          {
                            actualFeeStatus
                          }

                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            `status ${
                              (
                                student.studentStatus ||
                                'Active'
                              ).toLowerCase()
                            }`
                          }
                        >

                          {
                            student.studentStatus ||
                            'Active'
                          }

                        </span>

                      </td>


                      <td>

                        {
                          student.admissionDate
                            ? formatDate(
                                student.admissionDate
                              )
                            : '-'
                        }

                      </td>


                      <td>

                        <div
                          className="d-flex gap-2"
                        >

                          <button
                            type="button"
                            className="table-btn view-btn"
                            onClick={() =>
                              viewStudent(
                                student
                              )
                            }
                          >

                            View

                          </button>


                          <button
                            type="button"
                            className="table-btn approve-btn"
                            onClick={() =>
                              editStudent(
                                student
                              )
                            }
                          >

                            Edit

                          </button>


                          <button
                            type="button"
                            className="table-btn reject-btn"
                            onClick={() =>
                              deleteStudent(
                                student._id
                              )
                            }
                          >

                            Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  )

                }

              )

            )}

          </tbody>

        </table>

      </div>


      {/* ====================================== */}
      {/* PAGINATION */}
      {/* ====================================== */}

      {totalPages > 1 && (

        <div
          className="d-flex justify-content-center align-items-center gap-2 mt-3"
        >

          <button
            type="button"
            className="btn btn-outline-primary"
            disabled={
              currentPage === 1
            }
            onClick={() =>
              setCurrentPage(
                (previous) =>
                  previous - 1
              )
            }
          >
            Previous
          </button>


          {Array.from(
            { length: totalPages },
            (_, index) =>
              index + 1
          ).map((page) => (

            <button
              type="button"
              key={page}
              className={
                `btn ${
                  currentPage === page
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`
              }
              onClick={() =>
                setCurrentPage(page)
              }
            >
              {page}
            </button>

          ))}


          <button
            type="button"
            className="btn btn-outline-primary"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage(
                (previous) =>
                  previous + 1
              )
            }
          >
            Next
          </button>

        </div>

      )}


      {/* ====================================== */}
      {/* COMPLETE STUDENT VIEW */}
      {/* ====================================== */}

      {selectedStudent && (

        <div
          className="student-modal-overlay"
        >

          <div
            className="student-modal"
            style={{
              maxWidth: '1100px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >

            <button
              type="button"
              className="student-modal-close"
              onClick={() =>
                setSelectedStudent(
                  null
                )
              }
            >

              ×

            </button>


            {/* ==================================
                PROFILE
            ================================== */}

            <div
              className="text-center mb-4"
            >

              {selectedStudent.image ? (

                <img
                  src={
                    getImageUrl(
                      selectedStudent.image
                    )
                  }
                  alt={
                    selectedStudent.name
                  }
                  className="student-modal-image"
                />

              ) : (

                <div className="mb-3">
                  No Photo
                </div>

              )}


              <h3>
                {
                  selectedStudent.name
                }
              </h3>


              <p className="text-muted">

                Admission No:
                {' '}

                {
                  selectedStudent.admissionNumber
                }

              </p>

            </div>


            {/* ==================================
                PERSONAL
            ================================== */}

            <div className="student-view-section">

              <h5>
                Personal Information
              </h5>


              <div className="row">

                <Detail
                  label="Student Name"
                  value={
                    selectedStudent.name
                  }
                />

                <Detail
                  label="Date of Birth"
                  value={
                    formatDate(
                      selectedStudent.dob
                    )
                  }
                />

                <Detail
                  label="Aadhaar Number"
                  value={
                    selectedStudent.aadharNumber
                  }
                />

                <Detail
                  label="Student Mobile"
                  value={
                    selectedStudent.contact
                  }
                />

                <Detail
                  label="Email"
                  value={
                    selectedStudent.email
                  }
                />

              </div>

            </div>


            {/* ==================================
                PARENTS
            ================================== */}

            <div className="student-view-section">

              <h5>
                Parents Information
              </h5>


              <div className="row">

                <Detail
                  label="Father's Name"
                  value={
                    selectedStudent.fatherName
                  }
                />

                <Detail
                  label="Father's Occupation"
                  value={
                    selectedStudent.fatherOccupation
                  }
                />

                <Detail
                  label="Father's Mobile"
                  value={
                    selectedStudent.fatherMobile
                  }
                />

                <Detail
                  label="Mother's Name"
                  value={
                    selectedStudent.motherName
                  }
                />

                <Detail
                  label="Mother's Occupation"
                  value={
                    selectedStudent.motherOccupation
                  }
                />

                <Detail
                  label="Mother's Mobile"
                  value={
                    selectedStudent.motherMobile
                  }
                />

              </div>

            </div>


            {/* ==================================
                ADDRESS
            ================================== */}

            <div className="student-view-section">

              <h5>
                Address
              </h5>


              <div className="row">

                <Detail
                  label="Permanent Address"
                  value={
                    selectedStudent.permanentAddress
                  }
                  full
                />

                <Detail
                  label="Current Address"
                  value={
                    selectedStudent.currentAddress
                  }
                  full
                />

              </div>

            </div>


            {/* ==================================
                EDUCATION
            ================================== */}

            <div className="student-view-section">

              <h5>
                Education
              </h5>


              <div className="row">

                <Detail
                  label="School / College"
                  value={
                    selectedStudent.schoolCollegeName
                  }
                />

              </div>

            </div>


            {/* ==================================
                ADMISSION
            ================================== */}

            <div className="student-view-section">

              <h5>
                Admission Information
              </h5>


              <div className="row">

                <Detail
                  label="Admission Number"
                  value={
                    selectedStudent.admissionNumber
                  }
                />

                <Detail
                  label="Roll Number"
                  value={
                    selectedStudent.rollNumber
                  }
                />

                <Detail
                  label="Biometric User ID"
                  value={
                    selectedStudent.biometricUserId ||
                    'Not Assigned'
                  }
                />

                <Detail
                  label="Academic Session"
                  value={
                    selectedStudent.session ||
                    sessionFilter
                  }
                />

                <Detail
                  label="Student Status"
                  value={
                    selectedStudent.studentStatus ||
                    'Active'
                  }
                />

                <Detail
                  label="Course"
                  value={
                    selectedStudent.course
                  }
                />

                <Detail
                  label="Batch Time"
                  value={
                    selectedStudent.batchTime
                  }
                />

                <Detail
                  label="Admission Type"
                  value={
                    selectedStudent.admissionType
                  }
                />

                <Detail
                  label="Admission Date"
                  value={
                    formatDate(
                      selectedStudent.admissionDate
                    )
                  }
                />

              </div>

            </div>


            {/* ==================================
                FEES
            ================================== */}

            <div className="student-view-section">

              <h5>
                Fee Information
              </h5>


              {(() => {

                const dueSummary =
                  getStudentDueSummary(
                    selectedStudent
                  )

                return (

                  <>

                    {/* ==================================
                        FEE SUMMARY CARDS
                    ================================== */}

                    <div className="row g-3 mb-4">

                      <div className="col-md-6 col-lg-3">

                        <div
                          className="border rounded-3 p-3 h-100 bg-light"
                        >

                          <small className="text-muted d-block">
                            Total Course Fee
                          </small>

                          <h5 className="fw-bold mb-0 mt-1">
                            ₹{
                              Number(
                                selectedStudent.totalFees || 0
                              ).toLocaleString(
                                'en-IN'
                              )
                            }
                          </h5>

                        </div>

                      </div>


                      <div className="col-md-6 col-lg-3">

                        <div
                          className="border rounded-3 p-3 h-100 bg-light"
                        >

                          <small className="text-muted d-block">
                            Paid Course Fee
                          </small>

                          <h5 className="fw-bold text-success mb-0 mt-1">
                            ₹{
                              Number(
                                selectedStudent.paidFees || 0
                              ).toLocaleString(
                                'en-IN'
                              )
                            }
                          </h5>

                        </div>

                      </div>


                      <div className="col-md-6 col-lg-3">

                        <div
                          className={`border rounded-3 p-3 h-100 ${
                            dueSummary.hasDue
                              ? 'border-danger bg-danger-subtle'
                              : 'bg-light'
                          }`}
                        >

                          <small className="text-muted d-block">
                            Due Amount
                          </small>

                          <h5
                            className={`fw-bold mb-0 mt-1 ${
                              dueSummary.hasDue
                                ? 'text-danger'
                                : 'text-success'
                            }`}
                          >
                            ₹{
                              Number(
                                dueSummary.dueAmount || 0
                              ).toLocaleString(
                                'en-IN'
                              )
                            }
                          </h5>

                          <small className="text-muted d-block mt-1">

                            {
                              dueSummary.hasDue
                                ? `${dueSummary.dueCount} installment${
                                    dueSummary.dueCount > 1
                                      ? 's'
                                      : ''
                                  } due`
                                : 'Nothing due now'
                            }

                          </small>

                        </div>

                      </div>


                      <div className="col-md-6 col-lg-3">

                        <div
                          className="border rounded-3 p-3 h-100 bg-light"
                        >

                          <small className="text-muted d-block">
                            Total Remaining
                          </small>

                          <h5 className="fw-bold text-primary mb-0 mt-1">
                            ₹{
                              Number(
                                selectedStudent.remainingFees || 0
                              ).toLocaleString(
                                'en-IN'
                              )
                            }
                          </h5>

                        </div>

                      </div>

                    </div>


                    {/* ==================================
                        DUE INFORMATION
                    ================================== */}

                    <div
                      className={`alert ${
                        dueSummary.hasDue
                          ? 'alert-danger'
                          : 'alert-success'
                      } border d-flex flex-wrap align-items-center justify-content-between gap-3`}
                    >

                      <div>

                        <strong>
                          {
                            dueSummary.hasDue
                              ? 'Current Fee Due'
                              : 'No Payment Due Right Now'
                          }
                        </strong>

                        <div className="mt-1">

                          {
                            dueSummary.hasDue
                              ? (
                                <>
                                  <span className="fw-bold">
                                    ₹{
                                      Number(
                                        dueSummary.dueAmount || 0
                                      ).toLocaleString(
                                        'en-IN'
                                      )
                                    }
                                  </span>

                                  {' • '}

                                  <span>
                                    {
                                      dueSummary.dueCount
                                    }
                                    {' '}
                                    installment{
                                      dueSummary.dueCount > 1
                                        ? 's'
                                        : ''
                                    }
                                  </span>
                                </>
                              )
                              : (
                                <span>
                                  ₹0 due currently
                                </span>
                              )
                          }

                        </div>

                      </div>


                      <div>

                        <small className="d-block text-muted">
                          {
                            dueSummary.hasDue
                              ? 'Latest Due Date'
                              : 'Next Due Date'
                          }
                        </small>

                        <strong>
                          {
                            dueSummary.dueDate
                              ? formatDate(
                                  dueSummary.dueDate
                                )
                              : '-'
                          }
                        </strong>

                      </div>

                    </div>


                    <div className="row">

                      <Detail
                        label="Registration Fee"
                        value={`₹${selectedStudent.registrationFee || 0}`}
                      />

                      <Detail
                        label="Registration Paid"
                        value={`₹${selectedStudent.registrationFeePaid || 0}`}
                      />

                      <Detail
                        label="Registration Status"
                        value={
                          selectedStudent.registrationFeeStatus ||
                          'Pending'
                        }
                      />

                      <Detail
                        label="Fee Status"
                        value={
                          <FeeStatusBadge
                            student={
                              selectedStudent
                            }
                          />
                        }
                      />

                      <Detail
                        label="Payment Plan"
                        value={
                          getPaymentPlanLabel(
                            selectedStudent.paymentPlan
                          )
                        }
                      />

                      <Detail
                        label="Monthly Amount"
                        value={`₹${selectedStudent.monthlyAmount || 0}`}
                      />

                      <Detail
                        label="Installments"
                        value={
                          selectedStudent.installmentCount ||
                          selectedStudent.installmentSchedule?.length ||
                          0
                        }
                      />

                      <Detail
                        label={
                          dueSummary.hasDue
                            ? 'Latest Due Date'
                            : 'Next Due Date'
                        }
                        value={
                          dueSummary.dueDate
                            ? formatDate(
                                dueSummary.dueDate
                              )
                            : '-'
                        }
                      />

                    </div>


                    {/* ==================================
                        INSTALLMENT SCHEDULE
                    ================================== */}

                    {Array.isArray(
                      selectedStudent.installmentSchedule
                    ) &&
                    selectedStudent.installmentSchedule.length > 0 && (

                      <div className="mt-4">

                        <div className="d-flex justify-content-between align-items-center mb-2">

                          <h6 className="mb-0">
                            Installment Schedule
                          </h6>

                          <span
                            className={
                              `badge ${
                                dueSummary.hasDue
                                  ? 'bg-danger'
                                  : 'bg-success'
                              }`
                            }
                          >

                            {
                              dueSummary.hasDue
                                ? `${dueSummary.dueCount} Due`
                                : 'No Current Due'
                            }

                          </span>

                        </div>


                        <div className="table-responsive">

                          <table className="table table-bordered align-middle">

                            <thead className="table-light">

                              <tr>

                                <th>
                                  #
                                </th>

                                <th>
                                  Amount
                                </th>

                                <th>
                                  Due Date
                                </th>

                                <th>
                                  Paid
                                </th>

                                <th>
                                  Balance
                                </th>

                                <th>
                                  Status
                                </th>

                              </tr>

                            </thead>


                            <tbody>

                              {selectedStudent.installmentSchedule.map(
                                (item, index) => {

                                  const amount =
                                    Number(
                                      item?.amount || 0
                                    )

                                  const paidAmount =
                                    Number(
                                      item?.paidAmount || 0
                                    )

                                  const balance =
                                    Math.max(
                                      0,
                                      amount -
                                      paidAmount
                                    )

                                  const itemDue =
                                    balance > 0 &&
                                    (
                                      item?.status === 'Due' ||
                                      (
                                        item?.dueDate &&
                                        new Date(
                                          item.dueDate
                                        ) <= new Date()
                                      )
                                    )

                                  return (

                                    <tr
                                      key={
                                        item._id ||
                                        index
                                      }
                                      className={
                                        itemDue
                                          ? 'table-danger'
                                          : ''
                                      }
                                    >

                                      <td>
                                        {
                                          item.installmentNumber ||
                                          index + 1
                                        }
                                      </td>

                                      <td className="fw-semibold">
                                        ₹{
                                          amount.toLocaleString(
                                            'en-IN'
                                          )
                                        }
                                      </td>

                                      <td>
                                        {
                                          item.dueDate
                                            ? formatDate(
                                                item.dueDate
                                              )
                                            : '-'
                                        }
                                      </td>

                                      <td className="text-success">
                                        ₹{
                                          paidAmount.toLocaleString(
                                            'en-IN'
                                          )
                                        }
                                      </td>

                                      <td
                                        className={
                                          balance > 0
                                            ? 'fw-semibold'
                                            : 'text-success'
                                        }
                                      >
                                        ₹{
                                          balance.toLocaleString(
                                            'en-IN'
                                          )
                                        }
                                      </td>

                                      <td>

                                        <span
                                          className={
                                            `status ${
                                              itemDue
                                                ? 'due'
                                                : (
                                                    item.status ||
                                                    'Pending'
                                                  ).toLowerCase()
                                            }`
                                          }
                                        >

                                          {
                                            itemDue
                                              ? 'Due'
                                              : (
                                                  item.status ||
                                                  'Pending'
                                                )
                                          }

                                        </span>

                                      </td>

                                    </tr>

                                  )

                                }
                              )}

                            </tbody>

                          </table>

                        </div>

                      </div>

                    )}


                  </>

                )

              })()}


            </div>


            {/* ==================================
                PAYMENT
            ================================== */}

            <div className="student-view-section">

              <PaymentForm

                paymentData={
                  paymentData
                }

                setPaymentData={
                  setPaymentData
                }

                selectedStudent={
                  selectedStudent
                }

                addPayment={
                  addPayment
                }

              />

            </div>


            {/* ==================================
                RECEIPT
            ================================== */}

            <div className="student-view-section">

              <ReceiptButton
                selectedStudent={
                  selectedStudent
                }
              />

            </div>


            {/* ==================================
                HISTORY
            ================================== */}

            <div className="student-view-section">

              <PaymentHistory
                selectedStudent={
                  selectedStudent
                }

              />

            </div>

          </div>

        </div>

      )}

    </div>

  )

}


// ======================================
// FEE STATUS BADGE
// ======================================

function FeeStatusBadge({
  student,
}) {

  const status =
    getActualFeeStatus(
      student
    )


  const statusClass =
    getFeeStatusClass(
      status
    )


  return (

    <span
      className={
        `status ${statusClass}`
      }
    >

      {status}

    </span>

  )

}


// ======================================
// DETAIL COMPONENT
// ======================================

function Detail({
  label,
  value,
  full = false,
}) {

  return (

    <div
      className={
        full
          ? 'col-12 mb-3'
          : 'col-md-4 mb-3'
      }
    >

      <div
        style={{
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          height: '100%',
        }}
      >

        <small
          className="text-muted d-block mb-1"
        >

          {
            label
          }

        </small>


        <strong>

          {
            value ||
            '-'
          }

        </strong>

      </div>

    </div>

  )

}


export default Students