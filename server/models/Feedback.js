const mongoose = require('mongoose')

const feedbackSchema =
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

      message: {

        type: String,

        required: true,

      },

      rating: {

        type: Number,

        required: true,

      },

      status: {

        type: String,

        default: 'pending',

      },

    },

    {

      timestamps: true,

    }

  )

module.exports =
  mongoose.model(

    'Feedback',

    feedbackSchema

  )