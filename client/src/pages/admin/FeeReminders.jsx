
import { useState } from 'react'

import {
  previewFeeReminders,
  sendBulkFeeReminders,
} from '../../services/feeReminderService'

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)

const formatDate = (value) => {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })
}

function SummaryCard({ label, value, valueClass = '' }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <p className="text-muted mb-1">{label}</p>
          <h3 className={valueClass}>{value ?? 0}</h3>
        </div>
      </div>
    </div>
  )
}

function FeeReminders() {
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const loadPreview = async () => {
    setLoadingPreview(true)
    setErrorMessage('')
    setResult(null)

    try {
      const response = await previewFeeReminders()

      if (!response.success) {
        throw new Error(
          response.message || 'Could not load fee reminder preview.'
        )
      }

      setPreview(response.summary)
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          'Could not load preview.'
      )
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleSend = async () => {
    if (!preview || preview.eligibleReminders <= 0) {
      setErrorMessage('There are no eligible students to email.')
      return
    }

    const confirmed = window.confirm(
      `Send fee reminder emails to ${preview.eligibleReminders} eligible student(s)?\n\n` +
        'Only currently due unpaid installments are included. Future installments are excluded.'
    )

    if (!confirmed) return

    setSending(true)
    setErrorMessage('')
    setResult(null)

    try {
      const response = await sendBulkFeeReminders()

      if (!response.summary) {
        throw new Error(
          response.message || 'The server did not return a send report.'
        )
      }

      // Keep the actual send report visible.
      // Do not call loadPreview() here because it clears the result.
      setResult(response.summary)

      if (response.success === false && !response.summary) {
        setErrorMessage(
          response.message || 'Some reminder emails could not be sent.'
        )
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          'Could not send reminder emails.'
      )
    } finally {
      setSending(false)
    }
  }

  const summary = result || preview

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="mb-1">Fee Reminders</h2>
          <p className="text-muted mb-0">
            Preview currently due installments and send reminder emails.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={loadPreview}
          disabled={loadingPreview || sending}
        >
          {loadingPreview ? 'Loading...' : 'Refresh Preview'}
        </button>
      </div>

      <div className="alert alert-info">
        <strong>Important:</strong> Preview does not send emails.
        Future installments are excluded. Students whose reminder
        was already successfully processed today may be skipped.
      </div>

      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      {summary && (
        <div className="row g-3 mb-4">
          <SummaryCard
            label="Total Due Students"
            value={summary.totalDueStudents ?? '—'}
          />

          <SummaryCard
            label="Eligible Reminders"
            value={summary.eligibleReminders}
          />

          <SummaryCard
            label="Emails Sent"
            value={summary.emailsSent}
            valueClass="text-success"
          />

          <SummaryCard
            label="Emails Failed"
            value={summary.emailsFailed}
            valueClass="text-danger"
          />

          <SummaryCard
            label="Already Processed"
            value={summary.skippedAlreadyProcessed}
          />

          <SummaryCard
            label="Missing/Invalid Email"
            value={summary.skippedNoEmail}
          />

          <SummaryCard
            label="No Due Installments"
            value={summary.skippedNoDueInstallment}
          />

          <SummaryCard
            label="Inactive Students"
            value={summary.skippedInactive}
          />

          <SummaryCard
            label="Students Checked"
            value={summary.studentsChecked}
          />
        </div>
      )}

      {result && (
        <div
          className={`alert ${
            result.emailsFailed > 0
              ? 'alert-warning'
              : 'alert-success'
          }`}
          role="status"
        >
          Bulk reminder process completed.
          {' '}Sent: {result.emailsSent ?? 0}.
          {' '}Failed: {result.emailsFailed ?? 0}.
          {' '}Review the report below if any errors occurred.
        </div>
      )}

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <h5 className="mb-2">Bulk Fee Reminder</h5>

          <p className="text-muted">
            Load the preview first. Check the student list before
            confirming the email send.
          </p>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={loadPreview}
              disabled={loadingPreview || sending}
            >
              {loadingPreview ? 'Loading Preview...' : 'Preview Due Students'}
            </button>

            <button
              type="button"
              className="btn btn-success"
              onClick={handleSend}
              disabled={
                !preview ||
                preview.eligibleReminders <= 0 ||
                loadingPreview ||
                sending
              }
            >
              {sending ? 'Sending Emails...' : 'Send Reminder to All'}
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3">
            <h5 className="mb-1">Currently Due Students</h5>
            <small className="text-muted">
              Preview date: {preview.date || '—'}
              {' · '}Time zone: Asia/Kolkata
            </small>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Admission No.</th>
                  <th>Email</th>
                  <th>Due Installments</th>
                  <th>Currently Due</th>
                </tr>
              </thead>

              <tbody>
                {preview.preview?.length > 0 ? (
                  preview.preview.map((student, index) => (
                    <tr
                      key={`${student.admissionNumber}-${index}`}
                    >
                      <td>{index + 1}</td>
                      <td>{student.studentName || '—'}</td>
                      <td>{student.admissionNumber || '—'}</td>
                      <td>{student.email || '—'}</td>

                      <td>
                        {student.dueInstallments?.length ? (
                          student.dueInstallments.map(
                            (item, itemIndex) => (
                              <div
                                key={`${item.installmentNumber}-${itemIndex}`}
                              >
                                <small>
                                  Installment {item.installmentNumber || '—'}
                                  {' · '}
                                  {formatDate(item.dueDate)}
                                  {' · '}
                                  {formatINR(item.remainingAmount)}
                                </small>
                              </div>
                            )
                          )
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="fw-semibold text-danger">
                        {formatINR(student.remainingAmount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-4 text-muted"
                    >
                      No eligible students in this preview.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result?.errors?.length > 0 && (
        <div className="card border-0 shadow-sm mt-4">
          <div className="card-body">
            <h5 className="text-danger">Email Errors</h5>

            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Admission No.</th>
                    <th>Error</th>
                  </tr>
                </thead>

                <tbody>
                  {result.errors.map((item, index) => (
                    <tr
                      key={`${item.admissionNumber}-${index}`}
                    >
                      <td>{item.admissionNumber || '—'}</td>
                      <td>{item.message || 'Unknown error'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeeReminders
