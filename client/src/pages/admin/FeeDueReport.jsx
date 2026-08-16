import { useEffect, useState } from 'react'

import axios from 'axios'

import jsPDF from 'jspdf'

import autoTable from 'jspdf-autotable'

import { API_URL } from '../../config/api'


function FeeDueReport() {


  // ======================================
  // FILTER OPTIONS
  // ======================================

  const [courses, setCourses] =
    useState([])

  const [batchTimes, setBatchTimes] =
    useState([])


  // ======================================
  // FILTER STATE
  // ======================================

  const [course, setCourse] =
    useState('All')

  const [status, setStatus] =
    useState('Due')

  const [batchTime, setBatchTime] =
    useState('All')

  const [paymentPlan, setPaymentPlan] =
    useState('All')


  // ======================================
  // REPORT DATA
  // ======================================

  const [students, setStudents] =
    useState([])

  const [summary, setSummary] =
    useState({

      totalStudents: 0,

      totalCourseFee: 0,

      totalPaid: 0,

      totalDue: 0,

    })


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(false)


  // ======================================
  // LOAD DATA
  // ======================================

  useEffect(() => {

    fetchFilterOptions()

    fetchReport()

  }, [])


  // ======================================
  // FETCH FILTER OPTIONS
  // ======================================

  const fetchFilterOptions =
    async () => {

      try {

        const response =
          await axios.get(

            `${API_URL}/admin/fee-reports/options`

          )


        if (
          response.data?.success
        ) {

          setCourses(

            response.data.courses ||
            []

          )


          setBatchTimes(

            response.data.batchTimes ||
            []

          )

        }

      }

      catch (error) {

        console.error(

          'Fee Report Options Error:',

          error

        )

      }

    }


  // ======================================
  // FETCH REPORT
  // ======================================

  const fetchReport =
    async () => {

      try {

        setLoading(true)


        const params = {}


        // ==================================
        // COURSE
        // ==================================

        if (
          course !== 'All'
        ) {

          params.course =
            course

        }


        // ==================================
        // STATUS
        // ==================================

        if (
          status !== 'All'
        ) {

          params.status =
            status

        }


        // ==================================
        // BATCH TIME
        // ==================================

        if (
          batchTime !== 'All'
        ) {

          params.batchTime =
            batchTime

        }


        // ==================================
        // PAYMENT PLAN
        // ==================================

        if (
          paymentPlan !== 'All'
        ) {

          params.paymentPlan =
            paymentPlan

        }


        const response =
          await axios.get(

            `${API_URL}/admin/fee-reports`,

            {

              params,

            }

          )


        if (
          response.data?.success
        ) {

          setStudents(

            response.data.students ||
            []

          )


          setSummary(

            response.data.summary || {

              totalStudents: 0,

              totalCourseFee: 0,

              totalPaid: 0,

              totalDue: 0,

            }

          )

        }

      }

      catch (error) {

        console.error(

          'Fee Report Error:',

          error

        )


        setStudents([])


        setSummary({

          totalStudents: 0,

          totalCourseFee: 0,

          totalPaid: 0,

          totalDue: 0,

        })

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // APPLY FILTER
  // ======================================

  const handleApplyFilter =
    () => {

      fetchReport()

    }


  // ======================================
  // RESET FILTER
  // ======================================

  const handleReset =
    () => {

      setCourse('All')

      setStatus('Due')

      setBatchTime('All')

      setPaymentPlan('All')


      setTimeout(() => {

        fetchReport()

      }, 0)

    }


  // ======================================
  // PAYMENT PLAN LABEL
  // ======================================

  const getPaymentPlanLabel =
    (plan) => {

      switch (plan) {

        case 'monthly':

          return 'Monthly'

        case 'three_month':

          return 'Every 3 Months'

        case 'six_month':

          return 'Every 6 Months'

        case 'full':

          return 'Full Payment'

        default:

          return '-'

      }

    }


  // ======================================
  // STATUS LABEL
  // ======================================

  const getStatusLabel =
    (value) => {

      switch (value) {

        case 'Due':

          return 'Due Students'

        case 'Partial':

          return 'Partial Payment'

        case 'Paid':

          return 'Fully Paid'

        default:

          return 'All Students'

      }

    }


  // ======================================
  // FORMAT MONEY
  // ======================================

  const formatMoney =
    (amount) => {

      return Number(
        amount || 0
      ).toLocaleString(
        'en-IN'
      )

    }


  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate =
    (date) => {

      if (!date) {

        return '-'

      }


      return new Date(
        date
      ).toLocaleDateString(
        'en-IN'
      )

    }


  // ======================================
  // PRINT REPORT
  // ======================================

  const handlePrint =
    () => {

      window.print()

    }


  // ======================================
  // DOWNLOAD PDF
  // ======================================

  const handleDownloadPDF =
    () => {

      if (
        students.length === 0
      ) {

        alert(
          'No students found for this report.'
        )

        return

      }


      const pdf =
        new jsPDF(

          'l',

          'mm',

          'a4'

        )


      const pageWidth =
        pdf.internal.pageSize
          .getWidth()


      // ==================================
      // TITLE
      // ==================================

      pdf.setFontSize(18)

      pdf.text(

        'Prerna Institute Of Excellence',

        pageWidth / 2,

        12,

        {

          align: 'center',

        }

      )


      pdf.setFontSize(14)

      pdf.text(

        'Fee Due Report',

        pageWidth / 2,

        20,

        {

          align: 'center',

        }

      )


      // ==================================
      // FILTER DETAILS
      // ==================================

      pdf.setFontSize(9)


      const filterText =

        `Course: ${course}` +

        ` | Status: ${getStatusLabel(status)}` +

        ` | Batch: ${batchTime}` +

        ` | Plan: ${getPaymentPlanLabel(paymentPlan)}`


      pdf.text(

        filterText,

        10,

        28

      )


      // ==================================
      // GENERATED DATE
      // ==================================

      pdf.text(

        `Generated: ${new Date().toLocaleDateString('en-IN')}`,

        10,

        34

      )


      // ==================================
      // TABLE DATA
      // ==================================

      const tableData =
        students.map(

          (student, index) => [

            index + 1,

            student.admissionNumber ||
              '-',

            student.name ||
              '-',

            student.fatherName ||
              '-',

            student.contact ||
              '-',

            student.course ||
              '-',

            student.batchTime ||
              '-',

            getPaymentPlanLabel(
              student.paymentPlan
            ),

            `₹ ${formatMoney(
              student.totalFees
            )}`,

            `₹ ${formatMoney(
              student.paidFees
            )}`,

            `₹ ${formatMoney(
              student.remainingFees
            )}`,

            formatDate(
              student.admissionDate
            ),

          ]

        )


      // ==================================
      // PDF TABLE
      // ==================================

      autoTable(

        pdf,

        {

          startY: 40,

          head: [[

            'S.No',

            'Student ID',

            'Student Name',

            "Father's Name",

            'Mobile',

            'Course',

            'Batch',

            'Plan',

            'Total Fee',

            'Paid',

            'Due',

            'Admission Date',

          ]],

          body:
            tableData,

          theme:
            'grid',

          styles: {

            fontSize: 7,

            cellPadding: 2,

            valign: 'middle',

          },

          headStyles: {

            fontSize: 7,

            fontStyle: 'bold',

          },

          margin: {

            left: 7,

            right: 7,

          },

          didParseCell:
            (data) => {

              if (
                data.section ===
                'head'
              ) {

                data.cell.styles
                  .fontStyle =
                  'bold'

              }

            },

        }

      )


      // ==================================
      // SUMMARY
      // ==================================

      const finalY =
        pdf.lastAutoTable.finalY + 8


      pdf.setFontSize(9)


      pdf.text(

        `Total Students: ${summary.totalStudents}`,

        10,

        finalY

      )


      pdf.text(

        `Total Fee: ₹ ${formatMoney(
          summary.totalCourseFee
        )}`,

        65,

        finalY

      )


      pdf.text(

        `Total Paid: ₹ ${formatMoney(
          summary.totalPaid
        )}`,

        125,

        finalY

      )


      pdf.text(

        `Total Due: ₹ ${formatMoney(
          summary.totalDue
        )}`,

        185,

        finalY

      )


      // ==================================
      // SAVE PDF
      // ==================================

      pdf.save(

        `fee-due-report-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`

      )

    }


  return (

    <div
      className="container-fluid py-4"
    >


      {/* ==================================
          HEADER
      ================================== */}

      <div
        className="d-flex justify-content-between align-items-center mb-4"
      >

        <div>

          <h2 className="fw-bold mb-1">

            Fee Due Report

          </h2>


          <p className="text-muted mb-0">

            Generate student fee reports
            course-wise and dues-wise.

          </p>

        </div>


        <div
          className="d-flex gap-2"
        >

          <button

            type="button"

            className="btn btn-outline-primary"

            onClick={
              handlePrint
            }

          >

            🖨 Print

          </button>


          <button

            type="button"

            className="btn btn-primary"

            onClick={
              handleDownloadPDF
            }

          >

            📄 Download PDF

          </button>

        </div>

      </div>


      {/* ==================================
          FILTER CARD
      ================================== */}

      <div
        className="card shadow-sm mb-4"
      >

        <div className="card-body">

          <div className="row g-3">


            {/* ==================================
                COURSE
            ================================== */}

            <div className="col-md-3">

              <label
                className="form-label fw-semibold"
              >

                Course

              </label>


              <select

                className="form-select"

                value={course}

                onChange={(e) =>
                  setCourse(
                    e.target.value
                  )
                }

              >

                <option value="All">

                  All Courses

                </option>


                {courses.map(

                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >

                      {item}

                    </option>

                  )

                )}

              </select>

            </div>


            {/* ==================================
                FEE STATUS
            ================================== */}

            <div className="col-md-3">

              <label
                className="form-label fw-semibold"
              >

                Fee Status

              </label>


              <select

                className="form-select"

                value={status}

                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }

              >

                <option value="All">

                  All Students

                </option>


                <option value="Due">

                  Due Students

                </option>


                <option value="Partial">

                  Partial Payment

                </option>


                <option value="Paid">

                  Fully Paid

                </option>

              </select>

            </div>


            {/* ==================================
                BATCH TIME
            ================================== */}

            <div className="col-md-3">

              <label
                className="form-label fw-semibold"
              >

                Batch Time

              </label>


              <select

                className="form-select"

                value={batchTime}

                onChange={(e) =>
                  setBatchTime(
                    e.target.value
                  )
                }

              >

                <option value="All">

                  All Batches

                </option>


                {batchTimes.map(

                  (item) => (

                    <option
                      key={item}
                      value={item}
                    >

                      {item}

                    </option>

                  )

                )}

              </select>

            </div>


            {/* ==================================
                PAYMENT PLAN
            ================================== */}

            <div className="col-md-3">

              <label
                className="form-label fw-semibold"
              >

                Payment Plan

              </label>


              <select

                className="form-select"

                value={paymentPlan}

                onChange={(e) =>
                  setPaymentPlan(
                    e.target.value
                  )
                }

              >

                <option value="All">

                  All Plans

                </option>


                <option value="monthly">

                  Monthly

                </option>


                <option value="three_month">

                  Every 3 Months

                </option>


                <option value="six_month">

                  Every 6 Months

                </option>


                <option value="full">

                  Full Payment

                </option>

              </select>

            </div>


            {/* ==================================
                FILTER BUTTONS
            ================================== */}

            <div
              className="col-12 d-flex gap-2"
            >

              <button

                type="button"

                className="btn btn-primary"

                onClick={
                  handleApplyFilter
                }

                disabled={
                  loading
                }

              >

                {loading

                  ? 'Loading...'

                  : 'Apply Filter'

                }

              </button>


              <button

                type="button"

                className="btn btn-outline-secondary"

                onClick={
                  handleReset
                }

              >

                Reset

              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================
          SUMMARY CARDS
      ================================== */}

      <div
        className="row g-3 mb-4"
      >


        {/* TOTAL STUDENTS */}

        <div className="col-md-3">

          <div className="card shadow-sm">

            <div className="card-body">

              <small className="text-muted">

                Total Students

              </small>


              <h3 className="fw-bold mb-0">

                {
                  summary.totalStudents
                }

              </h3>

            </div>

          </div>

        </div>


        {/* TOTAL FEE */}

        <div className="col-md-3">

          <div className="card shadow-sm">

            <div className="card-body">

              <small className="text-muted">

                Total Fee

              </small>


              <h3 className="fw-bold mb-0">

                ₹ {
                  formatMoney(
                    summary.totalCourseFee
                  )
                }

              </h3>

            </div>

          </div>

        </div>


        {/* TOTAL PAID */}

        <div className="col-md-3">

          <div className="card shadow-sm">

            <div className="card-body">

              <small className="text-muted">

                Total Paid

              </small>


              <h3 className="fw-bold mb-0">

                ₹ {
                  formatMoney(
                    summary.totalPaid
                  )
                }

              </h3>

            </div>

          </div>

        </div>


        {/* TOTAL DUE */}

        <div className="col-md-3">

          <div className="card shadow-sm">

            <div className="card-body">

              <small className="text-muted">

                Total Due

              </small>


              <h3 className="fw-bold mb-0">

                ₹ {
                  formatMoney(
                    summary.totalDue
                  )
                }

              </h3>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================
          REPORT TABLE
      ================================== */}

      <div
        className="card shadow-sm"
        id="fee-report-print"
      >

        <div className="card-body">


          {/* REPORT HEADER */}

          <div
            className="d-flex justify-content-between align-items-center mb-3"
          >

            <div>

              <h4 className="fw-bold mb-1">

                Fee Report

              </h4>


              <small className="text-muted">

                Course: {course}

                {' | '}

                Status: {
                  getStatusLabel(
                    status
                  )
                }

                {' | '}

                Batch: {batchTime}

                {' | '}

                Plan: {
                  getPaymentPlanLabel(
                    paymentPlan
                  )
                }

              </small>

            </div>

          </div>


          {/* ==================================
              TABLE
          ================================== */}

          <div
            className="table-responsive"
          >

            <table
              className="table table-bordered table-hover align-middle"
            >

              <thead className="table-light">

                <tr>

                  <th>
                    S.No
                  </th>

                  <th>
                    Student ID
                  </th>

                  <th>
                    Student Name
                  </th>

                  <th>
                    Father's Name
                  </th>

                  <th>
                    Mobile
                  </th>

                  <th>
                    Course
                  </th>

                  <th>
                    Batch
                  </th>

                  <th>
                    Payment Plan
                  </th>

                  <th>
                    Total Fee
                  </th>

                  <th>
                    Paid
                  </th>

                  <th>
                    Due
                  </th>

                  <th>
                    Admission Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="12"
                      className="text-center py-4"
                    >

                      Loading report...

                    </td>

                  </tr>

                ) : students.length === 0 ? (

                  <tr>

                    <td
                      colSpan="12"
                      className="text-center py-4"
                    >

                      No students found.

                    </td>

                  </tr>

                ) : (

                  students.map(

                    (student, index) => (

                      <tr

                        key={

                          student._id ||

                          student.admissionNumber

                        }

                      >

                        {/* S.NO */}

                        <td>

                          {index + 1}

                        </td>


                        {/* STUDENT ID */}

                        <td>

                          {
                            student.admissionNumber ||
                            '-'
                          }

                        </td>


                        {/* STUDENT NAME */}

                        <td>

                          {
                            student.name ||
                            '-'
                          }

                        </td>


                        {/* FATHER NAME */}

                        <td>

                          {
                            student.fatherName ||
                            '-'
                          }

                        </td>


                        {/* MOBILE */}

                        <td>

                          {
                            student.contact ||
                            '-'
                          }

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


                        {/* PAYMENT PLAN */}

                        <td>

                          {
                            getPaymentPlanLabel(
                              student.paymentPlan
                            )
                          }

                        </td>


                        {/* TOTAL FEE */}

                        <td>

                          ₹ {
                            formatMoney(
                              student.totalFees
                            )
                          }

                        </td>


                        {/* PAID */}

                        <td>

                          ₹ {
                            formatMoney(
                              student.paidFees
                            )
                          }

                        </td>


                        {/* DUE */}

                        <td>

                          <strong>

                            ₹ {
                              formatMoney(
                                student.remainingFees
                              )
                            }

                          </strong>

                        </td>


                        {/* ADMISSION DATE */}

                        <td>

                          {
                            formatDate(
                              student.admissionDate
                            )
                          }

                        </td>

                      </tr>

                    )

                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


    </div>

  )

}


export default FeeDueReport