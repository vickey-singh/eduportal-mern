import { Link } from 'react-router-dom'

// Import CSS
import '../assets/styles/services.css'

function Services() {
  return (
    <>

      {/* ✅ Services Section Start */}
      <section id="services" className="py-5 bg-light"
      data-aos="fade-up"
      >

        <div className="container">

          {/* Heading */}
          <div className="text-center mb-5">

            <h2 className="fw-bold">
              Our Services
            </h2>

            <p className="text-muted">
              At EduPortal, we are dedicated to shaping the future
              of students with high-quality education, career guidance,
              and personal mentorship.
            </p>

          </div>

          {/* Services Row */}
          <div className="row g-4">

            {/* Service 1 */}
            <div className="col-md-4"
            data-aos="zoom-in"
            >

              <div className="card h-100 shadow-sm service-card">

                <div className="card-body text-center">

                  <i className="fas fa-graduation-cap fa-3x text-primary mb-3"></i>

                  <h5 className="card-title fw-bold">
                    Quality Education
                  </h5>

                  <p className="card-text text-muted">
                    Structured courses, syllabus coverage,
                    concept clarity and exam strategies.
                  </p>

                </div>

              </div>

            </div>

            {/* Service 2 */}
            <div className="col-md-4"
            data-aos="zoom-in"
            data-aos-delay="200"
            >

              <div className="card h-100 shadow-sm service-card">

                <div className="card-body text-center">

                  <i className="fas fa-chalkboard-teacher fa-3x text-success mb-3"></i>

                  <h5 className="card-title fw-bold">
                    Experienced Faculty
                  </h5>

                  <p className="card-text text-muted">
                    Passionate educators with years of experience.
                  </p>

                </div>

              </div>

            </div>

            {/* Service 3 */}
            <div className="col-md-4"
            data-aos="zoom-in"
            data-aos-delay="400"
            >

              <div className="card h-100 shadow-sm service-card">

                <div className="card-body text-center">

                  <i className="fas fa-briefcase fa-3x text-warning mb-3"></i>

                  <h5 className="card-title fw-bold">
                    Career Guidance
                  </h5>

                  <p className="card-text text-muted">
                    Stream selection and future career planning support.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ✅ Why Students Love Us */}
      <section className="py-5"
      data-aos="zoom-in"
      >

        <div className="container">

          <div className="text-center mb-5">

            <h2 className="fw-bold">
              Why Students Love Us
            </h2>

          </div>

          <div className="row text-center g-4">

            <div className="col-md-3">

              <i className="fas fa-smile-beam fa-3x text-success mb-2"></i>

              <h6 className="fw-semibold">
                Friendly Environment
              </h6>

            </div>

            <div className="col-md-3">

              <i className="fas fa-lightbulb fa-3x text-warning mb-2"></i>

              <h6 className="fw-semibold">
                Concept-Based Learning
              </h6>

            </div>

            <div className="col-md-3">

              <i className="fas fa-award fa-3x text-primary mb-2"></i>

              <h6 className="fw-semibold">
                Award-Winning Faculty
              </h6>

            </div>

            <div className="col-md-3">

              <i className="fas fa-headset fa-3x text-info mb-2"></i>

              <h6 className="fw-semibold">
                24x7 Student Support
              </h6>

            </div>

          </div>

        </div>

      </section>

      {/* ✅ CTA */}
      <section
        className="py-5 text-center text-white"
        style={{ backgroundColor: '#0d6efd' }}
      >

        <div className="container">

          <h2 className="fw-bold">
            Ready to Join EduPortal?
          </h2>

          <p>
            Secure your future today.
          </p>

          <Link
            to="/apply"
            className="btn btn-light px-4 mt-3"
          >
            Apply Now
          </Link>

        </div>

      </section>

    </>
  )
}

export default Services