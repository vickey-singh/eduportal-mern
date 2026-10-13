import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'

import jsPDF from 'jspdf'

import autoTable from 'jspdf-autotable'

import '../../assets/styles/admin-dashboard.css'

function FeeDueReport() {

  // ======================================

  // STATE

  // ======================================

  const [students, setStudents] =

    useState([])

  const [summary, setSummary] =

    useState({

      totalStudents: 0,

      totalCourseFee: 0,

      totalPaid: 0,

      totalDue: 0,

      totalDueAmount: 0,

      totalPendingAmount: 0,

      totalInstallments: 0,

      totalDueInstallments: 0,

      totalPendingInstallments: 0,

      totalPaidInstallments: 0,

    })

  const [courses, setCourses] =

    useState([])

  const [batchTimes, setBatchTimes] =

    useState([])

  const [paymentPlans, setPaymentPlans] =

    useState([])

  // ======================================

  // FILTERS

  // ======================================

  const [course, setCourse] =

    useState('All')

  const [status, setStatus] =

    useState('All')

  const [batchTime, setBatchTime] =

    useState('All')

  const [paymentPlan, setPaymentPlan] =

    useState('All')

  // ======================================

  // LOADING

  // ======================================

  const [loading, setLoading] =

    useState(false)

  const [generatedPdfUrl, setGeneratedPdfUrl] = useState('')

  const [generatedPdfName, setGeneratedPdfName] = useState('fee-due-report.pdf')

  // ======================================

  // ERROR

  // ======================================

  const [error, setError] =

    useState('')

  // ======================================

  // LOAD FILTER OPTIONS

  // ======================================

  useEffect(() => {

    const loadOptions =

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

              response.data.courses || []

            )

            setBatchTimes(

              response.data.batchTimes || []

            )

            setPaymentPlans(

              response.data.paymentPlans || []

            )

          }

        }

        catch (err) {

          console.log(

            'Fee Report Options Error:',

            err

          )

          setError(

            'Unable to load filter options.'

          )

        }

      }

    loadOptions()

  }, [])

  // ======================================

  // LOAD REPORT

  // ======================================

  const loadReport =

    async () => {

      try {

        setLoading(true)

        setError('')

        const params = {

          course,

          status,

          batchTime,

          paymentPlan,

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

            response.data.students || []

          )

          setSummary(

            response.data.summary || {}

          )

        }

      }

      catch (err) {

        console.log(

          'Fee Report Error:',

          err

        )

        setStudents([])

        setSummary({

          totalStudents: 0,

          totalCourseFee: 0,

          totalPaid: 0,

          totalDue: 0,

          totalDueAmount: 0,

          totalPendingAmount: 0,

          totalInstallments: 0,

          totalDueInstallments: 0,

          totalPendingInstallments: 0,

          totalPaidInstallments: 0,

        })

        setError(

          err.response?.data?.message ||

          'Unable to load fee report.'

        )

      }

      finally {

        setLoading(false)

      }

    }

  // ======================================

  // LOAD REPORT ON FILTER CHANGE

  // ======================================

  useEffect(() => {
    setGeneratedPdfUrl((oldUrl) => {
      if (oldUrl) URL.revokeObjectURL(oldUrl)
      return ''
    })
    loadReport()
  }, [
    course,
    status,
    batchTime,
    paymentPlan,
  ])

  // ======================================

  // FORMAT MONEY

  // ======================================

  const formatMoney =

    (value) => {

      return Number(

        value || 0

      ).toLocaleString(

        'en-IN'

      )

    }

  // ======================================

  // FORMAT DATE

  // ======================================

  const formatDate =

    (value) => {

      if (!value) {

        return '-'

      }

      const date =

        new Date(value)

      if (

        Number.isNaN(

          date.getTime()

        )

      ) {

        return '-'

      }

      return date.toLocaleDateString(

        'en-IN',

        {

          day: '2-digit',

          month: 'short',

          year: 'numeric',

        }

      )

    }

  // ======================================

  // PLAN LABEL

  // ======================================

  const getPlanLabel =

    (plan) => {

      if (

        plan === 'full'

      ) {

        return 'Full Payment'

      }

      if (

        plan === 'monthly'

      ) {

        return 'Monthly'

      }

      if (

        plan === 'installment'

      ) {

        return 'Installment'

      }

      return '-'

    }

  // ======================================

  // STATUS CLASS

  // ======================================

  const getStatusClass =

    (value) => {

      if (

        value === 'Paid'

      ) {

        return 'paid'

      }

      if (

        value === 'Due'

      ) {

        return 'due'

      }

      if (

        value === 'Partial'

      ) {

        return 'partial'

      }

      return 'pending'

    }

  // ======================================

  // STUDENT SCHEDULE SUMMARY

  // ======================================

  const scheduleSummary =

    (student) => {

      const schedule =

        Array.isArray(

          student.installmentSchedule

        )

          ? student.installmentSchedule

          : []

      const due =

        schedule.filter(

          item =>

            item.status === 'Due'

        )

      const pending =

        schedule.filter(

          item =>

            item.status === 'Pending'

        )

      const paid =

        schedule.filter(

          item =>

            item.status === 'Paid'

        )

      return {

        due,

        pending,

        paid,

      }

    }

  // ======================================

  // FILTERED STUDENTS

  // ======================================

  //

  // Route already filters the data.

  // This memo is only used for safe rendering.

  // ======================================

  const reportStudents =

    useMemo(

      () => students,

      [students]

    )

  // ======================================

  // ======================================
  // PROFESSIONAL PDF GENERATION
  // ======================================

  const createPDF = () => {
    if (!reportStudents.length) {
      setError('No fee records available to create a PDF.')
      return
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const generatedAt = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      // Institute heading
      doc.setFillColor(18, 38, 63)
      doc.rect(0, 0, pageWidth, 30, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('PRERNA INSTITUTE OF EXCELLENCE', pageWidth / 2, 12, {
        align: 'center',
      })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text('FEE DUE REPORT', pageWidth / 2, 21, {
        align: 'center',
      })

      // Report metadata
      doc.setTextColor(35, 45, 58)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text('Report Filters', 12, 38)
      doc.setFont('helvetica', 'normal')
      doc.text(`Course: ${course}`, 12, 44)
      doc.text(`Fee Status: ${status}`, 75, 44)
      doc.text(`Batch: ${batchTime}`, 135, 44)
      doc.text(
        `Payment Plan: ${paymentPlan === 'All' ? 'All' : getPlanLabel(paymentPlan)}`,
        195,
        44
      )
      doc.setFontSize(8)
      doc.setTextColor(95, 105, 115)
      doc.text(`Generated: ${generatedAt}`, pageWidth - 12, 38, {
        align: 'right',
      })

      // Keep the PDF focused on the filtered student-level fee details.
      // Do not print aggregate TOTAL PAID / REMAINING FEE summary cards.
      autoTable(doc, {
        startY: 51,
        margin: { left: 12, right: 12, top: 12, bottom: 16 },
        head: [[
          '#',
          'Admission No.',
          'Student Name',
          "Father's Name",
          "Father's Mobile",
          'Course',
          'Plan',
          'Total Fee',
          'Paid',
          'Remaining',
          'Due Amount',
          'Due Date',
          'Status',
        ]],
        body: reportStudents.map((student, index) => [
          index + 1,
          student.admissionNumber || '-',
          student.name || '-',
          student.fatherName || '-',
          student.fatherMobile || '-',
          student.course || '-',
          getPlanLabel(student.paymentPlan),
          `Rs. ${formatMoney(student.totalFees)}`,
          `Rs. ${formatMoney(student.paidFees)}`,
          `Rs. ${formatMoney(student.remainingFees)}`,
          `Rs. ${formatMoney(student.dueAmount)}`,
          formatDate(student.dueDate),
          student.feesStatus || '-',
        ]),
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 7,
          cellPadding: 2.2,
          textColor: [45, 55, 65],
          lineColor: [220, 226, 232],
          lineWidth: 0.15,
          overflow: 'linebreak',
          valign: 'middle',
        },
        headStyles: {
          fillColor: [31, 57, 86],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7,
        },
        alternateRowStyles: {
          fillColor: [247, 249, 252],
        },
        columnStyles: {
          0: { cellWidth: 7, halign: 'center' },
          1: { cellWidth: 22 },
          2: { cellWidth: 27 },
          3: { cellWidth: 24 },
          4: { cellWidth: 23 },
          5: { cellWidth: 20 },
          6: { cellWidth: 18 },
          7: { cellWidth: 19 },
          8: { cellWidth: 17 },
          9: { cellWidth: 20 },
          10: { cellWidth: 20 },
          11: { cellWidth: 18 },
          12: { cellWidth: 15 },
        },
        didDrawPage: () => {
          doc.setDrawColor(215, 221, 228)
          doc.line(12, pageHeight - 11, pageWidth - 12, pageHeight - 11)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7)
          doc.setTextColor(110, 120, 130)
          doc.text('Prerna Institute Of Excellence | Confidential fee report', 12, pageHeight - 6)
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            pageWidth - 12,
            pageHeight - 6,
            { align: 'right' }
          )
        },
      })

      const blob = doc.output('blob')
      const nextUrl = URL.createObjectURL(blob)
      setGeneratedPdfUrl((oldUrl) => {
        if (oldUrl) URL.revokeObjectURL(oldUrl)
        return nextUrl
      })
      setGeneratedPdfName('fee-due-report.pdf')
      setError('')
    } catch (err) {
      console.error('Fee Due PDF creation error:', err)
      setError('Unable to create PDF. Please try again.')
    }
  }

  const downloadGeneratedPDF = () => {
    if (!generatedPdfUrl) return

    const link = document.createElement('a')
    link.href = generatedPdfUrl
    link.download = generatedPdfName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const previewGeneratedPDF = () => {
    if (generatedPdfUrl) {
      window.open(generatedPdfUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (

    <div className="container-fluid">

      {/* ====================================== */}

      {/* HEADER */}

      {/* ====================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">

            Fee Due Report

          </h2>

          <p className="text-muted mb-0">

            Track paid, due and pending installments.

          </p>

        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-dark"
            onClick={createPDF}
            disabled={reportStudents.length === 0 || loading}
          >
            Create PDF
          </button>

          {generatedPdfUrl && (
            <>
              <button
                type="button"
                className="btn btn-success"
                onClick={downloadGeneratedPDF}
              >
                Download PDF
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={previewGeneratedPDF}
              >
                Preview PDF
              </button>
            </>
          )}
        </div>

      </div>

      {/* ====================================== */}

      {/* ERROR */}

      {/* ====================================== */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}

      {/* ====================================== */}

      {/* SUMMARY CARDS */}

      {/* ====================================== */}

      <div className="row g-3 mb-4">

        <div className="col-md-3">

          <div className="admin-card h-100">

            <h6>

              Students

            </h6>

            <h3>

              {summary.totalStudents || 0}

            </h3>

          </div>

        </div>

        <div className="col-md-3">

          <div className="admin-card h-100">

            <h6>

              Total Course Fee

            </h6>

            <h3>

              ₹ {formatMoney(

                summary.totalCourseFee

              )}

            </h3>

          </div>

        </div>

        <div className="col-md-3">

          <div className="admin-card h-100">

            <h6>

              Total Paid

            </h6>

            <h3>

              ₹ {formatMoney(

                summary.totalPaid

              )}

            </h3>

          </div>

        </div>

        <div className="col-md-3">

          <div className="admin-card h-100">

            <h6>

              Remaining Fee

            </h6>

            <h3>

              ₹ {formatMoney(

                summary.totalDue

              )}

            </h3>

          </div>

        </div>

      </div>

      {/* ====================================== */}

      {/* INSTALLMENT SUMMARY */}

      {/* ====================================== */}

      <div className="row g-3 mb-4">

        <div className="col-md-4">

          <div className="admin-card h-100">

            <h6>

              Current Due Amount

            </h6>

            <h3>

              ₹ {formatMoney(

                summary.totalDueAmount

              )}

            </h3>

            <small className="text-muted">

              {summary.totalDueInstallments || 0}

              {' '}

              installments currently due

            </small>

          </div>

        </div>

        <div className="col-md-4">

          <div className="admin-card h-100">

            <h6>

              Future Pending Amount

            </h6>

            <h3>

              ₹ {formatMoney(

                summary.totalPendingAmount

              )}

            </h3>

            <small className="text-muted">

              {summary.totalPendingInstallments || 0}

              {' '}

              installments pending

            </small>

          </div>

        </div>

        <div className="col-md-4">

          <div className="admin-card h-100">

            <h6>

              Paid Installments

            </h6>

            <h3>

              {summary.totalPaidInstallments || 0}

            </h3>

            <small className="text-muted">

              Total installments:

              {' '}

              {summary.totalInstallments || 0}

            </small>

          </div>

        </div>

      </div>

      {/* ====================================== */}

      {/* FILTERS */}

      {/* ====================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3">

            {/* Course */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">

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

                  All

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

            {/* Status */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">

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

                  All

                </option>

                <option value="Paid">

                  Paid

                </option>

                <option value="Partial">

                  Partial

                </option>

                <option value="Due">

                  Due

                </option>

              </select>

            </div>

            {/* Batch */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">

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

                  All

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

            {/* Payment Plan */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">

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

                  All

                </option>

                <option value="full">

                  Full Payment

                </option>

                <option value="monthly">

                  Monthly

                </option>

                <option value="installment">

                  Installment

                </option>

              </select>

            </div>

          </div>

        </div>

      </div>

      {/* ====================================== */}

      {/* LOADING */}

      {/* ====================================== */}

      {loading && (

        <div className="text-center py-5">

          <div

            className="spinner-border"

            role="status"

          />

          <p className="mt-2 text-muted">

            Loading fee report...

          </p>

        </div>

      )}

      {/* ====================================== */}

      {/* REPORT TABLE */}

      {/* ====================================== */}

      {!loading && (

        <div className="card border-0 shadow-sm">

          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead>

                  <tr>

                    <th>

                      \#

                    </th>

                    <th>

                      Admission No.

                    </th>

                    <th>

                      Student

                    </th>

                    <th>

                      Course

                    </th>

                    <th>

                      Plan

                    </th>

                    <th>

                      Total Fee

                    </th>

                    <th>

                      Paid

                    </th>

                    <th>

                      Remaining

                    </th>

                    <th>

                      Due Amount

                    </th>

                    <th>

                      Latest Due Date

                    </th>

                    <th>

                      Status

                    </th>

                  </tr>

                </thead>

                <tbody>

                  {reportStudents.length === 0 && (

                    <tr>

                      <td

                        colSpan="11"

                        className="text-center py-4 text-muted"

                      >

                        No fee records found.

                      </td>

                    </tr>

                  )}

                  {reportStudents.map(

                    (

                      student,

                      index

                    ) => {

                      const schedule =

                        scheduleSummary(

                          student

                        )

                      return (

                        <>

                          <tr

                            key={

                              student._id

                            }

                          >

                            <td>

                              {index + 1}

                            </td>

                            <td>

                              {

                                student.admissionNumber ||

                                '-'

                              }

                            </td>

                            <td>

                              <strong>

                                {

                                  student.name ||

                                  '-'

                                }

                              </strong>

                              {student.fatherName && (

                                <small className="d-block text-muted">

                                  S/o {

                                    student.fatherName

                                  }

                                </small>

                              )}

                            </td>

                            <td>

                              {

                                student.course ||

                                '-'

                              }

                            </td>

                            <td>

                              {

                                getPlanLabel(

                                  student.paymentPlan

                                )

                              }

                            </td>

                            <td>

                              ₹ {formatMoney(

                                student.totalFees

                              )}

                            </td>

                            <td>

                              ₹ {formatMoney(

                                student.paidFees

                              )}

                            </td>

                            <td>

                              ₹ {formatMoney(

                                student.remainingFees

                              )}

                            </td>

                            <td>

                              <strong>

                                ₹ {formatMoney(

                                  student.dueAmount

                                )}

                              </strong>

                              {student.dueInstallmentCount > 0 && (

                                <small className="d-block text-danger">

                                  {

                                    student.dueInstallmentCount

                                  }

                                  {' '}

                                  due

                                </small>

                              )}

                            </td>

                            <td>

                              {

                                formatDate(

                                  student.dueDate

                                )

                              }

                            </td>

                            <td>

                              <span

                                className={

                                  `status ${getStatusClass(

                                    student.feesStatus

                                  )}`

                                }

                              >

                                {

                                  student.feesStatus ||

                                  '-'

                                }

                              </span>

                            </td>

                          </tr>

                          {/* ================================== */}

                          {/* INSTALLMENT DETAILS */}

                          {/* ================================== */}

                          {schedule.due.length > 0 && (

                            <tr>

                              <td

                                colSpan="11"

                                className="bg-light"

                              >

                                <div className="small">

                                  <strong>

                                    Due Installments:

                                  </strong>

                                  <div className="table-responsive mt-2">

                                    <table className="table table-sm mb-0">

                                      <thead>

                                        <tr>

                                          <th>

                                            \#

                                          </th>

                                          <th>

                                            Amount

                                          </th>

                                          <th>

                                            Due Date

                                          </th>

                                          <th>

                                            Paid

                                          </th>

                                          <th>

                                            Status

                                          </th>

                                        </tr>

                                      </thead>

                                      <tbody>

                                        {schedule.due.map(

                                          (item) => (

                                            <tr

                                              key={

                                                `${student._id}-due-${item.installmentNumber}`

                                              }

                                            >

                                              <td>

                                                {

                                                  item.installmentNumber ||

                                                  '-'

                                                }

                                              </td>

                                              <td>

                                                ₹ {formatMoney(

                                                  item.amount

                                                )}

                                              </td>

                                              <td>

                                                {

                                                  formatDate(

                                                    item.dueDate

                                                  )

                                                }

                                              </td>

                                              <td>

                                                ₹ {formatMoney(

                                                  item.paidAmount

                                                )}

                                              </td>

                                              <td>

                                                <span className="status due">

                                                  Due

                                                </span>

                                              </td>

                                            </tr>

                                          )

                                        )}

                                      </tbody>

                                    </table>

                                  </div>

                                </div>

                              </td>

                            </tr>

                          )}

                        </>

                      )

                    }

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

export default FeeDueReport
