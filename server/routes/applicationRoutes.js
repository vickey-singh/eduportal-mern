const express = require('express')

const router = express.Router()

const Application = require('../models/Application')


// ======================================
// APPLY ROUTE
// ======================================

router.post('/apply', async (req, res) => {

  try {

    console.log(req.body)

    const {
      name,
      email,
      phone,
      course,
      address,
      message,
    } = req.body

    // Create Application
    const newApplication = new Application({
      name,
      email,
      phone,
      course,
      address,
      message,
    })

    // Save To MongoDB
    await newApplication.save()

    res.status(201).json({
      success: true,
      message: 'Application Submitted Successfully',
    })

  } catch (error) {

    console.log('APPLICATION ERROR ❌')

    console.log(error)

    res.status(500).json({
      success: false,
      message: 'Server Error',
    })

  }

})


// ======================================
// GET ALL APPLICATIONS
// ======================================

router.get('/applications', async (req, res) => {

  try {

    const applications = await Application.find()

    res.status(200).json(applications)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      success: false,
      message: 'Server Error',
    })

  }

})

// ======================================
// DELETE APPLICATION
// ======================================

router.delete('/applications/:id', async (req, res) => {

  try {

    await Application.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Application Deleted Successfully',
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
// UPDATE APPLICATION STATUS
// ======================================

router.put('/applications/:id', async (req, res) => {

  try {

    const updatedApplication =
      await Application.findByIdAndUpdate(

        req.params.id,

        {
          status: req.body.status,
        },

        {
          new: true,
        }

      )

    res.status(200).json(updatedApplication)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      success: false,
      message: 'Server Error',
    })

  }

})

// ======================================
// DASHBOARD STATS
// ======================================

router.get('/dashboard-stats', async (req, res) => {

  try {

    // Total Applications
    const totalApplications =
      await Application.countDocuments()

    // Approved
    const approvedApplications =
      await Application.countDocuments({
        status: 'Approved',
      })

    // Pending
    const pendingApplications =
      await Application.countDocuments({
        status: 'Pending',
      })

    // Rejected
    const rejectedApplications =
      await Application.countDocuments({
        status: 'Rejected',
      })

    res.status(200).json({

      totalApplications,

      approvedApplications,

      pendingApplications,

      rejectedApplications,

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
// RECENT APPLICATIONS
// ======================================

router.get('/recent-applications', async (req, res) => {

  try {

    const recentApplications =
      await Application.find()

        .sort({ createdAt: -1 })

        .limit(5)

    res.status(200).json(
      recentApplications
    )

  } catch (error) {

    console.log(error)

    res.status(500).json({
      success: false,
      message: 'Server Error',
    })

  }

})


module.exports = router