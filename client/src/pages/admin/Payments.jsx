import { useEffect, useState } from 'react'

import {
  getPayments,
  getPaymentRevenue,
  getRevenueReport,
} from '../../services/paymentService'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

import { Line } from 'react-chartjs-2'

import '../../assets/styles/admin.css'


// ======================================
// CHART.JS
// ======================================

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)


function Payments() {

  // ======================================
  // PAYMENTS
  // ======================================

  const [payments, setPayments] =
    useState([])


  // ======================================
  // SEARCH
  // ======================================

  const [searchTerm, setSearchTerm] =
    useState('')


  // ======================================
  // REVENUE
  // ======================================

  const [revenue, setRevenue] =
    useState({

      totalRevenue: 0,
      todayRevenue: 0,
      monthlyRevenue: 0,
      totalPayments: 0,
      todayPayments: 0,
      monthlyPayments: 0,
      registrationRevenue: 0,
      courseFeeRevenue: 0,
      onlineRevenue: 0,

    })


  // ======================================
  // REVENUE REPORT
  // ======================================

  const [revenueReport, setRevenueReport] =
    useState({

      dailyRevenue: [],
      monthlyRevenue: [],

    })


  // ======================================
  // REPORT TYPE
  // ======================================

  const [reportType, setReportType] =
    useState('daily')


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  // ======================================
  // PAGINATION
  // ======================================

  const [currentPage, setCurrentPage] =
    useState(1)

  const paymentsPerPage = 15


  // ======================================
  // FETCH DATA
  // ======================================

  useEffect(() => {

    fetchData()

  }, [])


  const fetchData = async () => {

    try {

      setLoading(true)


      const [
        paymentResponse,
        revenueResponse,
        reportResponse,
      ] = await Promise.all([

        getPayments(),

        getPaymentRevenue(),

        getRevenueReport(),

      ])


      // ==================================
      // PAYMENTS
      // ==================================

      setPayments(
        Array.isArray(paymentResponse)
          ? paymentResponse
          : []
      )


      // ==================================
      // REVENUE
      // ==================================

      if (
        revenueResponse?.success
      ) {

        setRevenue(
          revenueResponse.revenue || {}
        )

      }


      // ==================================
      // REVENUE REPORT
      // ==================================

      if (
        reportResponse?.success
      ) {

        setRevenueReport({

          dailyRevenue:
            reportResponse.dailyRevenue || [],

          monthlyRevenue:
            reportResponse.monthlyRevenue || [],

        })

      }

    }

    catch (error) {

      console.error(
        'Payment Fetch Error:',
        error
      )

    }

    finally {

      setLoading(false)

    }

  }


  // ======================================
  // FILTER PAYMENTS
  // ======================================

  const filteredPayments =
    payments.filter((payment) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim()


      if (!search) {

        return true

      }


      return (

        payment.admissionNumber
          ?.toLowerCase()
          .includes(search)

        ||

        payment.studentName
          ?.toLowerCase()
          .includes(search)

        ||

        payment.course
          ?.toLowerCase()
          .includes(search)

      )

    })


  // ======================================
  // PAGINATION
  // ======================================

  const totalPages =
    Math.ceil(
      filteredPayments.length /
      paymentsPerPage
    )


  const startIndex =
    (currentPage - 1) *
    paymentsPerPage


  const currentPayments =
    filteredPayments.slice(
      startIndex,
      startIndex + paymentsPerPage
    )


  // ======================================
  // CURRENCY
  // ======================================

  const formatCurrency =
    (amount) =>
      `₹ ${Number(
        amount || 0
      ).toLocaleString('en-IN')}`


  // ======================================
  // DATE
  // ======================================

  const formatDate =
    (date) => {

      if (!date) {

        return '-'

      }


      return new Date(date)
        .toLocaleDateString(
          'en-IN'
        )

    }


  // ======================================
  // SEARCH HANDLER
  // ======================================

  const handleSearch = (e) => {

    setSearchTerm(
      e.target.value
    )

    setCurrentPage(1)

  }


  // ======================================
  // CURRENT REPORT
  // ======================================

  const currentReport =
    reportType === 'daily'
      ? revenueReport.dailyRevenue
      : revenueReport.monthlyRevenue


  // ======================================
  // CHART LABELS
  // ======================================

  const chartLabels =
    currentReport.map((item) => {

      if (
        reportType === 'daily'
      ) {

        return `${item._id.day}/${item._id.month}`

      }


      return `${item._id.month}/${item._id.year}`

    })


  // ======================================
  // CHART VALUES
  // ======================================

  const chartValues =
    currentReport.map(
      (item) =>
        Number(item.revenue || 0)
    )


  // ======================================
  // CHART DATA
  // ======================================

  const chartData = {

    labels:
      chartLabels,

    datasets: [

      {

        label:
          reportType === 'daily'
            ? 'Daily Revenue'
            : 'Monthly Revenue',

        data:
          chartValues,

        tension: 0.3,

      },

    ],

  }


  // ======================================
  // CHART OPTIONS
  // ======================================

  const chartOptions = {

    responsive: true,

    maintainAspectRatio: false,

    plugins: {

      legend: {
        display: true,
      },

    },

    scales: {

      y: {

        beginAtZero: true,

        ticks: {

          callback: (value) =>
            `₹ ${Number(
              value
            ).toLocaleString('en-IN')}`,

        },

      },

    },

  }


  // ======================================
  // PAGE CHANGE
  // ======================================

  const goToPage = (page) => {

    if (
      page < 1 ||
      page > totalPages
    ) {

      return

    }


    setCurrentPage(page)

  }


  // ======================================
  // PAGE NUMBERS
  // ======================================

  const pageNumbers =
    Array.from(
      {
        length: totalPages,
      },
      (_, index) =>
        index + 1
    )


  return (

    <div className="applications-section">


      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="applications-header">

        <h2>
          Payment & Revenue Management
        </h2>

        <p>
          Monitor payments and track institute revenue.
        </p>

      </div>


      {/* ====================================== */}
      {/* REVENUE CARDS */}
      {/* ====================================== */}

      <div className="row g-4 mb-5">


        {/* TOTAL */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <p className="text-muted mb-2">
                Total Revenue
              </p>

              <h3 className="fw-bold text-success">
                {formatCurrency(
                  revenue.totalRevenue
                )}
              </h3>

              <small className="text-muted">
                All successful payments
              </small>

            </div>

          </div>

        </div>


        {/* TODAY */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <p className="text-muted mb-2">
                Today's Revenue
              </p>

              <h3 className="fw-bold text-primary">
                {formatCurrency(
                  revenue.todayRevenue
                )}
              </h3>

              <small className="text-muted">
                {revenue.todayPayments || 0}
                {' '}
                payment(s) today
              </small>

            </div>

          </div>

        </div>


        {/* MONTH */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <p className="text-muted mb-2">
                This Month
              </p>

              <h3 className="fw-bold text-warning">
                {formatCurrency(
                  revenue.monthlyRevenue
                )}
              </h3>

              <small className="text-muted">
                {revenue.monthlyPayments || 0}
                {' '}
                payment(s) this month
              </small>

            </div>

          </div>

        </div>


        {/* PAYMENTS */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <p className="text-muted mb-2">
                Total Payments
              </p>

              <h3 className="fw-bold">
                {revenue.totalPayments || 0}
              </h3>

              <small className="text-muted">
                Successful transactions
              </small>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================== */}
      {/* REVENUE BREAKDOWN */}
      {/* ====================================== */}

      <div className="row g-4 mb-5">


        <div className="col-md-4">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <p className="text-muted mb-2">
                Registration Revenue
              </p>

              <h4 className="fw-bold">
                {formatCurrency(
                  revenue.registrationRevenue
                )}
              </h4>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <p className="text-muted mb-2">
                Course Fee Revenue
              </p>

              <h4 className="fw-bold">
                {formatCurrency(
                  revenue.courseFeeRevenue
                )}
              </h4>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <p className="text-muted mb-2">
                Online Revenue
              </p>

              <h4 className="fw-bold">
                {formatCurrency(
                  revenue.onlineRevenue
                )}
              </h4>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================== */}
      {/* REVENUE CHART */}
      {/* ====================================== */}

      <div className="card border-0 shadow-sm mb-5">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

            <div>

              <h5 className="fw-bold mb-1">
                Revenue Report
              </h5>

              <p className="text-muted mb-0">
                Track revenue over time.
              </p>

            </div>


            <div>

              <button
                type="button"
                className={
                  reportType === 'daily'
                    ? 'btn btn-primary me-2'
                    : 'btn btn-outline-primary me-2'
                }
                onClick={() =>
                  setReportType('daily')
                }
              >
                Daily
              </button>


              <button
                type="button"
                className={
                  reportType === 'monthly'
                    ? 'btn btn-primary'
                    : 'btn btn-outline-primary'
                }
                onClick={() =>
                  setReportType('monthly')
                }
              >
                Monthly
              </button>

            </div>

          </div>


          <div
            style={{
              height: '350px',
            }}
          >

            {loading ? (

              <div className="text-center pt-5">
                Loading Revenue...
              </div>

            ) : currentReport.length === 0 ? (

              <div className="text-center pt-5 text-muted">
                No revenue data available.
              </div>

            ) : (

              <Line
                data={chartData}
                options={chartOptions}
              />

            )}

          </div>

        </div>

      </div>


      {/* ====================================== */}
      {/* SEARCH */}
      {/* ====================================== */}

      <div className="mb-3">

        <input
          type="text"
          className="form-control"
          placeholder="Search by Admission Number, Student Name or Course"
          value={searchTerm}
          onChange={handleSearch}
        />

      </div>


      {/* ====================================== */}
      {/* PAYMENT COUNT */}
      {/* ====================================== */}

      <div className="mb-3">

        <small className="text-muted">

          Showing{' '}

          {
            filteredPayments.length === 0
              ? 0
              : startIndex + 1
          }

          {' - '}

          {Math.min(
            startIndex +
              paymentsPerPage,
            filteredPayments.length
          )}

          {' of '}

          {filteredPayments.length}

          {' payments'}

        </small>

      </div>


      {/* ====================================== */}
      {/* PAYMENT TABLE */}
      {/* ====================================== */}

      <div className="table-responsive">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Admission No.</th>

              <th>Student</th>

              <th>Course</th>

              <th>Category</th>

              <th>Amount</th>

              <th>Type</th>

              <th>Mode</th>

              <th>Status</th>

              <th>Date</th>

            </tr>

          </thead>


          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="9"
                  className="text-center"
                >
                  Loading Payments...
                </td>

              </tr>

            ) : currentPayments.length === 0 ? (

              <tr>

                <td
                  colSpan="9"
                  className="text-center"
                >
                  No Payments Found
                </td>

              </tr>

            ) : (

              currentPayments.map(
                (payment) => (

                  <tr
                    key={payment._id}
                  >

                    <td>
                      {
                        payment.admissionNumber ||
                        '-'
                      }
                    </td>

                    <td>
                      {
                        payment.studentName ||
                        '-'
                      }
                    </td>

                    <td>
                      {
                        payment.course ||
                        '-'
                      }
                    </td>

                    <td>
                      {
                        payment.paymentCategory ||
                        '-'
                      }
                    </td>

                    <td>

                      <strong>
                        {formatCurrency(
                          payment.amountPaid
                        )}
                      </strong>

                    </td>

                    <td>
                      {
                        payment.paymentType ||
                        '-'
                      }
                    </td>

                    <td>
                      {
                        payment.paymentMode ||
                        'Online'
                      }
                    </td>

                    <td>

                      <span
                        className={
                          payment.paymentStatus ===
                          'Success'
                            ? 'badge bg-success'
                            : payment.paymentStatus ===
                              'Pending'
                              ? 'badge bg-warning text-dark'
                              : 'badge bg-danger'
                        }
                      >
                        {
                          payment.paymentStatus ||
                          '-'
                        }
                      </span>

                    </td>

                    <td>
                      {formatDate(
                        payment.createdAt
                      )}
                    </td>

                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>


      {/* ====================================== */}
      {/* PAGINATION */}
      {/* ====================================== */}

      {totalPages > 1 && (

        <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">


          <button
            type="button"
            className="btn btn-outline-primary"
            disabled={currentPage === 1}
            onClick={() =>
              goToPage(
                currentPage - 1
              )
            }
          >
            Previous
          </button>


          {pageNumbers.map(
            (page) => (

              <button
                key={page}
                type="button"
                className={
                  currentPage === page
                    ? 'btn btn-primary'
                    : 'btn btn-outline-primary'
                }
                onClick={() =>
                  goToPage(page)
                }
              >
                {page}
              </button>

            )
          )}


          <button
            type="button"
            className="btn btn-outline-primary"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              goToPage(
                currentPage + 1
              )
            }
          >
            Next
          </button>

        </div>

      )}

    </div>

  )

}

export default Payments