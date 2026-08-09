const sendEmail = require('./sendEmail')


// ======================================
// PAYMENT PLAN LABEL
// ======================================

const getPaymentPlanLabel = (plan) => {

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
      return 'Not Applicable'

  }

}


// ======================================
// PAYMENT CATEGORY LABEL
// ======================================

const getPaymentCategoryLabel = (category) => {

  switch (category) {

    case 'Registration':
      return 'Registration Fee'

    case 'CourseFee':
      return 'Course Fee'

    default:
      return category || '-'

  }

}


// ======================================
// SEND ADMISSION EMAIL
// ======================================

const sendAdmissionEmail = async ({

  student,

  receipt,

  amountPaid,

  transactionId,

}) => {


  // ======================================
  // PAYMENT DETAILS
  // ======================================

  const paymentCategory =
    getPaymentCategoryLabel(
      receipt.paymentCategory
    )


  const paymentPlan =
    getPaymentPlanLabel(
      receipt.paymentPlan
    )


  const paymentType =
    receipt.paymentType || '-'


  const paymentMethod =
    receipt.paymentMethod || '-'


  // ======================================
  // SEND EMAIL
  // ======================================

  await sendEmail({

    to: student.email,

    subject:
      `🎉 Admission Confirmed - ${student.admissionNumber}`,

    html: `

      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 700px;
          margin: auto;
          padding: 25px;
          color: #333;
        "
      >

        <h2
          style="
            color: #00adb5;
            margin-bottom: 5px;
          "
        >
          🎉 Admission Confirmed
        </h2>


        <p>
          Dear <strong>${student.name}</strong>,
        </p>


        <p>
          Congratulations! Your admission has been
          successfully confirmed at
          <strong>Prerna Institute Of Excellence</strong>.
        </p>


        <!-- ================================== -->
        <!-- ADMISSION DETAILS -->
        <!-- ================================== -->

        <h3
          style="
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
          "
        >
          Admission Details
        </h3>


        <table
          width="100%"
          cellpadding="8"
          cellspacing="0"
          style="
            border-collapse: collapse;
            margin-bottom: 20px;
          "
        >

          <tr>
            <td><strong>Admission Number</strong></td>
            <td>${student.admissionNumber}</td>
          </tr>

          <tr>
            <td><strong>Student Name</strong></td>
            <td>${student.name}</td>
          </tr>

          <tr>
            <td><strong>Course</strong></td>
            <td>${student.course}</td>
          </tr>

          <tr>
            <td><strong>Mobile</strong></td>
            <td>${student.contact}</td>
          </tr>

          <tr>
            <td><strong>Email</strong></td>
            <td>${student.email}</td>
          </tr>

          <tr>
            <td><strong>Admission Date</strong></td>
            <td>${student.admissionDate}</td>
          </tr>

        </table>


        <!-- ================================== -->
        <!-- PAYMENT DETAILS -->
        <!-- ================================== -->

        <h3
          style="
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
          "
        >
          Payment Details
        </h3>


        <table
          width="100%"
          cellpadding="8"
          cellspacing="0"
          style="
            border-collapse: collapse;
            margin-bottom: 20px;
          "
        >

          <tr>
            <td><strong>Payment Category</strong></td>
            <td>${paymentCategory}</td>
          </tr>

          <tr>
            <td><strong>Payment Type</strong></td>
            <td>${paymentType}</td>
          </tr>

          <tr>
            <td><strong>Payment Plan</strong></td>
            <td>${paymentPlan}</td>
          </tr>

          <tr>
            <td><strong>Registration Fee</strong></td>
            <td>
              ₹ ${Number(
                receipt.registrationFee || 0
              ).toLocaleString('en-IN')}
            </td>
          </tr>

          <tr>
            <td><strong>Registration Fee Paid</strong></td>
            <td>
              ₹ ${Number(
                receipt.registrationFeePaid || 0
              ).toLocaleString('en-IN')}
            </td>
          </tr>

          <tr>
            <td><strong>Total Course Fee</strong></td>
            <td>
              ₹ ${Number(
                receipt.courseFee || 0
              ).toLocaleString('en-IN')}
            </td>
          </tr>

          <tr>
            <td><strong>Current Payment</strong></td>
            <td>
              <strong>
                ₹ ${Number(
                  amountPaid || 0
                ).toLocaleString('en-IN')}
              </strong>
            </td>
          </tr>

          <tr>
            <td><strong>Total Course Fee Paid</strong></td>
            <td>
              ₹ ${Number(
                receipt.totalPaid || 0
              ).toLocaleString('en-IN')}
            </td>
          </tr>

          <tr>
            <td><strong>Remaining Course Fee</strong></td>
            <td>
              ₹ ${Number(
                receipt.remainingFee || 0
              ).toLocaleString('en-IN')}
            </td>
          </tr>

          <tr>
            <td><strong>Payment Method</strong></td>
            <td>${paymentMethod}</td>
          </tr>

          <tr>
            <td><strong>Payment Status</strong></td>
            <td>
              <strong style="color: green;">
                ${receipt.paymentStatus || 'Success'}
              </strong>
            </td>
          </tr>

        </table>


        <!-- ================================== -->
        <!-- RECEIPT -->
        <!-- ================================== -->

        <h3
          style="
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
          "
        >
          Receipt Information
        </h3>


        <table
          width="100%"
          cellpadding="8"
          cellspacing="0"
          style="
            border-collapse: collapse;
            margin-bottom: 20px;
          "
        >

          <tr>
            <td><strong>Receipt Number</strong></td>
            <td>${receipt.receiptNumber}</td>
          </tr>

          <tr>
            <td><strong>Transaction ID</strong></td>
            <td>
              ${transactionId || receipt.transactionId || '-'}
            </td>
          </tr>

          <tr>
            <td><strong>Payment Date</strong></td>
            <td>
              ${new Date(
                receipt.paymentDate
              ).toLocaleString('en-IN')}
            </td>
          </tr>

        </table>


        <p>
          You can keep this email for your future reference.
          Your payment receipt has been generated successfully.
        </p>


        <p>
          Thank you for choosing
          <strong>Prerna Institute Of Excellence</strong>.
        </p>


        <p>
          We wish you a successful learning journey.
        </p>


        <br />


        <p>
          Regards,<br />
          <strong>
            Prerna Institute Of Excellence
          </strong>
        </p>

      </div>

    `,

  })

}


module.exports =
  sendAdmissionEmail