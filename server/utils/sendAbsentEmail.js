const sendEmail = require('./sendEmail')

// ======================================
// FORMAT ATTENDANCE DATE
// ======================================

const formatAttendanceDate = (date) => {
  if (!date) return '-'

  const parts = String(date).split('-')

  if (parts.length !== 3) {
    return String(date)
  }

  return `${parts[2]}-${parts[1]}-${parts[0]}`
}

// ======================================
// ESCAPE HTML CONTENT
// ======================================

const escapeHtml = (value = '') => {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[char]
  })
}

// ======================================
// SEND ABSENT ATTENDANCE EMAIL
// ======================================

const sendAbsentEmail = async ({
  student,
  attendanceDate,
}) => {
  // ======================================
  // VALIDATION
  // ======================================

  if (!student) {
    throw new Error('Student details are required.')
  }

  if (!student.email || !student.email.trim()) {
    throw new Error('Student email address is missing.')
  }

  if (!attendanceDate) {
    throw new Error('Attendance date is required.')
  }

  // ======================================
  // STUDENT DETAILS
  // ======================================

  const studentName = escapeHtml(
    student.name || 'Student'
  )

  const admissionNumber = escapeHtml(
    student.admissionNumber || '-'
  )

  const course = escapeHtml(
    student.course || '-'
  )

  const batchTime = escapeHtml(
    student.batchTime || 'Not specified'
  )

  const formattedDate = escapeHtml(
    formatAttendanceDate(attendanceDate)
  )

  // ======================================
  // EMAIL SUBJECT
  // ======================================

  const subject =
    `Attendance Alert - Absent on ${formattedDate}`

  // ======================================
  // EMAIL HTML
  // ======================================

  const html = `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 700px;
        margin: auto;
        padding: 25px;
        color: #333;
        line-height: 1.6;
      "
    >

      <h2
        style="
          color: #b42318;
          margin-bottom: 5px;
        "
      >
        Attendance Notification
      </h2>

      <p>
        Dear <strong>${studentName}</strong>,
      </p>

      <p>
        Our attendance records show that you were marked
        <strong style="color: #b42318;">Absent</strong>
        on <strong>${formattedDate}</strong>.
      </p>

      <h3
        style="
          border-bottom: 1px solid #ddd;
          padding-bottom: 8px;
        "
      >
        Attendance Details
      </h3>

      <table
        width="100%"
        cellpadding="10"
        cellspacing="0"
        style="
          border-collapse: collapse;
          margin-bottom: 20px;
        "
      >
        <tr>
          <td style="border: 1px solid #ddd;">
            <strong>Student Name</strong>
          </td>
          <td style="border: 1px solid #ddd;">
            ${studentName}
          </td>
        </tr>

        <tr>
          <td style="border: 1px solid #ddd;">
            <strong>Admission Number</strong>
          </td>
          <td style="border: 1px solid #ddd;">
            ${admissionNumber}
          </td>
        </tr>

        <tr>
          <td style="border: 1px solid #ddd;">
            <strong>Course</strong>
          </td>
          <td style="border: 1px solid #ddd;">
            ${course}
          </td>
        </tr>

        <tr>
          <td style="border: 1px solid #ddd;">
            <strong>Batch Time</strong>
          </td>
          <td style="border: 1px solid #ddd;">
            ${batchTime}
          </td>
        </tr>

        <tr>
          <td style="border: 1px solid #ddd;">
            <strong>Attendance Date</strong>
          </td>
          <td style="border: 1px solid #ddd;">
            ${formattedDate}
          </td>
        </tr>

        <tr>
          <td style="border: 1px solid #ddd;">
            <strong>Status</strong>
          </td>
          <td
            style="
              border: 1px solid #ddd;
              color: #b42318;
              font-weight: bold;
            "
          >
            Absent
          </td>
        </tr>
      </table>

      <div
        style="
          background: #f5f5f5;
          border-left: 4px solid #b42318;
          padding: 15px;
          margin: 20px 0;
        "
      >
        If you believe this attendance record is incorrect,
        please contact the institute administration.
      </div>

      <p>
        Please ensure regular attendance in your classes.
      </p>

      <p>
        Regards,<br />
        <strong>Prerna Institute Of Excellence</strong>
      </p>

    </div>
  `

  // ======================================
  // SEND EMAIL USING BREVO
  // ======================================

  return await sendEmail({
    to: student.email.trim(),
    subject,
    html,
  })
}

// ======================================
// EXPORT
// ======================================

module.exports = sendAbsentEmail
