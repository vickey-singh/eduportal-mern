const mongoose = require('mongoose')


// ======================================
// ANNOUNCEMENT SCHEMA
// ======================================

const announcementSchema =
  new mongoose.Schema(

    {

      // ======================================
      // TITLE
      // ======================================

      title: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // MESSAGE
      // ======================================

      message: {

        type: String,

        required: true,

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
      // TEACHER
      // ======================================

      teacherId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Faculty',

        required: true,

      },


      // ======================================
      // PRIORITY
      // ======================================

      priority: {

        type: String,

        enum: [

          'Normal',

          'Important',

          'Urgent',

        ],

        default: 'Normal',

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


      // ======================================
      // EXPIRY DATE
      // ======================================

      expiryDate: {

        type: String,

        default: '',

        trim: true,

      },

    },

    {

      timestamps: true,

    }

  )


module.exports =
  mongoose.model(

    'Announcement',

    announcementSchema

  )