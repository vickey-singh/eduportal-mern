const mongoose = require('mongoose')

const settingSchema =
  new mongoose.Schema(

    {

      instituteName: {

        type: String,

        default: 'Prerna Institute',

      },

      logo: {

        type: String,

        default: '',

      },

      phone: {

        type: String,

        default: '',

      },

      email: {

        type: String,

        default: '',

      },

      address: {

        type: String,

        default: '',

      },

      instagram: {

        type: String,

        default: '',

      },

      youtube: {

        type: String,

        default: '',

      },

      linkedin: {

        type: String,

        default: '',

      },

      twitter: {

        type: String,

        default: '',

      },

    },

    {

      timestamps: true,

    }

  )

module.exports =
  mongoose.model(

    'Setting',

    settingSchema

  )