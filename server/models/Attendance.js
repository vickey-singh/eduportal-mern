const mongoose = require('mongoose')

// ======================================
// ATTENDANCE SCHEMA
// ======================================

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
    // Format: YYYY-MM-DD
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
      enum: ['Present', 'Absent'],
      required: true,
      default: 'Present',
    },

    // ======================================
    // ABSENT EMAIL STATUS
    // ======================================

    absentEmailStatus: {
      type: String,
      enum: [
        'NotSent',
        'Sending',
        'Sent',
        'Failed',
      ],
      default: 'NotSent',
    },

    // ======================================
    // LAST EMAIL ATTEMPT TIME
    // ======================================

    absentEmailAttemptedAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // SUCCESSFUL EMAIL TIME
    // ======================================

    absentEmailSentAt: {
      type: Date,
      default: null,
    },

    // ======================================
    // EMAIL ERROR DETAILS
    // ======================================

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

// ======================================
// PREVENT DUPLICATE ATTENDANCE
// One student = one attendance record per date
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

// ======================================
// EXPORT MODEL
// ======================================

module.exports = mongoose.model(
  'Attendance',
  attendanceSchema
)
