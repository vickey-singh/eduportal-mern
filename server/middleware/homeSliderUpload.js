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
        'eduportal/home-slider',

      resource_type:
        'auto',

      allowed_formats: [

        'jpg',

        'jpeg',

        'png',

        'webp',

        'mp4',

        'webm',

        'mov',

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

    // ==================================
    // IMAGES
    // ==================================

    'image/jpeg',

    'image/png',

    'image/jpg',

    'image/webp',


    // ==================================
    // VIDEOS
    // ==================================

    'video/mp4',

    'video/webm',

    'video/quicktime',

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
        'Only JPG, JPEG, PNG, WEBP, MP4, WEBM and MOV files are allowed'
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

      // 50 MB
      fileSize:
        50 * 1024 * 1024,

    },

  })


// ======================================
// EXPORT
// ======================================

module.exports =
  upload