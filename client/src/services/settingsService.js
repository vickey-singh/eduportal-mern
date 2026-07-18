import axios from 'axios'

import { API_URL } from '../config/api'

// ===============================
// GET SETTINGS
// ===============================

export const getSettings = async () => {

  const response = await axios.get(
    `${API_URL}/settings`
  )

  return response.data

}

// ===============================
// UPDATE SETTINGS
// ===============================

export const updateSettings = async (formData) => {

  const response = await axios.put(

    `${API_URL}/settings`,

    formData,

    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }

  )

  return response.data

}