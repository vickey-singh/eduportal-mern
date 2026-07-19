const multer = require('multer')
const fs = require('fs')
const path = require('path')

// Absolute uploads path
const uploadDir = path.join(__dirname, '..', 'uploads')

// Create uploads folder if missing
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, uploadDir)

  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() + '-' + file.originalname
    )

  },

})

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
  ]

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true)

  } else {

    cb(new Error('Only Images Allowed'), false)

  }

}

module.exports = multer({
  storage,
  fileFilter,
})