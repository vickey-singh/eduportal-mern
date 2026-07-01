const express = require('express')

const router = express.Router()

const Student =
  require('../models/Student')

// ======================================
// RECEIPT PAGE
// ======================================

router.get(

  '/receipt/:studentId/:paymentIndex',

  async (req, res) => {

    try {

      const {
        studentId,
        paymentIndex,
      } = req.params

      // ======================================
      // FIND STUDENT
      // ======================================

      const student =
        await Student.findById(
          studentId
        )

      if (!student) {

        return res.send(`
          <h1>
            Student Not Found
          </h1>
        `)

      }

      // ======================================
      // FIND PAYMENT
      // ======================================

      const payment =
        student.paymentHistory[
          paymentIndex
        ]

      if (!payment) {

        return res.send(`
          <h1>
            Payment Not Found
          </h1>
        `)

      }

      // ======================================
      // RECEIPT NUMBER
      // ======================================

      const receiptNumber =
        `REC-${Date.now()}`

      // ======================================
      // HTML RESPONSE
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
Prerna Institute Receipt
</title>

<style>

* {

    margin: 0;

    padding: 0;

    box-sizing: border-box;

}

body {

    font-family: Arial, sans-serif;

    background: #f1f5f9;

    padding: 40px;

    color: #222831;

}

/* ====================================== */
/* RECEIPT CONTAINER */
/* ====================================== */

.receipt-container {

    max-width: 850px;

    margin: auto;

    background: #fff;

    border-radius: 18px;

    overflow: hidden;

    box-shadow: 0 10px 40px rgba(0,0,0,0.08);

}

/* ====================================== */
/* HEADER */
/* ====================================== */

.receipt-header {

    padding: 35px 40px;

    border-bottom: 1px solid #eee;

    display: flex;

    justify-content: space-between;

    align-items: center;

    flex-wrap: wrap;

    gap: 20px;

}

.branding {

    display: flex;

    align-items: center;

    gap: 18px;

}

.receipt-logo {

    width: 75px;

    height: 75px;

    object-fit: cover;

    border-radius: 50%;

    border: 3px solid #00adb5;

}

.brand-text h1 {

    font-size: 2.8rem;

    font-weight: 900;

    line-height: 1;

}

.edu {

    color: #ffc107;

}

.portal {

    color: #00adb5;

    margin-left: -8px;

}

.brand-text p {

    margin-top: 8px;

    color: #666;

    font-size: 0.95rem;

}

.receipt-top-info {

    text-align: right;

}

.receipt-top-info h3 {

    font-size: 1.5rem;

    margin-bottom: 10px;

}

.receipt-top-info p {

    margin-bottom: 6px;

    color: #555;

}

/* ====================================== */
/* CONTENT */
/* ====================================== */

.receipt-content {

    padding: 40px;

}

/* ====================================== */
/* SECTION TITLE */
/* ====================================== */

.section-title {

    font-size: 1.2rem;

    font-weight: 700;

    margin-bottom: 20px;

    color: #222831;

    border-left: 4px solid #00adb5;

    padding-left: 12px;

}

/* ====================================== */
/* GRID */
/* ====================================== */

.receipt-grid {

    display: grid;

    grid-template-columns: repeat(2,1fr);

    gap: 20px;

    margin-bottom: 40px;

}

.receipt-box {

    background: #f8fafc;

    border: 1px solid #eee;

    border-radius: 14px;

    padding: 20px;

}

.receipt-box strong {

    display: block;

    font-size: 0.85rem;

    text-transform: uppercase;

    letter-spacing: 1px;

    color: #00adb5;

    margin-bottom: 10px;

}

.receipt-box p {

    font-size: 1rem;

    color: #222831;

}

/* ====================================== */
/* PAYMENT SUMMARY */
/* ====================================== */

.payment-summary {

    border: 1px solid #eee;

    border-radius: 14px;

    overflow: hidden;

    margin-bottom: 45px;

}

.summary-row {

    display: flex;

    justify-content: space-between;

    align-items: center;

    padding: 20px 25px;

    border-bottom: 1px solid #eee;

    background: #fff;

}

.summary-row:last-child {

    border-bottom: none;

}

.summary-row span {

    color: #666;

    font-weight: 500;

}

.summary-row strong {

    color: #222831;

    font-size: 1.05rem;

    font-weight: 700;

}

/* ====================================== */
/* FEES STATUS */
/* ====================================== */

.status-paid {

    color: #198754;

}

.status-pending {

    color: #dc3545;

}

.status-partial {

    color: #fd7e14;

}

/* ====================================== */
/* BUTTON */
/* ====================================== */

.button-wrapper {

    text-align: center;

    margin-top: 10px;

}

.print-btn {

    background: #00adb5;

    color: #fff;

    border: none;

    padding: 14px 35px;

    border-radius: 10px;

    font-size: 1rem;

    font-weight: 700;

    cursor: pointer;

    transition: 0.3s ease;

}

.print-btn:hover {

    background: #00949b;

}

/* ====================================== */
/* FOOTER */
/* ====================================== */

.footer {

    border-top: 1px solid #eee;

    padding: 25px;

    text-align: center;

    color: #666;

    font-size: 0.95rem;

    background: #fafafa;

}

/* ====================================== */
/* PRINT */
/* ====================================== */

@media print {

    body {

        background: #fff;

        padding: 0;

    }

    .receipt-container {

        box-shadow: none;

        border-radius: 0;

    }

    .print-btn {

        display: none;

    }

}

/* ====================================== */
/* MOBILE */
/* ====================================== */

@media (max-width: 768px) {

    body {

        padding: 15px;

    }

    .receipt-header {

        flex-direction: column;

        align-items: flex-start;

    }

    .receipt-top-info {

        text-align: left;

    }

    .receipt-content {

        padding: 20px;

    }

    .receipt-grid {

        grid-template-columns: 1fr;

    }

    .brand-text h1 {

        font-size: 2.2rem;

    }

    .summary-row {

        flex-direction: column;

        align-items: flex-start;

        gap: 8px;

    }

}

</style>

</head>

<body>

<div class="receipt-container">

    <!-- ====================================== -->
    <!-- HEADER -->
    <!-- ====================================== -->

    <div class="receipt-header">

        <!-- BRAND -->
        <div class="branding">

            <img
                src="https://eduportal-backend-m5t1.onrender.com/uploads/logo.jpeg"
                alt="Logo"
                class="receipt-logo"
            />

            <div class="brand-text">

                <h1>

                    <span class="edu">
                        Prerna
                    </span><span class="portal">
                        Institute
                    </span>

                </h1>

                <p>
                    Professional Fee Receipt
                </p>

            </div>

        </div>

        <!-- RECEIPT INFO -->
        <div class="receipt-top-info">

            <h3>
                Fee Receipt
            </h3>

            <p>
                Receipt No:
                <strong>
                    ${receiptNumber}
                </strong>
            </p>

            <p>
                Date:
                <strong>
                    ${payment.paymentDate}
                </strong>
            </p>

        </div>

    </div>

    <!-- ====================================== -->
    <!-- CONTENT -->
    <!-- ====================================== -->

    <div class="receipt-content">

        <!-- STUDENT INFO -->
        <h2 class="section-title">
            Student Information
        </h2>

        <div class="receipt-grid">

            <div class="receipt-box">

                <strong>
                    Student Name
                </strong>

                <p>
                    ${student.name}
                </p>

            </div>

            <div class="receipt-box">

                <strong>
                    Admission Number
                </strong>
            
                <p>
                    ${student.admissionNumber}
                </p>
            
            </div>

            <div class="receipt-box">

                <strong>
                    Course
                </strong>

                <p>
                    ${student.course}
                </p>

            </div>

            <div class="receipt-box">

                <strong>
                    Payment Method
                </strong>

                <p>
                    ${payment.paymentMethod}
                </p>

            </div>

        </div>

        <!-- PAYMENT SUMMARY -->
        <h2 class="section-title">
            Payment Summary
        </h2>

        <div class="payment-summary">

            <div class="summary-row">

                <span>
                    Amount Paid
                </span>

                <strong>
                    ₹ ${payment.amount}
                </strong>

            </div>

            <div class="summary-row">

                <span>
                    Total Fees
                </span>

                <strong>
                    ₹ ${student.totalFees}
                </strong>

            </div>

            <div class="summary-row">

                <span>
                    Paid Fees
                </span>

                <strong>
                    ₹ ${student.paidFees}
                </strong>

            </div>

            <div class="summary-row">

                <span>
                    Remaining Fees
                </span>

                <strong>
                    ₹ ${student.remainingFees}
                </strong>

            </div>

            <div class="summary-row">

                <span>
                    Fees Status
                </span>

                <strong class="status-${student.feesStatus.toLowerCase()}">
                    ${student.feesStatus}
                </strong>

            </div>

        </div>

        <!-- BUTTON -->
        <div class="button-wrapper">

            <button
                class="print-btn"
                onclick="window.print()"
            >

                Print Receipt

            </button>

        </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">

        Thank you for your payment.<br/>

        Prerna Institute Institute Management System

    </div>

</div>

</body>

</html>

      `)

    } catch (error) {

      console.log(error)

      res.send(`
        <h1>
          Server Error
        </h1>
      `)

    }

  }

)

module.exports = router