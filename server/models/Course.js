const mongoose = require('mongoose')


const courseSchema = new mongoose.Schema(

  {

    // ======================================
    // BASIC COURSE INFO
    // ======================================

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

    batchTime: {
      type: String,
      default: '',
      trim: true,
    },


    // ======================================
    // COURSE FEE
    // ======================================

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


    // ======================================
    // PAYMENT
    // ======================================

    fullPaymentFee: {
      type: Number,
      default: 0,
    },


    // ======================================
    // INSTALLMENT
    // ======================================

    installmentAllowed: {
      type: Boolean,
      default: true,
    },


    // ======================================
    // STATUS
    // ======================================

    status: {
      type: String,
      enum: [
        'Active',
        'Inactive',
      ],
      default: 'Active',
    },

  },

  {
    timestamps: true,
  }

)


module.exports =
  mongoose.model(
    'Course',
    courseSchema
  )