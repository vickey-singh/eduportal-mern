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

  const selectedPlan =
    selectedStudent?.paymentPlan || ''


  // ======================================
  // REMAINING COURSE FEE
  // ======================================

  const remainingFee =
    Number(
      selectedStudent?.remainingFees || 0
    )


  // ======================================
  // INSTALLMENT SCHEDULE
  // ======================================

  const installmentSchedule =
    Array.isArray(
      selectedStudent?.installmentSchedule
    )
      ? selectedStudent.installmentSchedule
      : []


  // ======================================
  // GET CURRENT DUE / MINIMUM PAYMENT
  // ======================================
  //
  // Full:
  // → Complete remaining fee
  //
  // Monthly:
  // → Monthly amount
  //
  // Custom Installment:
  // → Current due installment balance
  //
  // ======================================

  const getMinimumAmount = () => {

    // ==================================
    // NOTHING REMAINING
    // ==================================

    if (
      remainingFee <= 0
    ) {

      return 0

    }


    // ==================================
    // FULL PAYMENT
    // ==================================

    if (
      selectedPlan === 'full'
    ) {

      return remainingFee

    }


    // ==================================
    // MONTHLY
    // ==================================

    if (
      selectedPlan === 'monthly'
    ) {

      return Math.min(

        Number(
          selectedStudent?.monthlyAmount ||
          selectedStudent?.monthlyInstallment ||
          0
        ),

        remainingFee

      )

    }


    // ==================================
    // CUSTOM INSTALLMENT
    // ==================================

    if (
      selectedPlan === 'installment'
    ) {

      const today =
        new Date()

      today.setHours(
        23,
        59,
        59,
        999
      )


      // ==================================
      // CURRENT DUE INSTALLMENTS
      // ==================================

      const dueInstallments =
        installmentSchedule
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
          .sort(
            (a, b) => {

              const dateA =
                a?.dueDate
                  ? new Date(
                      a.dueDate
                    ).getTime()
                  : 0

              const dateB =
                b?.dueDate
                  ? new Date(
                      b.dueDate
                    ).getTime()
                  : 0

              return (
                dateA - dateB
              )

            }
          )


      // ==================================
      // CURRENT DUE FOUND
      // ==================================

      if (
        dueInstallments.length > 0
      ) {

        const currentDue =
          dueInstallments[0]


        const amount =
          Number(
            currentDue?.amount || 0
          )

        const paidAmount =
          Number(
            currentDue?.paidAmount || 0
          )

        const balance =
          Math.max(
            0,
            amount - paidAmount
          )


        return Math.min(
          balance,
          remainingFee
        )

      }


      // ==================================
      // NO CURRENT DUE
      // GET NEXT PENDING
      // ==================================

      const pendingInstallments =
        installmentSchedule
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


              return (
                balance > 0 &&
                (
                  item?.status ===
                    'Pending' ||
                  !item?.status
                )
              )

            }
          )
          .sort(
            (a, b) => {

              const dateA =
                a?.dueDate
                  ? new Date(
                      a.dueDate
                    ).getTime()
                  : 0

              const dateB =
                b?.dueDate
                  ? new Date(
                      b.dueDate
                    ).getTime()
                  : 0

              return (
                dateA - dateB
              )

            }
          )


      if (
        pendingInstallments.length > 0
      ) {

        const nextInstallment =
          pendingInstallments[0]


        const amount =
          Number(
            nextInstallment?.amount || 0
          )

        const paidAmount =
          Number(
            nextInstallment?.paidAmount || 0
          )

        const balance =
          Math.max(
            0,
            amount - paidAmount
          )


        return Math.min(
          balance,
          remainingFee
        )

      }

    }


    // ==================================
    // DEFAULT
    // ==================================

    return 0

  }


  const minimumAmount =
    getMinimumAmount()


  // ======================================
  // PLAN LABEL
  // ======================================

  const getPlanLabel = () => {

    switch (
      selectedPlan
    ) {

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
  // GET CURRENT DUE INSTALLMENT
  // ======================================

  const getCurrentDueInstallment = () => {

    if (
      selectedPlan !== 'installment'
    ) {

      return null

    }


    const today =
      new Date()

    today.setHours(
      23,
      59,
      59,
      999
    )


    const dueInstallments =
      installmentSchedule
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
        .sort(
          (a, b) =>
            new Date(
              a.dueDate
            ) -
            new Date(
              b.dueDate
            )
        )


    return (
      dueInstallments[0] ||
      null
    )

  }


  const currentDueInstallment =
    getCurrentDueInstallment()


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
  // HANDLE PAYMENT METHOD
  // ======================================

  const handlePaymentMethodChange =
    (e) => {

      setPaymentData({

        ...paymentData,

        paymentMethod:
          e.target.value,

      })

    }


  // ======================================
  // HANDLE PAYMENT DATE
  // ======================================

  const handlePaymentDateChange =
    (e) => {

      setPaymentData({

        ...paymentData,

        paymentDate:
          e.target.value,

      })

    }


  // ======================================
  // SET MINIMUM AMOUNT
  // ======================================

  const useMinimumAmount = () => {

    if (
      minimumAmount <= 0
    ) {

      return

    }


    setPaymentData({

      ...paymentData,

      amount:
        String(
          minimumAmount
        ),

    })

  }


  // ======================================
  // ADD OFFLINE PAYMENT
  // ======================================

  const handleAddPayment = () => {

    const amount =
      Number(
        paymentData.amount || 0
      )


    // ==================================
    // VALID AMOUNT
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
    // PAYMENT PLAN
    // ==================================

    if (
      !selectedPlan
    ) {

      alert(
        'Payment plan is not selected for this student.'
      )

      return

    }


    // ==================================
    // MINIMUM PAYMENT
    // ==================================

    if (
      minimumAmount > 0 &&
      amount < minimumAmount
    ) {

      alert(

        `Minimum payment required is ₹${minimumAmount}.`

      )

      return

    }


    // ==================================
    // PAYMENT DATE
    // ==================================

    if (
      !paymentData.paymentDate
    ) {

      alert(
        'Please select payment date.'
      )

      return

    }


    // ==================================
    // CONFIRM
    // ==================================

    const confirmed =
      window.confirm(

        `Add offline payment of ₹${amount.toLocaleString(
          'en-IN'
        )}?`

      )


    if (
      !confirmed
    ) {

      return

    }


    // ==================================
    // SEND PAYMENT
    // ==================================

    addPayment(
      selectedStudent._id
    )

  }


  // ======================================
  // NO STUDENT
  // ======================================

  if (
    !selectedStudent
  ) {

    return null

  }


  return (

    <div>


      {/* ======================================
          HEADING
      ====================================== */}

      <h5 className="mb-4">

        💳 Add Course Fee Payment

      </h5>


      {/* ======================================
          CURRENT DUE
      ====================================== */}

      {currentDueInstallment && (

        <div
          className="alert alert-danger mb-4"
        >

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

            <div>

              <strong>
                Current Fee Due
              </strong>

              <br />

              ₹{
                Math.max(

                  0,

                  Number(
                    currentDueInstallment.amount || 0
                  ) -

                  Number(
                    currentDueInstallment.paidAmount || 0
                  )

                ).toLocaleString(
                  'en-IN'
                )
              }

              {' • '}

              Installment #
              {
                currentDueInstallment.installmentNumber ||
                '-'
              }

            </div>


            <div>

              <small>
                Due Date
              </small>

              <br />

              <strong>

                {
                  currentDueInstallment.dueDate
                    ? new Date(
                        currentDueInstallment.dueDate
                      ).toLocaleDateString(
                        'en-IN',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )
                    : '-'
                }

              </strong>

            </div>

          </div>

        </div>

      )}


      {/* ======================================
          PAYMENT FORM
      ====================================== */}

      <div className="row">


        {/* ==================================
            PAYMENT PLAN
        ================================== */}

        <div className="col-md-4 mb-3">

          <label className="form-label">

            Payment Plan

          </label>


          <input
            type="text"
            className="form-control bg-light"
            value={
              getPlanLabel()
            }
            readOnly
          />


          <small className="text-success d-block mt-1">

            Payment plan is locked for this student.

          </small>

        </div>


        {/* ==================================
            PAYMENT AMOUNT
        ================================== */}

        <div className="col-md-4 mb-3">

          <label className="form-label">

            Payment Amount

          </label>


          <div className="input-group">

            <span className="input-group-text">

              ₹

            </span>


            <input
              type="number"
              className="form-control"
              placeholder="Enter Amount"
              min="1"
              max={
                remainingFee
              }
              value={
                paymentData.amount
              }
              onChange={
                handleAmountChange
              }
            />

          </div>


          <div className="d-flex justify-content-between mt-1">

            <small className="text-muted">

              Minimum payment:
              {' '}
              ₹{
                minimumAmount.toLocaleString(
                  'en-IN'
                )
              }

            </small>


            {minimumAmount > 0 && (

              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={
                  useMinimumAmount
                }
              >

                Use Minimum

              </button>

            )}

          </div>

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
            onChange={
              handlePaymentMethodChange
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

            <option value="Cheque">
              Cheque
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
            onChange={
              handlePaymentDateChange
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


        {/* ==================================
            DUE DATE
        ================================== */}

        <div className="col-md-4 mb-3">

          <label className="form-label">

            Current Due Date

          </label>


          <input
            type="text"
            className="form-control bg-light"
            value={
              selectedStudent.dueDate
                ? new Date(
                    selectedStudent.dueDate
                  ).toLocaleDateString(
                    'en-IN',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }
                  )
                : '-'
            }
            readOnly
          />


          <small className="text-muted">

            Next due date will update automatically
            after payment.

          </small>

        </div>

      </div>


      {/* ======================================
          PAYMENT SUMMARY
      ====================================== */}

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
              minimumAmount.toLocaleString(
                'en-IN'
              )
            }

          </div>


          <div className="col-md-4">

            <strong>
              Remaining:
            </strong>

            <br />

            ₹{
              remainingFee.toLocaleString(
                'en-IN'
              )
            }

          </div>

        </div>

      </div>


      {/* ======================================
          PAYMENT BUTTON
      ====================================== */}

      <div className="d-flex gap-2 flex-wrap">

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


      {/* ======================================
          INFO
      ====================================== */}

      <div className="alert alert-secondary mt-3 mb-0">

        <strong>
          Offline Payment:
        </strong>

        {' '}

        Admin can record Cash, UPI, Card,
        Bank Transfer or Cheque payment here.

        The payment will be applied to the
        student's unpaid installment automatically.

      </div>

    </div>

  )

}


export default PaymentForm