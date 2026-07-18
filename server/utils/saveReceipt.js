const Receipt = require('../models/Receipt')
const generateReceiptNumber = require('./generateReceiptNumber')

const saveReceipt = async ({
  student,
  amountPaid,
  paymentType,
  transactionId,
  orderId,
}) => {

  const receiptNumber = await generateReceiptNumber()

  const receipt = await Receipt.create({

    receiptNumber,

    admissionNumber: student.admissionNumber,

    studentName: student.name,

    studentPhone: student.contact,

    studentEmail: student.email,

    course: student.course,

    courseFee: student.totalFees,

    paymentType,

    minimumInstallment:
      student.installmentAllowed
        ? student.minimumInstallment
        : 0,

    amountPaid,

    totalPaid: student.paidFees,

    remainingFee: student.remainingFees,

    paymentMethod: 'Razorpay',

    transactionId,

    orderId,

    paymentStatus: 'Success',

  })

  return receipt

}

module.exports = saveReceipt