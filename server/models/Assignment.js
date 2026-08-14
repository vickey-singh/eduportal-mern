const mongoose = require('mongoose')


// ======================================
// ASSIGNMENT SCHEMA
// ======================================

const assignmentSchema =
  new mongoose.Schema(

    {

      // ======================================
      // BASIC INFORMATION
      // ======================================

      title: {

        type: String,

        required: true,

        trim: true,

      },


      description: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // COURSE
      // ======================================

      course: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // BATCH
      // ======================================

      batchTime: {

        type: String,

        required: true,

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
      // DATES
      // ======================================

      assignedDate: {

        type: String,

        required: true,

      },


      dueDate: {

        type: String,

        required: true,

      },


      // ======================================
      // ATTACHMENT
      // ======================================

      attachment: {

        type: String,

        default: '',

      },


      attachmentName: {

        type: String,

        default: '',

      },


      // ======================================
      // TEACHER
      // ======================================

      teacherId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Faculty',

        required: true,

      },


      teacherName: {

        type: String,

        default: '',

      },


      // ======================================
      // STATUS
      // ======================================

      status: {

        type: String,

        enum: [

          'Active',

          'Closed',

        ],

        default: 'Active',

      },

    },

    {

      timestamps: true,

    }

  )


module.exports =
  mongoose.model(
    'Assignment',
    assignmentSchema
  )