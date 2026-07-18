import {
  createOrder,
  verifyPayment,
  checkStudent,
} from '../services/paymentService'

import { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import axios from 'axios'

import { API_URL } from '../config/api'

import '../assets/styles/apply.css'

function Apply() {

  const navigate = useNavigate()


  // ======================================
  // FORM STATE
  // ======================================
  const [courses, setCourses] = useState([])

  const [selectedCourse, setSelectedCourse] = useState(null)

  const [formData, setFormData] = useState({

    name: '',

    email: '',

    phone: '',

    course: '',

    address: '',

    message: '',

    paymentType: 'full',

    image: null,

  })

  // ======================================
  // HANDLE INPUT CHANGE
  // ======================================

  const fetchCourses = async () => {

  try {

    const response = await axios.get(
        `${API_URL}/courses`
      )

    console.log(response.data)

    setCourses(response.data)

  } catch (error) {

    console.log(error)

  }

}

useEffect(() => {

  fetchCourses()

}, [])

  const handleChange = (e) => {

  const { name, value } = e.target

  // ==============================
  // COURSE SELECT
  // ==============================

  if (name === 'course') {

    const course = courses.find(

      (item) => item.courseName === value

    )

    setSelectedCourse(course)

  }

  setFormData({

    ...formData,

    [name]: value,

  })

}

const openRazorpay = (order) => {

  const options = {

    key: import.meta.env.VITE_RAZORPAY_KEY_ID,

    amount: order.amount,

    currency: order.currency,

    name: 'Prerna Institute',

    description: 'Admission Fee',

    order_id: order.id,

    prefill: {

      name: formData.name,

      email: formData.email,

      contact: formData.phone,

    },

    theme: {

      color: '#0d6efd',

    },

    handler: async function (response) {
    
      try {
    
        const paymentData = {
    
          ...response,
    
          studentName: formData.name,
    
          email: formData.email,
    
          phone: formData.phone,

          image: formData.image,
    
          course: formData.course,
    
          totalFee: selectedCourse.totalFee,
    
          registrationFee:
            selectedCourse.registrationFee,
    
          minimumInstallment:
            selectedCourse.minimumInstallment,
    
          paymentType:

            formData.paymentType === 'full'
          
              ? 'Full'
          
              : 'Installment',
    
          amountPaid:
    
            formData.paymentType === 'full'
    
              ? selectedCourse.totalFee
    
              : selectedCourse.minimumInstallment,
    
        }
    
        const verifyResponse =
          await verifyPayment(paymentData)
    
        console.log(verifyResponse)
    
        alert(verifyResponse.message)

        if (verifyResponse.receiptNumber) {

          navigate(`/receipt/${verifyResponse.receiptNumber}`)

}
    
      } catch (error) {
    
        console.log(error)
    
        alert('Payment Verification Failed')
    
      }
    
    },

  }

  const razorpay = new window.Razorpay(options)

  razorpay.open()

}

  // ======================================
  // HANDLE FORM SUBMIT
  // ======================================

  const handleSubmit = async (e) => {

  e.preventDefault()

  try {

    const amount =

      formData.paymentType === 'full'

        ? selectedCourse.totalFee

        : selectedCourse.minimumInstallment

        const check = await checkStudent({

          email: formData.email,
        
          phone: formData.phone,
        
        })
        
        if (check.exists) {
        
          alert(
        
            'Student already exists.\n\nPlease use Existing Student Payment.'
        
          )
        
          return
        
        }

    const order = await createOrder({

        amount,
      
      })

    openRazorpay(order.order)

  } 
  
  catch (error) {

    console.log(error)
  
    alert(
  
      error.response?.data?.message ||
  
      'Something went wrong'
  
    )
  
  }

}


  return (

    <section className="apply-page">

      <div className="container">

        {/* ====================================== */}
        {/* HEADING */}
        {/* ====================================== */}

        <div className="apply-header text-center">

          <h1>
            Admission Form
          </h1>

          <p>
            Fill out the form below to apply for admission.
          </p>

        </div>

        {/* ====================================== */}
        {/* FORM */}
        {/* ====================================== */}

        <div className="apply-form-wrapper">

          <form onSubmit={handleSubmit}>

            <div className="row">

              {/* Name */}
              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Full Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>

              {/* Phone */}
              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Phone Number
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

              </div>

              {/* Email */}
              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Email Address
                </label>

                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>

              {/* Student Photo */}
              <div className="col-md-6 mb-4">
              
                <label className="form-label">
                  Upload Passport Size Photo
                </label>
              
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files[0],
                    })
                  }
                />
              
              </div>

              {formData.image && (

                <div className="col-md-6 mb-4">
              
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    width="120"
                    height="120"
                    style={{
                      objectFit: 'cover',
                      borderRadius: '10px',
                    }}
                  />
              
                </div>
              
              )}

              {/* Course */}
              <div className="col-md-6 mb-4">

                <label className="form-label">
                  Select Course
                </label>

                <select
                  className="form-select"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                >

                  <option value="">
                    Choose Course
                  </option>

                  {courses.map((course) => (

                  <option
                    key={course._id}
                    value={course.courseName}
                  >
                
                    {course.courseName}
                
                  </option>
                
                ))}

                </select>

              </div>

              {/* Address */}
              <div className="col-12 mb-4">

                <label className="form-label">
                  Address
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Enter address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                ></textarea>

              </div>

              {/* Message */}
              <div className="col-12 mb-4">

                <label className="form-label">
                  Additional Message
                </label>

                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Write your message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>

              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="apply-btn"
            >

              Proceed to Payment

            </button>

          </form>

          {selectedCourse && (

            <div className="col-12 mb-4">
          
              <div className="card border-success shadow-sm">
          
                <div className="card-body">
          
                  <h5 className="mb-3">
          
                    Course Details
          
                  </h5>
          
                  <div className="row">
          
                    <div className="col-md-6">
          
                      <p>
          
                        <strong>Duration :</strong>
          
                        {selectedCourse.duration}
          
                      </p>
          
                    </div>
          
                    <div className="col-md-6">
          
                      <p>
          
                        <strong>Total Fee :</strong>
          
                        ₹ {selectedCourse.totalFee}
          
                      </p>
          
                    </div>
          
                    <div className="col-md-6">
          
                      {/* <p>
          
                        <strong>Registration Fee :</strong>
          
                        ₹ {selectedCourse.registrationFee}
          
                      </p> */}
          
                    </div>
          
                    <div className="col-md-6">
          
                      <p>
          
                        <strong>Minimum Installment :</strong>
          
                        ₹ {selectedCourse.minimumInstallment}
          
                      </p>
          
                    </div>
          
                    <div className="col-md-6">
          
                      <p>
          
                        <strong>Installment :</strong>
          
                        {selectedCourse.installmentAllowed
                          ? 'Available'
                          : 'Not Available'}
          
                      </p>
          
                    </div>
          
                  </div>
          
                </div>
          
              </div>
          
            </div>
          
          )}

          {selectedCourse && (

            <div className="col-12 mb-4">
          
              <label className="form-label fw-bold">
          
                Select Payment Option
          
              </label>
          
              <div className="d-flex gap-4">
          
                <div className="form-check">
          
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={formData.paymentType === 'full'}
                    onChange={handleChange}
                  />
          
                  <label className="form-check-label">
          
                    Full Payment
          
                  </label>
          
                </div>
          
                <div className="form-check">
          
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentType"
                    value="installment"
                    checked={formData.paymentType === 'installment'}
                    onChange={handleChange}
                  />
          
                  <label className="form-check-label">
          
                    Installment
          
                  </label>
          
                </div>
          
              </div>
          
            </div>
          
          )}

          {selectedCourse && (

            <div className="col-12 mb-4">
          
              <div className="alert alert-primary">
          
                <h5>
          
                  Payment Summary
          
                </h5>
          
                <hr />
          
                <p>
          
                  <strong>
          
                    Payment Type :
          
                  </strong>
          
                  {formData.paymentType === 'full'
          
                    ? 'Full Payment'
          
                    : 'Installment'}
          
                </p>
          
                <p>
          
                  <strong>
          
                    Amount Payable :
          
                  </strong>
          
                  ₹ {
          
                    formData.paymentType === 'full'
          
                      ? selectedCourse.totalFee
          
                      : selectedCourse.minimumInstallment
          
                  }
          
                </p>
          
              </div>
          
            </div>
          
          )}

        </div>

      </div>

    </section>

  )
}

export default Apply