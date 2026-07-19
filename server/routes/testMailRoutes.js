const express = require('express')
const router = express.Router()

const sendEmail = require('../utils/sendEmail')

router.get('/test-email', async (req, res) => {

  try {

    await sendEmail({
      
      to: process.env.SENDER_EMAIL,

      subject: 'EduPortal Test Email',

      html: `
        <h2>✅ Email Working Successfully</h2>

        <p>This is a test email sent from EduPortal.</p>

        <p>If you received this email, Nodemailer is configured correctly.</p>
      `,

    })

    res.json({

      success: true,

      message: 'Test Email Sent Successfully',

    })

  }

  catch (error) {

    console.log(error)

    res.status(500).json({

      success: false,

      message: error.message,

    })

  }

})

module.exports = router