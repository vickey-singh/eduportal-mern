const jwt = require('jsonwebtoken')


// ======================================
// ADMIN AUTH MIDDLEWARE
// ======================================

const adminAuth = (
  req,
  res,
  next
) => {

  try {

    // ==================================
    // GET AUTHORIZATION HEADER
    // ==================================

    const authHeader =
      req.headers.authorization


    if (!authHeader) {

      return res.status(401).json({

        success: false,

        message:
          'Authorization token required.',

      })

    }


    // ==================================
    // CHECK BEARER
    // ==================================

    if (
      !authHeader.startsWith('Bearer ')
    ) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid authorization format.',

      })

    }


    // ==================================
    // EXTRACT TOKEN
    // ==================================

    const token =
      authHeader.split(' ')[1]


    if (!token) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid token.',

      })

    }


    // ==================================
    // VERIFY TOKEN
    // ==================================

    const decoded =
      jwt.verify(

        token,

        'Prerna Institute Of Excellence_secret_key'

      )


    // ==================================
    // STORE ADMIN ID
    // ==================================

    req.admin = {

      id:
        decoded.id,

    }


    // ==================================
    // NEXT
    // ==================================

    next()

  }

  catch (error) {

    console.log(
      'Admin Auth Error:',
      error
    )


    return res.status(401).json({

      success: false,

      message:
        'Invalid or expired admin token.',

    })

  }

}


// ======================================
// EXPORT
// ======================================

module.exports =
  adminAuth