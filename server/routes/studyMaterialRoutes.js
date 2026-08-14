const express = require('express')

const router = express.Router()

const StudyMaterial =
  require('../models/StudyMaterial')

const Faculty =
  require('../models/Faculty')

const Student =
  require('../models/Student')

const StudentNotification =
  require('../models/StudentNotification')

const teacherAuth =
  require('../middleware/teacherAuth')

const upload =
  require('../middleware/studyMaterialUpload')


// ======================================
// HELPER
// CHECK TEACHER COURSE + BATCH
// ======================================

const isTeacherAssigned =
  (
    teacher,
    course,
    batchTime
  ) => {

    return (

      teacher.assignedClasses || []

    ).some(

      (assignment) => {

        const assignedCourse =
          assignment.courseId


        if (!assignedCourse) {

          return false

        }


        const courseMatch =
          assignedCourse.courseName
            ?.trim()
            .toLowerCase() ===

          course
            ?.trim()
            .toLowerCase()


        const batchMatch =
          assignment.batchTime
            ?.trim()
            .toLowerCase() ===

          batchTime
            ?.trim()
            .toLowerCase()


        return (
          courseMatch &&
          batchMatch
        )

      }

    )

  }


// ======================================
// HELPER
// CREATE STUDY MATERIAL NOTIFICATIONS
// ======================================
//
// Same course + same batch ke
// students ko notification milega.
// ======================================

const createStudyMaterialNotifications =
  async (

    course,
    batchTime,
    title,
    message,
    relatedId

  ) => {

    try {

      const students =
        await Student.find({

          course:
            course.trim(),

          batchTime:
            batchTime.trim(),

        })
        .select('_id')


      if (
        students.length === 0
      ) {

        return

      }


      const notifications =
        students.map(

          (student) => ({

            studentId:
              student._id,

            type:
              'StudyMaterial',

            title,

            message,

            link:
              '/student/study-materials',

            relatedId:
              String(relatedId),

            isRead:
              false,

          })

        )


      await StudentNotification.insertMany(

        notifications

      )

    }

    catch (error) {

      console.log(

        'Study Material Notification Error:',
        error

      )

    }

  }


// ======================================
// GET TEACHER STUDY MATERIALS
// ======================================
//
// GET /api/teacher/materials
// ======================================

router.get(

  '/teacher/materials',

  teacherAuth,

  async (req, res) => {

    try {

      // ==================================
      // GET TEACHER
      // ==================================

      const teacher =
        await Faculty.findById(
          req.teacher.id
        )
        .populate(
          'assignedClasses.courseId'
        )


      if (!teacher) {

        return res.status(404).json({

          success: false,

          message:
            'Teacher not found.',

        })

      }


      // ==================================
      // TEACHER STATUS
      // ==================================

      if (
        teacher.isTeacher !== true
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Teacher account is not enabled.',

        })

      }


      if (
        teacher.accountStatus ===
        'Inactive'
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Teacher account is inactive.',

        })

      }


      // ==================================
      // GET MATERIALS
      // ==================================

      const materials =
        await StudyMaterial.find({

          teacherId:
            teacher._id,

        })

        .sort({

          createdAt: -1,

        })


      return res.status(200).json({

        success: true,

        count:
          materials.length,

        materials,

      })

    }

    catch (error) {

      console.log(

        'Get Teacher Materials Error:',
        error

      )


      return res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }

)


// ======================================
// CREATE STUDY MATERIAL
// ======================================
//
// POST /api/teacher/materials
//
// Content-Type:
// multipart/form-data
//
// Field name for file:
// file
// ======================================

router.post(

  '/teacher/materials',

  teacherAuth,

  upload.single('file'),

  async (req, res) => {

    try {

      const {

        title,

        subject,

        course,

        batchTime,

        description,

        materialType,

        externalLink,

      } = req.body


      // ==================================
      // BASIC VALIDATION
      // ==================================

      if (
        !title ||
        !course ||
        !batchTime
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Title, course and batch are required.',

        })

      }


      // ==================================
      // GET TEACHER
      // ==================================

      const teacher =
        await Faculty.findById(
          req.teacher.id
        )
        .populate(
          'assignedClasses.courseId'
        )


      if (!teacher) {

        return res.status(404).json({

          success: false,

          message:
            'Teacher not found.',

        })

      }


      // ==================================
      // ACCOUNT CHECK
      // ==================================

      if (
        teacher.isTeacher !== true
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Teacher account is not enabled.',

        })

      }


      if (
        teacher.accountStatus ===
        'Inactive'
      ) {

        return res.status(403).json({

          success: false,

          message:
            'Teacher account is inactive.',

        })

      }


      // ==================================
      // COURSE + BATCH AUTHORIZATION
      // ==================================

      const assigned =
        isTeacherAssigned(

          teacher,

          course,

          batchTime

        )


      if (!assigned) {

        return res.status(403).json({

          success: false,

          message:
            'This course or batch is not assigned to you.',

        })

      }


      // ==================================
      // MATERIAL TYPE
      // ==================================

      const allowedTypes = [

        'PDF',

        'Document',

        'Presentation',

        'Video',

        'Link',

        'Other',

      ]


      const finalType =
        materialType ||
        'PDF'


      if (
        !allowedTypes.includes(
          finalType
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid material type.',

        })

      }


      // ==================================
      // LINK MATERIAL
      // ==================================

      if (
        finalType === 'Link'
      ) {

        if (
          !externalLink?.trim()
        ) {

          return res.status(400).json({

            success: false,

            message:
              'External link is required for link materials.',

          })

        }

      }


      // ==================================
      // FILE MATERIAL
      // ==================================

      if (
        finalType !== 'Link' &&
        !req.file
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Please select a file to upload.',

        })

      }


      // ==================================
      // FILE DATA
      // ==================================

      let fileUrl = ''

      let fileName = ''


      if (req.file) {

        fileUrl =
          req.file.path ||
          req.file.secure_url ||
          ''

        fileName =
          req.file.originalname ||
          req.file.filename ||
          ''

      }


      // ==================================
      // CREATE MATERIAL
      // ==================================

      const material =
        await StudyMaterial.create({

          title:
            title.trim(),

          subject:
            subject?.trim() || '',

          course:
            course.trim(),

          batchTime:
            batchTime.trim(),

          description:
            description?.trim() || '',

          materialType:
            finalType,

          fileUrl,

          fileName,

          externalLink:
            externalLink?.trim() || '',

          teacherId:
            teacher._id,

          status:
            'Active',

        })


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createStudyMaterialNotifications(

        material.course,

        material.batchTime,

        'New Study Material',

        `${material.title} has been added for your class.`,

        material._id

      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(201).json({

        success: true,

        message:
          'Study material uploaded successfully.',

        material,

      })

    }

    catch (error) {

      console.log(

        'Create Study Material Error:',
        error

      )


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


// ======================================
// UPDATE STUDY MATERIAL
// ======================================
//
// PUT /api/teacher/materials/:id
//
// New file optional.
// ======================================

router.put(

  '/teacher/materials/:id',

  teacherAuth,

  upload.single('file'),

  async (req, res) => {

    try {

      const material =
        await StudyMaterial.findById(
          req.params.id
        )


      if (!material) {

        return res.status(404).json({

          success: false,

          message:
            'Study material not found.',

        })

      }


      // ==================================
      // OWNER CHECK
      // ==================================

      if (

        material.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to modify this material.',

        })

      }


      // ==================================
      // REQUEST DATA
      // ==================================

      const {

        title,

        subject,

        course,

        batchTime,

        description,

        materialType,

        externalLink,

        status,

      } = req.body


      // ==================================
      // BASIC VALIDATION
      // ==================================

      if (
        !title ||
        !course ||
        !batchTime
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Title, course and batch are required.',

        })

      }


      // ==================================
      // GET TEACHER
      // ==================================

      const teacher =
        await Faculty.findById(
          req.teacher.id
        )
        .populate(
          'assignedClasses.courseId'
        )


      if (!teacher) {

        return res.status(404).json({

          success: false,

          message:
            'Teacher not found.',

        })

      }


      // ==================================
      // COURSE + BATCH CHECK
      // ==================================

      const assigned =
        isTeacherAssigned(

          teacher,

          course,

          batchTime

        )


      if (!assigned) {

        return res.status(403).json({

          success: false,

          message:
            'This course or batch is not assigned to you.',

        })

      }


      // ==================================
      // MATERIAL TYPE
      // ==================================

      const finalType =
        materialType ||
        material.materialType


      const allowedTypes = [

        'PDF',

        'Document',

        'Presentation',

        'Video',

        'Link',

        'Other',

      ]


      if (
        !allowedTypes.includes(
          finalType
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Invalid material type.',

        })

      }


      // ==================================
      // LINK VALIDATION
      // ==================================

      if (
        finalType === 'Link' &&
        !externalLink?.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            'External link is required for link materials.',

        })

      }


      // ==================================
      // UPDATE BASIC DATA
      // ==================================

      material.title =
        title.trim()

      material.subject =
        subject?.trim() || ''

      material.course =
        course.trim()

      material.batchTime =
        batchTime.trim()

      material.description =
        description?.trim() || ''

      material.materialType =
        finalType

      material.externalLink =
        externalLink?.trim() || ''


      // ==================================
      // NEW FILE
      // ==================================

      if (req.file) {

        material.fileUrl =
          req.file.path ||
          req.file.secure_url ||
          ''

        material.fileName =
          req.file.originalname ||
          req.file.filename ||
          ''

      }


      // ==================================
      // LINK MATERIAL
      // ==================================

      if (
        finalType === 'Link'
      ) {

        material.fileUrl = ''

        material.fileName = ''

      }


      // ==================================
      // STATUS
      // ==================================

      if (status) {

        material.status =
          status

      }


      await material.save()


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createStudyMaterialNotifications(

        material.course,

        material.batchTime,

        'Study Material Updated',

        `${material.title} has been updated.`,

        material._id

      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Study material updated successfully.',

        material,

      })

    }

    catch (error) {

      console.log(

        'Update Study Material Error:',
        error

      )


      return res.status(500).json({

        success: false,

        message:
          error.message ||
          'Server Error',

      })

    }

  }

)


// ======================================
// DELETE STUDY MATERIAL
// ======================================
//
// DELETE /api/teacher/materials/:id
// ======================================

router.delete(

  '/teacher/materials/:id',

  teacherAuth,

  async (req, res) => {

    try {

      const material =
        await StudyMaterial.findById(
          req.params.id
        )


      if (!material) {

        return res.status(404).json({

          success: false,

          message:
            'Study material not found.',

        })

      }


      // ==================================
      // OWNER CHECK
      // ==================================

      if (

        material.teacherId.toString() !==
        req.teacher.id.toString()

      ) {

        return res.status(403).json({

          success: false,

          message:
            'You are not authorized to delete this material.',

        })

      }


      // ==================================
      // SAVE DATA BEFORE DELETE
      // ==================================

      const materialCourse =
        material.course

      const materialBatchTime =
        material.batchTime

      const materialTitle =
        material.title

      const materialId =
        material._id


      // ==================================
      // DELETE DATABASE RECORD
      // ==================================

      await StudyMaterial.findByIdAndDelete(

        req.params.id

      )


      // ==================================
      // STUDENT NOTIFICATION
      // ==================================

      await createStudyMaterialNotifications(

        materialCourse,

        materialBatchTime,

        'Study Material Removed',

        `${materialTitle} has been removed.`,

        materialId

      )


      // ==================================
      // RESPONSE
      // ==================================

      return res.status(200).json({

        success: true,

        message:
          'Study material deleted successfully.',

      })

    }

    catch (error) {

      console.log(

        'Delete Study Material Error:',
        error

      )


      return res.status(500).json({

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