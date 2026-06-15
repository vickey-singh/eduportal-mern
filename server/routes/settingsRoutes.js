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

      if (!settings) {

        settings =
          await Setting.create({})

      }

      res.status(200).json(
        settings
      )

    }

    catch (error) {

      console.log(error)

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

      let settings =
        await Setting.findOne()

      if (!settings) {

        settings =
          await Setting.create({})

      }

      const logo =
        req.file

          ? `/uploads/${req.file.filename}`

          : settings.logo

      settings.instituteName =
        req.body.instituteName

      settings.phone =
        req.body.phone

      settings.email =
        req.body.email

      settings.address =
        req.body.address

      settings.instagram =
        req.body.instagram

      settings.youtube =
        req.body.youtube

      settings.linkedin =
        req.body.linkedin

      settings.twitter =
        req.body.twitter

      settings.logo =
        logo

      await settings.save()

      res.status(200).json({

        success: true,

        message:
          'Settings Updated Successfully',

        settings,

      })

    }

    catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)

module.exports = router