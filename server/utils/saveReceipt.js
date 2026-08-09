const Receipt = require('../models/Receipt')
const generateReceiptNumber = require('./generateReceiptNumber')

const saveReceipt = async ({
  student,
  amountPaid,
  paymentType,
  paymentCategory,
  paymentPlan,
  transactionId,
  orderId,
}) => {

  const receiptNumber =
    await generateReceiptNumber()

  const receipt = await Receipt.create({

    // ======================================
    // RECEIPT
    // ======================================

    receiptNumber,

    // ======================================
    // STUDENT
    // ======================================

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

    // ======================================
    // FEE
    // ======================================

    courseFee:
      student.totalFees,

    registrationFee:
      student.registrationFee,

    // ======================================
    // PAYMENT CATEGORY
    // ======================================

    paymentCategory,

    // ======================================
    // PAYMENT PLAN
    // ======================================

    paymentPlan:
      paymentPlan || '',

    // ======================================
    // PAYMENT TYPE
    // ======================================

    paymentType,

    // ======================================
    // PAYMENT AMOUNT
    // ======================================

    amountPaid,

    totalPaid:
      student.paidFees,

    remainingFee:
      student.remainingFees,

    // ======================================
    // PAYMENT DETAILS
    // ======================================

    paymentMethod:
      'Razorpay',

    transactionId,

    orderId,

    paymentStatus:
      'Success',

  })

  return receipt
}

module.exports = saveReceipt