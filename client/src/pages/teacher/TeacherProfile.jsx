import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherProfile() {

  // ======================================
  // TEACHER
  // ======================================

  const [teacher, setTeacher] =
    useState(null)


  // ======================================
  // ATTENDANCE VIEW
  // ======================================

  const [showAttendance, setShowAttendance] =
    useState(false)


  const [attendanceType, setAttendanceType] =
    useState('monthly')


  const [attendanceData, setAttendanceData] =
    useState(null)


  // ======================================
  // SALARY DATA
  // ======================================

  const [salaryData, setSalaryData] =
    useState(null)


  const [salaryLoading, setSalaryLoading] =
    useState(false)


  const [salaryError, setSalaryError] =
    useState('')


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  const [attendanceLoading, setAttendanceLoading] =
    useState(false)


  // ======================================
  // ERROR
  // ======================================

  const [error, setError] =
    useState('')


  // ======================================
  // GET TEACHER TOKEN
  // ======================================

  const getToken = () => {

    return localStorage.getItem(
      'teacherToken'
    )

  }


  // ======================================
  // AUTH HEADERS
  // ======================================

  const getHeaders = () => {

    return {

      headers: {

        Authorization:
          `Bearer ${getToken()}`,

      },

    }

  }


  // ======================================
  // LOAD TEACHER
  // ======================================

  useEffect(() => {

    try {

      const storedTeacher =
        JSON.parse(

          localStorage.getItem(
            'teacher'
          ) || 'null'

        )


      setTeacher(
        storedTeacher
      )

    }

    catch (error) {

      console.log(
        'Teacher Profile Error:',
        error
      )

      setTeacher(null)

    }

    finally {

      setLoading(false)

    }

  }, [])


  // ======================================
  // FETCH SALARY
  // ======================================

  const fetchSalary =
    async () => {

      try {

        setSalaryLoading(
          true
        )

        setSalaryError('')


        const response =
          await axios.get(

            `${API_URL}/teacher/salary`,

            getHeaders()

          )


        if (
          response?.data?.success
        ) {

          setSalaryData(
            response.data.salary
          )


          // ==================================
          // UPDATE TEACHER INFORMATION
          // ==================================

          if (
            response.data.teacher
          ) {

            setTeacher(
              (current) => ({

                ...(current || {}),

                ...response.data.teacher,

              })

            )

          }

        }

        else {

          setSalaryData(null)

          setSalaryError(

            response?.data?.message ||

            'Unable to load salary information.'

          )

        }

      }

      catch (error) {

        console.log(

          'Teacher Salary Error:',

          error

        )


        setSalaryData(null)

        setSalaryError(

          error?.response?.data?.message ||

          'Unable to load salary information.'

        )

      }

      finally {

        setSalaryLoading(
          false
        )

      }

    }


  // ======================================
  // LOAD SALARY AFTER PROFILE LOAD
  // ======================================

  useEffect(() => {

    if (!loading) {

      fetchSalary()

    }

  }, [loading])


  // ======================================
  // FETCH ATTENDANCE
  // ======================================

  const fetchAttendance =
    async (type) => {

      try {

        setAttendanceLoading(
          true
        )

        setError('')


        let response


        const now =
          new Date()


        // ==================================
        // DAILY
        // ==================================

        if (
          type === 'daily'
        ) {

          response =
            await axios.get(

              `${API_URL}/teacher/attendance/daily`,

              getHeaders()

            )

        }


        // ==================================
        // MONTHLY
        // ==================================

        else if (
          type === 'monthly'
        ) {

          response =
            await axios.get(

              `${API_URL}/teacher/attendance/monthly`,

              {

                ...getHeaders(),

                params: {

                  year:
                    now.getFullYear(),

                  month:
                    now.getMonth() + 1,

                },

              }

            )

        }


        // ==================================
        // YEARLY
        // ==================================

        else if (
          type === 'yearly'
        ) {

          response =
            await axios.get(

              `${API_URL}/teacher/attendance/yearly`,

              {

                ...getHeaders(),

                params: {

                  year:
                    now.getFullYear(),

                },

              }

            )

        }


        // ==================================
        // RESPONSE
        // ==================================

        if (
          response?.data?.success
        ) {

          setAttendanceData(
            response.data
          )

        }

        else {

          setAttendanceData(null)

          setError(

            response?.data?.message ||

            'Unable to load attendance.'

          )

        }

      }

      catch (error) {

        console.log(

          'Teacher Attendance Error:',

          error

        )


        setAttendanceData(null)

        setError(

          error?.response?.data?.message ||

          'Unable to load attendance.'

        )

      }

      finally {

        setAttendanceLoading(
          false
        )

      }

    }


  // ======================================
  // OPEN ATTENDANCE
  // ======================================

  const openAttendance = () => {

    setShowAttendance(true)

    setAttendanceType('monthly')

    setError('')

  }


  // ======================================
  // CLOSE ATTENDANCE
  // ======================================

  const closeAttendance = () => {

    setShowAttendance(false)

    setAttendanceData(null)

    setError('')

  }


  // ======================================
  // LOAD ATTENDANCE
  // ======================================

  useEffect(() => {

    if (
      showAttendance
    ) {

      fetchAttendance(
        attendanceType
      )

    }

  }, [
    showAttendance,
    attendanceType
  ])


  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate =
    (date) => {

      if (!date) {

        return '-'

      }


      const parts =
        date.split('-')


      if (
        parts.length !== 3
      ) {

        return date

      }


      return `${parts[2]}-${parts[1]}-${parts[0]}`

    }


  // ======================================
  // FORMAT PAYMENT DATE
  // ======================================

  const formatPaymentDate =
    (date) => {

      if (!date) {

        return 'Not Paid'

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

        return 'Not Paid'

      }


      return value.toLocaleDateString(
        'en-IN'
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
  // ATTENDANCE STATUS
  // ======================================

  const getStatusBadge =
    (status) => {

      if (
        status === 'Present'
      ) {

        return 'badge bg-success'

      }


      if (
        status === 'Absent'
      ) {

        return 'badge bg-danger'

      }


      return 'badge bg-secondary'

    }


  // ======================================
  // SALARY STATUS
  // ======================================

  const getSalaryStatusBadge =
    (status) => {

      if (
        status === 'Paid'
      ) {

        return 'badge bg-success'

      }


      if (
        status === 'Due'
      ) {

        return 'badge bg-danger'

      }


      return 'badge bg-secondary'

    }


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div className="text-center py-5">

        <div
          className="spinner-border"
          role="status"
        >

          <span className="visually-hidden">

            Loading...

          </span>

        </div>


        <p className="text-muted mt-3 mb-0">

          Loading profile...

        </p>

      </div>

    )

  }


  // ======================================
  // ATTENDANCE PAGE
  // ======================================

  if (
    showAttendance
  ) {

    return (

      <div>


        {/* ==================================
            ATTENDANCE HEADER
        ================================== */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h2 className="fw-bold mb-1">

              My Attendance

            </h2>


            <p className="text-muted mb-0">

              View your daily, monthly and
              yearly attendance records.

            </p>

          </div>


          <button

            type="button"

            className="btn teacher-profile-back-btn"

            onClick={
              closeAttendance
            }

          >

            <i className="fas fa-arrow-left me-2" />

            Back to Profile

          </button>

        </div>


        {/* ==================================
            ERROR
        ================================== */}

        {error && (

          <div className="alert alert-danger">

            {error}

          </div>

        )}


        {/* ==================================
            ATTENDANCE CARD
        ================================== */}

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4">


            {/* ==================================
                TABS
            ================================== */}

            <div className="d-flex gap-2 flex-wrap mb-4">

              <button

                type="button"

                className={

                  attendanceType === 'daily'

                    ? 'btn teacher-attendance-tab active'

                    : 'btn teacher-attendance-tab'

                }

                onClick={() =>
                  setAttendanceType(
                    'daily'
                  )
                }

              >

                Daily

              </button>


              <button

                type="button"

                className={

                  attendanceType === 'monthly'

                    ? 'btn teacher-attendance-tab active'

                    : 'btn teacher-attendance-tab'

                }

                onClick={() =>
                  setAttendanceType(
                    'monthly'
                  )
                }

              >

                Monthly

              </button>


              <button

                type="button"

                className={

                  attendanceType === 'yearly'

                    ? 'btn teacher-attendance-tab active'

                    : 'btn teacher-attendance-tab'

                }

                onClick={() =>
                  setAttendanceType(
                    'yearly'
                  )
                }

              >

                Yearly

              </button>

            </div>


            {/* ==================================
                ATTENDANCE LOADING
            ================================== */}

            {attendanceLoading ? (

              <div className="text-center py-5">

                <div
                  className="spinner-border"
                  role="status"
                >

                  <span className="visually-hidden">

                    Loading...

                  </span>

                </div>


                <p className="text-muted mt-3 mb-0">

                  Loading attendance...

                </p>

              </div>

            ) : (

              <>


                {/* ==================================
                    DAILY
                ================================== */}

                {attendanceType === 'daily' && (

                  <div>

                    {attendanceData?.records?.length > 0 ? (

                      <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                          <thead className="table-light">

                            <tr>

                              <th>
                                #
                              </th>

                              <th>
                                Date
                              </th>

                              <th>
                                Status
                              </th>

                            </tr>

                          </thead>


                          <tbody>

                            {attendanceData.records.map(

                              (record, index) => (

                                <tr
                                  key={
                                    record._id
                                  }
                                >

                                  <td>

                                    {
                                      index + 1
                                    }

                                  </td>


                                  <td>

                                    {
                                      formatDate(
                                        record.date
                                      )
                                    }

                                  </td>


                                  <td>

                                    <span
                                      className={
                                        getStatusBadge(
                                          record.status
                                        )
                                      }
                                    >

                                      {
                                        record.status
                                      }

                                    </span>

                                  </td>

                                </tr>

                              )

                            )}

                          </tbody>

                        </table>

                      </div>

                    ) : (

                      <div className="text-center py-5">

                        <div
                          style={{
                            fontSize: '44px',
                          }}
                        >

                          📅

                        </div>


                        <h6 className="fw-bold mt-3">

                          No Attendance Records

                        </h6>


                        <p className="text-muted mb-0">

                          No attendance records are
                          available yet.

                        </p>

                      </div>

                    )}

                  </div>

                )}


                {/* ==================================
                    MONTHLY
                ================================== */}

                {attendanceType === 'monthly' && (

                  <div>

                    <div className="row g-3 mb-4">

                      <div className="col-sm-6 col-lg-3">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Present

                            </small>


                            <h4 className="fw-bold text-success mb-0 mt-2">

                              {
                                attendanceData?.summary?.present || 0
                              }

                            </h4>

                          </div>

                        </div>

                      </div>


                      <div className="col-sm-6 col-lg-3">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Absent

                            </small>


                            <h4 className="fw-bold text-danger mb-0 mt-2">

                              {
                                attendanceData?.summary?.absent || 0
                              }

                            </h4>

                          </div>

                        </div>

                      </div>


                      <div className="col-sm-6 col-lg-3">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Total Days

                            </small>


                            <h4 className="fw-bold mb-0 mt-2">

                              {
                                attendanceData?.summary?.total || 0
                              }

                            </h4>

                          </div>

                        </div>

                      </div>


                      <div className="col-sm-6 col-lg-3">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Attendance

                            </small>


                            <h4 className="fw-bold mb-0 mt-2">

                              {
                                attendanceData?.summary?.percentage || 0
                              }%

                            </h4>

                          </div>

                        </div>

                      </div>

                    </div>


                    {attendanceData?.records?.length > 0 ? (

                      <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                          <thead className="table-light">

                            <tr>

                              <th>
                                #
                              </th>

                              <th>
                                Date
                              </th>

                              <th>
                                Status
                              </th>

                            </tr>

                          </thead>


                          <tbody>

                            {attendanceData.records.map(

                              (record, index) => (

                                <tr
                                  key={
                                    record._id
                                  }
                                >

                                  <td>

                                    {
                                      index + 1
                                    }

                                  </td>


                                  <td>

                                    {
                                      formatDate(
                                        record.date
                                      )
                                    }

                                  </td>


                                  <td>

                                    <span
                                      className={
                                        getStatusBadge(
                                          record.status
                                        )
                                      }
                                    >

                                      {
                                        record.status
                                      }

                                    </span>

                                  </td>

                                </tr>

                              )

                            )}

                          </tbody>

                        </table>

                      </div>

                    ) : (

                      <div className="text-center py-4">

                        <p className="text-muted mb-0">

                          No attendance records found
                          for this month.

                        </p>

                      </div>

                    )}

                  </div>

                )}


                {/* ==================================
                    YEARLY
                ================================== */}

                {attendanceType === 'yearly' && (

                  <div>

                    <div className="row g-3 mb-4">

                      <div className="col-sm-6 col-lg-3">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Present

                            </small>


                            <h4 className="fw-bold text-success mb-0 mt-2">

                              {
                                attendanceData?.summary?.present || 0
                              }

                            </h4>

                          </div>

                        </div>

                      </div>


                      <div className="col-sm-6 col-lg-3">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Absent

                            </small>


                            <h4 className="fw-bold text-danger mb-0 mt-2">

                              {
                                attendanceData?.summary?.absent || 0
                              }

                            </h4>

                          </div>

                        </div>

                      </div>


                      <div className="col-sm-6 col-lg-3">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Total Days

                            </small>


                            <h4 className="fw-bold mb-0 mt-2">

                              {
                                attendanceData?.summary?.total || 0
                              }

                            </h4>

                          </div>

                        </div>

                      </div>


                      <div className="col-sm-6 col-lg-3">

                        <div className="card border h-100">

                          <div className="card-body">

                            <small className="text-muted">

                              Attendance

                            </small>


                            <h4 className="fw-bold mb-0 mt-2">

                              {
                                attendanceData?.summary?.percentage || 0
                              }%

                            </h4>

                          </div>

                        </div>

                      </div>

                    </div>


                    {attendanceData?.records?.length > 0 ? (

                      <div className="table-responsive">

                        <table className="table table-hover align-middle mb-0">

                          <thead className="table-light">

                            <tr>

                              <th>
                                #
                              </th>

                              <th>
                                Date
                              </th>

                              <th>
                                Status
                              </th>

                            </tr>

                          </thead>


                          <tbody>

                            {attendanceData.records.map(

                              (record, index) => (

                                <tr
                                  key={
                                    record._id
                                  }
                                >

                                  <td>

                                    {
                                      index + 1
                                    }

                                  </td>


                                  <td>

                                    {
                                      formatDate(
                                        record.date
                                      )
                                    }

                                  </td>


                                  <td>

                                    <span
                                      className={
                                        getStatusBadge(
                                          record.status
                                        )
                                      }
                                    >

                                      {
                                        record.status
                                      }

                                    </span>

                                  </td>

                                </tr>

                              )

                            )}

                          </tbody>

                        </table>

                      </div>

                    ) : (

                      <div className="text-center py-4">

                        <p className="text-muted mb-0">

                          No attendance records found
                          for this year.

                        </p>

                      </div>

                    )}

                  </div>

                )}

              </>

            )}

          </div>

        </div>

      </div>

    )

  }


  // ======================================
  // PROFILE PAGE
  // ======================================

  return (

    <div>


      {/* ==================================
          PAGE HEADER
      ================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          My Profile

        </h2>


        <p className="text-muted mb-0">

          View your teacher profile.

        </p>

      </div>


      {/* ==================================
          MY ATTENDANCE
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center">

            <div>

              <h5 className="fw-bold mb-1">

                My Attendance

              </h5>


              <p className="text-muted mb-0">

                View your daily, monthly and
                yearly attendance records.

              </p>

            </div>


            <button

              type="button"

              className="btn teacher-attendance-view-btn"

              onClick={
                openAttendance
              }

            >

              <i className="fas fa-calendar-check me-2" />

              View Attendance

            </button>

          </div>

        </div>

      </div>


      {/* ==================================
          TEACHER INFORMATION
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          <h5 className="fw-bold mb-4">

            Teacher Information

          </h5>


          {/* ==================================
              PROFILE PHOTO
          ================================== */}

          <div className="mb-4">

            {teacher?.image ? (

              <img

                src={
                  teacher.image
                }

                alt={
                  teacher?.name ||
                  'Teacher'
                }

                style={{

                  width: '110px',

                  height: '110px',

                  objectFit: 'cover',

                  borderRadius: '50%',

                  border:
                    '3px solid #00adb5',

                }}

              />

            ) : (

              <div

                className="d-flex align-items-center justify-content-center"

                style={{

                  width: '110px',

                  height: '110px',

                  borderRadius: '50%',

                  background:
                    '#f1f3f5',

                  fontSize: '42px',

                }}

              >

                👨‍🏫

              </div>

            )}

          </div>


          {/* ==================================
              PROFILE DETAILS
          ================================== */}

          <div className="row g-4">


            {/* NAME */}

            <div className="col-md-6">

              <small className="text-muted">

                Name

              </small>


              <div className="fw-semibold">

                {
                  teacher?.name ||
                  '-'
                }

              </div>

            </div>


            {/* TEACHER ID */}

            <div className="col-md-6">

              <small className="text-muted">

                Teacher ID

              </small>


              <div className="fw-semibold">

                {
                  teacher?.teacherId ||
                  '-'
                }

              </div>

            </div>


            {/* DESIGNATION */}

            <div className="col-md-6">

              <small className="text-muted">

                Designation

              </small>


              <div className="fw-semibold">

                {
                  teacher?.designation ||
                  '-'
                }

              </div>

            </div>


            {/* SUBJECT */}

            <div className="col-md-6">

              <small className="text-muted">

                Subject

              </small>


              <div className="fw-semibold">

                {
                  teacher?.subject ||
                  '-'
                }

              </div>

            </div>


            {/* EXPERIENCE */}

            <div className="col-md-6">

              <small className="text-muted">

                Experience

              </small>


              <div className="fw-semibold">

                {
                  teacher?.experience ||
                  '-'
                }

              </div>

            </div>


            {/* QUALIFICATION */}

            <div className="col-md-6">

              <small className="text-muted">

                Qualification

              </small>


              <div className="fw-semibold">

                {
                  teacher?.qualification ||
                  '-'
                }

              </div>

            </div>


            {/* INSTITUTION */}

            <div className="col-md-6">

              <small className="text-muted">

                Institution

              </small>


              <div className="fw-semibold">

                {
                  teacher?.institution ||
                  '-'
                }

              </div>

            </div>


            {/* JOINING DATE */}

            <div className="col-md-6">

              <small className="text-muted">

                Joining Date

              </small>


              <div className="fw-semibold">

                {
                  teacher?.joiningDate ||
                  '-'
                }

              </div>

            </div>


            {/* EMPLOYEE ID */}

            <div className="col-md-6">

              <small className="text-muted">

                Employee ID

              </small>


              <div className="fw-semibold">

                {
                  teacher?.employeeId ||
                  '-'
                }

              </div>

            </div>


            {/* DOB */}

            <div className="col-md-6">

              <small className="text-muted">

                Date of Birth

              </small>


              <div className="fw-semibold">

                {
                  teacher?.dob ||
                  '-'
                }

              </div>

            </div>


            {/* GENDER */}

            <div className="col-md-6">

              <small className="text-muted">

                Gender

              </small>


              <div className="fw-semibold">

                {
                  teacher?.gender ||
                  '-'
                }

              </div>

            </div>


            {/* PHONE */}

            <div className="col-md-6">

              <small className="text-muted">

                Phone

              </small>


              <div className="fw-semibold">

                {
                  teacher?.phone ||
                  '-'
                }

              </div>

            </div>


            {/* EMAIL */}

            <div className="col-md-6">

              <small className="text-muted">

                Email

              </small>


              <div className="fw-semibold">

                {
                  teacher?.email ||
                  '-'
                }

              </div>

            </div>


            {/* PERMANENT ADDRESS */}

            <div className="col-md-6">

              <small className="text-muted">

                Permanent Address

              </small>


              <div className="fw-semibold">

                {
                  teacher?.permanentAddress ||
                  '-'
                }

              </div>

            </div>


            {/* CURRENT ADDRESS */}

            <div className="col-md-6">

              <small className="text-muted">

                Current Address

              </small>


              <div className="fw-semibold">

                {
                  teacher?.currentAddress ||
                  '-'
                }

              </div>

            </div>


            {/* ASSIGNED CLASSES */}

            <div className="col-12">

              <small className="text-muted">

                Assigned Classes

              </small>


              {teacher?.assignedClasses?.length ? (

                <div className="mt-2">

                  {teacher.assignedClasses.map(

                    (assignment, index) => (

                      <span

                        key={index}

                        className="badge bg-light text-dark border me-2 mb-2"

                      >

                        Batch:{' '}

                        {
                          assignment.batchTime ||
                          '-'
                        }

                      </span>

                    )

                  )}

                </div>

              ) : (

                <div className="fw-semibold">

                  -

                </div>

              )}

            </div>


            {/* DESCRIPTION */}

            <div className="col-12">

              <small className="text-muted">

                Description

              </small>


              <div className="fw-semibold mt-1">

                {
                  teacher?.description ||
                  '-'
                }

              </div>

            </div>


          </div>

        </div>

      </div>


      {/* ======================================
          SALARY INFORMATION
          ↓↓↓ BOTTOM OF PROFILE ↓↓↓
      ====================================== */}

      <div className="card border-0 shadow-sm mt-4 mb-4">

        <div className="card-body p-4">


          {/* ==================================
              SALARY HEADER
          ================================== */}

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                Salary Information

              </h5>


              <p className="text-muted mb-0">

                View your monthly salary and
                payment status.

              </p>

            </div>


            <div
              style={{
                fontSize: '32px',
              }}
            >

              💰

            </div>

          </div>


          {/* ==================================
              SALARY ERROR
          ================================== */}

          {salaryError && (

            <div className="alert alert-danger">

              {salaryError}

            </div>

          )}


          {/* ==================================
              SALARY LOADING
          ================================== */}

          {salaryLoading ? (

            <div className="text-center py-4">

              <div
                className="spinner-border"
                role="status"
              >

                <span className="visually-hidden">

                  Loading...

                </span>

              </div>


              <p className="text-muted mt-3 mb-0">

                Loading salary information...

              </p>

            </div>

          ) : salaryData ? (

            <>


              {/* ==================================
                  SALARY SUMMARY
              ================================== */}

              <div className="row g-3 mb-4">


                {/* MONTHLY SALARY */}

                <div className="col-sm-6 col-lg-4">

                  <div className="card border h-100">

                    <div className="card-body">

                      <small className="text-muted">

                        Monthly Salary

                      </small>


                      <h4 className="fw-bold mb-0 mt-2">

                        {
                          formatMoney(
                            salaryData.monthlySalary
                          )
                        }

                      </h4>

                    </div>

                  </div>

                </div>


                {/* TOTAL PAID */}

                <div className="col-sm-6 col-lg-4">

                  <div className="card border h-100">

                    <div className="card-body">

                      <small className="text-muted">

                        Total Paid

                      </small>


                      <h4 className="fw-bold text-success mb-0 mt-2">

                        {
                          formatMoney(
                            salaryData.summary?.totalPaid
                          )
                        }

                      </h4>

                    </div>

                  </div>

                </div>


                {/* TOTAL DUE */}

                <div className="col-sm-6 col-lg-4">

                  <div className="card border h-100">

                    <div className="card-body">

                      <small className="text-muted">

                        Total Due

                      </small>


                      <h4 className="fw-bold text-danger mb-0 mt-2">

                        {
                          formatMoney(
                            salaryData.summary?.totalDue
                          )
                        }

                      </h4>

                    </div>

                  </div>

                </div>

              </div>


              {/* ==================================
                  CURRENT MONTH
              ================================== */}

              <div className="card border mb-4">

                <div className="card-body p-4">

                  <h6 className="fw-bold mb-3">

                    Current Month Salary

                  </h6>


                  {salaryData.currentMonth?.record ? (

                    <div className="row g-4 align-items-center">


                      {/* MONTH */}

                      <div className="col-md-3">

                        <small className="text-muted">

                          Month

                        </small>


                        <div className="fw-semibold mt-1">

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


                      {/* AMOUNT */}

                      <div className="col-md-3">

                        <small className="text-muted">

                          Amount

                        </small>


                        <div className="fw-semibold mt-1">

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


                      {/* STATUS */}

                      <div className="col-md-3">

                        <small className="text-muted">

                          Status

                        </small>


                        <div className="mt-1">

                          <span

                            className={

                              getSalaryStatusBadge(

                                salaryData
                                  .currentMonth
                                  .record
                                  .status

                              )

                            }

                          >

                            {

                              salaryData
                                .currentMonth
                                .record
                                .status === 'Paid'

                                ? 'Paid'

                                : 'Salary Due'

                            }

                          </span>

                        </div>

                      </div>


                      {/* PAYMENT DATE */}

                      <div className="col-md-3">

                        <small className="text-muted">

                          Payment Date

                        </small>


                        <div className="fw-semibold mt-1">

                          {
                            formatPaymentDate(

                              salaryData
                                .currentMonth
                                .record
                                .paymentDate

                            )
                          }

                        </div>

                      </div>


                      {/* PAYMENT METHOD */}

                      {salaryData
                        .currentMonth
                        .record
                        .status === 'Paid' && (

                        <div className="col-md-6">

                          <small className="text-muted">

                            Payment Method

                          </small>


                          <div className="fw-semibold mt-1">

                            {
                              salaryData
                                .currentMonth
                                .record
                                .paymentMethod ||

                              '-'

                            }

                          </div>

                        </div>

                      )}


                      {/* REMARKS */}

                      {salaryData
                        .currentMonth
                        .record
                        .remarks && (

                        <div className="col-md-6">

                          <small className="text-muted">

                            Remarks

                          </small>


                          <div className="fw-semibold mt-1">

                            {
                              salaryData
                                .currentMonth
                                .record
                                .remarks

                            }

                          </div>

                        </div>

                      )}

                    </div>

                  ) : (

                    <div className="alert alert-warning mb-0">

                      Current month salary record is
                      not available.

                    </div>

                  )}

                </div>

              </div>


              {/* ==================================
                  SALARY HISTORY
              ================================== */}

              <div className="card border">

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-center mb-3">

                    <div>

                      <h6 className="fw-bold mb-1">

                        Salary History

                      </h6>


                      <small className="text-muted">

                        Your previous monthly salary
                        records.

                      </small>

                    </div>


                    <span className="badge bg-secondary">

                      {
                        salaryData.records?.length ||
                        0
                      }

                      {' '}

                      Record(s)

                    </span>

                  </div>


                  {salaryData.records?.length > 0 ? (

                    <div className="table-responsive">

                      <table className="table table-hover align-middle mb-0">

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

                          </tr>

                        </thead>


                        <tbody>

                          {[

                            ...(salaryData.records || [])

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

                                    <span

                                      className={

                                        getSalaryStatusBadge(
                                          record.status
                                        )

                                      }

                                    >

                                      {

                                        record.status ===
                                        'Paid'

                                          ? 'Paid'

                                          : 'Due'

                                      }

                                    </span>

                                  </td>


                                  <td>

                                    {
                                      formatPaymentDate(
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

                                </tr>

                              )

                            )}

                        </tbody>

                      </table>

                    </div>

                  ) : (

                    <div className="text-center py-4">

                      <div
                        style={{
                          fontSize: '42px',
                        }}
                      >

                        💰

                      </div>


                      <h6 className="fw-bold mt-3">

                        No Salary Records

                      </h6>


                      <p className="text-muted mb-0">

                        No salary records are
                        available yet.

                      </p>

                    </div>

                  )}

                </div>

              </div>

            </>

          ) : (

            !salaryError && (

              <div className="text-center py-4">

                <div
                  style={{
                    fontSize: '42px',
                  }}
                >

                  💰

                </div>


                <h6 className="fw-bold mt-3">

                  Salary Information Not Available

                </h6>


                <p className="text-muted mb-0">

                  Salary information has not been
                  added yet.

                </p>

              </div>

            )

          )}

        </div>

      </div>

    </div>

  )

}


export default TeacherProfile