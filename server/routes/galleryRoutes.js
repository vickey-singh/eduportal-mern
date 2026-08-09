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

      const {
        title,
      } = req.body


      // ======================================
      // CLOUDINARY IMAGE
      // ======================================

      const image =
        req.file
          ? req.file.path
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

    }

    catch (error) {

      console.log(
        'Add Gallery Error:',
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
// GET ALL GALLERY IMAGES
// ======================================

router.get(

  '/gallery',

  async (req, res) => {

    try {

      const gallery =
        await Gallery.find()

          .sort({
            createdAt: -1,
          })


      res.status(200).json(
        gallery
      )

    }

    catch (error) {

      console.log(
        'Get Gallery Error:',
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
// DELETE GALLERY IMAGE
// ======================================

router.delete(

  '/gallery/:id',

  async (req, res) => {

    try {

      const gallery =
        await Gallery.findById(
          req.params.id
        )


      // ======================================
      // CHECK GALLERY
      // ======================================

      if (!gallery) {

        return res.status(404).json({

          success: false,

          message:
            'Gallery Image Not Found',

        })

      }


      // ======================================
      // DELETE DATABASE RECORD
      // ======================================

      await Gallery.findByIdAndDelete(

        req.params.id

      )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Gallery Image Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Gallery Error:',
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
// UPDATE GALLERY IMAGE
// ======================================

router.put(

  '/gallery/:id',

  upload.single('image'),

  async (req, res) => {

    try {

      const {
        title,
      } = req.body


      // ======================================
      // EXISTING GALLERY
      // ======================================

      const existingGallery =
        await Gallery.findById(
          req.params.id
        )


      // ======================================
      // CHECK GALLERY
      // ======================================

      if (!existingGallery) {

        return res.status(404).json({

          success: false,

          message:
            'Gallery Image Not Found',

        })

      }


      // ======================================
      // IMAGE UPDATE
      // ======================================
      //
      // New image uploaded:
      //     Cloudinary URL
      //
      // No new image:
      //     Keep existing image
      // ======================================

      const image =

        req.file

          ? req.file.path

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

            runValidators: true,

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

    }

    catch (error) {

      console.log(
        'Update Gallery Error:',
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