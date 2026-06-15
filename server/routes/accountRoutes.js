const express = require('express')

const router = express.Router()

const bcrypt = require('bcryptjs')

const Admin = require('../models/Admin')


// ======================================
// UPDATE ADMIN ACCOUNT
// ======================================

router.put(

  '/account-settings',

  async (req, res) => {

    try {

      const {

        currentEmail,

        newEmail,

        currentPassword,

        newPassword,

      } = req.body

      const admin =
        await Admin.findOne({

          email: currentEmail,

        })

      if (!admin) {

        return res.status(404).json({

          success: false,

          message:
            'Current Email Not Found',

        })

      }

      const isMatch =
        await bcrypt.compare(

          currentPassword,

          admin.password

        )

      if (!isMatch) {

        return res.status(400).json({

          success: false,

          message:
            'Current Password Incorrect',

        })

      }

      // ======================================
      // UPDATE EMAIL
      // ======================================

      if (

        newEmail &&

        newEmail.trim() !== ''

      ) {

        admin.email = newEmail

      }

      // ======================================
      // UPDATE PASSWORD
      // ======================================

      if (

        newPassword &&

        newPassword.trim() !== ''

      ) {

        const salt =
          await bcrypt.genSalt(10)

        admin.password =
          await bcrypt.hash(

            newPassword,

            salt

          )

      }

      await admin.save()

      res.status(200).json({

        success: true,

        message:
          'Account Updated Successfully',

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