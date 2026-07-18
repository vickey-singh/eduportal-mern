import '../../assets/styles/admin.css'

function ReceiptButton({ selectedStudent }) {

  return (

    <div className="mb-4">
          
            <button
              className="table-btn view-btn"
              onClick={() => {
          
                if (
          
                  !selectedStudent.paymentHistory ||
          
                  selectedStudent.paymentHistory.length === 0
          
                ) {
          
                  alert(
                    'No Payment History Found'
                  )
          
                  return
          
                }
          
                // ======================================
                // LAST PAYMENT INDEX
                // ======================================
          
                const lastPaymentIndex =
          
                  selectedStudent.paymentHistory.length - 1
          
                // ======================================
                // OPEN RECEIPT
                // ======================================
          
                window.open(
          
                  `https://eduportal-backend-m5t1.onrender.com/api/receipt/${selectedStudent._id}/${lastPaymentIndex}`,
          
                  '_blank'
          
                )
          
              }}
            >
          
              Generate Receipt
          
            </button>
          
          </div>

  )

}

export default ReceiptButton