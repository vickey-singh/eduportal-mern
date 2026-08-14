require('dotenv').config()

const express = require('express')
const path = require('path')
const cors = require('cors')

const connectDB =
  require('./config/db')


// ======================================
// ROUTES
// ======================================

const paymentRoutes =
  require('./routes/paymentRoutes')

const testMailRoutes =
  require('./routes/testMailRoutes')

const courseRoutes =
  require('./routes/courseRoutes')

const accountRoutes =
  require('./routes/accountRoutes')

const settingsRoutes =
  require('./routes/settingsRoutes')

const downloadRoutes =
  require('./routes/downloadRoutes')

const dashboardRoutes =
  require('./routes/dashboardRoutes')

const attendanceRoutes =
  require('./routes/attendanceRoutes')

const studentRoutes =
  require('./routes/studentRoutes')

const studentPortalRoutes =
  require('./routes/studentPortalRoutes')

const studentProfileRoutes =
  require('./routes/studentProfileRoutes')

const studentReportRoutes =
  require('./routes/studentReportRoutes')

const messageRoutes =
  require('./routes/messageRoutes')

const feedbackRoutes =
  require('./routes/feedbackRoutes')

const testimonialRoutes =
  require('./routes/testimonialRoutes')

const galleryRoutes =
  require('./routes/galleryRoutes')

const achievementRoutes =
  require('./routes/achievementRoutes')

const facultyRoutes =
  require('./routes/facultyRoutes')

const adminRoutes =
  require('./routes/adminRoutes')

const teacherRoutes =
  require('./routes/teacherRoutes')

const studentAuthRoutes =
  require('./routes/studentAuthRoutes')

const assignmentRoutes =
  require('./routes/assignmentRoutes')

const examRoutes =
  require('./routes/examRoutes')

const studyMaterialRoutes =
  require('./routes/studyMaterialRoutes')

const timetableRoutes =
  require('./routes/timetableRoutes')

const announcementRoutes =
  require('./routes/announcementRoutes')

const teacherMessageRoutes =
  require('./routes/teacherMessageRoutes')

const teacherReportRoutes =
  require('./routes/teacherReportRoutes')

const facultyAttendanceRoutes =
  require('./routes/facultyAttendanceRoutes')

const teacherAttendanceRoutes =
  require('./routes/teacherAttendanceRoutes')

const receiptRoutes =
  require('./routes/receiptRoutes')

const noticeRoutes =
  require('./routes/noticeRoutes')

const applicationRoutes =
  require('./routes/applicationRoutes')

const homeSliderRoutes =
  require('./routes/homeSliderRoutes')


// ======================================
// ADMIN NOTIFICATION ROUTES
// ======================================

const notificationRoutes =
  require('./routes/notificationRoutes')


// ======================================
// STUDENT NOTIFICATION ROUTES
// ======================================

const studentNotificationRoutes =
  require('./routes/studentNotificationRoute')


// ======================================
// CREATE APP
// ======================================

const app = express()


// ======================================
// CONNECT DATABASE
// ======================================

connectDB()


// ======================================
// MIDDLEWARE
// ======================================

app.use(
  cors()
)

app.use(
  express.json()
)


// ======================================
// STATIC UPLOADS
// ======================================

app.use(
  '/uploads',
  express.static(
    path.join(
      __dirname,
      'uploads'
    )
  )
)


// ======================================
// ROUTES
// ======================================

app.use(
  '/api',
  courseRoutes
)

app.use(
  '/api',
  applicationRoutes
)

app.use(
  '/api',
  adminRoutes
)

app.use(
  '/api',
  teacherRoutes
)

app.use(
  '/api',
  assignmentRoutes
)

app.use(
  '/api',
  examRoutes
)

app.use(
  '/api',
  studyMaterialRoutes
)

app.use(
  '/api',
  timetableRoutes
)

app.use(
  '/api',
  announcementRoutes
)

app.use(
  '/api',
  teacherMessageRoutes
)

app.use(
  '/api',
  teacherReportRoutes
)

app.use(
  '/api',
  teacherAttendanceRoutes
)

app.use(
  '/api',
  studentAuthRoutes
)

app.use(
  '/api',
  facultyRoutes
)

app.use(
  '/api',
  facultyAttendanceRoutes
)

app.use(
  '/api',
  achievementRoutes
)

app.use(
  '/api',
  galleryRoutes
)

app.use(
  '/api',
  testimonialRoutes
)

app.use(
  '/api',
  feedbackRoutes
)

app.use(
  '/api',
  messageRoutes
)

app.use(
  '/api',
  studentRoutes
)

app.use(
  '/api',
  studentPortalRoutes
)

app.use(
  '/api',
  studentProfileRoutes
)

app.use(
  '/api',
  dashboardRoutes
)

app.use(
  '/api',
  attendanceRoutes
)

app.use(
  '/api',
  studentReportRoutes
)

app.use(
  '/api',
  paymentRoutes
)

app.use(
  '/api',
  testMailRoutes
)

app.use(
  '/api',
  receiptRoutes
)

app.use(
  '/api',
  noticeRoutes
)

app.use(
  '/api',
  downloadRoutes
)

app.use(
  '/api',
  homeSliderRoutes
)

app.use(
  '/api',
  settingsRoutes
)

app.use(
  '/api',
  accountRoutes
)


// ======================================
// ADMIN NOTIFICATION ROUTES
// ======================================

app.use(
  '/api',
  notificationRoutes
)


// ======================================
// STUDENT NOTIFICATION ROUTES
// ======================================

app.use(
  '/api',
  studentNotificationRoutes
)


// ======================================
// TEST ROUTE
// ======================================

app.get(
  '/',
  (req, res) => {

    res.send(
      'Prerna Institute Backend Running 🚀'
    )

  }
)


// ======================================
// PORT
// ======================================

const PORT =
  process.env.PORT || 8000


// ======================================
// START SERVER
// ======================================

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    )

  }
)