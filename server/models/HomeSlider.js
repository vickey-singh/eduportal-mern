const mongoose = require('mongoose')

// ======================================
// HOME SLIDER SCHEMA
// ======================================

const homeSliderSchema =
  new mongoose.Schema(

    {

      // ======================================
      // MEDIA TYPE
      // IMAGE / VIDEO
      // ======================================

      mediaType: {

        type: String,

        enum: [
          'image',
          'video',
        ],

        required: true,

      },


      // ======================================
      // MEDIA URL
      // ======================================

      mediaUrl: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // SLIDE TITLE
      // ======================================

      title: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // SLIDE DESCRIPTION
      // ======================================

      description: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // ACTIVE / INACTIVE
      // ======================================

      isActive: {

        type: Boolean,

        default: true,

      },


      // ======================================
      // DISPLAY ORDER
      // ======================================

      order: {

        type: Number,

        default: 0,

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
    'HomeSlider',
    homeSliderSchema
  )