import { useEffect, useState } from 'react'

import axios from 'axios'

import { Link } from 'react-router-dom'

// Import CSS
import '../assets/styles/achievements.css'

function Achievements() {

  // ======================================
  // STATE
  // ======================================

  const [achievementData,
    setAchievementData]

    = useState([])

  // ======================================
  // FETCH ACHIEVEMENTS
  // ======================================

  useEffect(() => {

    const fetchAchievements =
      async () => {

        try {

          const response =
            await axios.get(
              'https://eduportal-backend-m5t1.onrender.com/api/achievements'
            )

          setAchievementData(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchAchievements()

  }, [])

  return (

    <>

      {/* ====================================== */}
      {/* ACHIEVEMENTS SECTION */}
      {/* ====================================== */}

      <section
        id="achievements"
        className="py-5"
        data-aos="fade-up"
      >

        <div className="container">

          {/* Heading */}
          <div className="text-center mb-5">

            <h2 className="fw-bold">
              Our Achievements
            </h2>

            <p className="text-muted">
              Celebrating the success of our students.
            </p>

          </div>

          {/* ====================================== */}
          {/* STATS */}
          {/* ====================================== */}

          <div
            className="row text-center mb-5"
            data-aos="fade-up"
          >

            <div className="col-md-4 mb-3">

              <h3 className="fw-bold text-primary">
                1200+
              </h3>

              <p className="text-muted mb-0">
                Students Trained
              </p>

            </div>

            <div className="col-md-4 mb-3">

              <h3 className="fw-bold text-success">
                650+
              </h3>

              <p className="text-muted mb-0">

                Competitive Exam Selections

              </p>

            </div>

            <div className="col-md-4 mb-3">

              <h3 className="fw-bold text-warning">
                35+
              </h3>

              <p className="text-muted mb-0">

                National/State Level Awards

              </p>

            </div>

          </div>

          {/* ====================================== */}
          {/* ACHIEVEMENT CARDS */}
          {/* ====================================== */}

          <div className="row g-4">

            {achievementData.map((item, index) => (

              <div
                className="col-md-4"
                key={item._id}
                data-aos="zoom-in"
                data-aos-delay={index * 100}
              >

                <div className="card h-100 shadow-sm achievement-card">

                  {/* Achievement Image */}
                  <img
                    src={`https://eduportal-backend-m5t1.onrender.com${item.image}`}
                    className="card-img-top"
                    alt={item.studentName}
                  />

                  <div className="card-body">

                    {/* Student Name */}
                    <h5 className="card-title fw-bold">

                      {item.studentName}

                    </h5>

                    {/* Course + Rank */}
                    <p className="text-muted mb-2">

                      {item.course}
                      {' | '}
                      {item.rank}

                    </p>

                    {/* Marks */}
                    <p className="fw-semibold text-success">

                      Marks:
                      {' '}
                      {item.marks}

                    </p>

                    {/* Description */}
                    <p className="card-text text-muted">

                      {item.description}

                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {/* ====================================== */}
          {/* SUCCESS QUOTES */}
          {/* ====================================== */}

          <div
            className="mt-5"
            data-aos="fade-right"
          >

            <h4 className="text-center mb-4 fw-bold">

              What Our Toppers Say

            </h4>

            <div className="row g-4">

              <div className="col-md-6">

                <div className="bg-light p-4 rounded shadow-sm">

                  <p className="mb-1">

                    " Prerna Institute Of Excellence helped me build a strong foundation
                    and gave me the confidence to crack NEET."

                  </p>

                  <small className="text-muted d-block text-end">

                    – Priya Verma

                  </small>

                </div>

              </div>

              <div className="col-md-6">

                <div className="bg-light p-4 rounded shadow-sm">

                  <p className="mb-1">

                    "The mentors here guided me like family.
                    I owe my UPSC success to them."

                  </p>

                  <small className="text-muted d-block text-end">

                    – Vivek Singh

                  </small>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ====================================== */}
      {/* CTA SECTION */}
      {/* ====================================== */}

      <section
        className="py-5 text-center text-white"
        style={{
          backgroundColor: '#198754',
        }}
        data-aos="zoom-in"
      >

        <div className="container">

          <h3 className="fw-bold">

            You Can Be Next!

          </h3>

          <p>

            Join Prerna Institute Of Excellence and turn your dreams into achievements.

          </p>

          <Link
            to="/apply"
            className="btn btn-light px-4 mt-2"
          >

            Apply Today

          </Link>

        </div>

      </section>

    </>

  )

}

export default Achievements