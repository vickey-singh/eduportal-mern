import axios from 'axios'

import { API_URL } from '../config/api'


// ======================================
// CREATE ORDER
// ======================================

export const createOrder = async (data) => {

  const response =
    await axios.post(

      `${API_URL}/payments/create-order`,

      data

    )

  return response.data

}


// ======================================
// VERIFY PAYMENT
// ======================================

export const verifyPayment = async (formData) => {

  const response =
    await axios.post(

      `${API_URL}/payments/verify`,

      formData,

      {
        headers: {
          'Content-Type':
            'multipart/form-data',
        },
      }

    )

  return response.data

}


// ======================================
// EXISTING STUDENT PAYMENT
// ======================================

export const payExistingStudent = async (data) => {

  const response =
    await axios.post(

      `${API_URL}/students/pay`,

      data

    )

  return response.data

}


// ======================================
// CHECK STUDENT
// ======================================

export const checkStudent = async (data) => {

  const response =
    await axios.post(

      `${API_URL}/students/check`,

      data

    )

  return response.data

}


// ======================================
// GET ALL PAYMENTS
// ======================================

export const getPayments = async () => {

  const response =
    await axios.get(

      `${API_URL}/payments`

    )

  return response.data

}


// ======================================
// GET PAYMENT REVENUE
// ======================================
//
// filters:
//
// {}
//
// {
//   month: 8,
//   year: 2026
// }
//
// {
//   year: 2026
// }
//
// ======================================

export const getPaymentRevenue =
  async (filters = {}) => {

    const params = {}


    if (
      filters.year
    ) {

      params.year =
        filters.year

    }


    if (
      filters.month
    ) {

      params.month =
        filters.month

    }


    const response =
      await axios.get(

        `${API_URL}/payments/revenue`,

        {
          params,
        }

      )


    return response.data

  }


// ======================================
// GET REVENUE REPORT
// ======================================
//
// {
//   year: 2026
// }
//
// ======================================

export const getRevenueReport =
  async (filters = {}) => {

    const params = {}


    if (
      filters.year
    ) {

      params.year =
        filters.year

    }


    const response =
      await axios.get(

        `${API_URL}/payments/revenue-report`,

        {
          params,
        }

      )


    return response.data

  }