import axios from 'axios'
import { API_URL } from '../config/api'

// Admin-only calendar endpoints use the existing admin JWT stored as `token`.
const adminConfig = () => {
  const token = localStorage.getItem('token')
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

// GET STUDENTS FOR TEACHER ATTENDANCE
export const getAttendanceStudents = async ({ course, batchTime, date }) => {
  const response = await axios.get(`${API_URL}/teacher/attendance/students`, {
    params: { course, batchTime, date },
  })
  return response.data
}

// GET STUDENTS FOR ADMIN ATTENDANCE
export const getAdminAttendanceStudents = async ({ course, batchTime, date }) => {
  const response = await axios.get(`${API_URL}/admin/attendance/students`, {
    params: { course, batchTime, date },
  })
  return response.data
}

// SAVE SINGLE ATTENDANCE
export const saveAttendance = async ({ student, date, status }) => {
  const response = await axios.post(`${API_URL}/attendance`, { student, date, status })
  return response.data
}

// SAVE BULK ATTENDANCE - TEACHER
export const saveBulkAttendance = async ({ date, attendance }) => {
  const response = await axios.post(`${API_URL}/teacher/attendance/bulk`, { date, attendance })
  return response.data
}

// SAVE BULK ATTENDANCE - ADMIN
export const saveAdminBulkAttendance = async ({ date, attendance }) => {
  const response = await axios.post(`${API_URL}/admin/attendance/bulk`, { date, attendance })
  return response.data
}

// GET STUDENT ALL ATTENDANCE
export const getStudentAttendance = async (studentId) => {
  const response = await axios.get(`${API_URL}/attendance/student/${studentId}`)
  return response.data
}

// GET MONTHLY ATTENDANCE
export const getMonthlyAttendance = async (studentId, year, month) => {
  const response = await axios.get(`${API_URL}/attendance/student/${studentId}/monthly`, { params: { year, month } })
  return response.data
}

// GET YEARLY ATTENDANCE
export const getYearlyAttendance = async (studentId, year) => {
  const response = await axios.get(`${API_URL}/attendance/student/${studentId}/yearly`, { params: { year } })
  return response.data
}

// DELETE ATTENDANCE
export const deleteAttendance = async (id) => {
  const response = await axios.delete(`${API_URL}/attendance/${id}`)
  return response.data
}

// ATTENDANCE CALENDAR: WORKING DAYS
export const getAttendanceSettings = async () => {
  const response = await axios.get(`${API_URL}/admin/attendance/settings`, adminConfig())
  return response.data
}

export const updateAttendanceSettings = async (workingDays) => {
  const response = await axios.put(`${API_URL}/admin/attendance/settings`, { workingDays }, adminConfig())
  return response.data
}

// ATTENDANCE CALENDAR: HOLIDAYS
export const getAttendanceHolidays = async () => {
  const response = await axios.get(`${API_URL}/admin/attendance/holidays`, adminConfig())
  return response.data
}

export const createAttendanceHoliday = async (holiday) => {
  const response = await axios.post(`${API_URL}/admin/attendance/holidays`, holiday, adminConfig())
  return response.data
}

export const updateAttendanceHoliday = async (id, holiday) => {
  const response = await axios.put(`${API_URL}/admin/attendance/holidays/${id}`, holiday, adminConfig())
  return response.data
}

export const deleteAttendanceHoliday = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/attendance/holidays/${id}`, adminConfig())
  return response.data
}
