const mongoose = require('mongoose')

// ======================================
// PAYMENT SCHEMA
// ======================================

const paymentSchema = new mongoose.Schema({

  amount: {
    type: Number,
    required: true,
  },

  paymentCategory: {
    type: String,
    enum: ['Registration', 'CourseFee'],
    required: true,
  },

  paymentMethod: {
    type: String,
    required: true,
  },

  paymentType: {
    type: String,
    enum: ['Full', 'Installment'],
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
    enum: ['Offline', 'Online'],
    default: 'Offline',
  },

  paymentStatus: {
    type: String,
    enum: ['Success', 'Pending', 'Failed'],
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

const studentSchema = new mongoose.Schema(
  {

    // ======================================
    // BASIC INFO
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

    course: {
      type: String,
      required: true,
      trim: true,
    },

    batchTime: {
      type: String,
      default: '',
      trim: true,
    },

    contact: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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

    fatherOccupation: {
      type: String,
      default: '',
      trim: true,
    },

    motherOccupation: {
      type: String,
      default: '',
      trim: true,
    },

    fatherMobile: {
      type: String,
      default: '',
      trim: true,
    },

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
      enum: ['Offline', 'Online'],
      default: 'Offline',
    },


    // ======================================
    // REGISTRATION FEE
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
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },


    // ======================================
    // COURSE FEE
    // ======================================
    
    totalFees: {
      type: Number,
      required: true,
      default: 0,
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
    
    paidFees: {
      type: Number,
      required: true,
      default: 0,
    },
    
    remainingFees: {
      type: Number,
      default: 0,
    },
    
    feesStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid'],
      default: 'Pending',
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
      enum: ['Offline', 'Online'],
      default: 'Offline',
    },


    // ======================================
    // PAYMENT HISTORY
    // ======================================

    paymentHistory: [paymentSchema],

  },

  {
    timestamps: true,
  }
)

module.exports =
  mongoose.model('Student', studentSchema)