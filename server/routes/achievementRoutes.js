const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Achievement =
  require('../models/Achievement')


// ======================================
// ADD ACHIEVEMENT
// ======================================

router.post(

  '/achievements',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        studentName,

        course,

        rank,

        marks,

        description,

      } = req.body


      // ======================================
      // IMAGE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : ''


      // ======================================
      // CREATE ACHIEVEMENT
      // ======================================

      const newAchievement =
        new Achievement({

          studentName,

          course,

          rank,

          marks,

          image,

          description,

        })


      // ======================================
      // SAVE
      // ======================================

      const savedAchievement =
        await newAchievement.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Achievement Added Successfully',

        achievement:
          savedAchievement,

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
// GET ALL ACHIEVEMENTS
// ======================================

router.get(

  '/achievements',

  async (req, res) => {

    try {

      const achievements =
        await Achievement.find()

      res.status(200).json(
        achievements
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
// DELETE ACHIEVEMENT
// ======================================

router.delete(

  '/achievements/:id',

  async (req, res) => {

    try {

      await Achievement.findByIdAndDelete(
        req.params.id
      )

      res.status(200).json({

        success: true,

        message:
          'Achievement Deleted Successfully',

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
// UPDATE ACHIEVEMENT
// ======================================

router.put(

  '/achievements/:id',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        studentName,

        course,

        rank,

        marks,

        description,

      } = req.body


      // ======================================
      // EXISTING ACHIEVEMENT
      // ======================================

      const existingAchievement =
        await Achievement.findById(
          req.params.id
        )


      // ======================================
      // IMAGE UPDATE
      // ======================================

      const image =
        req.file
          ? `/uploads/${req.file.filename}`
          : existingAchievement.image


      // ======================================
      // UPDATE
      // ======================================

      const updatedAchievement =
        await Achievement.findByIdAndUpdate(

          req.params.id,

          {

            studentName,

            course,

            rank,

            marks,

            image,

            description,

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
          'Achievement Updated Successfully',

        achievement:
          updatedAchievement,

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