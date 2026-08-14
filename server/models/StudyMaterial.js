const mongoose = require('mongoose')


// ======================================
// STUDY MATERIAL SCHEMA
// ======================================

const studyMaterialSchema =
  new mongoose.Schema(

    {

      // ======================================
      // MATERIAL TITLE
      // ======================================

      title: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // SUBJECT
      // ======================================

      subject: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // COURSE
      // ======================================

      course: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // BATCH
      // ======================================

      batchTime: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // DESCRIPTION
      // ======================================

      description: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // MATERIAL TYPE
      // ======================================

      materialType: {

        type: String,

        enum: [

          'PDF',

          'Document',

          'Presentation',

          'Video',

          'Link',

          'Other',

        ],

        default: 'PDF',

      },


      // ======================================
      // FILE INFORMATION
      // ======================================

      fileUrl: {

        type: String,

        default: '',

      },

      fileName: {

        type: String,

        default: '',

      },


      // ======================================
      // EXTERNAL LINK
      // ======================================

      externalLink: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // TEACHER
      // ======================================

      teacherId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Faculty',

        required: true,

      },


      // ======================================
      // STATUS
      // ======================================

      status: {

        type: String,

        enum: [

          'Active',

          'Inactive',

        ],

        default: 'Active',

      },

    },

    {

      timestamps: true,

    }

  )


module.exports =
  mongoose.model(

    'StudyMaterial',

    studyMaterialSchema

  )