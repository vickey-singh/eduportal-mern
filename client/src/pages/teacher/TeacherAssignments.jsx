import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherAssignments() {

  // ======================================
  // TEACHER
  // ======================================

  const [teacher, setTeacher] =
    useState(null)


  // ======================================
  // ASSIGNED CLASSES
  // ======================================

  const [classes, setClasses] =
    useState([])


  // ======================================
  // ASSIGNMENTS
  // ======================================

  const [assignments, setAssignments] =
    useState([])


  // ======================================
  // FORM
  // ======================================

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [selectedCourse, setSelectedCourse] =
    useState('')

  const [selectedBatch, setSelectedBatch] =
    useState('')

  const [subject, setSubject] =
    useState('')

  const [assignedDate, setAssignedDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    )

  const [dueDate, setDueDate] =
    useState('')


  // ======================================
  // EDIT
  // ======================================

  const [editingId, setEditingId] =
    useState(null)


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)

  const [assignmentsLoading, setAssignmentsLoading] =
    useState(false)

  const [saving, setSaving] =
    useState(false)


  // ======================================
  // MESSAGE
  // ======================================

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')


  // ======================================
  // TOKEN
  // ======================================

  const getToken = () => {

    return localStorage.getItem(
      'teacherToken'
    )

  }


  // ======================================
  // FETCH TEACHER
  // ======================================

  const fetchTeacher =
    async () => {

      try {

        const token =
          getToken()


        if (!token) {

          throw new Error(
            'Teacher authentication token not found.'
          )

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

          const teacherData =
            response.data.teacher


          setTeacher(
            teacherData
          )


          const assigned =
            teacherData.assignedClasses ||
            []


          setClasses(
            assigned
          )


          // =================================
          // DEFAULT COURSE + BATCH
          // =================================

          if (
            assigned.length > 0
          ) {

            const first =
              assigned[0]


            setSelectedCourse(

              first.courseId?.courseName ||
              ''

            )


            setSelectedBatch(

              first.batchTime ||
              ''

            )

          }

        }

        else {

          throw new Error(

            response.data.message ||

            'Unable to load teacher information.'

          )

        }

      }

      catch (error) {

        console.log(

          'Teacher Assignment Teacher Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          error.message ||

          'Unable to load teacher information.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // FETCH ASSIGNMENTS
  // ======================================

  const fetchAssignments =
    async () => {

      try {

        setAssignmentsLoading(true)

        setError('')


        const token =
          getToken()


        const response =
          await axios.get(

            `${API_URL}/teacher/assignments`,

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

          setAssignments(

            response.data.assignments ||
            []

          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load assignments.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Assignments Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load assignments.'

        )

      }

      finally {

        setAssignmentsLoading(false)

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    const loadData =
      async () => {

        await fetchTeacher()

        await fetchAssignments()

      }


    loadData()

  }, [])


  // ======================================
  // AVAILABLE COURSES
  // ======================================

  const availableCourses =
    useMemo(() => {

      return [

        ...new Set(

          classes

            .map(
              (item) =>
                item.courseId?.courseName
            )

            .filter(Boolean)

        ),

      ]

    }, [
      classes,
    ])


  // ======================================
  // AVAILABLE BATCHES
  // ======================================

  const availableBatches =
    useMemo(() => {

      return [

        ...new Set(

          classes

            .filter(

              (item) => {

                return (

                  item.courseId?.courseName ===
                  selectedCourse

                )

              }

            )

            .map(

              (item) =>
                item.batchTime

            )

            .filter(Boolean)

        ),

      ]

    }, [

      classes,

      selectedCourse,

    ])


  // ======================================
  // COURSE CHANGE
  // ======================================

  const handleCourseChange =
    (e) => {

      const course =
        e.target.value


      setSelectedCourse(
        course
      )


      const firstBatch =
        classes.find(

          (item) => {

            return (

              item.courseId?.courseName ===
              course

            )

          }

        )


      setSelectedBatch(

        firstBatch?.batchTime ||
        ''

      )

    }


  // ======================================
  // RESET FORM
  // ======================================

  const resetForm =
    () => {

      setTitle('')

      setDescription('')

      setSubject('')

      setEditingId(null)


      setAssignedDate(

        new Date()
          .toISOString()
          .split('T')[0]

      )


      setDueDate('')


      if (
        classes.length > 0
      ) {

        const first =
          classes[0]


        setSelectedCourse(

          first.courseId?.courseName ||
          ''

        )


        setSelectedBatch(

          first.batchTime ||
          ''

        )

      }

    }


  // ======================================
  // EDIT ASSIGNMENT
  // ======================================

  const handleEdit =
    (assignment) => {

      setEditingId(
        assignment._id
      )


      setTitle(
        assignment.title ||
        ''
      )


      setDescription(
        assignment.description ||
        ''
      )


      setSelectedCourse(
        assignment.course ||
        ''
      )


      setSelectedBatch(
        assignment.batchTime ||
        ''
      )


      setSubject(
        assignment.subject ||
        ''
      )


      setAssignedDate(
        assignment.assignedDate ||
        ''
      )


      setDueDate(
        assignment.dueDate ||
        ''
      )


      setSuccess('')

      setError('')


      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      })

    }


  // ======================================
  // SAVE ASSIGNMENT
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
        !title.trim() ||
        !selectedCourse ||
        !selectedBatch ||
        !assignedDate ||
        !dueDate
      ) {

        setError(

          'Please fill all required fields.'

        )

        return

      }


      // ==================================
      // DATE VALIDATION
      // ==================================

      if (
        dueDate < assignedDate
      ) {

        setError(

          'Due date cannot be earlier than assigned date.'

        )

        return

      }


      try {

        setSaving(true)


        const token =
          getToken()


        const data = {

          title:
            title.trim(),

          description:
            description.trim(),

          course:
            selectedCourse,

          batchTime:
            selectedBatch,

          subject:
            subject.trim(),

          assignedDate,

          dueDate,

        }


        let response


        // ==================================
        // UPDATE
        // ==================================

        if (editingId) {

          response =
            await axios.put(

              `${API_URL}/teacher/assignments/${editingId}`,

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
        // CREATE
        // ==================================

        else {

          response =
            await axios.post(

              `${API_URL}/teacher/assignments`,

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

            response.data.message ||

            (

              editingId

                ? 'Assignment updated successfully.'

                : 'Assignment created successfully.'

            )

          )


          resetForm()


          await fetchAssignments()

        }

        else {

          setError(

            response.data.message ||

            'Unable to save assignment.'

          )

        }

      }

      catch (error) {

        console.log(

          'Save Assignment Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to save assignment.'

        )

      }

      finally {

        setSaving(false)

      }

    }


  // ======================================
  // DELETE ASSIGNMENT
  // ======================================

  const handleDelete =
    async (id) => {

      const confirmed =
        window.confirm(

          'Are you sure you want to delete this assignment?'

        )


      if (!confirmed) {

        return

      }


      try {

        setError('')

        setSuccess('')


        const token =
          getToken()


        const response =
          await axios.delete(

            `${API_URL}/teacher/assignments/${id}`,

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

            response.data.message ||

            'Assignment deleted successfully.'

          )


          if (
            editingId === id
          ) {

            resetForm()

          }


          await fetchAssignments()

        }

        else {

          setError(

            response.data.message ||

            'Unable to delete assignment.'

          )

        }

      }

      catch (error) {

        console.log(

          'Delete Assignment Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to delete assignment.'

        )

      }

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
        />

        <p className="text-muted mt-3">

          Loading assignments...

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
          PAGE HEADER
      ================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          Assignments

        </h2>


        <p className="text-muted mb-0">

          Create and manage assignments for
          your assigned courses and batches.

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
          CREATE / EDIT FORM
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                {
                  editingId
                    ? 'Edit Assignment'
                    : 'Create Assignment'
                }

              </h5>


              <small className="text-muted">

                Only your assigned course and
                batch can be selected.

              </small>

            </div>


            {editingId && (

              <button

                type="button"

                className="btn btn-outline-secondary btn-sm"

                onClick={
                  resetForm
                }

              >

                Cancel Edit

              </button>

            )}

          </div>


          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="row g-3">


              {/* TITLE */}

              <div className="col-12">

                <label className="form-label fw-semibold">

                  Assignment Title
                  <span className="text-danger">
                    *
                  </span>

                </label>


                <input

                  type="text"

                  className="form-control"

                  placeholder="Enter assignment title"

                  value={title}

                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }

                  required

                />

              </div>


              {/* COURSE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Course
                  <span className="text-danger">
                    *
                  </span>

                </label>


                <select

                  className="form-select"

                  value={selectedCourse}

                  onChange={
                    handleCourseChange
                  }

                  required

                >

                  <option value="">

                    Select Course

                  </option>


                  {availableCourses.map(

                    (course) => (

                      <option
                        key={course}
                        value={course}
                      >

                        {course}

                      </option>

                    )

                  )}

                </select>

              </div>


              {/* BATCH */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Batch
                  <span className="text-danger">
                    *
                  </span>

                </label>


                <select

                  className="form-select"

                  value={selectedBatch}

                  onChange={(e) =>
                    setSelectedBatch(
                      e.target.value
                    )
                  }

                  required

                >

                  <option value="">

                    Select Batch

                  </option>


                  {availableBatches.map(

                    (batch) => (

                      <option
                        key={batch}
                        value={batch}
                      >

                        {batch}

                      </option>

                    )

                  )}

                </select>

              </div>


              {/* SUBJECT */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Subject

                </label>


                <input

                  type="text"

                  className="form-control"

                  placeholder="e.g. Mathematics"

                  value={subject}

                  onChange={(e) =>
                    setSubject(
                      e.target.value
                    )
                  }

                />

              </div>


              {/* ASSIGNED DATE */}

              <div className="col-md-3">

                <label className="form-label fw-semibold">

                  Assigned Date
                  <span className="text-danger">
                    *
                  </span>

                </label>


                <input

                  type="date"

                  className="form-control"

                  value={assignedDate}

                  onChange={(e) =>
                    setAssignedDate(
                      e.target.value
                    )
                  }

                  required

                />

              </div>


              {/* DUE DATE */}

              <div className="col-md-3">

                <label className="form-label fw-semibold">

                  Due Date
                  <span className="text-danger">
                    *
                  </span>

                </label>


                <input

                  type="date"

                  className="form-control"

                  value={dueDate}

                  min={assignedDate}

                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }

                  required

                />

              </div>


              {/* DESCRIPTION */}

              <div className="col-12">

                <label className="form-label fw-semibold">

                  Description

                </label>


                <textarea

                  className="form-control"

                  rows="4"

                  placeholder="Write assignment instructions..."

                  value={description}

                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }

                />

              </div>


              {/* SUBMIT */}

              <div className="col-12">

                <button

                  type="submit"

                  className="btn btn-primary"

                  disabled={saving}

                >

                  {saving

                    ? 'Please wait...'

                    : editingId

                      ? 'Update Assignment'

                      : 'Create Assignment'

                  }

                </button>

              </div>

            </div>

          </form>

        </div>

      </div>


      {/* ==================================
          ASSIGNMENTS LIST
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                My Assignments

              </h5>


              <small className="text-muted">

                Assignments created by you.

              </small>

            </div>


            <span className="badge bg-secondary fs-6">

              {
                assignments.length
              }

              {' '}

              Assignment(s)

            </span>

          </div>


          {assignmentsLoading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border"
                role="status"
              />

              <p className="text-muted mt-3">

                Loading assignments...

              </p>

            </div>

          ) : assignments.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: '42px',
                }}
              >

                📚

              </div>


              <h5 className="fw-bold mt-3">

                No Assignments Yet

              </h5>


              <p className="text-muted mb-0">

                Create your first assignment
                using the form above.

              </p>

            </div>

          ) : (

            <div className="row g-4">

              {assignments.map(

                (assignment) => (

                  <div

                    className="col-lg-6"

                    key={
                      assignment._id
                    }

                  >

                    <div className="card border h-100">

                      <div className="card-body p-4">


                        {/* TITLE */}

                        <div className="d-flex justify-content-between align-items-start mb-2">

                          <h5 className="fw-bold mb-0">

                            {
                              assignment.title
                            }

                          </h5>


                          <span

                            className={
                              assignment.status ===
                              'Closed'

                                ? 'badge bg-secondary'

                                : 'badge bg-success'
                            }

                          >

                            {
                              assignment.status ||
                              'Active'
                            }

                          </span>

                        </div>


                        {/* COURSE */}

                        <div className="mb-3">

                          <span className="badge bg-light text-dark border">

                            {
                              assignment.course
                            }

                          </span>


                          <span className="badge bg-light text-dark border ms-2">

                            {
                              assignment.batchTime
                            }

                          </span>

                        </div>


                        {/* SUBJECT */}

                        {assignment.subject && (

                          <p className="mb-2">

                            <strong>
                              Subject:
                            </strong>

                            {' '}

                            {
                              assignment.subject
                            }

                          </p>

                        )}


                        {/* DESCRIPTION */}

                        {assignment.description && (

                          <p className="text-muted">

                            {
                              assignment.description
                            }

                          </p>

                        )}


                        {/* DATES */}

                        <div className="row small mb-3">

                          <div className="col-6">

                            <span className="text-muted">

                              Assigned

                            </span>


                            <div className="fw-semibold">

                              {
                                assignment.assignedDate
                              }

                            </div>

                          </div>


                          <div className="col-6">

                            <span className="text-muted">

                              Due

                            </span>


                            <div className="fw-semibold">

                              {
                                assignment.dueDate
                              }

                            </div>

                          </div>

                        </div>


                        <hr />


                        {/* ACTIONS */}

                        <div className="d-flex gap-2">

                          <button

                            type="button"

                            className="btn btn-outline-primary btn-sm"

                            onClick={() =>
                              handleEdit(
                                assignment
                              )
                            }

                          >

                            Edit

                          </button>


                          <button

                            type="button"

                            className="btn btn-outline-danger btn-sm"

                            onClick={() =>
                              handleDelete(
                                assignment._id
                              )
                            }

                          >

                            Delete

                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                )

              )}

            </div>

          )}

        </div>

      </div>

    </div>

  )

}


export default TeacherAssignments