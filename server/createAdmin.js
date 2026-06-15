const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

require('dotenv').config()

const Admin = require('./models/Admin')


// ======================================
// CONNECT DATABASE
// ======================================

mongoose.connect(process.env.MONGO_URI)


// ======================================
// CREATE ADMIN
// ======================================

const createAdmin = async () => {

  try {

    // Encrypt Password
    const hashedPassword =
      await bcrypt.hash(
        'admin123',
        10
      )

    // Create Admin
    const admin = new Admin({

      email: 'admin@gmail.com',

      password: hashedPassword,

    })

    await admin.save()

    console.log(
      'Admin Created Successfully ✅'
    )

    process.exit()

  } catch (error) {

    console.log(error)

    process.exit(1)

  }

}

createAdmin()