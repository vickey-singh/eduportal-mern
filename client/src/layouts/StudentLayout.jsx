import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  FaBell,
  FaCheckCircle,
  FaTrash,
  FaTimes,
} from 'react-icons/fa'

import {
  getStudentNotifications,
  markStudentNotificationAsRead,
  markAllStudentNotificationsAsRead,
  deleteStudentNotification,
  deleteAllStudentNotifications,
} from '../services/studentNotificationService'


function StudentLayout() {

  const navigate =
    useNavigate()


  // ======================================
  // SIDEBAR
  // ======================================

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false)


  // ======================================
  // STUDENT DATA
  // ======================================

  const student =
    JSON.parse(

      localStorage.getItem(
        'student'
      ) || 'null'

    )


  // ======================================
  // NOTIFICATIONS
  // ======================================

  const [
    notifications,
    setNotifications,
  ] = useState([])


  // ======================================
  // NOTIFICATION DROPDOWN
  // ======================================

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false)


  // ======================================
  // NOTIFICATION REF
  // ======================================

  const notificationRef =
    useRef(null)


  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = () => {

    localStorage.removeItem(
      'studentToken'
    )

    localStorage.removeItem(
      'student'
    )

    navigate(
      '/student/login',
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
      path: '/student/dashboard',
      icon: '🏠',
    },

    {
      label: 'My Courses / Classes',
      path: '/student/courses',
      icon: '📚',
    },

    {
      label: 'Timetable',
      path: '/student/timetable',
      icon: '🗓️',
    },

    {
      label: 'Attendance',
      path: '/student/attendance',
      icon: '📝',
    },

    {
      label: 'Assignments',
      path: '/student/assignments',
      icon: '📖',
    },

    {
      label: 'Study Materials',
      path: '/student/study-materials',
      icon: '📂',
    },

    {
      label: 'Marks & Exam',
      path: '/student/marks',
      icon: '📊',
    },

    {
      label: 'Notices / Announcements',
      path: '/student/announcements',
      icon: '📢',
    },

    {
      label: 'Messages',
      path: '/student/messages',
      icon: '💬',
    },

    {
      label: 'Fees / Payment',
      path: '/student/fees',
      icon: '💳',
    },

    {
      label: 'Reports',
      path: '/student/reports',
      icon: '📜',
    },

    {
      label: 'My Profile',
      path: '/student/profile',
      icon: '👤',
    },

  ]


  // ======================================
  // FETCH NOTIFICATIONS
  // ======================================

  const fetchNotifications =
    async () => {

      try {

        const data =
          await getStudentNotifications()


        setNotifications(
          data.notifications || []
        )

      }

      catch (error) {

        console.log(
          'Fetch Student Notifications Error:',
          error
        )

      }

    }


  // ======================================
  // INITIAL NOTIFICATION FETCH
  // ======================================

  useEffect(() => {

    fetchNotifications()

  }, [])


  // ======================================
  // AUTO REFRESH
  // ======================================
  //
  // Har 10 seconds mein notifications
  // refresh hongi.
  //
  // ======================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        fetchNotifications()

      }, 10000)


    return () => {

      clearInterval(
        interval
      )

    }

  }, [])


  // ======================================
  // CLOSE NOTIFICATION DROPDOWN
  // OUTSIDE CLICK
  // ======================================

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (

          notificationRef.current &&

          !notificationRef.current.contains(
            event.target
          )

        ) {

          setNotificationOpen(
            false
          )

        }

      }


    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )


    return () => {

      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )

    }

  }, [])


  // ======================================
  // UNREAD COUNT
  // ======================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length


  // ======================================
  // NOTIFICATION ICON
  // ======================================

  const getNotificationIcon =
    (type) => {

      switch (type) {

        case 'Timetable':

          return '🗓️'


        case 'Attendance':

          return '📝'


        case 'Assignment':

          return '📖'


        case 'StudyMaterial':

          return '📂'


        case 'Exam':

          return '📊'


        case 'Marks':

          return '📊'


        case 'Announcement':

          return '📢'


        case 'Message':

          return '💬'


        default:

          return (
            <FaBell />
          )

      }

    }


  // ======================================
  // NOTIFICATION CLICK
  // ======================================
  //
  // 1. Mark as read
  // 2. Close dropdown
  // 3. Open related page
  //
  // ======================================

  const handleNotificationClick =
    async (
      notification
    ) => {

      try {

        if (
          !notification.isRead
        ) {

          await markStudentNotificationAsRead(
            notification._id
          )


          setNotifications(
            (previous) =>

              previous.map(
                (item) =>

                  item._id ===
                  notification._id

                    ? {

                        ...item,

                        isRead: true,

                      }

                    : item

              )

          )

        }


        setNotificationOpen(
          false
        )


        if (
          notification.link
        ) {

          navigate(
            notification.link
          )

        }

      }

      catch (error) {

        console.log(
          'Student Notification Click Error:',
          error
        )

      }

    }


  // ======================================
  // MARK ALL AS READ
  // ======================================

  const handleMarkAllAsRead =
    async (
      event
    ) => {

      event?.stopPropagation()


      try {

        await markAllStudentNotificationsAsRead()


        setNotifications(
          (previous) =>

            previous.map(
              (notification) => ({

                ...notification,

                isRead: true,

              })
            )

        )

      }

      catch (error) {

        console.log(
          'Mark All Student Notifications Error:',
          error
        )

      }

    }


  // ======================================
  // DELETE ONE NOTIFICATION
  // ======================================

  const handleDeleteNotification =
    async (
      event,
      notificationId
    ) => {

      event.stopPropagation()


      try {

        await deleteStudentNotification(
          notificationId
        )


        setNotifications(
          (previous) =>

            previous.filter(
              (notification) =>
                notification._id !==
                notificationId
            )

        )

      }

      catch (error) {

        console.log(
          'Delete Student Notification Error:',
          error
        )

      }

    }


  // ======================================
  // CLEAR ALL NOTIFICATIONS
  // ======================================

  const handleClearAll =
    async (
      event
    ) => {

      event.stopPropagation()


      if (
        notifications.length === 0
      ) {

        return

      }


      const confirmed =
        window.confirm(
          'Are you sure you want to clear all notifications?'
        )


      if (!confirmed) {

        return

      }


      try {

        await deleteAllStudentNotifications()


        setNotifications([])

      }

      catch (error) {

        console.log(
          'Clear All Student Notifications Error:',
          error
        )

      }

    }


  return (

    <div

      className="student-portal"

      style={{

        minHeight:
          '100vh',

        backgroundColor:
          '#f8f9fa',

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

            position:
              'fixed',

            top:
              0,

            left:
              0,

            width:
              '100%',

            height:
              '100%',

            backgroundColor:
              'rgba(0, 0, 0, 0.45)',

            zIndex:
              1040,

          }}

        />

      )}


      {/* ====================================== */}
      {/* SIDEBAR */}
      {/* ====================================== */}

      <aside

        style={{

          position:
            'fixed',

          top:
            0,

          left:
            sidebarOpen
              ? 0
              : undefined,

          width:
            '260px',

          height:
            '100vh',

          backgroundColor:
            '#212529',

          color:
            '#fff',

          zIndex:
            1050,

          display:
            'flex',

          flexDirection:
            'column',

          overflow:
            'hidden',

          transition:
            'left 0.3s ease',

        }}

        className="student-sidebar"

      >


        {/* ==================================
            SIDEBAR HEADER
        ================================== */}

        <div

          style={{

            padding:
              '20px',

            borderBottom:
              '1px solid rgba(255,255,255,0.15)',

            flexShrink:
              0,

          }}

        >

          <h5
            className="mb-1 fw-bold"
          >

            Student Portal

          </h5>


          <small

            style={{

              color:
                '#adb5bd',

            }}

          >

            {
              student?.name ||
              'Student'
            }

          </small>

        </div>


        {/* ==================================
            MENU
        ================================== */}

        <nav

          style={{

            flex:
              1,

            overflowY:
              'auto',

            padding:
              '15px',

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
                  '/student/dashboard'

                }

                onClick={() =>
                  setSidebarOpen(
                    false
                  )
                }

                style={({ isActive }) => ({

                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    '12px',

                  width:
                    '100%',

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

                    width:
                      '24px',

                    flexShrink:
                      0,

                    textAlign:
                      'center',

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

            padding:
              '15px',

            borderTop:
              '1px solid rgba(255,255,255,0.15)',

            flexShrink:
              0,

          }}

        >

          <button

            type="button"

            className="
              btn
              btn-outline-light
              w-100
            "

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

        className="student-main"

        style={{

          minHeight:
            '100vh',

        }}

      >


        {/* ==================================
            HEADER
        ================================== */}

        <header

          style={{

            height:
              '70px',

            backgroundColor:
              '#fff',

            borderBottom:
              '1px solid #dee2e6',

            boxShadow:
              '0 1px 3px rgba(0,0,0,0.05)',

            display:
              'flex',

            alignItems:
              'center',

            padding:
              '0 20px',

            position:
              'relative',

            zIndex:
              1000,

          }}

        >

          <div

            style={{

              width:
                '100%',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'space-between',

            }}

          >


            {/* ==================================
                MOBILE MENU BUTTON
            ================================== */}

            <button

              type="button"

              className="
                btn
                btn-outline-secondary
                student-menu-button
              "

              onClick={() =>
                setSidebarOpen(
                  true
                )
              }

            >

              ☰

            </button>


            {/* ==================================
                DESKTOP TITLE
            ================================== */}

            <h5

              className="
                mb-0
                fw-bold
                student-header-title
              "

            >

              Student Portal

            </h5>


            {/* ==================================
                HEADER RIGHT
            ================================== */}

            <div

              style={{

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '18px',

                marginLeft:
                  'auto',

              }}

            >


              {/* ==================================
                  NOTIFICATION BELL
              ================================== */}

              <div

                ref={
                  notificationRef
                }

                style={{

                  position:
                    'relative',

                }}

              >


                {/* ==================================
                    BELL BUTTON
                ================================== */}

                <button

                  type="button"

                  onClick={() =>

                    setNotificationOpen(
                      !notificationOpen
                    )

                  }

                  aria-label="
                    Notifications
                  "

                  style={{

                    width:
                      '40px',

                    height:
                      '40px',

                    border:
                      'none',

                    backgroundColor:
                      'transparent',

                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'center',

                    fontSize:
                      '20px',

                    color:
                      '#495057',

                    cursor:
                      'pointer',

                    borderRadius:
                      '50%',

                    position:
                      'relative',

                  }}

                  className="
                    student-notification-btn
                  "

                >

                  <FaBell />


                  {/* ==================================
                      UNREAD BADGE
                  ================================== */}

                  {unreadCount > 0 && (

                    <span

                      style={{

                        position:
                          'absolute',

                        top:
                          '1px',

                        right:
                          '0px',

                        minWidth:
                          '18px',

                        height:
                          '18px',

                        padding:
                          '0 4px',

                        backgroundColor:
                          '#dc3545',

                        color:
                          '#fff',

                        borderRadius:
                          '10px',

                        fontSize:
                          '10px',

                        fontWeight:
                          '700',

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        border:
                          '2px solid #fff',

                      }}

                    >

                      {
                        unreadCount > 99
                          ? '99+'
                          : unreadCount
                      }

                    </span>

                  )}

                </button>


                {/* ==================================
                    NOTIFICATION DROPDOWN
                ================================== */}

                {notificationOpen && (

                  <div

                    className="
                      student-notification-dropdown
                    "

                    style={{

                      position:
                        'absolute',

                      top:
                        '48px',

                      right:
                        0,

                      width:
                        '390px',

                      maxWidth:
                        'calc(100vw - 30px)',

                      backgroundColor:
                        '#fff',

                      border:
                        '1px solid #dee2e6',

                      borderRadius:
                        '10px',

                      boxShadow:
                        '0 8px 25px rgba(0,0,0,0.15)',

                      overflow:
                        'hidden',

                      zIndex:
                        2000,

                    }}

                  >


                    {/* ==================================
                        NOTIFICATION HEADER
                    ================================== */}

                    <div

                      style={{

                        padding:
                          '14px 15px',

                        borderBottom:
                          '1px solid #dee2e6',

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'space-between',

                        gap:
                          '10px',

                      }}

                    >

                      <h6

                        className="
                          mb-0
                          fw-bold
                        "

                      >

                        Notifications

                      </h6>


                      <div

                        style={{

                          display:
                            'flex',

                          alignItems:
                            'center',

                          gap:
                            '8px',

                        }}

                      >

                        {/* MARK ALL */}

                        {unreadCount > 0 && (

                          <button

                            type="button"

                            onClick={
                              handleMarkAllAsRead
                            }

                            style={{

                              border:
                                'none',

                              background:
                                'transparent',

                              color:
                                '#0d6efd',

                              fontSize:
                                '11px',

                              fontWeight:
                                '600',

                              cursor:
                                'pointer',

                              padding:
                                '2px',

                            }}

                          >

                            <FaCheckCircle />

                            {' '}

                            Mark all

                          </button>

                        )}


                        {/* CLEAR ALL */}

                        {notifications.length > 0 && (

                          <button

                            type="button"

                            onClick={
                              handleClearAll
                            }

                            style={{

                              border:
                                'none',

                              background:
                                'transparent',

                              color:
                                '#dc3545',

                              fontSize:
                                '11px',

                              fontWeight:
                                '600',

                              cursor:
                                'pointer',

                              padding:
                                '2px',

                            }}

                          >

                            <FaTrash />

                            {' '}

                            Clear

                          </button>

                        )}

                      </div>

                    </div>


                    {/* ==================================
                        EMPTY
                    ================================== */}

                    {notifications.length === 0 ? (

                      <div

                        style={{

                          padding:
                            '40px 20px',

                          textAlign:
                            'center',

                          color:
                            '#6c757d',

                        }}

                      >

                        <FaBell

                          style={{

                            fontSize:
                              '30px',

                            marginBottom:
                              '10px',

                            opacity:
                              0.5,

                          }}

                        />

                        <p
                          className="mb-0"
                        >

                          No notifications

                        </p>

                      </div>

                    ) : (


                      /* ==================================
                          NOTIFICATION LIST
                      ================================== */

                      <div

                        style={{

                          maxHeight:
                            '430px',

                          overflowY:
                            'auto',

                        }}

                      >

                        {notifications.map(

                          (notification) => (

                            <div

                              key={
                                notification._id
                              }

                              style={{

                                display:
                                  'flex',

                                alignItems:
                                  'stretch',

                                borderBottom:
                                  '1px solid #f0f0f0',

                                backgroundColor:
                                  notification.isRead
                                    ? '#fff'
                                    : '#f0fbfc',

                              }}

                            >


                              {/* ==================================
                                  CLICKABLE CONTENT
                              ================================== */}

                              <button

                                type="button"

                                onClick={() =>
                                  handleNotificationClick(
                                    notification
                                  )
                                }

                                style={{

                                  flex:
                                    1,

                                  display:
                                    'flex',

                                  alignItems:
                                    'flex-start',

                                  gap:
                                    '12px',

                                  padding:
                                    '13px 10px 13px 15px',

                                  border:
                                    'none',

                                  background:
                                    'transparent',

                                  textAlign:
                                    'left',

                                  cursor:
                                    'pointer',

                                  minWidth:
                                    0,

                                }}

                              >

                                {/* ICON */}

                                <div

                                  style={{

                                    width:
                                      '36px',

                                    height:
                                      '36px',

                                    flexShrink:
                                      0,

                                    borderRadius:
                                      '50%',

                                    backgroundColor:
                                      notification.isRead
                                        ? '#e9ecef'
                                        : '#d9f7f8',

                                    display:
                                      'flex',

                                    alignItems:
                                      'center',

                                    justifyContent:
                                      'center',

                                    fontSize:
                                      '17px',

                                  }}

                                >

                                  {
                                    getNotificationIcon(
                                      notification.type
                                    )
                                  }

                                </div>


                                {/* CONTENT */}

                                <div

                                  style={{

                                    flex:
                                      1,

                                    minWidth:
                                      0,

                                  }}

                                >

                                  <div

                                    style={{

                                      display:
                                        'flex',

                                      alignItems:
                                        'center',

                                      gap:
                                        '7px',

                                    }}

                                  >

                                    <strong

                                      style={{

                                        fontSize:
                                          '13px',

                                        color:
                                          '#212529',

                                      }}

                                    >

                                      {
                                        notification.title
                                      }

                                    </strong>


                                    {/* UNREAD DOT */}

                                    {!notification.isRead && (

                                      <span

                                        style={{

                                          width:
                                            '7px',

                                          height:
                                            '7px',

                                          borderRadius:
                                            '50%',

                                          backgroundColor:
                                            '#00adb5',

                                          flexShrink:
                                            0,

                                        }}

                                      />

                                    )}

                                  </div>


                                  <p

                                    style={{

                                      margin:
                                        '4px 0',

                                      fontSize:
                                        '12px',

                                      color:
                                        '#6c757d',

                                      lineHeight:
                                        '1.4',

                                    }}

                                  >

                                    {
                                      notification.message
                                    }

                                  </p>


                                  <small

                                    style={{

                                      fontSize:
                                        '10px',

                                      color:
                                        '#999',

                                    }}

                                  >

                                    {
                                      notification.createdAt

                                        ? new Date(
                                            notification.createdAt
                                          ).toLocaleString(
                                            'en-IN',
                                            {
                                              day:
                                                '2-digit',

                                              month:
                                                'short',

                                              year:
                                                'numeric',

                                              hour:
                                                '2-digit',

                                              minute:
                                                '2-digit',

                                            }
                                          )

                                        : ''

                                    }

                                  </small>

                                </div>

                              </button>


                              {/* ==================================
                                  DELETE BUTTON
                              ================================== */}

                              <button

                                type="button"

                                title="
                                  Clear notification
                                "

                                aria-label="
                                  Clear notification
                                "

                                onClick={(
                                  event
                                ) =>

                                  handleDeleteNotification(

                                    event,

                                    notification._id

                                  )

                                }

                                style={{

                                  width:
                                    '35px',

                                  flexShrink:
                                    0,

                                  border:
                                    'none',

                                  background:
                                    'transparent',

                                  color:
                                    '#adb5bd',

                                  cursor:
                                    'pointer',

                                  display:
                                    'flex',

                                  alignItems:
                                    'center',

                                  justifyContent:
                                    'center',

                                }}

                                className="
                                  student-notification-delete
                                "

                              >

                                <FaTimes />

                              </button>

                            </div>

                          )

                        )}

                      </div>

                    )}

                  </div>

                )}

              </div>


              {/* ==================================
                  STUDENT INFO
              ================================== */}

              <div

                className="text-end"

              >

                <div className="fw-semibold">

                  {
                    student?.name ||
                    'Student'
                  }

                </div>


                <small

                  className="text-muted"

                >

                  {
                    student?.admissionNumber ||
                    ''
                  }

                </small>

              </div>

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
           NOTIFICATION HOVER
        ============================== */

        .student-notification-btn:hover {

          background-color: #f1f3f5 !important;

          color: #00adb5 !important;

        }


        .student-notification-delete:hover {

          background-color: #f8f9fa !important;

          color: #dc3545 !important;

        }


        /* ==============================
           DESKTOP
        ============================== */

        @media (min-width: 992px) {

          .student-sidebar {

            left: 0 !important;

          }

          .student-main {

            margin-left: 260px !important;

          }

          .student-menu-button {

            display: none;

          }

        }


        /* ==============================
           MOBILE / TABLET
        ============================== */

        @media (max-width: 991.98px) {

          .student-sidebar {

            left: -260px;

          }

          .student-main {

            margin-left: 0 !important;

          }

          .student-menu-button {

            display: block;

          }

          .student-header-title {

            display: none;

          }

        }


        /* ==============================
           MOBILE NOTIFICATION
        ============================== */

        @media (max-width: 575.98px) {

          .student-notification-dropdown {

            position: fixed !important;

            top: 65px !important;

            right: 10px !important;

            left: 10px !important;

            width: auto !important;

            max-width: none !important;

          }

        }

      `}</style>

    </div>

  )

}


export default StudentLayout