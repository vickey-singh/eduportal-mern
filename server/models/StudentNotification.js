const mongoose = require('mongoose')


// ======================================
// STUDENT NOTIFICATION SCHEMA
// ======================================

const studentNotificationSchema =
  new mongoose.Schema(

    {

      // ==================================
      // STUDENT
      // ==================================
      //
      // Kis student ko notification milega
      //
      // ==================================

      studentId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Student',

        required: true,

      },


      // ==================================
      // NOTIFICATION TYPE
      // ==================================

      type: {

        type: String,

        enum: [

          'Timetable',

          'Attendance',

          'Assignment',

          'StudyMaterial',

          'Exam',

          'Marks',

          'Announcement',

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
      // student ko kis page par le jana hai
      //
      // ==================================

      link: {

        type: String,

        default: '',

        trim: true,

      },


      // ==================================
      // RELATED ID
      // ==================================
      //
      // Related document ki MongoDB ID
      //
      // Example:
      //
      // Assignment ID
      // Timetable ID
      // Attendance ID
      // Message ID
      //
      // ==================================

      relatedId: {

        type: String,

        default: '',

        trim: true,

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
// INDEX
// ======================================
//
// Student ki notifications fast fetch
// karne ke liye.
//
// ======================================

studentNotificationSchema.index({

  studentId: 1,

  createdAt: -1,

})


// ======================================
// EXPORT MODEL
// ======================================

module.exports =
  mongoose.model(

    'StudentNotification',

    studentNotificationSchema

  )