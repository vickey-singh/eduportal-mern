const express = require('express')

const router = express.Router()

const upload = require('../middleware/upload')

const Notice = require('../models/Notice')


// ======================================
// ADD NOTICE
// ======================================

router.post(
  '/notices',
  upload.single('image'),

  async (req, res) => {

    try {

      const {
        title,
        description,
        isImportant,
        isPinned,
      } = req.body


      // ======================================
      // DEBUG FILE
      // ======================================

      console.log('====================================')
      console.log('NOTICE FILE:')
      console.log(req.file)
      console.log('====================================')


      // ======================================
      // IMAGE URL
      // ======================================

      const image = req.file
        ? (
            req.file.path ||
            req.file.secure_url ||
            req.file.url ||
            ''
          )
        : ''


      console.log(
        'NOTICE IMAGE URL:',
        image
      )


      // ======================================
      // CREATE NOTICE
      // ======================================

      const newNotice = new Notice({

        title,

        description,

        image,

        isImportant:
          isImportant === 'true' ||
          isImportant === true,

        isPinned:
          isPinned === 'true' ||
          isPinned === true,

      })


      // ======================================
      // SAVE
      // ======================================

      const savedNotice =
        await newNotice.save()


      console.log(
        'NOTICE SAVED:',
        savedNotice
      )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Notice Added Successfully',

        notice:
          savedNotice,

      })

    }

    catch (error) {

      console.log(
        'ADD NOTICE ERROR:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          'Server Error',

        error:
          error.message,

      })

    }

  }
)


// ======================================
// GET ALL NOTICES
// ======================================

router.get(
  '/notices',

  async (req, res) => {

    try {

      const notices =
        await Notice.find()
          .sort({

            isPinned: -1,

            createdAt: -1,

          })


      res.status(200).json(
        notices
      )

    }

    catch (error) {

      console.log(
        'GET NOTICES ERROR:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          'Server Error',

        error:
          error.message,

      })

    }

  }
)


// ======================================
// GET SINGLE NOTICE
// ======================================

router.get(
  '/notices/:id',

  async (req, res) => {

    try {

      const notice =
        await Notice.findById(
          req.params.id
        )


      if (!notice) {

        return res.status(404).json({

          success: false,

          message:
            'Notice Not Found',

        })

      }


      res.status(200).json(
        notice
      )

    }

    catch (error) {

      console.log(
        'GET SINGLE NOTICE ERROR:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          'Server Error',

        error:
          error.message,

      })

    }

  }
)


// ======================================
// UPDATE NOTICE
// ======================================

router.put(
  '/notices/:id',

  upload.single('image'),

  async (req, res) => {

    try {

      const {
        title,
        description,
        isImportant,
        isPinned,
      } = req.body


      // ======================================
      // FIND EXISTING NOTICE
      // ======================================

      const existingNotice =
        await Notice.findById(
          req.params.id
        )


      if (!existingNotice) {

        return res.status(404).json({

          success: false,

          message:
            'Notice Not Found',

        })

      }


      // ======================================
      // DEBUG FILE
      // ======================================

      console.log('====================================')
      console.log('UPDATE NOTICE FILE:')
      console.log(req.file)
      console.log('====================================')


      // ======================================
      // IMAGE
      // ======================================

      const image = req.file

        ? (
            req.file.path ||
            req.file.secure_url ||
            req.file.url ||
            existingNotice.image ||
            ''
          )

        : existingNotice.image


      console.log(
        'UPDATE NOTICE IMAGE URL:',
        image
      )


      // ======================================
      // UPDATE
      // ======================================

      const updatedNotice =
        await Notice.findByIdAndUpdate(

          req.params.id,

          {

            title,

            description,

            image,

            isImportant:
              isImportant === 'true' ||
              isImportant === true,

            isPinned:
              isPinned === 'true' ||
              isPinned === true,

          },

          {
            new: true,

            runValidators: true,
          }

        )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Notice Updated Successfully',

        notice:
          updatedNotice,

      })

    }

    catch (error) {

      console.log(
        'UPDATE NOTICE ERROR:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          'Server Error',

        error:
          error.message,

      })

    }

  }
)


// ======================================
// DELETE NOTICE
// ======================================

router.delete(
  '/notices/:id',

  async (req, res) => {

    try {

      const deletedNotice =
        await Notice.findByIdAndDelete(
          req.params.id
        )


      if (!deletedNotice) {

        return res.status(404).json({

          success: false,

          message:
            'Notice Not Found',

        })

      }


      res.status(200).json({

        success: true,

        message:
          'Notice Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'DELETE NOTICE ERROR:',
        error
      )


      res.status(500).json({

        success: false,

        message:
          'Server Error',

        error:
          error.message,

      })

    }

  }
)


module.exports = router