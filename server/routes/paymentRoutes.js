const razorpay =
  require('../config/razorpay')

const crypto =
  require('crypto')

const Receipt = require('../models/Receipt')

const generateReceiptNumber = require('../utils/generateReceiptNumber')

const saveReceipt = require('../utils/saveReceipt')

const sendAdmissionEmail = require('../utils/sendAdmissionEmail')

const sendAdminNotification = require('../utils/sendAdminNotification')

const Student = require('../models/Student')

const express = require('express')

const router = express.Router()

const Payment = require('../models/Payment')

const upload = require('../middleware/upload')

// ======================================
// GET ALL PAYMENTS
// ======================================

router.get(

  '/payments',

  async (req, res) => {

    try {

      const payments =
        await Payment.find()

      res.json(payments)

    } catch (error) {

      console.log(error)

      res.status(500).json({

        message: 'Server Error',

      })

    }

  }

)

// ======================================
// ADD PAYMENT
// ======================================

router.post(

  '/payments',

  async (req, res) => {

    try {

      const payment =
        new Payment(req.body)

      await payment.save()

      res.status(201).json({

        success: true,

        message:
          'Payment Saved Successfully',

        payment,

      })

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

      })

    }

  }

)

// ======================================
// CREATE RAZORPAY ORDER
// ======================================

router.post(

  '/payments/create-order',

  async (req, res) => {

    try {

      const { amount } = req.body

      const options = {

        amount: Number(amount) * 100,

        currency: 'INR',

        receipt: `receipt_${Date.now()}`,

      }

      const order = await razorpay.orders.create(
        options
      )

      res.status(200).json({

        success: true,

        order,

      })

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message:
          'Unable to create Razorpay order',

      })

    }

  }

)

// ======================================
// VERIFY PAYMENT
// ======================================

router.post(

  '/payments/verify',

  upload.single('image'),

  async (req, res) => {

    console.log("========== VERIFY PAYMENT ==========");
    console.log("BODY:", req.body);
    console.log("PHONE:", req.body.phone);
    console.log("EMAIL:", req.body.email);
    console.log("FILE:", req.file);

    try {

      const {

        razorpay_order_id,

        razorpay_payment_id,

        razorpay_signature,

      } = req.body

      const body =

        razorpay_order_id +

        "|" +

        razorpay_payment_id

      const expectedSignature = crypto

        .createHmac(

          'sha256',

          process.env.RAZORPAY_KEY_SECRET

        )

        .update(body)

        .digest('hex')

      if (

        expectedSignature !==

        razorpay_signature

      ) {

        return res.status(400).json({

          success: false,

          message: 'Payment Verification Failed',

        })

      }

     

      // ======================================
      // GENERATE ADMISSION NUMBER
      // ======================================
      
      const lastStudent = await Student
        .findOne()
        .sort({ createdAt: -1 })
      
      let admissionNumber
      
      if (!lastStudent) {
      
        admissionNumber = 'ADM0001'
      
      } else {
      
        const lastNumber = parseInt(
          lastStudent.admissionNumber.replace('ADM', '')
        )
      
        admissionNumber =
          `ADM${String(lastNumber + 1).padStart(4, '0')}`
      
      }
      
      console.log(admissionNumber)

      // ======================================
      // CHECK EXISTING STUDENT
      // ======================================
      
      const existingStudent = await Student.findOne({
      
        email: req.body.email,
      
      })

      // ======================================
      // CREATE STUDENT
      // ======================================
      
      let student = null

      let receipt = null

      let payment = null
      
      if (!existingStudent) {
      
      const today = new Date()
      
      const dueDate = new Date()
      
      dueDate.setMonth(
        dueDate.getMonth() + 1
      )

      const image = req.file
        ? `/uploads/${req.file.filename}`
        : ''
            
        student = new Student({
      
        name: req.body.studentName,
      
        admissionNumber,
      
        course: req.body.course,
      
        contact: req.body.phone,
      
        email: req.body.email,

        image,
      
        admissionDate:
          today.toISOString().split('T')[0],
      
        admissionType: 'Online',
      
        totalFees: req.body.totalFee,

        installmentAllowed: true,
        
        minimumInstallment:
          req.body.minimumInstallment,
      
        paidFees: Number(req.body.amountPaid),

          remainingFees:
            Number(req.body.totalFee) -
            Number(req.body.amountPaid),
          
          feesStatus:
          
            Number(req.body.totalFee) -
              Number(req.body.amountPaid) ===
            0
          
              ? 'Paid'
          
              : 'Partial',
      
        dueDate:
          dueDate.toISOString().split('T')[0],
      
        paymentMode: 'Online',
      
        paymentHistory: [
      
          {
      
            amount: req.body.amountPaid,
      
            paymentMethod: 'Razorpay',
      
            paymentType: req.body.paymentType,
      
            paymentMode: 'Online',
      
            paymentStatus: 'Success',
      
            transactionId: razorpay_payment_id,
      
            orderId: razorpay_order_id,
      
            paymentDate:
              today.toISOString().split('T')[0],
      
          },
      
        ],
      
      })
      
      await student.save()


      // ======================================
      // GENERATE RECEIPT NUMBER
      // ======================================
      
          receipt = await saveReceipt({
      
        student,
      
        amountPaid: Number(req.body.amountPaid),
      
        paymentType: req.body.paymentType,
      
        transactionId: razorpay_payment_id,
      
        orderId: razorpay_order_id,
      
      })

      }

      else {
      
        // ======================================
        // UPDATE FEES
        // ======================================
      
        existingStudent.paidFees += req.body.amountPaid
      
        existingStudent.remainingFees -= req.body.amountPaid
      
        if (existingStudent.remainingFees <= 0) {
      
          existingStudent.remainingFees = 0
      
          existingStudent.feesStatus = 'Paid'
      
        } else {
      
          existingStudent.feesStatus = 'Partial'
      
        }
      
        // ======================================
        // ADD PAYMENT HISTORY
        // ======================================
      
        const today = new Date()
      
        existingStudent.paymentHistory.push({
      
          amount: req.body.amountPaid,
      
          paymentMethod: 'Razorpay',
      
          paymentType: req.body.paymentType,
      
          paymentMode: 'Online',
      
          paymentStatus: 'Success',
      
          transactionId: razorpay_payment_id,
      
          orderId: razorpay_order_id,
      
          paymentDate:
            today.toISOString().split('T')[0],
      
        })
      
        await existingStudent.save()

        student = existingStudent

          receipt = await saveReceipt({
            student,
            amountPaid: Number(req.body.amountPaid),
            paymentType: req.body.paymentType,
            transactionId: razorpay_payment_id,
            orderId: razorpay_order_id,
          })
      
      }

      // ======================================
      // SAVE PAYMENT
      // ======================================
      
      payment = new Payment({
      
        studentName: student.name,
      
        admissionNumber: student.admissionNumber,
      
        email: student.email,
      
        phone: student.contact,
      
        course: student.course,
      
        totalFee: student.totalFees,
      
        registrationFee:
          req.body.registrationFee || 0,
      
        minimumInstallment:
          student.minimumInstallment || 0,
      
        paymentType:
      
          student.remainingFees === 0
      
            ? 'Full'
      
            : 'Installment',
      
        amountPaid: Number(req.body.amountPaid),
      
        paymentMethod: 'Online',
      
        paymentStatus: 'Success',
      
        transactionId: razorpay_payment_id,
      
        razorpayOrderId: razorpay_order_id,
      
        razorpayPaymentId: razorpay_payment_id,
      
        razorpaySignature: razorpay_signature,
      
      })
      
      await payment.save()

      await sendAdmissionEmail({
        
          student,
        
          receipt,
        
          amountPaid: Number(req.body.amountPaid),

          transactionId: razorpay_payment_id,

        
        })

        await sendAdminNotification({

          student,
        
          receipt,
        
          amountPaid: Number(req.body.amountPaid),

          transactionId: razorpay_payment_id,
        
        })
      
      res.status(200).json({
      
        success: true,
      
        message:
      
          'Payment Verified Successfully',
      
        payment,

        student,

        receiptNumber: receipt.receiptNumber,

      
      })

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

      })

    }

  }

)

// ======================================
// VERIFY EXISTING STUDENT
// ======================================

router.post(

  '/students/verify',

  async (req, res) => {

    try {

      const {

        admissionNumber,

        name,

        phone,

      } = req.body

      const student = await Student.findOne({

        admissionNumber,

        name,

        contact: phone,

      })

      if (!student) {

        return res.status(404).json({

          success: false,

          message: 'Student Not Found',

        })

      }

      res.status(200).json({

        success: true,

        student,

      })

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

      })

    }

  }

)

// ======================================
// CHECK EXISTING STUDENT
// ======================================

router.post(

  '/students/check',

  async (req, res) => {

    try {

      const { email, phone } = req.body

      const student = await Student.findOne({

        $or: [

          { email },

          { contact: phone },

        ],

      })

      res.status(200).json({

        success: true,

        exists: !!student,

      })

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

      })

    }

  }

)

// ======================================
// EXISTING STUDENT PAYMENT
// ======================================

router.post(

  '/students/pay',

  async (req, res) => {

    try {

      const {

        admissionNumber,

        amountPaid,

      } = req.body

      // ======================================
      // FIND STUDENT
      // ======================================

      const student = await Student.findOne({

        admissionNumber,

      })

      if (!student) {

        return res.status(404).json({

          success: false,

          message: 'Student Not Found',

        })

      }

      // ======================================
      // VALIDATION
      // ======================================

      if (amountPaid > student.remainingFees) {

        return res.status(400).json({

          success: false,

          message:
            'Entered amount cannot be greater than the remaining fee.',

        })

      }

      if (

        student.remainingFees > student.minimumInstallment &&

        amountPaid < student.minimumInstallment

      ) {

        return res.status(400).json({

          success: false,

          message:
            `Minimum installment amount is ₹${student.minimumInstallment}.`,

        })

      }

      // ======================================
      // UPDATE FEES
      // ======================================
      
      student.paidFees += Number(amountPaid)
      
      student.remainingFees -= Number(amountPaid)
      
      if (student.remainingFees <= 0) {
      
        student.remainingFees = 0
      
        student.feesStatus = 'Paid'
      
      } else {
      
        student.feesStatus = 'Partial'
      
      }

      // ======================================
      // ADD PAYMENT HISTORY
      // ======================================
      
      const today = new Date()
      
      student.paymentHistory.push({
      
        amount: Number(amountPaid),
      
        paymentMethod: 'Razorpay',
      
        paymentType:
      
          student.remainingFees === 0
      
            ? 'Full'
      
            : 'Installment',
      
        paymentMode: 'Online',
      
        paymentStatus: 'Success',
      
        transactionId: req.body.transactionId || '',
      
        orderId: req.body.orderId || '',
      
        paymentDate:
      
          today.toISOString().split('T')[0],
      
      })

      await student.save()

      const receipt = await saveReceipt({
      
        student,
      
        amountPaid: Number(amountPaid),
      
        paymentType:
          student.remainingFees === 0
            ? 'Full'
            : 'Installment',
      
        transactionId:
          req.body.transactionId,
      
        orderId:
          req.body.orderId,
      
      })

      // ======================================
      // SUCCESS
      // ======================================

      res.status(200).json({

        success: true,

        message: 'Payment Successful',

        student,

        receiptNumber: receipt.receiptNumber,

      })

    } catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message: 'Server Error',

      })

    }

  }

)

module.exports = router