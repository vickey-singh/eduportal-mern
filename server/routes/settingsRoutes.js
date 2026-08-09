const express = require('express')

const router = express.Router()

const upload =
  require('../middleware/upload')

const Setting =
  require('../models/Setting')


// ======================================
// GET SETTINGS
// ======================================

router.get(

  '/settings',

  async (req, res) => {

    try {

      let settings =
        await Setting.findOne()


      // ==================================
      // CREATE DEFAULT SETTINGS
      // ==================================

      if (!settings) {

        settings =
          await Setting.create({})

      }


      // ==================================
      // RESPONSE
      // ==================================

      res.status(200).json(
        settings
      )

    }

    catch (error) {

      console.log(
        'Get Settings Error:',
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
// UPDATE SETTINGS
// ======================================

router.put(

  '/settings',

  upload.single('logo'),

  async (req, res) => {

    try {

      // ==================================
      // FIND SETTINGS
      // ==================================

      let settings =
        await Setting.findOne()


      // ==================================
      // CREATE SETTINGS IF NOT EXISTS
      // ==================================

      if (!settings) {

        settings =
          await Setting.create({})

      }


      // ==================================
      // LOGO
      // ==================================
      //
      // Cloudinary upload middleware:
      //
      // req.file.path
      //     ↓
      // Cloudinary secure URL
      //
      // If no new logo is selected,
      // existing logo remains unchanged.
      // ==================================

      const logo =

        req.file

          ? req.file.path

          : settings.logo


      // ==================================
      // BASIC INFORMATION
      // ==================================

      settings.instituteName =
        req.body.instituteName || ''


      settings.phone =
        req.body.phone || ''


      settings.email =
        req.body.email || ''


      settings.address =
        req.body.address || ''


      // ==================================
      // GOOGLE MAP
      // ==================================

      settings.googleMapUrl =
        req.body.googleMapUrl || ''


      // ==================================
      // SOCIAL LINKS
      // ==================================

      settings.instagram =
        req.body.instagram || ''


      settings.youtube =
        req.body.youtube || ''


      settings.linkedin =
        req.body.linkedin || ''


      settings.twitter =
        req.body.twitter || ''


      // ==================================
      // LOGO
      // ==================================

      settings.logo =
        logo


      // ==================================
      // SAVE
      // ==================================

      await settings.save()


      // ==================================
      // RESPONSE
      // ==================================

      res.status(200).json({

        success: true,

        message:
          'Settings Updated Successfully',

        settings,

      })

    }

    catch (error) {

      console.log(
        'Update Settings Error:',
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


module.exports = router