
const mongoose = require('mongoose')

const REMINDER_STAGES = [
  'bulk_due',
  'before_due',
  'due_today',
  'overdue_3_days',
  'overdue_weekly',
]

const REMINDER_STATUSES = [
  'Sending',
  'Sent',
  'Failed',
]

const feeReminderLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
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
      enum: REMINDER_STAGES,
      required: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    // Date key in YYYY-MM-DD format, using Asia/Kolkata.
    scheduledDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    // Unique key prevents the same reminder from being
    // processed more than once.
    reminderKey: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    status: {
      type: String,
      enum: REMINDER_STATUSES,
      default: 'Sending',
    },

    attemptCount: {
      type: Number,
      default: 1,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'attemptCount must be an integer',
      },
    },

    sentAt: {
      type: Date,
      default: null,
    },

    errorMessage: {
      type: String,
      default: '',
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Student reminder history.
feeReminderLogSchema.index({
  studentId: 1,
  scheduledDate: -1,
})

// Operational monitoring and failed-reminder review.
feeReminderLogSchema.index({
  status: 1,
  updatedAt: -1,
})

module.exports =
  mongoose.models.FeeReminderLog ||
  mongoose.model('FeeReminderLog', feeReminderLogSchema)
