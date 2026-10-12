import {
  Outlet,
  NavLink,
  useNavigate,
} from 'react-router-dom'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

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
  FaBook,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaBell,
  FaGraduationCap,
  FaCheckCircle,
  FaTrash,
  FaTimes,
  FaHome,
  FaFilePdf,
  FaEnvelopeOpenText,

} from 'react-icons/fa'

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../services/notificationService'

import '../assets/styles/admin-layout.css'


function AdminLayout() {

  const navigate = useNavigate()


  // ======================================
  // SIDEBAR
  // ======================================

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false)


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
      'token'
    )

    window.location.href =
      '/admin/login'

  }


  // ======================================
  // CLOSE SIDEBAR
  // ======================================

  const closeSidebar = () => {

    setSidebarOpen(false)

  }


  // ======================================
  // FETCH NOTIFICATIONS
  // ======================================

  const fetchNotifications =
    async () => {

      try {

        const data =
          await getNotifications()


        setNotifications(
          data.notifications || []
        )

      }

      catch (error) {

        console.log(
          'Fetch Notifications Error:',
          error
        )

      }

    }


  // ======================================
  // INITIAL FETCH
  // ======================================

  useEffect(() => {

    fetchNotifications()

  }, [])


  // ======================================
  // AUTO REFRESH
  // ======================================

  useEffect(() => {

    const interval =
      setInterval(() => {

        fetchNotifications()

      }, 10000)


    return () => {

      clearInterval(interval)

    }

  }, [])


  // ======================================
  // CLOSE NOTIFICATION DROPDOWN
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

          setNotificationOpen(false)

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

        case 'Admission':

          return (
            <FaGraduationCap />
          )

        case 'Payment':

          return (
            <FaMoneyBillWave />
          )

        case 'Feedback':

          return (
            <FaStar />
          )

        case 'Message':

          return (
            <FaEnvelope />
          )

        default:

          return (
            <FaBell />
          )

      }

    }


  // ======================================
  // NOTIFICATION CLICK
  // ======================================

  const handleNotificationClick =
    async (notification) => {

      try {

        if (!notification.isRead) {

          await markNotificationAsRead(
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


        setNotificationOpen(false)


        if (notification.link) {

          navigate(
            notification.link
          )

        }

      }

      catch (error) {

        console.log(
          'Notification Click Error:',
          error
        )

      }

    }


  // ======================================
  // MARK ALL AS READ
  // ======================================

  const handleMarkAllAsRead =
    async (event) => {

      event?.stopPropagation()


      try {

        await markAllNotificationsAsRead()


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
          'Mark All Notifications Error:',
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

        await deleteNotification(
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
          'Delete Notification Error:',
          error
        )

      }

    }


  // ======================================
  // CLEAR ALL NOTIFICATIONS
  // ======================================

  const handleClearAll =
    async (event) => {

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

        await deleteAllNotifications()


        setNotifications([])

      }

      catch (error) {

        console.log(
          'Clear All Notifications Error:',
          error
        )

      }

    }


  return (

    <section className="admin-dashboard">


      {/* ==================================
          SIDEBAR
      ================================== */}

      <aside

        className={

          sidebarOpen

            ? 'admin-sidebar active'

            : 'admin-sidebar'

        }

      >

        <div className="sidebar-header">


          {/* CLOSE SIDEBAR */}

          <button

            className="close-sidebar-btn"

            onClick={() =>
              setSidebarOpen(false)
            }

          >

            ✕

          </button>


          {/* LOGO */}

          <h2 className="admin-logo">

            <span className="edu">
              Prerna
            </span>{' '}

            <span className="portal">
              Institute Of Excellence
            </span>

          </h2>


          {/* ==================================
              MENU
          ================================== */}

          <ul className="admin-menu">


            {/* DASHBOARD */}

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


            {/* HOME PAGE */}

            <li>

              <NavLink
                to="/admin/home-page"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  isActive
                    ? 'admin-link active-admin-link'
                    : 'admin-link'
                }
              >

                <FaHome />

                Home Page

              </NavLink>

            </li>


            {/* STUDENTS */}

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


            {/* COURSES */}

            <li>

              <NavLink
                to="/admin/courses"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  isActive
                    ? 'admin-link active-admin-link'
                    : 'admin-link'
                }
              >

                <FaBook />

                Courses

              </NavLink>

            </li>


            {/* ATTENDANCE */}

            <li>

              <NavLink
                to="/admin/attendance"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  isActive
                    ? 'admin-link active-admin-link'
                    : 'admin-link'
                }
              >

                <FaCalendarCheck />

                Attendance

              </NavLink>

            </li>


            {/* PAYMENTS */}

            <li>

              <NavLink
                to="/admin/payments"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  isActive
                    ? 'admin-link active-admin-link'
                    : 'admin-link'
                }
              >

                <FaMoneyBillWave />

                Payments

              </NavLink>

            </li>


            {/* ==================================
                FEE DUE REPORT
            ================================== */}

            <li>

              <NavLink
                to="/admin/fee-due-report"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  isActive
                    ? 'admin-link active-admin-link'
                    : 'admin-link'
                }
              >

                <FaFilePdf />

                Fee Due Report

              </NavLink>

            </li>

            <li>
              
              <NavLink
                to="/admin/fee-reminders"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  isActive
                    ? 'admin-link active-admin-link'
                    : 'admin-link'
                }
              >

                <FaEnvelopeOpenText />

                Fee Reminders

              </NavLink>

            </li>


            {/* FACULTY */}

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


            {/* ACHIEVEMENTS */}

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


            {/* APPLICATIONS */}

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


            {/* TESTIMONIALS */}

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


            {/* FEEDBACKS */}

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


            {/* NOTICES */}

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


            {/* DOWNLOADS */}

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


            {/* GALLERY */}

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


            {/* MESSAGES */}

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


            {/* SETTINGS */}

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


            {/* LOGOUT */}

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

        </div>

      </aside>


      {/* ==================================
          MAIN CONTENT
      ================================== */}

      <main className="admin-main">


        {/* ==================================
            TOPBAR
        ================================== */}

        <div className="admin-topbar">


          {/* MOBILE MENU */}

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


          {/* TITLE */}

          <h3>

            Prerna Institute Of Excellence
            Admin Panel

          </h3>


          {/* ==================================
              TOP RIGHT
          ================================== */}

          <div className="admin-topbar-right">


            {/* ==================================
                NOTIFICATION
            ================================== */}

            <div

              className="notification-wrapper"

              ref={notificationRef}

            >


              {/* BELL */}

              <button

                type="button"

                className="notification-btn"

                onClick={() =>

                  setNotificationOpen(
                    !notificationOpen
                  )

                }

              >

                <FaBell />


                {/* UNREAD BADGE */}

                {unreadCount > 0 && (

                  <span className="notification-badge">

                    {
                      unreadCount > 99
                        ? '99+'
                        : unreadCount
                    }

                  </span>

                )}

              </button>


              {/* ==================================
                  DROPDOWN
              ================================== */}

              {notificationOpen && (

                <div className="notification-dropdown">


                  {/* HEADER */}

                  <div className="notification-header">

                    <h5>
                      Notifications
                    </h5>


                    <div className="notification-header-actions">


                      {/* MARK ALL AS READ */}

                      {unreadCount > 0 && (

                        <button

                          type="button"

                          className="mark-all-btn"

                          onClick={
                            handleMarkAllAsRead
                          }

                        >

                          <FaCheckCircle />

                          Mark all as read

                        </button>

                      )}


                      {/* CLEAR ALL */}

                      {notifications.length > 0 && (

                        <button

                          type="button"

                          className="clear-all-btn"

                          onClick={
                            handleClearAll
                          }

                        >

                          <FaTrash />

                          Clear all

                        </button>

                      )}

                    </div>

                  </div>


                  {/* EMPTY */}

                  {notifications.length === 0 ? (

                    <div className="notification-empty">

                      <FaBell />

                      <p>
                        No notifications
                      </p>

                    </div>

                  ) : (

                    <div className="notification-list">

                      {notifications.map(

                        (notification) => (

                          <div

                            key={
                              notification._id
                            }

                            className={

                              notification.isRead

                                ? 'notification-item read'

                                : 'notification-item unread'

                            }

                          >


                            {/* CLICKABLE CONTENT */}

                            <button

                              type="button"

                              className="notification-item-content"

                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }

                            >

                              {/* ICON */}

                              <div className="notification-icon">

                                {
                                  getNotificationIcon(
                                    notification.type
                                  )
                                }

                              </div>


                              {/* CONTENT */}

                              <div className="notification-content">

                                <div className="notification-title-row">

                                  <strong>
                                    {
                                      notification.title
                                    }
                                  </strong>


                                  {!notification.isRead && (

                                    <span className="notification-dot">
                                    </span>

                                  )}

                                </div>


                                <p>
                                  {
                                    notification.message
                                  }
                                </p>


                                <small>

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


                            {/* INDIVIDUAL CLEAR */}

                            <button

                              type="button"

                              className="notification-delete-btn"

                              title="Clear notification"

                              aria-label="Clear notification"

                              onClick={(event) =>

                                handleDeleteNotification(

                                  event,

                                  notification._id

                                )

                              }

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
                ADMIN
            ================================== */}

            <div className="admin-profile">

              Admin

            </div>


          </div>

        </div>


        {/* ==================================
            PAGE CONTENT
        ================================== */}

        <Outlet />

      </main>

    </section>

  )

}


export default AdminLayout