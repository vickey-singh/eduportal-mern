const express = require('express')

const router = express.Router()

const upload =
require('../middleware/settingsUpload')

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

  upload.fields([

    {
      name: 'logo',

      maxCount: 1,

    },

    {
      name: 'aboutImage',

      maxCount: 1,

    },

    {
      name: 'directorImage',

      maxCount: 1,

    },

  ]),

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
      // FILES
      // ==================================

      const files =
        req.files || {}


      // ==================================
      // LOGO
      // ==================================

      if (
        files.logo &&
        files.logo.length > 0
      ) {

        settings.logo =
          files.logo[0].path

      }


      // ==================================
      // ABOUT IMAGE
      // ==================================

      if (
        files.aboutImage &&
        files.aboutImage.length > 0
      ) {

        settings.aboutImage =
          files.aboutImage[0].path

      }


      // ==================================
      // DIRECTOR IMAGE
      // ==================================

      if (
        files.directorImage &&
        files.directorImage.length > 0
      ) {

        settings.directorImage =
          files.directorImage[0].path

      }


      // ======================================
      // BASIC INFORMATION
      // ======================================
      //
      // IMPORTANT:
      //
      // Only update a field when it is
      // actually present in the request.
      //
      // Existing value remains unchanged
      // when field is not sent.
      // ======================================


      if (
        req.body.instituteName !==
        undefined
      ) {

        settings.instituteName =
          req.body.instituteName

      }


      if (
        req.body.phone !==
        undefined
      ) {

        settings.phone =
          req.body.phone

      }


      if (
        req.body.email !==
        undefined
      ) {

        settings.email =
          req.body.email

      }


      if (
        req.body.website !==
        undefined
      ) {

        settings.website =
          req.body.website

      }


      if (
        req.body.address !==
        undefined
      ) {

        settings.address =
          req.body.address

      }


      // ======================================
      // GOOGLE MAP
      // ======================================

      if (
        req.body.googleMapUrl !==
        undefined
      ) {

        settings.googleMapUrl =
          req.body.googleMapUrl

      }


      // ======================================
      // SOCIAL LINKS
      // ======================================

      if (
        req.body.instagram !==
        undefined
      ) {

        settings.instagram =
          req.body.instagram

      }


      if (
        req.body.youtube !==
        undefined
      ) {

        settings.youtube =
          req.body.youtube

      }


      if (
        req.body.linkedin !==
        undefined
      ) {

        settings.linkedin =
          req.body.linkedin

      }


      if (
        req.body.twitter !==
        undefined
      ) {

        settings.twitter =
          req.body.twitter

      }


      // ======================================
      // DIRECTOR INFORMATION
      // ======================================

      if (
        req.body.directorName !==
        undefined
      ) {

        settings.directorName =
          req.body.directorName

      }


      if (
        req.body.directorDesignation !==
        undefined
      ) {

        settings.directorDesignation =
          req.body.directorDesignation

      }


      // ======================================
      // SAVE SETTINGS
      // ======================================

      await settings.save()


      // ======================================
      // RESPONSE
      // ======================================

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


// ======================================
// EXPORT ROUTER
// ======================================

module.exports =
router