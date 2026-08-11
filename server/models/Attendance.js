const mongoose = require('mongoose')


const attendanceSchema = new mongoose.Schema(

  {

    // ======================================
    // STUDENT
    // ======================================

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    admissionNumber: {
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
    // BATCH TIME
    // ======================================

    batchTime: {
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
      default: 'Present',
    },

  },

  {
    timestamps: true,
  }

)


// ======================================
// PREVENT DUPLICATE ATTENDANCE
// ======================================

attendanceSchema.index(
  {
    student: 1,
    date: 1,
  },
  {
    unique: true,
  }
)


module.exports =
  mongoose.model(
    'Attendance',
    attendanceSchema
  )