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

            <p className="text-muted mx-auto" style={{ maxWidth: "850px" }}>
             At Prerna Institute Of Excellence, we are committed to providing quality education,
             innovative teaching methodologies, and comprehensive academic support that
             empower students to achieve excellence. Our experienced faculty members,
             modern learning environment, and student-centric approach ensure that every
             learner receives the guidance, confidence, and practical knowledge required
             for academic success and career growth. We focus on building strong
             fundamentals, critical thinking, and lifelong learning skills.
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

            {/* Service 4 */}
            <div className="col-md-4" data-aos="zoom-in">
            
              <div className="card h-100 shadow-sm service-card">
            
                <div className="card-body text-center">
            
                  <i className="fas fa-book-open fa-3x text-danger mb-3"></i>
            
                  <h5 className="fw-bold">
                    Digital Study Materials
                  </h5>
            
                  <p className="text-muted">
                    Access updated notes, e-books, assignments,
                    and learning resources anytime.
                  </p>
            
                </div>
            
              </div>
            
            </div>
            
            {/* Service 5 */}
            <div className="col-md-4" data-aos="zoom-in">
            
              <div className="card h-100 shadow-sm service-card">
            
                <div className="card-body text-center">
            
                  <i className="fas fa-laptop fa-3x text-info mb-3"></i>
            
                  <h5 className="fw-bold">
                    Smart Classrooms
                  </h5>
            
                  <p className="text-muted">
                    Interactive classrooms equipped with
                    digital teaching tools and modern technology.
                  </p>
            
                </div>
            
              </div>
            
            </div>
            
            {/* Service 6 */}
            <div className="col-md-4" data-aos="zoom-in">
            
              <div className="card h-100 shadow-sm service-card">
            
                <div className="card-body text-center">
            
                  <i className="fas fa-chart-line fa-3x text-success mb-3"></i>
            
                  <h5 className="fw-bold">
                    Regular Mock Tests
                  </h5>
            
                  <p className="text-muted">
                    Weekly assessments, performance analysis,
                    and personalized improvement plans.
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
            <p
              className="text-muted mx-auto mb-5"
              style={{ maxWidth: "850px" }}
            >
              Students choose Prerna Institute Of Excellence because of our commitment to quality education,
              experienced faculty, personalized mentoring, and a positive learning
              environment. We encourage innovation, discipline, and confidence, helping
              every student achieve academic excellence and prepare for future success.
            </p>

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
            <div className="row text-center g-4 mt-2">

            <div className="col-md-3">
          
              <i className="fas fa-users fa-3x text-primary mb-2"></i>
          
              <h6 className="fw-semibold">
                Small Batch Size
              </h6>
          
            </div>
          
            <div className="col-md-3">
          
              <i className="fas fa-book-reader fa-3x text-danger mb-2"></i>
          
              <h6 className="fw-semibold">
                Personalized Mentorship
              </h6>
          
            </div>
          
            <div className="col-md-3">
          
              <i className="fas fa-medal fa-3x text-warning mb-2"></i>
          
              <h6 className="fw-semibold">
                Proven Results
              </h6>
          
            </div>
          
            <div className="col-md-3">
          
              <i className="fas fa-globe fa-3x text-success mb-2"></i>
          
              <h6 className="fw-semibold">
                Modern Learning
              </h6>
          
            </div>
          
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
           Ready to Start Your Learning Journey?
         </h2>
         
         <p className="mt-3 mx-auto" style={{ maxWidth: "750px" }}>
           Join thousands of successful students who have trusted Prerna Institute Of Excellence
           for quality education, expert guidance, and career-focused learning.
           Admissions are now open for the new academic session. Take the first step
           toward a brighter future today.
         </p>

          <div className="row text-center mt-4">

           <div className="col-md-3"> Expert Faculty</div>
         
           <div className="col-md-3"> Smart Classes</div>
         
           <div className="col-md-3"> Affordable Fees</div>
         
           <div className="col-md-3"> Career Guidance</div>
         
         </div>
          
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