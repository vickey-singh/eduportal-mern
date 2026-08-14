import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentMarksExams() {

  // ======================================
  // EXAMS
  // ======================================

  const [exams, setExams] =
    useState([])


  // ======================================
  // SUMMARY
  // ======================================

  const [summary, setSummary] =
    useState({

      totalExams: 0,

      examsWithMarks: 0,

      passedExams: 0,

      failedExams: 0,

      overallPercentage: 0,

    })


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
  // FETCH EXAMS
  // ======================================

  useEffect(() => {

    const fetchExams =
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

              `${API_URL}/student/exams`,

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

            setExams(

              response.data.exams ||

              []

            )


            setSummary(

              response.data.summary ||

              {

                totalExams: 0,

                examsWithMarks: 0,

                passedExams: 0,

                failedExams: 0,

                overallPercentage: 0,

              }

            )

          }

          else {

            setError(

              response.data.message ||

              'Unable to load marks and exam results.'

            )

          }

        }

        catch (error) {

          console.log(

            'Student Marks & Exams Error:',

            error

          )


          setError(

            error?.response?.data?.message ||

            'Unable to load marks and exam results.'

          )

        }

        finally {

          setLoading(false)

        }

      }


    fetchExams()

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

              📊

            </div>


            <h5 className="fw-bold mt-3">

              Marks & Exams

            </h5>


            <p className="text-muted mb-4">

              Your marks and exam results available here.

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

              📊

            </div>


            <h5 className="fw-bold mt-3">

              Marks & Exams

            </h5>


            <p className="text-muted mb-4">

              Your marks and exam results available here.

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

              📊

            </div>


            <h5 className="fw-bold mt-3">

              Marks & Exams

            </h5>


            <p className="text-muted mb-4">

              Your marks and exam results available here.

            </p>

          </div>


          {/* ==================================
              SUMMARY
          ================================== */}

          <div className="row g-3 mb-4">


            {/* TOTAL EXAMS */}

            <div className="col-6 col-md-4 col-lg">

              <div className="border rounded p-3 text-center h-100">

                <small className="text-muted">

                  Total Exams

                </small>

                <div className="fs-4 fw-bold mt-1">

                  {
                    summary.totalExams
                  }

                </div>

              </div>

            </div>


            {/* RESULTS */}

            <div className="col-6 col-md-4 col-lg">

              <div className="border rounded p-3 text-center h-100">

                <small className="text-muted">

                  Results Available

                </small>

                <div className="fs-4 fw-bold mt-1">

                  {
                    summary.examsWithMarks
                  }

                </div>

              </div>

            </div>


            {/* PASSED */}

            <div className="col-6 col-md-4 col-lg">

              <div className="border rounded p-3 text-center h-100">

                <small className="text-muted">

                  Passed

                </small>

                <div className="fs-4 fw-bold mt-1">

                  {
                    summary.passedExams
                  }

                </div>

              </div>

            </div>


            {/* FAILED */}

            <div className="col-6 col-md-4 col-lg">

              <div className="border rounded p-3 text-center h-100">

                <small className="text-muted">

                  Failed

                </small>

                <div className="fs-4 fw-bold mt-1">

                  {
                    summary.failedExams
                  }

                </div>

              </div>

            </div>


            {/* OVERALL */}

            <div className="col-12 col-md-4 col-lg">

              <div className="border rounded p-3 text-center h-100">

                <small className="text-muted">

                  Overall %

                </small>

                <div className="fs-4 fw-bold mt-1">

                  {
                    summary.overallPercentage
                  }%

                </div>

              </div>

            </div>


          </div>


          {/* ==================================
              NO EXAMS
          ================================== */}

          {exams.length === 0 ? (

            <div
              className="alert alert-info text-center mb-0"
            >

              No exams are available
              for your course and batch yet.

            </div>

          ) : (


            /* ==================================
                EXAM LIST
            ================================== */

            <div>

              {exams.map(

                (exam) => (

                  <div

                    key={
                      exam.examId
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
                            exam.examName ||
                            '-'
                          }

                        </h6>


                        <small className="text-muted">

                          {
                            exam.examType ||
                            '-'
                          }

                          {
                            exam.subject
                              ? ` • ${exam.subject}`
                              : ''
                          }

                        </small>

                      </div>


                      {/* RESULT BADGE */}

                      {exam.marksAvailable ? (

                        <span

                          className={
                            exam.result ===
                            'Pass'

                              ? 'badge text-bg-success'

                              : 'badge text-bg-danger'
                          }

                        >

                          {
                            exam.result
                          }

                        </span>

                      ) : (

                        <span className="badge text-bg-warning">

                          Result Pending

                        </span>

                      )}

                    </div>


                    {/* ==============================
                        EXAM INFORMATION
                    ============================== */}

                    <div className="row g-3">


                      {/* EXAM DATE */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Exam Date

                        </small>

                        <div className="fw-semibold">

                          {
                            exam.examDate ||
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
                            exam.teacherName ||
                            '-'
                          }

                        </div>

                      </div>


                      {/* STATUS */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Exam Status

                        </small>

                        <div className="fw-semibold">

                          {
                            exam.status ||
                            '-'
                          }

                        </div>

                      </div>


                      {/* TOTAL MARKS */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Total Marks

                        </small>

                        <div className="fw-semibold">

                          {
                            exam.totalMarks
                          }

                        </div>

                      </div>


                      {/* PASSING MARKS */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Passing Marks

                        </small>

                        <div className="fw-semibold">

                          {
                            exam.passingMarks
                          }

                        </div>

                      </div>


                      {/* OBTAINED MARKS */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Obtained Marks

                        </small>

                        <div className="fw-semibold">

                          {
                            exam.marksAvailable

                              ? exam.obtainedMarks

                              : '-'

                          }

                        </div>

                      </div>


                      {/* PERCENTAGE */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Percentage

                        </small>

                        <div className="fw-semibold">

                          {
                            exam.marksAvailable

                              ? `${exam.percentage}%`

                              : '-'

                          }

                        </div>

                      </div>


                      {/* REMARKS */}

                      <div className="col-md-8">

                        <small className="text-muted">

                          Remarks

                        </small>

                        <div className="fw-semibold">

                          {
                            exam.marksAvailable &&
                            exam.remarks

                              ? exam.remarks

                              : '-'

                          }

                        </div>

                      </div>


                    </div>


                    {/* ==============================
                        DESCRIPTION
                    ============================== */}

                    {exam.description && (

                      <div className="mt-4">

                        <small className="text-muted">

                          Exam Description

                        </small>

                        <p className="mb-0 mt-1">

                          {
                            exam.description
                          }

                        </p>

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


export default StudentMarksExams