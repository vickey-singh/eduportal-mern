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


  // ======================================
  // STATE
  // ======================================

  const [receipt, setReceipt] =
    useState(null)

  const [settings, setSettings] =
    useState(null)

  const [loading, setLoading] =
    useState(true)


  // ======================================
  // FETCH RECEIPT
  // ======================================

  useEffect(() => {

    fetchReceipt()

  }, [])


  const fetchReceipt = async () => {

    try {

      const [
        receiptRes,
        settingsRes,
      ] = await Promise.all([

        getReceipt(receiptNumber),

        getSettings(),

      ])


      setReceipt(
        receiptRes.receipt
      )

      setSettings(
        settingsRes
      )

    } catch (error) {

      console.error(
        'Receipt Error:',
        error
      )

    } finally {

      setLoading(false)

    }

  }


  // ======================================
  // IMAGE URL
  // ======================================

  const getImageUrl = (image) => {

    if (!image) {

      return '/logo.png'

    }


    // Cloudinary / external URL

    if (

      image.startsWith('http://') ||

      image.startsWith('https://')

    ) {

      return image

    }


    // Old local upload

    return `${API_BASE_URL}${

      image.startsWith('/')

        ? image

        : `/${image}`

    }`

  }


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

        return '-'

    }

  }


  // ======================================
  // PAYMENT CATEGORY LABEL
  // ======================================

  const getPaymentCategoryLabel =
    (category) => {

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
  // FORMAT MONEY
  // ======================================

  const formatMoney = (amount) => {

    return Number(
      amount || 0
    ).toLocaleString('en-IN')

  }


  // ======================================
  // DOWNLOAD PDF
  // ======================================

  const downloadPDF = async () => {

    const receiptElement =
      document.getElementById(
        'receipt-content'
      )


    if (!receiptElement) {

      return

    }


    const canvas =
      await html2canvas(

        receiptElement,

        {

          scale: 2,

          useCORS: true,

          backgroundColor: '#ffffff',

        }

      )


    const imgData =
      canvas.toDataURL(
        'image/png'
      )


    const pdf =
      new jsPDF(
        'p',
        'mm',
        'a4'
      )


    const pageWidth =
      pdf.internal.pageSize
        .getWidth()


    const pageHeight =
      pdf.internal.pageSize
        .getHeight()


    const imgWidth =
      pageWidth


    const imgHeight =
      (
        canvas.height *
        imgWidth
      ) /
      canvas.width


    let heightLeft =
      imgHeight


    let position = 0


    pdf.addImage(

      imgData,

      'PNG',

      0,

      position,

      imgWidth,

      imgHeight

    )


    heightLeft -=
      pageHeight


    while (heightLeft > 0) {

      position =
        heightLeft -
        imgHeight


      pdf.addPage()


      pdf.addImage(

        imgData,

        'PNG',

        0,

        position,

        imgWidth,

        imgHeight

      )


      heightLeft -=
        pageHeight

    }


    pdf.save(

      `${receipt.receiptNumber}.pdf`

    )

  }


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div className="container text-center mt-5">

        <h3>
          Loading Receipt...
        </h3>

      </div>

    )

  }


  // ======================================
  // NOT FOUND
  // ======================================

  if (!receipt) {

    return (

      <div className="container text-center mt-5">

        <h3>
          Receipt Not Found
        </h3>

      </div>

    )

  }


  // ======================================
  // PAYMENT CATEGORY
  // ======================================

  const isRegistration =
    receipt.paymentCategory ===
    'Registration'


  const isCourseFee =
    receipt.paymentCategory ===
    'CourseFee'


  // ======================================
  // PAYMENT TYPE
  // ======================================

  const paymentType =
    receipt.paymentType || ''


  // ======================================
  // PAYMENT PLAN
  // ======================================

  const paymentPlan =
    receipt.paymentPlan || ''


  // ======================================
  // REGISTRATION FEE
  // ======================================

  const registrationFee =
    Number(
      receipt.registrationFee || 0
    )


  /*
   * Backend me registrationFeePaid
   * available hai to wahi use hoga.
   *
   * Agar registration receipt hai
   * aur field available nahi hai,
   * to current payment ko registration
   * paid maana jayega.
   */

  const registrationFeePaid =
    receipt.registrationFeePaid !==
    undefined

      ? Number(
          receipt.registrationFeePaid || 0
        )

      : isRegistration

        ? Number(
            receipt.amountPaid || 0
          )

        : 0


  // ======================================
  // COURSE FEE
  // ======================================

  const courseFee =
    Number(
      receipt.courseFee || 0
    )


  // ======================================
  // CURRENT PAYMENT
  // ======================================

  const currentPayment =
    Number(
      receipt.amountPaid || 0
    )


  // ======================================
  // TOTAL COURSE PAID
  // ======================================

  const totalCoursePaid =
    Number(
      receipt.totalPaid || 0
    )


  // ======================================
  // REMAINING COURSE FEE
  // ======================================

  const remainingCourseFee =
    Number(
      receipt.remainingFee || 0
    )


  // ======================================
  // MINIMUM INSTALLMENT
  // ======================================

  const minimumInstallment =
    Number(
      receipt.minimumInstallment || 0
    )


  return (

    <div
      className="receipt-container"
      id="receipt-content"
    >


      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="receipt-header">

        <div className="receipt-left">

          <img

            src={
              getImageUrl(
                settings?.logo
              )
            }

            alt="Institute Logo"

            className="receipt-logo"

            crossOrigin="anonymous"

          />


          <div>

            <h2 className="receipt-title">

              {
                settings?.instituteName ||

                'Prerna Institute Of Excellence'

              }

            </h2>


            <p className="receipt-subtitle">

              PAYMENT RECEIPT

            </p>

          </div>

        </div>


        {/* ==================================
            RECEIPT INFO
        ================================== */}

        <div className="receipt-info-card">

          <table>

            <tbody>

              <tr>

                <td>

                  <strong>
                    Receipt No
                  </strong>

                </td>

                <td>

                  {
                    receipt.receiptNumber
                  }

                </td>

              </tr>


              <tr>

                <td>

                  <strong>
                    Date
                  </strong>

                </td>

                <td>

                  {
                    new Date(
                      receipt.paymentDate
                    ).toLocaleDateString(
                      'en-IN'
                    )
                  }

                </td>

              </tr>


              <tr>

                <td>

                  <strong>
                    Category
                  </strong>

                </td>

                <td>

                  {
                    getPaymentCategoryLabel(
                      receipt.paymentCategory
                    )
                  }

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <hr />


      {/* ====================================== */}
      {/* STUDENT INFORMATION */}
      {/* ====================================== */}

      <div className="receipt-section">

        <div className="receipt-section-title">

          Student Information

        </div>


        <table className="receipt-table">

          <tbody>

            <tr>

              <td>
                Admission Number
              </td>

              <td>
                {
                  receipt.admissionNumber
                }
              </td>

            </tr>


            <tr>

              <td>
                Student Name
              </td>

              <td>
                {
                  receipt.studentName
                }
              </td>

            </tr>


            <tr>

              <td>
                Course
              </td>

              <td>
                {
                  receipt.course
                }
              </td>

            </tr>


            <tr>

              <td>
                Mobile
              </td>

              <td>

                {
                  receipt.studentPhone ||
                  '-'
                }

              </td>

            </tr>


            <tr>

              <td>
                Email
              </td>

              <td>

                {
                  receipt.studentEmail ||
                  '-'
                }

              </td>

            </tr>

          </tbody>

        </table>

      </div>


      {/* ====================================== */}
      {/* PAYMENT INFORMATION */}
      {/* ====================================== */}

      <div className="receipt-section">

        <div className="receipt-section-title">

          Payment Information

        </div>


        <table className="receipt-table">

          <tbody>


            {/* ==================================
                PAYMENT CATEGORY
            ================================== */}

            <tr>

              <td>
                Payment Category
              </td>

              <td>

                <strong>

                  {
                    getPaymentCategoryLabel(
                      receipt.paymentCategory
                    )
                  }

                </strong>

              </td>

            </tr>


            {/* ==================================
                COURSE FEE PAYMENT
            ================================== */}

            {isCourseFee && (

              <>

                {/* Payment Type */}

                <tr>

                  <td>
                    Payment Type
                  </td>

                  <td>

                    {
                      paymentType === 'Full'

                        ? 'Full Payment'

                        : 'Installment'

                    }

                  </td>

                </tr>


                {/* Selected Plan */}

                <tr>

                  <td>
                    Selected Payment Plan
                  </td>

                  <td>

                    <strong>

                      {
                        getPaymentPlanLabel(
                          paymentPlan
                        )
                      }

                    </strong>

                  </td>

                </tr>


                {/* Minimum Installment */}

                {paymentType ===
                  'Installment' &&

                  minimumInstallment >
                    0 && (

                  <tr>

                    <td>
                      Minimum Installment
                    </td>

                    <td>

                      ₹ {
                        formatMoney(
                          minimumInstallment
                        )
                      }

                    </td>

                  </tr>

                )}

              </>

            )}


            {/* ==================================
                REGISTRATION PAYMENT
            ================================== */}

            {isRegistration && (

              <tr>

                <td>
                  Payment Type
                </td>

                <td>
                  Registration Payment
                </td>

              </tr>

            )}


            {/* ==================================
                PAYMENT METHOD
            ================================== */}

            <tr>

              <td>
                Payment Method
              </td>

              <td>

                {
                  receipt.paymentMethod ||
                  '-'
                }

              </td>

            </tr>

          </tbody>

        </table>

      </div>


      {/* ====================================== */}
      {/* FEE SUMMARY */}
      {/* ====================================== */}

      <div className="receipt-section">

        <div className="receipt-section-title">

          Fee Summary

        </div>


        <table className="receipt-table">

          <tbody>


            {/* ==================================
                REGISTRATION FEE
            ================================== */}

            {registrationFee > 0 && (

              <>

                <tr>

                  <td>
                    Registration Fee
                  </td>

                  <td>

                    ₹ {
                      formatMoney(
                        registrationFee
                      )
                    }

                  </td>

                </tr>


                <tr>

                  <td>
                    Registration Fee Paid
                  </td>

                  <td>

                    ₹ {
                      formatMoney(
                        registrationFeePaid
                      )
                    }

                  </td>

                </tr>

              </>

            )}


            {/* ==================================
                COURSE FEE
            ================================== */}

            <tr>

              <td>
                Total Course Fee
              </td>

              <td>

                ₹ {
                  formatMoney(
                    courseFee
                  )
                }

              </td>

            </tr>


            {/* ==================================
                CURRENT PAYMENT
            ================================== */}

            <tr>

              <td>
                Current Payment
              </td>

              <td>

                <strong>

                  ₹ {
                    formatMoney(
                      currentPayment
                    )
                  }

                </strong>

              </td>

            </tr>


            {/* ==================================
                TOTAL COURSE PAID
            ================================== */}

            {isCourseFee && (

              <tr>

                <td>
                  Total Course Fee Paid
                </td>

                <td>

                  ₹ {
                    formatMoney(
                      totalCoursePaid
                    )
                  }

                </td>

              </tr>

            )}


            {/* ==================================
                REMAINING COURSE FEE
            ================================== */}

            <tr>

              <td>
                Remaining Course Fee
              </td>

              <td>

                ₹ {
                  formatMoney(
                    remainingCourseFee
                  )
                }

              </td>

            </tr>

          </tbody>

        </table>

      </div>


      {/* ====================================== */}
      {/* TRANSACTION DETAILS */}
      {/* ====================================== */}

      <div className="receipt-section">

        <div className="receipt-section-title">

          Transaction Details

        </div>


        <table className="receipt-table">

          <tbody>

            <tr>

              <td>
                Transaction ID
              </td>

              <td>

                {
                  receipt.transactionId ||
                  '-'
                }

              </td>

            </tr>


            <tr>

              <td>
                Order ID
              </td>

              <td>

                {
                  receipt.orderId ||
                  '-'
                }

              </td>

            </tr>


            <tr>

              <td>
                Payment Date
              </td>

              <td>

                {
                  new Date(
                    receipt.paymentDate
                  ).toLocaleString(
                    'en-IN'
                  )
                }

              </td>

            </tr>


            <tr>

              <td>
                Payment Status
              </td>

              <td>

                <span className="badge bg-success">

                  {
                    receipt.paymentStatus ||
                    'Success'
                  }

                </span>

              </td>

            </tr>

          </tbody>

        </table>

      </div>


      {/* ====================================== */}
      {/* FOOTER */}
      {/* ====================================== */}

      <hr className="my-4" />


      <div className="row">


        {/* ==================================
            INSTITUTE DETAILS
        ================================== */}

        <div className="col-md-6">

          <h5>
            Institute Details
          </h5>


          <p className="mb-1">

            <strong>
              Address:
            </strong>

            <br />

            {
              settings?.address ||
              'Address Not Available'
            }

          </p>


          <p className="mb-1">

            <strong>
              Phone:
            </strong>

            <br />

            {
              settings?.phone ||
              '-'
            }

          </p>


          <p className="mb-1">

            <strong>
              Email:
            </strong>

            <br />

            {
              settings?.email ||
              '-'
            }

          </p>


          <p className="mb-0">

            <strong>
              Website:
            </strong>

            <br />

            {
              settings?.website ||
              '-'
            }

          </p>

        </div>


        {/* ==================================
            SIGNATURE
        ================================== */}

        <div
          className="col-md-6 text-end d-flex flex-column justify-content-end"
        >

          <div
            style={{
              marginTop: '70px',
            }}
          >

            <hr />

            <strong>
              Authorized Signature
            </strong>

          </div>

        </div>

      </div>


      {/* ====================================== */}
      {/* THANK YOU */}
      {/* ====================================== */}

      <div className="text-center mt-4">

        <strong>

          Thank you for choosing us.

        </strong>

      </div>


      {/* ====================================== */}
      {/* BUTTONS */}
      {/* ====================================== */}

      <div
        className="text-center mt-5 no-print"
      >

        <button

          className="btn btn-primary me-3"

          onClick={() =>
            window.print()
          }

        >

          🖨 Print Receipt

        </button>


        <button

          className="btn btn-success"

          onClick={
            downloadPDF
          }

        >

          ⬇ Download PDF

        </button>

      </div>


    </div>

  )

}


export default Receipt