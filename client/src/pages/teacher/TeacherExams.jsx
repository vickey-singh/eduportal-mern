import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherExams() {

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
  // EXAMS
  // ======================================

  const [exams, setExams] =
    useState([])


  // ======================================
  // FORM
  // ======================================

  const [examName, setExamName] =
    useState('')

  const [examType, setExamType] =
    useState('Class Test')

  const [subject, setSubject] =
    useState('')

  const [selectedCourse, setSelectedCourse] =
    useState('')

  const [selectedBatch, setSelectedBatch] =
    useState('')

  const [examDate, setExamDate] =
    useState('')

  const [totalMarks, setTotalMarks] =
    useState('')

  const [passingMarks, setPassingMarks] =
    useState('')

  const [description, setDescription] =
    useState('')


  // ======================================
  // EDIT
  // ======================================

  const [editingId, setEditingId] =
    useState(null)


  // ======================================
  // MARKS MODE
  // ======================================

  const [marksExam, setMarksExam] =
    useState(null)

  const [markStudents, setMarkStudents] =
    useState([])

  const [marksLoading, setMarksLoading] =
    useState(false)

  const [marksSaving, setMarksSaving] =
    useState(false)


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)

  const [examsLoading, setExamsLoading] =
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

          'Teacher Exams Teacher Error:',

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
  // FETCH EXAMS
  // ======================================

  const fetchExams =
    async () => {

      try {

        setExamsLoading(true)

        setError('')


        const token =
          getToken()


        const response =
          await axios.get(

            `${API_URL}/teacher/exams`,

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

          setExams(

            response.data.exams ||
            []

          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load exams.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Exams Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load exams.'

        )

      }

      finally {

        setExamsLoading(false)

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    const loadData =
      async () => {

        await fetchTeacher()

        await fetchExams()

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

      setExamName('')

      setExamType('Class Test')

      setSubject('')

      setExamDate('')

      setTotalMarks('')

      setPassingMarks('')

      setDescription('')

      setEditingId(null)


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
  // EDIT EXAM
  // ======================================

  const handleEdit =
    (exam) => {

      setEditingId(
        exam._id
      )


      setExamName(
        exam.examName ||
        ''
      )


      setExamType(
        exam.examType ||
        'Class Test'
      )


      setSubject(
        exam.subject ||
        ''
      )


      setSelectedCourse(
        exam.course ||
        ''
      )


      setSelectedBatch(
        exam.batchTime ||
        ''
      )


      setExamDate(
        exam.examDate ||
        ''
      )


      setTotalMarks(
        exam.totalMarks ??
        ''
      )


      setPassingMarks(
        exam.passingMarks ??
        ''
      )


      setDescription(
        exam.description ||
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
  // SAVE EXAM
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      setError('')

      setSuccess('')


      if (

        !examName.trim() ||

        !selectedCourse ||

        !selectedBatch ||

        !examDate ||

        totalMarks === ''

      ) {

        setError(

          'Please fill all required fields.'

        )

        return

      }


      const maximumMarks =
        Number(totalMarks)


      const minimumMarks =
        Number(
          passingMarks || 0
        )


      if (

        Number.isNaN(
          maximumMarks
        ) ||

        maximumMarks <= 0

      ) {

        setError(

          'Total marks must be greater than 0.'

        )

        return

      }


      if (

        minimumMarks < 0 ||

        minimumMarks >
          maximumMarks

      ) {

        setError(

          'Passing marks cannot be greater than total marks.'

        )

        return

      }


      try {

        setSaving(true)


        const token =
          getToken()


        const data = {

          examName:
            examName.trim(),

          examType,

          subject:
            subject.trim(),

          course:
            selectedCourse,

          batchTime:
            selectedBatch,

          examDate,

          totalMarks:
            maximumMarks,

          passingMarks:
            minimumMarks,

          description:
            description.trim(),

        }


        let response


        if (editingId) {

          response =
            await axios.put(

              `${API_URL}/teacher/exams/${editingId}`,

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

              `${API_URL}/teacher/exams`,

              data,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },

              }

            )

        }


        if (
          response.data.success
        ) {

          setSuccess(

            response.data.message ||

            (

              editingId

                ? 'Exam updated successfully.'

                : 'Exam created successfully.'

            )

          )


          resetForm()


          await fetchExams()

        }

        else {

          setError(

            response.data.message ||

            'Unable to save exam.'

          )

        }

      }

      catch (error) {

        console.log(

          'Save Exam Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to save exam.'

        )

      }

      finally {

        setSaving(false)

      }

    }


  // ======================================
  // DELETE EXAM
  // ======================================

  const handleDelete =
    async (id) => {

      const confirmed =
        window.confirm(

          'Are you sure you want to delete this exam?'

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

            `${API_URL}/teacher/exams/${id}`,

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

            'Exam deleted successfully.'

          )


          if (
            editingId === id
          ) {

            resetForm()

          }


          await fetchExams()

        }

        else {

          setError(

            response.data.message ||

            'Unable to delete exam.'

          )

        }

      }

      catch (error) {

        console.log(

          'Delete Exam Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to delete exam.'

        )

      }

    }


  // ======================================
  // LOAD STUDENTS FOR MARKS
  // ======================================

  const handleEnterMarks =
    async (exam) => {

      try {

        setError('')

        setSuccess('')

        setMarksExam(exam)

        setMarksLoading(true)

        setMarkStudents([])


        const token =
          getToken()


        const response =
          await axios.get(

            `${API_URL}/teacher/exams/${exam._id}/students`,

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

          setMarksExam(
            response.data.exam ||
            exam
          )


          setMarkStudents(

            response.data.students ||
            []

          )


          window.scrollTo({

            top: 0,

            behavior: 'smooth',

          })

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

          'Load Exam Students Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load students for marks.'

        )

      }

      finally {

        setMarksLoading(false)

      }

    }


  // ======================================
  // CLOSE MARKS
  // ======================================

  const closeMarks =
    () => {

      setMarksExam(null)

      setMarkStudents([])

    }


  // ======================================
  // CHANGE MARKS
  // ======================================

  const handleMarksChange =
    (
      studentId,
      value
    ) => {

      setMarkStudents(

        (current) =>

          current.map(

            (student) => {

              if (
                student._id ===
                studentId
              ) {

                return {

                  ...student,

                  obtainedMarks:
                    value,

                }

              }

              return student

            }

          )

      )

    }


  // ======================================
  // CHANGE REMARKS
  // ======================================

  const handleRemarksChange =
    (
      studentId,
      value
    ) => {

      setMarkStudents(

        (current) =>

          current.map(

            (student) => {

              if (
                student._id ===
                studentId
              ) {

                return {

                  ...student,

                  remarks:
                    value,

                }

              }

              return student

            }

          )

      )

    }


  // ======================================
  // SAVE MARKS
  // ======================================

  const handleSaveMarks =
    async () => {

      if (
        !marksExam
      ) {

        return

      }


      setError('')

      setSuccess('')


      // ==================================
      // VALIDATE MARKS
      // ==================================

      const invalidStudent =
        markStudents.find(

          (student) => {

            if (
              student.obtainedMarks === '' ||
              student.obtainedMarks === null ||
              student.obtainedMarks === undefined
            ) {

              return false

            }


            const value =
              Number(
                student.obtainedMarks
              )


            return (

              Number.isNaN(value) ||

              value < 0 ||

              value >
                marksExam.totalMarks

            )

          }

        )


      if (invalidStudent) {

        setError(

          `Invalid marks for ${invalidStudent.name}. Marks must be between 0 and ${marksExam.totalMarks}.`

        )

        return

      }


      const marks =
        markStudents

          .filter(

            (student) => (

              student.obtainedMarks !== '' &&

              student.obtainedMarks !== null &&

              student.obtainedMarks !== undefined

            )

          )

          .map(

            (student) => ({

              studentId:
                student._id,

              obtainedMarks:
                Number(
                  student.obtainedMarks
                ),

              remarks:
                student.remarks ||
                '',

            })

          )


      if (
        marks.length === 0
      ) {

        setError(

          'Please enter marks for at least one student.'

        )

        return

      }


      try {

        setMarksSaving(true)


        const token =
          getToken()


        const response =
          await axios.post(

            `${API_URL}/teacher/exams/${marksExam._id}/marks`,

            {

              marks,

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

            response.data.message ||

            'Marks saved successfully.'

          )


          // Reload saved marks

          await handleEnterMarks(
            marksExam
          )

          await fetchExams()

        }

        else {

          setError(

            response.data.message ||

            'Unable to save marks.'

          )

        }

      }

      catch (error) {

        console.log(

          'Save Marks Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to save marks.'

        )

      }

      finally {

        setMarksSaving(false)

      }

    }


  // ======================================
  // STATUS BADGE
  // ======================================

  const getStatusClass =
    (status) => {

      if (
        status === 'Completed'
      ) {

        return 'badge bg-primary'

      }


      if (
        status === 'Cancelled'
      ) {

        return 'badge bg-danger'

      }


      if (
        status === 'Active'
      ) {

        return 'badge bg-success'

      }


      return 'badge bg-warning text-dark'

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

          Loading exams...

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

          Marks & Exams

        </h2>


        <p className="text-muted mb-0">

          Create exams and enter student marks
          for your assigned courses.

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
          MARKS ENTRY SECTION
      ================================== */}

      {marksExam && (

        <div className="card border-0 shadow-sm mb-4">

          <div className="card-body p-4">


            {/* HEADER */}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

              <div>

                <h5 className="fw-bold mb-1">

                  Enter Marks

                </h5>


                <div className="text-muted">

                  {
                    marksExam.examName
                  }

                  {' • '}

                  {
                    marksExam.course
                  }

                  {' • '}

                  {
                    marksExam.batchTime
                  }

                </div>


                <small className="text-muted">

                  Total Marks:
                  {' '}

                  <strong>

                    {
                      marksExam.totalMarks
                    }

                  </strong>

                  {' • '}

                  Passing:
                  {' '}

                  <strong>

                    {
                      marksExam.passingMarks
                    }

                  </strong>

                </small>

              </div>


              <button

                type="button"

                className="btn btn-outline-secondary mt-3 mt-md-0"

                onClick={
                  closeMarks
                }

              >

                Close

              </button>

            </div>


            {/* LOADING */}

            {marksLoading ? (

              <div className="text-center py-5">

                <div
                  className="spinner-border"
                  role="status"
                />

                <p className="text-muted mt-3">

                  Loading students...

                </p>

              </div>

            ) : markStudents.length === 0 ? (

              <div className="text-center py-5">

                <div
                  style={{
                    fontSize: '42px',
                  }}
                >

                  👨‍🎓

                </div>


                <h5 className="fw-bold mt-3">

                  No Students Found

                </h5>


                <p className="text-muted mb-0">

                  No students are enrolled in this
                  course and batch.

                </p>

              </div>

            ) : (

              <>

                {/* TABLE */}

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead className="table-light">

                      <tr>

                        <th>
                          #
                        </th>

                        <th>
                          Student
                        </th>

                        <th>
                          Admission No.
                        </th>

                        <th
                          style={{
                            minWidth: '160px',
                          }}
                        >

                          Marks

                        </th>

                        <th
                          style={{
                            minWidth: '220px',
                          }}
                        >

                          Remarks

                        </th>

                        <th>
                          Result
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {markStudents.map(

                        (student, index) => {

                          const hasMarks =
                            student.obtainedMarks !== '' &&
                            student.obtainedMarks !== null &&
                            student.obtainedMarks !== undefined


                          const obtained =
                            Number(
                              student.obtainedMarks
                            )


                          const result =
                            hasMarks

                              ? obtained >=
                                marksExam.passingMarks

                                ? 'Pass'

                                : 'Fail'

                              : ''


                          return (

                            <tr
                              key={
                                student._id
                              }
                            >

                              <td>

                                {
                                  index + 1
                                }

                              </td>


                              <td>

                                <div className="fw-semibold">

                                  {
                                    student.name
                                  }

                                </div>

                              </td>


                              <td>

                                {
                                  student.admissionNumber
                                }

                              </td>


                              <td>

                                <div className="input-group">

                                  <input

                                    type="number"

                                    className="form-control"

                                    min="0"

                                    max={
                                      marksExam.totalMarks
                                    }

                                    step="0.01"

                                    placeholder="Marks"

                                    value={
                                      student.obtainedMarks
                                    }

                                    onChange={(e) =>
                                      handleMarksChange(

                                        student._id,

                                        e.target.value

                                      )
                                    }

                                  />


                                  <span className="input-group-text">

                                    /
                                    {' '}
                                    {
                                      marksExam.totalMarks
                                    }

                                  </span>

                                </div>

                              </td>


                              <td>

                                <input

                                  type="text"

                                  className="form-control"

                                  placeholder="Optional remarks"

                                  value={
                                    student.remarks ||
                                    ''
                                  }

                                  onChange={(e) =>
                                    handleRemarksChange(

                                      student._id,

                                      e.target.value

                                    )
                                  }

                                />

                              </td>


                              <td>

                                {result ===
                                'Pass' ? (

                                  <span className="badge bg-success">

                                    Pass

                                  </span>

                                ) : result ===
                                  'Fail' ? (

                                  <span className="badge bg-danger">

                                    Fail

                                  </span>

                                ) : (

                                  <span className="badge bg-secondary">

                                    Pending

                                  </span>

                                )}

                              </td>

                            </tr>

                          )

                        }

                      )}

                    </tbody>

                  </table>

                </div>


                {/* SAVE */}

                <div className="d-flex justify-content-between align-items-center mt-4">

                  <small className="text-muted">

                    Entered marks will be saved for
                    this exam.

                  </small>


                  <button

                    type="button"

                    className="btn btn-primary"

                    onClick={
                      handleSaveMarks
                    }

                    disabled={
                      marksSaving
                    }

                  >

                    {marksSaving

                      ? 'Saving Marks...'

                      : 'Save Marks'

                    }

                  </button>

                </div>

              </>

            )}

          </div>

        </div>

      )}


      {/* ==================================
          EXAM FORM
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                {
                  editingId
                    ? 'Edit Exam'
                    : 'Create Exam'
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


              {/* EXAM NAME */}

              <div className="col-md-8">

                <label className="form-label fw-semibold">

                  Exam Name
                  <span className="text-danger">
                    *
                  </span>

                </label>


                <input

                  type="text"

                  className="form-control"

                  placeholder="e.g. Mathematics Unit Test"

                  value={examName}

                  onChange={(e) =>
                    setExamName(
                      e.target.value
                    )
                  }

                  required

                />

              </div>


              {/* EXAM TYPE */}

              <div className="col-md-4">

                <label className="form-label fw-semibold">

                  Exam Type

                </label>


                <select

                  className="form-select"

                  value={examType}

                  onChange={(e) =>
                    setExamType(
                      e.target.value
                    )
                  }

                >

                  <option value="Class Test">

                    Class Test

                  </option>

                  <option value="Unit Test">

                    Unit Test

                  </option>

                  <option value="Monthly Test">

                    Monthly Test

                  </option>

                  <option value="Mock Test">

                    Mock Test

                  </option>

                  <option value="Mid Term">

                    Mid Term

                  </option>

                  <option value="Final Exam">

                    Final Exam

                  </option>

                  <option value="Other">

                    Other

                  </option>

                </select>

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


              {/* EXAM DATE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Exam Date
                  <span className="text-danger">
                    *
                  </span>

                </label>


                <input

                  type="date"

                  className="form-control"

                  value={examDate}

                  onChange={(e) =>
                    setExamDate(
                      e.target.value
                    )
                  }

                  required

                />

              </div>


              {/* TOTAL MARKS */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Total Marks
                  <span className="text-danger">
                    *
                  </span>

                </label>


                <input

                  type="number"

                  className="form-control"

                  placeholder="e.g. 100"

                  min="1"

                  value={totalMarks}

                  onChange={(e) =>
                    setTotalMarks(
                      e.target.value
                    )
                  }

                  required

                />

              </div>


              {/* PASSING MARKS */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Passing Marks

                </label>


                <input

                  type="number"

                  className="form-control"

                  placeholder="e.g. 40"

                  min="0"

                  value={passingMarks}

                  onChange={(e) =>
                    setPassingMarks(
                      e.target.value
                    )
                  }

                />

              </div>


              {/* DESCRIPTION */}

              <div className="col-12">

                <label className="form-label fw-semibold">

                  Description

                </label>


                <textarea

                  className="form-control"

                  rows="3"

                  placeholder="Exam instructions or description..."

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

                      ? 'Update Exam'

                      : 'Create Exam'

                  }

                </button>

              </div>

            </div>

          </form>

        </div>

      </div>


      {/* ==================================
          EXAM LIST
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                My Exams

              </h5>


              <small className="text-muted">

                Manage exams and enter student
                marks.

              </small>

            </div>


            <span className="badge bg-secondary fs-6">

              {exams.length}

              {' '}

              Exam(s)

            </span>

          </div>


          {examsLoading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border"
                role="status"
              />

              <p className="text-muted mt-3">

                Loading exams...

              </p>

            </div>

          ) : exams.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: '42px',
                }}
              >

                📊

              </div>


              <h5 className="fw-bold mt-3">

                No Exams Yet

              </h5>


              <p className="text-muted mb-0">

                Create your first exam using
                the form above.

              </p>

            </div>

          ) : (

            <div className="row g-4">

              {exams.map(

                (exam) => (

                  <div

                    className="col-lg-6"

                    key={
                      exam._id
                    }

                  >

                    <div className="card border h-100">

                      <div className="card-body p-4">


                        {/* TITLE */}

                        <div className="d-flex justify-content-between align-items-start mb-2">

                          <h5 className="fw-bold mb-0">

                            {
                              exam.examName
                            }

                          </h5>


                          <span

                            className={
                              getStatusClass(
                                exam.status
                              )
                            }

                          >

                            {
                              exam.status ||
                              'Upcoming'
                            }

                          </span>

                        </div>


                        {/* COURSE + BATCH */}

                        <div className="mb-3">

                          <span className="badge bg-light text-dark border">

                            {
                              exam.course
                            }

                          </span>


                          <span className="badge bg-light text-dark border ms-2">

                            {
                              exam.batchTime
                            }

                          </span>

                        </div>


                        {/* DETAILS */}

                        <div className="row g-3 mb-3">

                          <div className="col-6">

                            <small className="text-muted">

                              Exam Type

                            </small>


                            <div className="fw-semibold">

                              {
                                exam.examType
                              }

                            </div>

                          </div>


                          <div className="col-6">

                            <small className="text-muted">

                              Subject

                            </small>


                            <div className="fw-semibold">

                              {
                                exam.subject ||
                                '-'
                              }

                            </div>

                          </div>


                          <div className="col-6">

                            <small className="text-muted">

                              Exam Date

                            </small>


                            <div className="fw-semibold">

                              {
                                exam.examDate
                              }

                            </div>

                          </div>


                          <div className="col-6">

                            <small className="text-muted">

                              Marks

                            </small>


                            <div className="fw-semibold">

                              {
                                exam.totalMarks
                              }

                              {' '}

                              marks

                            </div>

                          </div>


                          <div className="col-6">

                            <small className="text-muted">

                              Passing

                            </small>


                            <div className="fw-semibold">

                              {
                                exam.passingMarks
                              }

                              {' '}

                              marks

                            </div>

                          </div>

                        </div>


                        {/* DESCRIPTION */}

                        {exam.description && (

                          <p className="text-muted mb-3">

                            {
                              exam.description
                            }

                          </p>

                        )}


                        <hr />


                        {/* ACTIONS */}

                        <div className="d-flex flex-wrap gap-2">

                          <button

                            type="button"

                            className="btn btn-primary btn-sm"

                            onClick={() =>
                              handleEnterMarks(
                                exam
                              )
                            }

                          >

                            Enter Marks

                          </button>


                          <button

                            type="button"

                            className="btn btn-outline-primary btn-sm"

                            onClick={() =>
                              handleEdit(
                                exam
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
                                exam._id
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


export default TeacherExams