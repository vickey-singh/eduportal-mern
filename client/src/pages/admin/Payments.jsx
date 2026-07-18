import { useEffect, useState } from 'react'

import { getPayments } from '../../services/paymentService'

function Payments() {

  const [searchTerm, setSearchTerm] = useState('')

  const [payments, setPayments] = useState([])

  useEffect(() => {

    fetchPayments()

  }, [])

  const fetchPayments = async () => {

    try {

      const response = await getPayments()

        setPayments(response)

    } catch (error) {

      console.log(error)

    }

  }

  const filteredPayments = payments.filter((payment) =>
    
      payment.admissionNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    
    )
    
  return (

    <div className="applications-section">

      <div className="applications-header">

        <h2>

          Payment Management

        </h2>

        <p>

          View all online payments.

        </p>

      </div>

      <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Admission Number"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        
        </div>

      <div className="table-responsive">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Admission No.</th>

              <th>Student</th>

              <th>Course</th>

              <th>Amount</th>

              <th>Type</th>

              <th>Status</th>

              <th>Date</th>

            </tr>

          </thead>

          <tbody>

            {payments.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="text-center"
                >

                  No Payments Found

                </td>

              </tr>

            ) : (

              filteredPayments.map((payment) => (

                <tr key={payment._id}>

                  <td>

                    {payment.admissionNumber}

                    </td>

                  <td>

                    {payment.studentName}

                  </td>

                  <td>

                    {payment.course}

                  </td>

                  <td>

                    ₹ {payment.amountPaid}

                  </td>

                  <td>

                    {payment.paymentType}

                  </td>

                  <td>

                    {payment.paymentStatus}

                  </td>

                  <td>

                    {new Date(payment.createdAt)
                      .toLocaleDateString()}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default Payments