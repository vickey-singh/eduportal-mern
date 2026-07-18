import '../../assets/styles/admin.css'

function PaymentHistory({
    selectedStudent,
}) {

    return (

                    <div className="mt-5">

              <h4 className="mb-3">
                Payment History
              </h4>

              <div className="table-responsive">

                <table className="table applications-table">

                  <thead>

                    <tr>

                      <th>Amount</th>

                      <th>Method</th>

                      <th>Date</th>

                    </tr>

                  </thead>

                  <tbody>

                    {selectedStudent.paymentHistory &&
                    selectedStudent.paymentHistory.length > 0 ? (

                      selectedStudent.paymentHistory.map(

                        (payment, index) => (

                          <tr key={index}>

                            <td>
                              ₹ {payment.amount}
                            </td>

                            <td>
                              {payment.paymentMethod}
                            </td>

                            <td>
                              {payment.paymentDate}
                            </td>

                          </tr>

                        )

                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="3"
                          className="text-center"
                        >

                          No Payment History

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

    )

}

export default PaymentHistory