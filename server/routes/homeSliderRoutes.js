const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/homeSliderUpload')

const HomeSlider =
  require('../models/HomeSlider')


// ======================================
// ADD HOME SLIDER
// IMAGE / VIDEO
// ======================================

router.post(

  '/home-sliders',

  upload.single('media'),

  async (req, res) => {

    try {

      const {

        mediaType,

        title,

        description,

        isActive,

        order,

      } = req.body


      // ======================================
      // CHECK FILE
      // ======================================

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            'Image or Video is required',

        })

      }


      // ======================================
      // CHECK MEDIA TYPE
      // ======================================

      if (

        ![
          'image',
          'video',
        ].includes(mediaType)

      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid media type',

        })

      }


      // ======================================
      // CREATE SLIDER
      // ======================================

      const slider =
        await HomeSlider.create({

          mediaType,

          mediaUrl:
            req.file.path,

          title:
            title || '',

          description:
            description || '',

          isActive:
            isActive !== undefined
              ? isActive === 'true' ||
                isActive === true
              : true,

          order:
            Number(order) || 0,

        })


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Home Slider Added Successfully',

        slider,

      })

    }

    catch (error) {

      console.log(
        'Add Home Slider Error:',
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
// GET ALL HOME SLIDERS
// ======================================

router.get(

  '/home-sliders',

  async (req, res) => {

    try {

      const sliders =
        await HomeSlider.find()

          .sort({

            order: 1,

            createdAt: 1,

          })


      res.status(200).json({

        success: true,

        sliders,

      })

    }

    catch (error) {

      console.log(
        'Get Home Sliders Error:',
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
// GET ACTIVE HOME SLIDERS
// ======================================

router.get(

  '/home-sliders/active',

  async (req, res) => {

    try {

      const sliders =
        await HomeSlider.find({

          isActive: true,

        })

          .sort({

            order: 1,

            createdAt: 1,

          })


      res.status(200).json({

        success: true,

        sliders,

      })

    }

    catch (error) {

      console.log(
        'Get Active Home Sliders Error:',
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
// UPDATE HOME SLIDER
// ======================================

router.put(

  '/home-sliders/:id',

  upload.single('media'),

  async (req, res) => {

    try {

      const {

        mediaType,

        title,

        description,

        isActive,

        order,

      } = req.body


      // ======================================
      // FIND SLIDER
      // ======================================

      const slider =
        await HomeSlider.findById(
          req.params.id
        )


      if (!slider) {

        return res.status(404).json({

          success: false,

          message:
            'Home Slider Not Found',

        })

      }


      // ======================================
      // MEDIA TYPE
      // ======================================

      if (
        mediaType !== undefined
      ) {

        if (

          ![
            'image',
            'video',
          ].includes(mediaType)

        ) {

          return res.status(400).json({

            success: false,

            message:
              'Invalid media type',

          })

        }


        slider.mediaType =
          mediaType

      }


      // ======================================
      // NEW MEDIA
      // ======================================
      //
      // If new image/video uploaded:
      // update URL
      //
      // If no new file:
      // keep old URL
      // ======================================

      if (req.file) {

        slider.mediaUrl =
          req.file.path

      }


      // ======================================
      // TITLE
      // ======================================

      if (
        title !== undefined
      ) {

        slider.title =
          title

      }


      // ======================================
      // DESCRIPTION
      // ======================================

      if (
        description !== undefined
      ) {

        slider.description =
          description

      }


      // ======================================
      // ACTIVE / INACTIVE
      // ======================================

      if (
        isActive !== undefined
      ) {

        slider.isActive =
          isActive === 'true' ||
          isActive === true

      }


      // ======================================
      // ORDER
      // ======================================

      if (
        order !== undefined
      ) {

        slider.order =
          Number(order) || 0

      }


      // ======================================
      // SAVE
      // ======================================

      await slider.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Home Slider Updated Successfully',

        slider,

      })

    }

    catch (error) {

      console.log(
        'Update Home Slider Error:',
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
// DELETE HOME SLIDER
// ======================================

router.delete(

  '/home-sliders/:id',

  async (req, res) => {

    try {

      const slider =
        await HomeSlider.findById(
          req.params.id
        )


      // ======================================
      // CHECK SLIDER
      // ======================================

      if (!slider) {

        return res.status(404).json({

          success: false,

          message:
            'Home Slider Not Found',

        })

      }


      // ======================================
      // DELETE
      // ======================================

      await HomeSlider.findByIdAndDelete(

        req.params.id

      )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Home Slider Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Home Slider Error:',
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