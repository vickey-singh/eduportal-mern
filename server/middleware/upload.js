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
        'eduportal',

      allowed_formats: [
        'jpg',
        'jpeg',
        'png',
        'webp',
      ],

      transformation: [
        {
          quality: 'auto',
          fetch_format: 'auto',
        },
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

    'image/jpeg',

    'image/png',

    'image/jpg',

    'image/webp',

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
        'Only Images Allowed'
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
        5 * 1024 * 1024,

    },

  })


module.exports =
  upload