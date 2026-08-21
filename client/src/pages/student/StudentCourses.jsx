import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentCourses() {

  // ======================================
  // COURSE
  // ======================================

  const [course, setCourse] =
    useState(null)


  // ======================================
  // ADMISSION DATE
  // ======================================

  const [admissionDate, setAdmissionDate] =
    useState('')


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  // ======================================
  // ERROR
  // ======================================

  const [error, setError] =
    useState('')


  // ======================================
  // FETCH COURSE
  // ======================================

  useEffect(() => {

    const fetchCourse =
      async () => {

        try {

          setLoading(true)

          setError('')


          // ==================================
          // GET STUDENT TOKEN
          // ==================================

          const token =
            localStorage.getItem(
              'studentToken'
            )


          if (!token) {

            setError(
              'Student authentication required.'
            )

            return

          }


          // ==================================
          // API REQUEST
          // ==================================

          const response =
            await axios.get(

              `${API_URL}/student/courses`,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },

              }

            )


          // ==================================
          // SUCCESS
          // ==================================

          if (
            response.data.success
          ) {

            setCourse(
              response.data.course
            )


            // ==================================
            // ADMISSION DATE
            // ==================================

            setAdmissionDate(

              response.data.admissionDate ||
              ''

            )

          }

          else {

            setError(

              response.data.message ||

              'Unable to load course information.'

            )

          }

        }

        catch (error) {

          console.log(
            'Student Courses Error:',
            error
          )


          setError(

            error?.response?.data?.message ||

            'Unable to load course information.'

          )

        }

        finally {

          setLoading(false)

        }

      }


    fetchCourse()

  }, [])


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 text-center">


            {/* ==================================
                ICON
            ================================== */}

            <div
              style={{
                fontSize: '48px',
              }}
            >

              📚

            </div>


            <h5 className="fw-bold mt-3">

              My Courses / Classes

            </h5>


            <p className="text-muted mb-0">

              Your courses and classes available here.

            </p>


            <div className="mt-4">

              <div
                className="spinner-border text-primary"
                role="status"
              >

                <span className="visually-hidden">

                  Loading...

                </span>

              </div>

            </div>


          </div>

        </div>

      </div>

    )

  }


  // ======================================
  // ERROR
  // ======================================

  if (error) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 text-center">


            {/* ==================================
                ICON
            ================================== */}

            <div
              style={{
                fontSize: '48px',
              }}
            >

              📚

            </div>


            <h5 className="fw-bold mt-3">

              My Courses / Classes

            </h5>


            <p className="text-muted mb-4">

              Your courses and classes available here.

            </p>


            <div
              className="alert alert-danger mb-0"
              role="alert"
            >

              {error}

            </div>


          </div>

        </div>

      </div>

    )

  }


  return (

    <div>


      {/* ==================================
          COURSE CARD
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          {/* ==================================
              ICON
          ================================== */}

          <div className="text-center">

            <div
              style={{
                fontSize: '48px',
              }}
            >

              📚

            </div>


            <h5 className="fw-bold mt-3">

              My Courses / Classes

            </h5>


            <p className="text-muted mb-4">

              Your courses and classes available here.

            </p>

          </div>


          {/* ==================================
              COURSE INFORMATION
          ================================== */}

          <div className="row g-4">


            {/* ==================================
                COURSE NAME
            ================================== */}

            <div className="col-md-6">

              <small className="text-muted">

                Course Name

              </small>

              <div className="fw-semibold">

                {
                  course?.courseName ||
                  '-'
                }

              </div>

            </div>


            {/* ==================================
                COURSE CODE
            ================================== */}

            <div className="col-md-6">

              <small className="text-muted">

                Course Code

              </small>

              <div className="fw-semibold">

                {
                  course?.courseCode ||
                  '-'
                }

              </div>

            </div>


            {/* ==================================
                DURATION
            ================================== */}

            <div className="col-md-6">

              <small className="text-muted">

                Duration

              </small>

              <div className="fw-semibold">

                {
                  course?.duration ||
                  '-'
                }

              </div>

            </div>


            {/* ==================================
                BATCH TIME
            ================================== */}

            <div className="col-md-6">

              <small className="text-muted">

                Batch Time

              </small>

              <div className="fw-semibold">

                {
                  course?.batchTime ||
                  '-'
                }

              </div>

            </div>


            {/* ==================================
                ADMISSION DATE
            ================================== */}

            <div className="col-md-6">

              <small className="text-muted">

                Admission Date

              </small>

              <div className="fw-semibold">

                {
                  admissionDate ||
                  '-'
                }

              </div>

            </div>


            {/* ==================================
                COURSE STATUS
            ================================== */}

            <div className="col-md-6">

              <small className="text-muted">

                Course Status

              </small>

              <div className="fw-semibold">

                {
                  course?.status ||
                  '-'
                }

              </div>

            </div>


          </div>


          {/* ==================================
              DESCRIPTION
          ================================== */}

          <div className="mt-4">

            <small className="text-muted">

              Course Description

            </small>

            <p className="mb-0 mt-1">

              {
                course?.description ||

                'No course description available.'

              }

            </p>

          </div>


        </div>

      </div>


    </div>

  )

}


export default StudentCourses