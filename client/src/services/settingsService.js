import axios from 'axios'

export const getSettings =
  async () => {

    const response =
      await axios.get(
        'http://localhost:8000/api/settings'
      )

    return response.data

  }