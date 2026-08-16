const Receipt = require('../models/Receipt')

const generateReceiptNumber =
  require('./generateReceiptNumber')


// ======================================
// HELPER
// GENERATE STUDENT PASSWORD FROM DOB
// ======================================
//
// DOB format:
// DDMMYYYY
//
// Example:
// 15/08/2005
//      ↓
// 15082005
//
// Supports:
// 15/08/2005
// 15-08-2005
// 2005-08-15
//
// ======================================

const generateStudentPassword =
  (dob) => {

    if (!dob) {

      return ''

    }


    const value =
      String(dob).trim()


    // ==================================
    // DD/MM/YYYY
    // DD-MM-YYYY
    // ==================================

    let match =
      value.match(
        /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/
      )


    if (match) {

      const day =
        match[1]

      const month =
        match[2]

      const year =
        match[3]


      return (
        `${day}${month}${year}`
      )

    }


    // ==================================
    // YYYY-MM-DD
    // ==================================

    match =
      value.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      )


    if (match) {

      const year =
        match[1]

      const month =
        match[2]

      const day =
        match[3]


      return (
        `${day}${month}${year}`
      )

    }


    // ==================================
    // INVALID / UNKNOWN FORMAT
    // ==================================

    return ''

  }


// ======================================
// SAVE RECEIPT
// ======================================

const saveReceipt = async ({

  student,

  amountPaid,

  paymentType,

  paymentCategory,

  paymentPlan,

  paymentMethod,

  transactionId,

  orderId,

}) => {


  // ======================================
  // GENERATE RECEIPT NUMBER
  // ======================================

  const receiptNumber =
    await generateReceiptNumber()


  // ======================================
  // GENERATE STUDENT PASSWORD
  // ======================================

  const studentPassword =
    generateStudentPassword(
      student.dob
    )


  // ======================================
  // GET MINIMUM INSTALLMENT
  // ======================================

  let minimumInstallment = 0


  if (
    paymentPlan === 'monthly'
  ) {

    minimumInstallment =
      Number(
        student.monthlyInstallment || 0
      )

  }

  else if (
    paymentPlan === 'three_month'
  ) {

    minimumInstallment =
      Number(
        student.threeMonthInstallment || 0
      )

  }

  else if (
    paymentPlan === 'six_month'
  ) {

    minimumInstallment =
      Number(
        student.sixMonthInstallment || 0
      )

  }

  else if (
    paymentPlan === 'full'
  ) {

    minimumInstallment =
      Number(
        student.fullPaymentFee ||
        student.remainingFees ||
        0
      )

  }


  // ======================================
  // CREATE RECEIPT
  // ======================================

  const receipt =
    await Receipt.create({

      // ==================================
      // RECEIPT
      // ==================================

      receiptNumber,


      // ==================================
      // STUDENT
      // ==================================

      studentId:
        student._id,

      admissionNumber:
        student.admissionNumber,

      studentPassword:
        studentPassword,

      studentName:
        student.name,

      studentPhone:
        student.contact,

      studentEmail:
        student.email,

      course:
        student.course,

      batchTime:
        student.batchTime || '',


      // ==================================
      // FEE DETAILS
      // ==================================

      courseFee:
        Number(
          student.totalFees || 0
        ),

      registrationFee:
        Number(
          student.registrationFee || 0
        ),

      registrationFeePaid:
        Number(
          student.registrationFeePaid || 0
        ),


      // ==================================
      // PAYMENT CATEGORY
      // ==================================

      paymentCategory,


      // ==================================
      // PAYMENT PLAN
      // ==================================

      paymentPlan:
        paymentPlan || '',


      // ==================================
      // MINIMUM INSTALLMENT
      // ==================================

      minimumInstallment,


      // ==================================
      // PAYMENT TYPE
      // ==================================

      paymentType,


      // ==================================
      // PAYMENT AMOUNT
      // ==================================

      amountPaid:
        Number(
          amountPaid || 0
        ),

      totalPaid:
        Number(
          student.paidFees || 0
        ),

      remainingFee:
        Number(
          student.remainingFees || 0
        ),


      // ==================================
      // PAYMENT DETAILS
      // ==================================

      paymentMethod:
        paymentMethod || 'Razorpay',

      transactionId:
        transactionId || '',

      orderId:
        orderId || '',

      paymentStatus:
        'Success',

    })


  return receipt

}


module.exports =
  saveReceipt