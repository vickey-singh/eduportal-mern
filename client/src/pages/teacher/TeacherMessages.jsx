import { useEffect, useRef, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherMessages() {

  // ======================================
  // STUDENTS
  // ======================================

  const [students, setStudents] =
    useState([])


  // ======================================
  // MESSAGES
  // ======================================

  const [messages, setMessages] =
    useState([])


  // ======================================
  // SELECTED STUDENT
  // ======================================

  const [selectedStudent, setSelectedStudent] =
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
      'teacherToken'
    )

  }


  // ======================================
  // FETCH STUDENTS
  // ======================================

  const fetchStudents =
    async () => {

      try {

        const token =
          getToken()


        if (!token) {

          setError(
            'Teacher authentication token not found.'
          )

          return

        }


        const response =
          await axios.get(

            `${API_URL}/teacher/messages/students`,

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

          setStudents(

            response.data.students ||

            []

          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load students.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Message Students Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load students.'

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

            `${API_URL}/teacher/messages`,

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

        else {

          setError(

            response.data.message ||

            'Unable to load messages.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Messages Error:',

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

          fetchStudents(),

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

    selectedStudent,

  ])


  // ======================================
  // SELECT STUDENT
  // ======================================

  const handleSelectStudent =
    async (student) => {

      setSelectedStudent(
        student
      )


      setFormData({

        subject: '',

        message: '',

      })


      setError('')

      setSuccess('')


      // ==================================
      // MARK UNREAD MESSAGES AS READ
      // ==================================

      const unreadMessages =
        messages.filter(

          (item) =>

            item.senderType ===
              'Student' &&

            item.senderId ===
              student._id &&

            item.receiverType ===
              'Teacher' &&

            !item.isRead

        )


      for (
        const item of unreadMessages
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

      if (!selectedStudent) {

        setError(
          'Please select a student.'
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

            `${API_URL}/teacher/messages`,

            {

              studentId:
                selectedStudent._id,

              course:
                selectedStudent.course,

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

          'Send Message Error:',

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

          `${API_URL}/teacher/messages/${messageId}/read`,

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

          'Mark Message Read Error:',

          error

        )

      }

    }


  // ======================================
  // GET CONVERSATION
  // ======================================

  const conversationMessages =

    selectedStudent

      ? messages.filter(

          (item) => {

            const studentId =
              selectedStudent._id


            return (

              (

                item.senderType ===
                  'Student' &&

                item.senderId ===
                  studentId &&

                item.receiverType ===
                  'Teacher'

              )

              ||

              (

                item.senderType ===
                  'Teacher' &&

                item.receiverType ===
                  'Student' &&

                item.receiverId ===
                  studentId

              )

            )

          }

        )

      : []


  // ======================================
  // UNREAD COUNT
  // ======================================

  const getUnreadCount =
    (studentId) => {

      return messages.filter(

        (item) =>

          item.senderType ===
            'Student' &&

          item.senderId ===
            studentId &&

          item.receiverType ===
            'Teacher' &&

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

          Communicate with your assigned students.

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
                STUDENT LIST
            ================================== */}

            <div className="col-lg-4">

              <div
                className="border-end"
                style={{
                  height: '650px',
                }}
              >


                {/* ==================================
                    LIST HEADER
                ================================== */}

                <div className="p-4 border-bottom">

                  <div className="d-flex justify-content-between align-items-center">

                    <h5 className="fw-bold mb-0">

                      Students

                    </h5>


                    <span className="badge bg-secondary">

                      {
                        students.length
                      }

                    </span>

                  </div>

                </div>


                {/* ==================================
                    STUDENTS
                ================================== */}

                <div
                  style={{
                    height:
                      'calc(650px - 76px)',
                    overflowY:
                      'auto',
                  }}
                >

                  {students.length === 0 ? (

                    <div className="text-center py-5 px-3">

                      <div
                        style={{
                          fontSize: '42px',
                        }}
                      >

                        👨‍🎓

                      </div>


                      <p className="text-muted mt-3 mb-0">

                        No assigned students found.

                      </p>

                    </div>

                  ) : (

                    students.map(

                      (student) => {

                        const unreadCount =
                          getUnreadCount(
                            student._id
                          )


                        const isSelected =

                          selectedStudent?._id ===
                          student._id


                        return (

                          <button

                            type="button"

                            key={
                              student._id
                            }

                            onClick={() =>
                              handleSelectStudent(
                                student
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
                                  student.name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                }

                              </div>


                              {/* STUDENT INFO */}

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
                                      student.name
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


                                <small className="text-muted d-block">

                                  Admission:{' '}

                                  {
                                    student.admissionNumber ||
                                    '-'
                                  }

                                </small>


                                <small className="text-muted d-block text-truncate">

                                  {
                                    student.course ||
                                    '-'
                                  }

                                  {' • '}

                                  {
                                    student.batchTime ||
                                    '-'
                                  }

                                </small>

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


                {!selectedStudent ? (

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

                        Select a Student

                      </h5>


                      <p className="text-muted mb-0">

                        Select a student to view your conversation.

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
                            selectedStudent.name
                              ?.charAt(0)
                              ?.toUpperCase()
                          }

                        </div>


                        {/* STUDENT DETAILS */}

                        <div>

                          <h6 className="fw-bold mb-0">

                            {
                              selectedStudent.name
                            }

                          </h6>


                          <small className="text-muted">

                            Admission:{' '}

                            {
                              selectedStudent.admissionNumber ||
                              '-'
                            }

                            {' • '}

                            {
                              selectedStudent.course ||
                              '-'
                            }

                            {' • '}

                            {
                              selectedStudent.batchTime ||
                              '-'
                            }

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

                              const isTeacher =

                                item.senderType ===
                                'Teacher'


                              return (

                                <div

                                  key={
                                    item._id
                                  }

                                  className={

                                    isTeacher

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

                                        isTeacher

                                          ? 'text-end small text-muted mb-1'

                                          : 'text-start small text-muted mb-1'

                                      }

                                    >

                                      {isTeacher

                                        ? 'You'

                                        : (

                                          selectedStudent.name ||

                                          'Student'

                                        )

                                      }

                                    </div>


                                    {/* MESSAGE BUBBLE */}

                                    <div

                                      className={

                                        isTeacher

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

                                          isTeacher

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


export default TeacherMessages