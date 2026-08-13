const sendEmail =
  require('./sendEmail')


// ======================================
// PAYMENT PLAN LABEL
// ======================================

const getPaymentPlanLabel = (
  paymentPlan
) => {

  switch (paymentPlan) {

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

const getPaymentCategoryLabel = (
  paymentCategory
) => {

  switch (paymentCategory) {

    case 'Registration':
      return 'Registration Fee'

    case 'CourseFee':
      return 'Course Fee'

    default:
      return '-'

  }

}


// ======================================
// SEND ADMIN / TEACHER EMAIL
// ======================================

const sendAdminNotification = async ({

  student,

  receipt,

  amountPaid,

  transactionId,

}) => {

  try {

    // ======================================
    // ADMIN / TEACHER EMAIL
    // ======================================
    //
    // Admin email is taken from .env
    //
    // ADMIN_EMAIL =
    // upadhyayvikashstudent36@gmail.com
    //
    // ======================================

    const adminEmail =
      process.env.ADMIN_EMAIL


    // ======================================
    // CHECK EMAIL
    // ======================================

    if (!adminEmail) {

      console.log(
        'Admin/Teacher email is not configured.'
      )

      return

    }


    // ======================================
    // PAYMENT INFORMATION
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
    // BATCH TIME
    // ======================================

    const batchTime =
      student.batchTime ||
      receipt.batchTime ||
      '-'


    // ======================================
    // SEND EMAIL
    // ======================================

    await sendEmail({

      to:
        adminEmail,

      subject:
        `📢 New Online Admission - ${student.name}`,

      html: `

        <div
          style="
            font-family: Arial, Helvetica, sans-serif;
            max-width: 750px;
            margin: 0 auto;
            padding: 30px;
            color: #333;
            background-color: #ffffff;
          "
        >

          <!-- ================================= -->
          <!-- HEADER -->
          <!-- ================================= -->

          <div
            style="
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #00adb5;
            "
          >

            <h2
              style="
                margin: 0;
                color: #00adb5;
              "
            >
              📢 New Online Admission
            </h2>

            <p
              style="
                margin: 8px 0 0;
                color: #666;
              "
            >
              EduPortal ERP
            </p>

          </div>


          <!-- ================================= -->
          <!-- MESSAGE -->
          <!-- ================================= -->

          <div
            style="
              margin-top: 25px;
              margin-bottom: 25px;
            "
          >

            <p>
              A new student has successfully completed
              the online admission process.
            </p>

            <p>
              The registration payment has been
              successfully verified.
            </p>

          </div>


          <!-- ================================= -->
          <!-- STUDENT DETAILS -->
          <!-- ================================= -->

          <h3
            style="
              color: #00adb5;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            "
          >
            Student Details
          </h3>


          <table
            width="100%"
            cellpadding="8"
            cellspacing="0"
            style="
              border-collapse: collapse;
              margin-bottom: 25px;
            "
          >

            <tr>

              <td>
                <strong>
                  Admission Number
                </strong>
              </td>

              <td>
                ${student.admissionNumber}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Student Name
                </strong>
              </td>

              <td>
                ${student.name}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Course
                </strong>
              </td>

              <td>
                ${student.course}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Batch Time
                </strong>
              </td>

              <td>
                ${batchTime}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Mobile
                </strong>
              </td>

              <td>
                ${student.contact || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Email
                </strong>
              </td>

              <td>
                ${student.email || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Admission Date
                </strong>
              </td>

              <td>
                ${student.admissionDate || '-'}
              </td>

            </tr>

          </table>


          <!-- ================================= -->
          <!-- PARENT DETAILS -->
          <!-- ================================= -->

          <h3
            style="
              color: #00adb5;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            "
          >
            Parent Details
          </h3>


          <table
            width="100%"
            cellpadding="8"
            cellspacing="0"
            style="
              border-collapse: collapse;
              margin-bottom: 25px;
            "
          >

            <tr>

              <td>
                <strong>
                  Father Name
                </strong>
              </td>

              <td>
                ${student.fatherName || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Father Occupation
                </strong>
              </td>

              <td>
                ${student.fatherOccupation || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Father Mobile
                </strong>
              </td>

              <td>
                ${student.fatherMobile || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Mother Name
                </strong>
              </td>

              <td>
                ${student.motherName || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Mother Occupation
                </strong>
              </td>

              <td>
                ${student.motherOccupation || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Mother Mobile
                </strong>
              </td>

              <td>
                ${student.motherMobile || '-'}
              </td>

            </tr>

          </table>


          <!-- ================================= -->
          <!-- EDUCATION & ADDRESS -->
          <!-- ================================= -->

          <h3
            style="
              color: #00adb5;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            "
          >
            Other Details
          </h3>


          <table
            width="100%"
            cellpadding="8"
            cellspacing="0"
            style="
              border-collapse: collapse;
              margin-bottom: 25px;
            "
          >

            <tr>

              <td>
                <strong>
                  Date of Birth
                </strong>
              </td>

              <td>
                ${student.dob || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Aadhaar Number
                </strong>
              </td>

              <td>
                ${student.aadharNumber || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  School / College
                </strong>
              </td>

              <td>
                ${student.schoolCollegeName || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Permanent Address
                </strong>
              </td>

              <td>
                ${student.permanentAddress || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Current Address
                </strong>
              </td>

              <td>
                ${student.currentAddress || '-'}
              </td>

            </tr>

          </table>


          <!-- ================================= -->
          <!-- PAYMENT DETAILS -->
          <!-- ================================= -->

          <h3
            style="
              color: #00adb5;
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
              margin-bottom: 25px;
            "
          >

            <tr>

              <td>
                <strong>
                  Payment Category
                </strong>
              </td>

              <td>
                ${paymentCategory}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Payment Type
                </strong>
              </td>

              <td>
                ${paymentType}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Payment Plan
                </strong>
              </td>

              <td>
                ${paymentPlan}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Registration Fee
                </strong>
              </td>

              <td>
                ₹ ${Number(
                  receipt.registrationFee || 0
                ).toLocaleString('en-IN')}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Registration Fee Paid
                </strong>
              </td>

              <td>
                ₹ ${Number(
                  receipt.registrationFeePaid || 0
                ).toLocaleString('en-IN')}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Total Course Fee
                </strong>
              </td>

              <td>
                ₹ ${Number(
                  receipt.courseFee || 0
                ).toLocaleString('en-IN')}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Current Payment
                </strong>
              </td>

              <td>

                <strong>
                  ₹ ${Number(
                    amountPaid || 0
                  ).toLocaleString('en-IN')}
                </strong>

              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Total Course Fee Paid
                </strong>
              </td>

              <td>
                ₹ ${Number(
                  receipt.totalPaid || 0
                ).toLocaleString('en-IN')}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Remaining Course Fee
                </strong>
              </td>

              <td>
                ₹ ${Number(
                  receipt.remainingFee || 0
                ).toLocaleString('en-IN')}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Payment Method
                </strong>
              </td>

              <td>
                ${paymentMethod}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Payment Status
                </strong>
              </td>

              <td>

                <strong style="color: green;">

                  ${
                    receipt.paymentStatus ||
                    'Success'
                  }

                </strong>

              </td>

            </tr>

          </table>


          <!-- ================================= -->
          <!-- RECEIPT DETAILS -->
          <!-- ================================= -->

          <h3
            style="
              color: #00adb5;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            "
          >
            Receipt Details
          </h3>


          <table
            width="100%"
            cellpadding="8"
            cellspacing="0"
            style="
              border-collapse: collapse;
              margin-bottom: 25px;
            "
          >

            <tr>

              <td>
                <strong>
                  Receipt Number
                </strong>
              </td>

              <td>
                ${receipt.receiptNumber}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Transaction ID
                </strong>
              </td>

              <td>

                ${
                  transactionId ||
                  receipt.transactionId ||
                  '-'
                }

              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Order ID
                </strong>
              </td>

              <td>
                ${receipt.orderId || '-'}
              </td>

            </tr>


            <tr>

              <td>
                <strong>
                  Payment Date
                </strong>
              </td>

              <td>

                ${new Date(
                  receipt.paymentDate
                ).toLocaleString('en-IN')}

              </td>

            </tr>

          </table>


          <!-- ================================= -->
          <!-- FOOTER -->
          <!-- ================================= -->

          <div
            style="
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
            "
          >

            <p>

              Please log in to the admin panel to view
              the complete student and payment record.

            </p>


            <p>

              Regards,<br />

              <strong>
                Prerna Institute Of Excellence
              </strong>

            </p>


            <p
              style="
                font-size: 12px;
                color: #777;
              "
            >

              This is an automatic notification generated
              after successful payment verification.

            </p>

          </div>

        </div>

      `,

    })

  }

  catch (error) {

    console.error(
      'Admin Notification Error:',
      error
    )

    throw error

  }

}


module.exports =
  sendAdminNotification