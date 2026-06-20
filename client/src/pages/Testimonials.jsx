import { useEffect, useState } from 'react'

import axios from 'axios'

import '../assets/styles/testimonials.css'

function Testimonials() {

  // ======================================
  // STATE
  // ======================================

  const [testimonials,
    setTestimonials]

    = useState([])

  const [feedbacks,
    setFeedbacks]

    = useState([])

  const [formData,
    setFormData]

    = useState({

      studentName: '',

      course: '',

      message: '',

      rating: 5,

    })

  // ======================================
  // FETCH TESTIMONIALS
  // ======================================

  useEffect(() => {

    const fetchTestimonials =
      async () => {

        try {

          const response =
            await axios.get(
              'https://eduportal-backend-m5t1.onrender.com/api/testimonials'
            )

          setTestimonials(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchTestimonials()

  }, [])

  // ======================================
  // FETCH APPROVED FEEDBACKS
  // ======================================

  useEffect(() => {

    const fetchApprovedFeedbacks =
      async () => {

        try {

          const response =
            await axios.get(
              'https://eduportal-backend-m5t1.onrender.com/api/feedback/approved'
            )

          setFeedbacks(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchApprovedFeedbacks()

  }, [])

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
  // SUBMIT FEEDBACK
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      try {

        await axios.post(

          'https://eduportal-backend-m5t1.onrender.com/api/feedback',

          formData

        )

        alert(
          'Feedback Submitted Successfully'
        )

        // Reset Form
        setFormData({

          studentName: '',

          course: '',

          message: '',

          rating: 5,

        })

      } catch (error) {

        console.log(error)

        alert(
          'Feedback Submission Failed'
        )

      }

    }

  // ======================================
  // STAR RENDER
  // ======================================

  const renderStars = (rating) => {

    return '⭐'.repeat(rating)

  }

  return (

    <>

      {/* ====================================== */}
      {/* PREMIUM TESTIMONIALS */}
      {/* ====================================== */}

      <section
        id="testimonials"
        className="py-5 bg-light"
        data-aos="fade-up"
      >

        <div className="container">

          {/* Heading */}
          <h2 className="text-center mb-5 fw-bold">

            What Our Students Say

          </h2>

          {/* Cards */}
          <div className="row g-4">

            {testimonials.map((item, index) => (

              <div
                className="col-md-4"
                key={item._id}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >

                <div className="testimonial-card p-4 bg-white shadow rounded h-100">

                  {/* Image */}
                  <div className="text-center mb-3">

                    <img
                      src={`https://eduportal-backend-m5t1.onrender.com${item.image}`}
                      alt={item.studentName}
                      className="rounded-circle testimonial-img"
                    />

                  </div>

                  {/* Name */}
                  <h5 className="text-center fw-bold">

                    {item.studentName}

                  </h5>

                  {/* Course */}
                  <p className="text-muted small text-center">

                    {item.course}

                  </p>

                  {/* Review */}
                  <p className="text-center fst-italic text-muted">

                    "{item.review}"

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ====================================== */}
      {/* STATS SECTION */}
      {/* ====================================== */}

      <section
        className="py-5"
        data-aos="fade-up"
      >

        <div className="container">

          <div className="row justify-content-center">

            <div className="col-lg-8">

              <div className="feedback-form shadow p-5 rounded bg-white text-center">

                <h3 className="fw-bold mb-3">

                  Trusted By Hundreds Of Students

                </h3>

                <p className="text-muted">

                  Our students consistently achieve
                  excellent results and recommend
                  EduPortal for quality education,
                  guidance, and mentorship.

                </p>

                <div className="row mt-4">

                  <div className="col-md-4">

                    <h2 className="fw-bold text-primary">

                      1200+

                    </h2>

                    <p className="text-muted">

                      Happy Students

                    </p>

                  </div>

                  <div className="col-md-4">

                    <h2 className="fw-bold text-success">

                      98%

                    </h2>

                    <p className="text-muted">

                      Positive Reviews

                    </p>

                  </div>

                  <div className="col-md-4">

                    <h2 className="fw-bold text-warning">

                      650+

                    </h2>

                    <p className="text-muted">

                      Successful Selections

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ====================================== */}
      {/* FEEDBACK FORM */}
      {/* ====================================== */}

      <section
        className="py-5 bg-light"
        data-aos="fade-up"
      >

        <div className="container">

          <div className="row justify-content-center">

            <div className="col-lg-7">

              <div className="feedback-form shadow p-5 rounded bg-white">

                <h3 className="text-center fw-bold mb-4">

                  Share Your Feedback

                </h3>

                <form onSubmit={handleSubmit}>

                  {/* Name */}
                  <div className="mb-3">

                    <input
                      type="text"
                      name="studentName"
                      className="form-control"
                      placeholder="Your Name"
                      value={formData.studentName}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* Course */}
                  <div className="mb-3">

                    <input
                      type="text"
                      name="course"
                      className="form-control"
                      placeholder="Your Course"
                      value={formData.course}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  {/* Rating */}
                  <div className="mb-3">

                    <label className="form-label fw-bold">

                      Rating

                    </label>

                    <select
                      className="form-control"
                      name="rating"
                      value={formData.rating}
                      onChange={handleChange}
                    >

                      <option value="5">
                        ⭐⭐⭐⭐⭐ (5)
                      </option>

                      <option value="4">
                        ⭐⭐⭐⭐ (4)
                      </option>

                      <option value="3">
                        ⭐⭐⭐ (3)
                      </option>

                      <option value="2">
                        ⭐⭐ (2)
                      </option>

                      <option value="1">
                        ⭐ (1)
                      </option>

                    </select>

                  </div>

                  {/* Message */}
                  <div className="mb-4">

                    <textarea
                      rows="5"
                      className="form-control"
                      placeholder="Write your feedback"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>

                  </div>

                  {/* Submit */}
                  <div className="text-center">

                    <button
                      type="submit"
                      className="btn feedback-btn px-4"
                    >

                      Submit Feedback

                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ====================================== */}
      {/* APPROVED FEEDBACKS */}
      {/* ====================================== */}

      <section
        className="py-5"
        data-aos="fade-up"
      >

        <div className="container">

          <h2 className="text-center fw-bold mb-5">

            Student Feedbacks

          </h2>

          <div className="row g-4">

            {feedbacks.map((item, index) => (

              <div
                className="col-md-4"
                key={item._id}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >

                <div className="testimonial-card p-4 bg-white shadow rounded h-100">

                  {/* Name */}
                  <h5 className="fw-bold text-center">

                    {item.studentName}

                  </h5>

                  {/* Course */}
                  <p className="text-muted text-center">

                    {item.course}

                  </p>

                  {/* Rating */}
                  <div className="text-center mb-2">

                    {renderStars(item.rating)}

                  </div>

                  {/* Message */}
                  <p className="text-center fst-italic text-muted">

                    "{item.message}"

                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

    </>

  )

}

export default Testimonials