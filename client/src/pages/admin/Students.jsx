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
  // FORM
  // ======================================

  const [formData, setFormData] =
    useState({

      // Basic
      name: '',
      dob: '',
      aadharNumber: '',
      admissionNumber: '',
      course: '',
      batchTime: '',

      // Contact
      contact: '',
      email: '',

      // Parents
      fatherName: '',
      motherName: '',
      fatherOccupation: '',
      motherOccupation: '',
      fatherMobile: '',
      motherMobile: '',

      // Address
      permanentAddress: '',
      currentAddress: '',

      // Education
      schoolCollegeName: '',

      // Admission
      admissionType: 'Offline',
      admissionDate: '',

      // Fees
      registrationFee: '',
      registrationFeePaid: '',

      totalFees: '',
      paidFees: '',

      // Installments
      monthlyInstallment: '',
      threeMonthInstallment: '',
      sixMonthInstallment: '',
      fullPaymentFee: '',

      // Payment plan
      paymentPlan: '',

      // Due
      dueDate: '',

      // Image
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
  // SEARCH
  // ======================================

  const [searchTerm, setSearchTerm] =
    useState('')


  // ======================================
  // STATUS FILTER
  // ======================================

  const [statusFilter, setStatusFilter] =
    useState('All')


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
  // FETCH DATA
  // ======================================

  useEffect(() => {

    fetchStudents()

    fetchCourses()

  }, [])


  // ======================================
  // GET STUDENTS
  // ======================================

  const fetchStudents = async () => {

    try {

      const response =
        await getStudents()

      setStudentData(
        response || []
      )

    } catch (error) {

      console.log(error)

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

    } catch (error) {

      console.log(error)

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

      registrationFee: '',
      registrationFeePaid: '',

      totalFees: '',
      paidFees: '',

      monthlyInstallment: '',
      threeMonthInstallment: '',
      sixMonthInstallment: '',
      fullPaymentFee: '',

      paymentPlan: '',

      dueDate: '',

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


    // ==================================
    // COURSE SELECT
    // ==================================

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

            monthlyInstallment:
              selectedCourse.monthlyInstallment ?? '',

            threeMonthInstallment:
              selectedCourse.threeMonthInstallment ?? '',

            sixMonthInstallment:
              selectedCourse.sixMonthInstallment ?? '',

            fullPaymentFee:
              selectedCourse.fullPaymentFee ?? '',

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
    ) > 0 &&

    Number(
      formData.registrationFeePaid || 0
    ) >=

    Number(
      formData.registrationFee || 0
    )

      ? 'Paid'

      : 'Pending'


  // ======================================
  // SUBMIT STUDENT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      // ==================================
      // PREVENT DOUBLE SUBMIT
      // ==================================

      if (isSubmitting) {

        return

      }


      try {

        // ==================================
        // START LOADING
        // ==================================

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
          Number(
            formData.registrationFeePaid || 0
          )


        // ==================================
        // VALIDATION
        // ==================================

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
          registrationFeePaid < 0 ||
          registrationFeePaid >
            registrationFee
        ) {

          alert(
            'Registration Paid cannot be greater than Registration Fee.'
          )

          return

        }


        // ==================================
        // OFFLINE INITIAL PAYMENT PLAN
        // ==================================

        if (

          !editId &&

          paidFees > 0 &&

          !formData.paymentPlan

        ) {

          alert(
            'Please select a payment plan for the paid course fee.'
          )

          return

        }


        // ==================================
        // FORMDATA
        // ==================================

        const data =
          new FormData()


        // ==================================
        // BASIC
        // ==================================

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

        // ==================================
        // IMPORTANT
        // ==================================
        // Admission Number is NOT sent
        // from frontend.
        //
        // Backend will automatically
        // generate ADM0001, ADM0002, etc.
        // ==================================

        data.append(
          'course',
          formData.course
        )

        data.append(
          'batchTime',
          formData.batchTime
        )


        // ==================================
        // CONTACT
        // ==================================

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
          paidFees
        )


        // ==================================
        // INSTALLMENTS
        // ==================================

        data.append(
          'monthlyInstallment',
          formData.monthlyInstallment || 0
        )

        data.append(
          'threeMonthInstallment',
          formData.threeMonthInstallment || 0
        )

        data.append(
          'sixMonthInstallment',
          formData.sixMonthInstallment || 0
        )

        data.append(
          'fullPaymentFee',
          formData.fullPaymentFee || 0
        )


        // ==================================
        // PAYMENT PLAN
        // ==================================

        data.append(
          'paymentPlan',
          formData.paymentPlan || ''
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
        // ==================================

        if (!editId) {

          const response =
            await createStudent(
              data
            )


          setStudentData(
            (previous) => [

              response.student,

              ...previous,

            ]
          )


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

      } catch (error) {

        console.log(error)

        alert(

          error.response?.data?.message ||

          'Student operation failed.'

        )

      } finally {

        // ==================================
        // STOP LOADING
        // ==================================

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
          student.admissionType || 'Offline',

        admissionDate:
          student.admissionDate || '',

        registrationFee:
          student.registrationFee || 0,

        registrationFeePaid:
          student.registrationFeePaid || 0,

        totalFees:
          student.totalFees || 0,

        paidFees:
          student.paidFees || 0,

        monthlyInstallment:
          student.monthlyInstallment || 0,

        threeMonthInstallment:
          student.threeMonthInstallment || 0,

        sixMonthInstallment:
          student.sixMonthInstallment || 0,

        fullPaymentFee:
          student.fullPaymentFee || 0,

        paymentPlan:
          student.paymentPlan || '',

        dueDate:
          student.dueDate || '',

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

      } catch (error) {

        console.log(error)

        alert(
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

      } catch (error) {

        console.log(error)

        alert(

          error.response?.data?.message ||

          'Payment failed.'

        )

      }

    }


  // ======================================
  // FILTER
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


        const course =
          (
            student.course || ''
          )
            .toLowerCase()


        const matchesSearch =

          name.includes(search)

          ||

          admissionNumber.includes(search)

          ||

          course.includes(search)


        const matchesStatus =

          statusFilter === 'All'

          ||

          student.feesStatus ===
            statusFilter


        return (

          matchesSearch &&

          matchesStatus

        )

      }

    )


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


  // ======================================
  // PAYMENT PLAN LABEL
  // ======================================

  const getPaymentPlanLabel =
    (plan) => {

      switch (plan) {

        case 'monthly':
          return 'Monthly'

        case 'three_month':
          return 'Every 3 Months'

        case 'six_month':
          return 'Every 6 Months'

        case 'full':
          return 'Full Payment'

        default:
          return 'Not Selected'

      }

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


            {/* NAME */}

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


            {/* DOB */}

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


            {/* AADHAAR */}

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


            {/* STUDENT MOBILE */}

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


            {/* EMAIL */}

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
                required
              />

            </div>


            {/* PHOTO */}

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


            {/* ==================================
                ADMISSION NUMBER REMOVED
                Backend generates it automatically
            ================================== */}


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
                required
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

          </div>


          {/* ================================== */}
          {/* FEES */}
          {/* ================================== */}

          <h4 className="mt-4 mb-3">
            Fee Information
          </h4>


          <div className="row">


            {/* REGISTRATION */}

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


            {/* REGISTRATION PAID */}

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Registration Fee Paid
              </label>

              <input
                type="number"
                className="form-control"
                name="registrationFeePaid"
                value={
                  formData.registrationFeePaid
                }
                onChange={
                  handleChange
                }
                min="0"
              />

              <small className="text-muted">

                Status: {registrationStatus}

              </small>

            </div>


            {/* TOTAL COURSE FEE */}

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
                required
              />

              <small className="text-muted">

                Individual student fee. Course
                default can be modified for concession.

              </small>

            </div>


            {/* PAID */}

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Paid Course Fee
              </label>

              <input
                type="number"
                className="form-control"
                name="paidFees"
                value={
                  formData.paidFees
                }
                onChange={
                  handleChange
                }
                min="0"
                max={
                  formData.totalFees || undefined
                }
              />

              <small className="text-muted">

                Can be entered manually for offline admission.

              </small>

            </div>


            {/* REMAINING */}

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


            {/* DUE DATE */}

            <div className="col-md-6 mb-3">

              <label className="form-label">
                Due Date
              </label>

              <input
                type="date"
                className="form-control"
                name="dueDate"
                value={
                  formData.dueDate
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>


          {/* ================================== */}
          {/* PAYMENT PLANS */}
          {/* ================================== */}

          <h5 className="mt-3 mb-3">
            Payment Plan Amounts
          </h5>


          <div className="row">


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Monthly Installment
              </label>

              <input
                type="number"
                className="form-control"
                name="monthlyInstallment"
                value={
                  formData.monthlyInstallment
                }
                onChange={
                  handleChange
                }
                min="0"
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                3 Month Installment
              </label>

              <input
                type="number"
                className="form-control"
                name="threeMonthInstallment"
                value={
                  formData.threeMonthInstallment
                }
                onChange={
                  handleChange
                }
                min="0"
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                6 Month Installment
              </label>

              <input
                type="number"
                className="form-control"
                name="sixMonthInstallment"
                value={
                  formData.sixMonthInstallment
                }
                onChange={
                  handleChange
                }
                min="0"
              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">
                Full Payment Fee
              </label>

              <input
                type="number"
                className="form-control"
                name="fullPaymentFee"
                value={
                  formData.fullPaymentFee
                }
                onChange={
                  handleChange
                }
                min="0"
              />

            </div>


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
                  handleChange
                }
              >

                <option value="">
                  Not Selected
                </option>

                <option value="monthly">
                  Monthly
                </option>

                <option value="three_month">
                  Every 3 Months
                </option>

                <option value="six_month">
                  Every 6 Months
                </option>

                <option value="full">
                  Full Payment
                </option>

              </select>

            </div>

          </div>


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
                    formData.registrationFee || 0
                  )
                }

              </div>


              <div className="col-md-3">

                <strong>
                  Registration Paid:
                </strong>

                <br />

                ₹{
                  Number(
                    formData.registrationFeePaid || 0
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
                    formData.totalFees || 0
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
              disabled={isSubmitting}
              style={{
                opacity:
                  isSubmitting ? 0.7 : 1,
                cursor:
                  isSubmitting
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >

              {isSubmitting ? (

                editId
                  ? 'Please Wait...'
                  : 'Please Wait...'

              ) : (

                editId
                  ? 'Update Student'
                  : 'Add Student'

              )}

            </button>


            {editId && (

              <button
                type="button"
                className="table-btn reject-btn"
                onClick={
                  resetForm
                }
                disabled={isSubmitting}
              >

                Cancel

              </button>

            )}

          </div>


        </form>

      </div>


      {/* ====================================== */}
      {/* SEARCH / FILTER */}
      {/* ====================================== */}

      <div className="row mt-4 mb-3">

        <div className="col-md-8 mb-2">

          <input
            type="text"
            className="form-control"
            placeholder="Search student, admission number or course..."
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


        <div className="col-md-4 mb-2">

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

            <option value="Pending">
              Pending
            </option>

            <option value="Partial">
              Partial
            </option>

            <option value="Paid">
              Paid
            </option>

          </select>

        </div>

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
            minWidth: '1500px',
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
                Course
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
                Status
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

            {filteredStudents.length === 0 ? (

              <tr>

                <td
                  colSpan="12"
                  className="text-center"
                >

                  No Students Found

                </td>

              </tr>

            ) : (

              filteredStudents.map(
                (student) => (

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
                        student.course
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

                      <span
                        className={
                          `status ${
                            (
                              student.feesStatus ||
                              'Pending'
                            ).toLowerCase()
                          }`
                        }
                      >

                        {
                          student.feesStatus ||
                          'Pending'
                        }

                      </span>

                    </td>


                    <td>

                      {
                        student.admissionDate ||
                        '-'
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

              )

            )}

          </tbody>

        </table>

      </div>


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


            {/* CLOSE */}

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


            {/* ================================== */}
            {/* PROFILE HEADER */}
            {/* ================================== */}

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

                <div
                  className="mb-3"
                >

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


            {/* ================================== */}
            {/* PERSONAL */}
            {/* ================================== */}

            <div className="student-view-section">

              <h5>
                Personal Information
              </h5>


              <div
                className="row"
              >

                <Detail
                  label="Student Name"
                  value={
                    selectedStudent.name
                  }
                />

                <Detail
                  label="Date of Birth"
                  value={
                    selectedStudent.dob
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


            {/* ================================== */}
            {/* PARENTS */}
            {/* ================================== */}

            <div className="student-view-section">

              <h5>
                Parents Information
              </h5>


              <div
                className="row"
              >

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


            {/* ================================== */}
            {/* ADDRESS */}
            {/* ================================== */}

            <div className="student-view-section">

              <h5>
                Address
              </h5>


              <div
                className="row"
              >

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


            {/* ================================== */}
            {/* EDUCATION */}
            {/* ================================== */}

            <div className="student-view-section">

              <h5>
                Education
              </h5>


              <div
                className="row"
              >

                <Detail
                  label="School / College"
                  value={
                    selectedStudent.schoolCollegeName
                  }
                />

              </div>

            </div>


            {/* ================================== */}
            {/* ADMISSION */}
            {/* ================================== */}

            <div className="student-view-section">

              <h5>
                Admission Information
              </h5>


              <div
                className="row"
              >

                <Detail
                  label="Admission Number"
                  value={
                    selectedStudent.admissionNumber
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
                    selectedStudent.admissionDate
                  }
                />

              </div>

            </div>


            {/* ================================== */}
            {/* FEES */}
            {/* ================================== */}

            <div className="student-view-section">

              <h5>
                Fee Information
              </h5>


              <div
                className="row"
              >

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
                  label="Total Course Fee"
                  value={`₹${selectedStudent.totalFees || 0}`}
                />

                <Detail
                  label="Paid Course Fee"
                  value={`₹${selectedStudent.paidFees || 0}`}
                />

                <Detail
                  label="Remaining Course Fee"
                  value={`₹${selectedStudent.remainingFees || 0}`}
                />

                <Detail
                  label="Fees Status"
                  value={
                    selectedStudent.feesStatus ||
                    'Pending'
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
                  label="Monthly Installment"
                  value={`₹${selectedStudent.monthlyInstallment || 0}`}
                />

                <Detail
                  label="3 Month Installment"
                  value={`₹${selectedStudent.threeMonthInstallment || 0}`}
                />

                <Detail
                  label="6 Month Installment"
                  value={`₹${selectedStudent.sixMonthInstallment || 0}`}
                />

                <Detail
                  label="Full Payment Fee"
                  value={`₹${selectedStudent.fullPaymentFee || 0}`}
                />

                <Detail
                  label="Due Date"
                  value={
                    selectedStudent.dueDate ||
                    '-'
                  }
                />

              </div>

            </div>


            {/* ================================== */}
            {/* ADD PAYMENT */}
            {/* ================================== */}

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


            {/* ================================== */}
            {/* RECEIPT */}
            {/* ================================== */}

            <div className="student-view-section">

              <ReceiptButton
                selectedStudent={
                  selectedStudent
                }
              />

            </div>


            {/* ================================== */}
            {/* PAYMENT HISTORY */}
            {/* ================================== */}

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