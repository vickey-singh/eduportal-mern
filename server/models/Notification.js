const mongoose = require('mongoose')

// ======================================
// NOTIFICATION SCHEMA
// ======================================

const notificationSchema =
  new mongoose.Schema(

    {

      // ==================================
      // NOTIFICATION TYPE
      // ==================================

      type: {

        type: String,

        enum: [
          'Admission',
          'Payment',
          'Feedback',
          'Message',
        ],

        required: true,

      },


      // ==================================
      // TITLE
      // ==================================

      title: {

        type: String,

        required: true,

        trim: true,

      },


      // ==================================
      // MESSAGE
      // ==================================

      message: {

        type: String,

        required: true,

        trim: true,

      },


      // ==================================
      // PAGE LINK
      // ==================================
      //
      // Notification par click karne par
      // admin ko kis page par le jana hai
      //
      // Example:
      //
      // /admin/students
      // /admin/payments
      // /admin/feedbacks
      // /admin/messages
      //
      // ==================================

      link: {

        type: String,

        default: '',

      },


      // ==================================
      // RELATED ID
      // ==================================
      //
      // Student / Payment / Feedback /
      // Message ki MongoDB ID
      //
      // ==================================

      relatedId: {

        type: String,

        default: '',

      },


      // ==================================
      // READ STATUS
      // ==================================

      isRead: {

        type: Boolean,

        default: false,

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
    'Notification',
    notificationSchema
  )