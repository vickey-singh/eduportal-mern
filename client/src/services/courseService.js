import axios from 'axios'

import { API_URL } from '../config/api'

// ======================================
// GET COURSES
// ======================================

export const getCourses = async () => {

  try {

    const response = await axios.get(
      `${API_URL}/courses`
    )

    return response.data

  } catch (error) {

    console.log(error)

    return []

  }

}

// ======================================
// GET COURSE BY ID
// ======================================

export const getCourseById = async (id) => {

  const response = await axios.get(
    `${API_URL}/courses/${id}`
  )

  return response.data

}

// ======================================
// ADD COURSE
// ======================================

export const createCourse = async (formData) => {

  const response = await axios.post(
    `${API_URL}/courses`,
    formData
  )

  return response.data

}

// ======================================
// UPDATE COURSE
// ======================================

export const updateCourse = async (
  id,
  formData
) => {

  const response = await axios.put(
    `${API_URL}/courses/${id}`,
    formData
  )

  return response.data

}

// ======================================
// DELETE COURSE
// ======================================

export const deleteCourse = async (id) => {

  const response = await axios.delete(
    `${API_URL}/courses/${id}`
  )

  return response.data

}