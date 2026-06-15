const express = require('express')

const router = express.Router()

const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const Admin = require('../models/Admin')


// ======================================
// ADMIN LOGIN
// ======================================

router.post('/admin/login', async (req, res) => {

  try {

    const { email, password }
      = req.body

    // Check Admin
    const admin =
      await Admin.findOne({ email })

    if (!admin) {

      return res.status(400).json({

        success: false,

        message: 'Admin Not Found',

      })

    }

    // Compare Password
    const isMatch =
      await bcrypt.compare(
        password,
        admin.password
      )

    if (!isMatch) {

      return res.status(400).json({

        success: false,

        message: 'Invalid Password',

      })

    }

    // Generate Token
    const token = jwt.sign(

      {
        id: admin._id,
      },

      'eduportal_secret_key',

      {
        expiresIn: '7d',
      }

    )

    res.status(200).json({

      success: true,

      message: 'Login Successful',

      token,

    })

  } catch (error) {

    console.log(error)

    res.status(500).json({

      success: false,

      message: 'Server Error',

    })

  }

})

module.exports = router