import '../../assets/styles/admin.css'

function PaymentForm({
  paymentData,
  setPaymentData,
  selectedStudent,
  addPayment,
}) {

  // ======================================
  // EXISTING PAYMENT PLAN
  // ======================================

  const lockedPlan =
    selectedStudent?.paymentPlan || ''


  // ======================================
  // SELECTED PLAN
  // ======================================

  const selectedPlan =
    lockedPlan ||
    paymentData.paymentPlan ||
    ''


  // ======================================
  // REMAINING FEE
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
  // HANDLE PLAN CHANGE
  // ======================================

  const handlePlanChange = (e) => {

    setPaymentData({

      ...paymentData,

      paymentPlan:
        e.target.value,

      // Automatically put minimum
      // amount into payment field.

      amount:
        e.target.value === 'full'

          ? remainingFee

          : e.target.value === 'monthly'

            ? Number(
                selectedStudent?.monthlyInstallment || 0
              )

            : e.target.value === 'three_month'

              ? Number(
                  selectedStudent?.threeMonthInstallment || 0
                )

              : e.target.value === 'six_month'

                ? Number(
                    selectedStudent?.sixMonthInstallment || 0
                  )

                : '',

    })

  }


  // ======================================
  // HANDLE AMOUNT
  // ======================================

  const handleAmountChange = (e) => {

    setPaymentData({

      ...paymentData,

      amount:
        e.target.value,

    })

  }


  // ======================================
  // ADD PAYMENT CLICK
  // ======================================

  const handleAddPayment = () => {

    const amount =
      Number(
        paymentData.amount || 0
      )


    // ==================================
    // AMOUNT VALIDATION
    // ==================================

    if (
      !amount ||
      amount <= 0
    ) {

      alert(
        'Please enter a valid payment amount.'
      )

      return

    }


    // ==================================
    // REMAINING VALIDATION
    // ==================================

    if (
      amount >
      remainingFee
    ) {

      alert(

        `Payment cannot be greater than remaining fee of ₹${remainingFee}.`

      )

      return

    }


    // ==================================
    // PLAN REQUIRED
    // ==================================

    if (
      !selectedPlan
    ) {

      alert(
        'Please select a payment plan.'
      )

      return

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

      return

    }


    // ==================================
    // FULL PAYMENT
    // ======================================

    if (
      selectedPlan === 'full' &&
      amount !== remainingFee
    ) {

      alert(

        `Full payment must be ₹${remainingFee}.`

      )

      return

    }


    // ==================================
    // SEND PAYMENT
    // ==================================

    addPayment(
      selectedStudent._id
    )

  }


  return (

    <div className="mb-4">

      <h4 className="mb-3">
        Add Course Fee Payment
      </h4>


      <div className="row">


        {/* ================================== */}
        {/* PAYMENT PLAN */}
        {/* ================================== */}

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


        {/* ================================== */}
        {/* AMOUNT */}
        {/* ================================== */}

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


        {/* ================================== */}
        {/* PAYMENT METHOD */}
        {/* ================================== */}

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

          </select>

        </div>


        {/* ================================== */}
        {/* DATE */}
        {/* ================================== */}

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


        {/* ================================== */}
        {/* REMAINING FEE */}
        {/* ================================== */}

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


      {/* ====================================== */}
      {/* PAYMENT SUMMARY */}
      {/* ====================================== */}

      {selectedPlan && (

        <div className="alert alert-info">

          <div className="row">

            <div className="col-md-4">

              <strong>
                Plan:
              </strong>

              <br />

              {
                selectedPlan === 'monthly'

                  ? 'Monthly'

                  : selectedPlan === 'three_month'

                    ? 'Every 3 Months'

                    : selectedPlan === 'six_month'

                      ? 'Every 6 Months'

                      : 'Full Payment'
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


      {/* ====================================== */}
      {/* ADD PAYMENT BUTTON */}
      {/* ====================================== */}

      <button
        type="button"
        className="table-btn approve-btn"
        onClick={
          handleAddPayment
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

    </div>

  )

}

export default PaymentForm