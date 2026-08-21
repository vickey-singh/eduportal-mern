const express = require('express')

const router = express.Router()

const Course =
  require('../models/Course')

const Student =
  require('../models/Student')


// ======================================
// ADD COURSE
// ======================================

router.post(
  '/courses',

  async (req, res) => {

    try {

      const {

        courseName,
        courseCode,
        description,
        duration,

        batchTime,

        totalFee,
        registrationFee,

        fullPaymentFee,

        installmentAllowed,
        status,

      } = req.body


      // ======================================
      // CHECK COURSE CODE
      // ======================================

      const existingCourse =
        await Course.findOne({
          courseCode,
        })


      if (existingCourse) {

        return res.status(400).json({

          success: false,

          message:
            'Course Code Already Exists',

        })

      }


      // ======================================
      // CREATE COURSE
      // ======================================

      const course =
        new Course({

          courseName,

          courseCode,

          description,

          duration,

          batchTime:
            batchTime || '',


          // ==================================
          // FEES
          // ==================================

          totalFee:
            Number(
              totalFee || 0
            ),

          registrationFee:
            Number(
              registrationFee || 0
            ),


          // ==================================
          // FULL PAYMENT
          // ==================================

          fullPaymentFee:
            Number(
              fullPaymentFee || 0
            ),


          // ==================================
          // INSTALLMENT
          // ==================================

          installmentAllowed:
            installmentAllowed === 'false'
              ? false
              : Boolean(
                  installmentAllowed ??
                  true
                ),


          // ==================================
          // STATUS
          // ==================================

          status:
            status || 'Active',

        })


      // ======================================
      // SAVE
      // ======================================

      await course.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Course Added Successfully',

        course,

      })

    }

    catch (error) {

      console.log(
        'ADD COURSE ERROR:',
        error
      )


      if (
        error.code === 11000
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course Code Already Exists',

        })

      }


      res.status(500).json({

        success: false,

        message:
          'Server Error',

        error:
          error.message,

      })

    }

  }
)


// ======================================
// GET ALL COURSES
// ======================================

router.get(
  '/courses',

  async (req, res) => {

    try {

      const courses =
        await Course.find()
          .sort({
            createdAt: -1,
          })


      res.status(200).json(
        courses
      )

    }

    catch (error) {

      console.log(
        'GET COURSES ERROR:',
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
// GET COURSE BY ID
// ======================================

router.get(
  '/courses/:id',

  async (req, res) => {

    try {

      const course =
        await Course.findById(
          req.params.id
        )


      if (!course) {

        return res.status(404).json({

          success: false,

          message:
            'Course Not Found',

        })

      }


      res.status(200).json(
        course
      )

    }

    catch (error) {

      console.log(
        'GET COURSE ERROR:',
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
// UPDATE COURSE
// ======================================

router.put(
  '/courses/:id',

  async (req, res) => {

    try {

      const {

        courseName,
        courseCode,
        description,
        duration,

        batchTime,

        totalFee,
        registrationFee,

        fullPaymentFee,

        installmentAllowed,
        status,

      } = req.body


      // ======================================
      // CHECK COURSE
      // ======================================

      const existingCourse =
        await Course.findById(
          req.params.id
        )


      if (!existingCourse) {

        return res.status(404).json({

          success: false,

          message:
            'Course Not Found',

        })

      }


      // ======================================
      // CHECK DUPLICATE COURSE CODE
      // ======================================

      const duplicateCourse =
        await Course.findOne({

          courseCode,

          _id: {
            $ne:
              req.params.id,
          },

        })


      if (duplicateCourse) {

        return res.status(400).json({

          success: false,

          message:
            'Course Code Already Exists',

        })

      }


      // ======================================
      // OLD COURSE INFORMATION
      // ======================================

      const oldCourseName =
        existingCourse.courseName

      const oldBatchTime =
        existingCourse.batchTime || ''

      const newBatchTime =
        batchTime || ''


      // ======================================
      // UPDATE COURSE
      // ======================================

      const updatedCourse =
        await Course.findByIdAndUpdate(

          req.params.id,

          {

            courseName,

            courseCode,

            description,

            duration,

            batchTime:
              newBatchTime,


            // ==================================
            // FEES
            // ==================================

            totalFee:
              Number(
                totalFee || 0
              ),

            registrationFee:
              Number(
                registrationFee || 0
              ),


            // ==================================
            // FULL PAYMENT
            // ==================================

            fullPaymentFee:
              Number(
                fullPaymentFee || 0
              ),


            // ==================================
            // INSTALLMENT
            // ==================================

            installmentAllowed:
              installmentAllowed === 'false'
                ? false
                : Boolean(
                    installmentAllowed ??
                    true
                  ),


            // ==================================
            // STATUS
            // ==================================

            status:
              status || 'Active',

          },

          {

            new: true,

            runValidators: true,

          }

        )


      // ======================================
      // UPDATE STUDENTS
      // ======================================
      //
      // If batch time changed:
      // Update all students belonging
      // to this course.
      //
      // ======================================

      if (
        oldBatchTime !==
        newBatchTime
      ) {

        await Student.updateMany(

          {
            course:
              oldCourseName,
          },

          {
            $set: {

              batchTime:
                newBatchTime,

            },

          }

        )

        console.log(

          `Batch time updated for all students of course: ${oldCourseName}`

        )

      }


      // ======================================
      // IF COURSE NAME ALSO CHANGED
      // ======================================
      //
      // Existing students should follow
      // the new course name.
      //
      // ======================================

      if (
        oldCourseName !==
        courseName
      ) {

        await Student.updateMany(

          {
            course:
              oldCourseName,
          },

          {
            $set: {

              course:
                courseName,

            },

          }

        )

        console.log(

          `Course name updated for all students: ${oldCourseName} → ${courseName}`

        )

      }


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Course Updated Successfully',

        course:
          updatedCourse,

      })

    }

    catch (error) {

      console.log(
        'UPDATE COURSE ERROR:',
        error
      )


      if (
        error.code === 11000
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Course Code Already Exists',

        })

      }


      res.status(500).json({

        success: false,

        message:
          'Server Error',

        error:
          error.message,

      })

    }

  }
)


// ======================================
// DELETE COURSE
// ======================================

router.delete(
  '/courses/:id',

  async (req, res) => {

    try {

      const course =
        await Course.findByIdAndDelete(
          req.params.id
        )


      if (!course) {

        return res.status(404).json({

          success: false,

          message:
            'Course Not Found',

        })

      }


      res.status(200).json({

        success: true,

        message:
          'Course Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'DELETE COURSE ERROR:',
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