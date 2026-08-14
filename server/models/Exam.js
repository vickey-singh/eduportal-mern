const mongoose = require('mongoose')


// ======================================
// EXAM SCHEMA
// ======================================

const examSchema =
  new mongoose.Schema(

    {

      // ======================================
      // EXAM INFORMATION
      // ======================================

      examName: {

        type: String,

        required: true,

        trim: true,

      },


      examType: {

        type: String,

        enum: [

          'Class Test',

          'Unit Test',

          'Monthly Test',

          'Mock Test',

          'Mid Term',

          'Final Exam',

          'Other',

        ],

        default: 'Class Test',

      },


      subject: {

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
      // EXAM DATE
      // ======================================

      examDate: {

        type: String,

        required: true,

      },


      // ======================================
      // MAXIMUM MARKS
      // ======================================

      totalMarks: {

        type: Number,

        required: true,

        min: 1,

      },


      // ======================================
      // PASSING MARKS
      // ======================================

      passingMarks: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // DESCRIPTION
      // ======================================

      description: {

        type: String,

        default: '',

        trim: true,

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

        trim: true,

      },


      // ======================================
      // STATUS
      // ======================================

      status: {

        type: String,

        enum: [

          'Upcoming',

          'Active',

          'Completed',

          'Cancelled',

        ],

        default: 'Upcoming',

      },

    },

    {

      timestamps: true,

    }

  )


module.exports =
  mongoose.model(
    'Exam',
    examSchema
  )