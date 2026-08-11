const express = require('express')

const router = express.Router()

const Message =
  require('../models/Message')

const createNotification =
  require('../utils/createNotification')


// ======================================
// ADD MESSAGE
// ======================================

router.post(

  '/messages',

  async (req, res) => {

    try {

      const {

        name,

        email,

        subject,

        message,

      } = req.body


      // ======================================
      // CREATE MESSAGE
      // ======================================

      const newMessage =
        new Message({

          name,

          email,

          subject,

          message,

        })


      // ======================================
      // SAVE
      // ======================================

      const savedMessage =
        await newMessage.save()


      // ======================================
      // CREATE NOTIFICATION
      // ======================================

      await createNotification({

        type:
          'Message',

        title:
          'New Contact Message',

        message:
          `${name} sent a new message${subject ? `: ${subject}` : ''}`,

        link:
          '/admin/messages',

        relatedId:
          savedMessage._id.toString(),

      })


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Message Sent Successfully',

        data:
          savedMessage,

      })

    }

    catch (error) {

      console.log(
        'Add Message Error:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// GET ALL MESSAGES
// ======================================

router.get(

  '/messages',

  async (req, res) => {

    try {

      const messages =
        await Message.find()


      res.status(200).json(
        messages
      )

    }

    catch (error) {

      console.log(
        'Get Messages Error:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// DELETE MESSAGE
// ======================================

router.delete(

  '/messages/:id',

  async (req, res) => {

    try {

      await Message.findByIdAndDelete(
        req.params.id
      )


      res.status(200).json({

        success: true,

        message:
          'Message Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Message Error:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// EXPORT ROUTER
// ======================================

module.exports =
  router