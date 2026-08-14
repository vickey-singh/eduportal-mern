const mongoose = require('mongoose')


// ======================================
// FACULTY ATTENDANCE SCHEMA
// ======================================

const facultyAttendanceSchema =
  new mongoose.Schema(

    {

      // ======================================
      // FACULTY
      // ======================================

      facultyId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Faculty',

        required: true,

      },


      // ======================================
      // FACULTY NAME
      // ======================================

      facultyName: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // ATTENDANCE DATE
      // ======================================

      date: {

        type: String,

        required: true,

      },


      // ======================================
      // ATTENDANCE STATUS
      // ======================================

      status: {

        type: String,

        enum: [

          'Present',

          'Absent',

        ],

        required: true,

      },

    },

    {

      timestamps: true,

    }

  )


// ======================================
// PREVENT DUPLICATE ATTENDANCE
// ======================================
//
// Ek faculty ki ek date par
// sirf ek attendance record hoga.
// ======================================

facultyAttendanceSchema.index(

  {

    facultyId: 1,

    date: 1,

  },

  {

    unique: true,

  }

)


// ======================================
// EXPORT
// ======================================

module.exports =
  mongoose.model(

    'FacultyAttendance',

    facultyAttendanceSchema

  )