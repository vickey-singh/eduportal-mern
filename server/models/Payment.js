const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(

  {

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

    totalFee: {

      type: Number,

      required: true,

    },

    registrationFee: {

      type: Number,

      required: true,

    },

    minimumInstallment: {

      type: Number,

      default: 0,

    },

    paymentType: {

      type: String,

      enum: [

        'Full',

        'Installment',

      ],

      required: true,

    },

    amountPaid: {

      type: Number,

      required: true,

    },

    paymentMethod: {

      type: String,

      default: 'Online',

    },

    paymentStatus: {

      type: String,

      enum: [

        'Pending',

        'Success',

        'Failed',

      ],

      default: 'Pending',

    },

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

module.exports = mongoose.model(

  'Payment',

  paymentSchema

)