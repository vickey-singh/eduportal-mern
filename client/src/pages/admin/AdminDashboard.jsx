import { Link } from 'react-router-dom'

import { useEffect, useState } from 'react'

import axios from 'axios'

import {

  FaUserGraduate,

  FaChalkboardTeacher,

  FaTrophy,

  FaImage,

  FaQuoteLeft,

  FaStar,

  FaEnvelope,

  FaMoneyBillWave,

  FaClock,

  FaCheckCircle,

  FaExclamationTriangle,

} from 'react-icons/fa'

import '../../assets/styles/admin-dashboard.css'

function AdminDashboard() {

  // ======================================
  // STATE
  // ======================================

  const [stats, setStats]
    = useState({

      totalStudents: 0,

      totalFaculty: 0,

      totalAchievements: 0,

      totalGallery: 0,

      totalTestimonials: 0,

      totalFeedbacks: 0,

      totalMessages: 0,

      paidStudents: 0,

      partialStudents: 0,

      pendingStudents: 0,

      totalPendingFees: 0,

      feeAlerts: [],

    })

  // ======================================
  // FETCH DASHBOARD DATA
  // ======================================

  useEffect(() => {

    const fetchStats =
      async () => {

        try {

          const response =
            await axios.get(
              'https://eduportal-backend-m5t1.onrender.com/api/dashboard'
            )

          setStats(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchStats()

  }, [])

  return (

    <>

      {/* ====================================== */}
      {/* DASHBOARD CARDS */}
      {/* ====================================== */}

      <div className="admin-cards">

        {/* Students */}
        <Link
          to="/admin/students"
          className="text-decoration-none"
        >

          <div className="admin-card">

            <FaUserGraduate
              className="admin-card-icon"
            />

            <h2>
              {stats.totalStudents}
            </h2>

            <p>
              Total Students
            </p>

          </div>

        </Link>

       
        {/* Fee Alerts */}
        <div className="admin-card">
        
          <FaMoneyBillWave
            className="admin-card-icon"
          />
        
          <h2>
        
            {stats.pendingStudents}
        
          </h2>
        
          <p>
        
            Students Fee Due
        
          </p>
        
          <small>
        
            {stats.pendingStudents} Students Fee Due
        
          </small>
        
        </div>

        {/* Faculty */}
        <Link
          to="/admin/faculty"
          className="text-decoration-none"
        >

          <div className="admin-card">

            <FaChalkboardTeacher
              className="admin-card-icon"
            />

            <h2>
              {stats.totalFaculty}
            </h2>

            <p>
              Faculty Members
            </p>

          </div>

        </Link>

        {/* Achievements */}
        <Link
          to="/admin/achievements"
          className="text-decoration-none"
        >

          <div className="admin-card">

            <FaTrophy
              className="admin-card-icon"
            />

            <h2>
              {stats.totalAchievements}
            </h2>

            <p>
              Achievements
            </p>

          </div>

        </Link>

        {/* Gallery */}
        <Link
          to="/admin/gallery"
          className="text-decoration-none"
        >

          <div className="admin-card">

            <FaImage
              className="admin-card-icon"
            />

            <h2>
              {stats.totalGallery}
            </h2>

            <p>
              Gallery Images
            </p>

          </div>

        </Link>

        {/* Testimonials */}
        <Link
          to="/admin/testimonials"
          className="text-decoration-none"
        >

          <div className="admin-card">

            <FaQuoteLeft
              className="admin-card-icon"
            />

            <h2>
              {stats.totalTestimonials}
            </h2>

            <p>
              Testimonials
            </p>

          </div>

        </Link>

        {/* Feedbacks */}
        <Link
          to="/admin/feedbacks"
          className="text-decoration-none"
        >

          <div className="admin-card">

            <FaStar
              className="admin-card-icon"
            />

            <h2>
              {stats.totalFeedbacks}
            </h2>

            <p>
              Feedbacks
            </p>

          </div>

        </Link>

        {/* Messages */}
        <Link
          to="/admin/messages"
          className="text-decoration-none"
        >

          <div className="admin-card">

            <FaEnvelope
              className="admin-card-icon"
            />

            <h2>
              {stats.totalMessages}
            </h2>

            <p>
              Messages
            </p>

          </div>

        </Link>

      </div>

      {/* ====================================== */}
      {/* FEES ALERTS */}
      {/* ====================================== */}

      <div className="applications-section mt-5">

        <div className="applications-header">

          <h3>
            Fees Due Alerts
          </h3>

          <p>
            Students with pending fees.
          </p>

        </div>

        <div className="table-responsive">

          <table className="table applications-table">

            <thead>

              <tr>

                <th>Student</th>

                <th>Course</th>

                <th>Remaining Fees</th>

                <th>Due Date</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {stats.feeAlerts.map((item) => (

                <tr key={item._id}>

                  <td>
                    {item.name}
                  </td>

                  <td>
                    {item.course}
                  </td>

                  <td>
                    ₹ {item.remainingFees}
                  </td>

                  <td>
                    {item.dueDate}
                  </td>

                  <td>

                    <span
                      className={`status ${item.feesStatus.toLowerCase()}`}
                    >

                      {item.feesStatus}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </>

  )

}

export default AdminDashboard