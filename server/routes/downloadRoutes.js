const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/downloadUpload')

const Download =
  require('../models/Download')


// ======================================
// ADD DOWNLOAD
// ======================================

router.post(

  '/downloads',

  upload.single('file'),

  async (req, res) => {

    try {

      const {

        title,

        category,

        description,

      } = req.body

      const file =
        req.file
          ? `/uploads/${req.file.filename}`
          : ''

      const newDownload =
        new Download({

          title,

          category,

          description,

          file,

        })

      const savedDownload =
        await newDownload.save()

      res.status(201).json({

        success: true,

        message:
          'File Uploaded Successfully',

        download:
          savedDownload,

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
// GET ALL DOWNLOADS
// ======================================

router.get(

  '/downloads',

  async (req, res) => {

    try {

      const downloads =
        await Download.find()

          .sort({

            createdAt: -1,

          })

      res.status(200).json(
        downloads
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
// DELETE DOWNLOAD
// ======================================

router.delete(

  '/downloads/:id',

  async (req, res) => {

    try {

      await Download.findByIdAndDelete(

        req.params.id

      )

      res.status(200).json({

        success: true,

        message:
          'File Deleted Successfully',

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
// UPDATE DOWNLOAD
// ======================================

router.put(

  '/downloads/:id',

  upload.single('file'),

  async (req, res) => {

    try {

      const {

        title,

        category,

        description,

      } = req.body

      const existingDownload =
        await Download.findById(

          req.params.id

        )

      const file =
        req.file
          ? `/uploads/${req.file.filename}`
          : existingDownload.file

      const updatedDownload =
        await Download.findByIdAndUpdate(

          req.params.id,

          {

            title,

            category,

            description,

            file,

          },

          {

            new: true,

          }

        )

      res.status(200).json({

        success: true,

        message:
          'File Updated Successfully',

        download:
          updatedDownload,

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