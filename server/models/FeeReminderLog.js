
const mongoose = require('mongoose')

const feeReminderLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

    installmentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    admissionNumber: {
      type: String,
      default: '',
      trim: true,
    },

    studentEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },

    reminderStage: {
      type: String,
      enum: [
        'bulk_due',
        'before_due',
        'due_today',
        'overdue_3_days',
        'overdue_weekly',
      ],
      required: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    scheduledDate: {
      type: String,
      required: true,
    },

    reminderKey: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ['Sending', 'Sent', 'Failed'],
      default: 'Sending',
      index: true,
    },

    attemptCount: {
      type: Number,
      default: 1,
      min: 0,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    errorMessage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model(
  'FeeReminderLog',
  feeReminderLogSchema
)
