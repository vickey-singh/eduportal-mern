const mongoose = require('mongoose')

const downloadSchema =
  new mongoose.Schema(

    {

      // ======================================
      // FILE TITLE
      // ======================================

      title: {

        type: String,

        required: true,

      },

      // ======================================
      // CATEGORY
      // ======================================

      category: {

        type: String,

        required: true,

      },

      // ======================================
      // DESCRIPTION
      // ======================================

      description: {

        type: String,

        default: '',

      },

      // ======================================
      // PDF FILE
      // ======================================

      file: {

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

    'Download',

    downloadSchema

  )