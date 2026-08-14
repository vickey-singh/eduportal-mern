import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherClasses() {

  // ======================================
  // TEACHER DATA
  // ======================================

  const [teacher, setTeacher] =
    useState(null)


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
  // FETCH TEACHER
  // ======================================

  const fetchTeacher =
    async () => {

      try {

        setLoading(true)

        setError('')


        const token =
          localStorage.getItem(
            'teacherToken'
          )


        // ==================================
        // TOKEN CHECK
        // ==================================

        if (!token) {

          setError(
            'Teacher authentication token not found.'
          )

          return

        }


        // ==================================
        // API REQUEST
        // ==================================

        const response =
          await axios.get(

            `${API_URL}/teacher/me`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        // ==================================
        // RESPONSE
        // ==================================

        if (
          response.data.success
        ) {

          setTeacher(
            response.data.teacher
          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load classes.'

          )

        }

      }

      catch (error) {

        console.log(
          'Teacher Classes Error:',
          error
        )


        setError(

          error?.response?.data?.message ||

          'Unable to load classes.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // LOAD
  // ======================================

  useEffect(() => {

    fetchTeacher()

  }, [])


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div className="text-center py-5">

        <div
          className="spinner-border"
          role="status"
        >

          <span className="visually-hidden">

            Loading...

          </span>

        </div>


        <p className="text-muted mt-3">

          Loading your classes...

        </p>

      </div>

    )

  }


  // ======================================
  // ERROR
  // ======================================

  if (error) {

    return (

      <div className="alert alert-danger">

        <strong>
          Error:
        </strong>

        {' '}

        {error}

      </div>

    )

  }


  // ======================================
  // ASSIGNED CLASSES
  // ======================================

  const assignedClasses =
    teacher?.assignedClasses || []


  return (

    <div>


      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          My Classes

        </h2>


        <p className="text-muted mb-0">

          Courses and batches assigned to you
          by Admin.

        </p>

      </div>


      {/* ======================================
          TEACHER INFO
      ====================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row align-items-center">


            <div className="col-md-8">

              <h5 className="fw-bold mb-1">

                {
                  teacher?.name ||
                  'Teacher'
                }

              </h5>


              <p className="text-muted mb-0">

                {
                  teacher?.designation ||
                  '-'
                }

                {' • '}

                {
                  teacher?.subject ||
                  '-'
                }

              </p>

            </div>


            <div className="col-md-4 text-md-end mt-3 mt-md-0">

              <span className="badge bg-secondary fs-6">

                Teacher ID:{' '}

                {
                  teacher?.teacherId ||
                  '-'
                }

              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          NO CLASSES
      ====================================== */}

      {assignedClasses.length === 0 ? (

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <div
              style={{
                fontSize: '42px',
              }}
            >

              📚

            </div>


            <h5 className="fw-bold mt-3">

              No Classes Assigned

            </h5>


            <p className="text-muted mb-0">

              Admin has not assigned any course
              or batch to you yet.

            </p>

          </div>

        </div>

      ) : (

        <>

          {/* ==================================
              SUMMARY
          ================================== */}

          <div className="row g-4 mb-4">

            <div className="col-md-4">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <small className="text-muted">

                    Assigned Classes

                  </small>


                  <h3 className="fw-bold mt-2 mb-0">

                    {
                      assignedClasses.length
                    }

                  </h3>

                </div>

              </div>

            </div>


            <div className="col-md-4">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <small className="text-muted">

                    Subject

                  </small>


                  <h5 className="fw-bold mt-2 mb-0">

                    {
                      teacher?.subject ||
                      '-'
                    }

                  </h5>

                </div>

              </div>

            </div>


            <div className="col-md-4">

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <small className="text-muted">

                    Account Status

                  </small>


                  <div className="mt-2">

                    <span className="badge bg-success">

                      {
                        teacher?.accountStatus ||
                        'Active'
                      }

                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================
              CLASS CARDS
          ================================== */}

          <div className="row g-4">

            {assignedClasses.map(

              (assignment, index) => {

                const course =
                  assignment.courseId


                return (

                  <div

                    className="col-lg-6"

                    key={index}

                  >

                    <div className="card border-0 shadow-sm h-100">

                      <div className="card-body p-4">


                        {/* COURSE HEADER */}

                        <div className="d-flex justify-content-between align-items-start">

                          <div>

                            <h5 className="fw-bold mb-1">

                              {
                                course?.courseName ||
                                'Course Not Found'
                              }

                            </h5>


                            <span className="text-muted">

                              Course Code:{' '}

                              <strong>

                                {
                                  course?.courseCode ||
                                  '-'
                                }

                              </strong>

                            </span>

                          </div>


                          <span className="badge bg-primary">

                            Class {index + 1}

                          </span>

                        </div>


                        <hr />


                        {/* COURSE DETAILS */}

                        <div className="row">


                          {/* DURATION */}

                          <div className="col-sm-6 mb-3">

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


                          {/* BATCH */}

                          <div className="col-sm-6 mb-3">

                            <small className="text-muted">

                              Batch Time

                            </small>


                            <div className="fw-semibold">

                              {
                                assignment.batchTime ||
                                '-'
                              }

                            </div>

                          </div>


                          {/* COURSE DESCRIPTION */}

                          <div className="col-12 mb-2">

                            <small className="text-muted">

                              Course Description

                            </small>


                            <p className="mb-0 mt-1">

                              {
                                course?.description ||
                                'No description available.'
                              }

                            </p>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                )

              }

            )}

          </div>

        </>

      )}

    </div>

  )

}


export default TeacherClasses