import { useEffect, useRef, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentMessages() {

  // ======================================
  // TEACHERS
  // ======================================

  const [teachers, setTeachers] =
    useState([])


  // ======================================
  // MESSAGES
  // ======================================

  const [messages, setMessages] =
    useState([])


  // ======================================
  // SELECTED TEACHER
  // ======================================

  const [selectedTeacher, setSelectedTeacher] =
    useState(null)


  // ======================================
  // FORM
  // ======================================

  const [formData, setFormData] =
    useState({

      subject: '',

      message: '',

    })


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  // ======================================
  // SENDING
  // ======================================

  const [sending, setSending] =
    useState(false)


  // ======================================
  // ALERTS
  // ======================================

  const [error, setError] =
    useState('')


  const [success, setSuccess] =
    useState('')


  // ======================================
  // CHAT REF
  // ======================================

  const chatRef =
    useRef(null)


  // ======================================
  // GET TOKEN
  // ======================================

  const getToken = () => {

    return localStorage.getItem(
      'studentToken'
    )

  }


  // ======================================
  // FETCH TEACHERS
  // ======================================

  const fetchTeachers =
    async () => {

      try {

        const token =
          getToken()


        if (!token) {

          setError(
            'Student authentication required.'
          )

          return

        }


        const response =
          await axios.get(

            `${API_URL}/student/messages/teachers`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setTeachers(

            response.data.teachers ||

            []

          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load teachers.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Teachers Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load teachers.'

        )

      }

    }


  // ======================================
  // FETCH MESSAGES
  // ======================================

  const fetchMessages =
    async () => {

      try {

        const token =
          getToken()


        if (!token) {

          return

        }


        const response =
          await axios.get(

            `${API_URL}/student/messages`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setMessages(

            response.data.messages ||

            []

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Student Messages Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load messages.'

        )

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    const loadData =
      async () => {

        setLoading(true)

        setError('')


        await Promise.all([

          fetchTeachers(),

          fetchMessages(),

        ])


        setLoading(false)

      }


    loadData()

  }, [])


  // ======================================
  // AUTO SCROLL
  // ======================================

  useEffect(() => {

    if (
      chatRef.current
    ) {

      chatRef.current.scrollTop =
        chatRef.current.scrollHeight

    }

  }, [

    messages,

    selectedTeacher,

  ])


  // ======================================
  // SELECT TEACHER
  // ======================================

  const handleSelectTeacher =
    async (teacher) => {

      setSelectedTeacher(
        teacher
      )


      setFormData({

        subject: '',

        message: '',

      })


      setError('')

      setSuccess('')


      // ==================================
      // MARK UNREAD TEACHER MESSAGES
      // AS READ
      // ==================================

      const teacherMessages =
        messages.filter(

          (item) =>

            item.senderType ===
              'Teacher' &&

            item.senderId ===
              teacher._id &&

            item.receiverType ===
              'Student' &&

            !item.isRead

        )


      for (
        const item of teacherMessages
      ) {

        await markAsRead(
          item._id
        )

      }

    }


  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange =
    (event) => {

      const {
        name,
        value,
      } =
        event.target


      setFormData(

        (previous) => ({

          ...previous,

          [name]:
            value,

        })

      )

    }


  // ======================================
  // SEND MESSAGE
  // ======================================

  const handleSend =
    async (event) => {

      event.preventDefault()


      setError('')

      setSuccess('')


      // ==================================
      // VALIDATION
      // ==================================

      if (!selectedTeacher) {

        setError(
          'Please select a teacher.'
        )

        return

      }


      if (
        !formData.subject.trim()
      ) {

        setError(
          'Please enter message subject.'
        )

        return

      }


      if (
        !formData.message.trim()
      ) {

        setError(
          'Please enter your message.'
        )

        return

      }


      try {

        setSending(true)


        const token =
          getToken()


        const response =
          await axios.post(

            `${API_URL}/student/messages`,

            {

              teacherId:
                selectedTeacher._id,

              subject:
                formData.subject.trim(),

              message:
                formData.message.trim(),

            },

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setSuccess(
            'Message sent successfully.'
          )


          setFormData({

            subject: '',

            message: '',

          })


          await fetchMessages()

        }

        else {

          setError(

            response.data.message ||

            'Unable to send message.'

          )

        }

      }

      catch (error) {

        console.log(

          'Send Student Message Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to send message.'

        )

      }

      finally {

        setSending(false)

      }

    }


  // ======================================
  // MARK MESSAGE AS READ
  // ======================================

  const markAsRead =
    async (messageId) => {

      try {

        const token =
          getToken()


        await axios.put(

          `${API_URL}/student/messages/${messageId}/read`,

          {},

          {

            headers: {

              Authorization:
                `Bearer ${token}`,

            },

          }

        )


        setMessages(

          (previousMessages) =>

            previousMessages.map(

              (item) =>

                item._id === messageId

                  ? {

                      ...item,

                      isRead: true,

                    }

                  : item

            )

        )

      }

      catch (error) {

        console.log(

          'Mark Student Message Read Error:',

          error

        )

      }

    }


  // ======================================
  // GET CONVERSATION
  // ======================================

  const conversationMessages =

    selectedTeacher

      ? messages.filter(

          (item) => {

            const teacherId =
              selectedTeacher._id


            return (

              (

                item.senderType ===
                  'Teacher' &&

                item.senderId ===
                  teacherId &&

                item.receiverType ===
                  'Student'

              )

              ||

              (

                item.senderType ===
                  'Student' &&

                item.receiverType ===
                  'Teacher' &&

                item.receiverId ===
                  teacherId

              )

            )

          }

        )

      : []


  // ======================================
  // UNREAD COUNT
  // ======================================

  const getUnreadCount =
    (teacherId) => {

      return messages.filter(

        (item) =>

          item.senderType ===
            'Teacher' &&

          item.senderId ===
            teacherId &&

          item.receiverType ===
            'Student' &&

          !item.isRead

      ).length

    }


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-5 text-center">

            <div
              style={{
                fontSize: '48px',
              }}
            >

              💬

            </div>


            <h5 className="fw-bold mt-3">

              Messages

            </h5>


            <p className="text-muted mb-4">

              Your messages available here.

            </p>


            <div
              className="spinner-border text-primary"
              role="status"
            >

              <span className="visually-hidden">

                Loading...

              </span>

            </div>

          </div>

        </div>

      </div>

    )

  }


  return (

    <div>


      {/* ==================================
          HEADER
      ================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          Messages

        </h2>


        <p className="text-muted mb-0">

          Your messages available here.

        </p>

      </div>


      {/* ==================================
          ALERTS
      ================================== */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {success && (

        <div className="alert alert-success">

          {success}

        </div>

      )}


      {/* ==================================
          CHAT CARD
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-0">


          <div className="row g-0">


            {/* ==================================
                TEACHER LIST
            ================================== */}

            <div className="col-lg-4">

              <div
                className="border-end"
                style={{
                  height: '650px',
                }}
              >


                {/* HEADER */}

                <div className="p-4 border-bottom">

                  <div className="d-flex justify-content-between align-items-center">

                    <h5 className="fw-bold mb-0">

                      Teachers

                    </h5>


                    <span className="badge bg-secondary">

                      {
                        teachers.length
                      }

                    </span>

                  </div>

                </div>


                {/* TEACHERS */}

                <div
                  style={{
                    height:
                      'calc(650px - 76px)',
                    overflowY:
                      'auto',
                  }}
                >

                  {teachers.length === 0 ? (

                    <div className="text-center py-5 px-3">

                      <div
                        style={{
                          fontSize: '42px',
                        }}
                      >

                        👨‍🏫

                      </div>


                      <p className="text-muted mt-3 mb-0">

                        No assigned teachers found.

                      </p>

                    </div>

                  ) : (

                    teachers.map(

                      (teacher) => {

                        const unreadCount =
                          getUnreadCount(
                            teacher._id
                          )


                        const isSelected =

                          selectedTeacher?._id ===
                          teacher._id


                        return (

                          <button

                            type="button"

                            key={
                              teacher._id
                            }

                            onClick={() =>
                              handleSelectTeacher(
                                teacher
                              )
                            }

                            className="w-100 text-start border-0"

                            style={{

                              backgroundColor:

                                isSelected

                                  ? '#e9f7f8'

                                  : '#fff',

                              borderBottom:
                                '1px solid #eee',

                              padding:
                                '14px 16px',

                            }}

                          >

                            <div className="d-flex align-items-center gap-3">


                              {/* AVATAR */}

                              <div

                                style={{

                                  width:
                                    '46px',

                                  height:
                                    '46px',

                                  borderRadius:
                                    '50%',

                                  backgroundColor:
                                    '#00adb5',

                                  color:
                                    '#fff',

                                  display:
                                    'flex',

                                  alignItems:
                                    'center',

                                  justifyContent:
                                    'center',

                                  flexShrink:
                                    0,

                                  fontWeight:
                                    '600',

                                  fontSize:
                                    '18px',

                                }}

                              >

                                {
                                  teacher.name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                }

                              </div>


                              {/* TEACHER INFO */}

                              <div
                                className="flex-grow-1"
                                style={{
                                  minWidth:
                                    0,
                                }}
                              >

                                <div className="d-flex justify-content-between align-items-center">

                                  <div className="fw-semibold text-truncate">

                                    {
                                      teacher.name ||
                                      'Teacher'
                                    }

                                  </div>


                                  {unreadCount > 0 && (

                                    <span className="badge bg-primary">

                                      {
                                        unreadCount
                                      }

                                    </span>

                                  )}

                                </div>


                                <small className="text-muted d-block text-truncate">

                                  {
                                    teacher.designation ||
                                    teacher.subject ||
                                    'Teacher'
                                  }

                                </small>


                                {teacher.subject && (

                                  <small className="text-muted d-block text-truncate">

                                    {
                                      teacher.subject
                                    }

                                  </small>

                                )}

                              </div>


                            </div>

                          </button>

                        )

                      }

                    )

                  )}

                </div>


              </div>

            </div>


            {/* ==================================
                CHAT AREA
            ================================== */}

            <div className="col-lg-8">

              <div

                style={{

                  height: '650px',

                  display:
                    'flex',

                  flexDirection:
                    'column',

                }}

              >


                {!selectedTeacher ? (

                  /* ==================================
                      EMPTY CHAT
                  ================================== */

                  <div

                    className="d-flex align-items-center justify-content-center text-center h-100"

                  >

                    <div>

                      <div
                        style={{
                          fontSize: '52px',
                        }}
                      >

                        💬

                      </div>


                      <h5 className="fw-bold mt-3">

                        Select a Teacher

                      </h5>


                      <p className="text-muted mb-0">

                        Select a teacher to view your conversation.

                      </p>

                    </div>

                  </div>

                ) : (

                  <>


                    {/* ==================================
                        CHAT HEADER
                    ================================== */}

                    <div className="p-3 border-bottom">

                      <div className="d-flex align-items-center gap-3">


                        {/* AVATAR */}

                        <div

                          style={{

                            width:
                              '44px',

                            height:
                              '44px',

                            borderRadius:
                              '50%',

                            backgroundColor:
                              '#00adb5',

                            color:
                              '#fff',

                            display:
                              'flex',

                            alignItems:
                              'center',

                            justifyContent:
                              'center',

                            fontWeight:
                              '600',

                            fontSize:
                              '17px',

                          }}

                        >

                          {
                            selectedTeacher.name
                              ?.charAt(0)
                              ?.toUpperCase()
                          }

                        </div>


                        {/* DETAILS */}

                        <div>

                          <h6 className="fw-bold mb-0">

                            {
                              selectedTeacher.name ||
                              'Teacher'
                            }

                          </h6>


                          <small className="text-muted">

                            {
                              selectedTeacher.designation ||
                              selectedTeacher.subject ||
                              'Teacher'
                            }

                            {selectedTeacher.subject && (

                              <>
                                {' • '}
                                {
                                  selectedTeacher.subject
                                }
                              </>

                            )}

                          </small>

                        </div>


                      </div>

                    </div>


                    {/* ==================================
                        CHAT MESSAGES
                    ================================== */}

                    <div

                      ref={
                        chatRef
                      }

                      className="flex-grow-1 p-4"

                      style={{

                        overflowY:
                          'auto',

                        backgroundColor:
                          '#f8f9fa',

                      }}

                    >

                      {conversationMessages.length === 0 ? (

                        <div className="h-100 d-flex align-items-center justify-content-center text-center">

                          <div>

                            <div
                              style={{
                                fontSize:
                                  '42px',
                              }}
                            >

                              💬

                            </div>


                            <p className="text-muted mt-3 mb-1">

                              No messages yet.

                            </p>


                            <small className="text-muted">

                              Start the conversation below.

                            </small>

                          </div>

                        </div>

                      ) : (

                        <div className="d-flex flex-column gap-3">

                          {conversationMessages.map(

                            (item) => {

                              const isStudent =

                                item.senderType ===
                                'Student'


                              return (

                                <div

                                  key={
                                    item._id
                                  }

                                  className={

                                    isStudent

                                      ? 'd-flex justify-content-end'

                                      : 'd-flex justify-content-start'

                                  }

                                >

                                  <div

                                    style={{

                                      maxWidth:
                                        '75%',

                                    }}

                                  >

                                    {/* SENDER */}

                                    <div

                                      className={

                                        isStudent

                                          ? 'text-end small text-muted mb-1'

                                          : 'text-start small text-muted mb-1'

                                      }

                                    >

                                      {isStudent

                                        ? 'You'

                                        : (

                                          selectedTeacher.name ||
                                          'Teacher'

                                        )

                                      }

                                    </div>


                                    {/* BUBBLE */}

                                    <div

                                      className={

                                        isStudent

                                          ? 'bg-primary text-white rounded-3 p-3'

                                          : 'bg-white border rounded-3 p-3'

                                      }

                                      style={{

                                        boxShadow:
                                          '0 1px 3px rgba(0,0,0,0.08)',

                                      }}

                                    >

                                      {/* SUBJECT */}

                                      {item.subject && (

                                        <div className="fw-semibold mb-1">

                                          {
                                            item.subject
                                          }

                                        </div>

                                      )}


                                      {/* MESSAGE */}

                                      <div

                                        style={{

                                          whiteSpace:
                                            'pre-wrap',

                                        }}

                                      >

                                        {
                                          item.message
                                        }

                                      </div>


                                      {/* TIME */}

                                      <div

                                        className={

                                          isStudent

                                            ? 'text-end mt-2 small opacity-75'

                                            : 'text-end mt-2 small text-muted'

                                        }

                                      >

                                        {
                                          item.createdAt

                                            ? new Date(
                                                item.createdAt
                                              ).toLocaleString(
                                                'en-IN'
                                              )

                                            : '-'
                                        }

                                      </div>

                                    </div>

                                  </div>

                                </div>

                              )

                            }

                          )}

                        </div>

                      )}

                    </div>


                    {/* ==================================
                        SEND MESSAGE
                    ================================== */}

                    <div className="p-3 border-top bg-white">

                      <form
                        onSubmit={
                          handleSend
                        }
                      >

                        <div className="row g-2">


                          {/* SUBJECT */}

                          <div className="col-md-4">

                            <input

                              type="text"

                              name="subject"

                              className="form-control"

                              placeholder="Subject"

                              value={
                                formData.subject
                              }

                              onChange={
                                handleChange
                              }

                              required

                            />

                          </div>


                          {/* MESSAGE */}

                          <div className="col-md-6">

                            <input

                              type="text"

                              name="message"

                              className="form-control"

                              placeholder="Type your message..."

                              value={
                                formData.message
                              }

                              onChange={
                                handleChange
                              }

                              required

                            />

                          </div>


                          {/* SEND */}

                          <div className="col-md-2">

                            <button

                              type="submit"

                              className="btn btn-primary w-100"

                              disabled={
                                sending
                              }

                            >

                              {sending

                                ? (

                                  <span
                                    className="spinner-border spinner-border-sm"
                                  />

                                )

                                : (

                                  '📤 Send'

                                )

                              }

                            </button>

                          </div>


                        </div>

                      </form>

                    </div>


                  </>

                )}

              </div>

            </div>


          </div>

        </div>

      </div>


    </div>

  )

}


export default StudentMessages