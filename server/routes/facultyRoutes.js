const upload =
  require('../middleware/upload')

const express = require('express')

const router = express.Router()

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
      // UPLOADED IMAGE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
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

        faculty: savedFaculty,

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
// GET ALL FACULTY
// ======================================

router.get('/faculty', async (req, res) => {

  try {

    const faculty =
      await Faculty.find()

    res.status(200).json(faculty)

  } catch (error) {

    console.log(error)

    res.status(500).json({

      success: false,

      message: 'Server Error',

    })

  }

})


// ======================================
// DELETE FACULTY
// ======================================

router.delete('/faculty/:id', async (req, res) => {

  try {

    await Faculty.findByIdAndDelete(
      req.params.id
    )

    res.status(200).json({

      success: true,

      message:
        'Faculty Deleted Successfully',

    })

  } catch (error) {

    console.log(error)

    res.status(500).json({

      success: false,

      message: 'Server Error',

    })

  }

})


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
      // IMAGE UPDATE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
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
          }

        )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Faculty Updated Successfully',

        faculty: updatedFaculty,

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