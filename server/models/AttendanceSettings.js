
const mongoose = require('mongoose')

const attendanceSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
      required: true,
    },
    workingDays: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

module.exports =
  mongoose.models.AttendanceSettings ||
  mongoose.model('AttendanceSettings', attendanceSettingsSchema)
