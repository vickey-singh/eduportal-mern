const mongoose = require('mongoose')

// ======================================
// ATTENDANCE SCHEMA
// ======================================

const attendanceSchema = new mongoose.Schema(
  {
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

    course: {
      type: String,
      required: true,
      trim: true,
    },

    batchTime: {
      type: String,
      default: '',
      trim: true,
    },

    // Format: YYYY-MM-DD
    date: {
      type: String,
      required: true,
    },

    // Primary attendance status. Late is retained for backward compatibility.
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      required: true,
      default: 'Present',
    },

    // Late is independent from Present, so both can be true at once.
    isLate: {
      type: Boolean,
      default: false,
    },

    remarks: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },

    absentEmailStatus: {
      type: String,
      enum: ['NotSent', 'Sending', 'Sent', 'Failed'],
      default: 'NotSent',
    },

    absentEmailAttemptedAt: {
      type: Date,
      default: null,
    },

    absentEmailSentAt: {
      type: Date,
      default: null,
    },

    absentEmailError: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// One student = one attendance record per date
attendanceSchema.index(
  {
    student: 1,
    date: 1,
  },
  {
    unique: true,
  }
)

module.exports = mongoose.model('Attendance', attendanceSchema)
