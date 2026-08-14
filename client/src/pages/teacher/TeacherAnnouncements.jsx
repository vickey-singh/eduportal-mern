import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherAnnouncements() {

  // ======================================
  // ANNOUNCEMENTS
  // ======================================

  const [announcements, setAnnouncements] =
    useState([])


  // ======================================
  // ASSIGNED CLASSES
  // ======================================

  const [assignedClasses, setAssignedClasses] =
    useState([])


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  const [submitting, setSubmitting] =
    useState(false)


  // ======================================
  // ALERTS
  // ======================================

  const [error, setError] =
    useState('')


  const [success, setSuccess] =
    useState('')


  // ======================================
  // EDIT MODE
  // ======================================

  const [editingId, setEditingId] =
    useState(null)


  // ======================================
  // FORM
  // ======================================

  const [formData, setFormData] =
    useState({

      title: '',

      message: '',

      course: '',

      batchTime: '',

      priority: 'Normal',

      expiryDate: '',

    })


  // ======================================
  // FETCH TEACHER
  // ======================================

  const fetchTeacher =
    async () => {

      try {

        const token =
          localStorage.getItem(
            'teacherToken'
          )


        if (!token) {

          return

        }


        const response =
          await axios.get(

            `${API_URL}/teacher/me`,

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

          setAssignedClasses(

            response.data.teacher
              ?.assignedClasses || []

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Teacher Error:',

          error

        )

      }

    }


  // ======================================
  // FETCH ANNOUNCEMENTS
  // ======================================

  const fetchAnnouncements =
    async () => {

      try {

        setLoading(true)

        setError('')


        const token =
          localStorage.getItem(
            'teacherToken'
          )


        if (!token) {

          setError(
            'Teacher authentication token not found.'
          )

          return

        }


        const response =
          await axios.get(

            `${API_URL}/teacher/announcements`,

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

          setAnnouncements(

            response.data.announcements ||
            []

          )

        }

        else {

          setError(

            response.data.message ||
            'Unable to load announcements.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Announcements Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load announcements.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    fetchTeacher()

    fetchAnnouncements()

  }, [])


  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange =
    (e) => {

      const {
        name,
        value,
      } = e.target


      setFormData(
        (previous) => ({

          ...previous,

          [name]:
            value,

        })
      )

    }


  // ======================================
  // COURSE CHANGE
  // ======================================

  const handleCourseChange =
    (e) => {

      const course =
        e.target.value


      setFormData(
        (previous) => ({

          ...previous,

          course,

          batchTime: '',

        })
      )

    }


  // ======================================
  // GET BATCHES
  // ======================================

  const getBatchesForCourse =
    () => {

      if (!formData.course) {

        return []

      }


      return assignedClasses.filter(

        (assignment) => {

          const course =
            assignment.courseId


          if (!course) {

            return false

          }


          return (

            course.courseName ===
            formData.course

          )

        }

      )

    }


  // ======================================
  // RESET FORM
  // ======================================

  const resetForm =
    () => {

      setFormData({

        title: '',

        message: '',

        course: '',

        batchTime: '',

        priority: 'Normal',

        expiryDate: '',

      })


      setEditingId(null)

    }


  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      setError('')

      setSuccess('')


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !formData.title.trim()
      ) {

        setError(
          'Please enter announcement title.'
        )

        return

      }


      if (
        !formData.message.trim()
      ) {

        setError(
          'Please enter announcement message.'
        )

        return

      }


      if (
        !formData.course
      ) {

        setError(
          'Please select a course.'
        )

        return

      }


      if (
        !formData.batchTime
      ) {

        setError(
          'Please select a batch.'
        )

        return

      }


      try {

        setSubmitting(true)


        const token =
          localStorage.getItem(
            'teacherToken'
          )


        if (!token) {

          setError(
            'Teacher authentication token not found.'
          )

          return

        }


        // ==================================
        // REQUEST DATA
        // ==================================

        const data = {

          title:
            formData.title.trim(),

          message:
            formData.message.trim(),

          course:
            formData.course,

          batchTime:
            formData.batchTime,

          priority:
            formData.priority,

          expiryDate:
            formData.expiryDate,

        }


        // ==================================
        // CREATE / UPDATE
        // ==================================

        let response


        if (editingId) {

          response =
            await axios.put(

              `${API_URL}/teacher/announcements/${editingId}`,

              data,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },

              }

            )

        }

        else {

          response =
            await axios.post(

              `${API_URL}/teacher/announcements`,

              data,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },

              }

            )

        }


        // ==================================
        // SUCCESS
        // ==================================

        if (
          response.data.success
        ) {

          setSuccess(

            editingId

              ? 'Announcement updated successfully.'

              : 'Announcement created successfully.'

          )


          resetForm()

          await fetchAnnouncements()

        }

        else {

          setError(

            response.data.message ||
            'Unable to save announcement.'

          )

        }

      }

      catch (error) {

        console.log(

          'Save Announcement Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          error?.message ||

          'Unable to save announcement.'

        )

      }

      finally {

        setSubmitting(false)

      }

    }


  // ======================================
  // EDIT
  // ======================================

  const handleEdit =
    (announcement) => {

      setEditingId(
        announcement._id
      )


      setFormData({

        title:
          announcement.title || '',

        message:
          announcement.message || '',

        course:
          announcement.course || '',

        batchTime:
          announcement.batchTime || '',

        priority:
          announcement.priority ||
          'Normal',

        expiryDate:
          announcement.expiryDate || '',

      })


      setError('')

      setSuccess('')


      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      })

    }


  // ======================================
  // DELETE
  // ======================================

  const handleDelete =
    async (id) => {

      const confirmed =
        window.confirm(

          'Are you sure you want to delete this announcement?'

        )


      if (!confirmed) {

        return

      }


      try {

        setError('')

        setSuccess('')


        const token =
          localStorage.getItem(
            'teacherToken'
          )


        const response =
          await axios.delete(

            `${API_URL}/teacher/announcements/${id}`,

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
            'Announcement deleted successfully.'
          )


          await fetchAnnouncements()

        }

        else {

          setError(

            response.data.message ||
            'Unable to delete announcement.'

          )

        }

      }

      catch (error) {

        console.log(

          'Delete Announcement Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to delete announcement.'

        )

      }

    }


  // ======================================
  // PRIORITY BADGE
  // ======================================

  const getPriorityClass =
    (priority) => {

      if (
        priority === 'Urgent'
      ) {

        return 'bg-danger'

      }


      if (
        priority === 'Important'
      ) {

        return 'bg-warning text-dark'

      }


      return 'bg-secondary'

    }


  // ======================================
  // STATUS
  // ======================================

  const getAnnouncementStatus =
    (announcement) => {

      if (
        announcement.status ===
        'Inactive'
      ) {

        return 'Inactive'

      }


      if (
        announcement.expiryDate
      ) {

        const today =
          new Date()

        today.setHours(
          0,
          0,
          0,
          0
        )


        const expiry =
          new Date(
            announcement.expiryDate
          )

        expiry.setHours(
          0,
          0,
          0,
          0
        )


        if (
          expiry < today
        ) {

          return 'Expired'

        }

      }


      return 'Active'

    }


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div className="text-center py-5">

        <div
          className="spinner-border"
          role="status"
        >

          <span className="visually-hidden">

            Loading...

          </span>

        </div>


        <p className="text-muted mt-3">

          Loading announcements...

        </p>

      </div>

    )

  }


  // ======================================
  // PAGE
  // ======================================

  return (

    <div>


      {/* ==================================
          HEADER
      ================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          Announcements

        </h2>


        <p className="text-muted mb-0">

          Create and manage announcements
          for your assigned students.

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
          CREATE / EDIT
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                {editingId

                  ? 'Edit Announcement'

                  : 'Create Announcement'

                }

              </h5>


              <small className="text-muted">

                The announcement will be associated
                with the selected course and batch.

              </small>

            </div>


            {editingId && (

              <button

                type="button"

                className="btn btn-outline-secondary"

                onClick={
                  resetForm
                }

              >

                Cancel Edit

              </button>

            )}

          </div>


          <form
            onSubmit={handleSubmit}
          >

            <div className="row g-3">


              {/* TITLE */}

              <div className="col-md-8">

                <label className="form-label fw-semibold">

                  Announcement Title

                </label>


                <input

                  type="text"

                  name="title"

                  className="form-control"

                  placeholder="e.g. Tomorrow's Class Timing Changed"

                  value={
                    formData.title
                  }

                  onChange={
                    handleChange
                  }

                  required

                />

              </div>


              {/* PRIORITY */}

              <div className="col-md-4">

                <label className="form-label fw-semibold">

                  Priority

                </label>


                <select

                  name="priority"

                  className="form-select"

                  value={
                    formData.priority
                  }

                  onChange={
                    handleChange
                  }

                >

                  <option value="Normal">

                    Normal

                  </option>

                  <option value="Important">

                    Important

                  </option>

                  <option value="Urgent">

                    Urgent

                  </option>

                </select>

              </div>


              {/* COURSE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Course

                </label>


                <select

                  name="course"

                  className="form-select"

                  value={
                    formData.course
                  }

                  onChange={
                    handleCourseChange
                  }

                  required

                >

                  <option value="">

                    Select Course

                  </option>


                  {assignedClasses.map(

                    (assignment, index) => {

                      const course =
                        assignment.courseId


                      if (!course) {

                        return null

                      }


                      return (

                        <option

                          key={

                            course._id ||
                            index

                          }

                          value={
                            course.courseName
                          }

                        >

                          {
                            course.courseName
                          }

                        </option>

                      )

                    }

                  )}

                </select>

              </div>


              {/* BATCH */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Batch

                </label>


                <select

                  name="batchTime"

                  className="form-select"

                  value={
                    formData.batchTime
                  }

                  onChange={
                    handleChange
                  }

                  disabled={
                    !formData.course
                  }

                  required

                >

                  <option value="">

                    Select Batch

                  </option>


                  {getBatchesForCourse().map(

                    (assignment, index) => (

                      <option

                        key={index}

                        value={
                          assignment.batchTime
                        }

                      >

                        {
                          assignment.batchTime
                        }

                      </option>

                    )

                  )}

                </select>

              </div>


              {/* MESSAGE */}

              <div className="col-12">

                <label className="form-label fw-semibold">

                  Announcement Message

                </label>


                <textarea

                  name="message"

                  className="form-control"

                  rows="5"

                  placeholder="Write announcement details here..."

                  value={
                    formData.message
                  }

                  onChange={
                    handleChange
                  }

                  required

                />

              </div>


              {/* EXPIRY */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Expiry Date

                </label>


                <input

                  type="date"

                  name="expiryDate"

                  className="form-control"

                  value={
                    formData.expiryDate
                  }

                  onChange={
                    handleChange
                  }

                />


                <small className="text-muted">

                  Leave empty if the announcement
                  should not have an expiry date.

                </small>

              </div>


              {/* SUBMIT */}

              <div className="col-12">

                <button

                  type="submit"

                  className="btn btn-primary"

                  disabled={
                    submitting
                  }

                >

                  {submitting

                    ? (

                      <>

                        <span
                          className="spinner-border spinner-border-sm me-2"
                        />

                        {editingId
                          ? 'Updating...'
                          : 'Creating...'
                        }

                      </>

                    )

                    : (

                      editingId

                        ? 'Update Announcement'

                        : 'Create Announcement'

                    )

                  }

                </button>


                {!editingId && (

                  <button

                    type="button"

                    className="btn btn-outline-secondary ms-2"

                    onClick={
                      resetForm
                    }

                  >

                    Clear

                  </button>

                )}

              </div>

            </div>

          </form>

        </div>

      </div>


      {/* ==================================
          ANNOUNCEMENT LIST
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <h5 className="fw-bold mb-0">

              My Announcements

            </h5>


            <span className="badge bg-secondary">

              {
                announcements.length
              }

              {' '}

              Announcement(s)

            </span>

          </div>


          {announcements.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: '48px',
                }}
              >

                📢

              </div>


              <h6 className="fw-bold mt-3">

                No Announcements

              </h6>


              <p className="text-muted mb-0">

                Create your first announcement
                using the form above.

              </p>

            </div>

          ) : (

            <div className="row g-3">

              {announcements.map(

                (announcement) => {

                  const status =
                    getAnnouncementStatus(
                      announcement
                    )


                  return (

                    <div

                      className="col-12"

                      key={
                        announcement._id
                      }

                    >

                      <div className="card border">

                        <div className="card-body">


                          {/* TOP */}

                          <div className="d-flex justify-content-between align-items-start gap-3">

                            <div>

                              <h5 className="fw-bold mb-2">

                                {
                                  announcement.title
                                }

                              </h5>


                              <div className="d-flex flex-wrap gap-2">

                                <span
                                  className={
                                    `badge ${getPriorityClass(
                                      announcement.priority
                                    )}`
                                  }
                                >

                                  {
                                    announcement.priority
                                  }

                                </span>


                                <span className="badge bg-light text-dark border">

                                  {
                                    announcement.course
                                  }

                                </span>


                                <span className="badge bg-light text-dark border">

                                  {
                                    announcement.batchTime
                                  }

                                </span>


                                <span
                                  className={
                                    status === 'Active'

                                      ? 'badge bg-success'

                                      : 'badge bg-secondary'
                                  }
                                >

                                  {
                                    status
                                  }

                                </span>

                              </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="d-flex gap-2 flex-shrink-0">

                              <button

                                type="button"

                                className="btn btn-sm btn-outline-warning"

                                onClick={() =>
                                  handleEdit(
                                    announcement
                                  )
                                }

                              >

                                Edit

                              </button>


                              <button

                                type="button"

                                className="btn btn-sm btn-outline-danger"

                                onClick={() =>
                                  handleDelete(
                                    announcement._id
                                  )
                                }

                              >

                                Delete

                              </button>

                            </div>

                          </div>


                          {/* MESSAGE */}

                          <div className="mt-3">

                            <p
                              className="mb-2"
                              style={{
                                whiteSpace:
                                  'pre-wrap',
                              }}
                            >

                              {
                                announcement.message
                              }

                            </p>

                          </div>


                          {/* FOOTER */}

                          <div className="d-flex flex-wrap gap-3 text-muted small mt-3">

                            <span>

                              Created:{' '}

                              {
                                announcement.createdAt

                                  ? new Date(
                                      announcement.createdAt
                                    ).toLocaleDateString()

                                  : '-'

                              }

                            </span>


                            {announcement.expiryDate && (

                              <span>

                                Expires:{' '}

                                {
                                  new Date(
                                    announcement.expiryDate
                                  ).toLocaleDateString()
                                }

                              </span>

                            )}

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

      </div>

    </div>

  )

}


export default TeacherAnnouncements