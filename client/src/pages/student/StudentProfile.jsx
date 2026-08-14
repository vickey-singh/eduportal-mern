import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentProfile() {

  // ======================================
  // STUDENT
  // ======================================

  const [student, setStudent] =
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
  // GET TOKEN
  // ======================================

  const getToken = () => {

    return localStorage.getItem(
      'studentToken'
    )

  }


  // ======================================
  // FETCH PROFILE
  // ======================================

  const fetchProfile =
    async () => {

      try {

        const token =
          getToken()


        if (!token) {

          setError(
            'Student authentication required.'
          )

          return

        }


        const response =
          await axios.get(

            `${API_URL}/student/profile`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setStudent(
            response.data.student
          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load profile.'

          )

        }

      }

      catch (error) {

        console.log(

          'Student Profile Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load profile.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    fetchProfile()

  }, [])


  // ======================================
  // PROFILE IMAGE URL
  // ======================================

  const getImageUrl =
    (image) => {

      if (!image) {

        return ''

      }


      if (
        image.startsWith('http')
      ) {

        return image

      }


      return (

        `${API_URL.replace(
          '/api',
          ''
        )}${image}`

      )

    }


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-5 text-center">

            <div
              style={{
                fontSize: '48px',
              }}
            >

              👤

            </div>


            <h5 className="fw-bold mt-3">

              My Profile

            </h5>


            <p className="text-muted mb-4">

              Loading your profile...

            </p>


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

    )

  }


  // ======================================
  // ERROR
  // ======================================

  if (
    error &&
    !student
  ) {

    return (

      <div>

        <div className="mb-4">

          <h2 className="fw-bold mb-1">

            My Profile

          </h2>


          <p className="text-muted mb-0">

            View your personal and admission information.

          </p>

        </div>


        <div
          className="alert alert-danger"
          role="alert"
        >

          {error}

        </div>

      </div>

    )

  }


  return (

    <div>


      {/* ==================================
          HEADER
      ================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          My Profile

        </h2>


        <p className="text-muted mb-0">

          View your personal and admission information.

        </p>

      </div>


      {/* ==================================
          PROFILE HEADER
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <div className="row align-items-center">


            {/* ==================================
                PROFILE IMAGE
            ================================== */}

            <div className="col-md-2 text-center">

              {
                student?.image

                  ? (

                    <img

                      src={
                        getImageUrl(
                          student.image
                        )
                      }

                      alt={
                        student?.name ||
                        'Student'
                      }

                      style={{

                        width: '110px',

                        height: '110px',

                        objectFit: 'cover',

                        borderRadius: '50%',

                        border:
                          '4px solid #f1f1f1',

                      }}

                    />

                  )

                  : (

                    <div

                      style={{

                        width: '110px',

                        height: '110px',

                        borderRadius: '50%',

                        backgroundColor:
                          '#f1f1f1',

                        display:
                          'flex',

                        alignItems:
                          'center',

                        justifyContent:
                          'center',

                        margin:
                          '0 auto',

                        fontSize:
                          '50px',

                      }}

                    >

                      👤

                    </div>

                  )

              }

            </div>


            {/* ==================================
                STUDENT NAME
            ================================== */}

            <div className="col-md-7 mt-3 mt-md-0">

              <small className="text-muted">

                Student

              </small>


              <h3 className="fw-bold mb-1">

                {
                  student?.name ||
                  '-'
                }

              </h3>


              <div className="text-muted">

                Admission No: {' '}

                <strong>

                  {
                    student?.admissionNumber ||
                    '-'
                  }

                </strong>

              </div>

            </div>


            {/* ==================================
                STATUS
            ================================== */}

            <div className="col-md-3 text-md-end mt-3 mt-md-0">

              <span className="badge bg-success px-3 py-2">

                Active Student

              </span>

            </div>


          </div>

        </div>

      </div>


      {/* ==================================
          PERSONAL INFORMATION
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <h5 className="fw-bold mb-4">

            👤 Personal Information

          </h5>


          <div className="row g-4">


            {/* FULL NAME */}

            <div className="col-md-6">

              <small className="text-muted">

                Full Name

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.name ||
                  '-'
                }

              </div>

            </div>


            {/* DOB */}

            <div className="col-md-6">

              <small className="text-muted">

                Date of Birth

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.dob ||
                  '-'
                }

              </div>

            </div>


            {/* ADMISSION NUMBER */}

            <div className="col-md-6">

              <small className="text-muted">

                Admission Number

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.admissionNumber ||
                  '-'
                }

              </div>

            </div>


            {/* AADHAAR */}

            <div className="col-md-6">

              <small className="text-muted">

                Aadhaar Number

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.aadharNumber ||
                  '-'
                }

              </div>

            </div>


            {/* CONTACT */}

            <div className="col-md-6">

              <small className="text-muted">

                Contact Number

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.contact ||
                  '-'
                }

              </div>

            </div>


            {/* EMAIL */}

            <div className="col-md-6">

              <small className="text-muted">

                Email Address

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.email ||
                  '-'
                }

              </div>

            </div>


          </div>

        </div>

      </div>


      {/* ==================================
          COURSE INFORMATION
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <h5 className="fw-bold mb-4">

            📚 Course Information

          </h5>


          <div className="row g-4">


            {/* COURSE */}

            <div className="col-md-6">

              <small className="text-muted">

                Course

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.course ||
                  '-'
                }

              </div>

            </div>


            {/* BATCH */}

            <div className="col-md-6">

              <small className="text-muted">

                Batch Time

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.batchTime ||
                  '-'
                }

              </div>

            </div>


            {/* ADMISSION DATE */}

            <div className="col-md-6">

              <small className="text-muted">

                Admission Date

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.admissionDate ||
                  '-'
                }

              </div>

            </div>


            {/* ADMISSION TYPE */}

            <div className="col-md-6">

              <small className="text-muted">

                Admission Type

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.admissionType ||
                  '-'
                }

              </div>

            </div>


          </div>

        </div>

      </div>


      {/* ==================================
          PARENT INFORMATION
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <h5 className="fw-bold mb-4">

            👨‍👩‍👧 Parent Information

          </h5>


          <div className="row g-4">


            {/* ==================================
                FATHER
            ================================== */}

            <div className="col-md-6">

              <div className="border rounded p-4 h-100">

                <h6 className="fw-bold mb-3">

                  Father

                </h6>


                <div className="mb-3">

                  <small className="text-muted">

                    Name

                  </small>


                  <div className="fw-semibold">

                    {
                      student?.fatherName ||
                      '-'
                    }

                  </div>

                </div>


                <div className="mb-3">

                  <small className="text-muted">

                    Mobile

                  </small>


                  <div className="fw-semibold">

                    {
                      student?.fatherMobile ||
                      '-'
                    }

                  </div>

                </div>


                <div>

                  <small className="text-muted">

                    Occupation

                  </small>


                  <div className="fw-semibold">

                    {
                      student?.fatherOccupation ||
                      '-'
                    }

                  </div>

                </div>

              </div>

            </div>


            {/* ==================================
                MOTHER
            ================================== */}

            <div className="col-md-6">

              <div className="border rounded p-4 h-100">

                <h6 className="fw-bold mb-3">

                  Mother

                </h6>


                <div className="mb-3">

                  <small className="text-muted">

                    Name

                  </small>


                  <div className="fw-semibold">

                    {
                      student?.motherName ||
                      '-'
                    }

                  </div>

                </div>


                <div className="mb-3">

                  <small className="text-muted">

                    Mobile

                  </small>


                  <div className="fw-semibold">

                    {
                      student?.motherMobile ||
                      '-'
                    }

                  </div>

                </div>


                <div>

                  <small className="text-muted">

                    Occupation

                  </small>


                  <div className="fw-semibold">

                    {
                      student?.motherOccupation ||
                      '-'
                    }

                  </div>

                </div>

              </div>

            </div>


          </div>

        </div>

      </div>


      {/* ==================================
          ADDRESS
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <h5 className="fw-bold mb-4">

            📍 Address

          </h5>


          <div className="row g-4">


            {/* PERMANENT ADDRESS */}

            <div className="col-md-6">

              <small className="text-muted">

                Permanent Address

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.permanentAddress ||
                  '-'
                }

              </div>

            </div>


            {/* CURRENT ADDRESS */}

            <div className="col-md-6">

              <small className="text-muted">

                Current Address

              </small>


              <div className="fw-semibold mt-1">

                {
                  student?.currentAddress ||
                  '-'
                }

              </div>

            </div>


          </div>

        </div>

      </div>


      {/* ==================================
          EDUCATION
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <h5 className="fw-bold mb-4">

            🎓 Education

          </h5>


          <div>

            <small className="text-muted">

              School / College Name

            </small>


            <div className="fw-semibold mt-1">

              {
                student?.schoolCollegeName ||
                '-'
              }

            </div>

          </div>

        </div>

      </div>


      {/* ==================================
          PROFILE NOTE
      ================================== */}

      <div className="alert alert-info border-0 shadow-sm">

        <strong>

          ℹ️ Profile Information

        </strong>


        <div className="mt-1">

          This information is based on your admission
          records. If any information is incorrect,
          please contact the institute administration
          for correction.

        </div>

      </div>


    </div>

  )

}


export default StudentProfile