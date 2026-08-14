const mongoose = require('mongoose')


// ======================================
// STUDENT TIMETABLE SCHEMA
// ======================================

const studentTimetableSchema =
  new mongoose.Schema(

    {

      // ======================================
      // STUDENT REFERENCE
      // ======================================

      studentId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Student',

        required: true,

      },


      // ======================================
      // TIMETABLE REFERENCE
      // ======================================
      // Teacher ke existing Timetable.js
      // record ko reference karega.
      // ======================================

      timetableId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Timetable',

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


// ======================================
// INDEX
// ======================================

studentTimetableSchema.index({

  studentId: 1,

  timetableId: 1,

}, {

  unique: true,

})


// ======================================
// EXPORT
// ======================================

module.exports =
  mongoose.model(

    'StudentTimetable',

    studentTimetableSchema

  )