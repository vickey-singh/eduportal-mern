const axios = require('axios')


// ======================================
// SEND EMAIL USING BREVO
// ======================================

const sendEmail = async ({
  to,
  subject,
  html,
}) => {

  try {

    const response =
      await axios.post(

        'https://api.brevo.com/v3/smtp/email',

        {

          sender: {

            name:
              'Prerna Institute Of Excellence',

            email:
              process.env.SENDER_EMAIL,

          },

          to: [

            {

              email:
                to,

            },

          ],

          subject,

          htmlContent:
            html,

        },

        {

          headers: {

            accept:
              'application/json',

            'api-key':
              process.env.BREVO_API_KEY,

            'content-type':
              'application/json',

          },

        }

      )


    // ==================================
    // SUCCESS LOG
    // ==================================

    console.log(
      '===================================='
    )

    console.log(
      'Email Sent Successfully'
    )

    console.log(
      'From:',
      process.env.SENDER_EMAIL
    )

    console.log(
      'To:',
      to
    )

    console.log(
      'Brevo Message ID:',
      response.data?.messageId
    )

    console.log(
      '===================================='
    )


    return response.data

  }

  catch (error) {

    console.error(
      '===================================='
    )

    console.error(
      'Brevo Email Error:'
    )

    console.error(
      error.response?.data ||
      error.message
    )

    console.error(
      '===================================='
    )


    throw error

  }

}


module.exports =
  sendEmail