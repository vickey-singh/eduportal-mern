import { useState } from 'react'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'


function TeacherLayout() {

  const navigate =
    useNavigate()


  const [sidebarOpen, setSidebarOpen] =
    useState(false)


  // ======================================
  // TEACHER DATA
  // ======================================

  const teacher =
    JSON.parse(

      localStorage.getItem(
        'teacher'
      ) || 'null'

    )


  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = () => {

    localStorage.removeItem(
      'teacherToken'
    )

    localStorage.removeItem(
      'teacher'
    )

    navigate(
      '/teacher/login',
      {
        replace: true,
      }
    )

  }


  // ======================================
  // MENU ITEMS
  // ======================================

  const menuItems = [

    {
      label: 'Dashboard',
      path: '/teacher/dashboard',
      icon: '🏠',
    },

    {
      label: 'My Classes',
      path: '/teacher/classes',
      icon: '📚',
    },

    {
      label: 'Students',
      path: '/teacher/students',
      icon: '👨‍🎓',
    },

    {
      label: 'Attendance',
      path: '/teacher/attendance',
      icon: '📝',
    },

    {
      label: 'Assignments',
      path: '/teacher/assignments',
      icon: '📖',
    },

    {
      label: 'Marks & Exams',
      path: '/teacher/exams',
      icon: '📊',
    },

    {
      label: 'Study Materials',
      path: '/teacher/materials',
      icon: '📂',
    },

    {
      label: 'Timetable',
      path: '/teacher/timetable',
      icon: '🗓️',
    },

    {
      label: 'Announcements',
      path: '/teacher/announcements',
      icon: '📢',
    },

    {
      label: 'Messages',
      path: '/teacher/messages',
      icon: '💬',
    },

    {
      label: 'Reports',
      path: '/teacher/reports',
      icon: '📈',
    },

    {
      label: 'My Profile',
      path: '/teacher/profile',
      icon: '👤',
    },

  ]


  return (

    <div
      className="teacher-portal"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
      }}
    >


      {/* ====================================== */}
      {/* MOBILE OVERLAY */}
      {/* ====================================== */}

      {sidebarOpen && (

        <div

          onClick={() =>
            setSidebarOpen(false)
          }

          style={{

            position: 'fixed',

            top: 0,

            left: 0,

            width: '100%',

            height: '100%',

            backgroundColor:
              'rgba(0, 0, 0, 0.45)',

            zIndex: 1040,

          }}

        />

      )}


      {/* ====================================== */}
      {/* SIDEBAR */}
      {/* ====================================== */}

      <aside

        style={{

          position: 'fixed',

          top: 0,

          left:
            sidebarOpen
              ? 0
              : undefined,

          width: '260px',

          height: '100vh',

          backgroundColor: '#212529',

          color: '#fff',

          zIndex: 1050,

          display: 'flex',

          flexDirection: 'column',

          overflow: 'hidden',

          transition:
            'left 0.3s ease',

        }}

        className="teacher-sidebar"

      >


        {/* ==================================
            SIDEBAR HEADER
        ================================== */}

        <div

          style={{

            padding: '20px',

            borderBottom:
              '1px solid rgba(255,255,255,0.15)',

            flexShrink: 0,

          }}

        >

          <h5
            className="mb-1 fw-bold"
          >

            Teacher Portal

          </h5>


          <small
            style={{
              color: '#adb5bd',
            }}
          >

            {
              teacher?.name ||
              'Teacher'
            }

          </small>

        </div>


        {/* ==================================
            MENU
        ================================== */}

        <nav

          style={{

            flex: 1,

            overflowY: 'auto',

            padding: '15px',

          }}

        >

          {menuItems.map(
            (item) => (

              <NavLink

                key={
                  item.path
                }

                to={
                  item.path
                }

                end={
                  item.path ===
                  '/teacher/dashboard'
                }

                onClick={() =>
                  setSidebarOpen(false)
                }

                style={({ isActive }) => ({

                  display: 'flex',

                  alignItems: 'center',

                  gap: '12px',

                  width: '100%',

                  padding:
                    '11px 12px',

                  marginBottom:
                    '5px',

                  borderRadius:
                    '6px',

                  textDecoration:
                    'none',

                  color:
                    isActive
                      ? '#fff'
                      : '#adb5bd',

                  backgroundColor:
                    isActive
                      ? '#00adb5'
                      : 'transparent',

                  transition:
                    'all 0.2s ease',

                })}

              >

                <span
                  style={{
                    width: '24px',
                    flexShrink: 0,
                    textAlign: 'center',
                  }}
                >

                  {
                    item.icon
                  }

                </span>


                <span>

                  {
                    item.label
                  }

                </span>

              </NavLink>

            )

          )}

        </nav>


        {/* ==================================
            LOGOUT
        ================================== */}

        <div

          style={{

            padding: '15px',

            borderTop:
              '1px solid rgba(255,255,255,0.15)',

            flexShrink: 0,

          }}

        >

          <button

            type="button"

            className="btn btn-outline-light w-100"

            onClick={
              handleLogout
            }

          >

            🚪 Logout

          </button>

        </div>

      </aside>


      {/* ====================================== */}
      {/* MAIN CONTENT */}
      {/* ====================================== */}

      <div

        className="teacher-main"

        style={{

          minHeight: '100vh',

        }}

      >


        {/* ==================================
            HEADER
        ================================== */}

        <header

          style={{

            height: '70px',

            backgroundColor: '#fff',

            borderBottom:
              '1px solid #dee2e6',

            boxShadow:
              '0 1px 3px rgba(0,0,0,0.05)',

            display: 'flex',

            alignItems: 'center',

            padding:
              '0 20px',

          }}

        >

          <div

            style={{

              width: '100%',

              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'space-between',

            }}

          >


            {/* MOBILE MENU BUTTON */}

            <button

              type="button"

              className="btn btn-outline-secondary teacher-menu-button"

              onClick={() =>
                setSidebarOpen(true)
              }

            >

              ☰

            </button>


            {/* DESKTOP TITLE */}

            <h5

              className="mb-0 fw-bold teacher-header-title"

            >

              Teacher Portal

            </h5>


            {/* TEACHER INFO */}

            <div
              className="text-end"
            >

              <div className="fw-semibold">

                {
                  teacher?.name ||
                  'Teacher'
                }

              </div>


              <small
                className="text-muted"
              >

                {
                  teacher?.teacherId ||
                  ''
                }

              </small>

            </div>

          </div>

        </header>


        {/* ==================================
            PAGE CONTENT
        ================================== */}

        <main

          style={{

            padding:
              '24px',

          }}

        >

          <Outlet />

        </main>

      </div>


      {/* ====================================== */}
      {/* RESPONSIVE CSS */}
      {/* ====================================== */}

      <style>{`

        /* ==============================
           DESKTOP
        ============================== */

        @media (min-width: 992px) {

          .teacher-sidebar {

            left: 0 !important;

          }

          .teacher-main {

            margin-left: 260px !important;

          }

          .teacher-menu-button {

            display: none;

          }

        }


        /* ==============================
           MOBILE / TABLET
        ============================== */

        @media (max-width: 991.98px) {

          .teacher-sidebar {

            left: -260px;

          }

          .teacher-main {

            margin-left: 0 !important;

          }

          .teacher-menu-button {

            display: block;

          }

          .teacher-header-title {

            display: none;

          }

        }

      `}</style>

    </div>

  )

}


export default TeacherLayout