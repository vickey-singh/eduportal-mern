const mongoose = require('mongoose')

const achievementSchema =
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

      rank: {

        type: String,

        required: true,

      },

      marks: {

        type: String,

        required: true,

      },

      image: {

        type: String,

        default: '',

      },

      description: {

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

    'Achievement',

    achievementSchema

  )