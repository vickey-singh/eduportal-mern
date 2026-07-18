const Receipt = require('../models/Receipt')

const generateReceiptNumber = async () => {

  const lastReceipt = await Receipt.findOne().sort({
    createdAt: -1,
  })

  if (!lastReceipt) {
    return 'RCPT000001'
  }

  const lastNumber = parseInt(
    lastReceipt.receiptNumber.replace('RCPT', '')
  )

  return `RCPT${String(lastNumber + 1).padStart(6, '0')}`
}

module.exports = generateReceiptNumber