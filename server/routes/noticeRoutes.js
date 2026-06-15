const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Notice =
  require('../models/Notice')


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

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : ''

      const newNotice =
        new Notice({

          title,

          description,

          image,

          isImportant,

          isPinned,

        })

      const savedNotice =
        await newNotice.save()

      res.status(201).json({

        success: true,

        message:
          'Notice Added Successfully',

        notice:
          savedNotice,

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
// DELETE NOTICE
// ======================================

router.delete(

  '/notices/:id',

  async (req, res) => {

    try {

      await Notice.findByIdAndDelete(
        req.params.id
      )

      res.status(200).json({

        success: true,

        message:
          'Notice Deleted Successfully',

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

      const existingNotice =
        await Notice.findById(
          req.params.id
        )

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : existingNotice.image

      const updatedNotice =
        await Notice.findByIdAndUpdate(

          req.params.id,

          {

            title,

            description,

            image,

            isImportant,

            isPinned,

          },

          {
            new: true,
          }

        )

      res.status(200).json({

        success: true,

        message:
          'Notice Updated Successfully',

        notice:
          updatedNotice,

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