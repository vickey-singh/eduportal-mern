const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Faculty =
  require('../models/Faculty')


// ======================================
// ADD FACULTY
// ======================================

router.post(

  '/faculty',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        name,

        designation,

        experience,

        subject,

        description,

      } = req.body


      // ======================================
      // CLOUDINARY IMAGE
      // ======================================

      const image =
        req.file
          ? req.file.path
          : ''


      // ======================================
      // CREATE FACULTY
      // ======================================

      const newFaculty =
        new Faculty({

          name,

          designation,

          experience,

          subject,

          image,

          description,

        })


      // ======================================
      // SAVE FACULTY
      // ======================================

      const savedFaculty =
        await newFaculty.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Faculty Added Successfully',

        faculty:
          savedFaculty,

      })

    }

    catch (error) {

      console.log(
        'Add Faculty Error:',
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
// GET ALL FACULTY
// ======================================

router.get(

  '/faculty',

  async (req, res) => {

    try {

      const faculty =
        await Faculty.find()

          .sort({
            createdAt: -1,
          })


      res.status(200).json(
        faculty
      )

    }

    catch (error) {

      console.log(
        'Get Faculty Error:',
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
// DELETE FACULTY
// ======================================

router.delete(

  '/faculty/:id',

  async (req, res) => {

    try {

      const faculty =
        await Faculty.findById(
          req.params.id
        )


      // ======================================
      // CHECK FACULTY
      // ======================================

      if (!faculty) {

        return res.status(404).json({

          success: false,

          message:
            'Faculty Not Found',

        })

      }


      // ======================================
      // DELETE DATABASE RECORD
      // ======================================

      await Faculty.findByIdAndDelete(

        req.params.id

      )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Faculty Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Faculty Error:',
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
// UPDATE FACULTY
// ======================================

router.put(

  '/faculty/:id',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        name,

        designation,

        experience,

        subject,

        description,

      } = req.body


      // ======================================
      // FIND EXISTING FACULTY
      // ======================================

      const existingFaculty =
        await Faculty.findById(
          req.params.id
        )


      // ======================================
      // CHECK FACULTY
      // ======================================

      if (!existingFaculty) {

        return res.status(404).json({

          success: false,

          message:
            'Faculty Not Found',

        })

      }


      // ======================================
      // IMAGE UPDATE
      // ======================================
      //
      // New image:
      //     Cloudinary URL
      //
      // No new image:
      //     Keep existing image
      // ======================================

      const image =

        req.file

          ? req.file.path

          : existingFaculty.image


      // ======================================
      // UPDATE FACULTY
      // ======================================

      const updatedFaculty =
        await Faculty.findByIdAndUpdate(

          req.params.id,

          {

            name,

            designation,

            experience,

            subject,

            description,

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
          'Faculty Updated Successfully',

        faculty:
          updatedFaculty,

      })

    }

    catch (error) {

      console.log(
        'Update Faculty Error:',
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