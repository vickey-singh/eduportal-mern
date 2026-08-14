import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentTimetable() {

  // ======================================
  // TIMETABLE
  // ======================================

  const [timetable, setTimetable] =
    useState([])


  const [course, setCourse] =
    useState('')


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
  // FETCH TIMETABLE
  // ======================================

  useEffect(() => {

    const fetchTimetable =
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

              `${API_URL}/student/timetable`,

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

            setTimetable(
              response.data.timetable ||
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

              'Unable to load timetable.'

            )

          }

        }

        catch (error) {

          console.log(
            'Student Timetable Error:',
            error
          )


          setError(

            error?.response?.data?.message ||

            'Unable to load timetable.'

          )

        }

        finally {

          setLoading(false)

        }

      }


    fetchTimetable()

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

              🗓️

            </div>


            <h5 className="fw-bold mt-3">

              Timetable

            </h5>


            <p className="text-muted mb-4">

              Your timetable available here.

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


            {/* ==================================
                ICON
            ================================== */}

            <div
              style={{
                fontSize: '48px',
              }}
            >

              🗓️

            </div>


            <h5 className="fw-bold mt-3">

              Timetable

            </h5>


            <p className="text-muted mb-4">

              Your timetable available here.

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
          TIMETABLE CARD
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

              🗓️

            </div>


            <h5 className="fw-bold mt-3">

              Timetable

            </h5>


            <p className="text-muted mb-4">

              Your timetable available here.

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
              NO TIMETABLE
          ================================== */}

          {timetable.length === 0 ? (

            <div
              className="alert alert-info text-center mb-0"
            >

              No timetable has been provided
              for your course and batch yet.

            </div>

          ) : (


            /* ==================================
                TIMETABLE LIST
            ================================== */

            <div className="table-responsive">

              <table className="table table-bordered align-middle">

                <thead className="table-light">

                  <tr>

                    <th>
                      Day
                    </th>

                    <th>
                      Subject
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Room
                    </th>

                    <th>
                      Teacher
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {timetable.map(

                    (item) => (

                      <tr
                        key={
                          item._id
                        }
                      >

                        <td>

                          {
                            item.day ||
                            '-'
                          }

                        </td>


                        <td>

                          {
                            item.subject ||
                            '-'
                          }

                        </td>


                        <td>

                          {
                            item.startTime ||
                            '-'
                          }

                          {' - '}

                          {
                            item.endTime ||
                            '-'
                          }

                        </td>


                        <td>

                          {
                            item.room ||
                            '-'
                          }

                        </td>


                        <td>

                          {
                            item.teacherId?.name ||
                            '-'
                          }

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            </div>

          )}


        </div>

      </div>


    </div>

  )

}


export default StudentTimetable