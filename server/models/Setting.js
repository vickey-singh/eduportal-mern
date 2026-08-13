const mongoose = require('mongoose')

// ======================================
// SETTINGS SCHEMA
// ======================================

const settingSchema =
  new mongoose.Schema(

    {

      // ======================================
      // INSTITUTE INFORMATION
      // ======================================

      instituteName: {

        type: String,

        default:
          'Prerna Institute Of Excellence',

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

      website: {

        type: String,

        default: '',

      },

      address: {

        type: String,

        default: '',

      },

      googleMapUrl: {

        type: String,

        default: '',

      },


      // ======================================
      // SOCIAL MEDIA
      // ======================================

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


      // ======================================
      // HOME PAGE - ABOUT SECTION
      // ======================================

      aboutImage: {

        type: String,

        default: '',

      },


      // ======================================
      // HOME PAGE - DIRECTOR SECTION
      // ======================================

      directorName: {

        type: String,

        default:
          'Vikash Upadhyay',

      },

      directorDesignation: {

        type: String,

        default:
          'Director',

      },

      directorImage: {

        type: String,

        default: '',

      },

    },

    {

      timestamps: true,

    }

  )


// ======================================
// EXPORT MODEL
// ======================================

module.exports =
  mongoose.model(
    'Setting',
    settingSchema
  )