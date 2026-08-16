const mongoose = require('mongoose')


// ======================================
// ASSIGNED CLASS SCHEMA
// ======================================

const assignedClassSchema =
  new mongoose.Schema(

    {

      courseId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Course',

        required: true,

      },

      batchTime: {

        type: String,

        required: true,

        trim: true,

      },

    },

    {

      _id: false,

    }

  )


// ======================================
// FACULTY SCHEMA
// ======================================

const facultySchema =
  new mongoose.Schema(

    {

      // ======================================
      // PUBLIC FACULTY INFORMATION
      // ======================================

      name: {

        type: String,

        required: true,

        trim: true,

      },

      designation: {

        type: String,

        required: true,

        trim: true,

      },

      experience: {

        type: String,

        required: true,

        trim: true,

      },

      subject: {

        type: String,

        required: true,

        trim: true,

      },

      image: {

        type: String,

        default: '',

      },

      description: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // PRIVATE PERSONAL INFORMATION
      // ======================================

      dob: {

        type: String,

        default: '',

        trim: true,

      },

      gender: {

        type: String,

        enum: [

          '',

          'Male',

          'Female',

          'Other',

        ],

        default: '',

      },

      aadharNumber: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // PRIVATE CONTACT INFORMATION
      // ======================================

      phone: {

        type: String,

        default: '',

        trim: true,

      },

      email: {

        type: String,

        default: '',

        lowercase: true,

        trim: true,

      },


      // ======================================
      // PRIVATE ADDRESS INFORMATION
      // ======================================

      permanentAddress: {

        type: String,

        default: '',

        trim: true,

      },

      currentAddress: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // PROFESSIONAL INFORMATION
      // ======================================

      qualification: {

        type: String,

        default: '',

        trim: true,

      },

      institution: {

        type: String,

        default: '',

        trim: true,

      },

      joiningDate: {

        type: String,

        default: '',

        trim: true,

      },

      employeeId: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // TEACHER ACCOUNT
      // ======================================

      teacherId: {

        type: String,

        unique: true,

        sparse: true,

        trim: true,

      },

      passwordHash: {

        type: String,

        default: '',

      },

      isTeacher: {

        type: Boolean,

        default: false,

      },

      accountStatus: {

        type: String,

        enum: [

          'Active',

          'Inactive',

        ],

        default: 'Active',

      },


      // ======================================
      // ASSIGNED COURSES + BATCHES
      // ======================================

      assignedClasses: {

        type: [

          assignedClassSchema,

        ],

        default: [],

      },


      // ======================================
      // FACULTY SALARY
      // ======================================

      // Current monthly salary

      monthlySalary: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // MONTHLY SALARY HISTORY
      // ======================================

      salaryRecords: [

        {

          // ================================
          // MONTH
          // ================================

          month: {

            type: Number,

            required: true,

            min: 1,

            max: 12,

          },


          // ================================
          // YEAR
          // ================================

          year: {

            type: Number,

            required: true,

          },


          // ================================
          // SALARY AMOUNT
          // ================================

          amount: {

            type: Number,

            required: true,

            min: 0,

          },


          // ================================
          // PAYMENT STATUS
          // ================================

          status: {

            type: String,

            enum: [

              'Paid',

              'Due',

            ],

            default: 'Due',

          },


          // ================================
          // PAYMENT DATE
          // ================================

          paymentDate: {

            type: Date,

            default: null,

          },


          // ================================
          // PAYMENT METHOD
          // ================================

          paymentMethod: {

            type: String,

            default: '',

            trim: true,

          },


          // ================================
          // REMARKS
          // ================================

          remarks: {

            type: String,

            default: '',

            trim: true,

          },

        },

      ],


      // ======================================
      // WEBSITE VISIBILITY
      // ======================================

      isWebsiteVisible: {

        type: Boolean,

        default: true,

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

    'Faculty',

    facultySchema

  )