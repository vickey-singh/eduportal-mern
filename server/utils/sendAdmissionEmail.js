const transporter = require('../config/mailer')

const sendAdmissionEmail = async ({
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

    from: `"Prerna Institute" <${process.env.EMAIL_USER}>`,

    to: student.email,

    subject: `🎉 Admission Confirmed - ${student.admissionNumber}`,

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

background:#0d6efd;

color:#fff;

padding:30px;

text-align:center;

}

.header h1{

margin:0;

font-size:28px;

}

.header p{

margin-top:8px;

font-size:15px;

}

.content{

padding:30px;

}

.content h2{

margin-top:0;

color:#0d6efd;

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

.note{

margin-top:30px;

padding:18px;

background:#fff8e6;

border-left:5px solid #ffc107;

}

.footer{

background:#f8f9fa;

padding:20px;

text-align:center;

font-size:14px;

color:#666;

}

.footer strong{

color:#0d6efd;

}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h1>🎓 Prerna Institute</h1>

<p>Admission Confirmation</p>

</div>

<div class="content">

<h2>Hello ${student.name},</h2>

<p>

Congratulations! 🎉

Your admission has been successfully confirmed.

Below are your admission details.

</p>

<table>

<tr>

<td>Admission Number</td>

<td>${student.admissionNumber}</td>

</tr>

<tr>

<td>Student Name</td>

<td>${student.name}</td>

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

<td>Contact Number</td>

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

<div class="note">

<b>Important Instructions</b>

<ul>

<li>Please keep this email safely for future reference.</li>

<li>Bring your Admission Number whenever you visit the institute.</li>

<li>Complete your remaining fee before the due date.</li>

<li>Contact the institute if you have any questions regarding your admission.</li>

</ul>

</div>

</div>

<div class="footer">

<strong>Prerna Institute</strong>

<br><br>

Thank you for choosing us.

<br>

We wish you a successful learning journey.

</div>

</div>

</body>

</html>

`,

  })

}

module.exports = sendAdmissionEmail