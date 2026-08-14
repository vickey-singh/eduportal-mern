import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherLogin() {

  // ======================================
  // NAVIGATION
  // ======================================

  const navigate =
    useNavigate()


  // ======================================
  // FORM STATE
  // ======================================

  const [teacherId, setTeacherId] =
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
        !teacherId.trim() ||
        !password
      ) {

        setError(
          'Please enter Teacher ID and password.'
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

            `${API_URL}/teacher/login`,

            {

              teacherId:
                teacherId.trim(),

              password,

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

            'teacherToken',

            response.data.token

          )


          // =================================
          // SAVE TEACHER DATA
          // =================================

          localStorage.setItem(

            'teacher',

            JSON.stringify(
              response.data.teacher
            )

          )


          // =================================
          // REDIRECT
          // =================================

          navigate(
            '/teacher/dashboard'
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
          'Teacher Login Error:',
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


            {/* ==================================
                TEACHER ICON
            ================================== */}

            <div

              style={{

                fontSize: '48px',

              }}

            >

              👨‍🏫

            </div>


            <h2 className="fw-bold mt-2">

              Teacher Portal

            </h2>


            <p className="text-muted mb-0">

              Login to access your Teacher Portal

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
                TEACHER ID
            ================================== */}

            <div className="mb-3">

              <label className="form-label">

                Teacher ID

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter Teacher ID"

                value={
                  teacherId
                }

                onChange={(e) =>
                  setTeacherId(
                    e.target.value
                  )
                }

                autoComplete="username"

                required

              />

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

                required

              />

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


export default TeacherLogin