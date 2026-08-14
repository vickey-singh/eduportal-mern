import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherTimetable() {

  // ======================================
  // MATERIAL / TIMETABLE DATA
  // ======================================

  const [timetable, setTimetable] =
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
  // ERROR / SUCCESS
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

      course: '',

      batchTime: '',

      day: 'Monday',

      subject: '',

      startTime: '',

      endTime: '',

      room: '',

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
  // FETCH TIMETABLE
  // ======================================

  const fetchTimetable =
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

            `${API_URL}/teacher/timetable`,

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

          setTimetable(

            response.data.timetable ||
            []

          )

        }

        else {

          setError(

            response.data.message ||
            'Unable to load timetable.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Timetable Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load timetable.'

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

    fetchTimetable()

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

        course: '',

        batchTime: '',

        day: 'Monday',

        subject: '',

        startTime: '',

        endTime: '',

        room: '',

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


      if (
        !formData.subject.trim()
      ) {

        setError(
          'Please enter subject.'
        )

        return

      }


      if (
        !formData.startTime ||
        !formData.endTime
      ) {

        setError(
          'Please select start and end time.'
        )

        return

      }


      if (
        formData.startTime >=
        formData.endTime
      ) {

        setError(
          'End time must be after start time.'
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

          course:
            formData.course,

          batchTime:
            formData.batchTime,

          day:
            formData.day,

          subject:
            formData.subject.trim(),

          startTime:
            formData.startTime,

          endTime:
            formData.endTime,

          room:
            formData.room.trim(),

        }


        // ==================================
        // CREATE / UPDATE
        // ==================================

        let response


        if (editingId) {

          response =
            await axios.put(

              `${API_URL}/teacher/timetable/${editingId}`,

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

              `${API_URL}/teacher/timetable`,

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
        // RESPONSE
        // ==================================

        if (
          response.data.success
        ) {

          setSuccess(

            editingId

              ? 'Timetable updated successfully.'

              : 'Timetable created successfully.'

          )


          resetForm()

          await fetchTimetable()

        }

        else {

          setError(

            response.data.message ||
            'Unable to save timetable.'

          )

        }

      }

      catch (error) {

        console.log(

          'Save Timetable Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          error?.message ||

          'Unable to save timetable.'

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
    (item) => {

      setEditingId(
        item._id
      )


      setFormData({

        course:
          item.course || '',

        batchTime:
          item.batchTime || '',

        day:
          item.day || 'Monday',

        subject:
          item.subject || '',

        startTime:
          item.startTime || '',

        endTime:
          item.endTime || '',

        room:
          item.room || '',

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

          'Are you sure you want to delete this timetable entry?'

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

            `${API_URL}/teacher/timetable/${id}`,

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
            'Timetable deleted successfully.'
          )


          await fetchTimetable()

        }

        else {

          setError(

            response.data.message ||
            'Unable to delete timetable.'

          )

        }

      }

      catch (error) {

        console.log(

          'Delete Timetable Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to delete timetable.'

        )

      }

    }


  // ======================================
  // DAY ORDER
  // ======================================

  const dayOrder = {

    Monday: 1,

    Tuesday: 2,

    Wednesday: 3,

    Thursday: 4,

    Friday: 5,

    Saturday: 6,

    Sunday: 7,

  }


  // ======================================
  // SORT TIMETABLE
  // ======================================

  const sortedTimetable =
    [...timetable].sort(

      (a, b) => {

        const dayDifference =
          (
            dayOrder[a.day] || 99
          ) -
          (
            dayOrder[b.day] || 99
          )


        if (
          dayDifference !== 0
        ) {

          return dayDifference

        }


        return (

          a.startTime || ''

        ).localeCompare(

          b.startTime || ''

        )

      }

    )


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

          Loading timetable...

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

          Timetable

        </h2>


        <p className="text-muted mb-0">

          Create and manage your assigned
          class timetable.

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
          ADD / EDIT FORM
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                {editingId

                  ? 'Edit Timetable'

                  : 'Add Timetable'

                }

              </h5>


              <small className="text-muted">

                Only your assigned courses
                and batches can be selected.

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


              {/* DAY */}

              <div className="col-md-4">

                <label className="form-label fw-semibold">

                  Day

                </label>


                <select

                  name="day"

                  className="form-select"

                  value={
                    formData.day
                  }

                  onChange={
                    handleChange
                  }

                >

                  <option value="Monday">
                    Monday
                  </option>

                  <option value="Tuesday">
                    Tuesday
                  </option>

                  <option value="Wednesday">
                    Wednesday
                  </option>

                  <option value="Thursday">
                    Thursday
                  </option>

                  <option value="Friday">
                    Friday
                  </option>

                  <option value="Saturday">
                    Saturday
                  </option>

                  <option value="Sunday">
                    Sunday
                  </option>

                </select>

              </div>


              {/* SUBJECT */}

              <div className="col-md-8">

                <label className="form-label fw-semibold">

                  Subject

                </label>


                <input

                  type="text"

                  name="subject"

                  className="form-control"

                  placeholder="e.g. Mathematics"

                  value={
                    formData.subject
                  }

                  onChange={
                    handleChange
                  }

                  required

                />

              </div>


              {/* START TIME */}

              <div className="col-md-4">

                <label className="form-label fw-semibold">

                  Start Time

                </label>


                <input

                  type="time"

                  name="startTime"

                  className="form-control"

                  value={
                    formData.startTime
                  }

                  onChange={
                    handleChange
                  }

                  required

                />

              </div>


              {/* END TIME */}

              <div className="col-md-4">

                <label className="form-label fw-semibold">

                  End Time

                </label>


                <input

                  type="time"

                  name="endTime"

                  className="form-control"

                  value={
                    formData.endTime
                  }

                  onChange={
                    handleChange
                  }

                  required

                />

              </div>


              {/* ROOM */}

              <div className="col-md-4">

                <label className="form-label fw-semibold">

                  Room / Class

                </label>


                <input

                  type="text"

                  name="room"

                  className="form-control"

                  placeholder="e.g. Room 101"

                  value={
                    formData.room
                  }

                  onChange={
                    handleChange
                  }

                />

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
                          : 'Saving...'
                        }

                      </>

                    )

                    : (

                      editingId
                        ? 'Update Timetable'
                        : 'Add Timetable'

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
          TIMETABLE LIST
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <h5 className="fw-bold mb-0">

              My Timetable

            </h5>


            <span className="badge bg-secondary">

              {
                timetable.length
              }

              {' '}

              Class(es)

            </span>

          </div>


          {timetable.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: '48px',
                }}
              >

                🗓️

              </div>


              <h6 className="fw-bold mt-3">

                No Timetable Entries

              </h6>


              <p className="text-muted mb-0">

                Add your first class timetable
                using the form above.

              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Day
                    </th>

                    <th>
                      Time
                    </th>

                    <th>
                      Course
                    </th>

                    <th>
                      Batch
                    </th>

                    <th>
                      Subject
                    </th>

                    <th>
                      Room
                    </th>

                    <th className="text-end">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {sortedTimetable.map(

                    (item, index) => (

                      <tr
                        key={
                          item._id
                        }
                      >

                        <td>

                          {
                            index + 1
                          }

                        </td>


                        <td>

                          <span className="fw-semibold">

                            {
                              item.day
                            }

                          </span>

                        </td>


                        <td>

                          <span className="badge bg-light text-dark border">

                            {
                              item.startTime
                            }

                            {' - '}

                            {
                              item.endTime
                            }

                          </span>

                        </td>


                        <td>

                          {
                            item.course
                          }

                        </td>


                        <td>

                          {
                            item.batchTime
                          }

                        </td>


                        <td>

                          <span className="fw-semibold">

                            {
                              item.subject
                            }

                          </span>

                        </td>


                        <td>

                          {
                            item.room ||
                            '-'
                          }

                        </td>


                        <td>

                          <div className="d-flex justify-content-end gap-2">

                            <button

                              type="button"

                              className="btn btn-sm btn-outline-warning"

                              onClick={() =>
                                handleEdit(
                                  item
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
                                  item._id
                                )
                              }

                            >

                              Delete

                            </button>

                          </div>

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>

  )

}


export default TeacherTimetable