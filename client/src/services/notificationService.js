import axios from 'axios'

import { API_URL } from '../config/api'


// ======================================
// GET ALL NOTIFICATIONS
// ======================================

export const getNotifications = async () => {

  const response =
    await axios.get(
      `${API_URL}/notifications`
    )

  return response.data

}


// ======================================
// GET UNREAD COUNT
// ======================================

export const getUnreadNotificationCount =
  async () => {

    const response =
      await axios.get(
        `${API_URL}/notifications/unread-count`
      )

    return response.data

  }


// ======================================
// MARK ONE NOTIFICATION AS READ
// ======================================

export const markNotificationAsRead =
  async (id) => {

    const response =
      await axios.put(

        `${API_URL}/notifications/${id}/read`

      )

    return response.data

  }


// ======================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================

export const markAllNotificationsAsRead =
  async () => {

    const response =
      await axios.put(

        `${API_URL}/notifications/read-all`

      )

    return response.data

  }


// ======================================
// DELETE NOTIFICATION
// ======================================

export const deleteNotification =
  async (id) => {

    const response =
      await axios.delete(

        `${API_URL}/notifications/${id}`

      )

    return response.data

  }