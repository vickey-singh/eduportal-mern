require('dotenv').config()

const express = require('express')
const path = require('path')
const cors = require('cors')

const connectDB =
  require('./config/db')


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

const receiptRoutes =
  require('./routes/receiptRoutes')

const noticeRoutes =
  require('./routes/noticeRoutes')

const applicationRoutes =
  require('./routes/applicationRoutes')


// ======================================
// NOTIFICATION ROUTES
// ======================================

const notificationRoutes =
  require('./routes/notificationRoutes')


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

app.use(cors())

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
  facultyRoutes
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
  dashboardRoutes
)

app.use(
  '/api',
  attendanceRoutes
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
  settingsRoutes
)

app.use(
  '/api',
  accountRoutes
)


// ======================================
// NOTIFICATION ROUTES
// ======================================

app.use(
  '/api',
  notificationRoutes
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