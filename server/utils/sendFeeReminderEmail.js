
const sendEmail = require('./sendEmail')

// Escape dynamic values before inserting them into HTML.
const escapeHtml = (value) => {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
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

// Format amounts in Indian Rupees.
const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0)
}

// Format a date for display.
const formatDate = (date) => {
  if (!date) return 'Not available'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(parsedDate)
}

const sendFeeReminderEmail = async ({
  to,
  studentName,
  admissionNumber,
  course,
  installmentNumber,
  dueDate,
  installmentAmount,
  paidAmount,
  remainingAmount,
  reminderStage,
}) => {
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
    throw new Error('Student email is missing or invalid')
  }

  const safeName = escapeHtml(studentName || 'Student')
  const safeAdmission = escapeHtml(admissionNumber || 'N/A')
  const safeCourse = escapeHtml(course || 'N/A')
  const safeInstallment = escapeHtml(installmentNumber ?? 'N/A')

  const formattedDueDate = formatDate(dueDate)
  const formattedInstallmentAmount = formatAmount(installmentAmount)
  const formattedPaidAmount = formatAmount(paidAmount)
  const formattedRemainingAmount = formatAmount(remainingAmount)

  let heading = 'Fee Payment Reminder'
  let message =
    'This is a reminder that your fee installment is approaching its due date.'

  if (reminderStage === 'due_today') {
    heading = 'Fee Payment Due Today'
    message = 'Your fee installment is due today.'
  } else if (
    reminderStage === 'overdue_3_days' ||
    reminderStage === 'overdue_weekly'
  ) {
    heading = 'Outstanding Fee Reminder'
    message =
      'Our records show that a fee installment remains outstanding. Please arrange payment at your earliest convenience.'
  }

  const subject = `${heading} - Prerna Institute Of Excellence`

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#1f2937;">
        <div style="max-width:600px;margin:24px auto;padding:24px;background:#ffffff;border-radius:10px;">
          <h2 style="color:#1d4ed8;margin-top:0;">
            Prerna Institute Of Excellence
          </h2>

          <h3>${escapeHtml(heading)}</h3>

          <p>Dear ${safeName},</p>

          <p>${escapeHtml(message)}</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr>
              <td style="padding:10px;border:1px solid #e5e7eb;">Admission Number</td>
              <td style="padding:10px;border:1px solid #e5e7eb;">${safeAdmission}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #e5e7eb;">Course</td>
              <td style="padding:10px;border:1px solid #e5e7eb;">${safeCourse}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #e5e7eb;">Installment</td>
              <td style="padding:10px;border:1px solid #e5e7eb;">${safeInstallment}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #e5e7eb;">Due Date</td>
              <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(formattedDueDate)}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #e5e7eb;">Installment Amount</td>
              <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(formattedInstallmentAmount)}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #e5e7eb;">Amount Paid</td>
              <td style="padding:10px;border:1px solid #e5e7eb;">${escapeHtml(formattedPaidAmount)}</td>
            </tr>
            <tr>
              <td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">Remaining Amount</td>
              <td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;color:#b91c1c;">${escapeHtml(formattedRemainingAmount)}</td>
            </tr>
          </table>

          <p>Please contact the institute if you have any questions about your fees.</p>

          <p>If you have already paid, please ignore this reminder and contact the institute if the payment is not reflected in your records.</p>

          <p>Regards,<br />
          <strong>Prerna Institute Of Excellence</strong></p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: to.trim(),
    subject,
    html,
  })
}

module.exports = sendFeeReminderEmail
