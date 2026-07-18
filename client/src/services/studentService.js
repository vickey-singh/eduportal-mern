import axios from 'axios'
import { API_URL } from '../config/api'

// ===============================
// GET ALL STUDENTS
// ===============================

export const getStudents = async () => {
  const response = await axios.get(`${API_URL}/students`)
  return response.data
}

// ===============================
// CREATE STUDENT
// ===============================

export const createStudent = async (formData) => {
  const response = await axios.post(
    `${API_URL}/students`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data
}

// ===============================
// UPDATE STUDENT
// ===============================

export const updateStudent = async (
  id,
  formData
) => {

  const response = await axios.put(

    `${API_URL}/students/${id}`,

    formData,

    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }

  )

  return response.data

}

// ===============================
// DELETE STUDENT
// ===============================

export const deleteStudentById =
async (id) => {

  const response =
    await axios.delete(
      `${API_URL}/students/${id}`
    )

  return response.data

}

// ===============================
// ADD PAYMENT
// ===============================

export const addStudentPayment =
async (id, paymentData) => {

  const response =
    await axios.put(

      `${API_URL}/students/add-payment/${id}`,

      paymentData

    )

  return response.data

}

// ======================================
// VERIFY STUDENT
// ======================================

export const verifyStudent = async (data) => {

  const response = await axios.post(

    `${API_URL}/students/verify`,

    data

  )

  return response.data

}