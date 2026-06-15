import { useState } from 'react'

import axios from 'axios'

import '../assets/styles/apply.css'

function Apply() {

  // ======================================
  // FORM STATE
  // ======================================

  const [formData, setFormData] = useState({

    name: '',

    email: '',

    phone: '',

    course: '',

    address: '',

    message: '',

  })

  // ======================================
  // HANDLE INPUT CHANGE
  // ======================================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]: e.target.value,

    })

  }

  // ======================================
  // HANDLE FORM SUBMIT
  // ======================================

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      const response = await axios.post(
        'http://localhost:8000/api/apply',
        formData
      )

      alert(response.data.message)

      // Reset Form
      setFormData({

        name: '',

        email: '',

        phone: '',

        course: '',

        address: '',

        message: '',

      })

    } catch (error) {

      console.log(error)

      alert('Something went wrong')

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

                  <option value="JEE Preparation">
                    JEE Preparation
                  </option>

                  <option value="NEET Preparation">
                    NEET Preparation
                  </option>

                  <option value="UPSC Foundation">
                    UPSC Foundation
                  </option>

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

              Submit Application

            </button>

          </form>

        </div>

      </div>

    </section>

  )
}

export default Apply