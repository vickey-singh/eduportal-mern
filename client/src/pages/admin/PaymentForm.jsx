import '../../assets/styles/admin.css'

function PaymentForm({
    paymentData,
    setPaymentData,
    selectedStudent,
    addPayment,
}) {

    return (

            <div className="mb-4">

              <h4 className="mb-3">
                Add Payment
              </h4>

              <div className="row">

                {/* Amount */}
                <div className="col-md-4 mb-3">

                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter Amount"
                    value={paymentData.amount}
                    onChange={(e) =>

                      setPaymentData({

                        ...paymentData,

                        amount:
                          e.target.value,

                      })

                    }
                  />

                </div>

                {/* Payment Method */}
                <div className="col-md-4 mb-3">

                  <select
                    className="form-control"
                    value={paymentData.paymentMethod}
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

                {/* Date */}
                <div className="col-md-4 mb-3">

                  <input
                    type="date"
                    className="form-control"
                    value={paymentData.paymentDate}
                    onChange={(e) =>

                      setPaymentData({

                        ...paymentData,

                        paymentDate:
                          e.target.value,

                      })

                    }
                  />

                </div>

              </div>

              <button
                className="table-btn approve-btn"
                onClick={() =>
                  addPayment(
                    selectedStudent._id
                  )
                }
              >

                Add Payment

              </button>

            </div>

    )

}

export default PaymentForm