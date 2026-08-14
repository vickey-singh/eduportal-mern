import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentAnnouncements() {

  // ======================================
  // ANNOUNCEMENTS
  // ======================================

  const [announcements, setAnnouncements] =
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
  // FETCH ANNOUNCEMENTS
  // ======================================

  useEffect(() => {

    const fetchAnnouncements =
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

              `${API_URL}/student/announcements`,

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

            setAnnouncements(

              response.data.announcements ||

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

              'Unable to load announcements.'

            )

          }

        }

        catch (error) {

          console.log(

            'Student Announcements Error:',

            error

          )


          setError(

            error?.response?.data?.message ||

            'Unable to load announcements.'

          )

        }

        finally {

          setLoading(false)

        }

      }


    fetchAnnouncements()

  }, [])


  // ======================================
  // PRIORITY
  // ======================================

  const getPriorityClass =
    (priority) => {

      if (
        priority === 'Urgent'
      ) {

        return 'badge text-bg-danger'

      }


      if (
        priority === 'Important'
      ) {

        return 'badge text-bg-warning'

      }


      return 'badge text-bg-secondary'

    }


  // ======================================
  // PRIORITY ICON
  // ======================================

  const getPriorityIcon =
    (priority) => {

      if (
        priority === 'Urgent'
      ) {

        return '🚨'

      }


      if (
        priority === 'Important'
      ) {

        return '⚠️'

      }


      return '📢'

    }


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

              📢

            </div>


            <h5 className="fw-bold mt-3">

              Announcements

            </h5>


            <p className="text-muted mb-4">

              Your announcements available here.

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

              📢

            </div>


            <h5 className="fw-bold mt-3">

              Announcements

            </h5>


            <p className="text-muted mb-4">

              Your announcements available here.

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

              📢

            </div>


            <h5 className="fw-bold mt-3">

              Announcements

            </h5>


            <p className="text-muted mb-4">

              Your announcements available here.

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
              NO ANNOUNCEMENTS
          ================================== */}

          {announcements.length === 0 ? (

            <div
              className="alert alert-info text-center mb-0"
            >

              No announcements are available
              for your course and batch yet.

            </div>

          ) : (


            /* ==================================
                ANNOUNCEMENT LIST
            ================================== */

            <div>

              {announcements.map(

                (announcement) => (

                  <div

                    key={
                      announcement._id
                    }

                    className="border rounded p-4 mb-3"

                  >


                    {/* ==============================
                        HEADER
                    ============================== */}

                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">

                      <div>

                        <h6 className="fw-bold mb-1">

                          {
                            getPriorityIcon(
                              announcement.priority
                            )
                          } {' '}

                          {
                            announcement.title ||
                            '-'
                          }

                        </h6>


                        <small className="text-muted">

                          {
                            announcement.course
                          }

                          {' • '}

                          {
                            announcement.batchTime
                          }

                        </small>

                      </div>


                      <span

                        className={
                          getPriorityClass(
                            announcement.priority
                          )
                        }

                      >

                        {
                          announcement.priority ||
                          'Normal'
                        }

                      </span>


                    </div>


                    {/* ==============================
                        MESSAGE
                    ============================== */}

                    <div className="mb-3">

                      <p className="mb-0">

                        {
                          announcement.message ||
                          '-'
                        }

                      </p>

                    </div>


                    {/* ==============================
                        INFORMATION
                    ============================== */}

                    <div className="row g-3">


                      {/* TEACHER */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Teacher

                        </small>

                        <div className="fw-semibold">

                          {
                            announcement.teacherId?.name ||
                            'Teacher'
                          }

                        </div>

                      </div>


                      {/* DATE */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Posted On

                        </small>

                        <div className="fw-semibold">

                          {
                            announcement.createdAt

                              ? new Date(
                                  announcement.createdAt
                                ).toLocaleDateString(
                                  'en-IN'
                                )

                              : '-'
                          }

                        </div>

                      </div>


                      {/* EXPIRY */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Valid Until

                        </small>

                        <div className="fw-semibold">

                          {
                            announcement.expiryDate ||
                            'No expiry'
                          }

                        </div>

                      </div>


                    </div>


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


export default StudentAnnouncements