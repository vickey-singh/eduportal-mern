const mongoose = require('mongoose')


// ======================================
// TIMETABLE SCHEMA
// ======================================

const timetableSchema =
  new mongoose.Schema(

    {

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
      // DAY
      // ======================================

      day: {

        type: String,

        enum: [

          'Monday',

          'Tuesday',

          'Wednesday',

          'Thursday',

          'Friday',

          'Saturday',

          'Sunday',

        ],

        required: true,

      },


      // ======================================
      // SUBJECT
      // ======================================

      subject: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // START TIME
      // ======================================

      startTime: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // END TIME
      // ======================================

      endTime: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // ROOM / CLASS
      // ======================================

      room: {

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

    'Timetable',

    timetableSchema

  )