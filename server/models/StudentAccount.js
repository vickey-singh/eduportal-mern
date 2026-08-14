const mongoose = require('mongoose')


// ======================================
// STUDENT ACCOUNT SCHEMA
// ======================================

const studentAccountSchema =
  new mongoose.Schema(

    {

      // ======================================
      // STUDENT REFERENCE
      // ======================================

      studentId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Student',

        required: true,

        unique: true,

      },


      // ======================================
      // LOGIN ID
      // ======================================
      // Admission Number hi Student Portal ID hoga.
      // ======================================

      admissionNumber: {

        type: String,

        required: true,

        unique: true,

        trim: true,

      },


      // ======================================
      // PASSWORD
      // ======================================
      // DOB se initial password generate hoga,
      // lekin database mein hashed password rahega.
      // ======================================

      passwordHash: {

        type: String,

        required: true,

      },


      // ======================================
      // STUDENT ACCOUNT STATUS
      // ======================================

      isStudent: {

        type: Boolean,

        default: true,

      },


      // ======================================
      // ACCOUNT STATUS
      // ======================================

      accountStatus: {

        type: String,

        enum: [

          'Active',

          'Inactive',

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

    'StudentAccount',

    studentAccountSchema

  )