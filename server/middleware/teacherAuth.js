const jwt = require('jsonwebtoken')


// ======================================
// TEACHER AUTH MIDDLEWARE
// ======================================

const teacherAuth = (
  req,
  res,
  next
) => {

  try {

    // ======================================
    // GET AUTHORIZATION HEADER
    // ======================================

    const authHeader =
      req.headers.authorization


    if (!authHeader) {

      return res.status(401).json({

        success: false,

        message:
          'Authorization token is required.',

      })

    }


    // ======================================
    // CHECK BEARER TOKEN
    // ======================================

    if (
      !authHeader.startsWith(
        'Bearer '
      )
    ) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid authorization format.',

      })

    }


    // ======================================
    // EXTRACT TOKEN
    // ======================================

    const token =
      authHeader.split(' ')[1]


    if (!token) {

      return res.status(401).json({

        success: false,

        message:
          'Authentication token is missing.',

      })

    }


    // ======================================
    // VERIFY JWT
    // ======================================

    const decoded =
      jwt.verify(

        token,

        'Prerna Institute Of Excellence_secret_key'

      )


    // ======================================
    // CHECK ROLE
    // ======================================

    if (
      decoded.role !== 'teacher'
    ) {

      return res.status(403).json({

        success: false,

        message:
          'Teacher access required.',

      })

    }


    // ======================================
    // SAVE TEACHER DATA IN REQUEST
    // ======================================

    req.teacher = decoded


    // ======================================
    // CONTINUE
    // ======================================

    next()

  }

  catch (error) {

    console.log(
      'Teacher Auth Error:',
      error
    )


    return res.status(401).json({

      success: false,

      message:
        'Invalid or expired teacher token.',

    })

  }

}


module.exports =
  teacherAuth