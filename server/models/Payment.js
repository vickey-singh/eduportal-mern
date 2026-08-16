const mongoose = require('mongoose')


const paymentSchema =
  new mongoose.Schema(

    {

      // ======================================
      // STUDENT INFO
      // ======================================

      studentName: {

        type: String,

        required: true,

        trim: true,

      },


      admissionNumber: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // EMAIL
      // OPTIONAL
      // ======================================

      email: {

        type: String,

        default: '',

        lowercase: true,

        trim: true,

      },


      // ======================================
      // PHONE
      // ======================================

      phone: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // COURSE
      // OPTIONAL
      // ======================================

      course: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // FEE INFORMATION
      // ======================================

      totalFee: {

        type: Number,

        default: 0,

        min: 0,

      },


      registrationFee: {

        type: Number,

        default: 0,

        min: 0,

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

        min: 0,

      },


      // ======================================
      // PAYMENT METHOD
      // ======================================

      paymentMethod: {

        type: String,

        default: 'Online',

        trim: true,

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
      // TRANSACTION ID
      // ======================================

      transactionId: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // RAZORPAY ORDER ID
      // ======================================

      razorpayOrderId: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // RAZORPAY PAYMENT ID
      // ======================================

      razorpayPaymentId: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // RAZORPAY SIGNATURE
      // ======================================

      razorpaySignature: {

        type: String,

        default: '',

        trim: true,

      },

    },

    {

      timestamps: true,

    }

  )


// ======================================
// EXPORT MODEL
// ======================================

module.exports =
  mongoose.model(

    'Payment',

    paymentSchema

  )