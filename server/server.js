const accountRoutes =
  require('./routes/accountRoutes')

const settingsRoutes =
  require('./routes/settingsRoutes')

const downloadRoutes =
  require('./routes/downloadRoutes')

const dashboardRoutes =
  require('./routes/dashboardRoutes')

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

const express = require('express')

const path = require('path')

const cors = require('cors')

require('dotenv').config()

const connectDB = require('./config/db')

const applicationRoutes = require('./routes/applicationRoutes')

// Create App
const app = express()

// Connect Database
connectDB()

// Middleware
app.use(cors())

app.use(express.json())

// STATIC UPLOADS FOLDER
app.use(

  '/uploads',

  express.static(
    path.join(__dirname, 'uploads')
  )

)

// Routes
app.use('/api', applicationRoutes)

app.use('/api', adminRoutes)

app.use('/api', facultyRoutes)

app.use('/api', achievementRoutes)

app.use('/api', galleryRoutes)

app.use('/api', testimonialRoutes)

app.use('/api', feedbackRoutes)

app.use('/api', messageRoutes)

app.use('/api', studentRoutes)

app.use('/api', dashboardRoutes)

app.use('/api', receiptRoutes)

app.use('/api', noticeRoutes)

app.use('/api', downloadRoutes)

app.use('/api', settingsRoutes)

app.use('/api', accountRoutes)

// Test Route
app.get('/', (req, res) => {

  res.send('EduPortal Backend Running 🚀')

})

// Port
const PORT = process.env.PORT || 8000

// Start Server
app.listen(PORT, () => {

  console.log(`Server running on port ${PORT}`)

})