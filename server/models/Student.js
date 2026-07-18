const mongoose = require('mongoose')

// ======================================
// PAYMENT SCHEMA
// ======================================

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },

  paymentMethod: {
    type: String,
    required: true,
  },

  paymentType: {
    type: String,
    enum: ['Full', 'Installment'],
    default: 'Installment',
  },

  paymentMode: {
    type: String,
    enum: ['Offline', 'Online'],
    default: 'Offline',
  },

  paymentStatus: {
    type: String,
    enum: ['Success', 'Pending', 'Failed'],
    default: 'Success',
  },

  transactionId: {
    type: String,
    default: '',
  },

  orderId: {
    type: String,
    default: '',
  },

  paymentDate: {
    type: String,
    required: true,
  },
})

// ======================================
// STUDENT SCHEMA
// ======================================

const studentSchema = new mongoose.Schema(
  {
    // ======================================
    // BASIC INFO
    // ======================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    course: {
      type: String,
      required: true,
      trim: true,
    },

    contact: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    admissionDate: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: '',
    },

    // ======================================
    // ADMISSION
    // ======================================

    admissionType: {
      type: String,
      enum: ['Offline', 'Online'],
      default: 'Offline',
    },

    // ======================================
    // FEES
    // ======================================

    totalFees: {
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

    paidFees: {
      type: Number,
      required: true,
      default: 0,
    },

    remainingFees: {
      type: Number,
      default: 0,
    },

    feesStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid'],
      default: 'Pending',
    },

    dueDate: {
      type: String,
      required: true,
    },

    // ======================================
    // LAST PAYMENT MODE
    // ======================================

    paymentMode: {
      type: String,
      enum: ['Offline', 'Online'],
      default: 'Offline',
    },

    // ======================================
    // PAYMENT HISTORY
    // ======================================

    paymentHistory: [paymentSchema],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Student', studentSchema)