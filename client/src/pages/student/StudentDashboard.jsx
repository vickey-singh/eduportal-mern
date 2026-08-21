import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentDashboard() {

  // ======================================
  // STUDENT DATA
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
  // FETCH LOGGED-IN STUDENT
  // ======================================

  useEffect(() => {

    const fetchStudent =
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
          // GET STUDENT DATA
          // ==================================

          const response =
            await axios.get(

              `${API_URL}/student/me`,

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

            const studentData =
              response.data.student


            setStudent(
              studentData
            )


            // ==================================
            // UPDATE LOCAL STORAGE
            // ==================================

            localStorage.setItem(

              'student',

              JSON.stringify(
                studentData
              )

            )

          }

          else {

            setError(

              response.data.message ||

              'Unable to load student information.'

            )

          }

        }

        catch (error) {

          console.log(
            'Student Dashboard Error:',
            error
          )


          setError(

            error?.response?.data?.message ||

            'Unable to load student information.'

          )

        }

        finally {

          setLoading(false)

        }

      }


    fetchStudent()

  }, [])


  // ======================================
  // LOADING STATE
  // ======================================

  if (loading) {

    return (

      <div>

        <div className="mb-4">

          <h2 className="fw-bold mb-1">

            Dashboard

          </h2>

          <p className="text-muted mb-0">

            Loading your dashboard...

          </p>

        </div>


        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 text-center">

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
  // ERROR STATE
  // ======================================

  if (error) {

    return (

      <div>

        <div className="mb-4">

          <h2 className="fw-bold mb-1">

            Dashboard

          </h2>

          <p className="text-muted mb-0">

            Welcome to your Student Portal.

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

          Dashboard

        </h2>


        <p className="text-muted mb-0">

          Welcome,

          {' '}

          <strong>

            {
              student?.name ||
              'Student'
            }

          </strong>

          {' '}👋

        </p>

      </div>


      {/* ==================================
          SUMMARY CARDS
      ================================== */}

      <div className="row g-3 mb-4">


        {/* ==================================
            STUDENT ID
        ================================== */}

        <div className="col-md-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <small className="text-muted">

                Student ID

              </small>

              <h5 className="fw-bold mt-2 mb-0">

                {
                  student?.admissionNumber ||
                  '-'
                }

              </h5>

            </div>

          </div>

        </div>


        {/* ==================================
            ROLL NUMBER
        ================================== */}

        <div className="col-md-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <small className="text-muted">

                Roll Number

              </small>

              <h5 className="fw-bold mt-2 mb-0">

                {
                  student?.rollNumber ||
                  '-'
                }

              </h5>

            </div>

          </div>

        </div>


        {/* ==================================
            COURSE
        ================================== */}

        <div className="col-md-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <small className="text-muted">

                Course

              </small>

              <h5 className="fw-bold mt-2 mb-0">

                {
                  student?.course ||
                  '-'
                }

              </h5>

            </div>

          </div>

        </div>


        {/* ==================================
            BATCH
        ================================== */}

        <div className="col-md-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <small className="text-muted">

                Batch

              </small>

              <h5 className="fw-bold mt-2 mb-0">

                {
                  student?.batchTime ||
                  '-'
                }

              </h5>

            </div>

          </div>

        </div>


        {/* ==================================
            ADMISSION DATE
        ================================== */}

        <div className="col-md-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <small className="text-muted">

                Admission Date

              </small>

              <h5 className="fw-bold mt-2 mb-0">

                {
                  student?.admissionDate ||
                  '-'
                }

              </h5>

            </div>

          </div>

        </div>


        {/* ==================================
            TOTAL FEES
        ================================== */}

        <div className="col-md-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <small className="text-muted">

                Total Fees

              </small>

              <h5 className="fw-bold mt-2 mb-0">

                ₹
                {
                  Number(
                    student?.totalFees || 0
                  ).toLocaleString('en-IN')
                }

              </h5>

            </div>

          </div>

        </div>


        {/* ==================================
            PAID FEES
        ================================== */}

        <div className="col-md-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <small className="text-muted">

                Paid Fees

              </small>

              <h5 className="fw-bold mt-2 mb-0">

                ₹
                {
                  Number(
                    student?.paidFees || 0
                  ).toLocaleString('en-IN')
                }

              </h5>

            </div>

          </div>

        </div>


        {/* ==================================
            REMAINING FEES
        ================================== */}

        <div className="col-md-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <small className="text-muted">

                Remaining Fees

              </small>

              <h5 className="fw-bold mt-2 mb-0">

                ₹
                {
                  Number(
                    student?.remainingFees || 0
                  ).toLocaleString('en-IN')
                }

              </h5>

            </div>

          </div>

        </div>


        {/* ==================================
            FEES STATUS
        ================================== */}

        <div className="col-md-6 col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body p-4">

              <small className="text-muted">

                Fees Status

              </small>

              <h5 className="fw-bold mt-2 mb-0">

                {
                  student?.feesStatus ||
                  'Pending'
                }

              </h5>

            </div>

          </div>

        </div>


      </div>


      {/* ==================================
          STUDENT INFORMATION
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          <h5 className="fw-bold mb-4">

            Student Information

          </h5>


          <div className="row g-3">


            {/* NAME */}

            <div className="col-md-6">

              <small className="text-muted">

                Name

              </small>

              <div className="fw-semibold">

                {
                  student?.name ||
                  '-'
                }

              </div>

            </div>


            {/* ROLL NUMBER */}

            <div className="col-md-6">

              <small className="text-muted">

                Roll Number

              </small>

              <div className="fw-semibold">

                {
                  student?.rollNumber ||
                  '-'
                }

              </div>

            </div>


            {/* CONTACT */}

            <div className="col-md-6">

              <small className="text-muted">

                Contact

              </small>

              <div className="fw-semibold">

                {
                  student?.contact ||
                  '-'
                }

              </div>

            </div>


            {/* EMAIL */}

            <div className="col-md-6">

              <small className="text-muted">

                Email

              </small>

              <div className="fw-semibold">

                {
                  student?.email ||
                  '-'
                }

              </div>

            </div>


            {/* DOB */}

            <div className="col-md-6">

              <small className="text-muted">

                Date of Birth

              </small>

              <div className="fw-semibold">

                {
                  student?.dob ||
                  '-'
                }

              </div>

            </div>


          </div>

        </div>

      </div>


    </div>

  )

}


export default StudentDashboard