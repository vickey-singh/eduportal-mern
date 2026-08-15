import {
  useEffect,
  useState,
} from 'react'


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
// CHART JS
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

  const [
    payments,
    setPayments,
  ] = useState([])


  // ======================================
  // SEARCH
  // ======================================

  const [
    searchTerm,
    setSearchTerm,
  ] = useState('')


  // ======================================
  // REVENUE
  // ======================================

  const [
    revenue,
    setRevenue,
  ] = useState({

    totalRevenue: 0,

    todayRevenue: 0,

    monthlyRevenue: 0,

    totalPayments: 0,

    todayPayments: 0,

    monthlyPayments: 0,

    registrationRevenue: 0,

    courseFeeRevenue: 0,

    onlineRevenue: 0,

    offlineRevenue: 0,

  })


  // ======================================
  // REVENUE REPORT
  // ======================================

  const [
    revenueReport,
    setRevenueReport,
  ] = useState({

    dailyRevenue: [],

    monthlyRevenue: [],

  })


  // ======================================
  // REPORT TYPE
  // ======================================

  const [
    reportType,
    setReportType,
  ] = useState('monthly')


  // ======================================
  // CURRENT DATE
  // ======================================

  const currentDate =
    new Date()


  // ======================================
  // SELECTED MONTH
  // ======================================

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(

    currentDate.getMonth() + 1

  )


  // ======================================
  // SELECTED YEAR
  // ======================================

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(

    currentDate.getFullYear()

  )


  // ======================================
  // LOADING
  // ======================================

  const [
    loading,
    setLoading,
  ] = useState(true)


  // ======================================
  // REVENUE LOADING
  // ======================================

  const [
    revenueLoading,
    setRevenueLoading,
  ] = useState(false)


  // ======================================
  // PAGINATION
  // ======================================

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)


  const paymentsPerPage =
    15


  // ======================================
  // MONTHS
  // ======================================

  const months = [

    {
      value: 1,
      label: 'January',
    },

    {
      value: 2,
      label: 'February',
    },

    {
      value: 3,
      label: 'March',
    },

    {
      value: 4,
      label: 'April',
    },

    {
      value: 5,
      label: 'May',
    },

    {
      value: 6,
      label: 'June',
    },

    {
      value: 7,
      label: 'July',
    },

    {
      value: 8,
      label: 'August',
    },

    {
      value: 9,
      label: 'September',
    },

    {
      value: 10,
      label: 'October',
    },

    {
      value: 11,
      label: 'November',
    },

    {
      value: 12,
      label: 'December',
    },

  ]


  // ======================================
  // YEARS
  // ======================================

  const years = []


  for (

    let year =
      currentDate.getFullYear() - 5;

    year <=
      currentDate.getFullYear() + 1;

    year++

  ) {

    years.push(year)

  }


  // ======================================
  // FETCH PAYMENTS
  // ======================================

  useEffect(() => {

    fetchPayments()

  }, [])


  const fetchPayments =
    async () => {

      try {

        setLoading(true)


        const response =
          await getPayments()


        const paymentList =

          Array.isArray(response)

            ? response

            : Array.isArray(
                response?.payments
              )

              ? response.payments

              : []


        setPayments(
          paymentList
        )

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
  // FETCH REVENUE
  // ======================================

  useEffect(() => {

    fetchRevenue()

  }, [

    reportType,

    selectedMonth,

    selectedYear,

  ])


  const fetchRevenue =
    async () => {

      try {

        setRevenueLoading(true)


        // ==================================
        // REVENUE FILTER
        // ==================================

        const revenueFilters = {}


        // ==================================
        // MONTHLY
        // ==================================

        if (
          reportType === 'monthly'
        ) {

          revenueFilters.month =
            selectedMonth

          revenueFilters.year =
            selectedYear

        }


        // ==================================
        // YEARLY
        // ==================================

        if (
          reportType === 'yearly'
        ) {

          revenueFilters.year =
            selectedYear

        }


        // ==================================
        // GET REVENUE
        // ==================================

        const revenueResponse =
          await getPaymentRevenue(

            revenueFilters

          )


        if (
          revenueResponse?.success
        ) {

          const data =
            revenueResponse.revenue ||
            {}


          setRevenue({

            totalRevenue:
              Number(
                data.totalRevenue || 0
              ),

            todayRevenue:
              Number(
                data.todayRevenue || 0
              ),

            monthlyRevenue:
              Number(
                data.monthlyRevenue || 0
              ),

            totalPayments:
              Number(
                data.totalPayments || 0
              ),

            todayPayments:
              Number(
                data.todayPayments || 0
              ),

            monthlyPayments:
              Number(
                data.monthlyPayments || 0
              ),

            registrationRevenue:
              Number(
                data.registrationRevenue || 0
              ),

            courseFeeRevenue:
              Number(
                data.courseFeeRevenue || 0
              ),

            onlineRevenue:
              Number(
                data.onlineRevenue || 0
              ),

            offlineRevenue:
              Number(
                data.offlineRevenue || 0
              ),

          })

        }


        // ==================================
        // REVENUE REPORT
        // ==================================

        const reportResponse =
          await getRevenueReport({

            year:
              selectedYear,

          })


        if (
          reportResponse?.success
        ) {

          setRevenueReport({

            dailyRevenue:
              reportResponse.dailyRevenue ||
              [],

            monthlyRevenue:
              reportResponse.monthlyRevenue ||
              [],

          })

        }

      }

      catch (error) {

        console.error(

          'Revenue Fetch Error:',

          error

        )

      }

      finally {

        setRevenueLoading(false)

      }

    }


  // ======================================
  // FILTER PAYMENTS
  // ======================================

  const filteredPayments =
    payments.filter(

      (payment) => {

        const search =
          searchTerm
            .toLowerCase()
            .trim()


        if (!search) {

          return true

        }


        return (

          String(
            payment.admissionNumber ||
            ''
          )
            .toLowerCase()
            .includes(search)

          ||

          String(
            payment.studentName ||
            ''
          )
            .toLowerCase()
            .includes(search)

          ||

          String(
            payment.course ||
            ''
          )
            .toLowerCase()
            .includes(search)

        )

      }

    )


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

      startIndex +
        paymentsPerPage

    )


  // ======================================
  // FORMAT CURRENCY
  // ======================================

  const formatCurrency =
    (amount) => {

      return `₹ ${Number(
        amount || 0
      ).toLocaleString(
        'en-IN'
      )}`

    }


  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate =
    (date) => {

      if (!date) {

        return '-'

      }


      return new Date(
        date
      ).toLocaleDateString(
        'en-IN'
      )

    }


  // ======================================
  // SEARCH
  // ======================================

  const handleSearch =
    (e) => {

      setSearchTerm(
        e.target.value
      )

      setCurrentPage(1)

    }


  // ======================================
  // MONTH CHANGE
  // ======================================

  const handleMonthChange =
    (e) => {

      setSelectedMonth(

        Number(
          e.target.value
        )

      )

    }


  // ======================================
  // YEAR CHANGE
  // ======================================

  const handleYearChange =
    (e) => {

      setSelectedYear(

        Number(
          e.target.value
        )

      )

    }


  // ======================================
  // SELECTED MONTH NAME
  // ======================================

  const selectedMonthName =
    months.find(

      (month) =>

        month.value ===
        Number(
          selectedMonth
        )

    )?.label || ''


  // ======================================
  // REPORT DATA
  // ======================================

  let currentReport = []


  if (
    reportType === 'monthly'
  ) {

    currentReport =
      revenueReport.dailyRevenue.filter(

        (item) =>

          Number(
            item._id.month
          ) ===
          Number(
            selectedMonth
          )

          &&

          Number(
            item._id.year
          ) ===
          Number(
            selectedYear
          )

      )

  }


  else if (
    reportType === 'yearly'
  ) {

    currentReport =
      revenueReport.monthlyRevenue.filter(

        (item) =>

          Number(
            item._id.year
          ) ===
          Number(
            selectedYear
          )

      )

  }


  // ======================================
  // CHART LABELS
  // ======================================

  const chartLabels =
    currentReport.map(

      (item) => {

        if (
          reportType === 'monthly'
        ) {

          return String(
            item._id.day
          )

        }


        return months.find(

          (month) =>

            month.value ===
            Number(
              item._id.month
            )

        )?.label || ''

      }

    )


  // ======================================
  // CHART VALUES
  // ======================================

  const chartValues =
    currentReport.map(

      (item) =>

        Number(
          item.revenue || 0
        )

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

          reportType === 'monthly'

            ? `${selectedMonthName} ${selectedYear} Daily Revenue`

            : `${selectedYear} Monthly Revenue`,

        data:
          chartValues,

        tension:
          0.3,

        borderWidth:
          2,

        pointRadius:
          4,

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

          callback:
            (value) =>

              `₹ ${Number(
                value
              ).toLocaleString(
                'en-IN'
              )}`,

        },

      },

    },

  }


  // ======================================
  // PAGE CHANGE
  // ======================================

  const goToPage =
    (page) => {

      if (

        page < 1 ||

        page > totalPages

      ) {

        return

      }


      setCurrentPage(
        page
      )

    }


  // ======================================
  // PAGE NUMBERS
  // ======================================

  const pageNumbers =
    Array.from(

      {

        length:
          totalPages,

      },

      (_, index) =>
        index + 1

    )


  return (

    <div className="applications-section">


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="applications-header">

        <h2>

          Payment & Revenue Management

        </h2>

        <p>

          Monitor payments and track
          institute revenue.

        </p>

      </div>


      {/* ======================================
          REVENUE FILTER
      ====================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="
            d-flex
            justify-content-between
            align-items-center
            flex-wrap
            gap-3
          ">


            <div>

              <h5 className="fw-bold mb-1">

                Revenue Period

              </h5>

              <p className="
                text-muted
                mb-0
              ">

                Select a month or year
                to view revenue.

              </p>

            </div>


            <div className="
              d-flex
              align-items-center
              flex-wrap
              gap-2
            ">


              {/* ==============================
                  MONTHLY
              ============================== */}

              <button

                type="button"

                className={

                  reportType === 'monthly'

                    ? 'btn btn-primary'

                    : 'btn btn-outline-primary'

                }

                onClick={() =>
                  setReportType(
                    'monthly'
                  )
                }

              >

                Monthly

              </button>


              {/* ==============================
                  YEARLY
              ============================== */}

              <button

                type="button"

                className={

                  reportType === 'yearly'

                    ? 'btn btn-primary'

                    : 'btn btn-outline-primary'

                }

                onClick={() =>
                  setReportType(
                    'yearly'
                  )
                }

              >

                Yearly

              </button>


              {/* ==============================
                  MONTH
              ============================== */}

              {reportType === 'monthly' && (

                <select

                  className="form-select"

                  style={{
                    minWidth:
                      '170px',
                  }}

                  value={
                    selectedMonth
                  }

                  onChange={
                    handleMonthChange
                  }

                >

                  {months.map(
                    (month) => (

                      <option

                        key={
                          month.value
                        }

                        value={
                          month.value
                        }

                      >

                        {
                          month.label
                        }

                        {' '}

                        {
                          selectedYear
                        }

                      </option>

                    )
                  )}

                </select>

              )}


              {/* ==============================
                  YEAR
              ============================== */}

              {reportType === 'yearly' && (

                <select

                  className="form-select"

                  style={{
                    minWidth:
                      '120px',
                  }}

                  value={
                    selectedYear
                  }

                  onChange={
                    handleYearChange
                  }

                >

                  {years.map(
                    (year) => (

                      <option

                        key={year}

                        value={year}

                      >

                        {year}

                      </option>

                    )
                  )}

                </select>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          REVENUE CARDS
      ====================================== */}

      <div className="row g-4 mb-5">


        {/* TOTAL REVENUE */}

        <div className="
          col-md-6
          col-xl-3
        ">

          <div className="
            card
            border-0
            shadow-sm
            h-100
          ">

            <div className="card-body">

              <p className="
                text-muted
                mb-2
              ">

                {reportType === 'monthly'

                  ? `${selectedMonthName} ${selectedYear} Revenue`

                  : `${selectedYear} Revenue`

                }

              </p>


              <h3 className="
                fw-bold
                text-success
              ">

                {revenueLoading

                  ? 'Loading...'

                  : formatCurrency(
                      revenue.totalRevenue
                    )

                }

              </h3>


              <small className="
                text-muted
              ">

                Successful payments
                for selected period

              </small>

            </div>

          </div>

        </div>


        {/* TODAY */}

        <div className="
          col-md-6
          col-xl-3
        ">

          <div className="
            card
            border-0
            shadow-sm
            h-100
          ">

            <div className="card-body">

              <p className="
                text-muted
                mb-2
              ">

                Today's Revenue

              </p>


              <h3 className="
                fw-bold
                text-primary
              ">

                {formatCurrency(
                  revenue.todayRevenue
                )}

              </h3>


              <small className="
                text-muted
              ">

                {
                  revenue.todayPayments ||
                  0
                }

                {' '}

                payment(s) today

              </small>

            </div>

          </div>

        </div>


        {/* PERIOD */}

        <div className="
          col-md-6
          col-xl-3
        ">

          <div className="
            card
            border-0
            shadow-sm
            h-100
          ">

            <div className="card-body">

              <p className="
                text-muted
                mb-2
              ">

                {reportType === 'monthly'

                  ? 'Selected Month'

                  : 'Selected Year'

                }

              </p>


              <h3 className="
                fw-bold
                text-warning
              ">

                {formatCurrency(
                  revenue.monthlyRevenue
                )}

              </h3>


              <small className="
                text-muted
              ">

                {
                  revenue.monthlyPayments ||
                  0
                }

                {' '}

                payment(s)

              </small>

            </div>

          </div>

        </div>


        {/* PAYMENTS */}

        <div className="
          col-md-6
          col-xl-3
        ">

          <div className="
            card
            border-0
            shadow-sm
            h-100
          ">

            <div className="card-body">

              <p className="
                text-muted
                mb-2
              ">

                Payments

              </p>


              <h3 className="fw-bold">

                {
                  revenue.totalPayments ||
                  0
                }

              </h3>


              <small className="
                text-muted
              ">

                Successful transactions

              </small>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          REVENUE BREAKDOWN
      ====================================== */}

      <div className="
        row
        g-4
        mb-5
      ">


        {/* REGISTRATION */}

        <div className="
          col-md-6
          col-xl-3
        ">

          <div className="
            card
            border-0
            shadow-sm
            h-100
          ">

            <div className="card-body">

              <p className="
                text-muted
                mb-2
              ">

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


        {/* COURSE FEE */}

        <div className="
          col-md-6
          col-xl-3
        ">

          <div className="
            card
            border-0
            shadow-sm
            h-100
          ">

            <div className="card-body">

              <p className="
                text-muted
                mb-2
              ">

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


        {/* ONLINE */}

        <div className="
          col-md-6
          col-xl-3
        ">

          <div className="
            card
            border-0
            shadow-sm
            h-100
          ">

            <div className="card-body">

              <p className="
                text-muted
                mb-2
              ">

                Online Revenue

              </p>


              <h4 className="
                fw-bold
                text-primary
              ">

                {formatCurrency(
                  revenue.onlineRevenue
                )}

              </h4>


              <small className="
                text-muted
              ">

                Online Payments

              </small>

            </div>

          </div>

        </div>


        {/* OFFLINE */}

        <div className="
          col-md-6
          col-xl-3
        ">

          <div className="
            card
            border-0
            shadow-sm
            h-100
          ">

            <div className="card-body">

              <p className="
                text-muted
                mb-2
              ">

                Offline Revenue

              </p>


              <h4 className="
                fw-bold
                text-success
              ">

                {formatCurrency(
                  revenue.offlineRevenue
                )}

              </h4>


              <small className="
                text-muted
              ">

                Cash / Manual Payments

              </small>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          REVENUE CHART
      ====================================== */}

      <div className="
        card
        border-0
        shadow-sm
        mb-5
      ">

        <div className="card-body">


          <div className="
            d-flex
            justify-content-between
            align-items-center
            flex-wrap
            gap-3
            mb-4
          ">


            <div>

              <h5 className="
                fw-bold
                mb-1
              ">

                Revenue Report

              </h5>


              <p className="
                text-muted
                mb-0
              ">

                {reportType === 'monthly'

                  ? `Daily revenue for ${selectedMonthName} ${selectedYear}`

                  : `Monthly revenue for ${selectedYear}`

                }

              </p>

            </div>

          </div>


          <div
            style={{
              height:
                '350px',
            }}
          >

            {revenueLoading ? (

              <div className="
                text-center
                pt-5
              ">

                Loading Revenue...

              </div>

            ) : currentReport.length === 0 ? (

              <div className="
                text-center
                pt-5
                text-muted
              ">

                No revenue data available
                for this period.

              </div>

            ) : (

              <Line

                data={
                  chartData
                }

                options={
                  chartOptions
                }

              />

            )}

          </div>

        </div>

      </div>


      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="mb-3">

        <input

          type="text"

          className="form-control"

          placeholder="
            Search by Admission Number,
            Student Name or Course
          "

          value={
            searchTerm
          }

          onChange={
            handleSearch
          }

        />

      </div>


      {/* ======================================
          PAYMENT COUNT
      ====================================== */}

      <div className="mb-3">

        <small className="
          text-muted
        ">

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

          {
            filteredPayments.length
          }

          {' payments'}

        </small>

      </div>


      {/* ======================================
          PAYMENT TABLE
      ====================================== */}

      <div className="table-responsive">

        <table className="
          table
          applications-table
        ">

          <thead>

            <tr>

              <th>
                Admission No.
              </th>

              <th>
                Student
              </th>

              <th>
                Course
              </th>

              <th>
                Category
              </th>

              <th>
                Amount
              </th>

              <th>
                Type
              </th>

              <th>
                Mode
              </th>

              <th>
                Status
              </th>

              <th>
                Date
              </th>

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

                (payment) => {

                  const paymentMode =

                    payment.paymentMode

                      ? payment.paymentMode

                      : (

                        String(
                          payment.paymentMethod ||
                          ''
                        )
                          .toLowerCase()
                          .includes(
                            'razorpay'
                          )

                          ? 'Online'

                          : 'Offline'

                      )


                  return (

                    <tr
                      key={
                        payment._id
                      }
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

                        <span

                          className={

                            paymentMode ===
                            'Online'

                              ? 'badge bg-primary'

                              : 'badge bg-success'

                          }

                        >

                          {
                            paymentMode
                          }

                        </span>

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

                }

              )

            )}

          </tbody>

        </table>

      </div>


      {/* ======================================
          PAGINATION
      ====================================== */}

      {totalPages > 1 && (

        <div className="
          d-flex
          justify-content-center
          align-items-center
          gap-2
          mt-4
          flex-wrap
        ">


          <button

            type="button"

            className="
              btn
              btn-outline-primary
            "

            disabled={
              currentPage === 1
            }

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

            className="
              btn
              btn-outline-primary
            "

            disabled={
              currentPage ===
              totalPages
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