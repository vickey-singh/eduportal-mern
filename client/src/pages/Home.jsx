import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'

import axios from 'axios'

import CountUp from 'react-countup'

import aboutImage from '../assets/images/about.jpeg'

import principalImage from '../assets/images/principal.jpeg'

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
            'https://eduportal-backend-m5t1.onrender.com/api/notices'
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
    
            : '📢 Welcome To Prerna Institute'
    
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
             Prerna
             </span>{' '}

            <span className="hero-portal">
             Institute
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

          <h2>Welcome to Prerna Institute</h2>

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


      {/* ====================================== */}
{/* ABOUT US */}
{/* ====================================== */}

<section
  className="py-5 bg-white"
  data-aos="fade-up"
>

  <div className="container">

    <div className="row align-items-center">

      {/* Left Image */}

      <div className="col-lg-5 mb-4 mb-lg-0">

        <img
          src={aboutImage}
          alt="About Prerna Institute"
          className="img-fluid rounded shadow"
        />

      </div>

      {/* Right Content */}

      <div className="col-lg-7">

        

        <h2 className="fw-bold mt-2 mb-4">
          About Prerna Institute Institute
        </h2>

        <p>
          Prerna Institute Institute is a trusted educational institution dedicated
          to providing quality education and career-oriented learning for
          students. Our mission is to empower learners with knowledge,
          confidence, and practical skills that help them succeed in academics,
          competitive examinations, and professional careers.
        </p>

        <p>
          With experienced faculty members, modern teaching methodologies,
          well-equipped classrooms, and a student-focused approach, we create
          an environment where every learner can achieve excellence. We believe
          education is not just about passing examinations—it is about building
          character, confidence, leadership, and lifelong learning habits.
        </p>

        <p>
          At Prerna Institute, we continuously strive to maintain the highest academic
          standards through regular assessments, personalized mentoring, doubt
          clearing sessions, digital learning resources, and career guidance.
          Thousands of students have trusted us to shape their future, and we
          remain committed to helping every learner reach their full potential.
        </p>

        <div className="row mt-4">

          <div className="col-md-6">

            <p>✔ Experienced Faculty Members</p>
            <p>✔ Smart Digital Classrooms</p>
            <p>✔ Regular Mock Tests</p>

          </div>

          <div className="col-md-6">

            <p>✔ Career Guidance</p>
            <p>✔ Personalized Mentorship</p>
            <p>✔ Affordable Quality Education</p>

          </div>

        </div>

      </div>

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

      <section className="py-5 bg-light">
      
        <div className="container">
      
          <div className="row align-items-center">
      
            {/* Left Image */}
      
            <div className="col-lg-4 text-center mb-4 mb-lg-0">
      
              <img
                src={principalImage}
                alt="Principal"
                className="principal-image img-fluid shadow"
              />
      
              <h4 className="mt-4 mb-1">
                Dr. Rajesh Kumar
              </h4>
      
              <p className="text-muted">
                Principal
              </p>
      
            </div>
      
            {/* Right Content */}
      
            <div className="col-lg-8">
      
              <h2 className="mb-4">
                Principal's Message
              </h2>
      
              <p>
                At Prerna Institute, we don't just teach—we inspire. We believe that every
                student has the potential to achieve excellence when guided with the
                right knowledge, discipline, and encouragement.
              </p>
      
              <p>
                Our mission is to provide quality education through experienced
                faculty members, innovative teaching methods, and continuous academic
                support. We focus on building confident, responsible, and future-ready
                individuals who can contribute positively to society.
              </p>
      
              <blockquote className="principal-quote">
      
                "Education is the foundation of a successful future. Our responsibility
                is not only to teach students but also to inspire them to become
                confident, responsible, and lifelong learners."
      
              </blockquote>
      
            </div>
      
          </div>
      
        </div>
      
      </section>

      {/* ✅ Achievements Preview */}
      <section className="py-5 bg-light text-center">

        <div className="container">

          <h2 className="mb-3">
            Our Achievements
          </h2>

          <p>
            Our achievements reflect the dedication of our faculty,
            the determination of our students, and the continuous
            support of parents. Every success story motivates us to
            deliver even higher standards of education.
            
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
            Why Choose Prerna Institute?
          </h2>
          <p className="mb-5">
           Prerna Institute Institute is committed to delivering quality
           education through modern infrastructure, experienced
           faculty, practical learning, and personalized guidance.
           We ensure every student receives the attention and
           support required to achieve academic excellence.
           
           </p>

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