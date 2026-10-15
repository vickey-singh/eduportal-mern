
const mongoose = require('mongoose')

// ======================================
// FACULTY ATTENDANCE SCHEMA
// ======================================

const facultyAttendanceSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: true,
    },

    facultyName: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      required: true,
      default: 'Present',
    },

    remarks: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
)

// ======================================
// PREVENT DUPLICATE FACULTY ATTENDANCE
// FOR THE SAME DATE
// ======================================

facultyAttendanceSchema.index(
  { facultyId: 1, date: 1 },
  { unique: true }
)

// ======================================
// EXPORT MODEL
// ======================================

module.exports = mongoose.model(
  'FacultyAttendance',
  facultyAttendanceSchema
)
