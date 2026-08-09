const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Testimonial =
  require('../models/Testimonial')


// ======================================
// ADD TESTIMONIAL
// ======================================

router.post(

  '/testimonials',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        studentName,

        course,

        review,

      } = req.body


      // ======================================
      // CLOUDINARY IMAGE
      // ======================================

      const image =
        req.file
          ? req.file.path
          : ''


      // ======================================
      // CREATE TESTIMONIAL
      // ======================================

      const newTestimonial =
        new Testimonial({

          studentName,

          course,

          image,

          review,

        })


      // ======================================
      // SAVE
      // ======================================

      const savedTestimonial =
        await newTestimonial.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Testimonial Added Successfully',

        testimonial:
          savedTestimonial,

      })

    }

    catch (error) {

      console.log(
        'Add Testimonial Error:',
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
// GET ALL TESTIMONIALS
// ======================================

router.get(

  '/testimonials',

  async (req, res) => {

    try {

      const testimonials =
        await Testimonial.find()

          .sort({
            createdAt: -1,
          })


      res.status(200).json(
        testimonials
      )

    }

    catch (error) {

      console.log(
        'Get Testimonials Error:',
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
// DELETE TESTIMONIAL
// ======================================

router.delete(

  '/testimonials/:id',

  async (req, res) => {

    try {

      const testimonial =
        await Testimonial.findById(
          req.params.id
        )


      // ======================================
      // CHECK TESTIMONIAL
      // ======================================

      if (!testimonial) {

        return res.status(404).json({

          success: false,

          message:
            'Testimonial Not Found',

        })

      }


      // ======================================
      // DELETE DATABASE RECORD
      // ======================================

      await Testimonial.findByIdAndDelete(

        req.params.id

      )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Testimonial Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Testimonial Error:',
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
// UPDATE TESTIMONIAL
// ======================================

router.put(

  '/testimonials/:id',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        studentName,

        course,

        review,

      } = req.body


      // ======================================
      // EXISTING TESTIMONIAL
      // ======================================

      const existingTestimonial =
        await Testimonial.findById(
          req.params.id
        )


      // ======================================
      // CHECK TESTIMONIAL
      // ======================================

      if (!existingTestimonial) {

        return res.status(404).json({

          success: false,

          message:
            'Testimonial Not Found',

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

          : existingTestimonial.image


      // ======================================
      // UPDATE
      // ======================================

      const updatedTestimonial =
        await Testimonial.findByIdAndUpdate(

          req.params.id,

          {

            studentName,

            course,

            image,

            review,

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
          'Testimonial Updated Successfully',

        testimonial:
          updatedTestimonial,

      })

    }

    catch (error) {

      console.log(
        'Update Testimonial Error:',
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