const multer = require('multer')


// ======================================
// STORAGE
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

      'application/pdf',

      'application/msword',

      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    ]

    if (

      allowedTypes.includes(
        file.mimetype
      )

    ) {

      cb(null, true)

    }

    else {

      cb(

        new Error(
          'Only PDF, DOC and DOCX files allowed'
        ),

        false

      )

    }

  }


// ======================================
// MULTER
// ======================================

const upload = multer({

  storage,

  fileFilter,

})

module.exports = upload