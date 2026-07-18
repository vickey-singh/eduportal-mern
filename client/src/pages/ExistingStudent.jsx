import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import {
  verifyStudent,
} from '../services/studentService'

import '../assets/styles/existing-student.css'

import {
  createOrder,
  payExistingStudent,
} from '../services/paymentService'

function ExistingStudent() {

    const navigate = useNavigate()

  const [formData, setFormData] = useState({

    admissionNumber: '',

    name: '',

    phone: '',

    email: '',

  })

  const [student, setStudent] = useState(null)

  const [amount, setAmount] = useState('')

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    })

  }

  const handleSubmit = async (e) => {
  
    e.preventDefault()
  
    try {
  
      const response =
        await verifyStudent(formData)
  
      setStudent(response.student)

      setAmount(response.student.remainingFees)
  
      alert('Student Verified Successfully')
  
    } 
    catch (error) {

      console.log(error)
    
      if (error.response) {
    
        alert(error.response.data.message)
    
      } else {
    
        alert('Cannot connect to server.')
    
      }
    
    }
  
  }

  const openRazorpay = (order) => {

  const options = {

    key: import.meta.env.VITE_RAZORPAY_KEY_ID,

    amount: order.amount,

    currency: order.currency,

    name: 'Prerna Institute',

    description: 'Remaining Fee Payment',

    order_id: order.id,

    prefill: {

      name: student.name,

      email: student.email,

      contact: student.contact,

    },

    theme: {

      color: '#0d6efd',

    },

    handler: async function (response) {
    
      try {
    
        const result = await payExistingStudent({
    
          admissionNumber: student.admissionNumber,
    
          amountPaid: Number(amount),
    
          transactionId: response.razorpay_payment_id,
    
          orderId: response.razorpay_order_id,
    
        })
    
        setStudent(result.student)
    
        setAmount(result.student.remainingFees)
    
        alert(result.message)

        navigate(`/receipt/${result.receiptNumber}`)
    
      } catch (error) {
    
        console.log(error)
    
        alert(
    
          error.response?.data?.message ||
    
          'Payment Update Failed'
    
        )
    
      }
    
    },

  }

  const razorpay = new window.Razorpay(options)

  razorpay.open()

}

  const handlePayment = async () => {

  const enteredAmount = Number(amount)

  // Amount should not be greater than remaining fee
  if (enteredAmount > student.remainingFees) {

    alert(
      'Entered amount cannot be greater than the remaining fee.'
    )

    return

  }

  // Last Payment
  if (
    student.remainingFees <= student.minimumInstallment
  ) {

    // Payment Allowed
   const order = await createOrder({
          amount: enteredAmount,
        })

    openRazorpay(order.order)

    return

  }

  // Minimum Installment Check
  if (
    enteredAmount < student.minimumInstallment
  ) {

    alert(
      `Minimum installment amount is ₹${student.minimumInstallment}.`
    )

    return

  }

  // Payment Allowed
  const order = await createOrder({
      amount: enteredAmount,
    })
    
  openRazorpay(order.order)

}

  return (

    <section className="existing-student-page">

      <div className="container">

        <div className="existing-header text-center">

          <h1>

            Existing Student

          </h1>

          <p>

            Verify your details to pay your remaining course fee.

          </p>

        </div>

        <div className="existing-form-wrapper">

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-6 mb-4">

                <label className="form-label">

                  Admission Number

                </label>

                <input

                  type="text"

                  className="form-control"

                  name="admissionNumber"

                  placeholder="Enter Admission Number"

                  value={formData.admissionNumber}

                  onChange={handleChange}

                  required

                />

              </div>

              <div className="col-md-6 mb-4">

                <label className="form-label">

                  Student Name

                </label>

                <input

                  type="text"

                  className="form-control"

                  name="name"

                  placeholder="Enter Student Name"

                  value={formData.name}

                  onChange={handleChange}

                  required

                />

              </div>

              <div className="col-md-6 mb-4">

                <label className="form-label">

                  Mobile Number

                </label>

                <input

                  type="text"

                  className="form-control"

                  name="phone"

                  placeholder="Enter Mobile Number"

                  value={formData.phone}

                  onChange={handleChange}

                  required

                />

              </div>

              <div className="col-md-6 mb-4">

                <label className="form-label">

                  Email (Optional)

                </label>

                <input

                  type="email"

                  className="form-control"

                  name="email"

                  placeholder="Enter Email"

                  value={formData.email}

                  onChange={handleChange}

                />

              </div>

            </div>

            <button

              className="apply-btn"

              type="submit"

            >

              Verify Student

            </button>

          </form>

          {student && (
           
             <div className="card mt-5 shadow">
           
               <div className="card-header bg-primary text-white">
           
                 <h4 className="mb-0">
           
                   Student Details
           
                 </h4>
           
               </div>
           
               <div className="card-body">
           
                 <div className="row">
           
                   <div className="col-md-6 mb-3">
           
                     <strong>Admission No :</strong>
           
                     <br />
           
                     {student.admissionNumber}
           
                   </div>
           
                   <div className="col-md-6 mb-3">
           
                     <strong>Name :</strong>
           
                     <br />
           
                     {student.name}
           
                   </div>
           
                   <div className="col-md-6 mb-3">
           
                     <strong>Course :</strong>
           
                     <br />
           
                     {student.course}
           
                   </div>
           
                   <div className="col-md-6 mb-3">
           
                     <strong>Fees Status :</strong>
           
                     <br />
           
                     {student.feesStatus}
           
                   </div>
           
                   <div className="col-md-4 mb-3">
           
                     <strong>Total Fee</strong>
           
                     <br />
           
                     ₹ {student.totalFees}
           
                   </div>
           
                   <div className="col-md-4 mb-3">
           
                     <strong>Paid Fee</strong>
           
                     <br />
           
                     ₹ {student.paidFees}
           
                   </div>
           
                   <div className="col-md-4 mb-3">
           
                     <strong>Remaining Fee</strong>
           
                     <br />
           
                     ₹ {student.remainingFees}
           
                   </div>

                   <div className="col-md-4 mb-3">

                      <strong>Minimum Installment</strong>
                    
                      <br />
                    
                      ₹ {student.minimumInstallment}
                    
                    </div>
                    
                    <div className="col-md-4 mb-3">
                    
                      <strong>Installment Allowed</strong>
                    
                      <br />
                    
                      {student.installmentAllowed ? 'Yes' : 'No'}
                    
                    </div>
           
                 </div>
           
               </div>
           
             </div>
           
           )}

           {student && (
            
              <>
                <hr />
            
                <div className="mt-4">
            
                  <h5 className="mb-3">
                    Pay Remaining Fee
                  </h5>
            
                  <div className="row">
                    <div className="col-md-6">
            
                      <label className="form-label">
                        Amount
                      </label>
            
                      <input
                        type="number"
                        className="form-control"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
            
                    </div>
                  </div>
            
                  {student.remainingFees > 0 ? (
            
                    <button
                      className="btn btn-success mt-4"
                      onClick={handlePayment}
                    >
                      Pay Now
                    </button>
            
                  ) : (
            
                    <div className="alert alert-success mt-4">
                      ✅ Course Fee Fully Paid
                    </div>
            
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