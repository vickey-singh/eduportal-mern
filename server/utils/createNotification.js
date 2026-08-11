const Notification =
  require('../models/Notification')


// ======================================
// CREATE NOTIFICATION
// ======================================

const createNotification = async ({

  type,

  title,

  message,

  link,

  relatedId,

}) => {

  try {

    const notification =
      await Notification.create({

        type,

        title,

        message,

        link:
          link || '',

        relatedId:
          relatedId || '',

        isRead:
          false,

      })


    return notification

  }

  catch (error) {

    console.log(
      'Create Notification Error:',
      error
    )

    // ==================================
    // IMPORTANT
    // ==================================
    //
    // Notification fail hone par
    // main admission/payment/message
    // process fail nahi hona chahiye.
    //
    // ==================================

    return null

  }

}


module.exports =
  createNotification