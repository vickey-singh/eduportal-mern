import { useEffect, useState } from 'react'

import axios from 'axios'

import '../../assets/styles/messages.css'

function Messages() {

  // ======================================
  // STATE
  // ======================================

  const [messages,
    setMessages]

    = useState([])

  // ======================================
  // FETCH MESSAGES
  // ======================================

  useEffect(() => {

    const fetchMessages =
      async () => {

        try {

          const response =
            await axios.get(
              'https://eduportal-backend-m5t1.onrender.com/api/messages'
            )

          setMessages(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchMessages()

  }, [])

  // ======================================
  // DELETE MESSAGE
  // ======================================

  const deleteMessage =
    async (id) => {

      try {

        await axios.delete(
          `https://eduportal-backend-m5t1.onrender.com/api/messages/${id}`
        )

        setMessages(

          messages.filter(
            (item) => item._id !== id
          )

        )

        alert(
          'Message Deleted Successfully'
        )

      } catch (error) {

        console.log(error)

        alert(
          'Delete Failed'
        )

      }

    }

  return (

    <section className="messages-page">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="messages-header">

        <h2>
          Contact Messages
        </h2>

      </div>

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="messages-table-wrapper">

        <div className="table-responsive">

          <table className="table messages-table">

            <thead>

              <tr>

                <th>Name</th>

                <th>Email</th>

                <th>Subject</th>

                <th>Message</th>

                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {messages.map((item) => (

                <tr key={item._id}>

                  {/* Name */}
                  <td>
                    {item.name}
                  </td>

                  {/* Email */}
                  <td>
                    {item.email}
                  </td>

                  {/* Subject */}
                  <td>
                    {item.subject}
                  </td>

                  {/* Message */}
                  <td>
                    {item.message}
                  </td>

                  {/* Action */}
                  <td>

                    <button

                      className="message-delete-btn"

                      onClick={() =>
                        deleteMessage(item._id)
                      }

                    >

                      Delete

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </section>

  )

}

export default Messages