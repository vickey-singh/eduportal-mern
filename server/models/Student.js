const mongoose = require('mongoose')


// ======================================
// PAYMENT SCHEMA
// ======================================

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        'Cash',
        'UPI',
        'Razorpay',
        'Card',
        'Bank Transfer',
        'Other',
        'Online',
        'Offline',
      ],
      default: 'Cash',
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    paymentType: {
      type: String,
      default: 'Installment',
    },

    paymentCategory: {
      type: String,
      default: 'CourseFee',
    },

    paymentPlan: {
      type: String,
      enum: [
        'full',
        'monthly',
        'installment',
        '',
      ],
      default: '',
    },

    paymentMode: {
      type: String,
      enum: [
        'Online',
        'Offline',
      ],
      default: 'Offline',
    },

    paymentStatus: {
      type: String,
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

    installmentNumber: {
      type: Number,
      default: null,
    },

    receiptNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)


// ======================================
// INSTALLMENT SCHEMA
// ======================================

const installmentSchema = new mongoose.Schema(
  {
    installmentNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Due',
        'Paid',
      ],
      default: 'Pending',
    },

    paidDate: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  }
)


// ======================================
// STUDENT SCHEMA
// ======================================

const studentSchema = new mongoose.Schema(
  {
    // PERSONAL INFORMATION

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dob: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      default: '',
      trim: true,
    },

    category: {
      type: String,
      default: '',
      trim: true,
    },

    aadharNumber: {
      type: String,
      default: '',
      trim: true,
    },


    // PARENT INFORMATION

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


    // CONTACT INFORMATION

    contact: {
      type: String,
      required: false,
      default: '',
      trim: true,
    },

    alternateContact: {
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


    // ADDRESS INFORMATION

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

    address: {
      type: String,
      default: '',
      trim: true,
    },

    city: {
      type: String,
      default: '',
      trim: true,
    },

    state: {
      type: String,
      default: '',
      trim: true,
    },

    pinCode: {
      type: String,
      default: '',
      trim: true,
    },


    // EDUCATION INFORMATION

    schoolCollegeName: {
      type: String,
      default: '',
      trim: true,
    },


    // ADMISSION INFORMATION

    admissionNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    rollNumber: {
      type: String,
      default: '',
      trim: true,
    },


    // ZKTECO BIOMETRIC USER ID

    biometricUserId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },


    admissionDate: {
      type: Date,
      default: Date.now,
    },

    admissionType: {
      type: String,
      default: '',
      trim: true,
    },


    // COURSE
    // IMPORTANT: AS IT WAS BEFORE

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

    session: {
      type: String,
      default: '',
      trim: true,
    },


    // STUDENT IMAGE

    image: {
      type: String,
      default: '',
    },


    // LOGIN PASSWORD

    password: {
      type: String,
      default: '',
    },


    // REGISTRATION FEE

    registrationFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    registrationFeePaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    registrationFeeStatus: {
      type: String,
      enum: [
        'Paid',
        'Pending',
      ],
      default: 'Pending',
    },


    // COURSE FEE

    totalFees: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidFees: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingFees: {
      type: Number,
      default: 0,
      min: 0,
    },

    feesStatus: {
      type: String,
      enum: [
        'Paid',
        'Partial',
        'Due',
      ],
      default: 'Partial',
    },


    // PAYMENT PLAN

    paymentPlan: {
      type: String,
      enum: [
        'full',
        'monthly',
        'installment',
        '',
      ],
      default: '',
    },

    monthlyAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMode: {
      type: String,
      enum: [
        'Online',
        'Offline',
      ],
      default: 'Offline',
    },


    // INSTALLMENTS

    installmentCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    installmentSchedule: {
      type: [
        installmentSchema,
      ],
      default: [],
    },


    // DUE DATE

    dueDate: {
      type: Date,
      default: null,
    },


    // PAYMENT HISTORY

    paymentHistory: {
      type: [
        paymentSchema,
      ],
      default: [],
    },


    // SCHOLARSHIP

    scholarship: {
      type: Number,
      default: 0,
      min: 0,
    },


    // DISCOUNT

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },


    // COUPON

    couponCode: {
      type: String,
      default: '',
      trim: true,
    },


    // APPLICATION REFERENCE

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },


    // STUDENT STATUS

    studentStatus: {
      type: String,
      enum: [
        'Active',
        'Inactive',
        'Completed',
      ],
      default: 'Active',
    },


    // OLD STATUS SUPPORT

    status: {
      type: String,
      enum: [
        'Active',
        'Inactive',
        'Completed',
      ],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
)


// ======================================
// PRE VALIDATE
// ======================================

studentSchema.pre(
  'validate',
  function () {

    // TOTAL / PAID / REMAINING

    const total =
      Number(this.totalFees || 0)

    const paid =
      Number(this.paidFees || 0)

    this.remainingFees =
      Math.max(
        total - paid,
        0
      )


    // REGISTRATION FEE STATUS

    const registration =
      Number(
        this.registrationFee || 0
      )

    const registrationPaid =
      Number(
        this.registrationFeePaid || 0
      )

    if (
      registration > 0 &&
      registrationPaid >= registration
    ) {
      this.registrationFeeStatus =
        'Paid'
    } else {
      this.registrationFeeStatus =
        'Pending'
    }


    // INSTALLMENT COUNT

    if (
      Array.isArray(
        this.installmentSchedule
      )
    ) {
      this.installmentCount =
        this.installmentSchedule.length
    }


    // COURSE FEE FULLY PAID

    if (
      this.remainingFees <= 0
    ) {
      this.feesStatus =
        'Paid'
    }
  }
)


// ======================================
// EXPORT MODEL
// ======================================

module.exports =
  mongoose.model(
    'Student',
    studentSchema
  )