const mongoose = require('mongoose')


const receiptSchema =
  new mongoose.Schema({


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

    studentId: {

      type:
        mongoose.Schema.Types.ObjectId,

      ref: 'Student',

      required: true,

      index: true,

    },


    admissionNumber: {

      type: String,

      required: true,

    },


    // ==================================
    // STUDENT PASSWORD
    // ==================================
    //
    // Password = Student DOB
    //
    // Format:
    // DDMMYYYY
    //
    // Example:
    // DOB = 15/08/2005
    // Password = 15082005
    //
    // ==================================

    studentPassword: {

      type: String,

      default: '',

      trim: true,

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


    batchTime: {

      type: String,

      default: '',

    },


// ======================================
// FEE DETAILS
// ======================================

    courseFee: {

      type: Number,

      required: true,

    },


    registrationFee: {

      type: Number,

      default: 0,

    },


    registrationFeePaid: {

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
// MINIMUM INSTALLMENT
// ======================================

    minimumInstallment: {

      type: Number,

      default: 0,

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

      enum: [

        'Success',

        'Pending',

        'Failed',

      ],

      default: 'Success',

    },


    paymentDate: {

      type: Date,

      default: Date.now,

    },


  }, {

    timestamps: true,

  })


// ======================================
// INDEX
// ======================================
//
// Student ki receipts fast fetch
// karne ke liye.
//
// ======================================

receiptSchema.index({

  studentId: 1,

  paymentDate: -1,

})


// ======================================
// EXPORT MODEL
// ======================================

module.exports =
  mongoose.model(

    'Receipt',

    receiptSchema

  )