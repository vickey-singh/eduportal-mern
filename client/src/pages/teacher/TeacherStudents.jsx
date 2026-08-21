import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherStudents() {

  // ======================================
  // STUDENTS
  // ======================================

  const [students, setStudents] =
    useState([])


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
  // SEARCH
  // ======================================

  const [search, setSearch] =
    useState('')


  // ======================================
  // FETCH STUDENTS
  // ======================================

  const fetchStudents =
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

            `${API_URL}/teacher/students`,

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

          setStudents(
            response.data.students || []
          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load students.'

          )

        }

      }

      catch (error) {

        console.log(

          'Teacher Students Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load students.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // LOAD STUDENTS
  // ======================================

  useEffect(() => {

    fetchStudents()

  }, [])


  // ======================================
  // FILTER STUDENTS
  // ======================================

  const filteredStudents =
    useMemo(() => {

      const value =
        search
          .trim()
          .toLowerCase()


      if (!value) {

        return students

      }


      return students.filter(
        (student) => {

          return (

            student.name
              ?.toLowerCase()
              .includes(value)

            ||

            student.admissionNumber
              ?.toLowerCase()
              .includes(value)

            ||

            student.rollNumber
              ?.toLowerCase()
              .includes(value)

            ||

            student.course
              ?.toLowerCase()
              .includes(value)

            ||

            student.batchTime
              ?.toLowerCase()
              .includes(value)

            ||

            student.fatherName
              ?.toLowerCase()
              .includes(value)

          )

        }
      )

    }, [
      students,
      search,
    ])


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

          Loading students...

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
  // PAGE
  // ======================================

  return (

    <div>


      {/* ======================================
          HEADER
      ====================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">

            Students

          </h2>


          <p className="text-muted mb-0">

            Students from your assigned
            courses and batches.

          </p>

        </div>


        <div className="mt-3 mt-md-0">

          <span className="badge bg-secondary fs-6">

            {
              students.length
            }

            {' '}

            Student(s)

          </span>

        </div>

      </div>


      {/* ======================================
          SEARCH
      ====================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row align-items-center">

            <div className="col-md-8">

              <label className="form-label fw-semibold">

                Search Students

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Search by name, admission number, roll number, course, batch or father's name..."

                value={search}

                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }

              />

            </div>


            <div className="col-md-4 mt-3 mt-md-0">

              <div className="text-md-end">

                <small className="text-muted">

                  Showing

                </small>


                <div className="fw-bold fs-5">

                  {
                    filteredStudents.length
                  }

                  {' '}

                  / {students.length}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          NO STUDENTS
      ====================================== */}

      {students.length === 0 ? (

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <div
              style={{
                fontSize: '42px',
              }}
            >

              👨‍🎓

            </div>


            <h5 className="fw-bold mt-3">

              No Students Assigned

            </h5>


            <p className="text-muted mb-0">

              There are currently no students
              in your assigned courses or batches.

            </p>

          </div>

        </div>

      ) : filteredStudents.length === 0 ? (

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <h5 className="fw-bold">

              No Students Found

            </h5>


            <p className="text-muted mb-0">

              Try a different search term.

            </p>

          </div>

        </div>

      ) : (

        /* ====================================
           STUDENT TABLE
        ==================================== */

        <div className="card border-0 shadow-sm">

          <div className="card-body p-0">

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th className="px-3">
                      #
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Admission No.
                    </th>

                    <th>
                      Roll No.
                    </th>

                    <th>
                      Course
                    </th>

                    <th>
                      Batch
                    </th>

                    <th>
                      Father's Name
                    </th>

                    <th>
                      Admission Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredStudents.map(

                    (student, index) => (

                      <tr
                        key={
                          student._id ||
                          index
                        }
                      >

                        {/* NUMBER */}

                        <td className="px-3">

                          {
                            index + 1
                          }

                        </td>


                        {/* STUDENT */}

                        <td>

                          <div className="d-flex align-items-center">

                            {student.image ? (

                              <img

                                src={
                                  student.image
                                }

                                alt={
                                  student.name
                                }

                                style={{

                                  width:
                                    '40px',

                                  height:
                                    '40px',

                                  objectFit:
                                    'cover',

                                  borderRadius:
                                    '50%',

                                  marginRight:
                                    '10px',

                                }}

                              />

                            ) : (

                              <div

                                style={{

                                  width:
                                    '40px',

                                  height:
                                    '40px',

                                  borderRadius:
                                    '50%',

                                  backgroundColor:
                                    '#e9ecef',

                                  display:
                                    'flex',

                                  alignItems:
                                    'center',

                                  justifyContent:
                                    'center',

                                  marginRight:
                                    '10px',

                                  fontSize:
                                    '18px',

                                }}

                              >

                                👤

                              </div>

                            )}


                            <div>

                              <div className="fw-semibold">

                                {
                                  student.name
                                }

                              </div>

                            </div>

                          </div>

                        </td>


                        {/* ADMISSION NUMBER */}

                        <td>

                          <span className="fw-semibold">

                            {
                              student.admissionNumber
                            }

                          </span>

                        </td>


                        {/* ROLL NUMBER */}

                        <td>

                          <span className="fw-semibold">

                            {
                              student.rollNumber ||
                              '-'
                            }

                          </span>

                        </td>


                        {/* COURSE */}

                        <td>

                          {
                            student.course ||
                            '-'
                          }

                        </td>


                        {/* BATCH */}

                        <td>

                          {
                            student.batchTime ||
                            '-'
                          }

                        </td>


                        {/* FATHER'S NAME */}

                        <td>

                          {
                            student.fatherName ||
                            '-'
                          }

                        </td>


                        {/* ADMISSION DATE */}

                        <td>

                          {
                            student.admissionDate ||
                            '-'
                          }

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}


export default TeacherStudents