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


        case 'three_month':

          return '3 Month Installment'


        case 'six_month':

          return '6 Month Installment'


        case 'full':

          return 'Full Payment'


        default:

          return 'Not Selected'

      }

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
          fees.remainingFees ||
          0
        )


      let planAmount = 0


      switch (
        selectedPlan
      ) {

        case 'monthly':

          planAmount =
            Number(
              fees.monthlyInstallment ||
              0
            )

          break


        case 'three_month':

          planAmount =
            Number(
              fees.threeMonthInstallment ||
              0
            )

          break


        case 'six_month':

          planAmount =
            Number(
              fees.sixMonthInstallment ||
              0
            )

          break


        case 'full':

          planAmount =
            Number(
              fees.fullPaymentFee ||
              remaining
            )

          break


        default:

          planAmount = 0

      }


      return Math.min(

        planAmount,

        remaining

      )

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
  // HANDLE PLAN CHANGE
  // ======================================

  const handlePlanChange =
    (event) => {

      const plan =
        event.target.value


      setSelectedPlan(
        plan
      )


      setPaymentAmount('')

      setError('')

      setSuccess('')

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

          `Minimum payment for ${getPaymentPlanLabel(
            selectedPlan
          )} is ₹${formatMoney(
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
                selectedPlan,

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
                        selectedPlan,

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


        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4 text-center">

              <div
                style={{
                  fontSize: '40px',
                }}
              >

                💰

              </div>


              <small className="text-muted">

                Total Course Fee

              </small>


              <h4 className="fw-bold mt-2 mb-0">

                ₹
                {
                  formatMoney(
                    fees?.totalFees
                  )
                }

              </h4>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4 text-center">

              <div
                style={{
                  fontSize: '40px',
                }}
              >

                ✅

              </div>


              <small className="text-muted">

                Paid Amount

              </small>


              <h4 className="fw-bold text-success mt-2 mb-0">

                ₹
                {
                  formatMoney(
                    fees?.paidFees
                  )
                }

              </h4>

            </div>

          </div>

        </div>


        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4 text-center">

              <div
                style={{
                  fontSize: '40px',
                }}
              >

                ⏳

              </div>


              <small className="text-muted">

                Remaining Fee

              </small>


              <h4 className="fw-bold text-danger mt-2 mb-0">

                ₹
                {
                  formatMoney(
                    fees?.remainingFees
                  )
                }

              </h4>

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
                    NEXT DUE DATE
                ================================== */}

                <div className="col-6">

                  <small className="text-muted">

                    Next Due Date

                  </small>


                  <div className="fw-bold">

                    {
                      fees?.dueDate
                        ? formatDate(
                            fees.dueDate
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

              <h5 className="fw-bold mb-4">

                📆 Payment Plan

              </h5>


              <div className="mb-4">

                <small className="text-muted">

                  Selected Plan

                </small>


                <div className="fw-bold mt-1">

                  {
                    getPaymentPlanLabel(
                      fees?.paymentPlan
                    )
                  }

                </div>

              </div>


              <div className="row g-3">


                <div className="col-6">

                  <small className="text-muted">

                    Monthly

                  </small>

                  <div className="fw-semibold">

                    ₹
                    {
                      formatMoney(
                        fees?.monthlyInstallment
                      )
                    }

                  </div>

                </div>


                <div className="col-6">

                  <small className="text-muted">

                    3 Month

                  </small>

                  <div className="fw-semibold">

                    ₹
                    {
                      formatMoney(
                        fees?.threeMonthInstallment
                      )
                    }

                  </div>

                </div>


                <div className="col-6">

                  <small className="text-muted">

                    6 Month

                  </small>

                  <div className="fw-semibold">

                    ₹
                    {
                      formatMoney(
                        fees?.sixMonthInstallment
                      )
                    }

                  </div>

                </div>


                <div className="col-6">

                  <small className="text-muted">

                    Full Payment

                  </small>

                  <div className="fw-semibold">

                    ₹
                    {
                      formatMoney(
                        fees?.fullPaymentFee
                      )
                    }

                  </div>

                </div>


              </div>

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

                  <label className="form-label">

                    Payment Plan

                  </label>


                  <select

                    className="form-select"

                    value={
                      selectedPlan
                    }

                    onChange={
                      handlePlanChange
                    }

                    disabled={
                      Boolean(
                        fees?.paymentPlan
                      )
                    }

                  >

                    <option value="">

                      Select Payment Plan

                    </option>


                    <option value="monthly">

                      Monthly Installment

                    </option>


                    <option value="three_month">

                      3 Month Installment

                    </option>


                    <option value="six_month">

                      6 Month Installment

                    </option>


                    <option value="full">

                      Full Payment

                    </option>

                  </select>


                  {
                    fees?.paymentPlan && (

                      <small className="text-muted d-block mt-1">

                        Payment plan is locked after the first payment.

                      </small>

                    )
                  }

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

                    Remaining: ₹
                    {
                      formatMoney(
                        fees?.remainingFees
                      )
                    }

                  </small>


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


                  {/* FULL PAYMENT WARNING */}

                  {
                    selectedPlan === 'full' &&

                    Number(
                      paymentAmount || 0
                    ) > 0 &&

                    Number(
                      paymentAmount
                    ) !==

                    getRequiredPaymentAmount() && (

                      <small
                        className="text-danger d-block mt-1 fw-semibold"
                      >

                        ⚠️ Full payment amount should be ₹
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