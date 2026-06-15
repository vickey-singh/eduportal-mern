import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'

import axios from 'axios'

import CountUp from 'react-countup'

// Import Home CSS
import '../assets/styles/home.css'


function Home() {

  const [showPopup,
  setShowPopup]

  = useState(true)

  const [notices,
    setNotices]

    = useState([])

  useEffect(() => {

    fetchNotices()

  }, [])


  const pinnedNotice =

  notices.find(

    (notice) =>

      notice.isPinned

  )

const importantNotice =

  notices.find(

    (notice) =>

      notice.isImportant

  )

  useEffect(() => {

  if (importantNotice) {

    const closedNotice =

      localStorage.getItem(
        'closedNotice'
      )

    if (

      closedNotice ===
      importantNotice._id

    ) {

      setShowPopup(false)

    }

    else {

      setShowPopup(true)

    }

  }

}, [importantNotice])

  

  const fetchNotices =
    async () => {

      try {

        const response =
          await axios.get(
            'http://localhost:8000/api/notices'
          )

        setNotices(
          response.data
        )

      } catch (error) {

        console.log(error)

      }

    }

  return (
    <>

    {/* ====================================== */}
    {/* IMPORTANT NOTICE POPUP */}
    {/* ====================================== */}
    
    {
    
      importantNotice &&
    
      showPopup && (
    
        <div className="notice-popup-overlay">
    
          <div className="notice-popup">
    
            <button
    
              className="popup-close"
    
              onClick={() => {
    
                localStorage.setItem(
    
                  'closedNotice',
    
                  importantNotice._id
    
                )
    
                setShowPopup(false)
    
              }}
    
            >
    
              ×
    
            </button>
    
            <h3>
    
              ⚠ Important Notice
    
            </h3>
    
            <h4>
    
              {importantNotice.title}
    
            </h4>
    
            <small>
    
              {new Date(
                importantNotice.createdAt
              ).toLocaleDateString()}
    
            </small>
    
            <p>
    
              {importantNotice.description}
    
            </p>
    
          </div>
    
        </div>
    
      )
    
    }

    {/* ====================================== */}
    {/* NOTICE MARQUEE */}
    {/* ====================================== */}
    
    <section className="notice-marquee">
    
      <marquee
    
        behavior="scroll"
    
        direction="left"
    
        scrollamount="6"
    
      >
    
        {
    
          notices.length > 0
    
            ? notices
    
                .map(
    
                  (notice) =>
    
                    `📢 ${notice.title} - ${notice.description}`
    
                )
    
                .join(
    
                  '   |   '
    
                )
    
            : '📢 Welcome To EduPortal'
    
        }
    
      </marquee>
    
    </section>


      {/* ✅ Hero Section / Home Section */}
      <section
         className="py-5 text-center bg-light"
         id="about"
         data-aos="fade-up"
       >
        <div className="container">

          <h1 className="fw-bold display-4">
            Welcome to{' '}

            <span className="hero-edu">
             Edu
             </span>

            <span className="hero-portal">
             Portal
            </span>
         </h1>

          <p className="lead mt-3">
            Your trusted partner for academic excellence.
          </p>

        </div>
      </section>

      {/* ====================================== */}
      {/* PINNED NOTICE */}
      {/* ====================================== */}
      
      {
      
        pinnedNotice && (
      
          <section
            className="pinned-notice"
          >
      
            <div className="container">
      
              <div className="pinned-notice-card">
      
                <span className="pin-badge">
      
                  📌 Pinned Notice
      
                </span>
      
                <div>

                  <h3>
                    {pinnedNotice.title}
                  </h3>
                
                  <p>
                    {pinnedNotice.description}
                  </p>
                
                </div>
      
              </div>
      
            </div>
      
          </section>
      
        )
      
      }

      {/* ✅ About Section */}
      <section className="about-section"
      data-aos="zoom-in"
      >
        <div className="content">

          <h2>Welcome to EduPortal</h2>

          <div className="animated-text">

            <p>
              Empowering students with quality education for a brighter future.
            </p>

            <p>
              Join us to learn, grow, and achieve your academic goals.
            </p>

            <p>
              Innovative teaching methods combined with dedicated faculty.
            </p>

          </div>

        </div>
      </section>

      {/* ✅ Quick Stats */}
      <section className="py-5 bg-light text-center"
      data-aos="fade-up"
      >

        <div className="container">

          <div className="row">

            <div className="col-md-3 mb-3">
              <h3 className="text-primary">500+</h3>
              <p>Students</p>
            </div>

            <div className="col-md-3 mb-3">
              <h3 className="text-success">50+</h3>
              <p>Qualified Teachers</p>
            </div>

            <div className="col-md-3 mb-3">
              <h3 className="text-danger">10+</h3>
              <p>Years of Experience</p>
            </div>

            <div className="col-md-3 mb-3">
              <h3 className="text-warning">100%</h3>
              <p>Result Guarantee</p>
            </div>

          </div>

        </div>

      </section>

      {/* ✅ Principal Message */}
      <section className="py-5 text-center">

        <div className="container">

          <h2 className="mb-4">
            Message from the Principal
          </h2>

          <p>
            At EduPortal, we don't just teach — we inspire.
            We ensure students grow emotionally, socially,
            and academically, making them future-ready individuals.
            Join us to be a part of an extraordinary learning journey.
          </p>

        </div>

      </section>

      {/* ✅ Achievements Preview */}
      <section className="py-5 bg-light text-center">

        <div className="container">

          <h2 className="mb-3">
            Our Achievements
          </h2>

          <p>
            Our students consistently secure top ranks and represent
            the school in various state and national events.
          </p>

          <Link
            to="/achievements"
            className="btn btn-outline-primary mt-3"
          >
            View Achievements
          </Link>

        </div>

      </section>

      {/* ✅ Why Choose Us */}
      <section className="py-5"
      data-aos="fade-right"
      >

        <div className="container text-center">

          <h2 className="mb-4">
            Why Choose EduPortal?
          </h2>

          <div className="row">

            <div className="col-md-4">

              <i className="bi bi-book fs-1 text-primary"></i>

              <h5 className="mt-3">
                Modern Curriculum
              </h5>

              <p>
                Updated syllabi with practical, real-world integration.
              </p>

            </div>

            <div className="col-md-4">

              <i className="bi bi-person-check fs-1 text-success"></i>

              <h5 className="mt-3">
                Experienced Faculty
              </h5>

              <p>
                Dedicated educators with proven success records.
              </p>

            </div>

            <div className="col-md-4">

              <i className="bi bi-building fs-1 text-warning"></i>

              <h5 className="mt-3">
                Smart Infrastructure
              </h5>

              <p>
                State-of-the-art facilities for optimal learning.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ✅ Admissions CTA */}
      <section
        className="py-5 text-center text-white"
        style={{ backgroundColor: '#007bff' }}
        data-aos="fade-up"
      >

        <div className="container">

          <h3>
            Admissions Open for 2025-26
          </h3>

          <p>
            Enroll today and be part of a future-focused education system.
          </p>

          <Link
            to="/apply"
            className="btn btn-light mt-2"
          >
            Apply Now
          </Link>

        </div>

      </section>

    </>
  )
}

export default Home