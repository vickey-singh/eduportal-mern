import {
  useState,
} from 'react'

import '../../assets/styles/admin.css'

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../../services/studentService'


function PaymentForm({

  paymentData,

  setPaymentData,

  selectedStudent,

  addPayment,

}) {


  // ======================================
  // RAZORPAY LOADING
  // ======================================

  const [
    razorpayLoading,
    setRazorpayLoading
  ] =
    useState(false)


  // ======================================
  // EXISTING PAYMENT PLAN
  // ======================================

  const lockedPlan =
    selectedStudent?.paymentPlan || ''


  // ======================================
  // SELECTED PAYMENT PLAN
  // ======================================

  const selectedPlan =
    lockedPlan ||
    paymentData.paymentPlan ||
    ''


  // ======================================
  // REMAINING COURSE FEE
  // ======================================

  const remainingFee =
    Number(
      selectedStudent?.remainingFees || 0
    )


  // ======================================
  // GET MINIMUM PAYMENT
  // ======================================

  const getMinimumAmount = () => {

    switch (selectedPlan) {

      case 'monthly':

        return Number(
          selectedStudent?.monthlyInstallment || 0
        )


      case 'three_month':

        return Number(
          selectedStudent?.threeMonthInstallment || 0
        )


      case 'six_month':

        return Number(
          selectedStudent?.sixMonthInstallment || 0
        )


      case 'full':

        return remainingFee


      default:

        return 0

    }

  }


  const minimumAmount =
    getMinimumAmount()


  // ======================================
  // HANDLE PAYMENT PLAN CHANGE
  // ======================================

  const handlePlanChange =
    (e) => {

      const plan =
        e.target.value


      let amount =
        ''


      if (
        plan === 'full'
      ) {

        amount =
          remainingFee

      }

      else if (
        plan === 'monthly'
      ) {

        amount =
          Number(
            selectedStudent?.monthlyInstallment || 0
          )

      }

      else if (
        plan === 'three_month'
      ) {

        amount =
          Number(
            selectedStudent?.threeMonthInstallment || 0
          )

      }

      else if (
        plan === 'six_month'
      ) {

        amount =
          Number(
            selectedStudent?.sixMonthInstallment || 0
          )

      }


      setPaymentData({

        ...paymentData,

        paymentPlan:
          plan,

        amount:
          amount,

      })

    }


  // ======================================
  // HANDLE AMOUNT CHANGE
  // ======================================

  const handleAmountChange =
    (e) => {

      setPaymentData({

        ...paymentData,

        amount:
          e.target.value,

      })

    }


  // ======================================
  // VALIDATE PAYMENT
  // ======================================

  const validatePayment =
    () => {

      const amount =
        Number(
          paymentData.amount || 0
        )


      // ==================================
      // VALIDATE AMOUNT
      // ==================================

      if (
        !amount ||
        amount <= 0
      ) {

        alert(
          'Please enter a valid payment amount.'
        )

        return false

      }


      // ==================================
      // VALIDATE REMAINING FEE
      // ==================================

      if (
        remainingFee <= 0
      ) {

        alert(
          'Course fee is already fully paid.'
        )

        return false

      }


      // ==================================
      // AMOUNT CANNOT EXCEED REMAINING
      // ==================================

      if (
        amount >
        remainingFee
      ) {

        alert(

          `Payment cannot be greater than remaining fee of ₹${remainingFee}.`

        )

        return false

      }


      // ==================================
      // PAYMENT PLAN
      // ==================================

      if (
        !selectedPlan
      ) {

        alert(
          'Please select a payment plan.'
        )

        return false

      }


      // ==================================
      // MINIMUM PAYMENT
      // ==================================

      if (

        selectedPlan !== 'full' &&

        minimumAmount > 0 &&

        amount < minimumAmount

      ) {

        alert(

          `Minimum payment for this plan is ₹${minimumAmount}.`

        )

        return false

      }


      // ==================================
      // FULL PAYMENT
      // ==================================

      if (

        selectedPlan === 'full' &&

        amount !== remainingFee

      ) {

        alert(

          `Full payment must be ₹${remainingFee}.`

        )

        return false

      }


      return true

    }


  // ======================================
  // LOAD RAZORPAY CHECKOUT SCRIPT
  // ======================================

  const loadRazorpayScript =
    () => {

      return new Promise(
        (resolve) => {

          const existingScript =
            document.querySelector(
              'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
            )


          if (
            existingScript
          ) {

            resolve(true)

            return

          }


          const script =
            document.createElement(
              'script'
            )


          script.src =
            'https://checkout.razorpay.com/v1/checkout.js'


          script.onload =
            () => {

              resolve(true)

            }


          script.onerror =
            () => {

              resolve(false)

            }


          document.body.appendChild(
            script
          )

        }
      )

    }


  // ======================================
  // RAZORPAY ONLINE PAYMENT
  // ======================================

  const handleRazorpayPayment =
    async () => {

      if (
        razorpayLoading
      ) {

        return

      }


      // ==================================
      // VALIDATE
      // ==================================

      const valid =
        validatePayment()


      if (!valid) {

        return

      }


      try {

        setRazorpayLoading(
          true
        )


        // ==================================
        // LOAD RAZORPAY
        // ==================================

        const scriptLoaded =
          await loadRazorpayScript()


        if (!scriptLoaded) {

          alert(
            'Unable to load Razorpay Checkout.'
          )

          setRazorpayLoading(
            false
          )

          return

        }


        // ==================================
        // CREATE ORDER
        // ==================================

        const orderResponse =
          await createRazorpayOrder({

            studentId:
              selectedStudent._id,

            amount:
              Number(
                paymentData.amount
              ),

            paymentPlan:
              selectedPlan,

          })


        if (
          !orderResponse?.success
        ) {

          alert(

            orderResponse?.message ||

            'Unable to create Razorpay order.'

          )

          setRazorpayLoading(
            false
          )

          return

        }


        // ==================================
        // RAZORPAY OPTIONS
        // ==================================

        const options = {

          // ==================================
          // LIVE KEY ID
          // ==================================

          key:
            orderResponse.keyId,


          // ==================================
          // AMOUNT
          // ==================================

          amount:
            orderResponse.order.amount,


          // ==================================
          // CURRENCY
          // ==================================

          currency:
            orderResponse.order.currency,


          // ==================================
          // INSTITUTE NAME
          // ==================================

          name:
            'Prerna Institute Of Excellence',


          // ==================================
          // DESCRIPTION
          // ==================================

          description:

            `Course Fee - ${selectedStudent.name}`,


          // ==================================
          // ORDER ID
          // ==================================

          order_id:
            orderResponse.order.id,


          // ==================================
          // PREFILL
          // ==================================

          prefill: {

            name:
              selectedStudent.name || '',

            email:
              selectedStudent.email || '',

            contact:
              selectedStudent.contact || '',

          },


          // ==================================
          // NOTES
          // ==================================

          notes: {

            admissionNumber:
              selectedStudent.admissionNumber || '',

            course:
              selectedStudent.course || '',

            paymentPlan:
              selectedPlan || '',

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
            async (response) => {

              try {

                // ==========================
                // VERIFY PAYMENT
                // ==========================

                const verifyResponse =
                  await verifyRazorpayPayment({

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_signature:
                      response.razorpay_signature,

                  })


                // ==========================
                // VERIFICATION FAILED
                // ==========================

                if (
                  !verifyResponse?.success
                ) {

                  alert(

                    verifyResponse?.message ||

                    'Payment verification failed.'

                  )

                  setRazorpayLoading(
                    false
                  )

                  return

                }


                // ==========================
                // UPDATE PAYMENT DATA
                // ==========================

                if (
                  verifyResponse.student
                ) {

                  setPaymentData({

                    amount:
                      '',

                    paymentMethod:
                      'Razorpay',

                    paymentDate:

                      new Date()
                        .toISOString()
                        .split('T')[0],

                    paymentPlan:

                      verifyResponse.student
                        .paymentPlan ||

                      selectedPlan ||

                      '',

                  })

                }


                // ==========================
                // SUCCESS MESSAGE
                // ==========================

                alert(
                  'Online Payment Successful.'
                )


                // ==========================
                // RELOAD
                // ==========================
                //
                // Existing parent component
                // ko fresh student data mil jayega.
                //
                // ==========================

                window.location.reload()

              }

              catch (error) {

                console.log(

                  'Razorpay Verification Error:',

                  error

                )


                alert(

                  error?.response?.data?.message ||

                  'Payment was received but verification failed. Please contact admin.'

                )

              }

              finally {

                setRazorpayLoading(
                  false
                )

              }

            },


          // ==================================
          // CHECKOUT CLOSE
          // ==================================

          modal: {

            ondismiss:
              () => {

                setRazorpayLoading(
                  false
                )

              },

          },

        }


        // ==================================
        // CREATE RAZORPAY INSTANCE
        // ==================================

        if (
          !window.Razorpay
        ) {

          alert(
            'Razorpay Checkout is not available.'
          )

          setRazorpayLoading(
            false
          )

          return

        }


        const razorpay =
          new window.Razorpay(
            options
          )


        // ==================================
        // PAYMENT FAILED
        // ==================================

        razorpay.on(

          'payment.failed',

          (response) => {

            console.log(

              'Razorpay Payment Failed:',

              response

            )


            alert(

              response?.error?.description ||

              'Razorpay payment failed.'

            )


            setRazorpayLoading(
              false
            )

          }

        )


        // ==================================
        // OPEN RAZORPAY
        // ==================================

        razorpay.open()

      }

      catch (error) {

        console.log(

          'Razorpay Payment Error:',

          error

        )


        alert(

          error?.response?.data?.message ||

          'Unable to start Razorpay payment.'

        )


        setRazorpayLoading(
          false
        )

      }

    }


  // ======================================
  // OFFLINE PAYMENT
  // ======================================

  const handleOfflinePayment =
    () => {

      const valid =
        validatePayment()


      if (!valid) {

        return

      }


      addPayment(
        selectedStudent._id
      )

    }


  // ======================================
  // PAYMENT PLAN LABEL
  // ======================================

  const getPlanLabel =
    () => {

      switch (
        selectedPlan
      ) {

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


  return (

    <div className="mb-4">


      {/* ==================================
          HEADING
      ================================== */}

      <h4 className="mb-3">

        Add Course Fee Payment

      </h4>


      <div className="row">


        {/* ==================================
            PAYMENT PLAN
        ================================== */}

        <div className="col-md-4 mb-3">

          <label className="form-label">

            Payment Plan

          </label>


          {lockedPlan ? (

            <>

              <select
                className="form-control"
                value={
                  lockedPlan
                }
                disabled
              >

                <option value="monthly">

                  Monthly

                </option>

                <option value="three_month">

                  Every 3 Months

                </option>

                <option value="six_month">

                  Every 6 Months

                </option>

                <option value="full">

                  Full Payment

                </option>

              </select>


              <small className="text-success">

                Payment plan is locked for this student.

              </small>

            </>

          ) : (

            <>

              <select
                className="form-control"
                value={
                  paymentData.paymentPlan || ''
                }
                onChange={
                  handlePlanChange
                }
              >

                <option value="">

                  Select Payment Plan

                </option>

                <option value="monthly">

                  Monthly

                </option>

                <option value="three_month">

                  Every 3 Months

                </option>

                <option value="six_month">

                  Every 6 Months

                </option>

                <option value="full">

                  Full Payment

                </option>

              </select>


              <small className="text-muted">

                Select once. It will be locked after
                the first course-fee payment.

              </small>

            </>

          )}

        </div>


        {/* ==================================
            PAYMENT AMOUNT
        ================================== */}

        <div className="col-md-4 mb-3">

          <label className="form-label">

            Payment Amount

          </label>


          <input
            type="number"
            className="form-control"
            placeholder="Enter Amount"
            value={
              paymentData.amount
            }
            onChange={
              handleAmountChange
            }
            min="1"
            max={
              remainingFee
            }
          />


          {selectedPlan && (

            <small className="text-muted">

              {selectedPlan === 'full'

                ? `Full payment: ₹${remainingFee}`

                : `Minimum payment: ₹${minimumAmount}`

              }

            </small>

          )}

        </div>


        {/* ==================================
            PAYMENT METHOD
        ================================== */}

        <div className="col-md-4 mb-3">

          <label className="form-label">

            Payment Method

          </label>


          <select
            className="form-control"
            value={
              paymentData.paymentMethod
            }
            onChange={(e) =>

              setPaymentData({

                ...paymentData,

                paymentMethod:
                  e.target.value,

              })

            }
          >

            <option value="Cash">

              Cash

            </option>

            <option value="UPI">

              UPI

            </option>

            <option value="Card">

              Card

            </option>

            <option value="Bank Transfer">

              Bank Transfer

            </option>

            <option value="Razorpay">

              Razorpay - Online

            </option>

          </select>

        </div>


        {/* ==================================
            PAYMENT DATE
        ================================== */}

        <div className="col-md-4 mb-3">

          <label className="form-label">

            Payment Date

          </label>


          <input
            type="date"
            className="form-control"
            value={
              paymentData.paymentDate
            }
            onChange={(e) =>

              setPaymentData({

                ...paymentData,

                paymentDate:
                  e.target.value,

              })

            }
          />

        </div>


        {/* ==================================
            REMAINING COURSE FEE
        ================================== */}

        <div className="col-md-4 mb-3">

          <label className="form-label">

            Remaining Course Fee

          </label>


          <input
            type="number"
            className="form-control"
            value={
              remainingFee
            }
            readOnly
          />

        </div>


      </div>


      {/* ======================================
          PAYMENT SUMMARY
      ====================================== */}

      {selectedPlan && (

        <div className="alert alert-info">

          <div className="row">

            <div className="col-md-4">

              <strong>

                Plan:

              </strong>

              <br />

              {
                getPlanLabel()
              }

            </div>


            <div className="col-md-4">

              <strong>

                Minimum:

              </strong>

              <br />

              ₹{
                minimumAmount
              }

            </div>


            <div className="col-md-4">

              <strong>

                Remaining:

              </strong>

              <br />

              ₹{
                remainingFee
              }

            </div>

          </div>

        </div>

      )}


      {/* ======================================
          PAYMENT BUTTONS
      ====================================== */}

      <div className="d-flex gap-2 flex-wrap">


        {/* ==================================
            RAZORPAY BUTTON
        ================================== */}

        {paymentData.paymentMethod ===
          'Razorpay' ? (

          <button
            type="button"
            className="table-btn approve-btn"
            onClick={
              handleRazorpayPayment
            }
            disabled={
              remainingFee <= 0 ||
              razorpayLoading
            }
          >

            {

              razorpayLoading

                ? 'Processing...'

                : remainingFee <= 0

                  ? 'Course Fee Paid'

                  : 'Pay Online with Razorpay'

            }

          </button>

        ) : (

          /* ==================================
             OFFLINE PAYMENT BUTTON
          ================================== */

          <button
            type="button"
            className="table-btn approve-btn"
            onClick={
              handleOfflinePayment
            }
            disabled={
              remainingFee <= 0
            }
          >

            {

              remainingFee <= 0

                ? 'Course Fee Paid'

                : 'Add Payment'

            }

          </button>

        )}

      </div>


      {/* ======================================
          RAZORPAY INFORMATION
      ====================================== */}

      {paymentData.paymentMethod ===
        'Razorpay' && (

        <div className="alert alert-warning mt-3 mb-0">

          <strong>

            Online Payment:

          </strong>

          <br />

          Student will pay securely through
          Razorpay Checkout. The payment will be
          added to the student's account only after
          server-side verification.

        </div>

      )}

    </div>

  )

}


export default PaymentForm