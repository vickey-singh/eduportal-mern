const transporter = require('../config/mailer')

const sendAdminNotification = async ({
  student,
  receipt,
  amountPaid,
  transactionId,
}) => {

  const paymentType =
    student.remainingFees === 0
      ? 'Full Payment'
      : 'Installment'

  await transporter.sendMail({

    from: `"Prerna Institute" <${process.env.SENDER_EMAIL}>`,

    to: process.env.SENDER_EMAIL,

    subject: `📢 New Online Admission - ${student.name}`,

    html: `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

body{

margin:0;

padding:30px;

background:#f4f6f9;

font-family:Arial,Helvetica,sans-serif;

}

.container{

max-width:700px;

margin:auto;

background:#ffffff;

border-radius:12px;

overflow:hidden;

box-shadow:0 5px 20px rgba(0,0,0,.08);

}

.header{

background:#198754;

color:#fff;

padding:30px;

text-align:center;

}

.header h1{

margin:0;

font-size:28px;

}

.content{

padding:30px;

}

.content h2{

margin-top:0;

color:#198754;

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

table td{

padding:12px;

border:1px solid #ddd;

font-size:15px;

}

table td:first-child{

background:#f8f9fa;

font-weight:bold;

width:45%;

}

.alert{

margin-top:25px;

padding:18px;

background:#e8f5e9;

border-left:5px solid #198754;

}

.footer{

background:#f8f9fa;

padding:20px;

text-align:center;

font-size:14px;

color:#666;

}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h1>📢 New Online Admission</h1>

<p>EduPortal Notification</p>

</div>

<div class="content">

<h2>A new student has successfully completed admission.</h2>

<table>

<tr>

<td>Student Name</td>

<td>${student.name}</td>

</tr>

<tr>

<td>Admission Number</td>

<td>${student.admissionNumber}</td>

</tr>

<tr>

<td>Course</td>

<td>${student.course}</td>

</tr>

<tr>

<td>Admission Date</td>

<td>${student.admissionDate}</td>

</tr>

<tr>

<td>Phone Number</td>

<td>${student.contact}</td>

</tr>

<tr>

<td>Email</td>

<td>${student.email}</td>

</tr>

<tr>

<td>Payment Type</td>

<td>${paymentType}</td>

</tr>

<tr>

<td>Total Course Fee</td>

<td>₹ ${student.totalFees}</td>

</tr>

<tr>

<td>Amount Paid</td>

<td>₹ ${amountPaid}</td>

</tr>

<tr>

<td>Remaining Fee</td>

<td>₹ ${student.remainingFees}</td>

</tr>

<tr>

<td>Receipt Number</td>

<td>${receipt.receiptNumber}</td>

</tr>

<tr>

<td>Transaction ID</td>

<td>${transactionId}</td>

</tr>

</table>

<div class="alert">

<b>Action Required</b>

<ul>

<li>Student admission has been completed successfully.</li>

<li>Please verify the admission in the Admin Panel.</li>

<li>Check payment details and remaining fee.</li>

<li>Contact the student if additional documents are required.</li>

</ul>

</div>

</div>

<div class="footer">

<b>EduPortal ERP</b>

<br>

Automatic notification generated after successful payment.

</div>

</div>

</body>

</html>

`

  })

}

module.exports = sendAdminNotification