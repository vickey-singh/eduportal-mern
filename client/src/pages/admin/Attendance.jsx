import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'
import {
  getAdminAttendanceStudents,
  saveAdminBulkAttendance,
  getAttendanceSettings,
  updateAttendanceSettings,
  getAttendanceHolidays,
  createAttendanceHoliday,
  updateAttendanceHoliday,
  deleteAttendanceHoliday,
} from '../../services/attendanceService'
import {
  getCourses,
} from '../../services/courseService'
function Attendance() {
  // ======================================
  // NAVIGATION
  // ======================================
  const navigate =
    useNavigate()
  // ======================================
  // COURSES
  // ======================================
  const [courseData, setCourseData] =
    useState([])
  // ======================================
  // STUDENTS
  // ======================================
  const [students, setStudents] =
    useState([])
  // ======================================
  // SELECTED COURSE
  // ======================================
  const [selectedCourse, setSelectedCourse] =
    useState('')
  // ======================================
  // SELECTED BATCH TIME
  // ======================================
  const [selectedBatchTime, setSelectedBatchTime] =
    useState('')
  // ======================================
  // COURSE STUDENTS
  // ======================================
  //
  // Course select karne ke baad course ke
  // saare students temporarily load honge.
  //
  // In students ke actual batchTime se
  // Attendance batch dropdown banega.
  //
  // ======================================
  const [courseStudents, setCourseStudents] =
    useState([])
  // ======================================
  // DATE
  // ======================================
  const getTodayDate = () => {
    const today =
      new Date()
    const year =
      today.getFullYear()
    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0')
    const day =
      String(
        today.getDate()
      ).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const [selectedDate, setSelectedDate] =
    useState(
      getTodayDate()
    )
  // ======================================
  // ATTENDANCE
  // ======================================
  //
  // Example:
  //
  // {
  //   studentId: 'Present'
  // }
  //
  // ======================================
  const [attendance, setAttendance] =
    useState({})
  const [attendanceRemarks, setAttendanceRemarks] =
    useState({})
  const [attendanceReportHtml, setAttendanceReportHtml] = useState('')
  // ======================================
  // LOADING
  // ======================================
  const [loading, setLoading] =
    useState(false)
  // ======================================
  // LOADING BATCHES
  // ======================================
  const [loadingBatches, setLoadingBatches] =
    useState(false)
  // ======================================
  // SAVING
  // ======================================
  const [saving, setSaving] =
    useState(false)
  // ======================================
  // WORKING DAYS + HOLIDAY MANAGER
  // ======================================
  const defaultWorkingDays = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  }
  const weekdayLabels = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ]
  const [workingDays, setWorkingDays] = useState(defaultWorkingDays)
  const [holidays, setHolidays] = useState([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [workingDaysSaving, setWorkingDaysSaving] = useState(false)
  const [holidaySaving, setHolidaySaving] = useState(false)
  const [editingHolidayId, setEditingHolidayId] = useState('')
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    startDate: getTodayDate(),
    endDate: getTodayDate(),
  })
  const [calendarError, setCalendarError] = useState('')
  const [calendarMessage, setCalendarMessage] = useState('')
  // ======================================
  // FETCH COURSES
  // ======================================
  useEffect(() => {
    fetchCourses()
  }, [])
  useEffect(() => {
    loadAttendanceCalendar()
  }, [])
  const loadAttendanceCalendar = async () => {
    setCalendarLoading(true)
    setCalendarError('')
    try {
      const [settingsResponse, holidaysResponse] = await Promise.all([
        getAttendanceSettings(),
        getAttendanceHolidays(),
      ])
      setWorkingDays({
        ...defaultWorkingDays,
        ...(settingsResponse?.settings?.workingDays || {}),
      })
      setHolidays(holidaysResponse?.holidays || [])
    } catch (error) {
      console.error('Load Attendance Calendar Error:', error)
      setCalendarError(
        error.response?.data?.message ||
        'Unable to load working days and holidays. Please check admin login and backend.'
      )
    } finally {
      setCalendarLoading(false)
    }
  }
  const handleWorkingDayToggle = (dayKey, checked) => {
    setWorkingDays((previous) => ({ ...previous, [dayKey]: checked }))
    setCalendarMessage('')
    setCalendarError('')
  }
  const handleSaveWorkingDays = async () => {
    setWorkingDaysSaving(true)
    setCalendarError('')
    setCalendarMessage('')
    try {
      const response = await updateAttendanceSettings(workingDays)
      setWorkingDays({ ...defaultWorkingDays, ...(response?.settings?.workingDays || workingDays) })
      setCalendarMessage(response?.message || 'Working days saved successfully.')
    } catch (error) {
      setCalendarError(error.response?.data?.message || 'Unable to save working days.')
    } finally {
      setWorkingDaysSaving(false)
    }
  }
  const handleHolidayFormChange = (event) => {
    const { name, value } = event.target
    setHolidayForm((previous) => ({ ...previous, [name]: value }))
  }
  const resetHolidayForm = () => {
    setEditingHolidayId('')
    setHolidayForm({ name: '', startDate: getTodayDate(), endDate: getTodayDate() })
  }
  const handleEditHoliday = (holiday) => {
    setEditingHolidayId(holiday._id)
    setHolidayForm({
      name: holiday.name || '',
      startDate: holiday.startDate,
      endDate: holiday.endDate,
    })
    setCalendarMessage('')
    setCalendarError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleSaveHoliday = async (event) => {
    event.preventDefault()
    const name = holidayForm.name.trim()
    if (!name || !holidayForm.startDate || !holidayForm.endDate) {
      setCalendarError('Holiday name, start date and end date are required.')
      return
    }
    if (holidayForm.endDate < holidayForm.startDate) {
      setCalendarError('End date cannot be earlier than start date.')
      return
    }
    setHolidaySaving(true)
    setCalendarError('')
    setCalendarMessage('')
    try {
      const payload = { name, startDate: holidayForm.startDate, endDate: holidayForm.endDate }
      const response = editingHolidayId
        ? await updateAttendanceHoliday(editingHolidayId, payload)
        : await createAttendanceHoliday(payload)
      setCalendarMessage(response?.message || 'Holiday saved successfully.')
      resetHolidayForm()
      const holidaysResponse = await getAttendanceHolidays()
      setHolidays(holidaysResponse?.holidays || [])
    } catch (error) {
      setCalendarError(error.response?.data?.message || 'Unable to save holiday.')
    } finally {
      setHolidaySaving(false)
    }
  }
  const handleDeleteHoliday = async (holiday) => {
    const confirmed = window.confirm(`Delete holiday "${holiday.name}" (${holiday.startDate} to ${holiday.endDate})?`)
    if (!confirmed) return
    setCalendarError('')
    setCalendarMessage('')
    try {
      const response = await deleteAttendanceHoliday(holiday._id)
      setHolidays((previous) => previous.filter((item) => item._id !== holiday._id))
      if (editingHolidayId === holiday._id) resetHolidayForm()
      setCalendarMessage(response?.message || 'Holiday deleted successfully.')
    } catch (error) {
      setCalendarError(error.response?.data?.message || 'Unable to delete holiday.')
    }
  }
  // ======================================
  // GET COURSES
  // ======================================
  const fetchCourses = async () => {
    try {
      const data =
        await getCourses()
      setCourseData(
        data || []
      )
    }
    catch (error) {
      console.log(
        'Fetch Courses Error:',
        error
      )
    }
  }
  // ======================================
  // AVAILABLE BATCH TIMES
  // ======================================
  //
  // Course ke students ke actual
  // batchTime se unique batch list banegi.
  //
  // ======================================
  const batchTimes =
    useMemo(() => {
      if (
        !courseStudents.length
      ) {
        return []
      }
      const times =
        courseStudents
          .map(
            (student) =>
              String(
                student.batchTime || ''
              ).trim()
          )
          .filter(
            (time) =>
              time !== ''
          )
      return [
        ...new Set(times)
      ]
    }, [
      courseStudents,
    ])
  // ======================================
  // COURSE CHANGE
  // ======================================
  const handleCourseChange = async (e) => {
    const value =
      e.target.value
    setSelectedCourse(
      value
    )
    setAttendanceReportHtml('')
    // ==================================
    // RESET BATCH
    // ==================================
    setSelectedBatchTime('')
    // ==================================
    // RESET STUDENTS
    // ==================================
    setStudents([])
    // ==================================
    // RESET COURSE STUDENTS
    // ==================================
    setCourseStudents([])
    // ==================================
    // RESET ATTENDANCE
    // ==================================
    setAttendance({})
    setAttendanceRemarks({})
    // ==================================
    // NO COURSE
    // ==================================
    if (!value) {
      return
    }
    try {
      setLoadingBatches(true)
      // ==================================
      // GET ALL STUDENTS OF COURSE
      // ==================================
      //
      // Batch time intentionally empty.
      // Backend then returns all students
      // belonging to this course.
      //
      // ==================================
      const response =
        await getAdminAttendanceStudents({
          course:
            value,
          batchTime:
            '',
          date:
            selectedDate,
        })
      const studentList =
        response?.students || []
      setCourseStudents(
        studentList
      )
    }
    catch (error) {
      console.log(
        'Load Course Students Error:',
        error
      )
      setCourseStudents([])
    }
    finally {
      setLoadingBatches(false)
    }
  }
  // ======================================
  // BATCH CHANGE
  // ======================================
  const handleBatchChange = (e) => {
    const value =
      e.target.value
    setSelectedBatchTime(
      value
    )
    setAttendanceReportHtml('')
    // Students reset
    setStudents([])
    // Attendance reset
    setAttendance({})
    setAttendanceRemarks({})
  }
  // ======================================
  // DATE CHANGE
  // ======================================
  const handleDateChange = (e) => {
    const value =
      e.target.value
    setSelectedDate(
      value
    )
    setAttendanceReportHtml('')
    // Existing loaded students reset
    setStudents([])
    // Attendance reset
    setAttendance({})
    setAttendanceRemarks({})
  }
  // ======================================
  // LOAD STUDENTS
  // ======================================
  const loadStudents = async () => {
    // ==================================
    // COURSE CHECK
    // ==================================
    if (!selectedCourse) {
      alert(
        'Please select a course'
      )
      return
    }
    // ==================================
    // BATCH CHECK
    // ==================================
    if (!selectedBatchTime) {
      alert(
        'Please select a batch time'
      )
      return
    }
    // ==================================
    // DATE CHECK
    // ==================================
    if (!selectedDate) {
      alert(
        'Please select a date'
      )
      return
    }
    try {
      setLoading(true)
      // ==================================
      // GET STUDENTS
      // ==================================
      const response =
        await getAdminAttendanceStudents({
          course:
            selectedCourse,
          batchTime:
            selectedBatchTime,
          date:
            selectedDate,
        })
      const studentList =
        response?.students || []
      setStudents(
        studentList
      )
      // ==================================
      // EXISTING ATTENDANCE
      // ==================================
      const attendanceData = {}
      const remarksData = {}
      studentList.forEach(
        (student) => {
          if (student.attendanceStatus) {
            attendanceData[student._id] = student.attendanceStatus
          }
          if (student.attendanceRemarks) {
            remarksData[student._id] = student.attendanceRemarks
          }
        }
      )
      setAttendance(attendanceData)
      setAttendanceRemarks(remarksData)
    }
    catch (error) {
      console.log(
        'Load Attendance Students Error:',
        error
      )
      alert(
        error.response?.data?.message ||
        'Unable to load students'
      )
    }
    finally {
      setLoading(false)
    }
  }
  // ======================================
  // MARK ATTENDANCE
  // ======================================
  const markAttendance = (
    studentId,
    status
  ) => {
    setAttendanceReportHtml('')
    setAttendance((previous) => ({
      ...previous,
      [studentId]: status,
    }))
    if (status !== 'Late') {
      setAttendanceRemarks((previous) => ({
        ...previous,
        [studentId]: '',
      }))
    }
  }

  const handleAttendanceRemarksChange = (studentId, value) => {
    setAttendanceReportHtml('')
    setAttendanceRemarks((previous) => ({
      ...previous,
      [studentId]: value.slice(0, 500),
    }))
  }
  // ======================================
  // MARK ALL PRESENT
  // ======================================
  const markAllPresent = () => {
    setAttendanceReportHtml('')
    const updatedAttendance = {}
    students.forEach(
      (student) => {
        updatedAttendance[
          student._id
        ] = 'Present'
      }
    )
    setAttendance(updatedAttendance)
    setAttendanceRemarks({})
  }
  // ======================================
  // MARK ALL ABSENT
  // ======================================
  const markAllAbsent = () => {
    setAttendanceReportHtml('')
    const updatedAttendance = {}
    students.forEach(
      (student) => {
        updatedAttendance[
          student._id
        ] = 'Absent'
      }
    )
    setAttendance(updatedAttendance)
    setAttendanceRemarks({})
  }
  // ======================================
  // SAVE ATTENDANCE
  // ======================================
  const handleSaveAttendance =
    async () => {
      // ==================================
      // STUDENT CHECK
      // ==================================
      if (
        students.length === 0
      ) {
        alert(
          'No students found'
        )
        return
      }
      // Save only the students explicitly marked by the admin.
      // Unmarked students are allowed to remain unmarked.
      const markedStudents = students.filter(
        (student) => ['Present', 'Absent', 'Late'].includes(attendance[student._id])
      )
      if (markedStudents.length === 0) {
        alert('Please mark attendance for at least one student.')
        return
      }
      const lateWithoutRemarks = markedStudents.filter(
        (student) =>
          attendance[student._id] === 'Late' &&
          !String(attendanceRemarks[student._id] || '').trim()
      )
      if (lateWithoutRemarks.length > 0) {
        alert(`Please add remarks for every Late student. Missing remarks: ${lateWithoutRemarks.length}.`)
        return
      }
      try {
        setSaving(true)
        // ==================================
        // PREPARE DATA
        // ==================================
        const attendanceData = markedStudents.map((student) => ({
          student: student._id,
          status: attendance[student._id],
          remarks: attendance[student._id] === 'Late'
            ? String(attendanceRemarks[student._id] || '').trim()
            : '',
        }))
        // ==================================
        // SAVE
        // ==================================
        const response =
          await saveAdminBulkAttendance({
            date:
              selectedDate,
            attendance:
              attendanceData,
          })
        alert(
          response.message ||
          'Attendance Saved Successfully'
        )
        // ==================================
        // RELOAD
        // ==================================
        await loadStudents()
      }
      catch (error) {
        console.log(
          'Save Attendance Error:',
          error
        )
        alert(
          error.response?.data?.message ||
          'Unable to save attendance'
        )
      }
      finally {
        setSaving(false)
      }
    }
  // ======================================
  // VIEW STUDENT ATTENDANCE
  // ======================================
  const handleView = (
    studentId
  ) => {
    navigate(
      `/admin/attendance/student/${studentId}`
    )
  }
  // ======================================
  // COUNTS
  // ======================================
  const presentCount =
    students.filter(
      (student) =>
        attendance[
          student._id
        ] === 'Present'
    ).length
  const absentCount =
    students.filter(
      (student) =>
        attendance[
          student._id
        ] === 'Absent'
    ).length
  const lateCount =
    students.filter(
      (student) =>
        attendance[
          student._id
        ] === 'Late'
    ).length
  const unmarkedCount =
    students.length -
    presentCount -
    absentCount -
    lateCount
  // Generate a print-ready attendance report. In the browser print dialog,
  // choose "Save as PDF" to download the PDF without an extra dependency.
  const handleCreateAttendancePDF = () => {
    if (!students.length) {
      window.alert('Please load students before creating the attendance PDF.')
      return
    }
    const escapeHtml = (value) =>
      String(value ?? '-')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    const reportPresentCount = students.filter(
      (student) => attendance[student._id] === 'Present'
    ).length
    const reportAbsentCount = students.filter(
      (student) => attendance[student._id] === 'Absent'
    ).length
    const reportLateCount = students.filter(
      (student) => attendance[student._id] === 'Late'
    ).length
    const reportUnmarkedCount =
      students.length - reportPresentCount - reportAbsentCount - reportLateCount
    const rows = students
      .map((student, index) => {
        const status = attendance[student._id] || 'Not Marked'
        const statusClass =
          status === 'Present'
            ? 'present'
            : status === 'Absent'
              ? 'absent'
              : status === 'Late'
                ? 'late'
                : 'unmarked'
        return `
          <tr>
            <td class="number">${index + 1}</td>
            <td class="student-name">${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.admissionNumber)}</td>
            <td>${escapeHtml(student.rollNumber || '-')}</td>
            <td>${escapeHtml(student.batchTime || '-')}</td>
            <td><span class="status ${statusClass}">${escapeHtml(status)}</span></td>
            <td>${escapeHtml(attendance[student._id] === 'Late' ? (attendanceRemarks[student._id] || '-') : '-')}</td>
          </tr>`
      })
      .join('')
    const reportHtml = `<!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Prerna Institute of Excellence - Attendance Report - ${escapeHtml(selectedDate)}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #172033;
            background: #fff;
            font-family: Inter, Arial, Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.45;
          }
          .report { width: 100%; }
          .report-header {
            padding: 22px 24px;
            color: #fff;
            background: #173b67;
            border-radius: 10px 10px 0 0;
          }
          .eyebrow {
            margin: 0 0 5px;
            color: #c7dcf5;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1.8px;
            text-transform: uppercase;
          }
          h1 { margin: 0; font-size: 24px; line-height: 1.2; }
          .subtitle { margin: 7px 0 0; color: #e2ecf8; font-size: 11px; }
          .report-body {
            padding: 18px 20px 16px;
            border: 1px solid #dbe4ee;
            border-top: 0;
            border-radius: 0 0 10px 10px;
          }
          .metadata {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 16px;
          }
          .meta-item {
            min-width: 145px;
            padding: 9px 12px;
            border: 1px solid #dbe4ee;
            border-radius: 7px;
            background: #f8fafc;
          }
          .meta-label {
            display: block;
            margin-bottom: 3px;
            color: #64748b;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: .7px;
            text-transform: uppercase;
          }
          .meta-value { color: #172033; font-size: 11px; font-weight: 700; }
          .summary {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 9px;
            margin-bottom: 18px;
          }
          .summary-card {
            padding: 11px 12px;
            border: 1px solid #dbe4ee;
            border-radius: 7px;
            background: #fff;
          }
          .summary-label { color: #64748b; font-size: 9px; }
          .summary-value { margin-top: 4px; color: #172033; font-size: 18px; font-weight: 700; }
          .summary-card.present-card { border-left: 3px solid #16a34a; }
          .summary-card.absent-card { border-left: 3px solid #dc2626; }
          .summary-card.late-card { border-left: 3px solid #d97706; }
          .summary-card.unmarked-card { border-left: 3px solid #64748b; }
          table { width: 100%; border-collapse: collapse; }
          thead { display: table-header-group; }
          th {
            padding: 9px 8px;
            color: #fff;
            background: #244b78;
            border: 1px solid #244b78;
            font-size: 9px;
            text-align: left;
            text-transform: uppercase;
            letter-spacing: .35px;
          }
          td {
            padding: 8px;
            border: 1px solid #dbe4ee;
            color: #334155;
            vertical-align: middle;
          }
          tbody tr:nth-child(even) { background: #f8fafc; }
          tr { break-inside: avoid; }
          .number { width: 36px; text-align: center; color: #64748b; }
          .student-name { color: #172033; font-weight: 700; }
          .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 9px;
            font-weight: 700;
            white-space: nowrap;
          }
          .status.present { color: #166534; background: #dcfce7; }
          .status.absent { color: #991b1b; background: #fee2e2; }
          .status.late { color: #92400e; background: #fef3c7; }
          .status.unmarked { color: #475569; background: #e2e8f0; }
          .footer {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-top: 22px;
            padding-top: 12px;
            border-top: 1px solid #dbe4ee;
            color: #64748b;
            font-size: 9px;
          }
          .signature { color: #334155; white-space: nowrap; }
          @media screen {
            body { max-width: 1200px; margin: 24px auto; padding: 0 20px; }
          }
          @media print {
            body { padding: 0; }
            .report-header { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            th, .summary-card, .meta-item, .status {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <main class="report">
          <header class="report-header">
            <p class="eyebrow">Official Institute Attendance Record</p>
            <h1>PRERNA INSTITUTE OF EXCELLENCE</h1>
            <p class="subtitle">Student Attendance Report &nbsp; | &nbsp; Daily batch-wise attendance statement</p>
          </header>
          <section class="report-body">
            <div class="metadata">
              <div class="meta-item">
                <span class="meta-label">Course</span>
                <span class="meta-value">${escapeHtml(selectedCourse)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Batch Time</span>
                <span class="meta-value">${escapeHtml(selectedBatchTime)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Attendance Date</span>
                <span class="meta-value">${escapeHtml(selectedDate)}</span>
              </div>
            </div>
            <div class="summary">
              <div class="summary-card">
                <div class="summary-label">Total Students</div>
                <div class="summary-value">${students.length}</div>
              </div>
              <div class="summary-card present-card">
                <div class="summary-label">Present</div>
                <div class="summary-value">${reportPresentCount}</div>
              </div>
              <div class="summary-card absent-card">
                <div class="summary-label">Absent</div>
                <div class="summary-value">${reportAbsentCount}</div>
              </div>
              <div class="summary-card late-card">
                <div class="summary-label">Late</div>
                <div class="summary-value">${reportLateCount}</div>
              </div>
              <div class="summary-card unmarked-card">
                <div class="summary-label">Not Marked</div>
                <div class="summary-value">${reportUnmarkedCount}</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Admission No.</th>
                  <th>Roll No.</th>
                  <th>Batch Time</th>
                  <th>Attendance Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <footer class="footer">
              <span>Generated from Attendance Management &nbsp; | &nbsp; Generated on: ${escapeHtml(new Date().toLocaleDateString("en-IN"))}</span>
              <span class="signature">Authorized Signature: ____________________</span>
            </footer>
          </section>
        </main>
      </body>
      </html>`
    setAttendanceReportHtml(reportHtml)
  }
  const openAttendanceReport = (shouldPrint = false) => {
    if (!attendanceReportHtml) {
      window.alert('Please create the attendance PDF first.')
      return
    }
    const reportWindow = window.open('', '_blank', 'width=1100,height=800')
    if (!reportWindow) {
      window.alert('The report window was blocked. Please allow pop-ups for this site and try again.')
      return
    }
    reportWindow.document.open()
    const htmlToOpen = shouldPrint
      ? attendanceReportHtml.replace(
          '</body>',
          '<script>window.addEventListener("load", function () { window.focus(); window.print(); });</script></body>'
        )
      : attendanceReportHtml
    reportWindow.document.write(htmlToOpen)
    reportWindow.document.close()
  }
  return (
    <div className="applications-section">
      {/* ==================================
          HEADER
      \================================== */}
      <div className="applications-header">
        <h2>
          Attendance Management
        </h2>
        <p>
          Manage daily student attendance
          batch-wise.
        </p>
      </div>
      {/* WORKING DAYS AND HOLIDAY MANAGER */}
      <div className="card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
          <div>
            <h4 className="mb-1">Attendance Calendar</h4>
            <p className="text-muted mb-0">Choose the weekly working days and manage institute holidays. Automatic absent marking and absent emails are skipped on off-days and holidays.</p>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={loadAttendanceCalendar} disabled={calendarLoading}>
            {calendarLoading ? 'Loading...' : 'Refresh Calendar'}
          </button>
        </div>
        {calendarError && <div className="alert alert-danger" role="alert">{calendarError}</div>}
        {calendarMessage && <div className="alert alert-success" role="status">{calendarMessage}</div>}
        <div className="border rounded p-3 mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h5 className="mb-1">Weekly Working Days</h5>
              <small className="text-muted">Checked days are working days. Sunday is off by default.</small>
            </div>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveWorkingDays} disabled={calendarLoading || workingDaysSaving}>
              {workingDaysSaving ? 'Saving...' : 'Save Working Days'}
            </button>
          </div>
          <div className="row g-2">
            {weekdayLabels.map((day) => (
              <div className="col-6 col-sm-4 col-md-3 col-lg" key={day.key}>
                <label className={`border rounded p-3 d-flex align-items-center gap-2 h-100 ${workingDays[day.key] ? 'border-success bg-light' : ''}`} style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="form-check-input m-0"
                    checked={Boolean(workingDays[day.key])}
                    onChange={(event) => handleWorkingDayToggle(day.key, event.target.checked)}
                    disabled={calendarLoading}
                  />
                  <span>
                    <strong className="d-block">{day.label}</strong>
                    <small className={workingDays[day.key] ? 'text-success' : 'text-muted'}>{workingDays[day.key] ? 'Working' : 'Weekly off'}</small>
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="border rounded p-3">
          <h5 className="mb-1">Holiday Manager</h5>
          <p className="text-muted mb-3">Add a single-day holiday or a date range. Both the start date and end date are included.</p>
          <form onSubmit={handleSaveHoliday}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label" htmlFor="attendance-holiday-name">Holiday Name</label>
                <input id="attendance-holiday-name" className="form-control" name="name" value={holidayForm.name} onChange={handleHolidayFormChange} maxLength={120} placeholder="e.g. Diwali Vacation" required />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label" htmlFor="attendance-holiday-start">Start Date</label>
                <input id="attendance-holiday-start" type="date" className="form-control" name="startDate" value={holidayForm.startDate} onChange={handleHolidayFormChange} required />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label" htmlFor="attendance-holiday-end">End Date</label>
                <input id="attendance-holiday-end" type="date" className="form-control" name="endDate" min={holidayForm.startDate} value={holidayForm.endDate} onChange={handleHolidayFormChange} required />
              </div>
              <div className="col-md-2 mb-3 d-flex align-items-end gap-2">
                <button type="submit" className="btn btn-success w-100" disabled={holidaySaving || calendarLoading}>
                  {holidaySaving ? 'Saving...' : editingHolidayId ? 'Update' : 'Add Holiday'}
                </button>
              </div>
            </div>
            {editingHolidayId && <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={resetHolidayForm}>Cancel Edit</button>}
          </form>
          <div className="table-responsive mt-2">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr><th>Holiday</th><th>Start Date</th><th>End Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {holidays.length === 0 ? (
                  <tr><td colSpan="4" className="text-center text-muted py-4">{calendarLoading ? 'Loading holidays...' : 'No holidays added yet.'}</td></tr>
                ) : holidays.map((holiday) => (
                  <tr key={holiday._id}>
                    <td><strong>{holiday.name}</strong></td>
                    <td>{holiday.startDate}</td>
                    <td>{holiday.endDate}</td>
                    <td className="text-nowrap">
                      <button type="button" className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEditHoliday(holiday)}>Edit</button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteHoliday(holiday)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ==================================
          FILTER SECTION
      \================================== */}
      <div className="card p-4 mb-4">
        <div className="row">
          {/* ==================================
              COURSE
          \================================== */}
          <div className="col-md-4 mb-3">
            <label className="form-label">
              Course
            </label>
            <select
              className="form-control"
              value={
                selectedCourse
              }
              onChange={
                handleCourseChange
              }
            >
              <option value="">
                Select Course
              </option>
              {courseData.map(
                (course) => (
                  <option
                    key={
                      course._id
                    }
                    value={
                      course.courseName
                    }
                  >
                    {
                      course.courseName
                    }
                  </option>
                )
              )}
            </select>
          </div>
          {/* ==================================
              BATCH TIME
          \================================== */}
          <div className="col-md-4 mb-3">
            <label className="form-label">
              Batch Time
            </label>
            <select
              className="form-control"
              value={
                selectedBatchTime
              }
              onChange={
                handleBatchChange
              }
              disabled={
                !selectedCourse ||
                loadingBatches
              }
            >
              <option value="">
                {loadingBatches
                  ? 'Loading Batch Times...'
                  : 'Select Batch Time'
                }
              </option>
              {batchTimes.map(
                (batch) => (
                  <option
                    key={
                      batch
                    }
                    value={
                      batch
                    }
                  >
                    {
                      batch
                    }
                  </option>
                )
              )}
            </select>
          </div>
          {/* ==================================
              DATE
          \================================== */}
          <div className="col-md-4 mb-3">
            <label className="form-label">
              Attendance Date
            </label>
            <input
              type="date"
              className="form-control"
              value={
                selectedDate
              }
              onChange={
                handleDateChange
              }
            />
          </div>
        </div>
        {/* ==================================
            LOAD STUDENTS
        \================================== */}
        <button
          type="button"
          className="table-btn approve-btn"
          onClick={
            loadStudents
          }
          disabled={
            loading
          }
        >
          {loading
            ? 'Loading...'
            : 'Load Students'}
        </button>
      </div>
      {/* ==================================
          SUMMARY
      \================================== */}
      {students.length > 0 && (
        <div className="row mb-4">
          {/* TOTAL */}
          <div className="col-md-3 mb-3">
            <div className="card p-3 text-center">
              <h6>
                Total Students
              </h6>
              <h3>
                {
                  students.length
                }
              </h3>
            </div>
          </div>
          {/* PRESENT */}
          <div className="col-md-3 mb-3">
            <div className="card p-3 text-center">
              <h6>
                Present
              </h6>
              <h3>
                {
                  presentCount
                }
              </h3>
            </div>
          </div>
          {/* ABSENT */}
          <div className="col-md-3 mb-3">
            <div className="card p-3 text-center">
              <h6>
                Absent
              </h6>
              <h3>
                {
                  absentCount
                }
              </h3>
            </div>
          </div>
          {/* LATE */}
          <div className="col-md-3 mb-3">
            <div className="card p-3 text-center border-warning">
              <h6>Late</h6>
              <h3 className="text-warning">{lateCount}</h3>
            </div>
          </div>
        </div>
      )}
      {/* ==================================
          ATTENDANCE TABLE
      \================================== */}
      {students.length > 0 && (
        <div className="card p-4">
          {/* ==================================
              TABLE HEADER
          \================================== */}
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h5 className="mb-1">
                {
                  selectedCourse
                }
              </h5>
              <small className="text-muted">
                {
                  selectedBatchTime
                }
                {' | '}
                {
                  selectedDate
                }
              </small>
            </div>
            {/* ==================================
                MARK ALL
            \================================== */}
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleCreateAttendancePDF}
              >
                {attendanceReportHtml ? 'Regenerate PDF' : 'Create PDF'}
              </button>
              {attendanceReportHtml && (
                <>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => openAttendanceReport(false)}
                  >
                    Preview PDF
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={() => openAttendanceReport(true)}
                  >
                    Download PDF
                  </button>
                </>
              )}
              <button
                type="button"
                className="btn btn-sm btn-success me-2"
                onClick={
                  markAllPresent
                }
              >
                Mark All Present
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={
                  markAllAbsent
                }
              >
                Mark All Absent
              </button>
            </div>
          </div>
          {/* ==================================
              TABLE
          \================================== */}
          <div className="table-responsive">
            <table className="table applications-table">
              <thead>
                <tr>
                  <th>
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
                    Batch Time
                  </th>
                  <th>
                    Attendance
                  </th>
                  <th>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map(
                  (
                    student,
                    index
                  ) => (
                    <tr
                      key={
                        student._id
                      }
                    >
                      {/* NUMBER */}
                      <td>
                        {
                          index + 1
                        }
                      </td>
                      {/* STUDENT */}
                      <td>
                        <strong>
                          {
                            student.name
                          }
                        </strong>
                      </td>
                      {/* ADMISSION NUMBER */}
                      <td>
                        {
                          student.admissionNumber
                        }
                      </td>
                      {/* ROLL NUMBER */}
                      <td>
                        {
                          student.rollNumber ||
                          '-'
                        }
                      </td>
                      {/* BATCH TIME */}
                      <td>
                        {
                          student.batchTime ||
                          '-'
                        }
                      </td>
                      {/* ATTENDANCE */}
                      <td>
                        <button
                          type="button"
                          className={
                            attendance[
                              student._id
                            ] === 'Present'
                              ? 'btn btn-success btn-sm me-2'
                              : 'btn btn-outline-success btn-sm me-2'
                          }
                          onClick={() =>
                            markAttendance(
                              student._id,
                              'Present'
                            )
                          }
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          className={
                            attendance[student._id] === 'Absent'
                              ? 'btn btn-danger btn-sm me-2'
                              : 'btn btn-outline-danger btn-sm me-2'
                          }
                          onClick={() => markAttendance(student._id, 'Absent')}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          className={
                            attendance[student._id] === 'Late'
                              ? 'btn btn-warning btn-sm'
                              : 'btn btn-outline-warning btn-sm'
                          }
                          style={attendance[student._id] === 'Late' ? {
                            backgroundColor: '#facc15',
                            borderColor: '#eab308',
                            color: '#422006',
                          } : undefined}
                          onClick={() => markAttendance(student._id, 'Late')}
                        >
                          Late
                        </button>
                        {attendance[student._id] === 'Late' && (
                          <input
                            type="text"
                            className="form-control form-control-sm mt-2"
                            value={attendanceRemarks[student._id] || ''}
                            onChange={(event) =>
                              handleAttendanceRemarksChange(student._id, event.target.value)
                            }
                            maxLength={500}
                            placeholder="Late remarks (required)"
                            aria-label={`Late remarks for ${student.name}`}
                          />
                        )}
                      </td>
                      {/* VIEW */}
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            handleView(
                              student._id
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          {/* ==================================
              SAVE SECTION
          \================================== */}
          <div className="mt-3">
            {unmarkedCount > 0 && (
              <p className="text-muted mb-2">
                {unmarkedCount} student(s) left unmarked. Only marked students will be saved.
              </p>
            )}
            <button
              type="button"
              className="table-btn approve-btn"
              onClick={
                handleSaveAttendance
              }
              disabled={
                saving ||
                presentCount + absentCount + lateCount === 0
              }
            >
              {saving
                ? 'Saving...'
                : 'Save Attendance'
              }
            </button>
          </div>
        </div>
      )}
      {/* ==================================
          NO STUDENTS
      \================================== */}
      {!loading &&
        selectedCourse &&
        selectedBatchTime &&
        students.length === 0 && (
          <div className="alert alert-info">
            No students found for this
            course and batch.
          </div>
        )}
      {/* ==================================
          NO BATCH TIME
      \================================== */}
      {!loadingBatches &&
        selectedCourse &&
        batchTimes.length === 0 && (
          <div className="alert alert-warning">
            No batch time found for students
            in this course.
          </div>
        )}
    </div>
  )
}
export default Attendance
