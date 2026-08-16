const mongoose = require('mongoose')


// ======================================
// PAYMENT SCHEMA
// ======================================

const paymentSchema =
  new mongoose.Schema({

    amount: {

      type: Number,

      required: true,

    },


    paymentCategory: {

      type: String,

      enum: [

        'Registration',

        'CourseFee',

      ],

      required: true,

    },


    paymentMethod: {

      type: String,

      required: true,

    },


    paymentType: {

      type: String,

      enum: [

        'Full',

        'Installment',

      ],

      default: 'Installment',

    },


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


    paymentMode: {

      type: String,

      enum: [

        'Offline',

        'Online',

      ],

      default: 'Offline',

    },


    paymentStatus: {

      type: String,

      enum: [

        'Success',

        'Pending',

        'Failed',

      ],

      default: 'Success',

    },


    transactionId: {

      type: String,

      default: '',

    },


    orderId: {

      type: String,

      default: '',

    },


    paymentDate: {

      type: String,

      required: true,

    },

  })


// ======================================
// STUDENT SCHEMA
// ======================================

const studentSchema =
  new mongoose.Schema(

    {

      // ======================================
      // BASIC INFORMATION
      // ======================================

      name: {

        type: String,

        required: true,

        trim: true,

      },


      dob: {

        type: String,

        default: '',

      },


      // ======================================
      // AADHAAR
      // ======================================
      //
      // OPTIONAL
      //
      // ======================================

      aadharNumber: {

        type: String,

        default: '',

        trim: true,

      },


      admissionNumber: {

        type: String,

        required: true,

        unique: true,

        trim: true,

      },


      // ======================================
      // COURSE
      // ======================================
      //
      // OPTIONAL
      //
      // Student admission ke time course
      // baad mein bhi add/update kiya ja
      // sakta hai.
      //
      // ======================================

      course: {

        type: String,

        default: '',

        trim: true,

      },


      batchTime: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // STUDENT MOBILE
      // ======================================
      //
      // REQUIRED
      //
      // ======================================

      contact: {

        type: String,

        required: true,

        trim: true,

      },


      // ======================================
      // EMAIL
      // ======================================
      //
      // OPTIONAL
      //
      // ======================================

      email: {

        type: String,

        default: '',

        lowercase: true,

        trim: true,

      },


      // ======================================
      // ADMISSION DATE
      // ======================================

      admissionDate: {

        type: String,

        required: true,

      },


      // ======================================
      // ACADEMIC SESSION
      // ======================================
      //
      // Example:
      // 2026-2027
      // 2027-2028
      //
      // New admission ke time backend
      // automatically session assign karega.
      //
      // ======================================

      session: {

        type: String,

        default: '',

        trim: true,

        index: true,

      },


      // ======================================
      // STUDENT STATUS
      // ======================================
      //
      // Active:
      // Student currently institute me active hai.
      //
      // Inactive:
      // Student temporarily inactive hai.
      //
      // Example:
      // Student 1-2 month ke liye bahar gaya
      // ho to admin Inactive kar sakta hai.
      //
      // ======================================

      studentStatus: {

        type: String,

        enum: [

          'Active',

          'Inactive',

        ],

        default: 'Active',

        trim: true,

        index: true,

      },


      image: {

        type: String,

        default: '',

      },


      // ======================================
      // PARENTS INFORMATION
      // ======================================

      fatherName: {

        type: String,

        default: '',

        trim: true,

      },


      motherName: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // FATHER OCCUPATION
      // ======================================
      //
      // OPTIONAL
      //
      // ======================================

      fatherOccupation: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // MOTHER OCCUPATION
      // ======================================
      //
      // OPTIONAL
      //
      // ======================================

      motherOccupation: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // FATHER MOBILE
      // ======================================
      //
      // OPTIONAL
      //
      // ======================================

      fatherMobile: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // MOTHER MOBILE
      // ======================================
      //
      // OPTIONAL
      //
      // ======================================

      motherMobile: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // ADDRESS
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
      // EDUCATION
      // ======================================

      schoolCollegeName: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // ADMISSION
      // ======================================

      admissionType: {

        type: String,

        enum: [

          'Offline',

          'Online',

        ],

        default: 'Offline',

      },


      // ======================================
      // REGISTRATION FEE
      // ======================================
      //
      // OPTIONAL
      //
      // Default 0
      //
      // ======================================

      registrationFee: {

        type: Number,

        default: 0,

      },


      registrationFeePaid: {

        type: Number,

        default: 0,

      },


      registrationFeeStatus: {

        type: String,

        enum: [

          'Pending',

          'Paid',

        ],

        default: 'Pending',

      },


      // ======================================
      // COURSE FEE
      // ======================================
      //
      // OPTIONAL
      //
      // Default 0
      //
      // ======================================

      totalFees: {

        type: Number,

        default: 0,

      },


      // ======================================
      // PAID FEE
      // ======================================
      //
      // OPTIONAL
      //
      // Default 0
      //
      // ======================================

      paidFees: {

        type: Number,

        default: 0,

      },


      remainingFees: {

        type: Number,

        default: 0,

      },


      feesStatus: {

        type: String,

        enum: [

          'Pending',

          'Partial',

          'Paid',

        ],

        default: 'Pending',

      },


      // ======================================
      // STUDENT-SPECIFIC PAYMENT OPTIONS
      // ======================================

      monthlyInstallment: {

        type: Number,

        default: 0,

      },


      threeMonthInstallment: {

        type: Number,

        default: 0,

      },


      sixMonthInstallment: {

        type: Number,

        default: 0,

      },


      fullPaymentFee: {

        type: Number,

        default: 0,

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
      // DUE DATE
      // ======================================

      dueDate: {

        type: String,

        default: '',

      },


      // ======================================
      // LAST PAYMENT MODE
      // ======================================

      paymentMode: {

        type: String,

        enum: [

          'Offline',

          'Online',

        ],

        default: 'Offline',

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


// ======================================
// SESSION INDEX
// ======================================
//
// Session-wise student filtering fast
// karne ke liye.
//
// ======================================

studentSchema.index({

  session: 1,

  admissionDate: -1,

})


// ======================================
// SESSION + FEE STATUS INDEX
// ======================================
//
// Current session ke Paid / Partial /
// Pending students fast filter karne
// ke liye.
//
// ======================================

studentSchema.index({

  session: 1,

  feesStatus: 1,

})


// ======================================
// SESSION + COURSE INDEX
// ======================================

studentSchema.index({

  session: 1,

  course: 1,

})


// ======================================
// SESSION + BATCH INDEX
// ======================================

studentSchema.index({

  session: 1,

  batchTime: 1,

})


// ======================================
// SESSION + STUDENT STATUS INDEX
// ======================================
//
// Active / Inactive students ko
// session-wise fast filter karne ke liye.
//
// ======================================

studentSchema.index({

  session: 1,

  studentStatus: 1,

})


// ======================================
// EXPORT MODEL
// ======================================

module.exports =
  mongoose.model(

    'Student',

    studentSchema

  )