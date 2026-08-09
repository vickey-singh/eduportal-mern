const Receipt = require('../models/Receipt')

const generateReceiptNumber =
  require('./generateReceiptNumber')


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

      admissionNumber:
        student.admissionNumber,

      studentName:
        student.name,

      studentPhone:
        student.contact,

      studentEmail:
        student.email,

      course:
        student.course,


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


module.exports = saveReceipt