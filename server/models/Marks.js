const mongoose = require('mongoose')


// ======================================
// MARKS SCHEMA
// ======================================

const marksSchema =
  new mongoose.Schema(

    {

      // ======================================
      // EXAM
      // ======================================

      examId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Exam',

        required: true,

      },


      // ======================================
      // STUDENT
      // ======================================

      studentId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Student',

        required: true,

      },


      // ======================================
      // STUDENT INFORMATION
      // ======================================

      studentName: {

        type: String,

        default: '',

        trim: true,

      },


      admissionNumber: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // MARKS
      // ======================================

      obtainedMarks: {

        type: Number,

        required: true,

        min: 0,

      },


      // ======================================
      // REMARKS
      // ======================================

      remarks: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // RESULT
      // ======================================

      result: {

        type: String,

        enum: [

          'Pass',

          'Fail',

        ],

        default: 'Fail',

      },

    },

    {

      timestamps: true,

    }

  )


// ======================================
// PREVENT DUPLICATE MARKS
// ======================================
//
// Ek student ke same exam ke liye
// duplicate marks record nahi banega.
// ======================================

marksSchema.index(

  {

    examId: 1,

    studentId: 1,

  },

  {

    unique: true,

  }

)


module.exports =
  mongoose.model(
    'Marks',
    marksSchema
  )