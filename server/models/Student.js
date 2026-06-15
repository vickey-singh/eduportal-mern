const mongoose = require('mongoose')

const paymentSchema =
  new mongoose.Schema({

    amount: {

      type: Number,

      required: true,

    },

    paymentMethod: {

      type: String,

      required: true,

    },

    paymentDate: {

      type: String,

      required: true,

    },

  })

const studentSchema =
  new mongoose.Schema(

    {

      // ======================================
      // BASIC INFO
      // ======================================

      name: {

        type: String,

        required: true,

      },

      admissionNumber: {

        type: String,

        required: true,

      },

      course: {

        type: String,

        required: true,

      },

      contact: {

        type: String,

        required: true,

      },

      email: {

        type: String,

        required: true,

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
      // FEES MANAGEMENT
      // ======================================

      totalFees: {

        type: Number,

        required: true,

      },

      paidFees: {

        type: Number,

        required: true,

      },

      remainingFees: {

        type: Number,

        default: 0,

      },

      feesStatus: {

        type: String,

        default: 'Pending',

      },

      dueDate: {

        type: String,

        required: true,

      },

      // ======================================
      // PAYMENT HISTORY
      // ======================================

      paymentHistory: [

        paymentSchema

      ],

    },

    {

      timestamps: true,

    }

  )

module.exports =
  mongoose.model(

    'Student',

    studentSchema

  )