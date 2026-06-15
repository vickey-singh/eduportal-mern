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
      // IMAGE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
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
// GET ALL TESTIMONIALS
// ======================================

router.get(

  '/testimonials',

  async (req, res) => {

    try {

      const testimonials =
        await Testimonial.find()

      res.status(200).json(
        testimonials
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
// DELETE TESTIMONIAL
// ======================================

router.delete(

  '/testimonials/:id',

  async (req, res) => {

    try {

      await Testimonial.findByIdAndDelete(
        req.params.id
      )

      res.status(200).json({

        success: true,

        message:
          'Testimonial Deleted Successfully',

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
      // IMAGE UPDATE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
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