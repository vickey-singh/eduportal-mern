import axios from 'axios'

export const getSettings =
  async () => {

    const response =
      await axios.get(
        'https://eduportal-backend-m5t1.onrender.com/api/settings'
      )

    return response.data

  }