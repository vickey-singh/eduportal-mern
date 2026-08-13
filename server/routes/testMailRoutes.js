const express = require('express')

const router = express.Router()

const sendEmail =
  require('../utils/sendEmail')


// ======================================
// TEST BREVO EMAIL
// ======================================

router.get(
  '/test-email',
  async (req, res) => {

    try {

      // ==================================
      // SEND TEST EMAIL TO ADMIN
      // ==================================

      await sendEmail({

        to:
          process.env.ADMIN_EMAIL,

        subject:
          'EduPortal Test Email',

        html: `

          <div
            style="
              font-family: Arial, sans-serif;
              padding: 20px;
            "
          >

            <h2>
              ✅ EduPortal Email Working Successfully
            </h2>

            <p>
              This is a test email sent from
              EduPortal using Brevo.
            </p>

            <p>
              If you received this email,
              Brevo and the authenticated
              sending domain are configured
              correctly.
            </p>

            <hr>

            <p>

              <strong>
                From:
              </strong>

              ${process.env.SENDER_EMAIL}

            </p>

            <p>

              <strong>
                To:
              </strong>

              ${process.env.ADMIN_EMAIL}

            </p>

          </div>

        `,

      })


      // ==================================
      // SUCCESS RESPONSE
      // ==================================

      res.status(200).json({

        success: true,

        message:
          'Test Email Sent Successfully',

        sentTo:
          process.env.ADMIN_EMAIL,

        sentFrom:
          process.env.SENDER_EMAIL,

      })

    }

    catch (error) {

      // ==================================
      // ERROR
      // ==================================

      console.log(
        'Test Email Error:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          error.message,

        error:
          error.response?.data ||
          null,

      })

    }

  }

)


// ======================================
// EXPORT ROUTER
// ======================================

module.exports =
  router