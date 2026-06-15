const multer = require('multer')


// ======================================
// STORAGE CONFIG
// ======================================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, 'uploads')

  },

  filename: (req, file, cb) => {

    cb(

      null,

      Date.now() +
      '-' +
      file.originalname

    )

  },

})


// ======================================
// FILE FILTER
// ======================================

const fileFilter =
  (req, file, cb) => {

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

      cb(null, true)

    } else {

      cb(
        new Error(
          'Only Images Allowed'
        ),
        false
      )

    }

  }


// ======================================
// MULTER CONFIG
// ======================================

const upload = multer({

  storage,

  fileFilter,

})

module.exports = upload