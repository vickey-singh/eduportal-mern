import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentAttendance() {

  // ======================================
  // VIEW
  // ======================================

  const [view, setView] =
    useState('daily')


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


  // ======================================
  // SUMMARY
  // ======================================

  const [summary, setSummary] =
    useState({

      total: 0,

      present: 0,

      absent: 0,

      percentage: 0,

    })


  // ======================================
  // MONTHLY SUMMARY
  // ======================================

  const [monthlySummary, setMonthlySummary] =
    useState({})


  // ======================================
  // SELECTED MONTH
  // ======================================

  const [selectedMonth, setSelectedMonth] =
    useState(
      new Date().getMonth() + 1
    )


  // ======================================
  // SELECTED YEAR
  // ======================================

  const [selectedYear, setSelectedYear] =
    useState(
      new Date().getFullYear()
    )


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  // ======================================
  // ERROR
  // ======================================

  const [error, setError] =
    useState('')


  // ======================================
  // FETCH ATTENDANCE
  // ======================================

  const fetchAttendance =
    async () => {

      try {

        setLoading(true)

        setError('')


        // ==================================
        // TOKEN
        // ==================================

        const token =
          localStorage.getItem(
            'studentToken'
          )


        if (!token) {

          setError(
            'Student authentication required.'
          )

          return

        }


        // ==================================
        // URL
        // ==================================

        let url =
          `${API_URL}/student/attendance`


        if (
          view === 'monthly'
        ) {

          url =
            `${API_URL}/student/attendance/monthly?year=${selectedYear}&month=${selectedMonth}`

        }


        if (
          view === 'yearly'
        ) {

          url =
            `${API_URL}/student/attendance/yearly?year=${selectedYear}`

        }


        // ==================================
        // API REQUEST
        // ==================================

        const response =
          await axios.get(

            url,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        // ==================================
        // SUCCESS
        // ==================================

        if (
          response.data.success
        ) {

          if (
            response.data.student
          ) {

            setStudent(
              response.data.student
            )

          }


          setSummary(

            response.data.summary ||

            {

              total: 0,

              present: 0,

              absent: 0,

              percentage: 0,

            }

          )


          setAttendance(

            response.data.attendance ||

            []

          )


          setMonthlySummary(

            response.data.monthlySummary ||

            {}

          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load attendance.'

          )

        }

      }

      catch (error) {

        console.log(

          'Student Attendance Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load attendance.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // FETCH ON CHANGE
  // ======================================

  useEffect(() => {

    fetchAttendance()

  }, [

    view,

    selectedMonth,

    selectedYear,

  ])


  // ======================================
  // MONTH NAMES
  // ======================================

  const months = [

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


  // ======================================
  // YEARS
  // ======================================

  const currentYear =
    new Date().getFullYear()


  const years = [

    currentYear - 2,

    currentYear - 1,

    currentYear,

    currentYear + 1,

  ]


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 text-center">


            <div
              style={{
                fontSize: '48px',
              }}
            >

              📝

            </div>


            <h5 className="fw-bold mt-3">

              Attendance

            </h5>


            <p className="text-muted mb-4">

              Your attendance information available here.

            </p>


            <div>

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

      </div>

    )

  }


  // ======================================
  // ERROR
  // ======================================

  if (error) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 text-center">


            <div
              style={{
                fontSize: '48px',
              }}
            >

              📝

            </div>


            <h5 className="fw-bold mt-3">

              Attendance

            </h5>


            <p className="text-muted mb-4">

              Your attendance information available here.

            </p>


            <div
              className="alert alert-danger mb-0"
              role="alert"
            >

              {error}

            </div>


          </div>

        </div>

      </div>

    )

  }


  return (

    <div>

      {/* ==================================
          MAIN CARD
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          {/* ==================================
              ICON + TITLE
          ================================== */}

          <div className="text-center">

            <div
              style={{
                fontSize: '48px',
              }}
            >

              📝

            </div>


            <h5 className="fw-bold mt-3">

              Attendance

            </h5>


            <p className="text-muted mb-4">

              Your attendance information available here.

            </p>

          </div>


          {/* ==================================
              STUDENT INFORMATION
          ================================== */}

          <div className="row g-3 mb-4">


            <div className="col-md-6">

              <small className="text-muted">

                Student Name

              </small>

              <div className="fw-semibold">

                {
                  student?.name ||
                  '-'
                }

              </div>

            </div>


            <div className="col-md-6">

              <small className="text-muted">

                Admission Number

              </small>

              <div className="fw-semibold">

                {
                  student?.admissionNumber ||
                  '-'
                }

              </div>

            </div>

            {/* ==================================
                  ROLL NUMBER
              ================================== */}
              
              <div className="col-md-6">
              
                <small className="text-muted">
              
                  Roll Number
              
                </small>
              
                <div className="fw-semibold">
              
                  {
                    student?.rollNumber ||
                    '-'
                  }
              
                </div>
              
              </div>


            <div className="col-md-6">

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


            <div className="col-md-6">

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


          {/* ==================================
              VIEW BUTTONS
          ================================== */}

          <div className="d-flex flex-wrap gap-2 mb-4">

            <button

              type="button"

              className={

                view === 'daily'

                  ? 'btn btn-primary'

                  : 'btn btn-outline-primary'

              }

              onClick={() =>
                setView('daily')
              }

            >

              Daily

            </button>


            <button

              type="button"

              className={

                view === 'monthly'

                  ? 'btn btn-primary'

                  : 'btn btn-outline-primary'

              }

              onClick={() =>
                setView('monthly')
              }

            >

              Monthly

            </button>


            <button

              type="button"

              className={

                view === 'yearly'

                  ? 'btn btn-primary'

                  : 'btn btn-outline-primary'

              }

              onClick={() =>
                setView('yearly')
              }

            >

              Yearly

            </button>

          </div>


          {/* ==================================
              MONTH / YEAR FILTER
          ================================== */}

          {view === 'monthly' && (

            <div className="row g-3 mb-4">

              <div className="col-md-6">

                <label className="form-label">

                  Month

                </label>

                <select

                  className="form-select"

                  value={
                    selectedMonth
                  }

                  onChange={(e) =>
                    setSelectedMonth(
                      Number(
                        e.target.value
                      )
                    )
                  }

                >

                  {months.map(

                    (
                      month,
                      index
                    ) => (

                      <option

                        key={
                          month
                        }

                        value={
                          index + 1
                        }

                      >

                        {month}

                      </option>

                    )

                  )}

                </select>

              </div>


              <div className="col-md-6">

                <label className="form-label">

                  Year

                </label>

                <select

                  className="form-select"

                  value={
                    selectedYear
                  }

                  onChange={(e) =>
                    setSelectedYear(
                      Number(
                        e.target.value
                      )
                    )
                  }

                >

                  {years.map(

                    (year) => (

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

                  )}

                </select>

              </div>

            </div>

          )}


          {view === 'yearly' && (

            <div className="mb-4">

              <label className="form-label">

                Year

              </label>

              <select

                className="form-select"

                value={
                  selectedYear
                }

                onChange={(e) =>
                  setSelectedYear(
                    Number(
                      e.target.value
                    )
                  )
                }

              >

                {years.map(

                  (year) => (

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

                )}

              </select>

            </div>

          )}


          {/* ==================================
              SUMMARY
          ================================== */}

          <h6 className="fw-bold mb-3">

            {view === 'daily' && 'Attendance Summary'}

            {view === 'monthly' && 'Monthly Summary'}

            {view === 'yearly' && 'Yearly Summary'}

          </h6>


          <div className="row g-3 mb-4">


            {/* TOTAL */}

            <div className="col-md-3 col-6">

              <div className="border rounded p-3 text-center">

                <small className="text-muted">

                  Total Classes

                </small>

                <div className="fs-4 fw-bold">

                  {
                    summary.total
                  }

                </div>

              </div>

            </div>


            {/* PRESENT */}

            <div className="col-md-3 col-6">

              <div className="border rounded p-3 text-center">

                <small className="text-muted">

                  Present

                </small>

                <div className="fs-4 fw-bold">

                  {
                    summary.present
                  }

                </div>

              </div>

            </div>


            {/* ABSENT */}

            <div className="col-md-3 col-6">

              <div className="border rounded p-3 text-center">

                <small className="text-muted">

                  Absent

                </small>

                <div className="fs-4 fw-bold">

                  {
                    summary.absent
                  }

                </div>

              </div>

            </div>


            {/* PERCENTAGE */}

            <div className="col-md-3 col-6">

              <div className="border rounded p-3 text-center">

                <small className="text-muted">

                  Attendance %

                </small>

                <div className="fs-4 fw-bold">

                  {
                    summary.percentage
                  }%

                </div>

              </div>

            </div>


          </div>


          {/* ==================================
              YEARLY MONTHLY SUMMARY
          ================================== */}

          {view === 'yearly' && (

            <>

              <h6 className="fw-bold mb-3">

                Month-wise Attendance

              </h6>


              {
                Object.keys(
                  monthlySummary
                ).length === 0 ? (

                  <div className="alert alert-info">

                    No monthly attendance data
                    available for {selectedYear}.

                  </div>

                ) : (

                  <div className="table-responsive mb-4">

                    <table className="table table-bordered align-middle">

                      <thead className="table-light">

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
                            Attendance %
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {Object.keys(
                          monthlySummary
                        )

                        .sort()

                        .map(

                          (month) => {

                            const data =
                              monthlySummary[
                                month
                              ]


                            const monthNumber =
                              Number(
                                month.substring(
                                  5,
                                  7
                                )
                              )


                            return (

                              <tr
                                key={
                                  month
                                }
                              >

                                <td>

                                  {
                                    months[
                                      monthNumber - 1
                                    ]
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

                          }

                        )}

                      </tbody>

                    </table>

                  </div>

                )

              }

            </>

          )}


          {/* ==================================
              ATTENDANCE HISTORY
          ================================== */}

          <h6 className="fw-bold mb-3">

            {view === 'daily' &&
              'Attendance History'}

            {view === 'monthly' &&
              `${months[selectedMonth - 1]} ${selectedYear} Attendance`}

            {view === 'yearly' &&
              `${selectedYear} Attendance History`}

          </h6>


          {attendance.length === 0 ? (

            <div
              className="alert alert-info text-center mb-0"
            >

              No attendance records available.

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-bordered align-middle">

                <thead className="table-light">

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

                  {attendance.map(

                    (item) => (

                      <tr
                        key={
                          item._id
                        }
                      >

                        <td>

                          {
                            item.date ||
                            '-'
                          }

                        </td>


                        <td>

                          {
                            item.course ||
                            '-'
                          }

                        </td>


                        <td>

                          {
                            item.batchTime ||
                            '-'
                          }

                        </td>


                        <td>

                          {
                            item.status ||
                            '-'
                          }

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            </div>

          )}


        </div>

      </div>


    </div>

  )

}


export default StudentAttendance