import { useState, useEffect } from 'react'

import axios from 'axios'

import '../assets/styles/contact.css'

function Contact() {

  // ======================================
  // CONTACT FORM STATE
  // ======================================

  const [formData, setFormData] =
    useState({

      name: '',

      email: '',

      subject: '',

      message: '',

    })

  // ======================================
  // SETTINGS STATE
  // ======================================

  const [settings, setSettings] =
    useState(null)

  // ======================================
  // LOAD SETTINGS
  // ======================================

  useEffect(() => {

    fetchSettings()

  }, [])

  const fetchSettings =
    async () => {

      try {

        const response =
          await axios.get(
            'https://eduportal-backend-m5t1.onrender.com/api/settings'
          )

        setSettings(
          response.data
        )

      }

      catch (error) {

        console.log(error)

      }

    }

  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    })

  }

  // ======================================
  // HANDLE SUBMIT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      try {

        const response =
          await axios.post(

            'https://eduportal-backend-m5t1.onrender.com/api/messages',

            formData

          )

        alert(
          response.data.message
        )

        setFormData({

          name: '',

          email: '',

          subject: '',

          message: '',

        })

      }

      catch (error) {

        console.log(error)

        alert(
          'Message Sending Failed'
        )

      }

    }

  return (

    <section
      id="contact"
      className="py-5"
      data-aos="fade-up"
    >

      <div className="container">

        {/* Heading */}

        <h2 className="text-center mb-5 fw-bold">

          Contact {

            settings?.instituteName ||

            'EduPortal'

          }

        </h2>

        <div className="row g-4">

          {/* ====================================== */}
          {/* CONTACT INFO */}
          {/* ====================================== */}

          <div
            className="col-md-5"
            data-aos="fade-right"
          >

            <div className="mb-4">

              <h4 className="fw-bold">

                Contact Info

              </h4>

              <p className="text-muted">

                Feel free to reach out
                for any queries or
                admissions.

              </p>

            </div>

            {/* Address */}

            <div className="mb-3 d-flex align-items-start">

              <i className="bi bi-geo-alt-fill text-primary fs-4 me-3"></i>

              <div>

                <h5 className="fw-bold mb-1">

                  Address

                </h5>

                <p className="text-muted mb-0">

                  {

                    settings?.address ||

                    'Address Not Available'

                  }

                </p>

              </div>

            </div>

            {/* Phone */}

            <div className="mb-3 d-flex align-items-start">

              <i className="bi bi-telephone-fill text-success fs-4 me-3"></i>

              <div>

                <h5 className="fw-bold mb-1">

                  Phone

                </h5>

                <p className="text-muted mb-0">

                  {

                    settings?.phone ||

                    'Phone Not Available'

                  }

                </p>

              </div>

            </div>

            {/* Email */}

            <div className="d-flex align-items-start">

              <i className="bi bi-envelope-fill text-danger fs-4 me-3"></i>

              <div>

                <h5 className="fw-bold mb-1">

                  Email

                </h5>

                <p className="text-muted mb-0">

                  {

                    settings?.email ||

                    'Email Not Available'

                  }

                </p>

              </div>

            </div>

          </div>

          {/* ====================================== */}
          {/* CONTACT FORM */}
          {/* ====================================== */}

          <div
            className="col-md-7"
            data-aos="fade-left"
          >

            <form onSubmit={handleSubmit}>

              <div className="row g-3">

                <div className="col-md-6">

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="col-md-6">

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Your Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="col-12">

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="col-12">

                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Your Message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>

                </div>

                <div className="col-12 text-end">

                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                  >

                    Send Message

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      </div>

    </section>

  )

}

export default Contact