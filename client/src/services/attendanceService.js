import axios from 'axios'

import { API_URL } from '../config/api'


// ======================================
// GET STUDENTS FOR ATTENDANCE
// ======================================
// Course + Batch Time + Date ke basis par
// students aur existing attendance status
// ======================================

export const getAttendanceStudents = async ({
  course,
  batchTime,
  date,
}) => {

  const response =
    await axios.get(
      `${API_URL}/attendance/students`,
      {
        params: {
          course,
          batchTime,
          date,
        },
      }
    )

  return response.data

}


// ======================================
// SAVE SINGLE ATTENDANCE
// ======================================

export const saveAttendance = async ({
  student,
  date,
  status,
}) => {

  const response =
    await axios.post(
      `${API_URL}/attendance`,
      {
        student,
        date,
        status,
      }
    )

  return response.data

}


// ======================================
// SAVE BULK ATTENDANCE
// ======================================
// Ek batch ke multiple students ki
// attendance ek saath save hogi.
// ======================================

export const saveBulkAttendance = async ({
  date,
  attendance,
}) => {

  const response =
    await axios.post(
      `${API_URL}/attendance/bulk`,
      {
        date,
        attendance,
      }
    )

  return response.data

}


// ======================================
// GET STUDENT ALL ATTENDANCE
// ======================================
// Daily attendance records + overall summary
// ======================================

export const getStudentAttendance =
  async (studentId) => {

    const response =
      await axios.get(
        `${API_URL}/attendance/student/${studentId}`
      )

    return response.data

  }


// ======================================
// GET MONTHLY ATTENDANCE
// ======================================

export const getMonthlyAttendance =
  async (
    studentId,
    year,
    month
  ) => {

    const response =
      await axios.get(
        `${API_URL}/attendance/student/${studentId}/monthly`,
        {
          params: {
            year,
            month,
          },
        }
      )

    return response.data

  }


// ======================================
// GET YEARLY ATTENDANCE
// ======================================

export const getYearlyAttendance =
  async (
    studentId,
    year
  ) => {

    const response =
      await axios.get(
        `${API_URL}/attendance/student/${studentId}/yearly`,
        {
          params: {
            year,
          },
        }
      )

    return response.data

  }


// ======================================
// DELETE ATTENDANCE
// ======================================

export const deleteAttendance =
  async (id) => {

    const response =
      await axios.delete(
        `${API_URL}/attendance/${id}`
      )

    return response.data

  }