import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentReports() {

  // ======================================
  // STUDENT
  // ======================================

  const [student, setStudent] =
    useState(null)


  // ======================================
  // ATTENDANCE
  // ======================================

  const [attendance, setAttendance] =
    useState([])

  const [attendanceSummary, setAttendanceSummary] =
    useState({

      total: 0,

      present: 0,

      absent: 0,

      percentage: 0,

    })


  // ======================================
  // MONTHLY ATTENDANCE
  // ======================================

  const [monthlyAttendance, setMonthlyAttendance] =
    useState([])

  const [monthlySummary, setMonthlySummary] =
    useState({

      total: 0,

      present: 0,

      absent: 0,

      percentage: 0,

    })


  // ======================================
  // YEARLY ATTENDANCE
  // ======================================

  const [yearlyAttendance, setYearlyAttendance] =
    useState([])

  const [yearlySummary, setYearlySummary] =
    useState({

      total: 0,

      present: 0,

      absent: 0,

      percentage: 0,

    })


  const [yearlyMonthlySummary, setYearlyMonthlySummary] =
    useState({})


  // ======================================
  // EXAM REPORT
  // ======================================

  const [examReports, setExamReports] =
    useState([])

  const [examSummary, setExamSummary] =
    useState({

      totalExams: 0,

      passed: 0,

      failed: 0,

      averagePercentage: 0,

    })


  // ======================================
  // UI
  // ======================================

  const [activeTab, setActiveTab] =
    useState('attendance')


  const [attendancePeriod, setAttendancePeriod] =
    useState('daily')


  // ======================================
  // FILTERS
  // ======================================

  const currentDate =
    new Date()


  const [selectedMonth, setSelectedMonth] =
    useState(
      currentDate.getMonth() + 1
    )


  const [selectedMonthYear, setSelectedMonthYear] =
    useState(
      currentDate.getFullYear()
    )


  const [selectedYear, setSelectedYear] =
    useState(
      currentDate.getFullYear()
    )


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  const [attendanceLoading, setAttendanceLoading] =
    useState(false)


  const [examLoading, setExamLoading] =
    useState(false)


  // ======================================
  // ERROR
  // ======================================

  const [error, setError] =
    useState('')


  // ======================================
  // GET TOKEN
  // ======================================

  const getToken = () => {

    return localStorage.getItem(
      'studentToken'
    )

  }


  // ======================================
  // GET STUDENT ID FROM JWT
  // ======================================

  const getStudentId =
    () => {

      try {

        const token =
          getToken()


        if (!token) {

          return ''

        }


        const parts =
          token.split('.')


        if (
          parts.length !== 3
        ) {

          return ''

        }


        const base64 =
          parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')


        const jsonPayload =
          decodeURIComponent(

            atob(base64)
              .split('')
              .map(
                (char) =>
                  '%' +
                  (
                    '00' +
                    char
                      .charCodeAt(0)
                      .toString(16)
                  ).slice(-2)
              )
              .join('')

          )


        const decoded =
          JSON.parse(
            jsonPayload
          )


        return (
          decoded.id || ''
        )

      }

      catch (error) {

        console.log(
          'Student Token Decode Error:',
          error
        )

        return ''

      }

    }


  // ======================================
  // FORMAT MONEY
  // ======================================

  const formatNumber =
    (value) => {

      return Number(
        value || 0
      ).toLocaleString(
        'en-IN'
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
  // MONTH NAME
  // ======================================

  const getMonthName =
    (month) => {

      return new Date(

        2000,

        Number(month) - 1,

        1

      ).toLocaleString(

        'en-IN',

        {

          month: 'long',

        }

      )

    }


  // ======================================
  // ATTENDANCE STATUS CLASS
  // ======================================

  const getAttendanceClass =
    (status) => {

      if (
        status === 'Present'
      ) {

        return 'bg-success'

      }


      if (
        status === 'Absent'
      ) {

        return 'bg-danger'

      }


      return 'bg-secondary'

    }


  // ======================================
  // RESULT CLASS
  // ======================================

  const getResultClass =
    (result) => {

      if (
        result === 'Pass'
      ) {

        return 'bg-success'

      }


      if (
        result === 'Fail'
      ) {

        return 'bg-danger'

      }


      return 'bg-secondary'

    }


  // ======================================
  // GET OVERALL ATTENDANCE
  // ======================================

  const fetchOverallAttendance =
    async (
      studentId,
      token
    ) => {

      try {

        const response =
          await axios.get(

            `${API_URL}/attendance/student/${studentId}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setStudent(
            response.data.student
          )


          setAttendance(
            response.data.attendance ||
            []
          )


          setAttendanceSummary(

            response.data.summary ||

            {

              total: 0,

              present: 0,

              absent: 0,

              percentage: 0,

            }

          )

        }

      }

      catch (error) {

        console.log(

          'Overall Attendance Error:',

          error

        )


        throw error

      }

    }


  // ======================================
  // GET MONTHLY ATTENDANCE
  // ======================================

  const fetchMonthlyAttendance =
    async () => {

      try {

        const token =
          getToken()


        const studentId =
          getStudentId()


        if (
          !token ||
          !studentId
        ) {

          return

        }


        setAttendanceLoading(true)

        setError('')


        const response =
          await axios.get(

            `${API_URL}/attendance/student/${studentId}/monthly`,

            {

              params: {

                year:
                  selectedMonthYear,

                month:
                  selectedMonth,

              },

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setMonthlyAttendance(

            response.data.attendance ||

            []

          )


          setMonthlySummary(

            response.data.summary ||

            {

              total: 0,

              present: 0,

              absent: 0,

              percentage: 0,

            }

          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load monthly attendance.'

          )

        }

      }

      catch (error) {

        console.log(

          'Monthly Attendance Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load monthly attendance.'

        )

      }

      finally {

        setAttendanceLoading(false)

      }

    }


  // ======================================
  // GET YEARLY ATTENDANCE
  // ======================================

  const fetchYearlyAttendance =
    async () => {

      try {

        const token =
          getToken()


        const studentId =
          getStudentId()


        if (
          !token ||
          !studentId
        ) {

          return

        }


        setAttendanceLoading(true)

        setError('')


        const response =
          await axios.get(

            `${API_URL}/attendance/student/${studentId}/yearly`,

            {

              params: {

                year:
                  selectedYear,

              },

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setYearlyAttendance(

            response.data.attendance ||

            []

          )


          setYearlySummary(

            response.data.summary ||

            {

              total: 0,

              present: 0,

              absent: 0,

              percentage: 0,

            }

          )


          setYearlyMonthlySummary(

            response.data.monthlySummary ||

            {}

          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load yearly attendance.'

          )

        }

      }

      catch (error) {

        console.log(

          'Yearly Attendance Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load yearly attendance.'

        )

      }

      finally {

        setAttendanceLoading(false)

      }

    }


  // ======================================
  // GET EXAM REPORT
  // ======================================

  const fetchExamReports =
    async () => {

      try {

        const token =
          getToken()


        if (!token) {

          return

        }


        setExamLoading(true)


        const response =
          await axios.get(

            `${API_URL}/student/reports/exams`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setExamReports(

            response.data.reports ||

            []

          )


          setExamSummary(

            response.data.summary ||

            {

              totalExams: 0,

              passed: 0,

              failed: 0,

              averagePercentage: 0,

            }

          )


          if (
            response.data.student
          ) {

            setStudent(
              response.data.student
            )

          }

        }

        else {

          setError(

            response.data.message ||

            'Unable to load exam reports.'

          )

        }

      }

      catch (error) {

        console.log(

          'Exam Report Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load exam reports.'

        )

      }

      finally {

        setExamLoading(false)

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    const loadReports =
      async () => {

        try {

          setLoading(true)

          setError('')


          const token =
            getToken()


          const studentId =
            getStudentId()


          if (
            !token ||
            !studentId
          ) {

            setError(

              'Student authentication required.'

            )

            return

          }


          await Promise.all([

            fetchOverallAttendance(
              studentId,
              token
            ),

            fetchExamReports(),

          ])

        }

        catch (error) {

          console.log(

            'Student Reports Error:',

            error

          )


          setError(

            error?.response?.data?.message ||

            'Unable to load reports.'

          )

        }

        finally {

          setLoading(false)

        }

      }


    loadReports()

  }, [])


  // ======================================
  // LOAD MONTHLY WHEN SELECTED
  // ======================================

  useEffect(() => {

    if (
      activeTab === 'attendance' &&
      attendancePeriod === 'monthly'
    ) {

      fetchMonthlyAttendance()

    }

  }, [

    activeTab,

    attendancePeriod,

    selectedMonth,

    selectedMonthYear,

  ])


  // ======================================
  // LOAD YEARLY WHEN SELECTED
  // ======================================

  useEffect(() => {

    if (
      activeTab === 'attendance' &&
      attendancePeriod === 'yearly'
    ) {

      fetchYearlyAttendance()

    }

  }, [

    activeTab,

    attendancePeriod,

    selectedYear,

  ])


  // ======================================
  // LOADING SCREEN
  // ======================================

  if (loading) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-5 text-center">

            <div
              style={{
                fontSize: '48px',
              }}
            >

              📊

            </div>


            <h5 className="fw-bold mt-3">

              Reports

            </h5>


            <p className="text-muted mb-4">

              Loading your attendance and academic reports.

            </p>


            <div
              className="spinner-border text-primary"
              role="status"
            >

              <span className="visually-hidden">

                Loading...

              </span>

            </div>

          </div>

        </div>

      </div>

    )

  }


  return (

    <div>


      {/* ==================================
          HEADER
      ================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          Reports

        </h2>


        <p className="text-muted mb-0">

          View your attendance and academic performance.

        </p>

      </div>


      {/* ==================================
          STUDENT COURSE CARD
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <div className="row align-items-center g-3">


            {/* STUDENT */}

            <div className="col-md-5">

              <div className="d-flex align-items-center">

                <div
                  style={{
                    fontSize: '42px',
                    marginRight: '15px',
                  }}
                >

                  🎓

                </div>


                <div>

                  <small className="text-muted">

                    Student

                  </small>


                  <h5 className="fw-bold mb-0">

                    {
                      student?.name ||
                      '-'
                    }

                  </h5>


                  <small className="text-muted">

                    Admission No: {' '}

                    {
                      student?.admissionNumber ||
                      '-'
                    }

                  </small>

                  <br />

                  <small className="text-muted">

                    Roll No: {' '}

                    {
                      student?.rollNumber ||
                      '-'
                    }

                  </small>

                </div>

              </div>

            </div>


            {/* COURSE */}

            <div className="col-md-4">

              <small className="text-muted">

                Course

              </small>


              <div className="fw-semibold">

                {
                  student?.course ||
                  '-'
                }

              </div>

            </div>


            {/* BATCH */}

            <div className="col-md-3">

              <small className="text-muted">

                Batch Time

              </small>


              <div className="fw-semibold">

                {
                  student?.batchTime ||
                  '-'
                }

              </div>

            </div>


          </div>

        </div>

      </div>


      {/* ==================================
          ERROR
      ================================== */}

      {error && (

        <div
          className="alert alert-danger"
          role="alert"
        >

          {error}

        </div>

      )}


      {/* ==================================
          MAIN TABS
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-2">

          <div className="d-flex flex-wrap gap-2">


            <button

              type="button"

              className={

                activeTab === 'attendance'

                  ? 'btn btn-primary'

                  : 'btn btn-outline-primary'

              }

              onClick={() =>
                setActiveTab(
                  'attendance'
                )
              }

            >

              📊 Attendance

            </button>


            <button

              type="button"

              className={

                activeTab === 'exams'

                  ? 'btn btn-primary'

                  : 'btn btn-outline-primary'

              }

              onClick={() =>
                setActiveTab(
                  'exams'
                )
              }

            >

              📝 Exam & Marks

            </button>


            <button

              type="button"

              className={

                activeTab === 'performance'

                  ? 'btn btn-primary'

                  : 'btn btn-outline-primary'

              }

              onClick={() =>
                setActiveTab(
                  'performance'
                )
              }

            >

              📈 Performance

            </button>


          </div>

        </div>

      </div>


      {/* ==================================
          ATTENDANCE TAB
      ================================== */}

      {
        activeTab === 'attendance' && (

          <div>


            {/* ==================================
                ATTENDANCE SUMMARY
            ================================== */}

            <div className="row g-4 mb-4">


              <div className="col-md-3">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body text-center p-4">

                    <div
                      style={{
                        fontSize: '34px',
                      }}
                    >

                      📚

                    </div>


                    <small className="text-muted">

                      Total Classes

                    </small>


                    <h4 className="fw-bold mt-2 mb-0">

                      {
                        attendanceSummary.total
                      }

                    </h4>

                  </div>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body text-center p-4">

                    <div
                      style={{
                        fontSize: '34px',
                      }}
                    >

                      ✅

                    </div>


                    <small className="text-muted">

                      Present

                    </small>


                    <h4 className="fw-bold text-success mt-2 mb-0">

                      {
                        attendanceSummary.present
                      }

                    </h4>

                  </div>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body text-center p-4">

                    <div
                      style={{
                        fontSize: '34px',
                      }}
                    >

                      ❌

                    </div>


                    <small className="text-muted">

                      Absent

                    </small>


                    <h4 className="fw-bold text-danger mt-2 mb-0">

                      {
                        attendanceSummary.absent
                      }

                    </h4>

                  </div>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body text-center p-4">

                    <div
                      style={{
                        fontSize: '34px',
                      }}
                    >

                      📈

                    </div>


                    <small className="text-muted">

                      Attendance %

                    </small>


                    <h4 className="fw-bold text-primary mt-2 mb-0">

                      {
                        attendanceSummary.percentage
                      }%

                    </h4>

                  </div>

                </div>

              </div>


            </div>


            {/* ==================================
                ATTENDANCE PERIOD
            ================================== */}

            <div className="card border-0 shadow-sm mb-4">

              <div className="card-body p-4">


                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">


                  <h5 className="fw-bold mb-0">

                    Attendance Details

                  </h5>


                  <div className="btn-group">


                    <button

                      type="button"

                      className={

                        attendancePeriod === 'daily'

                          ? 'btn btn-primary'

                          : 'btn btn-outline-primary'

                      }

                      onClick={() =>
                        setAttendancePeriod(
                          'daily'
                        )
                      }

                    >

                      Daily

                    </button>


                    <button

                      type="button"

                      className={

                        attendancePeriod === 'monthly'

                          ? 'btn btn-primary'

                          : 'btn btn-outline-primary'

                      }

                      onClick={() =>
                        setAttendancePeriod(
                          'monthly'
                        )
                      }

                    >

                      Monthly

                    </button>


                    <button

                      type="button"

                      className={

                        attendancePeriod === 'yearly'

                          ? 'btn btn-primary'

                          : 'btn btn-outline-primary'

                      }

                      onClick={() =>
                        setAttendancePeriod(
                          'yearly'
                        )
                      }

                    >

                      Yearly

                    </button>


                  </div>


                </div>


                {/* ==================================
                    MONTH FILTER
                ================================== */}

                {
                  attendancePeriod === 'monthly' && (

                    <div className="row g-3 mt-3">

                      <div className="col-md-4">

                        <label className="form-label">

                          Month

                        </label>


                        <select

                          className="form-select"

                          value={
                            selectedMonth
                          }

                          onChange={(event) =>
                            setSelectedMonth(
                              event.target.value
                            )
                          }

                        >

                          {
                            Array.from(
                              {
                                length: 12,
                              },
                              (_, index) => (

                                <option

                                  key={
                                    index + 1
                                  }

                                  value={
                                    index + 1
                                  }

                                >

                                  {
                                    getMonthName(
                                      index + 1
                                    )
                                  }

                                </option>

                              )
                            )
                          }

                        </select>

                      </div>


                      <div className="col-md-4">

                        <label className="form-label">

                          Year

                        </label>


                        <select

                          className="form-select"

                          value={
                            selectedMonthYear
                          }

                          onChange={(event) =>
                            setSelectedMonthYear(
                              event.target.value
                            )
                          }

                        >

                          {
                            Array.from(
                              {
                                length: 6,
                              },
                              (_, index) => {

                                const year =
                                  currentDate.getFullYear() -
                                  index


                                return (

                                  <option

                                    key={
                                      year
                                    }

                                    value={
                                      year
                                    }

                                  >

                                    {year}

                                  </option>

                                )

                              }

                            )
                          }

                        </select>

                      </div>

                    </div>

                  )
                }


                {/* ==================================
                    YEAR FILTER
                ================================== */}

                {
                  attendancePeriod === 'yearly' && (

                    <div className="row g-3 mt-3">

                      <div className="col-md-4">

                        <label className="form-label">

                          Year

                        </label>


                        <select

                          className="form-select"

                          value={
                            selectedYear
                          }

                          onChange={(event) =>
                            setSelectedYear(
                              event.target.value
                            )
                          }

                        >

                          {
                            Array.from(
                              {
                                length: 6,
                              },
                              (_, index) => {

                                const year =
                                  currentDate.getFullYear() -
                                  index


                                return (

                                  <option

                                    key={
                                      year
                                    }

                                    value={
                                      year
                                    }

                                  >

                                    {year}

                                  </option>

                                )

                              }

                            )
                          }

                        </select>

                      </div>

                    </div>

                  )
                }


              </div>

            </div>


            {/* ==================================
                MONTHLY SUMMARY
            ================================== */}

            {
              attendancePeriod === 'monthly' && (

                <div className="row g-4 mb-4">


                  <div className="col-md-3">

                    <div className="card border-0 shadow-sm">

                      <div className="card-body text-center">

                        <small className="text-muted">

                          Total

                        </small>


                        <h5 className="fw-bold mt-2">

                          {
                            monthlySummary.total
                          }

                        </h5>

                      </div>

                    </div>

                  </div>


                  <div className="col-md-3">

                    <div className="card border-0 shadow-sm">

                      <div className="card-body text-center">

                        <small className="text-muted">

                          Present

                        </small>


                        <h5 className="fw-bold text-success mt-2">

                          {
                            monthlySummary.present
                          }

                        </h5>

                      </div>

                    </div>

                  </div>


                  <div className="col-md-3">

                    <div className="card border-0 shadow-sm">

                      <div className="card-body text-center">

                        <small className="text-muted">

                          Absent

                        </small>


                        <h5 className="fw-bold text-danger mt-2">

                          {
                            monthlySummary.absent
                          }

                        </h5>

                      </div>

                    </div>

                  </div>


                  <div className="col-md-3">

                    <div className="card border-0 shadow-sm">

                      <div className="card-body text-center">

                        <small className="text-muted">

                          Percentage

                        </small>


                        <h5 className="fw-bold text-primary mt-2">

                          {
                            monthlySummary.percentage
                          }%

                        </h5>

                      </div>

                    </div>

                  </div>


                </div>

              )
            }


            {/* ==================================
                YEARLY SUMMARY
            ================================== */}

            {
              attendancePeriod === 'yearly' && (

                <div className="row g-4 mb-4">


                  <div className="col-md-3">

                    <div className="card border-0 shadow-sm">

                      <div className="card-body text-center">

                        <small className="text-muted">

                          Total

                        </small>


                        <h5 className="fw-bold mt-2">

                          {
                            yearlySummary.total
                          }

                        </h5>

                      </div>

                    </div>

                  </div>


                  <div className="col-md-3">

                    <div className="card border-0 shadow-sm">

                      <div className="card-body text-center">

                        <small className="text-muted">

                          Present

                        </small>


                        <h5 className="fw-bold text-success mt-2">

                          {
                            yearlySummary.present
                          }

                        </h5>

                      </div>

                    </div>

                  </div>


                  <div className="col-md-3">

                    <div className="card border-0 shadow-sm">

                      <div className="card-body text-center">

                        <small className="text-muted">

                          Absent

                        </small>


                        <h5 className="fw-bold text-danger mt-2">

                          {
                            yearlySummary.absent
                          }

                        </h5>

                      </div>

                    </div>

                  </div>


                  <div className="col-md-3">

                    <div className="card border-0 shadow-sm">

                      <div className="card-body text-center">

                        <small className="text-muted">

                          Percentage

                        </small>


                        <h5 className="fw-bold text-primary mt-2">

                          {
                            yearlySummary.percentage
                          }%

                        </h5>

                      </div>

                    </div>

                  </div>


                </div>

              )
            }


            {/* ==================================
                ATTENDANCE TABLE
            ================================== */}

            <div className="card border-0 shadow-sm">

              <div className="card-body p-4">


                {
                  attendanceLoading

                    ? (

                      <div className="text-center py-5">

                        <div
                          className="spinner-border text-primary"
                          role="status"
                        />

                        <p className="text-muted mt-3 mb-0">

                          Loading attendance...

                        </p>

                      </div>

                    )

                    : (

                      <>

                        {
                          attendancePeriod === 'daily' && (

                            <div className="table-responsive">

                              <table className="table align-middle mb-0">

                                <thead>

                                  <tr>

                                    <th>
                                      Date
                                    </th>

                                    <th>
                                      Course
                                    </th>

                                    <th>
                                      Batch
                                    </th>

                                    <th>
                                      Status
                                    </th>

                                  </tr>

                                </thead>


                                <tbody>

                                  {
                                    attendance.length === 0

                                      ? (

                                        <tr>

                                          <td
                                            colSpan="4"
                                            className="text-center py-5 text-muted"
                                          >

                                            No attendance records found.

                                          </td>

                                        </tr>

                                      )

                                      : (

                                        attendance.map(

                                          (record, index) => (

                                            <tr

                                              key={

                                                record._id ||

                                                index

                                              }

                                            >

                                              <td>

                                                {
                                                  formatDate(
                                                    record.date
                                                  )
                                                }

                                              </td>


                                              <td>

                                                {
                                                  record.course ||
                                                  student?.course ||
                                                  '-'
                                                }

                                              </td>


                                              <td>

                                                {
                                                  record.batchTime ||
                                                  student?.batchTime ||
                                                  '-'
                                                }

                                              </td>


                                              <td>

                                                <span

                                                  className={`badge ${getAttendanceClass(
                                                    record.status
                                                  )}`}

                                                >

                                                  {
                                                    record.status
                                                  }

                                                </span>

                                              </td>

                                            </tr>

                                          )

                                        )

                                      )
                                  }

                                </tbody>

                              </table>

                            </div>

                          )
                        }


                        {
                          attendancePeriod === 'monthly' && (

                            <div className="table-responsive">

                              <table className="table align-middle mb-0">

                                <thead>

                                  <tr>

                                    <th>
                                      Date
                                    </th>

                                    <th>
                                      Status
                                    </th>

                                  </tr>

                                </thead>


                                <tbody>

                                  {
                                    monthlyAttendance.length === 0

                                      ? (

                                        <tr>

                                          <td
                                            colSpan="2"
                                            className="text-center py-5 text-muted"
                                          >

                                            No attendance records found for this month.

                                          </td>

                                        </tr>

                                      )

                                      : (

                                        monthlyAttendance.map(

                                          (record, index) => (

                                            <tr

                                              key={

                                                record._id ||

                                                index

                                              }

                                            >

                                              <td>

                                                {
                                                  formatDate(
                                                    record.date
                                                  )
                                                }

                                              </td>


                                              <td>

                                                <span

                                                  className={`badge ${getAttendanceClass(
                                                    record.status
                                                  )}`}

                                                >

                                                  {
                                                    record.status
                                                  }

                                                </span>

                                              </td>

                                            </tr>

                                          )

                                        )

                                      )
                                  }

                                </tbody>

                              </table>

                            </div>

                          )
                        }


                        {
                          attendancePeriod === 'yearly' && (

                            <>

                              {/* MONTHLY SUMMARY */}

                              <h6 className="fw-bold mb-3">

                                📅 Month-wise Attendance

                              </h6>


                              <div className="table-responsive mb-4">

                                <table className="table align-middle">

                                  <thead>

                                    <tr>

                                      <th>
                                        Month
                                      </th>

                                      <th>
                                        Total
                                      </th>

                                      <th>
                                        Present
                                      </th>

                                      <th>
                                        Absent
                                      </th>

                                      <th>
                                        Percentage
                                      </th>

                                    </tr>

                                  </thead>


                                  <tbody>

                                    {
                                      Object.keys(
                                        yearlyMonthlySummary
                                      ).length === 0

                                        ? (

                                          <tr>

                                            <td
                                              colSpan="5"
                                              className="text-center py-4 text-muted"
                                            >

                                              No yearly attendance records found.

                                            </td>

                                          </tr>

                                        )

                                        : (

                                          Object.keys(
                                            yearlyMonthlySummary
                                          )
                                            .sort()
                                            .map(

                                              (month) => {

                                                const data =
                                                  yearlyMonthlySummary[
                                                    month
                                                  ]


                                                return (

                                                  <tr
                                                    key={
                                                      month
                                                    }
                                                  >

                                                    <td>

                                                      {
                                                        getMonthName(
                                                          Number(
                                                            month.split(
                                                              '-'
                                                            )[1]
                                                          )
                                                        )
                                                      }

                                                    </td>


                                                    <td>

                                                      {
                                                        data.total
                                                      }

                                                    </td>


                                                    <td className="text-success fw-semibold">

                                                      {
                                                        data.present
                                                      }

                                                    </td>


                                                    <td className="text-danger fw-semibold">

                                                      {
                                                        data.absent
                                                      }

                                                    </td>


                                                    <td className="fw-semibold">

                                                      {
                                                        data.percentage
                                                      }%

                                                    </td>

                                                  </tr>

                                                )

                                              }

                                            )

                                        )
                                    }

                                  </tbody>

                                </table>

                              </div>


                              {/* YEARLY RECORDS */}

                              <h6 className="fw-bold mb-3">

                                📋 Attendance Records

                              </h6>


                              <div className="table-responsive">

                                <table className="table align-middle mb-0">

                                  <thead>

                                    <tr>

                                      <th>
                                        Date
                                      </th>

                                      <th>
                                        Status
                                      </th>

                                    </tr>

                                  </thead>


                                  <tbody>

                                    {
                                      yearlyAttendance.length === 0

                                        ? (

                                          <tr>

                                            <td
                                              colSpan="2"
                                              className="text-center py-4 text-muted"
                                            >

                                              No attendance records found.

                                            </td>

                                          </tr>

                                        )

                                        : (

                                          yearlyAttendance.map(

                                            (record, index) => (

                                              <tr

                                                key={

                                                  record._id ||

                                                  index

                                                }

                                              >

                                                <td>

                                                  {
                                                    formatDate(
                                                      record.date
                                                    )
                                                  }

                                                </td>


                                                <td>

                                                  <span

                                                    className={`badge ${getAttendanceClass(
                                                      record.status
                                                    )}`}

                                                  >

                                                    {
                                                      record.status
                                                    }

                                                  </span>

                                                </td>

                                              </tr>

                                            )

                                          )

                                        )
                                    }

                                  </tbody>

                                </table>

                              </div>

                            </>

                          )
                        }

                      </>

                    )

                }

              </div>

            </div>


          </div>

        )
      }


      {/* ==================================
          EXAM & MARKS TAB
      ================================== */}

      {
        activeTab === 'exams' && (

          <div>


            {/* ==================================
                EXAM SUMMARY
            ================================== */}

            <div className="row g-4 mb-4">


              <div className="col-md-3">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body text-center p-4">

                    <div
                      style={{
                        fontSize: '34px',
                      }}
                    >

                      📝

                    </div>


                    <small className="text-muted">

                      Exams

                    </small>


                    <h4 className="fw-bold mt-2">

                      {
                        examSummary.totalExams
                      }

                    </h4>

                  </div>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body text-center p-4">

                    <div
                      style={{
                        fontSize: '34px',
                      }}
                    >

                      ✅

                    </div>


                    <small className="text-muted">

                      Passed

                    </small>


                    <h4 className="fw-bold text-success mt-2">

                      {
                        examSummary.passed
                      }

                    </h4>

                  </div>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body text-center p-4">

                    <div
                      style={{
                        fontSize: '34px',
                      }}
                    >

                      ❌

                    </div>


                    <small className="text-muted">

                      Failed

                    </small>


                    <h4 className="fw-bold text-danger mt-2">

                      {
                        examSummary.failed
                      }

                    </h4>

                  </div>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body text-center p-4">

                    <div
                      style={{
                        fontSize: '34px',
                      }}
                    >

                      📈

                    </div>


                    <small className="text-muted">

                      Average %

                    </small>


                    <h4 className="fw-bold text-primary mt-2">

                      {
                        examSummary.averagePercentage
                      }%

                    </h4>

                  </div>

                </div>

              </div>


            </div>


            {/* ==================================
                EXAM TABLE
            ================================== */}

            <div className="card border-0 shadow-sm">

              <div className="card-body p-4">


                <h5 className="fw-bold mb-4">

                  📝 Exam & Marks

                </h5>


                {
                  examLoading

                    ? (

                      <div className="text-center py-5">

                        <div
                          className="spinner-border text-primary"
                          role="status"
                        />

                        <p className="text-muted mt-3 mb-0">

                          Loading exam reports...

                        </p>

                      </div>

                    )

                    : (

                      <div className="table-responsive">

                        <table className="table align-middle mb-0">

                          <thead>

                            <tr>

                              <th>
                                Exam
                              </th>

                              <th>
                                Subject
                              </th>

                              <th>
                                Date
                              </th>

                              <th>
                                Marks
                              </th>

                              <th>
                                %
                              </th>

                              <th>
                                Result
                              </th>

                              <th>
                                Remarks
                              </th>

                            </tr>

                          </thead>


                          <tbody>

                            {
                              examReports.length === 0

                                ? (

                                  <tr>

                                    <td
                                      colSpan="7"
                                      className="text-center py-5 text-muted"
                                    >

                                      No exam reports available.

                                    </td>

                                  </tr>

                                )

                                : (

                                  examReports.map(

                                    (exam) => (

                                      <tr
                                        key={
                                          exam.examId
                                        }
                                      >

                                        <td>

                                          <div className="fw-semibold">

                                            {
                                              exam.examName
                                            }

                                          </div>


                                          <small className="text-muted">

                                            {
                                              exam.examType
                                            }

                                          </small>

                                        </td>


                                        <td>

                                          {
                                            exam.subject ||
                                            '-'
                                          }

                                        </td>


                                        <td>

                                          {
                                            formatDate(
                                              exam.examDate
                                            )
                                          }

                                        </td>


                                        <td>

                                          {
                                            exam.marksAvailable

                                              ? (

                                                <>

                                                  <strong>

                                                    {
                                                      formatNumber(
                                                        exam.obtainedMarks
                                                      )
                                                    }

                                                  </strong>

                                                  {' / '}

                                                  {
                                                    formatNumber(
                                                      exam.totalMarks
                                                    )
                                                  }

                                                </>

                                              )

                                              : (

                                                <span className="text-muted">

                                                  Marks Pending

                                                </span>

                                              )

                                          }

                                        </td>


                                        <td>

                                          {
                                            exam.percentage !== null

                                              ? (

                                                <strong>

                                                  {
                                                    exam.percentage
                                                  }%

                                                </strong>

                                              )

                                              : (

                                                '-'

                                              )

                                          }

                                        </td>


                                        <td>

                                          <span

                                            className={`badge ${getResultClass(
                                              exam.result
                                            )}`}

                                          >

                                            {
                                              exam.result ||
                                              'Pending'
                                            }

                                          </span>

                                        </td>


                                        <td>

                                          {
                                            exam.remarks ||

                                            '-'
                                          }

                                        </td>

                                      </tr>

                                    )

                                  )

                                )
                            }

                          </tbody>

                        </table>

                      </div>

                    )

                }

              </div>

            </div>


          </div>

        )
      }


      {/* ==================================
          PERFORMANCE TAB
      ================================== */}

      {
        activeTab === 'performance' && (

          <div>


            {/* ==================================
                PERFORMANCE CARDS
            ================================== */}

            <div className="row g-4 mb-4">


              <div className="col-md-4">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body p-4 text-center">

                    <div
                      style={{
                        fontSize: '42px',
                      }}
                    >

                      📊

                    </div>


                    <small className="text-muted">

                      Attendance

                    </small>


                    <h3 className="fw-bold text-primary mt-2">

                      {
                        attendanceSummary.percentage
                      }%

                    </h3>


                    <small className="text-muted">

                      Overall attendance

                    </small>

                  </div>

                </div>

              </div>


              <div className="col-md-4">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body p-4 text-center">

                    <div
                      style={{
                        fontSize: '42px',
                      }}
                    >

                      📝

                    </div>


                    <small className="text-muted">

                      Average Marks

                    </small>


                    <h3 className="fw-bold text-success mt-2">

                      {
                        examSummary.averagePercentage
                      }%

                    </h3>


                    <small className="text-muted">

                      Across completed exams

                    </small>

                  </div>

                </div>

              </div>


              <div className="col-md-4">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body p-4 text-center">

                    <div
                      style={{
                        fontSize: '42px',
                      }}
                    >

                      🏆

                    </div>


                    <small className="text-muted">

                      Exams Passed

                    </small>


                    <h3 className="fw-bold text-success mt-2">

                      {
                        examSummary.passed
                      }

                    </h3>


                    <small className="text-muted">

                      Out of {
                        examSummary.totalExams
                      } completed exams

                    </small>

                  </div>

                </div>

              </div>


            </div>


            {/* ==================================
                PERFORMANCE DETAILS
            ================================== */}

            <div className="card border-0 shadow-sm">

              <div className="card-body p-4">


                <h5 className="fw-bold mb-4">

                  📈 Overall Performance

                </h5>


                <div className="row g-4">


                  <div className="col-md-6">

                    <div className="border rounded p-4 h-100">

                      <h6 className="fw-bold mb-3">

                        📊 Attendance Performance

                      </h6>


                      <div className="d-flex justify-content-between mb-2">

                        <span>

                          Present

                        </span>


                        <strong className="text-success">

                          {
                            attendanceSummary.present
                          }

                        </strong>

                      </div>


                      <div className="d-flex justify-content-between mb-2">

                        <span>

                          Absent

                        </span>


                        <strong className="text-danger">

                          {
                            attendanceSummary.absent
                          }

                        </strong>

                      </div>


                      <div className="d-flex justify-content-between">

                        <span>

                          Attendance %

                        </span>


                        <strong>

                          {
                            attendanceSummary.percentage
                          }%

                        </strong>

                      </div>


                    </div>

                  </div>


                  <div className="col-md-6">

                    <div className="border rounded p-4 h-100">

                      <h6 className="fw-bold mb-3">

                        📝 Academic Performance

                      </h6>


                      <div className="d-flex justify-content-between mb-2">

                        <span>

                          Completed Exams

                        </span>


                        <strong>

                          {
                            examSummary.totalExams
                          }

                        </strong>

                      </div>


                      <div className="d-flex justify-content-between mb-2">

                        <span>

                          Passed

                        </span>


                        <strong className="text-success">

                          {
                            examSummary.passed
                          }

                        </strong>

                      </div>


                      <div className="d-flex justify-content-between mb-2">

                        <span>

                          Failed

                        </span>


                        <strong className="text-danger">

                          {
                            examSummary.failed
                          }

                        </strong>

                      </div>


                      <div className="d-flex justify-content-between">

                        <span>

                          Average %

                        </span>


                        <strong className="text-primary">

                          {
                            examSummary.averagePercentage
                          }%

                        </strong>

                      </div>


                    </div>

                  </div>


                </div>


              </div>

            </div>


          </div>

        )
      }


    </div>

  )

}


export default StudentReports