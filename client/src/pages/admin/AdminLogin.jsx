import { useState } from 'react'

import axios from 'axios'

import { useNavigate } from 'react-router-dom'

import '../../assets/styles/admin-login.css'

function AdminLogin() {

  // ======================================
  // NAVIGATE
  // ======================================

  const navigate = useNavigate()

  // ======================================
  // STATE
  // ======================================

  const [formData, setFormData]
    = useState({

      email: '',

      password: '',

    })

  // ======================================
  // HANDLE INPUT CHANGE
  // ======================================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    })

  }

  // ======================================
  // HANDLE LOGIN
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      try {

        const response =
          await axios.post(

            'https://eduportal-backend-m5t1.onrender.com/api/admin/login',

            formData

          )

        // Save Token
        localStorage.setItem(

          'token',

          response.data.token

        )

        alert(
          response.data.message
        )

        // Redirect Dashboard
        navigate(
          '/admin/dashboard'
        )

      } catch (error) {

        console.log(error)

        alert('Invalid Credentials')

      }

    }

  return (

    <section className="admin-login-page">

      <div className="admin-login-card">

        {/* ====================================== */}
        {/* LOGO / TITLE */}
        {/* ====================================== */}

        <div className="text-center mb-4">

          <h1 className="admin-brand">

            <span className="edu">
              Prerna
            </span>{' '}

            <span className="portal">
              Institute
            </span>

          </h1>

          <p className="text-muted">
            Admin Dashboard Login
          </p>

        </div>

        {/* ====================================== */}
        {/* LOGIN FORM */}
        {/* ====================================== */}

        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="mb-3">

            <label className="form-label">
              Email Address
            </label>

            <input
              type="email"
              className="form-control"
              placeholder="Enter admin email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

          </div>

          {/* Password */}
          <div className="mb-4">

            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn admin-login-btn w-100"
          >

            Login

          </button>

        </form>

      </div>

    </section>

  )

}

export default AdminLogin