import { useEffect, useState } from 'react'

import axios from 'axios'

import '../assets/styles/faculty.css'


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function Faculty() {

  // ======================================
  // STATE
  // ======================================

  const [facultyData, setFacultyData] =
    useState([])


  // ======================================
  // FETCH FACULTY
  // ======================================

  useEffect(() => {

    const fetchFaculty =
      async () => {

        try {

          const response =
            await axios.get(

              `${API_BASE_URL}/api/faculty`

            )


          setFacultyData(
            response.data
          )

        }

        catch (error) {

          console.log(
            'Fetch Faculty Error:',
            error
          )

        }

      }


    fetchFaculty()

  }, [])


  // ======================================
  // IMAGE URL
  // ======================================
  //
  // Cloudinary:
  //     complete URL
  //
  // Old local upload:
  //     /uploads/filename.jpg
  //
  // Supports both.
  // ======================================

  const getImageUrl =
    (image) => {

      if (!image) {

        return '/logo.png'

      }


      // ==================================
      // CLOUDINARY / EXTERNAL URL
      // ==================================

      if (

        image.startsWith(
          'http://'
        ) ||

        image.startsWith(
          'https://'
        )

      ) {

        return image

      }


      // ==================================
      // OLD LOCAL UPLOAD
      // ==================================

      return `${API_BASE_URL}${

        image.startsWith('/')

          ? image

          : `/${image}`

      }`

    }


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


          {/* ==================================
              HEADING
          ================================== */}

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

            {facultyData.map(
              (item, index) => (

                <div

                  className="col-md-4"

                  key={
                    item._id
                  }

                  data-aos="zoom-in"

                  data-aos-delay={
                    index * 100
                  }

                >

                  <div className="card border-0 shadow-sm text-center py-4 faculty-card">


                    {/* ==================================
                        FACULTY IMAGE
                    ================================== */}

                    <img

                      src={
                        getImageUrl(
                          item.image
                        )
                      }

                      className="rounded-circle mx-auto mb-3 faculty-img"

                      alt={
                        item.name
                      }

                      onError={(e) => {

                        e.currentTarget.src =
                          '/logo.png'

                      }}

                    />


                    <div className="card-body">


                      {/* ==================================
                          FACULTY NAME
                      ================================== */}

                      <h5 className="fw-bold">

                        {
                          item.name
                        }

                      </h5>


                      {/* ==================================
                          SUBJECT + EXPERIENCE
                      ================================== */}

                      <p className="text-muted mb-1">

                        {
                          item.subject
                        }

                        {' | '}

                        {
                          item.experience
                        }

                      </p>


                      {/* ==================================
                          DESCRIPTION
                      ================================== */}

                      <p className="text-muted small">

                        {
                          item.description
                        }

                      </p>

                    </div>

                  </div>

                </div>

              )

            )}

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


                {/* ==================================
                    PREV BUTTON
                ================================== */}

                <button

                  className="carousel-control-prev"

                  type="button"

                  data-bs-target="#facultyTestimonial"

                  data-bs-slide="prev"

                >

                  <span className="carousel-control-prev-icon"></span>

                </button>


                {/* ==================================
                    NEXT BUTTON
                ================================== */}

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