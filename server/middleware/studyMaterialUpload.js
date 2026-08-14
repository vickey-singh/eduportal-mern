const multer = require('multer')

const {
  CloudinaryStorage,
} = require('multer-storage-cloudinary')

const {
  v2: cloudinary,
} = require('cloudinary')


// ======================================
// CLOUDINARY CONFIGURATION
// ======================================

cloudinary.config({

  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

})


// ======================================
// CLOUDINARY STORAGE
// ======================================

const storage =
  new CloudinaryStorage({

    cloudinary,

    params: {

      folder:
        'eduportal/study-materials',

      resource_type:
        'raw',

      allowed_formats: [

        'pdf',

        'doc',

        'docx',

        'ppt',

        'pptx',

      ],

    },

  })


// ======================================
// FILE FILTER
// ======================================

const fileFilter = (
  req,
  file,
  cb
) => {

  const allowedTypes = [

    'application/pdf',

    'application/msword',

    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    'application/vnd.ms-powerpoint',

    'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  ]


  if (

    allowedTypes.includes(
      file.mimetype
    )

  ) {

    cb(
      null,
      true
    )

  }

  else {

    cb(

      new Error(

        'Only PDF, DOC, DOCX, PPT and PPTX files are allowed.'

      ),

      false

    )

  }

}


// ======================================
// MULTER
// ======================================

const upload =
  multer({

    storage,

    fileFilter,

    limits: {

      fileSize:
        20 * 1024 * 1024,

    },

  })


module.exports =
  upload