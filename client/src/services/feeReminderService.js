import axios from 'axios'
import { API_URL } from '../config/api'

const getAuthConfig = () => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Admin session expired. Please login again.')
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

// Preview: no emails are sent
export const previewFeeReminders = async () => {
  const response = await axios.post(
    `${API_URL}/fee-reminders/preview`,
    {},
    getAuthConfig()
  )

  return response.data
}

// Send emails after admin confirmation
export const sendBulkFeeReminders = async () => {
  const response = await axios.post(
    `${API_URL}/fee-reminders/send`,
    { confirmed: true },
    getAuthConfig()
  )

  return response.data
}