import axios from 'axios'
import { API_URL } from '../config/api'

export const getReceipt = async (receiptNumber) => {

  const response = await axios.get(
    `${API_URL}/receipt/${receiptNumber}`
  )

  return response.data
}