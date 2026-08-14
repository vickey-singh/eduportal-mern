import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'


// ======================================
// PRIVATE ROUTE
// ======================================

import PrivateRoute
  from './PrivateRoute'


// ======================================
// TEACHER PRIVATE ROUTE
// ======================================

import TeacherPrivateRoute
  from './TeacherPrivateRoute'


// ======================================
// STUDENT PRIVATE ROUTE
// ======================================

import StudentPrivateRoute
  from './StudentPrivateRoute'


// ======================================
// ADMIN PAGES
// ======================================

import AdminLogin
  from '../pages/admin/AdminLogin'

import AdminDashboard
  from '../pages/admin/AdminDashboard'

import Students
  from '../pages/admin/Students'

import AdminFaculty
  from '../pages/admin/Faculty'

import FacultyAttendance
  from '../pages/admin/FacultyAttendance'

import Applications
  from '../pages/admin/Applications'

import TestimonialsAdmin
  from '../pages/admin/Testimonials'

import GalleryAdmin
  from '../pages/admin/GalleryAdmin'

import Messages
  from '../pages/admin/Messages'

import AchievementsAdmin
  from '../pages/admin/Achievements'

import Settings
  from '../pages/admin/Settings'

import HomePage
  from '../pages/admin/HomePage'

import Downloads
  from '../pages/admin/Downloads'

import Feedbacks
  from '../pages/admin/Feedbacks'

import Notices
  from '../pages/admin/Notices'

import Course
  from '../pages/admin/Course'

import Payments
  from '../pages/admin/Payments'


// ======================================
// RECEIPT
// ======================================

import Receipt
  from '../pages/Receipt'


// ======================================
// TEACHER PAGES
// ======================================

import TeacherLogin
  from '../pages/teacher/TeacherLogin'

import TeacherDashboard
  from '../pages/teacher/TeacherDashboard'

import TeacherClasses
  from '../pages/teacher/TeacherClasses'

import TeacherStudents
  from '../pages/teacher/TeacherStudents'

import TeacherAttendance
  from '../pages/teacher/TeacherAttendance'

import TeacherAssignments
  from '../pages/teacher/TeacherAssignments'

import TeacherExams
  from '../pages/teacher/TeacherExams'

import TeacherMaterials
  from '../pages/teacher/TeacherMaterials'

import TeacherTimetable
  from '../pages/teacher/TeacherTimetable'

import TeacherAnnouncements
  from '../pages/teacher/TeacherAnnouncements'

import TeacherMessages
  from '../pages/teacher/TeacherMessages'

import TeacherReports
  from '../pages/teacher/TeacherReports'

import TeacherProfile
  from '../pages/teacher/TeacherProfile'


// ======================================
// STUDENT PAGES
// ======================================

import StudentLogin
  from '../pages/student/StudentLogin'

import StudentDashboard
  from '../pages/student/StudentDashboard'

import StudentCourses
  from '../pages/student/StudentCourses'

import StudentTimetable
  from '../pages/student/StudentTimetable'

import StudentAttendance
  from '../pages/student/StudentAttendance'

import StudentAssignments
  from '../pages/student/StudentAssignments'

import StudentStudyMaterials
  from '../pages/student/StudentStudyMaterials'

import StudentMarks
  from '../pages/student/StudentMarks'

import StudentAnnouncements
  from '../pages/student/StudentAnnouncements'

import StudentMessages
  from '../pages/student/StudentMessages'

import StudentFees
  from '../pages/student/StudentFees'

import StudentReports
  from '../pages/student/StudentReports'

import StudentProfile
  from '../pages/student/StudentProfile'


// ======================================
// LAYOUTS
// ======================================

import AdminLayout
  from '../layouts/AdminLayout'

import MainLayout
  from '../layouts/MainLayout'

import TeacherLayout
  from '../layouts/TeacherLayout'

import StudentLayout
  from '../layouts/StudentLayout'


// ======================================
// MAIN WEBSITE PAGES
// ======================================

import Home
  from '../pages/Home'

import About
  from '../pages/About'

import Faculty
  from '../pages/Faculty'

import Gallery
  from '../pages/Gallery'

import Achievements
  from '../pages/Achievements'

import Attendance
  from '../pages/admin/Attendance'

import StudentAttendanceAdmin
  from '../pages/admin/StudentAttendance'

import Contact
  from '../pages/Contact'

import Services
  from '../pages/Services'

import Testimonials
  from '../pages/Testimonials'

import Apply
  from '../pages/Apply'

import NotFound
  from '../pages/NotFound'


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
        {/* TEACHER LOGIN */}
        {/* ====================================== */}

        <Route
          path="/teacher/login"
          element={<TeacherLogin />}
        />


        {/* ====================================== */}
        {/* STUDENT LOGIN */}
        {/* ====================================== */}

        <Route
          path="/student/login"
          element={<StudentLogin />}
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


          {/* ADMIN DASHBOARD */}

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />


          {/* HOME PAGE */}

          <Route
            path="home-page"
            element={<HomePage />}
          />


          {/* STUDENTS */}

          <Route
            path="students"
            element={<Students />}
          />


          {/* FACULTY */}

          <Route
            path="faculty"
            element={<AdminFaculty />}
          />


          {/* FACULTY ATTENDANCE */}

          <Route
            path="faculty-attendance"
            element={<FacultyAttendance />}
          />


          {/* ACHIEVEMENTS */}

          <Route
            path="achievements"
            element={<AchievementsAdmin />}
          />


          {/* APPLICATIONS */}

          <Route
            path="applications"
            element={<Applications />}
          />


          {/* TESTIMONIALS */}

          <Route
            path="testimonials"
            element={<TestimonialsAdmin />}
          />


          {/* GALLERY */}

          <Route
            path="gallery"
            element={<GalleryAdmin />}
          />


          {/* MESSAGES */}

          <Route
            path="messages"
            element={<Messages />}
          />


          {/* FEEDBACKS */}

          <Route
            path="feedbacks"
            element={<Feedbacks />}
          />


          {/* NOTICES */}

          <Route
            path="notices"
            element={<Notices />}
          />


          {/* DOWNLOADS */}

          <Route
            path="downloads"
            element={<Downloads />}
          />


          {/* SETTINGS */}

          <Route
            path="settings"
            element={<Settings />}
          />


          {/* COURSES */}

          <Route
            path="courses"
            element={<Course />}
          />


          {/* ATTENDANCE */}

          <Route
            path="attendance"
            element={<Attendance />}
          />


          {/* STUDENT ATTENDANCE */}

          <Route
            path="attendance/student/:studentId"
            element={<StudentAttendanceAdmin />}
          />


          {/* PAYMENTS */}

          <Route
            path="payments"
            element={<Payments />}
          />

        </Route>


        {/* ====================================== */}
        {/* PROTECTED TEACHER ROUTES */}
        {/* ====================================== */}

        <Route

          path="/teacher"

          element={

            <TeacherPrivateRoute>

              <TeacherLayout />

            </TeacherPrivateRoute>

          }

        >


          {/* TEACHER DASHBOARD */}

          <Route
            path="dashboard"
            element={<TeacherDashboard />}
          />


          {/* MY CLASSES */}

          <Route
            path="classes"
            element={<TeacherClasses />}
          />


          {/* STUDENTS */}

          <Route
            path="students"
            element={<TeacherStudents />}
          />


          {/* ATTENDANCE */}

          <Route
            path="attendance"
            element={<TeacherAttendance />}
          />


          {/* ASSIGNMENTS */}

          <Route
            path="assignments"
            element={<TeacherAssignments />}
          />


          {/* MARKS & EXAMS */}

          <Route
            path="exams"
            element={<TeacherExams />}
          />


          {/* STUDY MATERIALS */}

          <Route
            path="materials"
            element={<TeacherMaterials />}
          />


          {/* TIMETABLE */}

          <Route
            path="timetable"
            element={<TeacherTimetable />}
          />


          {/* ANNOUNCEMENTS */}

          <Route
            path="announcements"
            element={<TeacherAnnouncements />}
          />


          {/* MESSAGES */}

          <Route
            path="messages"
            element={<TeacherMessages />}
          />


          {/* REPORTS */}

          <Route
            path="reports"
            element={<TeacherReports />}
          />


          {/* MY PROFILE */}

          <Route
            path="profile"
            element={<TeacherProfile />}
          />

        </Route>


        {/* ====================================== */}
        {/* PROTECTED STUDENT ROUTES */}
        {/* ====================================== */}

        <Route

          path="/student"

          element={

            <StudentPrivateRoute>

              <StudentLayout />

            </StudentPrivateRoute>

          }

        >


          {/* STUDENT DASHBOARD */}

          <Route
            path="dashboard"
            element={<StudentDashboard />}
          />


          {/* MY COURSES */}

          <Route
            path="courses"
            element={<StudentCourses />}
          />


          {/* TIMETABLE */}

          <Route
            path="timetable"
            element={<StudentTimetable />}
          />


          {/* ATTENDANCE */}

          <Route
            path="attendance"
            element={<StudentAttendance />}
          />


          {/* ASSIGNMENTS */}

          <Route
            path="assignments"
            element={<StudentAssignments />}
          />


          {/* STUDY MATERIALS */}

          <Route
            path="study-materials"
            element={<StudentStudyMaterials />}
          />


          {/* MARKS & EXAM */}

          <Route
            path="marks"
            element={<StudentMarks />}
          />


          {/* ANNOUNCEMENTS */}

          <Route
            path="announcements"
            element={<StudentAnnouncements />}
          />


          {/* MESSAGES */}

          <Route
            path="messages"
            element={<StudentMessages />}
          />


          {/* FEES / PAYMENT */}

          <Route
            path="fees"
            element={<StudentFees />}
          />


          {/* REPORTS */}

          <Route
            path="reports"
            element={<StudentReports />}
          />


          {/* MY PROFILE */}

          <Route
            path="profile"
            element={<StudentProfile />}
          />

        </Route>


        {/* ====================================== */}
        {/* MAIN WEBSITE ROUTES */}
        {/* ====================================== */}

        <Route

          path="/"

          element={<MainLayout />}

        >


          {/* HOME */}

          <Route
            index
            element={<Home />}
          />


          {/* ABOUT */}

          <Route
            path="about"
            element={<About />}
          />


          {/* FACULTY */}

          <Route
            path="faculty"
            element={<Faculty />}
          />


          {/* GALLERY */}

          <Route
            path="gallery"
            element={<Gallery />}
          />


          {/* ACHIEVEMENTS */}

          <Route
            path="achievements"
            element={<Achievements />}
          />


          {/* CONTACT */}

          <Route
            path="contact"
            element={<Contact />}
          />


          {/* DOWNLOADS */}

          <Route
            path="downloads"
            element={<Downloads />}
          />


          {/* SERVICES */}

          <Route
            path="services"
            element={<Services />}
          />


          {/* TESTIMONIALS */}

          <Route
            path="testimonials"
            element={<Testimonials />}
          />


          {/* ADMISSION */}

          <Route
            path="apply"
            element={<Apply />}
          />

        </Route>


        {/* ====================================== */}
        {/* RECEIPT */}
        {/* ====================================== */}

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