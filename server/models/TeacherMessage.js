const mongoose = require('mongoose')


// ======================================
// TEACHER MESSAGE SCHEMA
// ======================================

const teacherMessageSchema =
  new mongoose.Schema(

    {

      // ======================================
      // SENDER
      // ======================================

      senderType: {

        type: String,

        enum: [

          'Teacher',

          'Student',

        ],

        required: true,

      },


      senderId: {

        type:
          mongoose.Schema.Types.ObjectId,

        required: true,

      },


      // ======================================
      // RECEIVER
      // ======================================

      receiverType: {

        type: String,

        enum: [

          'Teacher',

          'Student',

        ],

        required: true,

      },


      receiverId: {

        type:
          mongoose.Schema.Types.ObjectId,

        required: true,

      },


      // ======================================
      // COURSE
      // ======================================

      course: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // SUBJECT
      // ======================================

      subject: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // MESSAGE
      // ======================================

      message: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // READ STATUS
      // ======================================

      isRead: {

        type: Boolean,

        default: false,

      },


      // ======================================
      // MESSAGE STATUS
      // ======================================

      status: {

        type: String,

        enum: [

          'Sent',

          'Deleted',

        ],

        default: 'Sent',

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

    'TeacherMessage',

    teacherMessageSchema

  )