const Receipt = require('../models/Receipt')

const getReceiptByNumber = async (receiptNumber) => {

  return await Receipt.findOne({

    receiptNumber,

  })

}

module.exports = {

  getReceiptByNumber,

}