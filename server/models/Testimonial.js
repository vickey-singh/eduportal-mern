const mongoose = require('mongoose')

const testimonialSchema =
  new mongoose.Schema(

    {

      studentName: {

        type: String,

        required: true,

      },

      course: {

        type: String,

        required: true,

      },

      image: {

        type: String,

        default: '',

      },

      review: {

        type: String,

        required: true,

      },

    },

    {

      timestamps: true,

    }

  )

module.exports =
  mongoose.model(

    'Testimonial',

    testimonialSchema

  )