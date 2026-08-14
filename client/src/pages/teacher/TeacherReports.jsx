import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherReports() {

  // ======================================
  // SUMMARY
  // ======================================

  const [summary, setSummary] =
    useState({

      totalStudents: 0,

      totalExams: 0,

      totalMarksRecords: 0,

      passCount: 0,

      failCount: 0,

      averagePercentage: 0,

    })


  // ======================================
  // STUDENT REPORTS
  // ======================================

  const [students, setStudents] =
    useState([])


  // ======================================
  // SELECTED STUDENT REPORT
  // ======================================

  const [selectedReport, setSelectedReport] =
    useState(null)


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  const [reportLoading, setReportLoading] =
    useState(false)


  // ======================================
  // ERROR
  // ======================================

  const [error, setError] =
    useState('')


  // ======================================
  // FETCH SUMMARY
  // ======================================

  const fetchSummary =
    async () => {

      try {

        const token =
          localStorage.getItem(
            'teacherToken'
          )


        if (!token) {

          setError(
            'Teacher authentication token not found.'
          )

          return

        }


        const response =
          await axios.get(

            `${API_URL}/teacher/reports/summary`,

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

          setSummary(

            response.data.summary ||
            {}

          )

        }

        else {

          setError(

            response.data.message ||
            'Unable to load report summary.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Report Summary Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load report summary.'

        )

      }

    }


  // ======================================
  // FETCH STUDENT REPORTS
  // ======================================

  const fetchStudents =
    async () => {

      try {

        const token =
          localStorage.getItem(
            'teacherToken'
          )


        if (!token) {

          return

        }


        const response =
          await axios.get(

            `${API_URL}/teacher/reports/students`,

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

          setStudents(

            response.data.students ||
            []

          )

        }

        else {

          setError(

            response.data.message ||
            'Unable to load student reports.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Student Reports Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load student reports.'

        )

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    const loadReports =
      async () => {

        setLoading(true)

        setError('')


        await Promise.all([

          fetchSummary(),

          fetchStudents(),

        ])


        setLoading(false)

      }


    loadReports()

  }, [])


  // ======================================
  // VIEW STUDENT REPORT
  // ======================================

  const viewStudentReport =
    async (studentId) => {

      try {

        setReportLoading(true)

        setError('')


        const token =
          localStorage.getItem(
            'teacherToken'
          )


        const response =
          await axios.get(

            `${API_URL}/teacher/reports/student/${studentId}`,

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

          setSelectedReport(
            response.data
          )

        }

        else {

          setError(

            response.data.message ||
            'Unable to load student result.'

          )

        }

      }

      catch (error) {

        console.log(

          'View Student Report Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load student result.'

        )

      }

      finally {

        setReportLoading(false)

      }

    }


  // ======================================
  // CLOSE STUDENT REPORT
  // ======================================

  const closeStudentReport =
    () => {

      setSelectedReport(null)

    }


  // ======================================
  // RESULT BADGE
  // ======================================

  const getResultBadge =
    (result) => {

      if (
        result === 'Pass'
      ) {

        return 'badge bg-success'

      }


      if (
        result === 'Fail'
      ) {

        return 'badge bg-danger'

      }


      return 'badge bg-secondary'

    }


  // ======================================
  // PERCENTAGE
  // ======================================

  const formatPercentage =
    (percentage) => {

      if (
        percentage === null ||
        percentage === undefined
      ) {

        return '-'

      }


      return `${percentage}%`

    }


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

          Loading reports...

        </p>

      </div>

    )

  }


  // ======================================
  // PAGE
  // ======================================

  return (

    <div>


      {/* ==================================
          HEADER
      ================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          Reports

        </h2>


        <p className="text-muted mb-0">

          View class and student performance
          reports.

        </p>

      </div>


      {/* ==================================
          ERROR
      ================================== */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* ==================================
          SUMMARY CARDS
      ================================== */}

      <div className="row g-3 mb-4">


        {/* STUDENTS */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small mb-2">

                Total Students

              </div>


              <h3 className="fw-bold mb-0">

                {
                  summary.totalStudents || 0
                }

              </h3>

            </div>

          </div>

        </div>


        {/* EXAMS */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small mb-2">

                Total Exams

              </div>


              <h3 className="fw-bold mb-0">

                {
                  summary.totalExams || 0
                }

              </h3>

            </div>

          </div>

        </div>


        {/* PASS */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small mb-2">

                Pass Records

              </div>


              <h3 className="fw-bold text-success mb-0">

                {
                  summary.passCount || 0
                }

              </h3>

            </div>

          </div>

        </div>


        {/* AVERAGE */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="text-muted small mb-2">

                Average Performance

              </div>


              <h3 className="fw-bold mb-0">

                {
                  summary.averagePercentage || 0
                }%

              </h3>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================
          PERFORMANCE TABLE
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                Student Performance

              </h5>


              <small className="text-muted">

                Combined performance of your
                assigned students.

              </small>

            </div>


            <span className="badge bg-secondary">

              {
                students.length
              }

              {' '}

              Students

            </span>

          </div>


          {students.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: '48px',
                }}
              >

                📊

              </div>


              <h6 className="fw-bold mt-3">

                No Student Reports

              </h6>


              <p className="text-muted mb-0">

                No performance data is available
                for your assigned students.

              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Father's Name
                    </th>

                    <th>
                      Course
                    </th>

                    <th>
                      Batch
                    </th>

                    <th>
                      Exams
                    </th>

                    <th>
                      Total
                    </th>

                    <th>
                      Percentage
                    </th>

                    <th>
                      Result
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {students.map(

                    (student, index) => (

                      <tr
                        key={
                          student.studentId
                        }
                      >

                        <td>

                          {
                            index + 1
                          }

                        </td>


                        <td>

                          <div className="fw-semibold">

                            {
                              student.name
                            }

                          </div>


                          <small className="text-muted">

                            {
                              student.admissionNumber
                            }

                          </small>

                        </td>


                        <td>

                          {
                            student.fatherName ||
                            '-'
                          }

                        </td>


                        <td>

                          {
                            student.course
                          }

                        </td>


                        <td>

                          {
                            student.batchTime ||
                            '-'
                          }

                        </td>


                        <td>

                          {
                            student.examsGiven
                          }

                        </td>


                        <td>

                          {
                            student.totalObtained
                          }

                          {' / '}

                          {
                            student.totalMarks
                          }

                        </td>


                        <td>

                          <span className="fw-semibold">

                            {
                              formatPercentage(
                                student.percentage
                              )
                            }

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              getResultBadge(
                                student.overallResult
                              )
                            }
                          >

                            {
                              student.overallResult
                            }

                          </span>

                        </td>


                        <td>

                          <button

                            type="button"

                            className="btn btn-sm btn-outline-primary"

                            onClick={() =>
                              viewStudentReport(
                                student.studentId
                              )
                            }

                            disabled={
                              reportLoading
                            }

                          >

                            View Result

                          </button>

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


      {/* ==================================
          STUDENT RESULT MODAL
      ================================== */}

      {selectedReport && (

        <div

          className="modal d-block"

          tabIndex="-1"

          style={{

            backgroundColor:
              'rgba(0, 0, 0, 0.5)',

          }}

        >

          <div className="modal-dialog modal-xl modal-dialog-scrollable">

            <div className="modal-content">


              {/* HEADER */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold">

                    Student Result

                  </h5>


                  <small className="text-muted">

                    Combined examination performance

                  </small>

                </div>


                <button

                  type="button"

                  className="btn-close"

                  onClick={
                    closeStudentReport
                  }

                />

              </div>


              {/* BODY */}

              <div className="modal-body">


                {/* STUDENT INFO */}

                <div className="card border-0 bg-light mb-4">

                  <div className="card-body">

                    <div className="row g-3">


                      <div className="col-md-4">

                        <small className="text-muted">

                          Student

                        </small>


                        <div className="fw-bold">

                          {
                            selectedReport.student
                              ?.name
                          }

                        </div>

                      </div>


                      <div className="col-md-4">

                        <small className="text-muted">

                          Father's Name

                        </small>


                        <div className="fw-semibold">

                          {
                            selectedReport.student
                              ?.fatherName ||
                            '-'
                          }

                        </div>

                      </div>


                      <div className="col-md-4">

                        <small className="text-muted">

                          Admission Number

                        </small>


                        <div className="fw-semibold">

                          {
                            selectedReport.student
                              ?.admissionNumber
                          }

                        </div>

                      </div>


                      <div className="col-md-4">

                        <small className="text-muted">

                          Course

                        </small>


                        <div className="fw-semibold">

                          {
                            selectedReport.student
                              ?.course
                          }

                        </div>

                      </div>


                      <div className="col-md-4">

                        <small className="text-muted">

                          Batch

                        </small>


                        <div className="fw-semibold">

                          {
                            selectedReport.student
                              ?.batchTime ||
                            '-'
                          }

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* SUMMARY */}

                <div className="row g-3 mb-4">


                  <div className="col-md-3">

                    <div className="card border h-100">

                      <div className="card-body">

                        <small className="text-muted">

                          Exams Attempted

                        </small>


                        <h4 className="fw-bold mb-0 mt-2">

                          {
                            selectedReport.summary
                              ?.attemptedExams || 0
                          }

                        </h4>

                      </div>

                    </div>

                  </div>


                  <div className="col-md-3">

                    <div className="card border h-100">

                      <div className="card-body">

                        <small className="text-muted">

                          Total Marks

                        </small>


                        <h4 className="fw-bold mb-0 mt-2">

                          {
                            selectedReport.summary
                              ?.totalObtained || 0
                          }

                          {' / '}

                          {
                            selectedReport.summary
                              ?.totalMarks || 0
                          }

                        </h4>

                      </div>

                    </div>

                  </div>


                  <div className="col-md-3">

                    <div className="card border h-100">

                      <div className="card-body">

                        <small className="text-muted">

                          Percentage

                        </small>


                        <h4 className="fw-bold mb-0 mt-2">

                          {
                            selectedReport.summary
                              ?.percentage || 0
                          }%

                        </h4>

                      </div>

                    </div>

                  </div>


                  <div className="col-md-3">

                    <div className="card border h-100">

                      <div className="card-body">

                        <small className="text-muted">

                          Overall Result

                        </small>


                        <div className="mt-2">

                          <span
                            className={
                              getResultBadge(
                                selectedReport
                                  .summary
                                  ?.overallResult
                              )
                            }
                          >

                            {
                              selectedReport.summary
                                ?.overallResult
                            }

                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                {/* EXAM RESULTS */}

                <h6 className="fw-bold mb-3">

                  Examination Details

                </h6>


                {selectedReport.results?.length === 0 ? (

                  <div className="alert alert-light border">

                    No examinations found.

                  </div>

                ) : (

                  <div className="table-responsive">

                    <table className="table table-bordered align-middle">

                      <thead className="table-light">

                        <tr>

                          <th>
                            #
                          </th>

                          <th>
                            Exam
                          </th>

                          <th>
                            Subject
                          </th>

                          <th>
                            Date
                          </th>

                          <th>
                            Marks
                          </th>

                          <th>
                            Percentage
                          </th>

                          <th>
                            Result
                          </th>

                          <th>
                            Remarks
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {selectedReport.results.map(

                          (result, index) => (

                            <tr
                              key={
                                result.examId
                              }
                            >

                              <td>

                                {
                                  index + 1
                                }

                              </td>


                              <td>

                                <div className="fw-semibold">

                                  {
                                    result.examName
                                  }

                                </div>


                                <small className="text-muted">

                                  {
                                    result.examType
                                  }

                                </small>

                              </td>


                              <td>

                                {
                                  result.subject ||
                                  '-'
                                }

                              </td>


                              <td>

                                {
                                  result.examDate ||
                                  '-'
                                }

                              </td>


                              <td>

                                {result.obtainedMarks === null

                                  ? '-'

                                  : (

                                    <>

                                      {
                                        result.obtainedMarks
                                      }

                                      {' / '}

                                      {
                                        result.totalMarks
                                      }

                                    </>

                                  )

                                }

                              </td>


                              <td>

                                {
                                  formatPercentage(
                                    result.percentage
                                  )
                                }

                              </td>


                              <td>

                                <span
                                  className={
                                    getResultBadge(
                                      result.result
                                    )
                                  }
                                >

                                  {
                                    result.result
                                  }

                                </span>

                              </td>


                              <td>

                                {
                                  result.remarks ||
                                  '-'
                                }

                              </td>

                            </tr>

                          )

                        )}

                      </tbody>


                      {/* TOTAL */}

                      <tfoot className="table-light">

                        <tr>

                          <th
                            colSpan="4"
                            className="text-end"
                          >

                            Combined Total

                          </th>


                          <th>

                            {
                              selectedReport.summary
                                ?.totalObtained || 0
                            }

                            {' / '}

                            {
                              selectedReport.summary
                                ?.totalMarks || 0
                            }

                          </th>


                          <th>

                            {
                              selectedReport.summary
                                ?.percentage || 0
                            }%

                          </th>


                          <th>

                            <span
                              className={
                                getResultBadge(
                                  selectedReport
                                    .summary
                                    ?.overallResult
                                )
                              }
                            >

                              {
                                selectedReport.summary
                                  ?.overallResult
                              }

                            </span>

                          </th>


                          <th />

                        </tr>

                      </tfoot>

                    </table>

                  </div>

                )}

              </div>


              {/* FOOTER */}

              <div className="modal-footer">

                <button

                  type="button"

                  className="btn btn-secondary"

                  onClick={
                    closeStudentReport
                  }

                >

                  Close

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}


export default TeacherReports