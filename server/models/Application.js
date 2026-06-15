const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    message: {
      type: String,
    },

    status: {
      type: String,
      default: 'Pending',
    },
    
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model(
  'Application',
  applicationSchema
)