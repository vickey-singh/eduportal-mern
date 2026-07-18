const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },

    courseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    duration: {
      type: String,
      required: true,
    },

    totalFee: {
      type: Number,
      required: true,
      default: 0,
    },

    registrationFee: {
      type: Number,
      required: true,
      default: 0,
    },

    installmentAllowed: {
      type: Boolean,
      default: true,
    },

    minimumInstallment: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Course', courseSchema)