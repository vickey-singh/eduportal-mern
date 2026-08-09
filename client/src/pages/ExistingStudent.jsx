import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  verifyStudent,
} from '../services/studentService'

import {
  createOrder,
  payExistingStudent,
} from '../services/paymentService'

import '../assets/styles/existing-student.css'


function ExistingStudent() {

  const navigate = useNavigate()


  // ======================================
  // FORM DATA
  // ======================================

  const [formData, setFormData] = useState({

    admissionNumber: '',

    name: '',

    phone: '',

    email: '',

  })


  // ======================================
  // STUDENT
  // ======================================

  const [student, setStudent] =
    useState(null)


  // ======================================
  // SELECTED PAYMENT PLAN
  // ======================================

  const [selectedPlan, setSelectedPlan] =
    useState('')


  // ======================================
  // PAYMENT AMOUNT
  // ======================================

  const [amount, setAmount] =
    useState('')


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(false)


  // ======================================
  // HANDLE FORM CHANGE
  // ======================================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    })

  }


  // ======================================
  // VERIFY STUDENT
  // ======================================

  const handleSubmit = async (e) => {

    e.preventDefault()

    setLoading(true)

    try {

      const response =
        await verifyStudent(
          formData
        )


      const verifiedStudent =
        response.student


      setStudent(
        verifiedStudent
      )


      // ==================================
      // EXISTING PAYMENT PLAN
      // ==================================

      if (
        verifiedStudent.paymentPlan
      ) {

        setSelectedPlan(
          verifiedStudent.paymentPlan
        )


        // Set amount according to
        // already selected plan

        const planAmount =
          getPlanAmount(
            verifiedStudent,
            verifiedStudent.paymentPlan
          )


        setAmount(
          planAmount
        )

      }

      else {

        // ==================================
        // FIRST TIME
        // ==================================

        setSelectedPlan('')

        setAmount('')

      }


      alert(
        'Student Verified Successfully'
      )

    } catch (error) {

      console.log(error)

      if (
        error.response
      ) {

        alert(
          error.response.data.message
        )

      } else {

        alert(
          'Cannot connect to server.'
        )

      }

    } finally {

      setLoading(false)

    }

  }


  // ======================================
  // GET PLAN AMOUNT
  // ======================================

  const getPlanAmount = (
    studentData,
    plan
  ) => {

    if (!studentData) {

      return 0

    }


    switch (plan) {

      case 'monthly':

        return Number(
          studentData.monthlyInstallment || 0
        )


      case 'three_month':

        return Number(
          studentData.threeMonthInstallment || 0
        )


      case 'six_month':

        return Number(
          studentData.sixMonthInstallment || 0
        )


      case 'full':

        return Number(
          studentData.remainingFees || 0
        )


      default:

        return 0

    }

  }


  // ======================================
  // PLAN LABEL
  // ======================================

  const getPlanLabel = (
    plan
  ) => {

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

        return ''

    }

  }


  // ======================================
  // SELECT PAYMENT PLAN
  // ======================================

  const handlePlanSelect = (
    plan
  ) => {

    // Plan already locked
    if (
      student?.paymentPlan
    ) {

      return

    }


    setSelectedPlan(
      plan
    )


    const planAmount =
      getPlanAmount(
        student,
        plan
      )


    // ==================================
    // FULL PAYMENT
    // ==================================

    if (
      plan === 'full'
    ) {

      setAmount(
        Number(
          student.remainingFees
        )
      )

      return

    }


    // ==================================
    // INSTALLMENT
    // ==================================

    if (
      planAmount > 0
    ) {

      // Never allow amount greater
      // than remaining fee

      setAmount(

        Math.min(

          planAmount,

          Number(
            student.remainingFees
          )

        )

      )

    } else {

      setAmount('')

    }

  }


  // ======================================
  // OPEN RAZORPAY
  // ======================================

  const openRazorpay = (
    order
  ) => {

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
        'Course Fee Payment',

      order_id:
        order.id,

      prefill: {

        name:
          student.name,

        email:
          student.email,

        contact:
          student.contact,

      },

      theme: {

        color:
          '#0d6efd',

      },


      // ==================================
      // PAYMENT SUCCESS
      // ==================================

      handler:
        async function (
          response
        ) {

          try {

            setLoading(true)


            // ==================================
            // UPDATE PAYMENT
            // ==================================

            const result =
              await payExistingStudent({

                admissionNumber:
                  student.admissionNumber,

                amountPaid:
                  Number(amount),

                paymentPlan:
                  selectedPlan,

                paymentMethod:
                  'Razorpay',

                paymentMode:
                  'Online',

                transactionId:
                  response.razorpay_payment_id,

                orderId:
                  response.razorpay_order_id,

                signature:
                  response.razorpay_signature,

                paymentDate:
                  new Date()
                    .toISOString()
                    .split('T')[0],

              })


            // ==================================
            // UPDATE STUDENT
            // ==================================

            setStudent(
              result.student
            )


            // ==================================
            // KEEP SELECTED PLAN
            // ==================================

            setSelectedPlan(
              result.student.paymentPlan
            )


            // ==================================
            // UPDATE REMAINING AMOUNT
            // ==================================

            setAmount(
              result.student.remainingFees
            )


            alert(
              result.message
            )


            // ==================================
            // RECEIPT
            // ==================================

            navigate(
              `/receipt/${result.receiptNumber}`
            )

          } catch (error) {

            console.log(error)

            alert(

              error.response?.data?.message ||

              'Payment Update Failed'

            )

          } finally {

            setLoading(false)

          }

        },

    }


    const razorpay =
      new window.Razorpay(
        options
      )


    razorpay.open()

  }


  // ======================================
  // HANDLE PAYMENT
  // ======================================

  const handlePayment = async () => {

    if (!student) {

      return

    }


    // ==================================
    // COURSE FEE ALREADY PAID
    // ==================================

    if (
      Number(
        student.remainingFees
      ) <= 0
    ) {

      alert(
        'Course Fee is already fully paid.'
      )

      return

    }


    // ==================================
    // PLAN REQUIRED
    // ==================================

    if (!selectedPlan) {

      alert(
        'Please select a payment plan first.'
      )

      return

    }


    // ==================================
    // AMOUNT
    // ==================================

    const enteredAmount =
      Number(amount)


    if (
      !enteredAmount ||
      enteredAmount <= 0
    ) {

      alert(
        'Please enter a valid payment amount.'
      )

      return

    }


    // ==================================
    // CANNOT EXCEED REMAINING
    // ==================================

    if (
      enteredAmount >
      Number(
        student.remainingFees
      )
    ) {

      alert(
        'Payment amount cannot be greater than remaining fee.'
      )

      return

    }


    // ==================================
    // FULL PAYMENT
    // ==================================

    if (
      selectedPlan === 'full'
    ) {

      const remaining =
        Number(
          student.remainingFees
        )


      if (
        enteredAmount !==
        remaining
      ) {

        alert(

          `Full payment amount must be ₹${remaining}.`

        )

        return

      }

    }


    // ==================================
    // INSTALLMENT
    // ==================================

    else {

      const minimumAmount =
        getPlanAmount(
          student,
          selectedPlan
        )


      const requiredAmount =
        Math.min(

          minimumAmount,

          Number(
            student.remainingFees
          )

        )


      if (
        requiredAmount > 0 &&
        enteredAmount <
          requiredAmount
      ) {

        alert(

          `Minimum payment for ${getPlanLabel(
            selectedPlan
          )} plan is ₹${requiredAmount}.`

        )

        return

      }

    }


    try {

      setLoading(true)


      // ==================================
      // CREATE RAZORPAY ORDER
      // ==================================

      const orderResponse =
        await createOrder({

          amount:
            enteredAmount,

        })


      // ==================================
      // OPEN RAZORPAY
      // ==================================

      openRazorpay(
        orderResponse.order
      )

    } catch (error) {

      console.log(error)

      alert(

        error.response?.data?.message ||

        'Unable to start payment.'

      )

      setLoading(false)

    }

  }


  // ======================================
  // PAYMENT PLAN ALREADY LOCKED?
  // ======================================

  const planLocked =
    Boolean(
      student?.paymentPlan
    )


  // ======================================
  // CURRENT PLAN AMOUNT
  // ======================================

  const currentPlanAmount =
    student && selectedPlan

      ? getPlanAmount(
          student,
          selectedPlan
        )

      : 0


  // ======================================
  // RENDER
  // ======================================

  return (

    <section
      className="existing-student-page"
    >

      <div className="container">


        {/* ================================== */}
        {/* HEADER */}
        {/* ================================== */}

        <div
          className="existing-header text-center"
        >

          <h1>
            Existing Student
          </h1>

          <p>
            Verify your details to pay
            your remaining course fee.
          </p>

        </div>


        {/* ================================== */}
        {/* VERIFY FORM */}
        {/* ================================== */}

        <div
          className="existing-form-wrapper"
        >

          <form
            onSubmit={handleSubmit}
          >

            <div className="row">


              {/* ADMISSION NUMBER */}

              <div
                className="col-md-6 mb-4"
              >

                <label
                  className="form-label"
                >

                  Admission Number

                </label>

                <input

                  type="text"

                  className="form-control"

                  name="admissionNumber"

                  placeholder="Enter Admission Number"

                  value={
                    formData.admissionNumber
                  }

                  onChange={
                    handleChange
                  }

                  required

                />

              </div>


              {/* STUDENT NAME */}

              <div
                className="col-md-6 mb-4"
              >

                <label
                  className="form-label"
                >

                  Student Name

                </label>

                <input

                  type="text"

                  className="form-control"

                  name="name"

                  placeholder="Enter Student Name"

                  value={
                    formData.name
                  }

                  onChange={
                    handleChange
                  }

                  required

                />

              </div>


              {/* MOBILE */}

              <div
                className="col-md-6 mb-4"
              >

                <label
                  className="form-label"
                >

                  Mobile Number

                </label>

                <input

                  type="text"

                  className="form-control"

                  name="phone"

                  placeholder="Enter Mobile Number"

                  value={
                    formData.phone
                  }

                  onChange={
                    handleChange
                  }

                  required

                />

              </div>


              {/* EMAIL */}

              <div
                className="col-md-6 mb-4"
              >

                <label
                  className="form-label"
                >

                  Email (Optional)

                </label>

                <input

                  type="email"

                  className="form-control"

                  name="email"

                  placeholder="Enter Email"

                  value={
                    formData.email
                  }

                  onChange={
                    handleChange
                  }

                />

              </div>

            </div>


            <button

              className="apply-btn"

              type="submit"

              disabled={loading}

            >

              {
                loading
                  ? 'Please Wait...'
                  : 'Verify Student'
              }

            </button>

          </form>


          {/* ================================== */}
          {/* STUDENT DETAILS */}
          {/* ================================== */}

          {student && (

            <div
              className="card mt-5 shadow"
            >

              <div
                className="card-header bg-primary text-white"
              >

                <h4 className="mb-0">
                  Student Details
                </h4>

              </div>


              <div className="card-body">

                <div className="row">


                  <div
                    className="col-md-6 mb-3"
                  >

                    <strong>
                      Admission No
                    </strong>

                    <br />

                    {
                      student.admissionNumber
                    }

                  </div>


                  <div
                    className="col-md-6 mb-3"
                  >

                    <strong>
                      Name
                    </strong>

                    <br />

                    {
                      student.name
                    }

                  </div>


                  <div
                    className="col-md-6 mb-3"
                  >

                    <strong>
                      Course
                    </strong>

                    <br />

                    {
                      student.course
                    }

                  </div>


                  <div
                    className="col-md-6 mb-3"
                  >

                    <strong>
                      Fees Status
                    </strong>

                    <br />

                    {
                      student.feesStatus
                    }

                  </div>


                  <div
                    className="col-md-4 mb-3"
                  >

                    <strong>
                      Total Course Fee
                    </strong>

                    <br />

                    ₹ {
                      Number(
                        student.totalFees || 0
                      ).toLocaleString('en-IN')
                    }

                  </div>


                  <div
                    className="col-md-4 mb-3"
                  >

                    <strong>
                      Paid Fee
                    </strong>

                    <br />

                    ₹ {
                      Number(
                        student.paidFees || 0
                      ).toLocaleString('en-IN')
                    }

                  </div>


                  <div
                    className="col-md-4 mb-3"
                  >

                    <strong>
                      Remaining Fee
                    </strong>

                    <br />

                    ₹ {
                      Number(
                        student.remainingFees || 0
                      ).toLocaleString('en-IN')
                    }

                  </div>


                  {/* ================================= */}
                  {/* SELECTED PLAN */}
                  {/* ================================= */}

                  {planLocked && (

                    <>

                      <div
                        className="col-md-6 mb-3"
                      >

                        <strong>
                          Payment Plan
                        </strong>

                        <br />

                        <span
                          className="badge bg-primary"
                        >

                          {
                            getPlanLabel(
                              student.paymentPlan
                            )
                          }

                        </span>

                      </div>


                      <div
                        className="col-md-6 mb-3"
                      >

                        <strong>
                          Plan Amount
                        </strong>

                        <br />

                        ₹ {
                          Number(
                            currentPlanAmount || 0
                          ).toLocaleString('en-IN')
                        }

                      </div>

                    </>

                  )}

                </div>

              </div>

            </div>

          )}


          {/* ================================== */}
          {/* PAYMENT SECTION */}
          {/* ================================== */}

          {student && (

            <>

              <hr />


              <div
                className="mt-4"
              >


                {/* ================================= */}
                {/* FULLY PAID */}
                {/* ================================= */}

                {Number(
                  student.remainingFees
                ) <= 0 ? (

                  <div
                    className="alert alert-success"
                  >

                    ✅ Course Fee Fully Paid

                  </div>

                ) : (

                  <>

                    {/* =============================== */}
                    {/* FIRST PAYMENT — PLAN SELECTION */}
                    {/* =============================== */}

                    {!planLocked && (

                      <div
                        className="mt-4"
                      >

                        <h5 className="mb-3">
                          Choose Your Payment Plan
                        </h5>


                        <p
                          className="text-muted"
                        >

                          Select your payment plan.
                          Once selected, it cannot
                          be changed later.

                        </p>


                        <div className="row">


                          {/* MONTHLY */}

                          <div
                            className="col-md-6 col-lg-3 mb-3"
                          >

                            <button

                              type="button"

                              className={
                                `btn w-100 h-100 ${
                                  selectedPlan === 'monthly'
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
                                }`
                              }

                              onClick={() =>
                                handlePlanSelect(
                                  'monthly'
                                )
                              }

                            >

                              <strong>
                                Monthly
                              </strong>

                              <br />

                              <span>
                                ₹ {
                                  Number(
                                    student.monthlyInstallment || 0
                                  ).toLocaleString(
                                    'en-IN'
                                  )
                                }
                              </span>

                            </button>

                          </div>


                          {/* THREE MONTH */}

                          <div
                            className="col-md-6 col-lg-3 mb-3"
                          >

                            <button

                              type="button"

                              className={
                                `btn w-100 h-100 ${
                                  selectedPlan === 'three_month'
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
                                }`
                              }

                              onClick={() =>
                                handlePlanSelect(
                                  'three_month'
                                )
                              }

                            >

                              <strong>
                                Every 3 Months
                              </strong>

                              <br />

                              <span>
                                ₹ {
                                  Number(
                                    student.threeMonthInstallment || 0
                                  ).toLocaleString(
                                    'en-IN'
                                  )
                                }
                              </span>

                            </button>

                          </div>


                          {/* SIX MONTH */}

                          <div
                            className="col-md-6 col-lg-3 mb-3"
                          >

                            <button

                              type="button"

                              className={
                                `btn w-100 h-100 ${
                                  selectedPlan === 'six_month'
                                    ? 'btn-primary'
                                    : 'btn-outline-primary'
                                }`
                              }

                              onClick={() =>
                                handlePlanSelect(
                                  'six_month'
                                )
                              }

                            >

                              <strong>
                                Every 6 Months
                              </strong>

                              <br />

                              <span>
                                ₹ {
                                  Number(
                                    student.sixMonthInstallment || 0
                                  ).toLocaleString(
                                    'en-IN'
                                  )
                                }
                              </span>

                            </button>

                          </div>


                          {/* FULL PAYMENT */}

                          <div
                            className="col-md-6 col-lg-3 mb-3"
                          >

                            <button

                              type="button"

                              className={
                                `btn w-100 h-100 ${
                                  selectedPlan === 'full'
                                    ? 'btn-success'
                                    : 'btn-outline-success'
                                }`
                              }

                              onClick={() =>
                                handlePlanSelect(
                                  'full'
                                )
                              }

                            >

                              <strong>
                                Full Payment
                              </strong>

                              <br />

                              <span>
                                ₹ {
                                  Number(
                                    student.remainingFees || 0
                                  ).toLocaleString(
                                    'en-IN'
                                  )
                                }
                              </span>

                            </button>

                          </div>


                        </div>


                        {/* SELECTED PLAN */}

                        {selectedPlan && (

                          <div
                            className="alert alert-info mt-3"
                          >

                            <strong>
                              Selected Plan:
                            </strong>{' '}

                            {
                              getPlanLabel(
                                selectedPlan
                              )
                            }

                            <br />

                            <strong>
                              Payment Amount:
                            </strong>{' '}

                            ₹ {
                              Number(
                                amount || 0
                              ).toLocaleString(
                                'en-IN'
                              )
                            }

                          </div>

                        )}

                      </div>

                    )}


                    {/* =============================== */}
                    {/* LOCKED PLAN */}
                    {/* =============================== */}

                    {planLocked && (

                      <div
                        className="mt-4"
                      >

                        <div
                          className="alert alert-primary"
                        >

                          <strong>
                            Your Payment Plan
                          </strong>

                          <br />

                          {
                            getPlanLabel(
                              student.paymentPlan
                            )
                          }

                          <br />

                          <strong>
                            Payment Amount:
                          </strong>{' '}

                          ₹ {
                            Number(
                              amount || 0
                            ).toLocaleString(
                              'en-IN'
                            )
                          }

                        </div>

                      </div>

                    )}


                    {/* =============================== */}
                    {/* AMOUNT */}
                    {/* =============================== */}

                    {selectedPlan && (

                      <div
                        className="mt-4"
                      >

                        <label
                          className="form-label"
                        >

                          Payment Amount

                        </label>


                        <input

                          type="number"

                          className="form-control"

                          value={amount}

                          onChange={(e) => {

                            // Once plan is selected,
                            // amount should normally
                            // remain fixed.

                            const value =
                              Number(
                                e.target.value
                              )


                            setAmount(
                              value
                            )

                          }}

                          min="1"

                          max={
                            student.remainingFees
                          }

                          readOnly

                        />


                        <small
                          className="text-muted"
                        >

                          Remaining Fee: ₹ {
                            Number(
                              student.remainingFees || 0
                            ).toLocaleString(
                              'en-IN'
                            )
                          }

                        </small>


                        <br />


                        <button

                          type="button"

                          className="btn btn-success mt-4"

                          onClick={
                            handlePayment
                          }

                          disabled={loading}

                        >

                          {loading

                            ? 'Processing...'

                            : `Pay ₹${Number(
                                amount || 0
                              ).toLocaleString(
                                'en-IN'
                              )}`

                          }

                        </button>

                      </div>

                    )}

                  </>

                )}

              </div>

            </>

          )}

        </div>

      </div>

    </section>

  )

}


export default ExistingStudent