
const mongoose = require('mongoose')

const attendanceHolidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    startDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    endDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

attendanceHolidaySchema.index({ startDate: 1, endDate: 1 })

module.exports =
  mongoose.models.AttendanceHoliday ||
  mongoose.model('AttendanceHoliday', attendanceHolidaySchema)
