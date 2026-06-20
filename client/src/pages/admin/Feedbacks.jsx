import { useEffect, useState } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'

function Feedbacks() {

  // ======================================
  // STATE
  // ======================================

  const [feedbackData,
    setFeedbackData]

    = useState([])

  // ======================================
  // FETCH FEEDBACKS
  // ======================================

  useEffect(() => {

    const fetchFeedbacks =
      async () => {

        try {

          const response =
            await axios.get(
              'https://eduportal-backend-m5t1.onrender.com/api/feedback'
            )

          setFeedbackData(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchFeedbacks()

  }, [])

  // ======================================
  // APPROVE FEEDBACK
  // ======================================

  const approveFeedback =
    async (id) => {

      try {

        await axios.put(
          `https://eduportal-backend-m5t1.onrender.com/api/feedback/approve/${id}`
        )

        setFeedbackData(

          feedbackData.map((item) =>

            item._id === id

              ? {
                  ...item,
                  status: 'approved',
                }

              : item

          )

        )

        alert(
          'Feedback Approved'
        )

      } catch (error) {

        console.log(error)

      }

    }

  // ======================================
  // REJECT FEEDBACK
  // ======================================

  const rejectFeedback =
    async (id) => {

      try {

        await axios.put(
          `https://eduportal-backend-m5t1.onrender.com/api/feedback/reject/${id}`
        )

        setFeedbackData(

          feedbackData.map((item) =>

            item._id === id

              ? {
                  ...item,
                  status: 'rejected',
                }

              : item

          )

        )

        alert(
          'Feedback Rejected'
        )

      } catch (error) {

        console.log(error)

      }

    }

  // ======================================
  // DELETE FEEDBACK
  // ======================================

  const deleteFeedback =
    async (id) => {

      try {

        await axios.delete(
          `https://eduportal-backend-m5t1.onrender.com/api/feedback/${id}`
        )

        setFeedbackData(

          feedbackData.filter(
            (item) => item._id !== id
          )

        )

        alert(
          'Feedback Deleted'
        )

      } catch (error) {

        console.log(error)

      }

    }

  // ======================================
  // STAR RATING
  // ======================================

  const renderStars = (rating) => {

    return '⭐'.repeat(rating)

  }

  return (

    <div className="applications-section">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="applications-header">

        <h2>
          Feedback Management
        </h2>

        <p>
          Approve or reject student feedback.
        </p>

      </div>

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="table-responsive">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Name</th>

              <th>Course</th>

              <th>Message</th>

              <th>Rating</th>

              <th>Status</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {feedbackData.map((item) => (

              <tr key={item._id}>

                {/* Name */}
                <td>
                  {item.studentName}
                </td>

                {/* Course */}
                <td>
                  {item.course}
                </td>

                {/* Message */}
                <td>
                  {item.message}
                </td>

                {/* Rating */}
                <td>

                  {renderStars(item.rating)}

                </td>

                {/* Status */}
                <td>

                  <span>

                    {item.status}

                  </span>

                </td>

                {/* Actions */}
                <td>

                  <div className="d-flex gap-2 flex-wrap">

                    <button
                      className="table-btn approve-btn"
                      onClick={() =>
                        approveFeedback(item._id)
                      }
                    >

                      Approve

                    </button>

                    <button
                      className="table-btn reject-btn"
                      onClick={() =>
                        rejectFeedback(item._id)
                      }
                    >

                      Reject

                    </button>

                    <button
                      className="table-btn delete-btn"
                      onClick={() =>
                        deleteFeedback(item._id)
                      }
                    >

                      Delete

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default Feedbacks