import axios from 'axios'

import { API_URL } from '../config/api'


// ======================================
// GET STUDENT TOKEN
// ======================================

const getStudentToken = () => {

  return localStorage.getItem(
    'studentToken'
  )

}


// ======================================
// AUTH CONFIG
// ======================================

const getAuthConfig = () => {

  const token =
    getStudentToken()


  return {

    headers: {

      Authorization:
        `Bearer ${token}`,

    },

  }

}


// ======================================
// GET STUDENT NOTIFICATIONS
// ======================================

export const getStudentNotifications =
  async () => {

    const response =
      await axios.get(

        `${API_URL}/student/notifications`,

        getAuthConfig()

      )

    return response.data

  }


// ======================================
// GET STUDENT UNREAD COUNT
// ======================================

export const getStudentUnreadNotificationCount =
  async () => {

    const response =
      await axios.get(

        `${API_URL}/student/notifications/unread-count`,

        getAuthConfig()

      )

    return response.data

  }


// ======================================
// MARK ONE NOTIFICATION AS READ
// ======================================

export const markStudentNotificationAsRead =
  async (id) => {

    const response =
      await axios.put(

        `${API_URL}/student/notifications/${id}/read`,

        {},

        getAuthConfig()

      )

    return response.data

  }


// ======================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================

export const markAllStudentNotificationsAsRead =
  async () => {

    const response =
      await axios.put(

        `${API_URL}/student/notifications/read-all`,

        {},

        getAuthConfig()

      )

    return response.data

  }


// ======================================
// DELETE ONE NOTIFICATION
// ======================================

export const deleteStudentNotification =
  async (id) => {

    const response =
      await axios.delete(

        `${API_URL}/student/notifications/${id}`,

        getAuthConfig()

      )

    return response.data

  }


// ======================================
// DELETE ALL STUDENT NOTIFICATIONS
// ======================================

export const deleteAllStudentNotifications =
  async () => {

    const response =
      await axios.delete(

        `${API_URL}/student/notifications`,

        getAuthConfig()

      )

    return response.data

  }