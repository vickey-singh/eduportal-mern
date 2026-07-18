const mongoose = require('mongoose')

const receiptSchema = new mongoose.Schema({

  receiptNumber: {

    type: String,

    required: true,

    unique: true,

  },

  admissionNumber: {

    type: String,

    required: true,

  },

  studentName: {

    type: String,

    required: true,

  },

  studentPhone: {

      type: String,
    
      default: '',
    
    },
    
    studentEmail: {
    
      type: String,
    
      default: '',
    
    },

  course: {

    type: String,

    required: true,

  },

  courseFee: {

    type: Number,

    required: true,

  },

  paymentType: {

    type: String,

    enum: ['Full', 'Installment'],

    required: true,

  },

  minimumInstallment: {

    type: Number,

    default: 0,

  },

  amountPaid: {

    type: Number,

    required: true,

  },

  totalPaid: {

    type: Number,

    required: true,

  },

  remainingFee: {

    type: Number,

    required: true,

  },

  paymentMethod: {

    type: String,

    default: 'Razorpay',

  },

  transactionId: {

    type: String,

    default: '',

  },

  orderId: {

    type: String,

    default: '',

  },

  paymentStatus: {

    type: String,

    default: 'Success',

  },

  paymentDate: {

    type: Date,

    default: Date.now,

  },

}, {

  timestamps: true,

})

module.exports = mongoose.model(

  'Receipt',

  receiptSchema

)