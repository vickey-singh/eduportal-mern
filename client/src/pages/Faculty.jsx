import { useEffect, useState } from 'react'

import axios from 'axios'

import '../assets/styles/faculty.css'

function Faculty() {

  // ======================================
  // STATE
  // ======================================

  const [facultyData, setFacultyData]
    = useState([])

  // ======================================
  // FETCH FACULTY
  // ======================================

  useEffect(() => {

    const fetchFaculty =
      async () => {

        try {

          const response =
            await axios.get(
              'https://eduportal-backend-m5t1.onrender.com/api/faculty'
            )

          setFacultyData(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchFaculty()

  }, [])

  return (

    <>

      {/* ====================================== */}
      {/* FACULTY SECTION */}
      {/* ====================================== */}

      <section
        id="faculty"
        className="py-5 bg-light"
        data-aos="fade-up"
      >

        <div className="container">

          {/* Heading */}
          <div className="text-center mb-5">

            <h2 className="fw-bold">
              Our Faculty
            </h2>

            <p className="text-muted">
              Meet our experienced educators who are passionate
              about shaping your future.
            </p>

          </div>

          {/* ====================================== */}
          {/* FACULTY CARDS */}
          {/* ====================================== */}

          <div className="row g-4">

            {facultyData.map((item, index) => (

              <div
                className="col-md-4"
                key={item._id}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >

                <div className="card border-0 shadow-sm text-center py-4 faculty-card">

                  {/* Faculty Image */}
                  <img
                    src={`https://eduportal-backend-m5t1.onrender.com${item.image}`}
                    className="rounded-circle mx-auto mb-3 faculty-img"
                    alt={item.name}
                  />

                  <div className="card-body">

                    {/* Faculty Name */}
                    <h5 className="fw-bold">
                      {item.name}
                    </h5>

                    {/* Subject + Experience */}
                    <p className="text-muted mb-1">

                      {item.subject}
                      {' | '}
                      {item.experience}

                    </p>

                    {/* Description */}
                    <p className="text-muted small">

                      {item.description}

                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* ====================================== */}
          {/* PHILOSOPHY */}
          {/* ====================================== */}

          <div className="row mt-5">

            <div className="col-lg-10 mx-auto text-center">

              <h4 className="fw-bold">
                Our Teaching Philosophy
              </h4>

              <p className="text-muted">

                We believe in practical,
                result-oriented education.

                Our faculty uses innovative
                teaching methods,
                digital tools, and regular
                doubt sessions.

              </p>

            </div>

          </div>

          {/* ====================================== */}
          {/* TESTIMONIAL CAROUSEL */}
          {/* ====================================== */}

          <div
            className="row mt-5"
            data-aos="fade-right"
          >

            <div className="col-md-10 mx-auto">

              <div
                id="facultyTestimonial"
                className="carousel slide"
                data-bs-ride="carousel"
              >

                <div className="carousel-inner text-center">

                  <div className="carousel-item active">

                    <blockquote className="blockquote">

                      <p className="mb-2 fst-italic">

                        "Thanks to the dedicated faculty,
                        I cracked NEET with top score."

                      </p>

                      <footer className="blockquote-footer">

                        Sneha Singh

                      </footer>

                    </blockquote>

                  </div>

                  <div className="carousel-item">

                    <blockquote className="blockquote">

                      <p className="mb-2 fst-italic">

                        "The math faculty made even the toughest
                        topics feel simple."

                      </p>

                      <footer className="blockquote-footer">

                        Rohan Jha

                      </footer>

                    </blockquote>

                  </div>

                </div>

                {/* Prev Button */}
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#facultyTestimonial"
                  data-bs-slide="prev"
                >

                  <span className="carousel-control-prev-icon"></span>

                </button>

                {/* Next Button */}
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#facultyTestimonial"
                  data-bs-slide="next"
                >

                  <span className="carousel-control-next-icon"></span>

                </button>

              </div>

            </div>

          </div>

          {/* ====================================== */}
          {/* STATS */}
          {/* ====================================== */}

          <div
            className="row text-center mt-5"
            data-aos="fade-right"
          >

            <div className="col-md-4">

              <h2 className="text-success fw-bold">
                98%
              </h2>

              <p className="text-muted">
                Student Satisfaction
              </p>

            </div>

            <div className="col-md-4">

              <h2 className="text-primary fw-bold">
                1200+
              </h2>

              <p className="text-muted">
                Students Mentored
              </p>

            </div>

            <div className="col-md-4">

              <h2 className="text-warning fw-bold">
                15+
              </h2>

              <p className="text-muted">
                Competitive Exams Covered
              </p>

            </div>

          </div>

        </div>

      </section>

    </>

  )

}

export default Faculty