import Settings
  from '../pages/admin/Settings'

import HomePage
  from '../pages/admin/HomePage'

import Downloads
  from '../pages/admin/Downloads'

import DownloadsPage
  from '../pages/Downloads'

import Feedbacks
  from '../pages/admin/Feedbacks'

import Notices
  from '../pages/admin/Notices'

import Course 
  from '../pages/admin/Course'

import Payments 
  from '../pages/admin/Payments'

import Receipt 
  from '../pages/Receipt'

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

// ======================================
// PRIVATE ROUTE
// ======================================

import PrivateRoute from './PrivateRoute'

// ======================================
// ADMIN PAGES
// ======================================

import AdminLogin from '../pages/admin/AdminLogin'

import AdminDashboard from '../pages/admin/AdminDashboard'

import Students from '../pages/admin/Students'

import AdminFaculty from '../pages/admin/Faculty'

import Applications from '../pages/admin/Applications'

import TestimonialsAdmin from '../pages/admin/Testimonials'

import GalleryAdmin from '../pages/admin/GalleryAdmin'

import Messages from '../pages/admin/Messages'

import AchievementsAdmin
  from '../pages/admin/Achievements'

// ======================================
// LAYOUTS
// ======================================

import AdminLayout from '../layouts/AdminLayout'

import MainLayout from '../layouts/MainLayout'

// ======================================
// MAIN WEBSITE PAGES
// ======================================

import Home from '../pages/Home'

import About from '../pages/About'

import Faculty from '../pages/Faculty'

import Gallery from '../pages/Gallery'

import Achievements from '../pages/Achievements'

import Attendance from '../pages/admin/Attendance'

import StudentAttendance from '../pages/admin/StudentAttendance'

import Contact from '../pages/Contact'

import Services from '../pages/Services'

import Testimonials from '../pages/Testimonials'

import Apply from '../pages/Apply'

import ExistingStudent from '../pages/ExistingStudent'

import NotFound from '../pages/NotFound'


function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ====================================== */}
        {/* ADMIN LOGIN */}
        {/* ====================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* ====================================== */}
        {/* PROTECTED ADMIN ROUTES */}
        {/* ====================================== */}

        <Route

          path="/admin"

          element={

            <PrivateRoute>

              <AdminLayout />

            </PrivateRoute>

          }

        >

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          {/* Home Page */}  
          <Route
            path="home-page"
            element={<HomePage />}
          />

          {/* Students */}
          <Route
            path="students"
            element={<Students />}
          />

          {/* Faculty */}
          <Route
            path="faculty"
            element={<AdminFaculty />}
          />

          {/* Achievements */}
          <Route
            path="achievements"
            element={<AchievementsAdmin />}
          />

          {/* Applications */}
          <Route
            path="applications"
            element={<Applications />}
          />

          {/* Testimonials */}
          <Route
            path="testimonials"
            element={<TestimonialsAdmin />}
          />

          {/* Gallery */}
          <Route
            path="gallery"
            element={<GalleryAdmin />}
          />

          {/* Messages */}
          <Route
            path="messages"
            element={<Messages />}
          />

          <Route
            path="feedbacks"
            element={<Feedbacks />}
          />

          <Route
            path="notices"
            element={<Notices />}
          />

          <Route
            path="downloads"
            element={<Downloads />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />

          <Route
            path="courses"
            element={<Course />}
          />

          <Route
            path="attendance"
            element={<Attendance />}
          />

          <Route
            path="attendance/student/:studentId"
            element={<StudentAttendance />}
          />

          <Route
            path="payments"
            element={<Payments />}
          />

        </Route>

        {/* ====================================== */}
        {/* MAIN WEBSITE ROUTES */}
        {/* ====================================== */}

        <Route
          path="/"
          element={<MainLayout />}
        >

          {/* Home */}
          <Route
            index
            element={<Home />}
          />

          {/* About */}
          <Route
            path="about"
            element={<About />}
          />

          {/* Faculty */}
          <Route
            path="faculty"
            element={<Faculty />}
          />

          {/* Gallery */}
          <Route
            path="gallery"
            element={<Gallery />}
          />

          {/* Achievements */}
          <Route
            path="achievements"
            element={<Achievements />}
          />

          {/* Contact */}
          <Route
            path="contact"
            element={<Contact />}
          />
      
           {/* Download */}
          <Route
            path="downloads"
            element={<DownloadsPage />}
          />

          {/* Services */}
          <Route
            path="services"
            element={<Services />}
          />

          {/* Testimonials */}
          <Route
            path="testimonials"
            element={<Testimonials />}
          />

          {/* Apply */}
          <Route
            path="apply"
            element={<Apply />}
          />

          {/* Existing Student */}
          <Route
            path="existing-student"
            element={<ExistingStudent />}
          />

        </Route>

        <Route
          path="/receipt/:receiptNumber"
          element={<Receipt />}
        />

        {/* ====================================== */}
        {/* 404 PAGE */}
        {/* ====================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>

  )

}

export default AppRoutes