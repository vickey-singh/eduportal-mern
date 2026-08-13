import axios from 'axios'

import { API_URL } from '../config/api'


// ======================================
// GET ALL HOME SLIDERS
// ======================================

export const getHomeSliders =
  async () => {

    const response =
      await axios.get(
        `${API_URL}/home-sliders`
      )

    return response.data

  }


// ======================================
// GET ACTIVE HOME SLIDERS
// ======================================

export const getActiveHomeSliders =
  async () => {

    const response =
      await axios.get(
        `${API_URL}/home-sliders/active`
      )

    return response.data

  }


// ======================================
// ADD HOME SLIDER
// IMAGE / VIDEO
// ======================================

export const addHomeSlider =
  async (formData) => {

    const response =
      await axios.post(

        `${API_URL}/home-sliders`,

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
// UPDATE HOME SLIDER
// ======================================

export const updateHomeSlider =
  async (
    id,
    formData
  ) => {

    const response =
      await axios.put(

        `${API_URL}/home-sliders/${id}`,

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
// DELETE HOME SLIDER
// ======================================

export const deleteHomeSlider =
  async (id) => {

    const response =
      await axios.delete(

        `${API_URL}/home-sliders/${id}`

      )

    return response.data

  }