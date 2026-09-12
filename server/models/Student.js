const mongoose =
  require('mongoose')


// ======================================
// PAYMENT SCHEMA
// ======================================

const paymentSchema =
  new mongoose.Schema(

    {

      // ==================================
      // PAYMENT AMOUNT
      // ==================================

      amount: {

        type: Number,

        required: true,

        min: 0,

      },


      // ==================================
      // PAYMENT METHOD
      // ==================================

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


      // ==================================
      // PAYMENT DATE
      // ==================================

      paymentDate: {

        type: Date,

        default: Date.now,

      },


      // ==================================
      // PAYMENT TYPE
      // ==================================

      paymentType: {

        type: String,

        default: 'Installment',

      },


      // ==================================
      // PAYMENT CATEGORY
      // ==================================

      paymentCategory: {

        type: String,

        default: 'CourseFee',

      },


      // ==================================
      // PAYMENT PLAN
      // ==================================

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


      // ==================================
      // PAYMENT MODE
      // ==================================

      paymentMode: {

        type: String,

        enum: [

          'Online',

          'Offline',

        ],

        default: 'Offline',

      },


      // ==================================
      // PAYMENT STATUS
      // ==================================

      paymentStatus: {

        type: String,

        default: 'Success',

      },


      // ==================================
      // TRANSACTION ID
      // ==================================

      transactionId: {

        type: String,

        default: '',

      },


      // ==================================
      // ORDER ID
      // ==================================

      orderId: {

        type: String,

        default: '',

      },


      // ==================================
      // INSTALLMENT NUMBER
      // ==================================

      installmentNumber: {

        type: Number,

        default: null,

      },


      // ==================================
      // RECEIPT NUMBER
      // ==================================

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

const installmentSchema =
  new mongoose.Schema(

    {

      // ==================================
      // INSTALLMENT NUMBER
      // ==================================

      installmentNumber: {

        type: Number,

        required: true,

        min: 1,

      },


      // ==================================
      // INSTALLMENT AMOUNT
      // ==================================

      amount: {

        type: Number,

        required: true,

        min: 0,

      },


      // ==================================
      // DUE DATE
      // ==================================

      dueDate: {

        type: Date,

        default: null,

      },


      // ==================================
      // PAID AMOUNT
      // ==================================

      paidAmount: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ==================================
      // STATUS
      // ==================================

      status: {

        type: String,

        enum: [

          'Pending',

          'Due',

          'Paid',

        ],

        default: 'Pending',

      },


      // ==================================
      // PAID DATE
      // ==================================

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

const studentSchema =
  new mongoose.Schema(

    {

      // ======================================
      // PERSONAL INFORMATION
      // ======================================

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


      // ======================================
      // PARENT INFORMATION
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
      // CONTACT INFORMATION
      // ======================================

      contact: {

        type: String,

        required: true,

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


      // ======================================
      // ADDRESS INFORMATION
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


      // ======================================
      // EDUCATION INFORMATION
      // ======================================

      schoolCollegeName: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // ADMISSION INFORMATION
      // ======================================

      admissionNumber: {

        type: String,

        unique: true,

        sparse: true,

        trim: true,

      },


      // ======================================
      // ROLL NUMBER
      // ======================================
      // Teacher / Admin manually enter karega.
      //
      // Examples:
      // 1
      // 15
      // 0015
      // A-15
      // CGL-025
      //
      // String rakha gaya hai taaki
      // leading zero preserve rahe.
      // ======================================

      rollNumber: {

        type: String,

        default: '',

        trim: true,

      },

      // ======================================
      // ZKTECO BIOMETRIC USER ID
      // ======================================
      
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


      // ======================================
      // STUDENT IMAGE
      // ======================================

      image: {

        type: String,

        default: '',

      },


      // ======================================
      // LOGIN PASSWORD
      // ======================================

      password: {

        type: String,

        default: '',

      },


      // ======================================
      // REGISTRATION FEE
      // ======================================

      registrationFee: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // REGISTRATION FEE PAID
      // ======================================

      registrationFeePaid: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // REGISTRATION FEE STATUS
      // ======================================

      registrationFeeStatus: {

        type: String,

        enum: [

          'Paid',

          'Pending',

        ],

        default: 'Pending',

      },


      // ======================================
      // TOTAL COURSE FEE
      // ======================================

      totalFees: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // PAID COURSE FEE
      // ======================================

      paidFees: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // REMAINING COURSE FEE
      // ======================================

      remainingFees: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // COURSE FEE STATUS
      // ======================================

      feesStatus: {

        type: String,

        enum: [

          'Paid',

          'Partial',

          'Due',

        ],

        default: 'Partial',

      },


      // ======================================
      // PAYMENT PLAN
      // ======================================

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


      // ======================================
      // MONTHLY AMOUNT
      // ======================================

      monthlyAmount: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // PAYMENT MODE
      // ======================================

      paymentMode: {

        type: String,

        enum: [

          'Online',

          'Offline',

        ],

        default: 'Offline',

      },


      // ======================================
      // INSTALLMENT COUNT
      // ======================================

      installmentCount: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // INSTALLMENT SCHEDULE
      // ======================================

      installmentSchedule: {

        type: [

          installmentSchema,

        ],

        default: [],

      },


      // ======================================
      // CURRENT / LATEST DUE DATE
      // ======================================

      dueDate: {

        type: Date,

        default: null,

      },


      // ======================================
      // PAYMENT HISTORY
      // ======================================

      paymentHistory: {

        type: [

          paymentSchema,

        ],

        default: [],

      },


      // ======================================
      // SCHOLARSHIP
      // ======================================

      scholarship: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // DISCOUNT
      // ======================================

      discount: {

        type: Number,

        default: 0,

        min: 0,

      },


      // ======================================
      // COUPON CODE
      // ======================================

      couponCode: {

        type: String,

        default: '',

        trim: true,

      },


      // ======================================
      // APPLICATION REFERENCE
      // ======================================

      applicationId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: 'Application',

        default: null,

      },


      // ======================================
      // STUDENT STATUS
      // ======================================

      studentStatus: {

        type: String,

        enum: [

          'Active',

          'Inactive',

          'Completed',

        ],

        default: 'Active',

      },


      // ======================================
      // OLD STATUS SUPPORT
      // ======================================

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
//
// IMPORTANT:
//
// No next() here.
//
// This prevents:
// TypeError: next is not a function
//
// ======================================

studentSchema.pre(

  'validate',

  function () {

    // ==================================
    // TOTAL COURSE FEE
    // ==================================

    const total =
      Number(
        this.totalFees || 0
      )


    // ==================================
    // PAID COURSE FEE
    // ==================================

    const paid =
      Number(
        this.paidFees || 0
      )


    // ==================================
    // REMAINING COURSE FEE
    // ==================================

    this.remainingFees =
      Math.max(

        total -
        paid,

        0

      )


    // ==================================
    // REGISTRATION FEE STATUS
    // ==================================

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

    }

    else {

      this.registrationFeeStatus =
        'Pending'

    }


    // ==================================
    // INSTALLMENT COUNT
    // ==================================

    if (
      Array.isArray(
        this.installmentSchedule
      )
    ) {

      this.installmentCount =
        this.installmentSchedule.length

    }


    // ==================================
    // FULL COURSE FEE PAID
    // ==================================

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