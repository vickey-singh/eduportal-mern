import '../../assets/styles/admin.css'

import { API_URL } from '../../config/api'

function ReceiptButton({ selectedStudent }) {

  // ======================================
  // GENERATE STUDENT RECEIPT
  // ======================================

  const handleGenerateReceipt = () => {

    // ======================================
    // CHECK STUDENT
    // ======================================

    if (!selectedStudent?._id) {

      alert(
        'Student Information Not Available'
      )

      return

    }

    // ======================================
    // OPEN STUDENT RECEIPT
    // PAYMENT IS NOT REQUIRED
    // ======================================

    window.open(

      `${API_URL}/receipt/student/${selectedStudent._id}`,

      '_blank'

    )

  }


  return (

    <div className="mb-4">

      <button
        className="table-btn view-btn"
        onClick={handleGenerateReceipt}
      >

        Generate Receipt

      </button>

    </div>

  )

}

export default ReceiptButton