
const sendEmail = require('./sendEmail')

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const formatINR = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

const formatDate = (value) => {
  if (!value) return 'Not specified'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not specified'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date)
}

const getReminderContent = (stage) => {
  switch (stage) {
    case 'bulk_due':
      return {
        subject: 'Fee Due Reminder',
        heading: 'Current Due Fee Reminder',
        message:
          'Our records indicate that one or more installments are currently due. The amount below excludes future installments. If you have already paid, please contact the institute office.',
      }

    case 'due_today':
      return {
        subject: 'Fee Payment Due Today',
        heading: 'Fee Payment Due Today',
        message:
          'This is a reminder that your installment is due today. Please complete the payment or contact the institute if you have already paid.',
      }

    case 'overdue_3_days':
    case 'overdue_weekly':
      return {
        subject: 'Outstanding Fee Reminder',
        heading: 'Overdue Fee Reminder',
        message:
          'Our records indicate that this installment is overdue. Please arrange payment or contact the institute if your payment has already been made.',
      }

    case 'before_due':
    default:
      return {
        subject: 'Upcoming Fee Payment Reminder',
        heading: 'Upcoming Fee Payment',
        message:
          'This is a friendly reminder that your installment payment is approaching its due date.',
      }
  }
}

const sendFeeReminderEmail = async ({
  student,
  installment = null,
  reminderStage,
}) => {
  const email = String(student?.email || '').trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Student email is missing or invalid')
  }

  const content = getReminderContent(reminderStage)
  const isBulk = reminderStage === 'bulk_due'

  const studentName = escapeHtml(student?.name || 'Student')
  const admissionNumber = escapeHtml(
    student?.admissionNumber || 'Not available'
  )

  // For bulk reminders this is the sum of currently due
  // unpaid installments, NOT student.remainingFees.
  const remainingAmount = isBulk
    ? Number(installment?.remainingAmount ?? student?.remainingFees) || 0
    : Number(installment?.remainingAmount) || 0

  const dueDate = installment?.dueDate || null

  const dueInstallments = Array.isArray(installment?.dueInstallments)
    ? installment.dueInstallments
    : []

  const bulkInstallmentRows = dueInstallments
    .map((item) => {
      const number =
        item.installmentNumber === '' ||
        item.installmentNumber === null ||
        item.installmentNumber === undefined
          ? 'Installment'
          : `Installment ${item.installmentNumber}`

      return `
        <tr>
          <td style="padding:10px;border:1px solid #ddd;">
            ${escapeHtml(number)}
          </td>
          <td style="padding:10px;border:1px solid #ddd;">
            ${escapeHtml(formatDate(item.dueDate))}
          </td>
          <td style="padding:10px;border:1px solid #ddd;text-align:right;">
            ${formatINR(item.remainingAmount)}
          </td>
        </tr>
      `
    })
    .join('')

  const detailRows = isBulk
    ? `
      <tr>
        <td colspan="3" style="padding:10px;border:1px solid #ddd;background:#f8fafc;">
          <strong>Currently due installments</strong>
        </td>
      </tr>
      <tr>
        <th style="padding:10px;border:1px solid #ddd;text-align:left;">Installment</th>
        <th style="padding:10px;border:1px solid #ddd;text-align:left;">Due date</th>
        <th style="padding:10px;border:1px solid #ddd;text-align:right;">Balance</th>
      </tr>
      ${bulkInstallmentRows}
      <tr>
        <td colspan="2" style="padding:12px;border:1px solid #ddd;">
          <strong>Total currently due</strong>
        </td>
        <td style="padding:12px;border:1px solid #ddd;text-align:right;">
          <strong>${formatINR(remainingAmount)}</strong>
        </td>
      </tr>
    `
    : `
      <tr>
        <td style="padding:10px;border:1px solid #ddd;">Installment</td>
        <td style="padding:10px;border:1px solid #ddd;">
          ${escapeHtml(
            String(
              installment?.installmentNumber ??
              installment?.installmentNo ??
              ''
            )
          )}
        </td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #ddd;">Installment amount</td>
        <td style="padding:10px;border:1px solid #ddd;">
          ${formatINR(installment?.amount)}
        </td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #ddd;">Amount paid for this installment</td>
        <td style="padding:10px;border:1px solid #ddd;">
          ${formatINR(installment?.paidAmount)}
        </td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #ddd;">Remaining installment balance</td>
        <td style="padding:10px;border:1px solid #ddd;">
          <strong>${formatINR(remainingAmount)}</strong>
        </td>
      </tr>
      <tr>
        <td style="padding:10px;border:1px solid #ddd;">Due date</td>
        <td style="padding:10px;border:1px solid #ddd;">
          ${escapeHtml(formatDate(dueDate))}
        </td>
      </tr>
    `

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(content.heading)}</title>
      </head>

      <body style="margin:0;padding:20px;background:#f4f6f9;font-family:Arial,sans-serif;color:#222;">
        <div style="max-width:650px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:#123b72;padding:22px;color:#fff;">
            <h2 style="margin:0;">Prerna Institute Of Excellence</h2>
            <p style="margin:8px 0 0;">${escapeHtml(content.heading)}</p>
          </div>

          <div style="padding:24px;">
            <p>Hello <strong>${studentName}</strong>,</p>

            <p>${escapeHtml(content.message)}</p>

            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr>
                <td style="padding:10px;border:1px solid #ddd;">Admission number</td>
                <td style="padding:10px;border:1px solid #ddd;">${admissionNumber}</td>
              </tr>
              ${detailRows}
            </table>

            <p>Please contact the institute office if you need help with your fee payment or believe this information is incorrect.</p>

            <p style="margin-top:28px;">
              Regards,<br />
              <strong>Prerna Institute Of Excellence</strong>
            </p>
          </div>

          <div style="padding:14px;background:#f8fafc;text-align:center;color:#64748b;font-size:12px;">
            This is an automated fee reminder. Please contact the institute for payment-related queries.
          </div>
        </div>
      </body>
    </html>
  `

  const textDetails = isBulk
    ? [
        'Currently due installments:',
        ...dueInstallments.map(
          (item) =>
            `Installment ${item.installmentNumber || ''} | Due: ${formatDate(item.dueDate)} | Balance: ${formatINR(item.remainingAmount)}`
        ),
        `Total currently due: ${formatINR(remainingAmount)}`,
      ].join('\n')
    : [
        `Installment: ${installment?.installmentNumber ?? installment?.installmentNo ?? ''}`,
        `Installment amount: ${formatINR(installment?.amount)}`,
        `Paid for installment: ${formatINR(installment?.paidAmount)}`,
        `Remaining installment balance: ${formatINR(remainingAmount)}`,
        `Due date: ${formatDate(dueDate)}`,
      ].join('\n')

  const text = [
    `Hello ${student?.name || 'Student'},`,
    '',
    content.message,
    `Admission number: ${student?.admissionNumber || 'Not available'}`,
    textDetails,
    '',
    'Regards,',
    'Prerna Institute Of Excellence',
  ].join('\n')

  await sendEmail({
    to: email,
    subject: content.subject,
    html,
    text,
  })
}

module.exports = sendFeeReminderEmail
