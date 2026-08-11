const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {

    // ======================================
    // STUDENT INFO
    // ======================================

    studentName: {
      type: String,
      required: true,
    },

    admissionNumber: {
      type: String,
      default: '',
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


    // ======================================
    // FEE INFORMATION
    // ======================================

    totalFee: {
      type: Number,
      required: true,
    },

    registrationFee: {
      type: Number,
      default: 0,
    },


    // ======================================
    // PAYMENT CATEGORY
    // ======================================

    paymentCategory: {
      type: String,

      enum: [
        'Registration',
        'CourseFee',
      ],

      required: true,
    },


    // ======================================
    // PAYMENT PLAN
    // ======================================

    paymentPlan: {
      type: String,

      enum: [
        'monthly',
        'three_month',
        'six_month',
        'full',
        '',
      ],

      default: '',
    },


    // ======================================
    // PAYMENT TYPE
    // ======================================

    paymentType: {
      type: String,

      enum: [
        'Full',
        'Installment',
      ],

      required: true,
    },


    // ======================================
    // PAYMENT AMOUNT
    // ======================================

    amountPaid: {
      type: Number,
      required: true,
    },


    // ======================================
    // PAYMENT METHOD
    // ======================================

    paymentMethod: {
      type: String,

      default: 'Online',
    },


    // ======================================
    // PAYMENT MODE
    // ONLINE / OFFLINE
    // ======================================

    paymentMode: {

      type: String,

      enum: [
        'Online',
        'Offline',
      ],

      default: 'Online',

    },


    // ======================================
    // PAYMENT STATUS
    // ======================================

    paymentStatus: {

      type: String,

      enum: [
        'Pending',
        'Success',
        'Failed',
      ],

      default: 'Pending',

    },


    // ======================================
    // RAZORPAY DETAILS
    // ======================================

    transactionId: {
      type: String,
      default: '',
    },

    razorpayOrderId: {
      type: String,
      default: '',
    },

    razorpayPaymentId: {
      type: String,
      default: '',
    },

    razorpaySignature: {
      type: String,
      default: '',
    },

  },

  {
    timestamps: true,
  }

)

module.exports =
  mongoose.model(
    'Payment',
    paymentSchema
  )