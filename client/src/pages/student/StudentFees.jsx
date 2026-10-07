import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentFees() {

  // ======================================
  // FEES
  // ======================================

  const [fees, setFees] =
    useState(null)


  // ======================================
  // STUDENT
  // ======================================

  const [student, setStudent] =
    useState(null)


  // ======================================
  // COURSE
  // ======================================

  const [course, setCourse] =
    useState(null)


  // ======================================
  // PAYMENT HISTORY
  // ======================================

  const [paymentHistory, setPaymentHistory] =
    useState([])


  // ======================================
  // RECEIPTS
  // ======================================

  const [receipts, setReceipts] =
    useState([])


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  // ======================================
  // PAYMENT LOADING
  // ======================================

  const [paying, setPaying] =
    useState(false)


  // ======================================
  // ERROR
  // ======================================

  const [error, setError] =
    useState('')


  // ======================================
  // SUCCESS
  // ======================================

  const [success, setSuccess] =
    useState('')


  // ======================================
  // PAYMENT AMOUNT
  // ======================================

  const [paymentAmount, setPaymentAmount] =
    useState('')


  // ======================================
  // PAYMENT PLAN
  // ======================================

  const [selectedPlan, setSelectedPlan] =
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
  // FETCH FEES
  // ======================================

  const fetchFees =
    async () => {

      try {

        const token =
          getToken()


        if (!token) {

          setError(
            'Student authentication required.'
          )

          return

        }


        const response =
          await axios.get(

            `${API_URL}/student/fees`,

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


          setFees(
            response.data.fees
          )


          setPaymentHistory(

            response.data.paymentHistory ||

            []

          )


          // ==================================
          // PAYMENT PLAN
          // ==================================

          setSelectedPlan(

            response.data.fees?.paymentPlan ||

            ''

          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load fee information.'

          )

        }

      }

      catch (error) {

        console.log(

          'Student Fees Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load fee information.'

        )

      }

    }


  // ======================================
  // FETCH COURSE
  // ======================================

  const fetchCourse =
    async () => {

      try {

        const token =
          getToken()


        if (!token) {

          return

        }


        const response =
          await axios.get(

            `${API_URL}/student/courses`,

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

          setCourse(
            response.data.course
          )

        }

      }

      catch (error) {

        console.log(

          'Student Course Error:',

          error

        )

      }

    }


  // ======================================
  // FETCH RECEIPTS
  // ======================================

  const fetchReceipts =
    async () => {

      try {

        const token =
          getToken()


        if (!token) {

          return

        }


        const response =
          await axios.get(

            `${API_URL}/student/fees/receipts`,

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

          setReceipts(

            response.data.receipts ||

            []

          )

        }

      }

      catch (error) {

        console.log(

          'Student Receipts Error:',

          error

        )

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    const loadData =
      async () => {

        setLoading(true)

        setError('')


        await Promise.all([

          fetchFees(),

          fetchCourse(),

          fetchReceipts(),

        ])


        setLoading(false)

      }


    loadData()

  }, [])


  // ======================================
  // FORMAT MONEY
  // ======================================

  const formatMoney =
    (amount) => {

      return Number(
        amount || 0
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
  // PAYMENT PLAN LABEL
  // ======================================

  const getPaymentPlanLabel =
    (plan) => {

      switch (plan) {

        case 'monthly':

          return 'Monthly Installment'


        case 'installment':

          return 'Custom Installment'


        case 'full':

          return 'Full Payment'


        default:

          return 'Not Selected'

      }

    }


  // ======================================
  // DUE SUMMARY
  // ======================================
  //
  // Same rule as Admin Fee Due Report:
  //
  // 1. An unpaid installment is Due when
  //    its due date has arrived.
  //
  // 2. Future installments remain Pending.
  //
  // 3. Due Amount = sum of all currently
  //    due unpaid installments.
  //
  // 4. Due Count = number of currently
  //    due installments.
  //
  // 5. Latest Due Date = latest date among
  //    the currently due installments.
  //
  // 6. If nothing is due, show the next
  //    pending installment date.
  //
  // ======================================

  const getDueSummary = () => {

    const remaining =
      Number(
        fees?.remainingFees || 0
      )

    if (
      !fees ||
      remaining <= 0
    ) {

      return {

        dueAmount: 0,

        dueDate: null,

        dueCount: 0,

        hasDue: false,

      }

    }


    // ==================================
    // FULL PAYMENT
    // ==================================

    if (
      fees?.paymentPlan === 'full'
    ) {

      return {

        dueAmount:
          remaining,

        dueDate:
          fees?.dueDate || null,

        dueCount:
          1,

        hasDue:
          remaining > 0,

      }

    }


    const schedule =
      Array.isArray(
        fees?.installmentSchedule
      )
        ? fees.installmentSchedule
        : []


    // ==================================
    // TODAY
    // ==================================

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
    //
    // Do NOT depend only on item.status.
    // The due date is the source of truth.
    // This keeps Student Portal in sync with
    // Fee Due Report even if an old record has
    // a stale "Pending" status.
    //
    // ==================================

    const dueItems =
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


    // ==================================
    // LATEST CURRENT DUE DATE
    // ==================================

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


    if (
      dueItems.length > 0
    ) {

      return {

        dueAmount:
          Math.min(
            dueAmount,
            remaining
          ),

        dueDate:
          latestDueItem?.dueDate ||
          fees?.dueDate ||
          null,

        dueCount:
          dueItems.length,

        hasDue:
          dueAmount > 0,

      }

    }


    // ==================================
    // NEXT PENDING INSTALLMENT
    // ==================================

    const nextPending =
      schedule
        .filter(
          item => {

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

      dueAmount: 0,

      dueDate:
        nextPending?.dueDate ||
        fees?.dueDate ||
        null,

      dueCount: 0,

      hasDue: false,

    }

  }


  const dueSummary =
    getDueSummary()


  // ======================================
  // GET MONTHLY PAYMENT AMOUNT
  // ======================================
  //
  // Priority:
  // 1. monthlyAmount
  // 2. monthlyInstallment
  // 3. First unpaid installment amount
  //
  // IMPORTANT:
  // Due Amount can be ₹2,400 when 3 monthly
  // installments are due, but one monthly
  // payment is only ₹800.
  //
  // ======================================

  const getMonthlyPaymentAmount =
    () => {

      const remaining =
        Number(
          fees?.remainingFees || 0
        )

      if (remaining <= 0) {

        return 0

      }

      const schedule =
        Array.isArray(
          fees?.installmentSchedule
        )
          ? fees.installmentSchedule
          : []

      // IMPORTANT:
      // Use the actual current installment amount first.
      // This keeps Admin monthly adjustments in sync
      // with the Student Portal.
      //
      // Example:
      // Regular monthly fee = ₹1000
      // Half absence adjustment = ₹500
      // Student should pay/show ₹500 for that month.
      const firstUnpaid =
        schedule
          .map(
            item => {

              const amount =
                Number(
                  item?.amount || 0
                )

              const paidAmount =
                Number(
                  item?.paidAmount || 0
                )

              return {

                ...item,

                balance:
                  Math.max(
                    0,
                    amount - paidAmount
                  ),

              }

            }
          )
          .filter(
            item =>
              item.balance > 0 &&
              item.status !== 'Paid' &&
              item.status !== 'Waived'
          )
          .sort(
            (a, b) => {

              const dateA =
                a?.dueDate
                  ? new Date(a.dueDate).getTime()
                  : Infinity

              const dateB =
                b?.dueDate
                  ? new Date(b.dueDate).getTime()
                  : Infinity

              return dateA - dateB

            }
          )[0]

      if (
        firstUnpaid &&
        Number(firstUnpaid.balance) > 0
      ) {

        return Math.min(

          Number(
            firstUnpaid.balance
          ),

          remaining

        )

      }

      // Fallback for older students without a schedule.
      const configuredMonthlyAmount =
        Number(
          fees?.monthlyAmount ||
          fees?.monthlyInstallment ||
          0
        )

      return Math.min(

        configuredMonthlyAmount,

        remaining

      )

    }



  // ======================================
  // GET REQUIRED PAYMENT AMOUNT
  // ======================================

  const getRequiredPaymentAmount =
    () => {

      if (
        !selectedPlan ||
        !fees
      ) {

        return 0

      }

      const remaining =
        Number(
          fees.remainingFees || 0
        )

      if (remaining <= 0) {

        return 0

      }

      // ----------------------------------
      // FULL PAYMENT
      // ----------------------------------

      if (
        selectedPlan === 'full'
      ) {

        return remaining

      }

      // ----------------------------------
      // MONTHLY
      // ----------------------------------
      //
      // One monthly payment only.
      // Do NOT use total due amount here.
      //
      // Example:
      // 3 dues × ₹800 = ₹2,400 total due
      // Minimum monthly payment = ₹800
      //
      // ----------------------------------

      if (
        selectedPlan === 'monthly'
      ) {

        return getMonthlyPaymentAmount()

      }

      // ----------------------------------
      // CUSTOM INSTALLMENT
      // ----------------------------------

      if (
        selectedPlan === 'installment'
      ) {

        const schedule =
          Array.isArray(
            fees.installmentSchedule
          )
            ? fees.installmentSchedule
            : []

        const due =
          schedule
            .filter(
              item =>
                item.status === 'Due'
            )
            .sort(
              (a, b) =>
                new Date(a.dueDate) -
                new Date(b.dueDate)
            )

        if (
          due.length > 0
        ) {

          return Math.min(

            Number(
              due[0].amount || 0
            ) -
            Number(
              due[0].paidAmount || 0
            ),

            remaining

          )

        }

        const pending =
          schedule
            .filter(
              item =>
                item.status === 'Pending'
            )
            .sort(
              (a, b) =>
                new Date(a.dueDate) -
                new Date(b.dueDate)
            )

        if (
          pending.length > 0
        ) {

          return Math.min(

            Number(
              pending[0].amount || 0
            ),

            remaining

          )

        }

      }

      return 0

    }


  // ======================================
  // SET DEFAULT PAYMENT AMOUNT
  // ======================================
  //
  // Monthly plan:
  // automatically select one monthly
  // installment amount.
  //
  // This lets the student simply press
  // Pay Now to clear one due installment.
  //
  // ======================================

  useEffect(() => {

    if (
      !fees ||
      !selectedPlan
    ) {

      return

    }

    const requiredAmount =
      getRequiredPaymentAmount()

    if (
      requiredAmount > 0 &&
      !paymentAmount
    ) {

      setPaymentAmount(
        String(requiredAmount)
      )

    }

  }, [
    fees,
    selectedPlan,
  ])


  // ======================================
  // INSTALLMENT SCHEDULE
  // ======================================

  const installmentSchedule =
    Array.isArray(
      fees?.installmentSchedule
    )
      ? fees.installmentSchedule
      : []


  // ======================================
  // INSTALLMENT STATUS CLASS
  // ======================================

  const getInstallmentStatusClass =
    (status) => {

      switch (status) {

        case 'Paid':

          return 'bg-success'

        case 'Due':

          return 'bg-danger'

        case 'Pending':

          return 'bg-secondary'

        case 'Waived':

          return 'bg-warning text-dark'

        default:

          return 'bg-secondary'

      }

    }


  // ======================================
  // PAYMENT PLAN BADGE CLASS
  // ======================================

  const getPlanBadgeClass =
    (plan) => {

      switch (plan) {

        case 'full':

          return 'bg-success'

        case 'monthly':

          return 'bg-primary'

        case 'installment':

          return 'bg-info text-dark'

        default:

          return 'bg-secondary'

      }

    }


  // ======================================
  // GET STATUS CLASS
  // ======================================

  const getStatusClass =
    (status) => {

      switch (status) {

        case 'Paid':

        case 'Success':

          return 'bg-success'


        case 'Partial':

        case 'Pending':

          return 'bg-warning text-dark'


        case 'Failed':

          return 'bg-danger'


        default:

          return 'bg-secondary'

      }

    }


  // ======================================
  // HANDLE AMOUNT CHANGE
  // ======================================

  const handleAmountChange =
    (event) => {

      const value =
        event.target.value


      if (value === '') {

        setPaymentAmount('')

        setError('')

        return

      }


      if (
        !/^\d*\.?\d*$/.test(
          value
        )
      ) {

        return

      }


      setPaymentAmount(
        value
      )

      setError('')

    }


  // ======================================
  // PAY NOW
  // ======================================

  const handlePayNow =
    async () => {

      setError('')

      setSuccess('')


      // ==================================
      // TOKEN
      // ==================================

      const token =
        getToken()


      if (!token) {

        setError(
          'Student authentication required.'
        )

        return

      }


      // ==================================
      // PAYMENT PLAN
      // ==================================

      if (!selectedPlan) {

        setError(
          'Please select a payment plan.'
        )

        return

      }


      // ==================================
      // PAYMENT AMOUNT
      // ==================================

      const amount =
        Number(
          paymentAmount
        )


      if (
        !amount ||
        amount <= 0
      ) {

        setError(
          'Please enter a valid payment amount.'
        )

        return

      }


      // ==================================
      // REMAINING FEE
      // ==================================

      const remaining =
        Number(
          fees?.remainingFees ||
          0
        )


      if (
        remaining <= 0
      ) {

        setError(
          'There is no remaining fee to pay.'
        )

        return

      }


      // ==================================
      // CANNOT EXCEED REMAINING
      // ==================================

      if (
        amount > remaining
      ) {

        setError(

          `Payment cannot be greater than remaining fee of ₹${formatMoney(
            remaining
          )}.`

        )

        return

      }


      // ==================================
      // REQUIRED AMOUNT
      // ==================================

      const requiredAmount =
        getRequiredPaymentAmount()


      if (
        requiredAmount > 0 &&
        amount < requiredAmount
      ) {

        setError(

          `Minimum payment required is ₹${formatMoney(
            requiredAmount
          )}.`

        )

        return

      }


      try {

        setPaying(true)


        // ==================================
        // CREATE RAZORPAY ORDER
        // ==================================
        //
        // IMPORTANT:
        // Student ID is NOT sent here.
        //
        // Backend gets student ID from JWT.
        //
        // ==================================

        const orderResponse =
          await axios.post(

            `${API_URL}/student/fees/create-order`,

            {

              amount,

              paymentPlan:
                fees?.paymentPlan,

            },

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          !orderResponse.data.success
        ) {

          setError(

            orderResponse.data.message ||

            'Unable to create payment order.'

          )

          setPaying(false)

          return

        }


        const order =
          orderResponse.data.order


        // ==================================
        // RAZORPAY CHECK
        // ==================================

        if (
          !window.Razorpay
        ) {

          setError(

            'Razorpay is not loaded. Please refresh the page and try again.'

          )

          setPaying(false)

          return

        }


        // ==================================
        // RAZORPAY OPTIONS
        // ==================================

        const options = {

          key:
            import.meta.env
              .VITE_RAZORPAY_KEY_ID,

          amount:
            order.amount,

          currency:
            order.currency,

          name:
            'Prerna Institute Of Excellence',

          description:
            'Student Course Fee Payment',

          order_id:
            order.id,


          // ==================================
          // PREFILL
          // ==================================

          prefill: {

            name:
              student?.name || '',

            email:
              student?.email || '',

            contact:
              student?.contact || '',

          },


          // ==================================
          // THEME
          // ==================================

          theme: {

            color:
              '#00adb5',

          },


          // ==================================
          // PAYMENT SUCCESS
          // ==================================

          handler:
            async function (
              razorpayResponse
            ) {

              try {

                setError('')

                setSuccess('')


                // ==================================
                // VERIFY PAYMENT
                // ==================================

                const verifyResponse =
                  await axios.post(

                    `${API_URL}/student/fees/verify`,

                    {

                      amountPaid:
                        amount,

                      paymentPlan:
                        fees?.paymentPlan,

                      transactionId:
                        razorpayResponse
                          .razorpay_payment_id,

                      orderId:
                        razorpayResponse
                          .razorpay_order_id,

                      signature:
                        razorpayResponse
                          .razorpay_signature,

                    },

                    {

                      headers: {

                        Authorization:
                          `Bearer ${token}`,

                      },

                    }

                  )


                if (
                  verifyResponse.data.success
                ) {

                  setSuccess(

                    'Payment successful. Your receipt has been generated.'

                  )


                  setPaymentAmount('')


                  // ==================================
                  // REFRESH FEES + RECEIPTS
                  // ==================================

                  await Promise.all([

                    fetchFees(),

                    fetchReceipts(),

                  ])

                }

                else {

                  setError(

                    verifyResponse.data.message ||

                    'Payment verification failed.'

                  )

                }

              }

              catch (error) {

                console.log(

                  'Payment Verification Error:',

                  error

                )


                setError(

                  error?.response?.data?.message ||

                  'Payment verification failed.'

                )

              }

              finally {

                setPaying(false)

              }

            },


          // ==================================
          // MODAL DISMISS
          // ==================================

          modal: {

            ondismiss:
              function () {

                setPaying(false)

              },

          },

        }


        // ==================================
        // CREATE RAZORPAY INSTANCE
        // ==================================

        const razorpay =
          new window.Razorpay(
            options
          )


        // ==================================
        // PAYMENT FAILED
        // ==================================

        razorpay.on(

          'payment.failed',

          function (
            response
          ) {

            console.log(

              'Razorpay Payment Failed:',

              response

            )


            setError(

              response?.error?.description ||

              'Payment failed.'

            )


            setPaying(false)

          }

        )


        // ==================================
        // OPEN RAZORPAY
        // ==================================

        razorpay.open()

      }

      catch (error) {

        console.log(

          'Payment Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to process payment.'

        )


        setPaying(false)

      }

    }


  // ======================================
  // VIEW RECEIPT
  // ======================================

  const handleViewReceipt =
    (receiptNumber) => {

      window.open(

        `/receipt/${receiptNumber}`,

        '_blank'

      )

    }


  // ======================================
  // LOADING
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

              💰

            </div>


            <h5 className="fw-bold mt-3">

              Fees & Payments

            </h5>


            <p className="text-muted mb-4">

              Your fee and payment details available here.

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


  // ======================================
  // ERROR WITHOUT DATA
  // ======================================

  if (
    error &&
    !fees
  ) {

    return (

      <div>

        <div className="mb-4">

          <h2 className="fw-bold mb-1">

            Fees & Payments

          </h2>


          <p className="text-muted mb-0">

            Your fee and payment details available here.

          </p>

        </div>


        <div
          className="alert alert-danger"
          role="alert"
        >

          {error}

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

          Fees & Payments

        </h2>


        <p className="text-muted mb-0">

          Your fee and payment details available here.

        </p>

      </div>


      {/* ==================================
          COURSE INFORMATION
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <div className="row align-items-center g-3">

            <div className="col-md-6">

              <div className="d-flex align-items-center">

                <div
                  style={{
                    fontSize: '42px',
                    marginRight: '15px',
                  }}
                >

                  📚

                </div>


                <div>

                  <small className="text-muted">

                    My Course

                  </small>


                  <h5 className="fw-bold mb-0">

                    {
                      student?.course ||

                      course?.courseName ||

                      '-'
                    }

                  </h5>

                </div>

              </div>

            </div>


            <div className="col-md-3">

              <small className="text-muted">

                Duration

              </small>


              <div className="fw-semibold">

                {
                  course?.duration ||

                  '-'
                }

              </div>

            </div>


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
          ALERTS
      ================================== */}

      {error && (

        <div
          className="alert alert-danger"
          role="alert"
        >

          {error}

        </div>

      )}


      {success && (

        <div
          className="alert alert-success"
          role="alert"
        >

          {success}

        </div>

      )}


      {/* ==================================
          FEE SUMMARY
      ================================== */}

      <div className="row g-4 mb-4">


        {/* TOTAL COURSE FEE */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-start">

                <div>

                  <small className="text-muted">
                    Total Course Fee
                  </small>

                  <h4 className="fw-bold mt-2 mb-0">
                    ₹ {formatMoney(
                      fees?.totalFees
                    )}
                  </h4>

                </div>

                <div
                  className="fs-3"
                  aria-hidden="true"
                >
                  💰
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* PAID */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-start">

                <div>

                  <small className="text-muted">
                    Paid Amount
                  </small>

                  <h4 className="fw-bold text-success mt-2 mb-0">
                    ₹ {formatMoney(
                      fees?.paidFees
                    )}
                  </h4>

                </div>

                <div
                  className="fs-3"
                  aria-hidden="true"
                >
                  ✅
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* CURRENT DUE */}

        <div className="col-md-6 col-xl-3">

          <div
            className={`card border-0 shadow-sm h-100 ${
              dueSummary.hasDue
                ? 'border-start border-4 border-danger'
                : ''
            }`}
          >

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-start">

                <div>

                  <small className="text-muted">
                    Due Amount
                  </small>

                  <h4
                    className={`fw-bold mt-2 mb-0 ${
                      dueSummary.hasDue
                        ? 'text-danger'
                        : 'text-success'
                    }`}
                  >
                    ₹ {formatMoney(
                      dueSummary.dueAmount
                    )}
                  </h4>

                  <small className="text-muted d-block mt-1">

                    {
                      dueSummary.hasDue
                        ? `${dueSummary.dueCount} payment${
                            dueSummary.dueCount > 1
                              ? 's'
                              : ''
                          } due`
                        : 'Nothing due now'
                    }

                  </small>

                </div>

                <div
                  className="fs-3"
                  aria-hidden="true"
                >
                  {
                    dueSummary.hasDue
                      ? '⚠️'
                      : '👍'
                  }
                </div>

              </div>

            </div>

          </div>

        </div>


        {/* TOTAL REMAINING */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-start">

                <div>

                  <small className="text-muted">
                    Total Remaining
                  </small>

                  <h4 className="fw-bold text-primary mt-2 mb-0">
                    ₹ {formatMoney(
                      fees?.remainingFees
                    )}
                  </h4>

                </div>

                <div
                  className="fs-3"
                  aria-hidden="true"
                >
                  📌
                </div>

              </div>

            </div>

          </div>

        </div>


      </div>


      {/* ==================================
          DUE INFORMATION
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <div className="row align-items-center g-4">


            {/* DUE AMOUNT */}

            <div className="col-md-4">

              <div className="d-flex align-items-center">

                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                    dueSummary.hasDue
                      ? 'bg-danger-subtle text-danger'
                      : 'bg-success-subtle text-success'
                  }`}
                  style={{
                    width: '52px',
                    height: '52px',
                    fontSize: '24px',
                  }}
                >
                  ₹
                </div>

                <div>

                  <small className="text-muted d-block">
                    Amount Due Now
                  </small>

                  <h5
                    className={`fw-bold mb-0 ${
                      dueSummary.hasDue
                        ? 'text-danger'
                        : 'text-success'
                    }`}
                  >
                    ₹ {formatMoney(
                      dueSummary.dueAmount
                    )}
                  </h5>

                </div>

              </div>

            </div>


            {/* DUE DATE */}

            <div className="col-md-4">

              <div className="d-flex align-items-center">

                <div
                  className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: '52px',
                    height: '52px',
                    fontSize: '22px',
                  }}
                >
                  📅
                </div>

                <div>

                  <small className="text-muted d-block">
                    {
                      dueSummary.hasDue
                        ? 'Due Till'
                        : 'Next Due Date'
                    }
                  </small>

                  <h6 className="fw-bold mb-0">

                    {
                      dueSummary.dueDate
                        ? formatDate(
                            dueSummary.dueDate
                          )
                        : 'No due date'
                    }

                  </h6>

                </div>

              </div>

            </div>


            {/* STATUS */}

            <div className="col-md-4">

              <div className="d-flex align-items-center">

                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center me-3 ${
                    dueSummary.hasDue
                      ? 'bg-warning-subtle text-warning-emphasis'
                      : 'bg-success-subtle text-success'
                  }`}
                  style={{
                    width: '52px',
                    height: '52px',
                    fontSize: '22px',
                  }}
                >
                  {
                    dueSummary.hasDue
                      ? '⏳'
                      : '✓'
                  }
                </div>

                <div>

                  <small className="text-muted d-block">
                    Fee Status
                  </small>

                  <span
                    className={`badge ${getStatusClass(
                      fees?.feesStatus
                    )}`}
                  >
                    {
                      fees?.feesStatus ||
                      'Pending'
                    }
                  </span>

                </div>

              </div>

            </div>


          </div>

        </div>

      </div>


      {/* ==================================
          FEE DETAILS + PAYMENT PLAN
      ================================== */}

      <div className="row g-4 mb-4">


        {/* FEE DETAILS */}

        <div className="col-lg-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <h5 className="fw-bold mb-4">

                💰 Fee Details

              </h5>


              <div className="row g-4">


                <div className="col-6">

                  <small className="text-muted">

                    Registration Fee

                  </small>

                  <div className="fw-semibold">

                    ₹
                    {
                      formatMoney(
                        fees?.registrationFee
                      )
                    }

                  </div>

                </div>


                <div className="col-6">

                  <small className="text-muted">

                    Registration Paid

                  </small>

                  <div className="fw-semibold">

                    ₹
                    {
                      formatMoney(
                        fees?.registrationFeePaid
                      )
                    }

                  </div>

                </div>


                <div className="col-6">

                  <small className="text-muted">

                    Fee Status

                  </small>

                  <div className="mt-1">

                    <span

                      className={`badge ${getStatusClass(
                        fees?.feesStatus
                      )}`}

                    >

                      {
                        fees?.feesStatus ||
                        'Pending'
                      }

                    </span>

                  </div>

                </div>


                {/* ==================================
                    DUE AMOUNT
                ================================== */}

                <div className="col-6">

                  <small className="text-muted">

                    Due Amount

                  </small>


                  <div
                    className={`fw-bold ${
                      dueSummary.hasDue
                        ? 'text-danger'
                        : 'text-success'
                    }`}
                  >

                    ₹ {formatMoney(
                      dueSummary.dueAmount
                    )}

                  </div>

                </div>


                {/* ==================================
                    DUE DATE
                ================================== */}

                <div className="col-6">

                  <small className="text-muted">

                    {
                      dueSummary.hasDue
                        ? 'Due Till'
                        : 'Next Due Date'
                    }

                  </small>


                  <div className="fw-bold">

                    {
                      dueSummary.dueDate
                        ? formatDate(
                            dueSummary.dueDate
                          )
                        : '-'
                    }

                  </div>

                </div>


              </div>

            </div>

          </div>

        </div>


        {/* PAYMENT PLAN */}

        <div className="col-lg-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <div className="d-flex justify-content-between align-items-center mb-4">

                <h5 className="fw-bold mb-0">
                  📆 Payment Plan
                </h5>

                <span
                  className={`badge ${getPlanBadgeClass(
                    fees?.paymentPlan
                  )}`}
                >
                  {
                    getPaymentPlanLabel(
                      fees?.paymentPlan
                    )
                  }
                </span>

              </div>


              <div className="p-3 rounded-3 bg-light mb-3">

                <div className="d-flex justify-content-between align-items-center">

                  <div>

                    <small className="text-muted d-block">
                      Plan selected by institute
                    </small>

                    <strong>
                      {
                        getPaymentPlanLabel(
                          fees?.paymentPlan
                        )
                      }
                    </strong>

                  </div>

                  <div className="text-end">

                    <small className="text-muted d-block">
                      Remaining
                    </small>

                    <strong className="text-danger">
                      ₹ {formatMoney(
                        fees?.remainingFees
                      )}
                    </strong>

                  </div>

                </div>

              </div>


              {fees?.paymentPlan === 'monthly' && (

                <div className="row g-3">

                  <div className="col-6">

                    <small className="text-muted">
                      Monthly Amount
                    </small>

                    <div className="fw-bold mt-1">
                      ₹ {formatMoney(
                        getMonthlyPaymentAmount()
                      )}
                    </div>

                    {(() => {

                      const currentMonthlyItem =
                        installmentSchedule
                          .map(
                            item => {

                              const amount =
                                Number(
                                  item?.amount || 0
                                )

                              const paidAmount =
                                Number(
                                  item?.paidAmount || 0
                                )

                              return {
                                ...item,
                                balance:
                                  Math.max(
                                    0,
                                    amount - paidAmount
                                  ),
                              }

                            }
                          )
                          .filter(
                            item =>
                              item.balance > 0 &&
                              item.status !== 'Paid' &&
                              item.status !== 'Waived'
                          )
                          .sort(
                            (a, b) =>
                              new Date(a.dueDate || 0) -
                              new Date(b.dueDate || 0)
                          )[0]

                      const hasAdjustment =
                        currentMonthlyItem?.adjustmentType &&
                        currentMonthlyItem.adjustmentType !== 'None'

                      if (!hasAdjustment) {
                        return null
                      }

                      return (
                        <small className="text-warning d-block mt-1 fw-semibold">
                          ⚠️ Adjusted for this month
                          {currentMonthlyItem?.adjustmentReason
                            ? ` • ${currentMonthlyItem.adjustmentReason}`
                            : ''}
                        </small>
                      )

                    })()}

                  </div>

                  <div className="col-6">

                    <small className="text-muted">
                      Due Amount
                    </small>

                    <div
                      className={`fw-bold mt-1 ${
                        dueSummary.hasDue
                          ? 'text-danger'
                          : 'text-success'
                      }`}
                    >
                      ₹ {formatMoney(
                        dueSummary.dueAmount
                      )}
                    </div>

                  </div>


                  <div className="col-6">

                    <small className="text-muted">
                      {
                        dueSummary.hasDue
                          ? 'Due Till'
                          : 'Next Due Date'
                      }
                    </small>

                    <div className="fw-bold mt-1">
                      {
                        dueSummary.dueDate
                          ? formatDate(
                              dueSummary.dueDate
                            )
                          : '-'
                      }
                    </div>

                  </div>

                </div>

              )}


              {fees?.paymentPlan === 'full' && (

                <div className="p-3 rounded-3 border">

                  <small className="text-muted d-block">
                    Full payment required
                  </small>

                  <h5 className="fw-bold mb-0 mt-1">
                    ₹ {formatMoney(
                      fees?.remainingFees
                    )}
                  </h5>

                </div>

              )}


              {fees?.paymentPlan === 'installment' && (

                <div>

                  <div className="d-flex justify-content-between align-items-center mb-2">

                    <small className="text-muted">
                      Installment Schedule
                    </small>

                    <span className="badge bg-dark">
                      {installmentSchedule.length}
                    </span>

                  </div>

                  <div className="table-responsive">

                    <table className="table table-sm align-middle mb-0">

                      <thead>

                        <tr>

                          <th>#</th>

                          <th>Amount</th>

                          <th>Due Date</th>

                          <th>Status</th>

                        </tr>

                      </thead>

                      <tbody>

                        {installmentSchedule.length === 0 && (

                          <tr>

                            <td
                              colSpan="4"
                              className="text-center text-muted py-3"
                            >
                              No installment schedule available.
                            </td>

                          </tr>

                        )}

                        {installmentSchedule.map(
                          (item, index) => (

                            <tr
                              key={
                                item._id ||
                                item.installmentNumber ||
                                index
                              }
                            >

                              <td>
                                {
                                  item.installmentNumber ||
                                  index + 1
                                }
                              </td>

                              <td className="fw-semibold">
                                ₹ {formatMoney(
                                  Math.max(
                                    0,
                                    Number(
                                      item.amount || 0
                                    ) -
                                    Number(
                                      item.paidAmount || 0
                                    )
                                  )
                                )}
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

                              <td>

                                <span
                                  className={`badge ${getInstallmentStatusClass(
                                    item.status
                                  )}`}
                                >
                                  {
                                    item.status ||
                                    'Pending'
                                  }
                                </span>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ==================================
          MAKE PAYMENT
      ================================== */}

      {
        Number(
          fees?.remainingFees || 0
        ) > 0 && (

          <div className="card border-0 shadow-sm mb-4">

            <div className="card-body p-4">

              <h5 className="fw-bold mb-4">

                💳 Make Payment

              </h5>


              <div className="row g-4 align-items-end">


                {/* PAYMENT PLAN */}

                <div className="col-md-4">

                  <label className="form-label fw-semibold">
                    Payment Plan
                  </label>

                  <div className="form-control bg-light">

                    <span
                      className={`badge ${getPlanBadgeClass(
                        fees?.paymentPlan
                      )}`}
                    >
                      {
                        getPaymentPlanLabel(
                          fees?.paymentPlan
                        )
                      }
                    </span>

                  </div>

                  <small className="text-muted d-block mt-1">
                    Payment plan is managed by the institute.
                  </small>

                </div>


                {/* AMOUNT */}

                <div className="col-md-4">

                  <label className="form-label">

                    Amount to Pay

                  </label>


                  <div className="input-group">

                    <span className="input-group-text">

                      ₹

                    </span>


                    <input

                      type="text"

                      inputMode="decimal"

                      className="form-control"

                      placeholder="Enter amount"

                      value={
                        paymentAmount
                      }

                      onChange={
                        handleAmountChange
                      }

                      disabled={
                        paying
                      }

                    />

                  </div>


                  <small className="text-muted d-block mt-1">

                    Total Remaining: ₹
                    {
                      formatMoney(
                        fees?.remainingFees
                      )
                    }

                  </small>


                  <small
                    className={`d-block mt-1 fw-semibold ${
                      dueSummary.hasDue
                        ? 'text-danger'
                        : 'text-success'
                    }`}
                  >

                    Due Now: ₹
                    {
                      formatMoney(
                        dueSummary.dueAmount
                      )
                    }

                    {
                      dueSummary.dueDate
                        ? ` • ${
                            dueSummary.hasDue
                              ? 'Due Till'
                              : 'Next Due'
                          }: ${formatDate(
                            dueSummary.dueDate
                          )}`
                        : ''
                    }

                  </small>


                  {/* ==================================
                      QUICK MONTHLY PAYMENT OPTION
                  ================================== */}

                  {
                    selectedPlan === 'monthly' &&
                    getMonthlyPaymentAmount() > 0 && (

                      <button

                        type="button"

                        className="btn btn-outline-primary btn-sm mt-2"

                        onClick={() =>
                          setPaymentAmount(
                            String(
                              getMonthlyPaymentAmount()
                            )
                          )
                        }

                        disabled={
                          paying
                        }

                      >

                        Pay 1 Monthly Installment — ₹
                        {
                          formatMoney(
                            getMonthlyPaymentAmount()
                          )
                        }

                      </button>

                    )
                  }


                  {/* MINIMUM WARNING */}

                  {
                    selectedPlan &&

                    Number(
                      paymentAmount || 0
                    ) > 0 &&

                    Number(
                      paymentAmount
                    ) <

                    getRequiredPaymentAmount() && (

                      <small
                        className="text-danger d-block mt-1 fw-semibold"
                      >

                        ⚠️ Minimum payment required: ₹
                        {
                          formatMoney(
                            getRequiredPaymentAmount()
                          )
                        }

                      </small>

                    )
                  }




                </div>


                {/* PAY BUTTON */}

                <div className="col-md-4">

                  <button

                    type="button"

                    className="btn btn-primary w-100"

                    onClick={
                      handlePayNow
                    }

                    disabled={

                      paying ||

                      !selectedPlan ||

                      !paymentAmount ||

                      Number(
                        paymentAmount
                      ) <

                      getRequiredPaymentAmount()

                    }

                  >

                    {
                      paying

                        ? (

                          <>

                            <span

                              className="spinner-border spinner-border-sm me-2"

                            />

                            Processing...

                          </>

                        )

                        : (

                          <>
                            💳 Pay Now
                          </>

                        )
                    }

                  </button>

                </div>


              </div>

            </div>

          </div>

        )

      }


      {/* ==================================
          PAYMENT HISTORY
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <h5 className="fw-bold mb-0">

              📜 Payment History

            </h5>


            <span className="badge bg-secondary">

              {
                paymentHistory.length
              }

            </span>

          </div>


          {
            paymentHistory.length === 0

              ? (

                <div className="text-center py-5">

                  <div
                    style={{
                      fontSize: '44px',
                    }}
                  >

                    📜

                  </div>


                  <p className="text-muted mt-3 mb-0">

                    No payment history available.

                  </p>

                </div>

              )

              : (

                <div className="table-responsive">

                  <table className="table align-middle mb-0">

                    <thead>

                      <tr>

                        <th>
                          Date
                        </th>

                        <th>
                          Category
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Mode
                        </th>

                        <th>
                          Plan
                        </th>

                        <th>
                          Status
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {
                        paymentHistory.map(

                          (payment, index) => (

                            <tr

                              key={

                                payment._id ||

                                index

                              }

                            >

                              <td>

                                {
                                  formatDate(
                                    payment.paymentDate
                                  )
                                }

                              </td>


                              <td>

                                {
                                  payment.paymentCategory ||
                                  '-'
                                }

                              </td>


                              <td className="fw-semibold">

                                ₹
                                {
                                  formatMoney(
                                    payment.amount
                                  )
                                }

                              </td>


                              <td>

                                <span className="badge bg-light text-dark border">

                                  {
                                    payment.paymentMode ||

                                    payment.paymentMethod ||

                                    '-'
                                  }

                                </span>

                              </td>


                              <td>

                                {
                                  getPaymentPlanLabel(
                                    payment.paymentPlan
                                  )
                                }

                              </td>


                              <td>

                                <span

                                  className={`badge ${getStatusClass(
                                    payment.paymentStatus
                                  )}`}

                                >

                                  {
                                    payment.paymentStatus ||
                                    '-'
                                  }

                                </span>

                              </td>

                            </tr>

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


      {/* ==================================
          RECEIPTS
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <h5 className="fw-bold mb-0">

              🧾 Receipts

            </h5>


            <span className="badge bg-secondary">

              {
                receipts.length
              }

            </span>

          </div>


          {
            receipts.length === 0

              ? (

                <div className="text-center py-5">

                  <div
                    style={{
                      fontSize: '44px',
                    }}
                  >

                    🧾

                  </div>


                  <p className="text-muted mt-3 mb-0">

                    No receipts available.

                  </p>

                </div>

              )

              : (

                <div className="table-responsive">

                  <table className="table align-middle mb-0">

                    <thead>

                      <tr>

                        <th>
                          Receipt No.
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Payment Mode
                        </th>

                        <th>
                          Status
                        </th>

                        <th className="text-end">
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {
                        receipts.map(

                          (receipt) => (

                            <tr

                              key={
                                receipt._id
                              }

                            >

                              <td className="fw-semibold">

                                {
                                  receipt.receiptNumber
                                }

                              </td>


                              <td>

                                {
                                  formatDate(
                                    receipt.paymentDate
                                  )
                                }

                              </td>


                              <td>

                                ₹
                                {
                                  formatMoney(
                                    receipt.amountPaid
                                  )
                                }

                              </td>


                              <td>

                                {
                                  receipt.paymentMethod ||
                                  '-'
                                }

                              </td>


                              <td>

                                <span

                                  className={`badge ${getStatusClass(
                                    receipt.paymentStatus
                                  )}`}

                                >

                                  {
                                    receipt.paymentStatus ||
                                    '-'
                                  }

                                </span>

                              </td>


                              <td className="text-end">

                                <button

                                  type="button"

                                  className="btn btn-sm btn-outline-primary"

                                  onClick={() =>
                                    handleViewReceipt(
                                      receipt.receiptNumber
                                    )
                                  }

                                >

                                  👁️ View Receipt

                                </button>

                              </td>

                            </tr>

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


export default StudentFees