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
      // Cloudinary returns complete URL
      // in req.file.path
      // ======================================

      const image =
        req.file
          ? req.file.path
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

    }

    catch (error) {

      console.log(
        'Add Achievement Error:',
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
// GET ALL ACHIEVEMENTS
// ======================================

router.get(

  '/achievements',

  async (req, res) => {

    try {

      const achievements =
        await Achievement.find()

          .sort({
            createdAt: -1,
          })


      res.status(200).json(
        achievements
      )

    }

    catch (error) {

      console.log(
        'Get Achievements Error:',
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
// DELETE ACHIEVEMENT
// ======================================

router.delete(

  '/achievements/:id',

  async (req, res) => {

    try {

      const achievement =
        await Achievement.findById(
          req.params.id
        )


      // ======================================
      // CHECK EXISTENCE
      // ======================================

      if (!achievement) {

        return res.status(404).json({

          success: false,

          message:
            'Achievement Not Found',

        })

      }


      // ======================================
      // DELETE DATABASE RECORD
      // ======================================

      await Achievement.findByIdAndDelete(

        req.params.id

      )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Achievement Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Achievement Error:',
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
      // CHECK EXISTENCE
      // ======================================

      if (!existingAchievement) {

        return res.status(404).json({

          success: false,

          message:
            'Achievement Not Found',

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
      //     Keep old image
      // ======================================

      const image =

        req.file

          ? req.file.path

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

            runValidators: true,

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

    }

    catch (error) {

      console.log(
        'Update Achievement Error:',
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