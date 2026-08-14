import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentLogin() {

  // ======================================
  // NAVIGATION
  // ======================================

  const navigate =
    useNavigate()


  // ======================================
  // FORM STATE
  // ======================================

  const [studentId, setStudentId] =
    useState('')

  const [password, setPassword] =
    useState('')


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(false)


  // ======================================
  // ERROR
  // ======================================

  const [error, setError] =
    useState('')


  // ======================================
  // HANDLE LOGIN
  // ======================================

  const handleLogin =
    async (e) => {

      e.preventDefault()

      setError('')


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !studentId.trim() ||
        !password.trim()
      ) {

        setError(
          'Please enter Student ID and password.'
        )

        return

      }


      try {

        setLoading(true)


        // ==================================
        // LOGIN API
        // ==================================

        const response =
          await axios.post(

            `${API_URL}/student/login`,

            {

              studentId:
                studentId.trim(),

              password:
                password.trim(),

            }

          )


        // ==================================
        // CHECK RESPONSE
        // ==================================

        if (
          response.data.success
        ) {

          // =================================
          // SAVE TOKEN
          // =================================

          localStorage.setItem(

            'studentToken',

            response.data.token

          )


          // =================================
          // SAVE STUDENT DATA
          // =================================

          localStorage.setItem(

            'student',

            JSON.stringify(
              response.data.student
            )

          )


          // =================================
          // REDIRECT
          // =================================

          navigate(
            '/student/dashboard'
          )

        }

        else {

          setError(

            response.data.message ||

            'Login failed.'

          )

        }

      }

      catch (error) {

        console.log(
          'Student Login Error:',
          error
        )


        setError(

          error?.response?.data?.message ||

          'Unable to login. Please try again.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  return (

    <div

      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"

    >

      <div

        className="card border-0 shadow-sm"

        style={{

          width: '100%',

          maxWidth: '420px',

        }}

      >

        <div className="card-body p-4 p-md-5">


          {/* ==================================
              HEADING
          ================================== */}

          <div className="text-center mb-4">

            <div
              style={{
                fontSize: '48px',
              }}
            >

              🎓

            </div>


            <h2 className="fw-bold mt-2">

              Student Portal

            </h2>


            <p className="text-muted mb-0">

              Login to access your Student Portal

            </p>

          </div>


          {/* ==================================
              ERROR
          ================================== */}

          {error && (

            <div

              className="alert alert-danger"

              role="alert"

            >

              {error}

            </div>

          )}


          {/* ==================================
              LOGIN FORM
          ================================== */}

          <form
            onSubmit={handleLogin}
          >


            {/* ==================================
                STUDENT ID
            ================================== */}

            <div className="mb-3">

              <label className="form-label">

                Student ID

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter Student ID"

                value={
                  studentId
                }

                onChange={(e) =>
                  setStudentId(
                    e.target.value
                  )
                }

                autoComplete="username"

                required

              />


              <small className="text-muted">

                Your Student ID is your Admission Number.

              </small>

            </div>


            {/* ==================================
                PASSWORD
            ================================== */}

            <div className="mb-3">

              <label className="form-label">

                Password

              </label>


              <input

                type="password"

                className="form-control"

                placeholder="Enter password"

                value={
                  password
                }

                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }

                autoComplete="current-password"

                inputMode="numeric"

                required

              />


              <small className="text-muted">

                Password is your Date of Birth
                in DDMMYYYY format.

              </small>

            </div>


            {/* ==================================
                FORGOT PASSWORD
            ================================== */}

            <div className="text-end mb-4">

              <small className="text-muted">

                Forgot password? Contact Admin.

              </small>

            </div>


            {/* ==================================
                LOGIN BUTTON
            ================================== */}

            <button

              type="submit"

              className="btn btn-primary w-100"

              disabled={
                loading
              }

            >

              {loading

                ? 'Logging in...'

                : 'Login'

              }

            </button>

          </form>

        </div>

      </div>

    </div>

  )

}


export default StudentLogin