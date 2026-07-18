import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import { API_BASE_URL } from '../config/api'

import { getReceipt } from '../services/receiptService'

import { getSettings } from '../services/settingsService'

import jsPDF from 'jspdf'

import html2canvas from 'html2canvas'

import '../assets/styles/receipt.css'

function Receipt() {

  const { receiptNumber } = useParams()

  const [receipt, setReceipt] = useState(null)

  const [settings, setSettings] = useState(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {

    fetchReceipt()

  }, [])

  const fetchReceipt = async () => {

  try {

    const [receiptRes, settingsRes] = await Promise.all([
      getReceipt(receiptNumber),
      getSettings()
    ])

    setReceipt(receiptRes.receipt)

    setSettings(settingsRes)

  } catch (error) {

    console.error(error)

  } finally {

    setLoading(false)

  }

}

const downloadPDF = async () => {

  const receipt = document.getElementById(
    'receipt-content'
  )

  const canvas = await html2canvas(receipt, {
    scale: 2,
  })

  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF(
    'p',
    'mm',
    'a4'
  )

  const pageWidth =
    pdf.internal.pageSize.getWidth()

  const imgWidth = pageWidth

  const imgHeight =
    (canvas.height * imgWidth) /
    canvas.width

  pdf.addImage(
    imgData,
    'PNG',
    0,
    0,
    imgWidth,
    imgHeight
  )

  pdf.save(
    `${receipt.receiptNumber}.pdf`
  )

}

  if (loading) {

    return (

      <div className="container text-center mt-5">

        <h3>Loading Receipt...</h3>

      </div>

    )

  }

  if (!receipt) {

    return (

      <div className="container text-center mt-5">

        <h3>Receipt Not Found</h3>

      </div>

    )

  }


  return (

  <div className="receipt-page">

    <div
      className="receipt-container"
      id="receipt-content"
    >

      {/* =============================== */}
      {/* HEADER */}
      {/* =============================== */}

      <div className="receipt-header">
        
          <div className="receipt-left">
        
            <img
              src={
                  settings?.logo
                    ? `${API_BASE_URL}${settings.logo}`
                    : '/logo.png'
                }
              alt="Institute Logo"
              className="receipt-logo"
            />
        
            <div>
        
              <h2 className="receipt-title">
        
                {settings?.instituteName || 'Prerna Institute'}
        
              </h2>
        
              <p className="receipt-subtitle">
        
                PAYMENT RECEIPT
        
              </p>
        
            </div>
        
          </div>
        
          <div className="receipt-info-card">
        
            <table>
        
              <tbody>
        
                <tr>
        
                  <td><strong>Receipt No</strong></td>
        
                  <td>{receipt.receiptNumber}</td>
        
                </tr>
        
                <tr>
        
                  <td><strong>Date</strong></td>
        
                  <td>
        
                    {new Date(receipt.paymentDate).toLocaleDateString()}
        
                  </td>
        
                </tr>
        
              </tbody>
        
            </table>
        
          </div>
        
        </div>
        
        <hr />

    {/* =============================== */}
    {/* STUDENT DETAILS */}
    {/* =============================== */}
    
    <div className="receipt-section">

      <div className="receipt-section-title">
    
        Student Information
    
      </div>
    
      <table className="receipt-table">
    
        <tbody>
    
          <tr>
            <td>Admission Number</td>
            <td>{receipt.admissionNumber}</td>
          </tr>
    
          <tr>
            <td>Student Name</td>
            <td>{receipt.studentName}</td>
          </tr>
    
          <tr>
            <td>Course</td>
            <td>{receipt.course}</td>
          </tr>
    
          <tr>
            <td>Mobile</td>
            <td>{receipt.studentPhone}</td>
          </tr>
    
          <tr>
            <td>Email</td>
            <td>{receipt.studentEmail}</td>
          </tr>
    
          <tr>
            <td>Payment Type</td>
            <td>{receipt.paymentType}</td>
          </tr>
    
          <tr>
            <td>Payment Method</td>
            <td>{receipt.paymentMethod}</td>
          </tr>
    
        </tbody>
    
      </table>
    
    </div>

    {/* =============================== */}
    {/* PAYMENT SUMMARY */}
    {/* =============================== */}
    
    <div className="receipt-section">

      <div className="receipt-section-title">
    
        Payment Details
    
      </div>
    
      <table className="receipt-table">
    
        <tbody>
    
          <tr>
            <td>Course Fee</td>
            <td>₹ {receipt.courseFee}</td>
          </tr>
    
          {receipt.paymentType === 'Installment' && (
    
            <tr>
              <td>Minimum Installment</td>
              <td>₹ {receipt.minimumInstallment}</td>
            </tr>
    
          )}
    
          <tr>
            <td>Amount Paid</td>
            <td>₹ {receipt.amountPaid}</td>
          </tr>
    
          <tr>
            <td>Total Paid</td>
            <td>₹ {receipt.totalPaid}</td>
          </tr>
    
          <tr>
            <td>Remaining Fee</td>
            <td>₹ {receipt.remainingFee}</td>
          </tr>
    
          <tr>
            <td>Payment Method</td>
            <td>{receipt.paymentMethod}</td>
          </tr>
    
          <tr>
            <td>Transaction ID</td>
            <td>{receipt.transactionId}</td>
          </tr>
    
          <tr>
            <td>Payment Date</td>
            <td>
              {new Date(receipt.paymentDate).toLocaleString()}
            </td>
          </tr>
    
          <tr>
            <td>Status</td>
            <td>
    
              <span className="badge bg-success">
    
                {receipt.paymentStatus}
    
              </span>
    
            </td>
          </tr>
    
        </tbody>
    
      </table>
    
    </div>
    
    {/* =============================== */}
    {/* FOOTER */}
    {/* =============================== */}
    
    <hr className="my-4" />
    
    <div className="row">
    
      <div className="col-md-6">
    
        <h5>Institute Details</h5>
    
        <p className="mb-1">
          <strong>Address:</strong><br />
          {settings?.address || 'Address Not Available'}
        </p>
    
        <p className="mb-1">
          <strong>Phone:</strong><br />
          {settings?.phone || '-'}
        </p>
    
        <p className="mb-1">
          <strong>Email:</strong><br />
          {settings?.email || '-'}
        </p>
    
        <p className="mb-0">
          <strong>Website:</strong><br />
          {settings?.website || '-'}
        </p>
    
      </div>
    
      <div
        className="col-md-6 text-end d-flex flex-column justify-content-end"
      >
    
        <div style={{ marginTop: '70px' }}>
    
          <hr />
    
          <strong>
            Authorized Signature
          </strong>
    
        </div>
    
      </div>
    
    </div>
    
    <div className="text-center mt-5 no-print">
    
      <button
        className="btn btn-primary me-3"
        onClick={() => window.print()}
      >
        🖨 Print Receipt
      </button>

      <button
        className="btn btn-success"
        onClick={downloadPDF}
      >
        ⬇ Download PDF
      </button>
          
    </div>

    </div>

  </div>

)

}

export default Receipt