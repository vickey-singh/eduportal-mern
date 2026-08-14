import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentAssignments() {

  // ======================================
  // ASSIGNMENTS
  // ======================================

  const [assignments, setAssignments] =
    useState([])


  // ======================================
  // COURSE
  // ======================================

  const [course, setCourse] =
    useState('')


  // ======================================
  // BATCH
  // ======================================

  const [batchTime, setBatchTime] =
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
  // FETCH ASSIGNMENTS
  // ======================================

  useEffect(() => {

    const fetchAssignments =
      async () => {

        try {

          setLoading(true)

          setError('')


          // ==================================
          // GET TOKEN
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

              `${API_URL}/student/assignments`,

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

            setAssignments(

              response.data.assignments ||

              []

            )


            setCourse(

              response.data.course ||

              ''

            )


            setBatchTime(

              response.data.batchTime ||

              ''

            )

          }

          else {

            setError(

              response.data.message ||

              'Unable to load assignments.'

            )

          }

        }

        catch (error) {

          console.log(

            'Student Assignments Error:',

            error

          )


          setError(

            error?.response?.data?.message ||

            'Unable to load assignments.'

          )

        }

        finally {

          setLoading(false)

        }

      }


    fetchAssignments()

  }, [])


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 text-center">


            <div
              style={{
                fontSize: '48px',
              }}
            >

              📖

            </div>


            <h5 className="fw-bold mt-3">

              Assignments

            </h5>


            <p className="text-muted mb-4">

              Your assignments available here.

            </p>


            <div>

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


            <div
              style={{
                fontSize: '48px',
              }}
            >

              📖

            </div>


            <h5 className="fw-bold mt-3">

              Assignments

            </h5>


            <p className="text-muted mb-4">

              Your assignments available here.

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
          MAIN CARD
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          {/* ==================================
              ICON + TITLE
          ================================== */}

          <div className="text-center">

            <div
              style={{
                fontSize: '48px',
              }}
            >

              📖

            </div>


            <h5 className="fw-bold mt-3">

              Assignments

            </h5>


            <p className="text-muted mb-4">

              Your assignments available here.

            </p>

          </div>


          {/* ==================================
              COURSE + BATCH
          ================================== */}

          <div className="row g-3 mb-4">


            <div className="col-md-6">

              <small className="text-muted">

                Course

              </small>

              <div className="fw-semibold">

                {
                  course ||
                  '-'
                }

              </div>

            </div>


            <div className="col-md-6">

              <small className="text-muted">

                Batch Time

              </small>

              <div className="fw-semibold">

                {
                  batchTime ||
                  '-'
                }

              </div>

            </div>


          </div>


          {/* ==================================
              NO ASSIGNMENTS
          ================================== */}

          {assignments.length === 0 ? (

            <div
              className="alert alert-info text-center mb-0"
            >

              No assignments are available
              for your course and batch yet.

            </div>

          ) : (


            /* ==================================
                ASSIGNMENT LIST
            ================================== */

            <div>

              {assignments.map(

                (assignment) => (

                  <div

                    key={
                      assignment._id
                    }

                    className="border rounded p-4 mb-3"

                  >


                    {/* ==============================
                        TITLE
                    ============================== */}

                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">

                      <div>

                        <h6 className="fw-bold mb-1">

                          {
                            assignment.title ||
                            '-'
                          }

                        </h6>


                        {assignment.subject && (

                          <small className="text-muted">

                            Subject: {' '}

                            {
                              assignment.subject
                            }

                          </small>

                        )}

                      </div>


                      <span
                        className={
                          assignment.status ===
                          'Active'

                            ? 'badge text-bg-success'

                            : 'badge text-bg-secondary'
                        }
                      >

                        {
                          assignment.status ||
                          '-'
                        }

                      </span>


                    </div>


                    {/* ==============================
                        DESCRIPTION
                    ============================== */}

                    {assignment.description && (

                      <div className="mb-3">

                        <small className="text-muted">

                          Description

                        </small>

                        <p className="mb-0 mt-1">

                          {
                            assignment.description
                          }

                        </p>

                      </div>

                    )}


                    {/* ==============================
                        INFORMATION
                    ============================== */}

                    <div className="row g-3">


                      {/* ASSIGNED DATE */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Assigned Date

                        </small>

                        <div className="fw-semibold">

                          {
                            assignment.assignedDate ||
                            '-'
                          }

                        </div>

                      </div>


                      {/* DUE DATE */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Due Date

                        </small>

                        <div className="fw-semibold">

                          {
                            assignment.dueDate ||
                            '-'
                          }

                        </div>

                      </div>


                      {/* TEACHER */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Teacher

                        </small>

                        <div className="fw-semibold">

                          {
                            assignment.teacherName ||
                            '-'
                          }

                        </div>

                      </div>


                    </div>


                    {/* ==============================
                        ATTACHMENT
                    ============================== */}

                    {assignment.attachment && (

                      <div className="mt-4">

                        <a

                          href={
                            assignment.attachment
                          }

                          target="_blank"

                          rel="noreferrer"

                          className="btn btn-outline-primary"

                        >

                          📎 {' '}

                          {
                            assignment.attachmentName ||
                            'View Attachment'
                          }

                        </a>

                      </div>

                    )}


                  </div>

                )

              )}

            </div>

          )}


        </div>

      </div>


    </div>

  )

}


export default StudentAssignments