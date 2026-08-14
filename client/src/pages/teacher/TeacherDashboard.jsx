import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherDashboard() {

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
  // GET LOGGED-IN TEACHER
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

          const teacherData =
            response.data.teacher


          setTeacher(
            teacherData
          )


          // =================================
          // UPDATE LOCAL STORAGE
          // =================================

          localStorage.setItem(

            'teacher',

            JSON.stringify(
              teacherData
            )

          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load teacher information.'

          )

        }

      }

      catch (error) {

        console.log(

          'Teacher Dashboard Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load teacher information.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // LOAD DATA
  // ======================================

  useEffect(() => {

    fetchTeacher()

  }, [])


  // ======================================
  // LOADING UI
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

          Loading teacher dashboard...

        </p>

      </div>

    )

  }


  // ======================================
  // ERROR UI
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
  // DASHBOARD
  // ======================================

  return (

    <div>


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-4">

        <h2 className="fw-bold">

          Teacher Dashboard

        </h2>


        <p className="text-muted mb-0">

          Welcome back,

          {' '}

          <strong>

            {
              teacher?.name ||
              'Teacher'
            }

          </strong>

        </p>

      </div>


      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className="row g-4 mb-4">


        {/* TEACHER ID */}

        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">

                Teacher ID

              </small>


              <h4 className="fw-bold mt-2 mb-0">

                {
                  teacher?.teacherId ||
                  '-'
                }

              </h4>

            </div>

          </div>

        </div>


        {/* DESIGNATION */}

        <div className="col-md-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <small className="text-muted">

                Designation

              </small>


              <h5 className="fw-bold mt-2 mb-0">

                {
                  teacher?.designation ||
                  '-'
                }

              </h5>

            </div>

          </div>

        </div>


        {/* SUBJECT */}

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

      </div>


      {/* ======================================
          ASSIGNED COURSES
      ====================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h5 className="fw-bold mb-1">

                My Assigned Classes

              </h5>


              <p className="text-muted mb-0">

                Courses and batches assigned by Admin.

              </p>

            </div>


            <span className="badge bg-secondary">

              {
                teacher?.assignedClasses?.length ||
                0
              }

              {' '}

              Class(s)

            </span>

          </div>


          {/* ==================================
              NO CLASSES
          ================================== */}

          {!teacher?.assignedClasses ||
          teacher.assignedClasses.length === 0 ? (

            <div className="text-center py-4">

              <p className="text-muted mb-0">

                No course or batch has been assigned
                to you yet.

              </p>

            </div>

          ) : (


            /* ==================================
               ASSIGNED CLASS TABLE
            ================================== */

            <div className="table-responsive">

              <table className="table table-bordered align-middle">

                <thead>

                  <tr>

                    <th>
                      Course
                    </th>

                    <th>
                      Course Code
                    </th>

                    <th>
                      Batch
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {teacher.assignedClasses.map(

                    (assignment, index) => {

                      const course =
                        assignment.courseId


                      return (

                        <tr
                          key={index}
                        >

                          <td>

                            {
                              course?.courseName ||
                              'Course Not Found'
                            }

                          </td>


                          <td>

                            {
                              course?.courseCode ||
                              '-'
                            }

                          </td>


                          <td>

                            {
                              assignment.batchTime ||
                              '-'
                            }

                          </td>

                        </tr>

                      )

                    }

                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* ======================================
          ACCOUNT INFORMATION
      ====================================== */}

      <div className="card border-0 shadow-sm mt-4">

        <div className="card-body">

          <h5 className="fw-bold mb-3">

            Account Information

          </h5>


          <div className="row">


            <div className="col-md-4 mb-3">

              <small className="text-muted">

                Name

              </small>


              <div className="fw-semibold">

                {
                  teacher?.name ||
                  '-'
                }

              </div>

            </div>


            <div className="col-md-4 mb-3">

              <small className="text-muted">

                Experience

              </small>


              <div className="fw-semibold">

                {
                  teacher?.experience ||
                  '-'
                }

              </div>

            </div>


            <div className="col-md-4 mb-3">

              <small className="text-muted">

                Account Status

              </small>


              <div>

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

    </div>

  )

}


export default TeacherDashboard