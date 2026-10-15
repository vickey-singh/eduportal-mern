import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'

function FacultyAttendance() {

  // ======================================
  // SELECTED DATE
  // ======================================

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    )

  // ======================================
  // FACULTY
  // ======================================

  const [faculty, setFaculty] =
    useState([])

  // ======================================
  // ATTENDANCE
  // ======================================

  const [attendance, setAttendance] =
    useState({})
  const [remarks, setRemarks] =
    useState({})

  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)
  const [saving, setSaving] =
    useState(false)

  // ======================================
  // MESSAGE
  // ======================================

  const [message, setMessage] =
    useState('')
  const [error, setError] =
    useState('')

  // ======================================
  // VIEW MODAL
  // ======================================

  const [selectedFaculty, setSelectedFaculty] =
    useState(null)
  const [viewType, setViewType] =
    useState('daily')
  const [viewData, setViewData] =
    useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  // Attendance calendar status for the selected date.
  const [calendarStatus, setCalendarStatus] = useState({
    loading: true,
    isWorkingDay: false,
    reason: null,
    holidayName: null,
    calendarUnavailable: false,
  })

  // ======================================
  // GET ADMIN TOKEN
  // ======================================

  const getToken = () => {
    return localStorage.getItem('token')
  }

  // ======================================
  // AUTH HEADERS
  // ======================================

  const getHeaders = () => {
    return {
      headers: {
        Authorization:
          `Bearer ${getToken()}`,
      },
    }
  }

  // ======================================
  // ATTENDANCE CALENDAR
  // ======================================

  const getWeekdayKey = (dateKey) => {
    const [year, month, day] = dateKey.split('-').map(Number)
    const weekdays = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]
    return weekdays[
      new Date(Date.UTC(year, month - 1, day)).getUTCDay()
    ]
  }
  const fetchCalendarStatus = async (dateKey) => {
    setCalendarStatus((previous) => ({
      ...previous,
      loading: true,
    }))
    try {
      const [settingsResponse, holidaysResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/attendance/settings`, getHeaders()),
        axios.get(`${API_URL}/admin/attendance/holidays`, getHeaders()),
      ])
      const workingDays = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false,
        ...(settingsResponse.data?.settings?.workingDays || {}),
      }
      const holidays = holidaysResponse.data?.holidays || []
      const holiday = holidays.find(
        (item) =>
          item.startDate <= dateKey &&
          item.endDate >= dateKey
      )
      if (holiday) {
        setCalendarStatus({
          loading: false,
          isWorkingDay: false,
          reason: 'holiday',
          holidayName: holiday.name,
          calendarUnavailable: false,
        })
        return
      }
      const weekday = getWeekdayKey(dateKey)
      if (!workingDays[weekday]) {
        setCalendarStatus({
          loading: false,
          isWorkingDay: false,
          reason: 'weekly_off',
          holidayName: null,
          calendarUnavailable: false,
        })
        return
      }
      setCalendarStatus({
        loading: false,
        isWorkingDay: true,
        reason: null,
        holidayName: null,
        calendarUnavailable: false,
      })
    } catch (calendarError) {
      console.error('Fetch Attendance Calendar Error:', calendarError)
      // Fail closed: don't allow manual attendance marking if the calendar
      // settings could not be verified.
      setCalendarStatus({
        loading: false,
        isWorkingDay: false,
        reason: 'calendar_error',
        holidayName: null,
        calendarUnavailable: true,
      })
    }
  }

  // ======================================
  // FETCH ATTENDANCE
  // ======================================

  const fetchAttendance =
    async () => {
      try {
        setLoading(true)
        await fetchCalendarStatus(selectedDate)
        setError('')
        setMessage('')
        const response =
          await axios.get(
            `${API_URL}/faculty-attendance`,
            {
              ...getHeaders(),
              params: {
                date:
                  selectedDate,
              },
            }
          )
        if (
          response.data.success
        ) {
          const facultyList =
            response.data.faculty || []
          setFaculty(
            facultyList
          )

          // ==============================
          // BUILD ATTENDANCE OBJECT
          // ==============================

          const attendanceData = {}
          facultyList.forEach(
            (member) => {
              attendanceData[
                member.facultyId
              ] =
                member.status || ''
            }
          )
          setAttendance(
            attendanceData
          )
          const remarksData = {}
          facultyList.forEach((member) => {
            remarksData[member.facultyId] = member.remarks || member.attendanceRemarks || ''
          })
          setRemarks(remarksData)
        }
        else {
          setError(
            response.data.message ||
            'Unable to load faculty attendance.'
          )
        }
      }
      catch (error) {
        console.log(
          'Fetch Faculty Attendance Error:',
          error
        )
        setError(
          error?.response?.data?.message ||
          'Unable to load faculty attendance.'
        )
      }
      finally {
        setLoading(false)
      }
    }

  // ======================================
  // LOAD WHEN DATE CHANGES
  // ======================================

  useEffect(() => {
    fetchAttendance()
  }, [selectedDate])

  // ======================================
  // MARK ATTENDANCE
  // ======================================

  const markAttendance =
    (
      facultyId,
      status
    ) => {
      if (calendarStatus.loading || !calendarStatus.isWorkingDay) {
        return
      }
      setAttendance(
        (previous) => ({
          ...previous,
          [facultyId]:
            status,
        })
      )
      setMessage('')
      setError('')
    }

  // ======================================
  // SAVE ALL ATTENDANCE
  // ======================================

  const saveAttendance =
    async () => {
      try {
        if (calendarStatus.loading || !calendarStatus.isWorkingDay) {
          setError(
            calendarStatus.calendarUnavailable
              ? 'Attendance calendar settings could not be loaded. Please refresh and try again.'
              : 'Attendance cannot be marked on a holiday or weekly off.'
          )
          return
        }
        setSaving(true)
        setError('')
        setMessage('')
        const records =
          faculty.map(
            (member) => ({
              facultyId:
                member.facultyId,
              status:
                attendance[
                  member.facultyId
                ],
              remarks:
                remarks[member.facultyId] || '',
            })
          )
          .filter(
            (item) =>
              item.status ===
                'Present' ||
              item.status ===
                'Absent' ||
              item.status ===
                'Late'
          )
        if (
          records.length === 0
        ) {
          setError(
            'Please mark attendance for at least one faculty member.'
          )
          return
        }
        const response =
          await axios.post(
            `${API_URL}/faculty-attendance/bulk`,
            {
              date:
                selectedDate,
              attendance:
                records,
            },
            getHeaders()
          )
        if (
          response.data.success
        ) {
          setMessage(
            'Faculty attendance saved successfully.'
          )
          // Reload current date
          await fetchAttendance()
        }
        else {
          setError(
            response.data.message ||
            'Unable to save attendance.'
          )
        }
      }
      catch (error) {
        console.log(
          'Save Faculty Attendance Error:',
          error
        )
        setError(
          error?.response?.data?.message ||
          'Unable to save faculty attendance.'
        )
      }
      finally {
        setSaving(false)
      }
    }

  // ======================================
  // VIEW FACULTY ATTENDANCE
  // ======================================

  const openView =
    async (member) => {
      setSelectedFaculty(
        member
      )
      setViewType('daily')
      setViewData(null)
      await fetchViewData(
        member.facultyId,
        'daily'
      )
    }

  // ======================================
  // FETCH VIEW DATA
  // ======================================

  const fetchViewData =
    async (
      facultyId,
      type
    ) => {
      try {
        setViewLoading(true)
        setError('')
        let response

        // ==================================
        // DAILY
        // ==================================

        if (
          type === 'daily'
        ) {
          response =
            await axios.get(
              `${API_URL}/faculty-attendance/${facultyId}/daily`,
              getHeaders()
            )
        }

        // ==================================
        // MONTHLY
        // ==================================

        if (
          type === 'monthly'
        ) {
          const now =
            new Date()
          response =
            await axios.get(
              `${API_URL}/faculty-attendance/${facultyId}/monthly`,
              {
                ...getHeaders(),
                params: {
                  year:
                    now.getFullYear(),
                  month:
                    now.getMonth() + 1,
                },
              }
            )
        }

        // ==================================
        // YEARLY
        // ==================================

        if (
          type === 'yearly'
        ) {
          const now =
            new Date()
          response =
            await axios.get(
              `${API_URL}/faculty-attendance/${facultyId}/yearly`,
              {
                ...getHeaders(),
                params: {
                  year:
                    now.getFullYear(),
                },
              }
            )
        }
        if (
          response?.data?.success
        ) {
          setViewData(
            response.data
          )
        }
        else {
          setViewData(null)
          setError(
            response?.data?.message ||
            'Unable to load attendance records.'
          )
        }
      }
      catch (error) {
        console.log(
          'View Faculty Attendance Error:',
          error
        )
        setViewData(null)
        setError(
          error?.response?.data?.message ||
          'Unable to load attendance records.'
        )
      }
      finally {
        setViewLoading(false)
      }
    }

  // ======================================
  // CHANGE VIEW TYPE
  // ======================================

  const changeViewType =
    async (type) => {
      setViewType(type)
      setViewData(null)
      if (
        selectedFaculty
      ) {
        await fetchViewData(
          selectedFaculty.facultyId,
          type
        )
      }
    }

  // ======================================
  // CLOSE VIEW
  // ======================================

  const closeView =
    () => {
      setSelectedFaculty(null)
      setViewData(null)
      setViewType('daily')
    }

  // ======================================
  // PRINT ATTENDANCE
  // ======================================

  const printAttendance = () => {
    const printArea = document.getElementById(
      'faculty-attendance-print-area'
    )
    if (!printArea) return
    const modalBody = printArea.querySelector('.modal-body')
    if (!modalBody) return
    const printWindow = window.open(
      '',
      '_blank',
      'width=1000,height=800'
    )
    if (!printWindow) {
      setError('Please allow pop-ups to print attendance.')
      return
    }
    const logo = document.querySelector(
      'img[alt*="logo" i], img[src*="logo" i]'
    )
    const logoHtml = logo?.src
      ? `<img src="${logo.src}" class="institute-logo" alt="Institute Logo" />`
      : ''
    const reportTitle =
      viewType === 'daily'
        ? 'Daily Faculty Attendance Report'
        : viewType === 'monthly'
          ? 'Monthly Faculty Attendance Report'
          : 'Yearly Faculty Attendance Report'
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 24px;
              font-family: Arial, Helvetica, sans-serif;
              color: #1f2937;
              background: #fff;
            }
            .report {
              max-width: 900px;
              margin: 0 auto;
            }
            .branding {
              text-align: center;
              padding-bottom: 14px;
              border-bottom: 2px solid #1f4e79;
              margin-bottom: 18px;
            }
            .institute-logo {
              width: 64px;
              height: 64px;
              object-fit: contain;
              margin-bottom: 6px;
            }
            .institute-name {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
              color: #163a5f;
            }
            .institute-subtitle {
              margin: 4px 0 0;
              font-size: 12px;
              color: #6b7280;
            }
            .report-title {
              margin: 14px 0 4px;
              font-size: 18px;
              font-weight: 700;
              color: #111827;
            }
            .faculty-info {
              margin: 0;
              font-size: 13px;
              color: #4b5563;
            }
            .modal-body {
              width: 100%;
            }
            .btn-group,
            button {
              display: none !important;
            }
            .row {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-bottom: 14px;
            }
            .col-md-3 {
              flex: 1 1 20%;
              min-width: 130px;
            }
            .card {
              border: 1px solid #d9dee5;
              border-radius: 6px;
              background: #fff;
            }
            .card-body {
              padding: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 12px;
            }
            th {
              background: #eef3f8 !important;
              color: #1f2937;
              font-weight: 700;
            }
            th, td {
              border: 1px solid #cfd6de;
              padding: 7px 8px;
              text-align: left;
            }
            .badge {
              display: inline-block;
              padding: 3px 7px;
              border: 1px solid #9ca3af;
              border-radius: 4px;
              font-size: 11px;
            }
            .report-footer {
              margin-top: 20px;
              padding-top: 8px;
              border-top: 1px solid #d9dee5;
              text-align: center;
              font-size: 10px;
              color: #6b7280;
            }
            @page {
              size: A4;
              margin: 12mm;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="branding">
              ${logoHtml}
              <h1 class="institute-name">Prerna Institute Of Excellence</h1>
              <p class="institute-subtitle">Faculty Attendance Management</p>
              <h2 class="report-title">${reportTitle}</h2>
              <p class="faculty-info">
                Faculty: ${selectedFaculty?.name || '-'}
                  |
                Designation: ${selectedFaculty?.designation || '-'}
                  |
                Subject: ${selectedFaculty?.subject || '-'}
              </p>
            </div>
            ${modalBody.innerHTML}
            <div class="report-footer">
              Generated from EduPortal Admin Panel
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 400)
  }
  // FORMAT DATE
  // ======================================
  const formatDate =
    (date) => {
      if (!date) {
        return '-'
      }
      const parts =
        date.split('-')
      if (
        parts.length !== 3
      ) {
        return date
      }
      return `${parts[2]}-${parts[1]}-${parts[0]}`
    }

  // ======================================
  // STATUS BADGE
  // ======================================

  const getStatusBadge =
    (status) => {
      if (
        status === 'Present'
      ) {
        return 'badge bg-success'
      }
      if (
        status === 'Absent'
      ) {
        return 'badge bg-danger'
      }
      if (
        status === 'Late'
      ) {
        return 'badge bg-warning text-dark'
      }
      return 'badge bg-secondary'
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
          Loading faculty attendance...
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Faculty Attendance
          </h2>
          <p className="text-muted mb-0">
            Mark and manage faculty attendance.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={fetchAttendance}
        >
          <i className="fas fa-sync-alt me-2" />
          Refresh
        </button>
      </div>
      {/* ==================================
          ALERTS
      ================================== */}
      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      {calendarStatus.loading ? (
        <div className="alert alert-info">
          Checking working day and holiday settings...
        </div>
      ) : calendarStatus.calendarUnavailable ? (
        <div className="alert alert-danger">
          Attendance calendar settings could not be loaded. Attendance marking
          is disabled until the settings are available. Please refresh or check
          the backend attendance calendar routes.
        </div>
      ) : !calendarStatus.isWorkingDay ? (
        <div className="alert alert-warning">
          <strong>
            {calendarStatus.reason === 'holiday'
              ? `Institute Holiday: ${calendarStatus.holidayName}`
              : 'Weekly Off'}
          </strong>
          <div>
            Faculty attendance cannot be marked for {formatDate(selectedDate)}.
            Automatic Absent marking is also skipped for this date.
          </div>
        </div>
      ) : (
        <div className="alert alert-success py-2">
          Working day — attendance marking is enabled.
        </div>
      )}
      {/* ==================================
          DATE + SAVE
      ================================== */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row align-items-end g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Attendance Date
              </label>
              <input
                type="date"
                className="form-control"
                value={
                  selectedDate
                }
                onChange={(
                  event
                ) =>
                  setSelectedDate(
                    event.target.value
                  )
                }
              />
            </div>
            <div className="col-md-8 text-md-end">
              <small className="text-muted d-block mb-2">
                {
                  faculty.length
                }
                {' '}
                Active Faculty
              </small>
              <button
                type="button"
                className="btn btn-primary"
                onClick={
                  saveAttendance
                }
                disabled={
                  saving ||
                  faculty.length === 0 ||
                  calendarStatus.loading ||
                  !calendarStatus.isWorkingDay
                }
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2" />
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ==================================
          FACULTY TABLE
      ================================== */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          {faculty.length === 0 ? (
            <div className="text-center py-5">
              <div
                style={{
                  fontSize: '48px',
                }}
              >
                👨‍🏫
              </div>
              <h5 className="fw-bold mt-3">
                No Active Faculty
              </h5>
              <p className="text-muted mb-0">
                There are no active faculty members.
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
                      Faculty
                    </th>
                    <th>
                      Designation
                    </th>
                    <th>
                      Subject
                    </th>
                    <th>
                      Attendance
                    </th>
                    <th>
                      View
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map(
                    (member, index) => (
                      <tr
                        key={
                          member.facultyId
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
                              member.name
                            }
                          </div>
                          {member.employeeId && (
                            <small className="text-muted">
                              ID: {
                                member.employeeId
                              }
                            </small>
                          )}
                        </td>
                        <td>
                          {
                            member.designation
                          }
                        </td>
                        <td>
                          {
                            member.subject
                          }
                        </td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              type="button"
                              className={
                                attendance[
                                  member.facultyId
                                ] === 'Present'
                                  ? 'btn btn-success btn-sm'
                                  : 'btn btn-outline-success btn-sm'
                              }
                              onClick={() =>
                                markAttendance(
                                  member.facultyId,
                                  'Present'
                                )
                              }
                              disabled={
                                calendarStatus.loading ||
                                !calendarStatus.isWorkingDay
                              }
                            >
                              <i className="fas fa-check me-1" />
                              Present
                            </button>
                            <button
                              type="button"
                              className={
                                attendance[
                                  member.facultyId
                                ] === 'Absent'
                                  ? 'btn btn-danger btn-sm'
                                  : 'btn btn-outline-danger btn-sm'
                              }
                              onClick={() =>
                                markAttendance(
                                  member.facultyId,
                                  'Absent'
                                )
                              }
                              disabled={
                                calendarStatus.loading ||
                                !calendarStatus.isWorkingDay
                              }
                            >
                              <i className="fas fa-times me-1" />
                              Absent
                            </button>
                            <button
                              type="button"
                              className={
                                attendance[member.facultyId] === 'Late'
                                  ? 'btn btn-warning btn-sm'
                                  : 'btn btn-outline-warning btn-sm'
                              }
                              onClick={() =>
                                markAttendance(member.facultyId, 'Late')
                              }
                              disabled={
                                calendarStatus.loading ||
                                !calendarStatus.isWorkingDay
                              }
                            >
                              <i className="fas fa-clock me-1" />
                              Late
                            </button>
                          </div>
                          {attendance[member.facultyId] === 'Late' && (
                            <input
                              type="text"
                              className="form-control form-control-sm mt-2"
                              placeholder="Late remarks (optional)"
                              maxLength={500}
                              value={remarks[member.facultyId] || ''}
                              onChange={(event) =>
                                setRemarks((previous) => ({
                                  ...previous,
                                  [member.facultyId]: event.target.value,
                                }))
                              }
                              disabled={
                                calendarStatus.loading ||
                                !calendarStatus.isWorkingDay
                              }
                            />
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              openView(member)
                            }
                          >
                            <i className="fas fa-eye me-1" />
                            View
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
          VIEW MODAL
      ================================== */}
      {selectedFaculty && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor:
              'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content" id="faculty-attendance-print-area">
              {/* HEADER */}
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    {
                      selectedFaculty.name
                    }
                  </h5>
                  <small className="text-muted">
                    {
                      selectedFaculty.designation
                    }
                    {' • '}
                    {
                      selectedFaculty.subject
                    }
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={
                    closeView
                  }
                />
              </div>
              {/* BODY */}
              <div className="modal-body">
                {/* TABS */}
                <div className="btn-group w-100 mb-4">
                  <button
                    type="button"
                    className={
                      viewType === 'daily'
                        ? 'btn btn-primary'
                        : 'btn btn-outline-primary'
                    }
                    onClick={() =>
                      changeViewType(
                        'daily'
                      )
                    }
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    className={
                      viewType === 'monthly'
                        ? 'btn btn-primary'
                        : 'btn btn-outline-primary'
                    }
                    onClick={() =>
                      changeViewType(
                        'monthly'
                      )
                    }
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    className={
                      viewType === 'yearly'
                        ? 'btn btn-primary'
                        : 'btn btn-outline-primary'
                    }
                    onClick={() =>
                      changeViewType(
                        'yearly'
                      )
                    }
                  >
                    Yearly
                  </button>
                </div>
                {/* VIEW LOADING */}
                {viewLoading ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border"
                      role="status"
                    >
                      <span className="visually-hidden">
                        Loading...
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ==================================
                        DAILY
                    ================================== */}
                    {viewType === 'daily' && (
                      <>
                        <h6 className="fw-bold mb-3">
                          Attendance Records
                        </h6>
                        {viewData?.records?.length === 0 ? (
                          <div className="alert alert-light border">
                            No attendance records found.
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
                                    Date
                                  </th>
                                  <th>
                                    Status
                                  </th>
                                  <th>
                                    Remarks
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {viewData?.records?.map(
                                  (record, index) => (
                                    <tr
                                      key={
                                        record._id
                                      }
                                    >
                                      <td>
                                        {
                                          index + 1
                                        }
                                      </td>
                                      <td>
                                        {
                                          formatDate(
                                            record.date
                                          )
                                        }
                                      </td>
                                      <td>
                                        <span
                                          className={
                                            getStatusBadge(
                                              record.status
                                            )
                                          }
                                        >
                                          {
                                            record.status
                                          }
                                        </span>
                                      </td>
                                      <td>{record.remarks || '-'}</td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                    {/* ==================================
                        MONTHLY
                    ================================== */}
                    {viewType === 'monthly' && (
                      <>
                        <div className="row g-3 mb-4">
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Present
                                </small>
                                <h4 className="fw-bold text-success mb-0 mt-2">
                                  {
                                    viewData?.summary?.present || 0
                                  }
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Absent
                                </small>
                                <h4 className="fw-bold text-danger mb-0 mt-2">
                                  {
                                    viewData?.summary?.absent || 0
                                  }
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Late
                                </small>
                                <h4 className="fw-bold text-warning mb-0 mt-2">
                                  {viewData?.summary?.late || 0}
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Total
                                </small>
                                <h4 className="fw-bold mb-0 mt-2">
                                  {
                                    viewData?.summary?.total || 0
                                  }
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Attendance
                                </small>
                                <h4 className="fw-bold mb-0 mt-2">
                                  {
                                    viewData?.summary?.percentage || 0
                                  }%
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive">
                          <table className="table table-bordered align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>
                                  #
                                </th>
                                <th>
                                  Date
                                </th>
                                <th>
                                  Status
                                </th>
                                <th>
                                  Remarks
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {viewData?.records?.map(
                                (record, index) => (
                                  <tr
                                    key={
                                      record._id
                                    }
                                  >
                                    <td>
                                      {
                                        index + 1
                                      }
                                    </td>
                                    <td>
                                      {
                                        formatDate(
                                          record.date
                                        )
                                      }
                                    </td>
                                    <td>
                                      <span
                                        className={
                                          getStatusBadge(
                                            record.status
                                          )
                                        }
                                      >
                                        {
                                          record.status
                                        }
                                      </span>
                                    </td>
                                    <td>{record.remarks || '-'}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                    {/* ==================================
                        YEARLY
                    ================================== */}
                    {viewType === 'yearly' && (
                      <>
                        <div className="row g-3 mb-4">
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Present
                                </small>
                                <h4 className="fw-bold text-success mb-0 mt-2">
                                  {
                                    viewData?.summary?.present || 0
                                  }
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Absent
                                </small>
                                <h4 className="fw-bold text-danger mb-0 mt-2">
                                  {
                                    viewData?.summary?.absent || 0
                                  }
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Late
                                </small>
                                <h4 className="fw-bold text-warning mb-0 mt-2">
                                  {viewData?.summary?.late || 0}
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Total
                                </small>
                                <h4 className="fw-bold mb-0 mt-2">
                                  {
                                    viewData?.summary?.total || 0
                                  }
                                </h4>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-3">
                            <div className="card border">
                              <div className="card-body">
                                <small className="text-muted">
                                  Attendance
                                </small>
                                <h4 className="fw-bold mb-0 mt-2">
                                  {
                                    viewData?.summary?.percentage || 0
                                  }%
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="table-responsive">
                          <table className="table table-bordered align-middle">
                            <thead className="table-light">
                              <tr>
                                <th>
                                  #
                                </th>
                                <th>
                                  Date
                                </th>
                                <th>
                                  Status
                                </th>
                                <th>
                                  Remarks
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {viewData?.records?.map(
                                (record, index) => (
                                  <tr
                                    key={
                                      record._id
                                    }
                                  >
                                    <td>
                                      {
                                        index + 1
                                      }
                                    </td>
                                    <td>
                                      {
                                        formatDate(
                                          record.date
                                        )
                                      }
                                    </td>
                                    <td>
                                      <span
                                        className={
                                          getStatusBadge(
                                            record.status
                                          )
                                        }
                                      >
                                        {
                                          record.status
                                        }
                                      </span>
                                    </td>
                                    <td>{record.remarks || '-'}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={printAttendance}
                >
                  <i className="fas fa-file-pdf me-2" />
                  Create PDF
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={
                    closeView
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
export default FacultyAttendance
