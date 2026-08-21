import { useEffect, useState } from 'react'

import { useNavigate, useParams } from 'react-router-dom'

import {
  getStudentAttendance,
  getMonthlyAttendance,
  getYearlyAttendance,
} from '../../services/attendanceService'


function StudentAttendance() {

  // ======================================
  // PARAMS
  // ======================================

  const {
    studentId,
  } = useParams()


  const navigate =
    useNavigate()


  // ======================================
  // STUDENT DATA
  // ======================================

  const [student, setStudent] =
    useState(null)


  // ======================================
  // OVERALL SUMMARY
  // ======================================

  const [summary, setSummary] =
    useState({

      total: 0,

      present: 0,

      absent: 0,

      percentage: 0,

    })


  // ======================================
  // DAILY ATTENDANCE
  // ======================================

  const [dailyAttendance, setDailyAttendance] =
    useState([])


  // ======================================
  // MONTHLY DATA
  // ======================================

  const [monthlySummary, setMonthlySummary] =
    useState(null)


  const [monthlyAttendance, setMonthlyAttendance] =
    useState([])


  // ======================================
  // YEARLY DATA
  // ======================================

  const [yearlySummary, setYearlySummary] =
    useState(null)


  const [yearlyAttendance, setYearlyAttendance] =
    useState([])


  // ======================================
  // ACTIVE TAB
  // ======================================

  const [activeTab, setActiveTab] =
    useState('daily')


  // ======================================
  // MONTH / YEAR
  // ======================================

  const currentDate =
    new Date()


  const [selectedMonth, setSelectedMonth] =
    useState(
      currentDate.getMonth() + 1
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


  // ======================================
  // LOAD STUDENT ATTENDANCE
  // ======================================

  useEffect(() => {

    if (studentId) {

      loadAttendance()

    }

  }, [studentId])


  const loadAttendance = async () => {

    try {

      setLoading(true)


      const response =
        await getStudentAttendance(
          studentId
        )


      setStudent(
        response.student
      )


      setSummary(
        response.summary || {

          total: 0,

          present: 0,

          absent: 0,

          percentage: 0,

        }
      )


      setDailyAttendance(
        response.attendance || []
      )

    }

    catch (error) {

      console.log(
        'Student Attendance Error:',
        error
      )


      alert(

        error.response?.data?.message ||

        'Unable to load attendance'

      )

    }

    finally {

      setLoading(false)

    }

  }


  // ======================================
  // LOAD MONTHLY ATTENDANCE
  // ======================================

  const loadMonthlyAttendance =
    async () => {

      try {

        const response =
          await getMonthlyAttendance(

            studentId,

            selectedYear,

            selectedMonth

          )


        setMonthlySummary(
          response.summary || null
        )


        setMonthlyAttendance(
          response.attendance || []
        )

      }

      catch (error) {

        console.log(
          'Monthly Attendance Error:',
          error
        )


        alert(

          error.response?.data?.message ||

          'Unable to load monthly attendance'

        )

      }

    }


  // ======================================
  // LOAD YEARLY ATTENDANCE
  // ======================================

  const loadYearlyAttendance =
    async () => {

      try {

        const response =
          await getYearlyAttendance(

            studentId,

            selectedYear

          )


        setYearlySummary(
          response.summary || null
        )


        setYearlyAttendance(
          response.attendance || []
        )


        setMonthlySummary(
          response.monthlySummary || {}
        )

      }

      catch (error) {

        console.log(
          'Yearly Attendance Error:',
          error
        )


        alert(

          error.response?.data?.message ||

          'Unable to load yearly attendance'

        )

      }

    }


  // ======================================
  // TAB CHANGE
  // ======================================

  const handleTabChange =
    async (tab) => {

      setActiveTab(
        tab
      )


      if (
        tab === 'monthly'
      ) {

        await loadMonthlyAttendance()

      }


      if (
        tab === 'yearly'
      ) {

        await loadYearlyAttendance()

      }

    }


  // ======================================
  // DATE FORMAT
  // ======================================

  const formatDate = (date) => {

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
  // MONTH NAME
  // ======================================

  const getMonthName =
    (month) => {

      return new Date(
        2000,
        month - 1,
        1
      ).toLocaleString(
        'en-IN',
        {
          month: 'long',
        }
      )

    }


  // ======================================
  // MONTH CHANGE
  // ======================================

  const handleMonthChange =
    async (e) => {

      const month =
        Number(
          e.target.value
        )


      setSelectedMonth(
        month
      )


      try {

        const response =
          await getMonthlyAttendance(

            studentId,

            selectedYear,

            month

          )


        setMonthlySummary(
          response.summary || null
        )


        setMonthlyAttendance(
          response.attendance || []
        )

      }

      catch (error) {

        console.log(
          error
        )

      }

    }


  // ======================================
  // YEAR CHANGE
  // ======================================

  const handleYearChange =
    async (e) => {

      const year =
        Number(
          e.target.value
        )


      setSelectedYear(
        year
      )


      try {

        if (
          activeTab === 'monthly'
        ) {

          const response =
            await getMonthlyAttendance(

              studentId,

              year,

              selectedMonth

            )


          setMonthlySummary(
            response.summary || null
          )


          setMonthlyAttendance(
            response.attendance || []
          )

        }


        if (
          activeTab === 'yearly'
        ) {

          const response =
            await getYearlyAttendance(

              studentId,

              year

            )


          setYearlySummary(
            response.summary || null
          )


          setYearlyAttendance(
            response.attendance || []
          )


          setMonthlySummary(
            response.monthlySummary || {}
          )

        }

      }

      catch (error) {

        console.log(
          error
        )

      }

    }


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div className="applications-section">

        <div className="text-center p-5">

          Loading Attendance...

        </div>

      </div>

    )

  }


  // ======================================
  // STUDENT NOT FOUND
  // ======================================

  if (!student) {

    return (

      <div className="applications-section">

        <div className="alert alert-danger">

          Student attendance not found.

        </div>


        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            navigate(
              '/admin/attendance'
            )
          }
        >

          Back to Attendance

        </button>

      </div>

    )

  }


  return (

    <div className="applications-section">


      {/* ==================================
          HEADER
      ================================== */}

      <div className="applications-header">

        <h2>
          Student Attendance
        </h2>

        <p>
          View daily, monthly and yearly
          attendance.
        </p>

      </div>


      {/* ==================================
          STUDENT INFORMATION
      ================================== */}

      <div className="card p-4 mb-4">

        <div className="row">


          <div className="col-md-3 mb-3">

            <small className="text-muted">
              Student Name
            </small>

            <h5 className="mb-0">

              {
                student.name
              }

            </h5>

          </div>


          <div className="col-md-3 mb-3">

            <small className="text-muted">
              Admission Number
            </small>

            <h5 className="mb-0">

              {
                student.admissionNumber
              }

            </h5>

          </div>

          <div className="col-md-3 mb-3">

            <small className="text-muted">
              Roll Number
            </small>
          
            <h5 className="mb-0">
          
              {
                student.rollNumber ||
                '-'
              }
          
            </h5>
          
          </div>


          <div className="col-md-3 mb-3">

            <small className="text-muted">
              Course
            </small>

            <h5 className="mb-0">

              {
                student.course
              }

            </h5>

          </div>


          <div className="col-md-3 mb-3">

            <small className="text-muted">
              Batch Time
            </small>

            <h5 className="mb-0">

              {
                student.batchTime ||
                '-'
              }

            </h5>

          </div>


        </div>


        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() =>
            navigate(
              '/admin/attendance'
            )
          }
        >

          ← Back to Attendance

        </button>

      </div>


      {/* ==================================
          OVERALL SUMMARY
      ================================== */}

      <div className="row mb-4">


        <div className="col-md-3 mb-3">

          <div className="card p-3 text-center">

            <small className="text-muted">
              Total Classes
            </small>

            <h3>
              {
                summary.total
              }
            </h3>

          </div>

        </div>


        <div className="col-md-3 mb-3">

          <div className="card p-3 text-center">

            <small className="text-muted">
              Present
            </small>

            <h3>
              {
                summary.present
              }
            </h3>

          </div>

        </div>


        <div className="col-md-3 mb-3">

          <div className="card p-3 text-center">

            <small className="text-muted">
              Absent
            </small>

            <h3>
              {
                summary.absent
              }
            </h3>

          </div>

        </div>


        <div className="col-md-3 mb-3">

          <div className="card p-3 text-center">

            <small className="text-muted">
              Attendance
            </small>

            <h3>
              {
                summary.percentage
              }%
            </h3>

          </div>

        </div>


      </div>


      {/* ==================================
          TABS
      ================================== */}

      <div className="mb-4">

        <button
          type="button"
          className={
            activeTab === 'daily'
              ? 'btn btn-primary me-2'
              : 'btn btn-outline-primary me-2'
          }
          onClick={() =>
            handleTabChange(
              'daily'
            )
          }
        >

          Daily

        </button>


        <button
          type="button"
          className={
            activeTab === 'monthly'
              ? 'btn btn-primary me-2'
              : 'btn btn-outline-primary me-2'
          }
          onClick={() =>
            handleTabChange(
              'monthly'
            )
          }
        >

          Monthly

        </button>


        <button
          type="button"
          className={
            activeTab === 'yearly'
              ? 'btn btn-primary'
              : 'btn btn-outline-primary'
          }
          onClick={() =>
            handleTabChange(
              'yearly'
            )
          }
        >

          Yearly

        </button>

      </div>


      {/* ==================================
          DAILY
      ================================== */}

      {activeTab === 'daily' && (

        <div className="card p-4">

          <h5 className="mb-3">

            Daily Attendance

          </h5>


          {dailyAttendance.length === 0 ? (

            <div className="alert alert-info">

              No attendance records found.

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table applications-table">

                <thead>

                  <tr>

                    <th>
                      Date
                    </th>

                    <th>
                      Course
                    </th>

                    <th>
                      Batch Time
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {dailyAttendance.map(
                    (record) => (

                      <tr
                        key={
                          record._id
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
                            record.course
                          }

                        </td>

                        <td>

                          {
                            record.batchTime ||
                            '-'
                          }

                        </td>

                        <td>

                          <span
                            className={
                              record.status ===
                              'Present'

                                ? 'badge bg-success'

                                : 'badge bg-danger'
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

          )}

        </div>

      )}


      {/* ==================================
          MONTHLY
      ================================== */}

      {activeTab === 'monthly' && (

        <div className="card p-4">


          <div className="row mb-4">


            {/* MONTH */}

            <div className="col-md-4">

              <label className="form-label">
                Month
              </label>

              <select
                className="form-control"
                value={
                  selectedMonth
                }
                onChange={
                  handleMonthChange
                }
              >

                {Array.from(
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
                )}

              </select>

            </div>


            {/* YEAR */}

            <div className="col-md-4">

              <label className="form-label">
                Year
              </label>

              <select
                className="form-control"
                value={
                  selectedYear
                }
                onChange={
                  handleYearChange
                }
              >

                {Array.from(
                  {
                    length: 6,
                  },
                  (_, index) => {

                    const year =
                      currentDate.getFullYear() -
                      2 +
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

                        {
                          year
                        }

                      </option>

                    )

                  }
                )}

              </select>

            </div>


          </div>


          {/* MONTH SUMMARY */}

          {monthlySummary && (

            <div className="row mb-4">


              <div className="col-md-3">

                <div className="card p-3 text-center">

                  <small>
                    Total
                  </small>

                  <h4>
                    {
                      monthlySummary.total
                    }
                  </h4>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card p-3 text-center">

                  <small>
                    Present
                  </small>

                  <h4>
                    {
                      monthlySummary.present
                    }
                  </h4>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card p-3 text-center">

                  <small>
                    Absent
                  </small>

                  <h4>
                    {
                      monthlySummary.absent
                    }
                  </h4>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card p-3 text-center">

                  <small>
                    Attendance
                  </small>

                  <h4>
                    {
                      monthlySummary.percentage
                    }%
                  </h4>

                </div>

              </div>


            </div>

          )}


          {/* MONTHLY RECORDS */}

          {monthlyAttendance.length === 0 ? (

            <div className="alert alert-info">

              No attendance records found for this month.

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table applications-table">

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

                  {monthlyAttendance.map(
                    (record) => (

                      <tr
                        key={
                          record._id
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
                            className={
                              record.status ===
                              'Present'

                                ? 'badge bg-success'

                                : 'badge bg-danger'
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

          )}

        </div>

      )}


      {/* ==================================
          YEARLY
      ================================== */}

      {activeTab === 'yearly' && (

        <div className="card p-4">


          {/* YEAR */}

          <div className="row mb-4">

            <div className="col-md-4">

              <label className="form-label">
                Year
              </label>

              <select
                className="form-control"
                value={
                  selectedYear
                }
                onChange={
                  handleYearChange
                }
              >

                {Array.from(
                  {
                    length: 6,
                  },
                  (_, index) => {

                    const year =
                      currentDate.getFullYear() -
                      2 +
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

                        {
                          year
                        }

                      </option>

                    )

                  }
                )}

              </select>

            </div>

          </div>


          {/* YEAR SUMMARY */}

          {yearlySummary && (

            <div className="row mb-4">


              <div className="col-md-3">

                <div className="card p-3 text-center">

                  <small>
                    Total
                  </small>

                  <h4>
                    {
                      yearlySummary.total
                    }
                  </h4>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card p-3 text-center">

                  <small>
                    Present
                  </small>

                  <h4>
                    {
                      yearlySummary.present
                    }
                  </h4>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card p-3 text-center">

                  <small>
                    Absent
                  </small>

                  <h4>
                    {
                      yearlySummary.absent
                    }
                  </h4>

                </div>

              </div>


              <div className="col-md-3">

                <div className="card p-3 text-center">

                  <small>
                    Attendance
                  </small>

                  <h4>
                    {
                      yearlySummary.percentage
                    }%
                  </h4>

                </div>

              </div>


            </div>

          )}


          {/* MONTH-WISE SUMMARY */}

          {monthlySummary &&
            Object.keys(
              monthlySummary
            ).length > 0 && (

              <>

                <h5 className="mb-3">

                  Month-wise Attendance

                </h5>


                <div className="table-responsive">

                  <table className="table applications-table">

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
                          Attendance
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {Object.entries(
                        monthlySummary
                      ).map(
                        ([
                          month,
                          data,
                        ]) => (

                          <tr
                            key={
                              month
                            }
                          >

                            <td>

                              {
                                getMonthName(
                                  Number(
                                    month.substring(
                                      5,
                                      7
                                    )
                                  )
                                )
                              }

                              {' '}

                              {
                                month.substring(
                                  0,
                                  4
                                )
                              }

                            </td>

                            <td>

                              {
                                data.total
                              }

                            </td>

                            <td>

                              {
                                data.present
                              }

                            </td>

                            <td>

                              {
                                data.absent
                              }

                            </td>

                            <td>

                              {
                                data.percentage
                              }%

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </>

            )}


          {/* YEARLY DAILY RECORDS */}

          {yearlyAttendance.length === 0 ? (

            <div className="alert alert-info mt-4">

              No attendance records found for this year.

            </div>

          ) : (

            <>

              <h5 className="mt-4 mb-3">

                Daily Records

              </h5>


              <div className="table-responsive">

                <table className="table applications-table">

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

                    {yearlyAttendance.map(
                      (record) => (

                        <tr
                          key={
                            record._id
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
                              className={
                                record.status ===
                                'Present'

                                  ? 'badge bg-success'

                                  : 'badge bg-danger'
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

            </>

          )}

        </div>

      )}

    </div>

  )

}


export default StudentAttendance