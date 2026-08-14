const express = require('express')

const router = express.Router()

const bcrypt = require('bcryptjs')

const mongoose = require('mongoose')

const upload =
  require('../middleware/upload')

const Faculty =
  require('../models/Faculty')

const Course =
  require('../models/Course')


// ======================================
// GENERATE NEXT TEACHER ID
// ======================================

const generateTeacherId =
  async () => {

    const facultyList =
      await Faculty.find({

        teacherId: {
          $regex: /^TCH\d+$/,
        },

      })

        .select('teacherId')

        .lean()


    let highestNumber = 0


    for (
      const faculty of facultyList
    ) {

      const teacherId =
        String(
          faculty.teacherId || ''
        ).trim()


      const number =
        parseInt(

          teacherId.replace(
            'TCH',
            ''
          ),

          10

        ) || 0


      if (
        number >
        highestNumber
      ) {

        highestNumber =
          number

      }

    }


    return (

      `TCH${String(
        highestNumber + 1
      ).padStart(
        3,
        '0'
      )}`

    )

  }


// ======================================
// GENERATE NEXT EMPLOYEE ID
// ======================================

const generateEmployeeId =
  async () => {

    const facultyList =
      await Faculty.find({

        employeeId: {
          $regex: /^EMP\d+$/,
        },

      })

        .select('employeeId')

        .lean()


    let highestNumber = 0


    for (
      const faculty of facultyList
    ) {

      const employeeId =
        String(
          faculty.employeeId || ''
        ).trim()


      const number =
        parseInt(

          employeeId.replace(
            'EMP',
            ''
          ),

          10

        ) || 0


      if (
        number >
        highestNumber
      ) {

        highestNumber =
          number

      }

    }


    return (

      `EMP${String(
        highestNumber + 1
      ).padStart(
        3,
        '0'
      )}`

    )

  }


// ======================================
// SANITIZE FACULTY
// ======================================
//
// Never send passwordHash to frontend.
// ======================================

const sanitizeFaculty =
  (faculty) => {

    const object =
      faculty.toObject
        ? faculty.toObject()
        : {
            ...faculty,
          }


    delete object.passwordHash


    return object

  }


// ======================================
// PARSE ASSIGNED CLASSES
// ======================================

const parseAssignedClasses =
  (value) => {

    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {

      return []

    }


    try {

      const parsed =
        typeof value === 'string'
          ? JSON.parse(value)
          : value


      if (
        !Array.isArray(parsed)
      ) {

        return []

      }


      return parsed

        .filter((item) => (

          item &&
          item.courseId &&
          item.batchTime

        ))

        .map((item) => ({

          courseId:
            item.courseId,

          batchTime:
            String(
              item.batchTime
            ).trim(),

        }))

    }

    catch (error) {

      return []

    }

  }


// ======================================
// VALIDATE ASSIGNED CLASSES
// ======================================

const validateAssignedClasses =
  async (assignedClasses) => {

    if (
      !Array.isArray(
        assignedClasses
      )
    ) {

      return {

        valid: true,

        message: '',

      }

    }


    const uniqueClasses =
      new Set()


    for (
      const item of assignedClasses
    ) {

      // ==================================
      // COURSE ID
      // ==================================

      if (
        !mongoose.Types.ObjectId.isValid(
          item.courseId
        )
      ) {

        return {

          valid: false,

          message:
            'Invalid course selected.',

        }

      }


      // ==================================
      // BATCH
      // ==================================

      if (
        !item.batchTime ||
        !String(
          item.batchTime
        ).trim()
      ) {

        return {

          valid: false,

          message:
            'Batch time is required for every assigned course.',

        }

      }


      const key =

        `${item.courseId}_${String(
          item.batchTime
        ).trim()}`


      // ==================================
      // DUPLICATE
      // ==================================

      if (
        uniqueClasses.has(key)
      ) {

        return {

          valid: false,

          message:
            'Duplicate course and batch assignment found.',

        }

      }


      uniqueClasses.add(key)

    }


    // ======================================
    // CHECK COURSES
    // ======================================

    const courseIds =
      assignedClasses.map(
        (item) =>
          item.courseId
      )


    const courses =
      await Course.find({

        _id: {
          $in: courseIds,
        },

      })

        .select(

          '_id courseName courseCode duration status batchTime'

        )

        .lean()


    const courseMap =
      new Map(

        courses.map(
          (course) => [

            String(
              course._id
            ),

            course,

          ]
        )

      )


    for (
      const item of assignedClasses
    ) {

      const course =
        courseMap.get(
          String(
            item.courseId
          )
        )


      // ==================================
      // COURSE NOT FOUND
      // ==================================

      if (!course) {

        return {

          valid: false,

          message:
            'One or more selected courses were not found.',

        }

      }


      // ==================================
      // INACTIVE COURSE
      // ==================================

      if (
        course.status ===
        'Inactive'
      ) {

        return {

          valid: false,

          message:
            `${course.courseName} is inactive.`,

        }

      }

    }


    return {

      valid: true,

      message: '',

    }

  }


// ======================================
// ADD FACULTY
// ======================================

router.post(

  '/faculty',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        name,

        designation,

        experience,

        subject,

        description,

        dob,

        gender,

        aadharNumber,

        phone,

        email,

        permanentAddress,

        currentAddress,

        qualification,

        institution,

        joiningDate,

        createTeacherAccount,

        teacherPassword,

        accountStatus,

        assignedClasses,

        isWebsiteVisible,

      } = req.body


      // ======================================
      // VALIDATE BASIC INFORMATION
      // ======================================

      if (
        !name ||
        !designation ||
        !experience ||
        !subject ||
        !description
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Please fill all required faculty information.',

        })

      }


      // ======================================
      // IMAGE
      // ======================================

      const image =
        req.file
          ? req.file.path
          : ''


      // ======================================
      // ASSIGNED CLASSES
      // ======================================

      const parsedClasses =
        parseAssignedClasses(
          assignedClasses
        )


      const assignmentValidation =
        await validateAssignedClasses(
          parsedClasses
        )


      if (
        !assignmentValidation.valid
      ) {

        return res.status(400).json({

          success: false,

          message:
            assignmentValidation.message,

        })

      }


      // ======================================
      // AUTO EMPLOYEE ID
      // ======================================

      const employeeId =
        await generateEmployeeId()


      // ======================================
      // TEACHER ACCOUNT
      // ======================================

      let teacherId = ''

      let passwordHash = ''

      let isTeacher = false


      if (
        String(
          createTeacherAccount
        ) === 'true'
      ) {

        // ==================================
        // PASSWORD REQUIRED
        // ==================================

        if (
          !teacherPassword ||
          !String(
            teacherPassword
          ).trim()
        ) {

          return res.status(400).json({

            success: false,

            message:
              'Teacher password is required.',

          })

        }


        if (
          String(
            teacherPassword
          ).trim().length < 6
        ) {

          return res.status(400).json({

            success: false,

            message:
              'Teacher password must be at least 6 characters.',

          })

        }


        // ==================================
        // AUTO TEACHER ID
        // ==================================

        teacherId =
          await generateTeacherId()


        // ==================================
        // HASH PASSWORD
        // ==================================

        passwordHash =
          await bcrypt.hash(

            String(
              teacherPassword
            ).trim(),

            10

          )


        isTeacher = true

      }


      // ======================================
      // WEBSITE VISIBILITY
      // ======================================

      const websiteVisible =

        isWebsiteVisible ===
        undefined

          ? true

          : String(
              isWebsiteVisible
            ) !== 'false'


      // ======================================
      // ACCOUNT STATUS
      // ======================================

      const finalAccountStatus =

        accountStatus ===
          'Inactive'

          ? 'Inactive'

          : 'Active'


      // ======================================
      // CREATE FACULTY
      // ======================================

      const newFaculty =
        new Faculty({

          // ==================================
          // PUBLIC INFORMATION
          // ==================================

          name,

          designation,

          experience,

          subject,

          image,

          description,


          // ==================================
          // PERSONAL
          // ==================================

          dob:
            dob || '',

          gender:
            gender || '',

          aadharNumber:
            aadharNumber || '',


          // ==================================
          // CONTACT
          // ==================================

          phone:
            phone || '',

          email:
            email || '',


          // ==================================
          // ADDRESS
          // ==================================

          permanentAddress:
            permanentAddress || '',

          currentAddress:
            currentAddress || '',


          // ==================================
          // PROFESSIONAL
          // ==================================

          qualification:
            qualification || '',

          institution:
            institution || '',

          joiningDate:
            joiningDate || '',


          // ==================================
          // AUTO EMPLOYEE ID
          // ==================================

          employeeId,


          // ==================================
          // TEACHER ACCOUNT
          // ==================================

          teacherId,

          passwordHash,

          isTeacher,

          accountStatus:
            finalAccountStatus,


          // ==================================
          // ASSIGNMENTS
          // ==================================

          assignedClasses:
            parsedClasses,


          // ==================================
          // WEBSITE
          // ==================================

          isWebsiteVisible:
            websiteVisible,

        })


      // ======================================
      // SAVE
      // ======================================

      const savedFaculty =
        await newFaculty.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(201).json({

        success: true,

        message:
          'Faculty Added Successfully',

        faculty:
          sanitizeFaculty(
            savedFaculty
          ),

      })

    }

    catch (error) {

      console.log(
        'Add Faculty Error:',
        error
      )


      // ======================================
      // DUPLICATE ID
      // ======================================

      if (
        error.code === 11000
      ) {

        return res.status(409).json({

          success: false,

          message:
            'Teacher or Employee ID already exists. Please try again.',

        })

      }


      res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


// ======================================
// GET ALL FACULTY
// ======================================

router.get(

  '/faculty',

  async (req, res) => {

    try {

      const faculty =
        await Faculty.find()

          .select(
            '-passwordHash'
          )

          .populate({

            path:
              'assignedClasses.courseId',

            select:
              'courseName courseCode duration status batchTime',

          })

          .sort({

            createdAt:
              -1,

          })


      res.status(200).json(
        faculty
      )

    }

    catch (error) {

      console.log(
        'Get Faculty Error:',
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
// GET PUBLIC FACULTY
// ======================================
//
// Main website ke liye ONLY public data.
// ======================================

router.get(

  '/faculty/public',

  async (req, res) => {

    try {

      const faculty =
        await Faculty.find({

          isWebsiteVisible:
            true,

        })

          .select(

            'name designation experience subject image description'

          )

          .sort({

            createdAt:
              -1,

          })


      res.status(200).json(
        faculty
      )

    }

    catch (error) {

      console.log(
        'Get Public Faculty Error:',
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
// UPDATE FACULTY
// ======================================
//
// IMPORTANT:
// Password is NOT changed here.
// ======================================

router.put(

  '/faculty/:id',

  upload.single('image'),

  async (req, res) => {

    try {

      const {

        name,

        designation,

        experience,

        subject,

        description,

        dob,

        gender,

        aadharNumber,

        phone,

        email,

        permanentAddress,

        currentAddress,

        qualification,

        institution,

        joiningDate,

        isTeacher,

        accountStatus,

        assignedClasses,

        isWebsiteVisible,

      } = req.body


      // ======================================
      // FIND FACULTY
      // ======================================

      const existingFaculty =
        await Faculty.findById(
          req.params.id
        )


      if (!existingFaculty) {

        return res.status(404).json({

          success: false,

          message:
            'Faculty Not Found',

        })

      }


      // ======================================
      // ASSIGNED CLASSES
      // ======================================

      const parsedClasses =

        assignedClasses !==
        undefined

          ? parseAssignedClasses(
              assignedClasses
            )

          : existingFaculty.assignedClasses


      const assignmentValidation =
        await validateAssignedClasses(
          parsedClasses
        )


      if (
        !assignmentValidation.valid
      ) {

        return res.status(400).json({

          success: false,

          message:
            assignmentValidation.message,

        })

      }


      // ======================================
      // IMAGE
      // ======================================

      const image =

        req.file

          ? req.file.path

          : existingFaculty.image


      // ======================================
      // PUBLIC INFORMATION
      // ======================================

      existingFaculty.name =
        name ??
        existingFaculty.name

      existingFaculty.designation =
        designation ??
        existingFaculty.designation

      existingFaculty.experience =
        experience ??
        existingFaculty.experience

      existingFaculty.subject =
        subject ??
        existingFaculty.subject

      existingFaculty.description =
        description ??
        existingFaculty.description

      existingFaculty.image =
        image


      // ======================================
      // PERSONAL
      // ======================================

      existingFaculty.dob =
        dob ??
        existingFaculty.dob

      existingFaculty.gender =
        gender ??
        existingFaculty.gender

      existingFaculty.aadharNumber =
        aadharNumber ??
        existingFaculty.aadharNumber


      // ======================================
      // CONTACT
      // ======================================

      existingFaculty.phone =
        phone ??
        existingFaculty.phone

      existingFaculty.email =
        email ??
        existingFaculty.email


      // ======================================
      // ADDRESS
      // ======================================

      existingFaculty.permanentAddress =
        permanentAddress ??
        existingFaculty.permanentAddress

      existingFaculty.currentAddress =
        currentAddress ??
        existingFaculty.currentAddress


      // ======================================
      // PROFESSIONAL
      // ======================================

      existingFaculty.qualification =
        qualification ??
        existingFaculty.qualification

      existingFaculty.institution =
        institution ??
        existingFaculty.institution

      existingFaculty.joiningDate =
        joiningDate ??
        existingFaculty.joiningDate


      // ======================================
      // AUTO EMPLOYEE ID
      // ======================================
      //
      // Existing ID preserve hoga.
      //
      // Missing hai to automatically
      // generate hoga.
      // ======================================

      if (

        !existingFaculty.employeeId ||

        String(
          existingFaculty.employeeId
        ).trim() === ''

      ) {

        existingFaculty.employeeId =
          await generateEmployeeId()

      }


      // ======================================
      // WEBSITE VISIBILITY
      // ======================================

      if (
        isWebsiteVisible !==
        undefined
      ) {

        existingFaculty.isWebsiteVisible =

          String(
            isWebsiteVisible
          ) !== 'false'

      }


      // ======================================
      // TEACHER ACCOUNT
      // ======================================

      if (
        isTeacher !==
        undefined
      ) {

        const teacherEnabled =

          String(
            isTeacher
          ) === 'true'


        // ==================================
        // ENABLE
        // ==================================

        if (
          teacherEnabled
        ) {

          existingFaculty.isTeacher =
            true


          // ==================================
          // AUTO TEACHER ID
          // ==================================

          if (

            !existingFaculty.teacherId ||

            String(
              existingFaculty.teacherId
            ).trim() === ''

          ) {

            existingFaculty.teacherId =
              await generateTeacherId()

          }

        }


        // ==================================
        // DISABLE
        // ==================================

        else {

          existingFaculty.isTeacher =
            false

          // Teacher ID delete nahi hoga.
          // Re-enable karne par same ID
          // preserve rahega.

        }

      }


      // ======================================
      // EXTRA TEACHER ID SAFETY
      // ======================================

      if (

        existingFaculty.isTeacher ===
        true &&

        (
          !existingFaculty.teacherId ||

          String(
            existingFaculty.teacherId
          ).trim() === ''
        )

      ) {

        existingFaculty.teacherId =
          await generateTeacherId()

      }


      // ======================================
      // ACCOUNT STATUS
      // ======================================

      if (
        accountStatus !==
        undefined
      ) {

        existingFaculty.accountStatus =

          accountStatus ===
            'Inactive'

            ? 'Inactive'

            : 'Active'

      }


      // ======================================
      // ASSIGNMENTS
      // ======================================

      if (
        assignedClasses !==
        undefined
      ) {

        existingFaculty.assignedClasses =
          parsedClasses

      }


      // ======================================
      // SAVE
      // ======================================

      const updatedFaculty =
        await existingFaculty.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Faculty Updated Successfully',

        faculty:
          sanitizeFaculty(
            updatedFaculty
          ),

      })

    }

    catch (error) {

      console.log(
        'Update Faculty Error:',
        error
      )


      if (
        error.code === 11000
      ) {

        return res.status(409).json({

          success: false,

          message:
            'Teacher or Employee ID already exists. Please try again.',

        })

      }


      res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


// ======================================
// RESET TEACHER PASSWORD
// ======================================

router.put(

  '/faculty/:id/reset-password',

  async (req, res) => {

    try {

      const {

        teacherPassword,

      } = req.body


      // ======================================
      // VALIDATE PASSWORD
      // ======================================

      if (
        !teacherPassword ||
        !String(
          teacherPassword
        ).trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            'New teacher password is required.',

        })

      }


      const newPassword =
        String(
          teacherPassword
        ).trim()


      if (
        newPassword.length < 6
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Password must be at least 6 characters.',

        })

      }


      // ======================================
      // FIND FACULTY
      // ======================================

      const faculty =
        await Faculty.findById(
          req.params.id
        )


      if (!faculty) {

        return res.status(404).json({

          success: false,

          message:
            'Faculty Not Found',

        })

      }


      // ======================================
      // CHECK TEACHER
      // ======================================

      if (
        faculty.isTeacher !== true
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Teacher account is not enabled.',

        })

      }


      // ======================================
      // ENSURE TEACHER ID
      // ======================================

      if (

        !faculty.teacherId ||

        String(
          faculty.teacherId
        ).trim() === ''

      ) {

        faculty.teacherId =
          await generateTeacherId()

      }


      // ======================================
      // ENSURE EMPLOYEE ID
      // ======================================

      if (

        !faculty.employeeId ||

        String(
          faculty.employeeId
        ).trim() === ''

      ) {

        faculty.employeeId =
          await generateEmployeeId()

      }


      // ======================================
      // HASH PASSWORD
      // ======================================

      faculty.passwordHash =
        await bcrypt.hash(

          newPassword,

          10

        )


      // ======================================
      // SAVE
      // ======================================

      await faculty.save()


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Teacher Password Reset Successfully',

        teacherId:
          faculty.teacherId,

        employeeId:
          faculty.employeeId,

      })

    }

    catch (error) {

      console.log(
        'Reset Teacher Password Error:',
        error
      )


      if (
        error.code === 11000
      ) {

        return res.status(409).json({

          success: false,

          message:
            'Teacher or Employee ID conflict. Please try again.',

        })

      }


      res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


// ======================================
// DELETE FACULTY
// ======================================

router.delete(

  '/faculty/:id',

  async (req, res) => {

    try {

      const faculty =
        await Faculty.findById(
          req.params.id
        )


      // ======================================
      // CHECK
      // ======================================

      if (!faculty) {

        return res.status(404).json({

          success: false,

          message:
            'Faculty Not Found',

        })

      }


      // ======================================
      // DELETE
      // ======================================

      await Faculty.findByIdAndDelete(

        req.params.id

      )


      // ======================================
      // RESPONSE
      // ======================================

      res.status(200).json({

        success: true,

        message:
          'Faculty Deleted Successfully',

      })

    }

    catch (error) {

      console.log(
        'Delete Faculty Error:',
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
// EXPORT
// ======================================

module.exports =
  router