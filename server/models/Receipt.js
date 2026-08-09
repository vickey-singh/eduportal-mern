const mongoose = require('mongoose')

const receiptSchema = new mongoose.Schema({

  // ======================================
  // RECEIPT
  // ======================================

  receiptNumber: {
    type: String,
    required: true,
    unique: true,
  },

  // ======================================
  // STUDENT
  // ======================================

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

  // ======================================
  // COURSE / FEE
  // ======================================

  courseFee: {
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

  totalPaid: {
    type: Number,
    required: true,
  },

  remainingFee: {
    type: Number,
    required: true,
  },

  // ======================================
  // PAYMENT DETAILS
  // ======================================

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