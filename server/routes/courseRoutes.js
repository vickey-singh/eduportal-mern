const express = require('express')

const router = express.Router()

const Course = require('../models/Course')

// ======================================
// ADD COURSE
// ======================================

router.post('/courses', async (req, res) => {

  try {

    const {
      courseName,
      courseCode,
      description,
      duration,
      totalFee,
      registrationFee,
      installmentAllowed,
      minimumInstallment,
      status,
    } = req.body

    const existingCourse = await Course.findOne({
      courseCode,
    })

    if (existingCourse) {

      return res.status(400).json({
        success: false,
        message: 'Course Code Already Exists',
      })

    }

    const course = new Course({
      courseName,
      courseCode,
      description,
      duration,
      totalFee,
      registrationFee,
      installmentAllowed,
      minimumInstallment,
      status,
    })

    await course.save()

    res.status(201).json({
      success: true,
      message: 'Course Added Successfully',
      course,
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
// GET ALL COURSES
// ======================================

router.get('/courses', async (req, res) => {

  try {

    const courses = await Course.find().sort({
      createdAt: -1,
    })

    res.status(200).json(courses)

  } catch (error) {

    console.log(error)

    res.status(500).json({
      success: false,
      message: 'Server Error',
    })

  }

})

// ======================================
// UPDATE COURSE
// ======================================

router.put('/courses/:id', async (req, res) => {

  try {

    const updatedCourse =
      await Course.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
          new: true,
        }

      )

    res.status(200).json({

      success: true,

      message: 'Course Updated Successfully',

      course: updatedCourse,

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
// DELETE COURSE
// ======================================

router.delete('/courses/:id', async (req, res) => {

  try {

    await Course.findByIdAndDelete(
      req.params.id
    )

    res.status(200).json({

      success: true,

      message: 'Course Deleted Successfully',

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