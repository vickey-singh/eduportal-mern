const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Gallery =
  require('../models/Gallery')


// ======================================
// ADD GALLERY IMAGE
// ======================================

router.post(

  '/gallery',

  upload.single('image'),

  async (req, res) => {

    try {

      const { title } = req.body

      // ======================================
      // IMAGE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : ''


      // ======================================
      // CREATE GALLERY
      // ======================================

      const newGallery =
        new Gallery({

          title,

          image,

        })


      // ======================================
      // SAVE
      // ======================================

      const savedGallery =
        await newGallery.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Gallery Image Added Successfully',

        gallery:
          savedGallery,

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
// GET ALL GALLERY IMAGES
// ======================================

router.get(

  '/gallery',

  async (req, res) => {

    try {

      const gallery =
        await Gallery.find()

      res.status(200).json(
        gallery
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
// DELETE GALLERY IMAGE
// ======================================

router.delete(

  '/gallery/:id',

  async (req, res) => {

    try {

      await Gallery.findByIdAndDelete(
        req.params.id
      )

      res.status(200).json({

        success: true,

        message:
          'Gallery Image Deleted Successfully',

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
// UPDATE GALLERY IMAGE
// ======================================

router.put(

  '/gallery/:id',

  upload.single('image'),

  async (req, res) => {

    try {

      const { title } = req.body

      // ======================================
      // EXISTING IMAGE
      // ======================================

      const existingGallery =
        await Gallery.findById(
          req.params.id
        )


      // ======================================
      // IMAGE UPDATE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : existingGallery.image


      // ======================================
      // UPDATE
      // ======================================

      const updatedGallery =
        await Gallery.findByIdAndUpdate(

          req.params.id,

          {

            title,

            image,

          },

          {
            new: true,
          }

        )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Gallery Image Updated Successfully',

        gallery:
          updatedGallery,

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