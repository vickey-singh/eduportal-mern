const express = require('express')

const router = express.Router()

const Receipt = require('../models/Receipt')

const Student = require('../models/Student')

const Setting = require('../models/Setting')

const {
  getReceiptByNumber,
} = require('../services/receiptService')


// ======================================
// STUDENT COMPLETE RECEIPT
// ADMIN / STUDENT VIEW
// ======================================

router.get(
  '/receipt/student/:studentId',
  async (req, res) => {

    try {

      const {
        studentId,
      } = req.params


      // ======================================
      // FIND STUDENT
      // ======================================

      const student =
        await Student.findById(
          studentId
        )


      if (!student) {

        return res.status(404).send(`

          <h1>
            Student Not Found
          </h1>

        `)

      }


      // ======================================
      // GET SETTINGS
      // ======================================

      const settings =
        await Setting.findOne()


      // ======================================
      // INSTITUTE INFORMATION
      // ======================================

      const instituteName =
        settings?.instituteName ||
        'Prerna Institute Of Excellence'


      const instituteAddress =
        settings?.address ||
        ''


      const institutePhone =
        settings?.phone ||
        ''


      const instituteEmail =
        settings?.email ||
        ''


      // ======================================
      // LOGO URL
      // SAME APPROACH AS EXISTING RECEIPT
      // ======================================

      let logo = ''


      if (settings?.logo) {

        if (
          settings.logo.startsWith('http://') ||
          settings.logo.startsWith('https://')
        ) {

          logo =
            settings.logo

        }

        else {

          logo =
            `${req.protocol}://${req.get('host')}${
              settings.logo.startsWith('/')
                ? settings.logo
                : `/${settings.logo}`
            }`

        }

      }


      // ======================================
      // PAYMENT HISTORY
      // ======================================

      const paymentHistory =
        Array.isArray(
          student.paymentHistory
        )
          ? student.paymentHistory
          : []


      // ======================================
      // LAST PAYMENT
      // ======================================

      const lastPayment =
        paymentHistory.length > 0
          ? paymentHistory[
              paymentHistory.length - 1
            ]
          : null


      // ======================================
      // DOCUMENT NUMBER
      // ======================================

      const receiptNumber =
        `STU-${student.admissionNumber}-${Date.now()}`


      // ======================================
      // FEE VALUES
      // ======================================

      const totalFees =
        Number(
          student.totalFees || 0
        )


      const paidFees =
        Number(
          student.paidFees || 0
        )


      const remainingFees =
        Number(
          student.remainingFees ??
          Math.max(
            totalFees - paidFees,
            0
          )
        )


      const registrationFee =
        Number(
          student.registrationFee || 0
        )


      const registrationFeePaid =
        Number(
          student.registrationFeePaid || 0
        )


      // ======================================
      // PAYMENT STATUS
      // ======================================

      const paymentStatus =
        paymentHistory.length === 0

          ? 'Not Paid'

          : (
              lastPayment?.paymentStatus ||
              'Success'
            )


      // ======================================
      // SAFE DISPLAY FUNCTION
      // ======================================

      const display =
        (
          value,
          fallback = 'Not Available'
        ) => {

          if (
            value === undefined ||
            value === null ||
            String(value).trim() === ''
          ) {

            return fallback

          }

          return String(value)

        }


      // ======================================
      // PAYMENT HISTORY HTML
      // ======================================

      let paymentHistoryHTML = ''


      if (
        paymentHistory.length === 0
      ) {

        paymentHistoryHTML = `

          <div class="no-payment">

            <strong>
              No Payment Made Yet
            </strong>

            <p>
              No payment transaction has been
              recorded for this student.
            </p>

          </div>

        `

      }

      else {

        paymentHistoryHTML = `

          <div class="payment-table-wrapper">

            <table class="payment-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Mode
                  </th>

                  <th>
                    Method
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                ${
                  paymentHistory
                    .map(
                      (
                        payment,
                        index
                      ) => {

                        return `

                          <tr>

                            <td>
                              ${index + 1}
                            </td>

                            <td>
                              ${display(
                                payment.paymentDate
                              )}
                            </td>

                            <td>
                              ${display(
                                payment.paymentCategory
                              )}
                            </td>

                            <td>
                              ₹ ${Number(
                                payment.amount || 0
                              ).toLocaleString('en-IN')}
                            </td>

                            <td>
                              ${display(
                                payment.paymentMode
                              )}
                            </td>

                            <td>
                              ${display(
                                payment.paymentMethod
                              )}
                            </td>

                            <td>
                              ${display(
                                payment.paymentType
                              )}
                            </td>

                            <td>

                              <span
                                class="
                                  status-badge
                                  ${
                                    payment.paymentStatus ===
                                    'Success'
                                      ? 'status-success'
                                      : payment.paymentStatus ===
                                        'Pending'
                                      ? 'status-pending'
                                      : 'status-failed'
                                  }
                                "
                              >

                                ${display(
                                  payment.paymentStatus
                                )}

                              </span>

                            </td>

                          </tr>

                        `

                      }
                    )
                    .join('')
                }

              </tbody>

            </table>

          </div>

        `

      }


      // ======================================
      // SEND HTML RECEIPT
      // ======================================

      res.send(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8" />

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  ${display(instituteName)}
  - Student Record
</title>


<style>

/* ======================================
GLOBAL
====================================== */

* {

  margin: 0;

  padding: 0;

  box-sizing: border-box;

}


body {

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  background: #f1f5f9;

  color: #222831;

  padding: 30px;

}


/* ======================================
MAIN DOCUMENT
====================================== */

.document {

  max-width: 1000px;

  margin: 0 auto;

  background: #fff;

  box-shadow:
    0 10px 40px
    rgba(0, 0, 0, 0.08);

  border-radius: 14px;

  overflow: hidden;

}


/* ======================================
HEADER
====================================== */

.header {

  padding: 30px 35px;

  border-bottom:
    3px solid #00adb5;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 25px;

}


.institute {

  display: flex;

  align-items: center;

  gap: 18px;

}


.logo {

  width: 80px;

  height: 80px;

  object-fit: cover;

  border-radius: 50%;

  border:
    2px solid #00adb5;

  padding: 3px;

  background: #fff;

}


.logo-placeholder {

  width: 80px;

  height: 80px;

  border-radius: 50%;

  background: #e9f7f8;

  display: flex;

  align-items: center;

  justify-content: center;

  color: #00adb5;

  font-size: 22px;

  font-weight: 700;

}


.institute-info h1 {

  font-size: 28px;

  margin-bottom: 8px;

  color: #222831;

}


.institute-info p {

  margin: 3px 0;

  color: #666;

  font-size: 13px;

}


.document-title {

  text-align: right;

}


.document-title h2 {

  font-size: 22px;

  color: #00adb5;

  margin-bottom: 8px;

}


.document-title p {

  margin: 4px 0;

  color: #555;

  font-size: 13px;

}


/* ======================================
CONTENT
====================================== */

.content {

  padding: 35px;

}


/* ======================================
SECTION
====================================== */

.section {

  margin-bottom: 30px;

}


.section-title {

  font-size: 17px;

  font-weight: 700;

  color: #222831;

  border-left:
    4px solid #00adb5;

  padding-left: 10px;

  margin-bottom: 15px;

}


/* ======================================
GRID
====================================== */

.grid {

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 12px;

}


.info-box {

  padding: 14px;

  background: #f8fafc;

  border:
    1px solid #e5e7eb;

  border-radius: 8px;

}


.info-label {

  display: block;

  font-size: 11px;

  font-weight: 700;

  text-transform: uppercase;

  color: #00adb5;

  letter-spacing: 0.5px;

  margin-bottom: 5px;

}


.info-value {

  font-size: 14px;

  color: #222831;

  word-break: break-word;

}


.full-width {

  grid-column:
    1 / -1;

}


/* ======================================
FEE SUMMARY
====================================== */

.fee-summary {

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 12px;

}


.fee-box {

  padding: 18px;

  background: #f8fafc;

  border:
    1px solid #e5e7eb;

  border-radius: 10px;

}


.fee-box span {

  display: block;

  color: #666;

  font-size: 12px;

  margin-bottom: 7px;

}


.fee-box strong {

  font-size: 18px;

  color: #222831;

}


/* ======================================
STATUS COLORS
====================================== */

.status-paid {

  color: #198754 !important;

}


.status-partial {

  color: #fd7e14 !important;

}


.status-pending {

  color: #dc3545 !important;

}


/* ======================================
PAYMENT TABLE
====================================== */

.payment-table-wrapper {

  overflow-x: auto;

}


.payment-table {

  width: 100%;

  border-collapse: collapse;

  font-size: 12px;

}


.payment-table th {

  background: #222831;

  color: #fff;

  padding: 11px 8px;

  text-align: left;

  white-space: nowrap;

}


.payment-table td {

  padding: 10px 8px;

  border-bottom:
    1px solid #e5e7eb;

  white-space: nowrap;

}


.payment-table tbody tr:nth-child(even) {

  background: #f8fafc;

}


/* ======================================
PAYMENT STATUS BADGE
====================================== */

.status-badge {

  display: inline-block;

  padding: 4px 8px;

  border-radius: 20px;

  font-size: 10px;

  font-weight: 700;

}


.status-success {

  background: #d1e7dd;

  color: #198754;

}


.status-pending {

  background: #fff3cd;

  color: #856404;

}


.status-failed {

  background: #f8d7da;

  color: #dc3545;

}


/* ======================================
NO PAYMENT
====================================== */

.no-payment {

  padding: 25px;

  background: #fff8e1;

  border:
    1px solid #ffe69c;

  border-radius: 10px;

  text-align: center;

}


.no-payment strong {

  display: block;

  color: #856404;

  margin-bottom: 7px;

}


.no-payment p {

  color: #856404;

  font-size: 13px;

}


/* ======================================
SIGNATURE
====================================== */

.signature-section {

  margin-top: 50px;

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 80px;

}


.signature-box {

  text-align: center;

  padding-top: 40px;

  border-top:
    1px solid #333;

  font-size: 13px;

  color: #555;

}


/* ======================================
PRINT BUTTON
====================================== */

.button-wrapper {

  text-align: center;

  margin-top: 35px;

}


.print-btn {

  background: #00adb5;

  color: #fff;

  border: none;

  padding: 13px 35px;

  border-radius: 8px;

  font-size: 15px;

  font-weight: 700;

  cursor: pointer;

}


.print-btn:hover {

  background: #00949b;

}


/* ======================================
FOOTER
====================================== */

.footer {

  border-top:
    1px solid #e5e7eb;

  padding: 20px;

  text-align: center;

  background: #fafafa;

  color: #666;

  font-size: 12px;

}


/* ======================================
PRINT
====================================== */

@media print {

  body {

    background: #fff;

    padding: 0;

  }


  .document {

    box-shadow: none;

    border-radius: 0;

    max-width: none;

  }


  .button-wrapper {

    display: none;

  }


  .header {

    padding: 20px;

  }


  .content {

    padding: 20px;

  }


  .section {

    page-break-inside: avoid;

  }


  .payment-table {

    font-size: 10px;

  }


  @page {

    size: A4;

    margin: 10mm;

  }

}


/* ======================================
MOBILE
====================================== */

@media (max-width: 768px) {

  body {

    padding: 10px;

  }


  .header {

    flex-direction: column;

    align-items: flex-start;

  }


  .document-title {

    text-align: left;

  }


  .content {

    padding: 18px;

  }


  .grid {

    grid-template-columns: 1fr;

  }


  .fee-summary {

    grid-template-columns: 1fr;

  }


  .signature-section {

    grid-template-columns: 1fr;

    gap: 50px;

  }

}

</style>

</head>


<body>


<div class="document">


<!-- ======================================
HEADER
====================================== -->

<div class="header">


  <div class="institute">


    ${
      logo

        ? `

          <img

            src="${logo}"

            alt="Institute Logo"

            class="logo"

          />

        `

        : `

          <div class="logo-placeholder">

            PIE

          </div>

        `
    }


    <div class="institute-info">


      <h1>

        ${display(
          instituteName
        )}

      </h1>


      ${
        instituteAddress

          ? `

            <p>

              ${display(
                instituteAddress
              )}

            </p>

          `

          : ''

      }


      ${
        institutePhone

          ? `

            <p>

              Phone:
              ${display(
                institutePhone
              )}

            </p>

          `

          : ''

      }


      ${
        instituteEmail

          ? `

            <p>

              Email:
              ${display(
                instituteEmail
              )}

            </p>

          `

          : ''

      }


    </div>


  </div>


  <div class="document-title">


    <h2>

      Student Record

    </h2>


    <p>

      Document No:

      <strong>

        ${receiptNumber}

      </strong>

    </p>


    <p>

      Generated:

      <strong>

        ${
          new Date().toLocaleDateString(
            'en-IN'
          )
        }

      </strong>

    </p>


  </div>


</div>


<!-- ======================================
CONTENT
====================================== -->

<div class="content">


<!-- ======================================
PERSONAL INFORMATION
====================================== -->

<div class="section">


  <h2 class="section-title">

    Personal Information

  </h2>


  <div class="grid">


    <div class="info-box">

      <span class="info-label">

        Student Name

      </span>

      <div class="info-value">

        ${display(
          student.name
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Admission Number

      </span>

      <div class="info-value">

        ${display(
          student.admissionNumber
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Date of Birth

      </span>

      <div class="info-value">

        ${display(
          student.dob
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Aadhar Number

      </span>

      <div class="info-value">

        ${display(
          student.aadharNumber
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Contact

      </span>

      <div class="info-value">

        ${display(
          student.contact
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Email

      </span>

      <div class="info-value">

        ${display(
          student.email
        )}

      </div>

    </div>


  </div>


</div>


<!-- ======================================
PARENTS INFORMATION
====================================== -->

<div class="section">


  <h2 class="section-title">

    Parents Information

  </h2>


  <div class="grid">


    <div class="info-box">

      <span class="info-label">

        Father Name

      </span>

      <div class="info-value">

        ${display(
          student.fatherName
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Mother Name

      </span>

      <div class="info-value">

        ${display(
          student.motherName
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Father Occupation

      </span>

      <div class="info-value">

        ${display(
          student.fatherOccupation
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Mother Occupation

      </span>

      <div class="info-value">

        ${display(
          student.motherOccupation
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Father Mobile

      </span>

      <div class="info-value">

        ${display(
          student.fatherMobile
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Mother Mobile

      </span>

      <div class="info-value">

        ${display(
          student.motherMobile
        )}

      </div>

    </div>


  </div>


</div>


<!-- ======================================
ADDRESS
====================================== -->

<div class="section">


  <h2 class="section-title">

    Address

  </h2>


  <div class="grid">


    <div class="info-box full-width">

      <span class="info-label">

        Permanent Address

      </span>

      <div class="info-value">

        ${display(
          student.permanentAddress
        )}

      </div>

    </div>


    <div class="info-box full-width">

      <span class="info-label">

        Current Address

      </span>

      <div class="info-value">

        ${display(
          student.currentAddress
        )}

      </div>

    </div>


  </div>


</div>


<!-- ======================================
EDUCATION
====================================== -->

<div class="section">


  <h2 class="section-title">

    Educational Information

  </h2>


  <div class="grid">


    <div class="info-box full-width">

      <span class="info-label">

        School / College

      </span>

      <div class="info-value">

        ${display(
          student.schoolCollegeName
        )}

      </div>

    </div>


  </div>


</div>


<!-- ======================================
ADMISSION INFORMATION
====================================== -->

<div class="section">


  <h2 class="section-title">

    Admission Information

  </h2>


  <div class="grid">


    <div class="info-box">

      <span class="info-label">

        Admission Number

      </span>

      <div class="info-value">

        ${display(
          student.admissionNumber
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Admission Date

      </span>

      <div class="info-value">

        ${display(
          student.admissionDate
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Course

      </span>

      <div class="info-value">

        ${display(
          student.course
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Batch Time

      </span>

      <div class="info-value">

        ${display(
          student.batchTime
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Admission Type

      </span>

      <div class="info-value">

        ${display(
          student.admissionType
        )}

      </div>

    </div>


  </div>


</div>


<!-- ======================================
FEE INFORMATION
====================================== -->

<div class="section">


  <h2 class="section-title">

    Fee Information

  </h2>


  <div class="fee-summary">


    <div class="fee-box">

      <span>

        Registration Fee

      </span>

      <strong>

        ₹ ${registrationFee.toLocaleString(
          'en-IN'
        )}

      </strong>

    </div>


    <div class="fee-box">

      <span>

        Registration Fee Paid

      </span>

      <strong>

        ₹ ${registrationFeePaid.toLocaleString(
          'en-IN'
        )}

      </strong>

    </div>


    <div class="fee-box">

      <span>

        Total Course Fee

      </span>

      <strong>

        ₹ ${totalFees.toLocaleString(
          'en-IN'
        )}

      </strong>

    </div>


    <div class="fee-box">

      <span>

        Total Paid

      </span>

      <strong>

        ₹ ${paidFees.toLocaleString(
          'en-IN'
        )}

      </strong>

    </div>


    <div class="fee-box">

      <span>

        Remaining Fee

      </span>

      <strong>

        ₹ ${remainingFees.toLocaleString(
          'en-IN'
        )}

      </strong>

    </div>


    <div class="fee-box">

      <span>

        Fee Status

      </span>

      <strong
        class="${
          student.feesStatus === 'Paid'
            ? 'status-paid'
            : student.feesStatus === 'Partial'
            ? 'status-partial'
            : 'status-pending'
        }"
      >

        ${display(
          student.feesStatus
        )}

      </strong>

    </div>


    <div class="fee-box">

      <span>

        Payment Plan

      </span>

      <strong>

        ${display(
          student.paymentPlan
        )}

      </strong>

    </div>


    <div class="fee-box">

      <span>

        Due Date

      </span>

      <strong>

        ${display(
          student.dueDate
        )}

      </strong>

    </div>


  </div>


</div>


<!-- ======================================
PAYMENT INFORMATION
====================================== -->

<div class="section">


  <h2 class="section-title">

    Payment Information

  </h2>


  <div class="grid">


    <div class="info-box">

      <span class="info-label">

        Payment Status

      </span>

      <div class="info-value">

        <strong
          class="${
            paymentStatus === 'Success'
              ? 'status-paid'
              : paymentStatus === 'Pending'
              ? 'status-pending'
              : 'status-pending'
          }"
        >

          ${paymentStatus}

        </strong>

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Last Payment Amount

      </span>

      <div class="info-value">

        ₹ ${Number(
          lastPayment?.amount || 0
        ).toLocaleString(
          'en-IN'
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Payment Category

      </span>

      <div class="info-value">

        ${display(
          lastPayment?.paymentCategory
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Payment Mode

      </span>

      <div class="info-value">

        ${display(
          lastPayment?.paymentMode ||
          student.paymentMode
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Payment Method

      </span>

      <div class="info-value">

        ${display(
          lastPayment?.paymentMethod
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Payment Type

      </span>

      <div class="info-value">

        ${display(
          lastPayment?.paymentType
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Transaction ID

      </span>

      <div class="info-value">

        ${display(
          lastPayment?.transactionId
        )}

      </div>

    </div>


    <div class="info-box">

      <span class="info-label">

        Payment Date

      </span>

      <div class="info-value">

        ${display(
          lastPayment?.paymentDate
        )}

      </div>

    </div>


  </div>


</div>


<!-- ======================================
COMPLETE PAYMENT HISTORY
====================================== -->

<div class="section">


  <h2 class="section-title">

    Complete Payment History

  </h2>


  ${paymentHistoryHTML}


</div>


<!-- ======================================
SIGNATURE
====================================== -->

<div class="signature-section">


  <div class="signature-box">

    Student / Parent Signature

  </div>


  <div class="signature-box">

    Authorized Signature

  </div>


</div>


<!-- ======================================
PRINT
====================================== -->

<div class="button-wrapper">

  <button
    class="print-btn"
    onclick="window.print()"
  >

    Print / Save as PDF

  </button>

</div>


</div>


<!-- ======================================
FOOTER
====================================== -->

<div class="footer">

  This document is generated from

  ${display(
    instituteName
  )}

  Student Management System.

  <br />

  Please retain this document for
  future reference.

</div>


</div>


</body>

</html>

      `)

    }

    catch (error) {

      console.log(
        'Student Receipt Error:',
        error
      )


      res.status(500).send(`

        <h1>
          Server Error
        </h1>

        <p>
          Unable to generate student receipt.
        </p>

      `)

    }

  }
)


// ======================================
// GET RECEIPT BY RECEIPT NUMBER
// EXISTING ROUTE - PRESERVED
// ======================================

router.get(
  '/receipt/:receiptNumber',
  async (req, res) => {

    try {

      const receipt =
        await getReceiptByNumber(
          req.params.receiptNumber
        )


      if (!receipt) {

        return res.status(404).json({

          success: false,

          message:
            'Receipt Not Found',

        })

      }


      res.status(200).json({

        success: true,

        receipt,

      })

    }

    catch (error) {

      console.log(error)

      res.status(500).json({

        success: false,

        message:
          'Server Error',

      })

    }

  }
)


// ======================================
// EXPORT ROUTER
// ======================================

module.exports =
router