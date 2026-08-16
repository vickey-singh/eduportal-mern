import { useState, useEffect } from 'react'

import { Link } from 'react-router-dom'

import axios from 'axios'

import {
  API_BASE_URL,
  API_URL
} from '../../config/api'

import '../../assets/styles/admin.css'


// ======================================
// FACULTY
// ======================================

function Faculty() {

  // ======================================
  // FORM STATE
  // ======================================

  const [formData, setFormData] =
    useState({

      // PUBLIC
      name: '',
      designation: '',
      experience: '',
      subject: '',
      image: '',
      description: '',

      // PERSONAL
      dob: '',
      gender: '',
      aadharNumber: '',

      // CONTACT
      phone: '',
      email: '',

      // ADDRESS
      permanentAddress: '',
      currentAddress: '',

      // PROFESSIONAL
      qualification: '',
      institution: '',
      joiningDate: '',

      // TEACHER ACCOUNT
      createTeacherAccount: false,
      teacherPassword: '',
      accountStatus: 'Active',

      // COURSE / BATCH
      assignedClasses: [],

      // WEBSITE
      isWebsiteVisible: true,

    })


  // ======================================
  // FACULTY DATA
  // ======================================

  const [facultyData, setFacultyData] =
    useState([])


  // ======================================
  // COURSE DATA
  // ======================================

  const [courseData, setCourseData] =
    useState([])


  // ======================================
  // EDIT ID
  // ======================================

  const [editId, setEditId] =
    useState(null)


  // ======================================
  // VIEW FACULTY
  // ======================================

  const [viewFaculty, setViewFaculty] =
    useState(null)


  // ======================================
  // RESET PASSWORD
  // ======================================

  const [resetFaculty, setResetFaculty] =
    useState(null)

  const [resetPassword, setResetPassword] =
    useState('')


  // ======================================
  // SALARY
  // ======================================

  const [salaryFaculty, setSalaryFaculty] =
    useState(null)

  const [salaryData, setSalaryData] =
    useState(null)

  const [salaryLoading, setSalaryLoading] =
    useState(false)

  const [salaryUpdating, setSalaryUpdating] =
    useState(false)

  const [salaryPaying, setSalaryPaying] =
    useState(false)

  const [monthlySalaryInput, setMonthlySalaryInput] =
    useState('')

  const [paymentDate, setPaymentDate] =
    useState('')

  const [paymentMethod, setPaymentMethod] =
    useState('Cash')

  const [salaryRemarks, setSalaryRemarks] =
    useState('')


  // ======================================
  // PAY SALARY RECORD
  // ======================================

  const [paySalaryRecord, setPaySalaryRecord] =
    useState(null)


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(false)

  const [resettingPassword, setResettingPassword] =
    useState(false)

  const [visibilityUpdatingId, setVisibilityUpdatingId] =
    useState(null)


  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange =
    (e) => {

      const {
        name,
        value,
        type,
        checked,
      } = e.target


      setFormData({

        ...formData,

        [name]:

          type === 'checkbox'
            ? checked
            : value,

      })

    }


  // ======================================
  // HANDLE IMAGE
  // ======================================

  const handleImageChange =
    (e) => {

      setFormData({

        ...formData,

        image:
          e.target.files?.[0] || '',

      })

    }


  // ======================================
  // RESET FORM
  // ======================================

  const resetForm =
    () => {

      setFormData({

        name: '',
        designation: '',
        experience: '',
        subject: '',
        image: '',
        description: '',

        dob: '',
        gender: '',
        aadharNumber: '',

        phone: '',
        email: '',

        permanentAddress: '',
        currentAddress: '',

        qualification: '',
        institution: '',
        joiningDate: '',

        createTeacherAccount: false,
        teacherPassword: '',
        accountStatus: 'Active',

        assignedClasses: [],

        isWebsiteVisible: true,

      })


      setEditId(null)

    }


  // ======================================
  // FETCH FACULTY
  // ======================================

  const fetchFaculty =
    async () => {

      try {

        const response =
          await axios.get(

            `${API_URL}/faculty`

          )


        setFacultyData(
          response.data
        )

      }

      catch (error) {

        console.log(
          'Fetch Faculty Error:',
          error
        )

      }

    }


  // ======================================
  // FETCH COURSES
  // ======================================

  const fetchCourses =
    async () => {

      try {

        const response =
          await axios.get(

            `${API_URL}/courses`

          )


        setCourseData(
          response.data
        )

      }

      catch (error) {

        console.log(
          'Fetch Courses Error:',
          error
        )

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    fetchFaculty()

    fetchCourses()

  }, [])


  // ======================================
  // COURSE ASSIGNED CHECK
  // ======================================

  const isCourseAssigned =
    (courseId) => {

      return (

        formData.assignedClasses.some(

          (item) => {

            const id =

              item.courseId?._id ||

              item.courseId


            return (

              String(id) ===
              String(courseId)

            )

          }

        )

      )

    }


  // ======================================
  // TOGGLE COURSE
  // ======================================

  const toggleCourse =
    (course) => {

      const exists =
        isCourseAssigned(
          course._id
        )


      if (exists) {

        setFormData({

          ...formData,

          assignedClasses:

            formData.assignedClasses.filter(

              (item) => {

                const id =

                  item.courseId?._id ||

                  item.courseId


                return (

                  String(id) !==
                  String(course._id)

                )

              }

            ),

        })


        return

      }


      if (!course.batchTime) {

        alert(

          `${course.courseName} does not have a batch time. Please add the batch time first.`

        )

        return

      }


      setFormData({

        ...formData,

        assignedClasses: [

          ...formData.assignedClasses,

          {

            courseId:
              course._id,

            batchTime:
              course.batchTime,

          },

        ],

      })

    }


  // ======================================
  // HANDLE SUBMIT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      if (loading) {

        return

      }


      try {

        setLoading(true)


        const facultyFormData =
          new FormData()


        // ==================================
        // PUBLIC
        // ==================================

        facultyFormData.append(
          'name',
          formData.name
        )

        facultyFormData.append(
          'designation',
          formData.designation
        )

        facultyFormData.append(
          'experience',
          formData.experience
        )

        facultyFormData.append(
          'subject',
          formData.subject
        )

        facultyFormData.append(
          'description',
          formData.description
        )


        // ==================================
        // PERSONAL
        // ==================================

        facultyFormData.append(
          'dob',
          formData.dob
        )

        facultyFormData.append(
          'gender',
          formData.gender
        )

        facultyFormData.append(
          'aadharNumber',
          formData.aadharNumber
        )


        // ==================================
        // CONTACT
        // ==================================

        facultyFormData.append(
          'phone',
          formData.phone
        )

        facultyFormData.append(
          'email',
          formData.email
        )


        // ==================================
        // ADDRESS
        // ==================================

        facultyFormData.append(
          'permanentAddress',
          formData.permanentAddress
        )

        facultyFormData.append(
          'currentAddress',
          formData.currentAddress
        )


        // ==================================
        // PROFESSIONAL
        // ==================================

        facultyFormData.append(
          'qualification',
          formData.qualification
        )

        facultyFormData.append(
          'institution',
          formData.institution
        )

        facultyFormData.append(
          'joiningDate',
          formData.joiningDate
        )


        // ==================================
        // TEACHER ACCOUNT
        // ==================================

        facultyFormData.append(

          'createTeacherAccount',

          String(
            formData.createTeacherAccount
          )

        )


        facultyFormData.append(

          'isTeacher',

          String(
            formData.createTeacherAccount
          )

        )


        facultyFormData.append(

          'accountStatus',

          formData.accountStatus

        )


        // ==================================
        // NEW TEACHER PASSWORD
        // ==================================

        if (

          !editId &&

          formData.createTeacherAccount &&

          formData.teacherPassword

        ) {

          facultyFormData.append(

            'teacherPassword',

            formData.teacherPassword

          )

        }


        // ==================================
        // ASSIGNED CLASSES
        // ==================================

        facultyFormData.append(

          'assignedClasses',

          JSON.stringify(

            formData.assignedClasses.map(

              (item) => ({

                courseId:

                  item.courseId?._id ||

                  item.courseId,

                batchTime:
                  item.batchTime || '',

              })

            )

          )

        )


        // ==================================
        // WEBSITE
        // ==================================

        facultyFormData.append(

          'isWebsiteVisible',

          String(
            formData.isWebsiteVisible
          )

        )


        // ==================================
        // IMAGE
        // ==================================

        if (formData.image) {

          facultyFormData.append(

            'image',

            formData.image

          )

        }


        let response


        // ==================================
        // UPDATE
        // ==================================

        if (editId) {

          response =
            await axios.put(

              `${API_URL}/faculty/${editId}`,

              facultyFormData

            )


          setFacultyData(

            facultyData.map(

              (item) =>

                item._id === editId

                  ? response.data.faculty

                  : item

            )

          )


          alert(
            'Faculty Updated Successfully'
          )

        }


        // ==================================
        // ADD
        // ==================================

        else {

          if (

            formData.createTeacherAccount &&

            !formData.teacherPassword.trim()

          ) {

            alert(
              'Please enter a teacher password.'
            )

            return

          }


          response =
            await axios.post(

              `${API_URL}/faculty`,

              facultyFormData

            )


          setFacultyData([

            response.data.faculty,

            ...facultyData,

          ])


          alert(

            response.data.message ||

            'Faculty Added Successfully'

          )

        }


        resetForm()

      }

      catch (error) {

        console.log(
          'Faculty Operation Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Faculty Operation Failed'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // EDIT FACULTY
  // ======================================

  const editFaculty =
    (item) => {

      setFormData({

        name:
          item.name || '',

        designation:
          item.designation || '',

        experience:
          item.experience || '',

        subject:
          item.subject || '',

        image: '',

        description:
          item.description || '',

        dob:
          item.dob || '',

        gender:
          item.gender || '',

        aadharNumber:
          item.aadharNumber || '',

        phone:
          item.phone || '',

        email:
          item.email || '',

        permanentAddress:
          item.permanentAddress || '',

        currentAddress:
          item.currentAddress || '',

        qualification:
          item.qualification || '',

        institution:
          item.institution || '',

        joiningDate:
          item.joiningDate || '',

        createTeacherAccount:
          item.isTeacher === true,

        teacherPassword: '',

        accountStatus:
          item.accountStatus ||
          'Active',

        assignedClasses:

          Array.isArray(
            item.assignedClasses
          )

            ? item.assignedClasses.map(

                (assignment) => ({

                  courseId:

                    assignment.courseId?._id ||

                    assignment.courseId,

                  batchTime:
                    assignment.batchTime || '',

                })

              )

            : [],

        isWebsiteVisible:
          item.isWebsiteVisible !== false,

      })


      setEditId(
        item._id
      )


      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      })

    }


  // ======================================
  // DELETE FACULTY
  // ======================================

  const deleteFaculty =
    async (id) => {

      if (loading) {

        return

      }


      const confirmDelete =
        window.confirm(

          'Are you sure you want to delete this faculty?'

        )


      if (!confirmDelete) {

        return

      }


      try {

        setLoading(true)


        await axios.delete(

          `${API_URL}/faculty/${id}`

        )


        setFacultyData(

          facultyData.filter(

            (item) =>
              item._id !== id

          )

        )


        alert(
          'Faculty Deleted Successfully'
        )

      }

      catch (error) {

        console.log(
          'Delete Faculty Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Delete Failed'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // WEBSITE VISIBILITY
  // ======================================

  const toggleWebsiteVisibility =
    async (item) => {

      if (visibilityUpdatingId) {

        return

      }


      try {

        setVisibilityUpdatingId(
          item._id
        )


        const data =
          new FormData()


        // PUBLIC
        data.append(
          'name',
          item.name || ''
        )

        data.append(
          'designation',
          item.designation || ''
        )

        data.append(
          'experience',
          item.experience || ''
        )

        data.append(
          'subject',
          item.subject || ''
        )

        data.append(
          'description',
          item.description || ''
        )


        // PERSONAL
        data.append(
          'dob',
          item.dob || ''
        )

        data.append(
          'gender',
          item.gender || ''
        )

        data.append(
          'aadharNumber',
          item.aadharNumber || ''
        )


        // CONTACT
        data.append(
          'phone',
          item.phone || ''
        )

        data.append(
          'email',
          item.email || ''
        )


        // ADDRESS
        data.append(
          'permanentAddress',
          item.permanentAddress || ''
        )

        data.append(
          'currentAddress',
          item.currentAddress || ''
        )


        // PROFESSIONAL
        data.append(
          'qualification',
          item.qualification || ''
        )

        data.append(
          'institution',
          item.institution || ''
        )

        data.append(
          'joiningDate',
          item.joiningDate || ''
        )


        // TEACHER
        data.append(

          'isTeacher',

          String(
            item.isTeacher === true
          )

        )


        data.append(

          'accountStatus',

          item.accountStatus ||
          'Active'

        )


        // ASSIGNED CLASSES
        data.append(

          'assignedClasses',

          JSON.stringify(

            Array.isArray(
              item.assignedClasses
            )

              ? item.assignedClasses.map(

                  (assignment) => ({

                    courseId:

                      assignment.courseId?._id ||

                      assignment.courseId,

                    batchTime:
                      assignment.batchTime || '',

                  })

                )

              : []

          )

        )


        // WEBSITE
        data.append(

          'isWebsiteVisible',

          String(
            !item.isWebsiteVisible
          )

        )


        const response =
          await axios.put(

            `${API_URL}/faculty/${item._id}`,

            data

          )


        setFacultyData(

          facultyData.map(

            (faculty) =>

              faculty._id === item._id

                ? response.data.faculty

                : faculty

          )

        )

      }

      catch (error) {

        console.log(
          'Website Visibility Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Website Visibility Update Failed'

        )

      }

      finally {

        setVisibilityUpdatingId(
          null
        )

      }

    }


  // ======================================
  // RESET PASSWORD
  // ======================================

  const handleResetPassword =
    async () => {

      if (resettingPassword) {

        return

      }


      if (!resetFaculty) {

        return

      }


      if (!resetPassword.trim()) {

        alert(
          'Please enter a new password.'
        )

        return

      }


      if (
        resetPassword.trim().length < 6
      ) {

        alert(
          'Password must be at least 6 characters.'
        )

        return

      }


      try {

        setResettingPassword(
          true
        )


        const response =
          await axios.put(

            `${API_URL}/faculty/${resetFaculty._id}/reset-password`,

            {

              teacherPassword:
                resetPassword.trim(),

            }

          )


        alert(

          response.data.message ||

          'Teacher Password Reset Successfully'

        )


        setResetFaculty(
          null
        )

        setResetPassword('')

      }

      catch (error) {

        console.log(
          'Reset Password Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Password Reset Failed'

        )

      }

      finally {

        setResettingPassword(
          false
        )

      }

    }


  // ======================================
  // GET ASSIGNED COURSE
  // ======================================

  const getAssignedCourse =
    (assignment) => {

      if (!assignment) {

        return null

      }


      // ==================================
      // POPULATED COURSE OBJECT
      // ==================================

      if (

        assignment.courseId &&

        typeof assignment.courseId ===
          'object'

      ) {

        return assignment.courseId

      }


      // ==================================
      // PLAIN COURSE ID
      // ==================================

      const courseId =
        assignment.courseId


      if (!courseId) {

        return null

      }


      // ==================================
      // FIND FROM COURSE DATA
      // ==================================

      return (

        courseData.find(

          (course) =>

            String(
              course._id
            ) ===
            String(
              courseId
            )

        ) || null

      )

    }


  // ======================================
  // IMAGE URL
  // ======================================

  const getImageUrl =
    (image) => {

      if (!image) {

        return '/logo.png'

      }


      // ==================================
      // CLOUDINARY / EXTERNAL URL
      // ==================================

      if (

        image.startsWith(
          'http://'
        ) ||

        image.startsWith(
          'https://'
        )

      ) {

        return image

      }


      // ==================================
      // LOCAL UPLOAD
      // ==================================

      return `${API_BASE_URL}${

        image.startsWith('/')

          ? image

          : `/${image}`

      }`

    }


  // ======================================
  // OPEN SALARY
  // ======================================

  const openSalary =
    async (faculty) => {

      try {

        setSalaryFaculty(
          faculty
        )

        setSalaryData(null)

        setSalaryLoading(true)

        setMonthlySalaryInput(

          faculty.monthlySalary !==
            undefined &&
          faculty.monthlySalary !==
            null

            ? String(
                faculty.monthlySalary
              )

            : ''

        )


        // RESET PAYMENT FORM

        setPaySalaryRecord(null)

        setPaymentDate('')

        setPaymentMethod('Cash')

        setSalaryRemarks('')


        const response =
          await axios.get(

            `${API_URL}/faculty-salary/${faculty._id}`

          )


        if (
          response.data.success
        ) {

          setSalaryData(
            response.data
          )

          setMonthlySalaryInput(

            response.data.faculty
              ?.monthlySalary !==
              undefined &&
            response.data.faculty
              ?.monthlySalary !==
              null

              ? String(

                  response.data.faculty
                    .monthlySalary

                )

              : ''

          )

        }

      }

      catch (error) {

        console.log(
          'Open Salary Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Unable to load faculty salary.'

        )

        setSalaryFaculty(null)

      }

      finally {

        setSalaryLoading(false)

      }

    }


  // ======================================
  // CLOSE SALARY
  // ======================================

  const closeSalary =
    () => {

      if (
        salaryUpdating ||
        salaryPaying
      ) {

        return

      }


      setSalaryFaculty(null)

      setSalaryData(null)

      setPaySalaryRecord(null)

      setPaymentDate('')

      setPaymentMethod('Cash')

      setSalaryRemarks('')

    }


  // ======================================
  // UPDATE MONTHLY SALARY
  // ======================================

  const handleUpdateMonthlySalary =
    async () => {

      if (salaryUpdating) {

        return

      }


      if (!salaryFaculty) {

        return

      }


      const salary =
        Number(
          monthlySalaryInput
        )


      if (

        Number.isNaN(salary) ||

        salary < 0

      ) {

        alert(
          'Please enter a valid salary amount.'
        )

        return

      }


      try {

        setSalaryUpdating(true)


        const response =
          await axios.put(

            `${API_URL}/faculty-salary/${salaryFaculty._id}`,

            {

              monthlySalary:
                salary,

            }

          )


        if (
          response.data.success
        ) {

          alert(

            response.data.message ||

            'Monthly salary updated successfully.'

          )


          await openSalary(
            salaryFaculty
          )


          // Update faculty list

          setFacultyData(

            (current) =>

              current.map(

                (faculty) =>

                  faculty._id ===
                  salaryFaculty._id

                    ? {

                        ...faculty,

                        monthlySalary:
                          salary,

                      }

                    : faculty

              )

          )

        }

      }

      catch (error) {

        console.log(

          'Update Salary Error:',

          error

        )


        alert(

          error?.response?.data?.message ||

          'Unable to update monthly salary.'

        )

      }

      finally {

        setSalaryUpdating(false)

      }

    }


  // ======================================
  // OPEN PAY SALARY
  // ======================================

  const openPaySalary =
    (record) => {

      setPaySalaryRecord(
        record
      )


      const today =
        new Date()


      const year =
        today.getFullYear()


      const month =
        String(
          today.getMonth() + 1
        ).padStart(
          2,
          '0'
        )


      const day =
        String(
          today.getDate()
        ).padStart(
          2,
          '0'
        )


      setPaymentDate(

        `${year}-${month}-${day}`

      )


      setPaymentMethod('Cash')

      setSalaryRemarks('')

    }


  // ======================================
  // MARK SALARY PAID
  // ======================================

  const handleMarkSalaryPaid =
    async () => {

      if (salaryPaying) {

        return

      }


      if (
        !salaryFaculty ||
        !paySalaryRecord
      ) {

        return

      }


      try {

        setSalaryPaying(true)


        const response =
          await axios.put(

            `${API_URL}/faculty-salary/${salaryFaculty._id}/pay`,

            {

              month:
                paySalaryRecord.month,

              year:
                paySalaryRecord.year,

              paymentDate:
                paymentDate || null,

              paymentMethod:
                paymentMethod || '',

              remarks:
                salaryRemarks || '',

            }

          )


        if (
          response.data.success
        ) {

          alert(

            response.data.message ||

            'Salary marked as paid successfully.'

          )


          setPaySalaryRecord(
            null
          )


          setPaymentDate('')

          setPaymentMethod('Cash')

          setSalaryRemarks('')


          await openSalary(
            salaryFaculty
          )

        }

      }

      catch (error) {

        console.log(

          'Mark Salary Paid Error:',

          error

        )


        alert(

          error?.response?.data?.message ||

          'Unable to mark salary as paid.'

        )

      }

      finally {

        setSalaryPaying(false)

      }

    }


  // ======================================
  // MARK SALARY DUE
  // ======================================

  const handleMarkSalaryDue =
    async (record) => {

      if (!salaryFaculty) {

        return

      }


      const confirmed =
        window.confirm(

          `Are you sure you want to mark ${getMonthName(record.month)} ${record.year} salary as Due?`

        )


      if (!confirmed) {

        return

      }


      try {

        const response =
          await axios.put(

            `${API_URL}/faculty-salary/${salaryFaculty._id}/due`,

            {

              month:
                record.month,

              year:
                record.year,

            }

          )


        if (
          response.data.success
        ) {

          alert(

            response.data.message ||

            'Salary marked as due.'

          )


          await openSalary(
            salaryFaculty
          )

        }

      }

      catch (error) {

        console.log(

          'Mark Salary Due Error:',

          error

        )


        alert(

          error?.response?.data?.message ||

          'Unable to mark salary as due.'

        )

      }

    }


  // ======================================
  // MONTH NAME
  // ======================================

  const getMonthName =
    (month) => {

      const monthNames = [

        'January',

        'February',

        'March',

        'April',

        'May',

        'June',

        'July',

        'August',

        'September',

        'October',

        'November',

        'December',

      ]


      return (

        monthNames[
          Number(month) - 1
        ] ||

        '-'

      )

    }


  // ======================================
  // FORMAT MONEY
  // ======================================

  const formatMoney =
    (amount) => {

      return (

        `₹${Number(
          amount || 0
        ).toLocaleString('en-IN')}`

      )

    }


  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate =
    (date) => {

      if (!date) {

        return '-'

      }


      const value =
        new Date(
          date
        )


      if (
        Number.isNaN(
          value.getTime()
        )
      ) {

        return '-'

      }


      return value.toLocaleDateString(
        'en-IN'
      )

    }


  // ======================================
  // RENDER
  // ======================================

  return (

    <div className="applications-section">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="applications-header d-flex justify-content-between align-items-center">

        <div>

          <h2>
            Faculty Management
          </h2>

          <p>
            Add and manage faculty members.
          </p>

        </div>


        <Link
          to="/admin/faculty-attendance"
          className="btn faculty-attendance-btn"
        >

          <i className="fas fa-calendar-check me-2"></i>

          Faculty Attendance

        </Link>

      </div>


      {/* ======================================
          FORM
      ====================================== */}

      <div className="admin-form-wrapper">

        <form
          onSubmit={handleSubmit}
        >

          <div className="row">


            {/* ==================================
                PUBLIC INFORMATION
            ================================== */}

            <div className="col-12 mb-3">

              <h5 className="fw-bold">

                Public Faculty Information

              </h5>

              <hr />

            </div>


            {/* NAME */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Faculty Name

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


            {/* DESIGNATION */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Designation

              </label>


              <input

                type="text"

                className="form-control"

                name="designation"

                value={
                  formData.designation
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* EXPERIENCE */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Experience

              </label>


              <input

                type="text"

                className="form-control"

                name="experience"

                value={
                  formData.experience
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* SUBJECT */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Subject

              </label>


              <input

                type="text"

                className="form-control"

                name="subject"

                value={
                  formData.subject
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* IMAGE */}

            <div className="col-12 mb-3">

              <label className="form-label">

                Upload Faculty Image

              </label>


              <input

                type="file"

                className="form-control"

                accept="image/jpeg,image/png,image/jpg,image/webp"

                onChange={
                  handleImageChange
                }

              />


              {editId && (

                <small className="text-muted">

                  Leave empty to keep existing image.

                </small>

              )}

            </div>


            {/* DESCRIPTION */}

            <div className="col-12 mb-4">

              <label className="form-label">

                Description

              </label>


              <textarea

                className="form-control"

                rows="4"

                name="description"

                value={
                  formData.description
                }

                onChange={
                  handleChange
                }

                required

              ></textarea>

            </div>


            {/* ==================================
                PERSONAL
            ================================== */}

            <div className="col-12 mb-3">

              <h5 className="fw-bold">

                Personal Information

              </h5>

              <hr />

            </div>


            <div className="col-md-4 mb-3">

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


            <div className="col-md-4 mb-3">

              <label className="form-label">

                Gender

              </label>


              <select

                className="form-select"

                name="gender"

                value={
                  formData.gender
                }

                onChange={
                  handleChange
                }

              >

                <option value="">

                  Select Gender

                </option>

                <option value="Male">

                  Male

                </option>

                <option value="Female">

                  Female

                </option>

                <option value="Other">

                  Other

                </option>

              </select>

            </div>


            <div className="col-md-4 mb-3">

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

              />

            </div>


            {/* ==================================
                CONTACT
            ================================== */}

            <div className="col-12 mt-2 mb-3">

              <h5 className="fw-bold">

                Contact Information

              </h5>

              <hr />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">

                Mobile Number

              </label>


              <input

                type="tel"

                className="form-control"

                name="phone"

                value={
                  formData.phone
                }

                onChange={
                  handleChange
                }

              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">

                Email

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


            {/* ==================================
                ADDRESS
            ================================== */}

            <div className="col-12 mt-2 mb-3">

              <h5 className="fw-bold">

                Address

              </h5>

              <hr />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">

                Permanent Address

              </label>


              <textarea

                className="form-control"

                rows="3"

                name="permanentAddress"

                value={
                  formData.permanentAddress
                }

                onChange={
                  handleChange
                }

              ></textarea>

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">

                Current Address

              </label>


              <textarea

                className="form-control"

                rows="3"

                name="currentAddress"

                value={
                  formData.currentAddress
                }

                onChange={
                  handleChange
                }

              ></textarea>

            </div>


            {/* ==================================
                PROFESSIONAL
            ================================== */}

            <div className="col-12 mt-2 mb-3">

              <h5 className="fw-bold">

                Professional Information

              </h5>

              <hr />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">

                Qualification

              </label>


              <input

                type="text"

                className="form-control"

                name="qualification"

                value={
                  formData.qualification
                }

                onChange={
                  handleChange
                }

              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">

                University / Institution

              </label>


              <input

                type="text"

                className="form-control"

                name="institution"

                value={
                  formData.institution
                }

                onChange={
                  handleChange
                }

              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">

                Joining Date

              </label>


              <input

                type="date"

                className="form-control"

                name="joiningDate"

                value={
                  formData.joiningDate
                }

                onChange={
                  handleChange
                }

              />

            </div>


            <div className="col-md-6 mb-3">

              <label className="form-label">

                Employee ID

              </label>


              <div className="form-control bg-light">

                {editId

                  ? (

                    facultyData.find(

                      (item) =>
                        item._id === editId

                    )?.employeeId ||

                    'Auto-generated'

                  )

                  : (

                    <span className="text-muted">

                      Auto-generated by system

                    </span>

                  )

                }

              </div>

            </div>


            {/* ==================================
                TEACHER ACCOUNT
            ================================== */}

            <div className="col-12 mt-2 mb-3">

              <h5 className="fw-bold">

                Teacher Account

              </h5>

              <hr />

            </div>


            <div className="col-md-6 mb-3">

              <div className="form-check">

                <input

                  type="checkbox"

                  className="form-check-input"

                  id="createTeacherAccount"

                  name="createTeacherAccount"

                  checked={
                    formData.createTeacherAccount
                  }

                  onChange={
                    handleChange
                  }

                />


                <label

                  className="form-check-label"

                  htmlFor="createTeacherAccount"

                >

                  Enable Teacher Login

                </label>

              </div>


              <small className="text-muted">

                Teacher ID will be generated automatically.

              </small>

            </div>


            {formData.createTeacherAccount && (

              <div className="col-md-6 mb-3">

                <label className="form-label">

                  Account Status

                </label>


                <select

                  className="form-select"

                  name="accountStatus"

                  value={
                    formData.accountStatus
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

              </div>

            )}


            {!editId &&
              formData.createTeacherAccount && (

                <div className="col-md-6 mb-3">

                  <label className="form-label">

                    Initial Teacher Password

                  </label>


                  <input

                    type="password"

                    className="form-control"

                    name="teacherPassword"

                    value={
                      formData.teacherPassword
                    }

                    onChange={
                      handleChange
                    }

                    required

                  />

                </div>

              )}


            {editId &&
              formData.createTeacherAccount && (

                <div className="col-12 mb-3">

                  <div className="alert alert-info">

                    Password is managed from
                    <strong>
                      {' '}Reset Password
                    </strong>.

                  </div>

                </div>

              )}


            {/* ==================================
                COURSE / BATCH
            ================================== */}

            <div className="col-12 mt-2 mb-3">

              <h5 className="fw-bold">

                Course & Batch Assignment

              </h5>

              <hr />


              <p className="text-muted">

                Select courses and batches assigned
                to this teacher.

              </p>

            </div>


            <div className="col-12 mb-4">

              {courseData.length === 0 ? (

                <div className="alert alert-warning">

                  No courses found.

                </div>

              ) : (

                <div className="row g-3">

                  {courseData.map(

                    (course) => (

                      <div

                        className="col-md-6"

                        key={
                          course._id
                        }

                      >

                        <div className="border rounded p-3">

                          <div className="form-check">

                            <input

                              type="checkbox"

                              className="form-check-input"

                              id={
                                `course-${course._id}`
                              }

                              checked={

                                isCourseAssigned(
                                  course._id
                                )

                              }

                              onChange={() =>
                                toggleCourse(
                                  course
                                )
                              }

                            />


                            <label

                              className="form-check-label"

                              htmlFor={
                                `course-${course._id}`
                              }

                            >

                              <strong>

                                {
                                  course.courseName
                                }

                              </strong>


                              {' '}


                              <span className="text-muted">

                                (
                                {
                                  course.courseCode
                                }
                                )

                              </span>

                            </label>

                          </div>


                          <small className="text-muted ms-4">

                            Batch:{' '}

                            {
                              course.batchTime ||
                              'Not Set'
                            }

                          </small>

                        </div>

                      </div>

                    )

                  )}

                </div>

              )}

            </div>


            {/* ==================================
                WEBSITE
            ================================== */}

            <div className="col-12 mt-2 mb-4">

              <h5 className="fw-bold">

                Website Visibility

              </h5>

              <hr />


              <div className="form-check form-switch">

                <input

                  className="form-check-input"

                  type="checkbox"

                  id="isWebsiteVisible"

                  name="isWebsiteVisible"

                  checked={
                    formData.isWebsiteVisible
                  }

                  onChange={
                    handleChange
                  }

                />


                <label

                  className="form-check-label"

                  htmlFor="isWebsiteVisible"

                >

                  Show this faculty on main website

                </label>

              </div>

            </div>

          </div>


          {/* ======================================
              SUBMIT
          ====================================== */}

          <button

            type="submit"

            className="table-btn approve-btn"

            disabled={
              loading
            }

          >

            {loading

              ? 'Please Wait...'

              : editId

                ? 'Update Faculty'

                : 'Add Faculty'

            }

          </button>


          {editId && (

            <button

              type="button"

              className="table-btn reject-btn ms-2"

              onClick={
                resetForm
              }

              disabled={
                loading
              }

            >

              Cancel

            </button>

          )}

        </form>

      </div>


      {/* ======================================
          FACULTY TABLE
      ====================================== */}

      <div className="table-responsive mt-5">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Image</th>

              <th>Name</th>

              <th>Subject</th>

              <th>Experience</th>

              <th>Designation</th>

              <th>Teacher ID</th>

              <th>Employee ID</th>

              <th>Salary</th>

              <th>Website</th>

              <th>Action</th>

            </tr>

          </thead>


          <tbody>

            {facultyData.length === 0 ? (

              <tr>

                <td
                  colSpan="10"
                  className="text-center"
                >

                  No faculty found.

                </td>

              </tr>

            ) : (

              facultyData.map(

                (item) => (

                  <tr
                    key={
                      item._id
                    }
                  >

                    <td>

                      <img

                        src={
                          getImageUrl(
                            item.image
                          )
                        }

                        alt={
                          item.name
                        }

                        width="60"

                        height="60"

                        style={{

                          objectFit:
                            'cover',

                          borderRadius:
                            '8px',

                        }}

                        onError={(e) => {

                          e.currentTarget.src =
                            '/logo.png'

                        }}

                      />

                    </td>


                    <td>
                      {
                        item.name
                      }
                    </td>


                    <td>
                      {
                        item.subject
                      }
                    </td>


                    <td>
                      {
                        item.experience
                      }
                    </td>


                    <td>
                      {
                        item.designation
                      }
                    </td>


                    <td>

                      {item.isTeacher === true

                        ? (

                          item.teacherId ||
                          'Generating...'

                        )

                        : (

                          <span className="text-muted">

                            Not Enabled

                          </span>

                        )

                      }

                    </td>


                    <td>

                      {
                        item.employeeId ||
                        'Generating...'
                      }

                    </td>


                    {/* ==================================
                        SALARY
                    ================================== */}

                    <td>

                      <button

                        type="button"

                        className="table-btn approve-btn"

                        onClick={() =>
                          openSalary(
                            item
                          )
                        }

                      >

                        <i className="fas fa-money-bill-wave me-1"></i>

                        Salary

                      </button>

                    </td>


                    <td>

                      <button

                        type="button"

                        className={

                          `table-btn ${
                            item.isWebsiteVisible
                              ? 'approve-btn'
                              : 'reject-btn'
                          }`

                        }

                        onClick={() =>
                          toggleWebsiteVisibility(
                            item
                          )
                        }

                        disabled={

                          visibilityUpdatingId ===
                          item._id

                        }

                      >

                        {visibilityUpdatingId ===
                        item._id

                          ? 'Please Wait...'

                          : item.isWebsiteVisible

                            ? 'Visible'

                            : 'Hidden'

                        }

                      </button>

                    </td>


                    <td>

                      <div className="d-flex gap-2 flex-wrap">


                        {/* VIEW */}

                        <button

                          type="button"

                          className="table-btn approve-btn"

                          onClick={() =>
                            setViewFaculty(
                              item
                            )
                          }

                        >

                          View

                        </button>


                        {/* EDIT */}

                        <button

                          type="button"

                          className="table-btn approve-btn"

                          onClick={() =>
                            editFaculty(
                              item
                            )
                          }

                        >

                          Edit

                        </button>


                        {/* RESET PASSWORD */}

                        {item.isTeacher === true && (

                          <button

                            type="button"

                            className="table-btn approve-btn"

                            onClick={() => {

                              setResetFaculty(
                                item
                              )

                              setResetPassword('')

                            }}

                          >

                            Reset Password

                          </button>

                        )}


                        {/* DELETE */}

                        <button

                          type="button"

                          className="table-btn reject-btn"

                          onClick={() =>
                            deleteFaculty(
                              item._id
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


      {/* ======================================
          VIEW FACULTY MODAL
      ====================================== */}

      {viewFaculty && (

        <div

          className="modal d-block"

          tabIndex="-1"

          style={{

            backgroundColor:
              'rgba(0,0,0,0.5)',

          }}

        >

          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content">


              {/* HEADER */}

              <div className="modal-header">

                <h5 className="modal-title">

                  Faculty Details

                </h5>


                <button

                  type="button"

                  className="btn-close"

                  onClick={() =>
                    setViewFaculty(null)
                  }

                ></button>

              </div>


              {/* BODY */}

              <div className="modal-body">

                <div className="row g-4">


                  {/* IMAGE */}

                  <div className="col-md-3 text-center">

                    <img

                      src={
                        getImageUrl(
                          viewFaculty.image
                        )
                      }

                      alt={
                        viewFaculty.name
                      }

                      width="160"

                      height="160"

                      style={{

                        objectFit:
                          'cover',

                        borderRadius:
                          '12px',

                      }}

                      onError={(e) => {

                        e.currentTarget.src =
                          '/logo.png'

                      }}

                    />


                    <h5 className="mt-3">

                      {
                        viewFaculty.name
                      }

                    </h5>

                  </div>


                  {/* BASIC */}

                  <div className="col-md-9">

                    <h5 className="fw-bold">

                      Basic Information

                    </h5>

                    <hr />


                    <div className="row">

                      <div className="col-md-6 mb-2">

                        <strong>Name:</strong>{' '}

                        {
                          viewFaculty.name ||
                          '-'
                        }

                      </div>


                      <div className="col-md-6 mb-2">

                        <strong>Designation:</strong>{' '}

                        {
                          viewFaculty.designation ||
                          '-'
                        }

                      </div>


                      <div className="col-md-6 mb-2">

                        <strong>Subject:</strong>{' '}

                        {
                          viewFaculty.subject ||
                          '-'
                        }

                      </div>


                      <div className="col-md-6 mb-2">

                        <strong>Experience:</strong>{' '}

                        {
                          viewFaculty.experience ||
                          '-'
                        }

                      </div>

                    </div>

                  </div>


                  {/* PERSONAL */}

                  <div className="col-12">

                    <h5 className="fw-bold">

                      Personal Information

                    </h5>

                    <hr />


                    <div className="row">

                      <div className="col-md-4 mb-2">

                        <strong>Date of Birth:</strong>{' '}

                        {
                          viewFaculty.dob ||
                          '-'
                        }

                      </div>


                      <div className="col-md-4 mb-2">

                        <strong>Gender:</strong>{' '}

                        {
                          viewFaculty.gender ||
                          '-'
                        }

                      </div>


                      <div className="col-md-4 mb-2">

                        <strong>Aadhaar:</strong>{' '}

                        {
                          viewFaculty.aadharNumber ||
                          '-'
                        }

                      </div>

                    </div>

                  </div>


                  {/* CONTACT */}

                  <div className="col-12">

                    <h5 className="fw-bold">

                      Contact Information

                    </h5>

                    <hr />


                    <div className="row">

                      <div className="col-md-6 mb-2">

                        <strong>Mobile:</strong>{' '}

                        {
                          viewFaculty.phone ||
                          '-'
                        }

                      </div>


                      <div className="col-md-6 mb-2">

                        <strong>Email:</strong>{' '}

                        {
                          viewFaculty.email ||
                          '-'
                        }

                      </div>

                    </div>

                  </div>


                  {/* ADDRESS */}

                  <div className="col-12">

                    <h5 className="fw-bold">

                      Address

                    </h5>

                    <hr />


                    <div className="row">

                      <div className="col-md-6 mb-2">

                        <strong>
                          Permanent Address:
                        </strong>


                        <div className="text-muted">

                          {
                            viewFaculty.permanentAddress ||
                            '-'
                          }

                        </div>

                      </div>


                      <div className="col-md-6 mb-2">

                        <strong>
                          Current Address:
                        </strong>


                        <div className="text-muted">

                          {
                            viewFaculty.currentAddress ||
                            '-'
                          }

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* PROFESSIONAL */}

                  <div className="col-12">

                    <h5 className="fw-bold">

                      Professional Information

                    </h5>

                    <hr />


                    <div className="row">

                      <div className="col-md-6 mb-2">

                        <strong>
                          Qualification:
                        </strong>{' '}

                        {
                          viewFaculty.qualification ||
                          '-'
                        }

                      </div>


                      <div className="col-md-6 mb-2">

                        <strong>
                          Institution:
                        </strong>{' '}

                        {
                          viewFaculty.institution ||
                          '-'
                        }

                      </div>


                      <div className="col-md-6 mb-2">

                        <strong>
                          Joining Date:
                        </strong>{' '}

                        {
                          viewFaculty.joiningDate ||
                          '-'
                        }

                      </div>


                      <div className="col-md-6 mb-2">

                        <strong>
                          Employee ID:
                        </strong>{' '}

                        {
                          viewFaculty.employeeId ||
                          '-'
                        }

                      </div>

                    </div>

                  </div>


                  {/* TEACHER ACCOUNT */}

                  <div className="col-12">

                    <h5 className="fw-bold">

                      Teacher Account

                    </h5>

                    <hr />


                    {viewFaculty.isTeacher === true ? (

                      <div className="row">

                        <div className="col-md-4 mb-2">

                          <strong>
                            Teacher ID:
                          </strong>{' '}

                          {
                            viewFaculty.teacherId ||
                            'Generating...'
                          }

                        </div>


                        <div className="col-md-4 mb-2">

                          <strong>
                            Account Status:
                          </strong>{' '}

                          {
                            viewFaculty.accountStatus ||
                            'Active'
                          }

                        </div>


                        <div className="col-md-4 mb-2">

                          <strong>
                            Password:
                          </strong>{' '}

                          <span className="text-muted">

                            Not displayed

                          </span>

                        </div>

                      </div>

                    ) : (

                      <p className="text-muted">

                        Teacher login is not enabled.

                      </p>

                    )}

                  </div>


                  {/* ==================================
                      ASSIGNED COURSES & BATCHES
                  ================================== */}

                  <div className="col-12">

                    <h5 className="fw-bold">

                      Assigned Courses & Batches

                    </h5>

                    <hr />


                    {Array.isArray(
                      viewFaculty.assignedClasses
                    ) &&

                    viewFaculty.assignedClasses.length > 0 ? (

                      <div className="table-responsive">

                        <table className="table table-bordered table-sm">

                          <thead>

                            <tr>

                              <th>
                                Course
                              </th>

                              <th>
                                Course Code
                              </th>

                              <th>
                                Batch
                              </th>

                            </tr>

                          </thead>


                          <tbody>

                            {viewFaculty.assignedClasses.map(

                              (assignment, index) => {

                                const course =
                                  getAssignedCourse(
                                    assignment
                                  )


                                return (

                                  <tr

                                    key={

                                      `${
                                        assignment.courseId?._id ||
                                        assignment.courseId ||
                                        'course'
                                      }-${index}`

                                    }

                                  >

                                    <td>

                                      {

                                        course?.courseName ||

                                        'Course Not Found'

                                      }

                                    </td>


                                    <td>

                                      {

                                        course?.courseCode ||

                                        '-'

                                      }

                                    </td>


                                    <td>

                                      {

                                        assignment.batchTime ||

                                        '-'

                                      }

                                    </td>

                                  </tr>

                                )

                              }

                            )}

                          </tbody>

                        </table>

                      </div>

                    ) : (

                      <p className="text-muted">

                        No course/batch assigned.

                      </p>

                    )}

                  </div>


                  {/* WEBSITE */}

                  <div className="col-md-6">

                    <h6 className="fw-bold">

                      Website Visibility

                    </h6>


                    <p>

                      {

                        viewFaculty.isWebsiteVisible

                          ? 'Visible on main website'

                          : 'Hidden from main website'

                      }

                    </p>

                  </div>


                  {/* DESCRIPTION */}

                  <div className="col-12">

                    <h5 className="fw-bold">

                      Description

                    </h5>

                    <hr />


                    <p className="text-muted">

                      {
                        viewFaculty.description ||
                        '-'
                      }

                    </p>

                  </div>

                </div>

              </div>


              {/* FOOTER */}

              <div className="modal-footer">

                <button

                  type="button"

                  className="table-btn reject-btn"

                  onClick={() =>
                    setViewFaculty(null)
                  }

                >

                  Close

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ======================================
          RESET PASSWORD MODAL
      ====================================== */}

      {resetFaculty && (

        <div

          className="modal d-block"

          tabIndex="-1"

          style={{

            backgroundColor:
              'rgba(0,0,0,0.5)',

          }}

        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">


              <div className="modal-header">

                <h5 className="modal-title">

                  Reset Teacher Password

                </h5>


                <button

                  type="button"

                  className="btn-close"

                  onClick={() => {

                    if (
                      resettingPassword
                    ) {

                      return

                    }


                    setResetFaculty(
                      null
                    )

                    setResetPassword(
                      ''
                    )

                  }}

                ></button>

              </div>


              <div className="modal-body">

                <p>

                  Teacher:

                  <strong className="ms-1">

                    {
                      resetFaculty.name
                    }

                  </strong>

                </p>


                <p>

                  Teacher ID:

                  <strong className="ms-1">

                    {
                      resetFaculty.teacherId ||
                      'Generating...'
                    }

                  </strong>

                </p>


                <label className="form-label">

                  New Password

                </label>


                <input

                  type="password"

                  className="form-control"

                  value={
                    resetPassword
                  }

                  onChange={(e) =>
                    setResetPassword(
                      e.target.value
                    )
                  }

                  disabled={
                    resettingPassword
                  }

                />

              </div>


              <div className="modal-footer">

                <button

                  type="button"

                  className="table-btn reject-btn"

                  onClick={() => {

                    setResetFaculty(
                      null
                    )

                    setResetPassword(
                      ''
                    )

                  }}

                  disabled={
                    resettingPassword
                  }

                >

                  Cancel

                </button>


                <button

                  type="button"

                  className="table-btn approve-btn"

                  onClick={
                    handleResetPassword
                  }

                  disabled={
                    resettingPassword
                  }

                >

                  {resettingPassword

                    ? 'Please Wait...'

                    : 'Reset Password'

                  }

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ======================================
          SALARY MODAL
      ====================================== */}

      {salaryFaculty && (

        <div

          className="modal d-block"

          tabIndex="-1"

          style={{

            backgroundColor:
              'rgba(0,0,0,0.5)',

          }}

        >

          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

            <div className="modal-content">


              {/* ==================================
                  SALARY HEADER
              ================================== */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title">

                    <i className="fas fa-money-bill-wave me-2"></i>

                    Faculty Salary

                  </h5>


                  <small className="text-muted">

                    {
                      salaryFaculty.name
                    }

                    {' • '}

                    {
                      salaryFaculty.designation
                    }

                  </small>

                </div>


                <button

                  type="button"

                  className="btn-close"

                  onClick={
                    closeSalary
                  }

                ></button>

              </div>


              {/* ==================================
                  SALARY BODY
              ================================== */}

              <div className="modal-body">


                {salaryLoading ? (

                  <div className="text-center py-5">

                    <div
                      className="spinner-border"
                      role="status"
                    />

                    <p className="text-muted mt-3">

                      Loading salary information...

                    </p>

                  </div>

                ) : salaryData ? (

                  <>

                    {/* ==================================
                        MONTHLY SALARY
                    ================================== */}

                    <div className="card border-0 bg-light mb-4">

                      <div className="card-body">

                        <h6 className="fw-bold mb-3">

                          Monthly Salary

                        </h6>


                        <div className="row align-items-end">

                          <div className="col-md-6">

                            <label className="form-label">

                              Monthly Salary Amount

                            </label>


                            <div className="input-group">

                              <span className="input-group-text">

                                ₹

                              </span>


                              <input

                                type="number"

                                className="form-control"

                                min="0"

                                value={
                                  monthlySalaryInput
                                }

                                onChange={(e) =>
                                  setMonthlySalaryInput(
                                    e.target.value
                                  )
                                }

                                disabled={
                                  salaryUpdating
                                }

                              />

                            </div>

                          </div>


                          <div className="col-md-6 mt-3 mt-md-0">

                            <button

                              type="button"

                              className="btn btn-primary"

                              onClick={
                                handleUpdateMonthlySalary
                              }

                              disabled={
                                salaryUpdating
                              }

                            >

                              {salaryUpdating

                                ? 'Updating...'

                                : 'Update Salary'

                              }

                            </button>

                          </div>

                        </div>


                        <small className="text-muted d-block mt-2">

                          Changing the monthly salary will
                          affect new/current salary records.
                          Previous paid records remain unchanged.

                        </small>

                      </div>

                    </div>


                    {/* ==================================
                        CURRENT MONTH
                    ================================== */}

                    <div className="card border mb-4">

                      <div className="card-body">

                        <h6 className="fw-bold mb-3">

                          Current Month

                        </h6>


                        {salaryData.currentMonth?.record ? (

                          <div className="row align-items-center">

                            <div className="col-md-3">

                              <small className="text-muted">

                                Month

                              </small>


                              <div className="fw-semibold">

                                {
                                  getMonthName(

                                    salaryData
                                      .currentMonth
                                      .record
                                      .month

                                  )
                                }

                                {' '}

                                {
                                  salaryData
                                    .currentMonth
                                    .record
                                    .year
                                }

                              </div>

                            </div>


                            <div className="col-md-3">

                              <small className="text-muted">

                                Amount

                              </small>


                              <div className="fw-semibold">

                                {
                                  formatMoney(

                                    salaryData
                                      .currentMonth
                                      .record
                                      .amount

                                  )
                                }

                              </div>

                            </div>


                            <div className="col-md-3">

                              <small className="text-muted">

                                Status

                              </small>


                              <div>

                                {

                                  salaryData
                                    .currentMonth
                                    .record
                                    .status === 'Paid'

                                    ? (

                                      <span className="badge bg-success">

                                        Paid

                                      </span>

                                    )

                                    : (

                                      <span className="badge bg-danger">

                                        Due

                                      </span>

                                    )

                                }

                              </div>

                            </div>


                            <div className="col-md-3 text-md-end mt-3 mt-md-0">

                              {

                                salaryData
                                  .currentMonth
                                  .record
                                  .status === 'Paid'

                                  ? (

                                    <button

                                      type="button"

                                      className="btn btn-outline-danger btn-sm"

                                      onClick={() =>
                                        handleMarkSalaryDue(

                                          salaryData
                                            .currentMonth
                                            .record

                                        )
                                      }

                                    >

                                      Mark as Due

                                    </button>

                                  )

                                  : (

                                    <button

                                      type="button"

                                      className="btn btn-success btn-sm"

                                      onClick={() =>
                                        openPaySalary(

                                          salaryData
                                            .currentMonth
                                            .record

                                        )
                                      }

                                    >

                                      <i className="fas fa-check me-1"></i>

                                      Mark as Paid

                                    </button>

                                  )

                              }

                            </div>

                          </div>

                        ) : (

                          <div className="alert alert-warning mb-0">

                            Current month salary record is not
                            available.

                          </div>

                        )}

                      </div>

                    </div>


                    {/* ==================================
                        SUMMARY
                    ================================== */}

                    <div className="row g-3 mb-4">

                      <div className="col-md-4">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Monthly Salary

                            </small>


                            <h4 className="fw-bold mb-0">

                              {
                                formatMoney(

                                  salaryData
                                    .faculty
                                    ?.monthlySalary

                                )
                              }

                            </h4>

                          </div>

                        </div>

                      </div>


                      <div className="col-md-4">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Total Paid

                            </small>


                            <h4 className="fw-bold text-success mb-0">

                              {
                                formatMoney(

                                  salaryData
                                    .summary
                                    ?.totalPaid

                                )
                              }

                            </h4>

                          </div>

                        </div>

                      </div>


                      <div className="col-md-4">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Total Due

                            </small>


                            <h4 className="fw-bold text-danger mb-0">

                              {
                                formatMoney(

                                  salaryData
                                    .summary
                                    ?.totalDue

                                )
                              }

                            </h4>

                          </div>

                        </div>

                      </div>

                    </div>


                    {/* ==================================
                        SALARY HISTORY
                    ================================== */}

                    <div className="card border">

                      <div className="card-body">

                        <div className="d-flex justify-content-between align-items-center mb-3">

                          <h6 className="fw-bold mb-0">

                            Salary History

                          </h6>


                          <span className="badge bg-secondary">

                            {
                              salaryData
                                .salaryRecords
                                ?.length || 0
                            }

                            {' '}

                            Record(s)

                          </span>

                        </div>


                        {

                          salaryData
                            .salaryRecords
                            ?.length > 0

                            ? (

                              <div className="table-responsive">

                                <table className="table table-bordered table-hover align-middle mb-0">

                                  <thead className="table-light">

                                    <tr>

                                      <th>
                                        #
                                      </th>

                                      <th>
                                        Month
                                      </th>

                                      <th>
                                        Amount
                                      </th>

                                      <th>
                                        Status
                                      </th>

                                      <th>
                                        Payment Date
                                      </th>

                                      <th>
                                        Payment Method
                                      </th>

                                      <th>
                                        Remarks
                                      </th>

                                      <th>
                                        Action
                                      </th>

                                    </tr>

                                  </thead>


                                  <tbody>

                                    {[

                                      ...(salaryData
                                        .salaryRecords || [])

                                    ]

                                      .sort(

                                        (a, b) => {

                                          const dateA =
                                            Number(a.year) *
                                            100 +
                                            Number(a.month)

                                          const dateB =
                                            Number(b.year) *
                                            100 +
                                            Number(b.month)

                                          return (
                                            dateB -
                                            dateA
                                          )

                                        }

                                      )

                                      .map(

                                        (
                                          record,
                                          index
                                        ) => (

                                          <tr

                                            key={

                                              record._id ||

                                              `${record.year}-${record.month}`

                                            }

                                          >

                                            <td>

                                              {
                                                index + 1
                                              }

                                            </td>


                                            <td>

                                              <strong>

                                                {
                                                  getMonthName(
                                                    record.month
                                                  )
                                                }

                                                {' '}

                                                {
                                                  record.year
                                                }

                                              </strong>

                                            </td>


                                            <td>

                                              {
                                                formatMoney(
                                                  record.amount
                                                )
                                              }

                                            </td>


                                            <td>

                                              {record.status ===
                                              'Paid' ? (

                                                <span className="badge bg-success">

                                                  Paid

                                                </span>

                                              ) : (

                                                <span className="badge bg-danger">

                                                  Due

                                                </span>

                                              )}

                                            </td>


                                            <td>

                                              {
                                                formatDate(
                                                  record.paymentDate
                                                )
                                              }

                                            </td>


                                            <td>

                                              {
                                                record.paymentMethod ||
                                                '-'
                                              }

                                            </td>


                                            <td>

                                              {
                                                record.remarks ||
                                                '-'
                                              }

                                            </td>


                                            <td>

                                              {record.status ===
                                              'Paid' ? (

                                                <button

                                                  type="button"

                                                  className="btn btn-outline-danger btn-sm"

                                                  onClick={() =>
                                                    handleMarkSalaryDue(
                                                      record
                                                    )
                                                  }

                                                >

                                                  Mark Due

                                                </button>

                                              ) : (

                                                <button

                                                  type="button"

                                                  className="btn btn-success btn-sm"

                                                  onClick={() =>
                                                    openPaySalary(
                                                      record
                                                    )
                                                  }

                                                >

                                                  Mark Paid

                                                </button>

                                              )}

                                            </td>

                                          </tr>

                                        )

                                      )}

                                  </tbody>

                                </table>

                              </div>

                            )

                            : (

                              <div className="text-center py-4">

                                <div
                                  style={{
                                    fontSize: '40px',
                                  }}
                                >

                                  💰

                                </div>


                                <p className="text-muted mb-0">

                                  No salary records found.

                                </p>

                              </div>

                            )

                        }

                      </div>

                    </div>

                  </>

                ) : (

                  <div className="alert alert-warning">

                    Unable to load salary information.

                  </div>

                )}

              </div>


              {/* ==================================
                  FOOTER
              ================================== */}

              <div className="modal-footer">

                <button

                  type="button"

                  className="table-btn reject-btn"

                  onClick={
                    closeSalary
                  }

                  disabled={

                    salaryUpdating ||
                    salaryPaying

                  }

                >

                  Close

                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* ======================================
          MARK SALARY PAID MODAL
      ====================================== */}

      {paySalaryRecord && (

        <div

          className="modal d-block"

          tabIndex="-1"

          style={{

            backgroundColor:
              'rgba(0,0,0,0.5)',

            zIndex: 1060,

          }}

        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">


              {/* HEADER */}

              <div className="modal-header">

                <h5 className="modal-title">

                  Mark Salary as Paid

                </h5>


                <button

                  type="button"

                  className="btn-close"

                  onClick={() => {

                    if (
                      salaryPaying
                    ) {

                      return

                    }


                    setPaySalaryRecord(
                      null
                    )

                  }}

                ></button>

              </div>


              {/* BODY */}

              <div className="modal-body">

                <div className="alert alert-light border">

                  <div className="d-flex justify-content-between">

                    <span>

                      Faculty

                    </span>


                    <strong>

                      {
                        salaryFaculty?.name
                      }

                    </strong>

                  </div>


                  <div className="d-flex justify-content-between mt-2">

                    <span>

                      Salary Month

                    </span>


                    <strong>

                      {
                        getMonthName(
                          paySalaryRecord.month
                        )
                      }

                      {' '}

                      {
                        paySalaryRecord.year
                      }

                    </strong>

                  </div>


                  <div className="d-flex justify-content-between mt-2">

                    <span>

                      Amount

                    </span>


                    <strong>

                      {
                        formatMoney(
                          paySalaryRecord.amount
                        )
                      }

                    </strong>

                  </div>

                </div>


                {/* PAYMENT DATE */}

                <div className="mb-3">

                  <label className="form-label">

                    Payment Date

                  </label>


                  <input

                    type="date"

                    className="form-control"

                    value={
                      paymentDate
                    }

                    onChange={(e) =>
                      setPaymentDate(
                        e.target.value
                      )
                    }

                    disabled={
                      salaryPaying
                    }

                  />

                </div>


                {/* PAYMENT METHOD */}

                <div className="mb-3">

                  <label className="form-label">

                    Payment Method

                  </label>


                  <select

                    className="form-select"

                    value={
                      paymentMethod
                    }

                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }

                    disabled={
                      salaryPaying
                    }

                  >

                    <option value="Cash">

                      Cash

                    </option>

                    <option value="Bank Transfer">

                      Bank Transfer

                    </option>

                    <option value="UPI">

                      UPI

                    </option>

                    <option value="Cheque">

                      Cheque

                    </option>

                    <option value="Other">

                      Other

                    </option>

                  </select>

                </div>


                {/* REMARKS */}

                <div className="mb-3">

                  <label className="form-label">

                    Remarks

                  </label>


                  <textarea

                    className="form-control"

                    rows="3"

                    placeholder="Optional remarks..."

                    value={
                      salaryRemarks
                    }

                    onChange={(e) =>
                      setSalaryRemarks(
                        e.target.value
                      )
                    }

                    disabled={
                      salaryPaying
                    }

                  ></textarea>

                </div>

              </div>


              {/* FOOTER */}

              <div className="modal-footer">

                <button

                  type="button"

                  className="table-btn reject-btn"

                  onClick={() =>
                    setPaySalaryRecord(
                      null
                    )
                  }

                  disabled={
                    salaryPaying
                  }

                >

                  Cancel

                </button>


                <button

                  type="button"

                  className="table-btn approve-btn"

                  onClick={
                    handleMarkSalaryPaid
                  }

                  disabled={
                    salaryPaying
                  }

                >

                  {salaryPaying

                    ? 'Saving...'

                    : 'Mark as Paid'

                  }

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}


export default Faculty