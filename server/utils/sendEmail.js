const axios = require('axios')

const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Prerna Institute',
          email: process.env.SENDER_EMAIL,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
        },
      }
    )

    console.log(`Email Sent Successfully to ${to}`)
  } catch (error) {
    console.error(
      'Brevo Email Error:',
      error.response?.data || error.message
    )
  }
}

module.exports = sendEmail