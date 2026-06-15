const mongoose = require('mongoose')

const facultySchema =
  new mongoose.Schema(

    {

      name: {

        type: String,

        required: true,

      },

      designation: {

        type: String,

        required: true,

      },

      experience: {

        type: String,

        required: true,

      },

      subject: {

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
    'Faculty',
    facultySchema
  )