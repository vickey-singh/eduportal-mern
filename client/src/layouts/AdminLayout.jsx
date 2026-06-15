import { Outlet, NavLink } from 'react-router-dom'

import { useState } from 'react'

import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaTrophy,
  FaClipboardList,
  FaCommentDots,
  FaTachometerAlt,
  FaImages,
  FaEnvelope,
  FaSignOutAlt,
  FaStar,
  FaBullhorn,
  FaDownload,
  FaCog,
  FaBars,
} from 'react-icons/fa'

import '../assets/styles/admin-layout.css'

function AdminLayout() {

  const [sidebarOpen,
    setSidebarOpen]

    = useState(false)

  const handleLogout = () => {

    localStorage.removeItem(
      'token'
    )

    window.location.href =
      '/admin/login'

  }

  const closeSidebar = () => {

    setSidebarOpen(false)

  }

  return (

    <section className="admin-dashboard">

      {/* Sidebar */}

      <aside

        className={

          sidebarOpen

            ? 'admin-sidebar active'

            : 'admin-sidebar'

        }

      >

      
      <div className="sidebar-header">

  <button

    className="close-sidebar-btn"

    onClick={() =>
      setSidebarOpen(false)
    }

  >

    ✕

  </button>

</div>


        <h2 className="admin-logo">

          <span className="edu">
            Edu
          </span>

          <span className="portal">
            Portal
          </span>

        </h2>

        <ul className="admin-menu">

          <li>

            <NavLink
              to="/admin/dashboard"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaTachometerAlt />

              Dashboard

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/students"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaUserGraduate />

              Students

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/faculty"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaChalkboardTeacher />

              Faculty

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/achievements"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaTrophy />

              Achievements

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/applications"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaClipboardList />

              Applications

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/testimonials"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaCommentDots />

              Testimonials

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/feedbacks"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaStar />

              Feedbacks

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/notices"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaBullhorn />

              Notices

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/downloads"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaDownload />

              Downloads

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/gallery"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaImages />

              Gallery

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/messages"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaEnvelope />

              Messages

            </NavLink>

          </li>

          <li>

            <NavLink
              to="/admin/settings"
              onClick={closeSidebar}
              className={({ isActive }) =>
                isActive
                  ? 'admin-link active-admin-link'
                  : 'admin-link'
              }
            >

              <FaCog />

              Settings

            </NavLink>

          </li>

          <li>

            <button

              onClick={() => {

                closeSidebar()

                handleLogout()

              }}

              className="admin-link logout-btn"

            >

              <FaSignOutAlt />

              Logout

            </button>

          </li>

        </ul>

      </aside>

      {/* Main Content */}

      <main className="admin-main">

        <div className="admin-topbar">

          <button

            className="mobile-menu-btn"

            onClick={() =>

              setSidebarOpen(

                !sidebarOpen

              )

            }

          >

            <FaBars />

          </button>

          <h3>

            EduPortal Admin Panel

          </h3>

          <div className="admin-profile">

            Admin

          </div>

        </div>

        <Outlet />

      </main>

    </section>

  )

}

export default AdminLayout