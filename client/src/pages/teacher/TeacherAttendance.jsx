import { useEffect, useMemo, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherAttendance() {

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
  // SELECTED COURSE
  // ======================================

  const [selectedCourse, setSelectedCourse] =
    useState('')


  // ======================================
  // SELECTED BATCH
  // ======================================

  const [selectedBatch, setSelectedBatch] =
    useState('')


  // ======================================
  // DATE
  // ======================================

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    )


  // ======================================
  // STUDENTS
  // ======================================

  const [students, setStudents] =
    useState([])


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  const [studentsLoading, setStudentsLoading] =
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

  const getToken = () =>
    localStorage.getItem(
      'teacherToken'
    )


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
          // DEFAULT FIRST CLASS
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

            'Unable to load teacher.'

          )

        }

      }

      catch (error) {

        console.log(

          'Teacher Attendance Teacher Error:',

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
  // FETCH STUDENTS
  // ======================================

  const fetchStudents =
    async () => {

      if (
        !selectedCourse ||
        !selectedBatch ||
        !date
      ) {

        setStudents([])

        return

      }


      try {

        setStudentsLoading(true)

        setError('')

        setSuccess('')


        const token =
          getToken()


        const response =
          await axios.get(

            `${API_URL}/teacher/attendance/students`,

            {

              params: {

                course:
                  selectedCourse,

                batchTime:
                  selectedBatch,

                date,

              },

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
            response.data.students || []
          )

        }

        else {

          setError(

            response.data.message ||

            'Unable to load attendance students.'

          )

        }

      }

      catch (error) {

        console.log(

          'Teacher Attendance Students Error:',

          error

        )


        setStudents([])


        setError(

          error?.response?.data?.message ||

          'Unable to load students.'

        )

      }

      finally {

        setStudentsLoading(false)

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    fetchTeacher()

  }, [])


  // ======================================
  // LOAD STUDENTS
  // ======================================

  useEffect(() => {

    if (
      !loading &&
      selectedCourse &&
      selectedBatch &&
      date
    ) {

      fetchStudents()

    }

  }, [

    loading,

    selectedCourse,

    selectedBatch,

    date,

  ])


  // ======================================
  // AVAILABLE BATCHES
  // ======================================

  const availableBatches =
    useMemo(() => {

      return classes

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

    }, [

      classes,

      selectedCourse,

    ])


  // ======================================
  // CHANGE COURSE
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


      setStudents([])

    }


  // ======================================
  // CHANGE STATUS
  // ======================================

  const handleStatusChange = (studentId, status) => {
    setStudents((current) =>
      current.map((student) => {
        if (student._id !== studentId) return student

        if (status === 'Late') {
          const isLate = student.attendanceIsLate === true
          if (isLate) {
            return {
              ...student,
              attendanceIsLate: false,
              attendanceRemarks: '',
            }
          }
          return {
            ...student,
            attendanceStatus: student.attendanceStatus === 'Absent' ? 'Present' : (student.attendanceStatus || 'Present'),
            attendanceIsLate: true,
            attendanceRemarks: student.attendanceRemarks || '',
          }
        }

        return {
          ...student,
          attendanceStatus: status,
          attendanceIsLate: status === 'Absent' ? false : (student.attendanceIsLate === true),
          attendanceRemarks: status === 'Absent' ? '' : (student.attendanceRemarks || ''),
        }
      })
    )
  }

  // ======================================
  // CHANGE REMARKS
  // ======================================

  const handleRemarksChange =
    (
      studentId,
      remarks
    ) => {

      setStudents(

        (current) =>

          current.map(

            (student) =>

              student._id === studentId
                ? {
                    ...student,
                    attendanceRemarks: remarks.slice(0, 500),
                  }
                : student

          )

      )

    }


  // ======================================
  // MARK ALL PRESENT
  // ======================================

  const markAllPresent =
    () => {

      setStudents(

        (current) =>

          current.map(

            (student) => ({

              ...student,

              attendanceStatus:
                'Present',

              attendanceIsLate: false,

              attendanceRemarks: '',

            })

          )

      )

    }


  // ======================================
  // MARK ALL ABSENT
  // ======================================

  const markAllAbsent =
    () => {

      setStudents(

        (current) =>

          current.map(

            (student) => ({

              ...student,

              attendanceStatus:
                'Absent',

              attendanceIsLate: false,

              attendanceRemarks: '',

            })

          )

      )

    }


  // ======================================
  // SAVE ATTENDANCE
  // ======================================

  const handleSave =
    async () => {

      try {

        setSaving(true)

        setError('')

        setSuccess('')


        const token =
          getToken()


        const attendance =
          students

            .filter(

              (student) =>
                student.attendanceStatus

            )

            .map(

              (student) => ({

                student:
                  student._id,

                status:
                  student.attendanceStatus === 'Late' ? 'Present' : student.attendanceStatus,

                isLate:
                  student.attendanceStatus !== 'Absent' && student.attendanceIsLate === true,

                remarks:
                  student.attendanceStatus !== 'Absent' && student.attendanceIsLate === true
                    ? (student.attendanceRemarks || '').trim()
                    : '',

              })

            )


        if (
          attendance.length === 0
        ) {

          setError(

            'Please mark attendance for at least one student.'

          )

          return

        }

        const lateWithoutRemarks = attendance.filter(
          (record) =>
            record.isLate === true &&
            !record.remarks
        )

        if (lateWithoutRemarks.length > 0) {
          setError(
            'Please add remarks for every student marked Late.'
          )
          return
        }


        const response =
          await axios.post(

            `${API_URL}/teacher/attendance/bulk`,

            {

              date,

              attendance,

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

            'Attendance Saved Successfully.'

          )


          await fetchStudents()

        }

        else {

          setError(

            response.data.message ||

            'Unable to save attendance.'

          )

        }

      }

      catch (error) {

        console.log(

          'Teacher Save Attendance Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to save attendance.'

        )

      }

      finally {

        setSaving(false)

      }

    }


  // ======================================
  // COUNTS
  // ======================================

  const presentCount =
    students.filter(
      (student) =>
        student.attendanceStatus === 'Present' ||
        student.attendanceStatus === 'Late'
    ).length


  const absentCount =
    students.filter(

      (student) =>
        student.attendanceStatus ===
        'Absent'

    ).length

  const lateCount =
    students.filter(
      (student) => student.attendanceIsLate === true || student.attendanceStatus === 'Late'
    ).length


  const unmarkedCount =
    students.length -
    presentCount -
    absentCount


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

          Loading attendance...

        </p>

      </div>

    )

  }


  // ======================================
  // MAIN
  // ======================================

  return (

    <div>


      {/* ==================================
          HEADER
      ================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          Attendance

        </h2>


        <p className="text-muted mb-0">

          Mark attendance for your assigned
          course and batch.

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
          FILTERS
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3">


            {/* COURSE */}

            <div className="col-md-4">

              <label className="form-label fw-semibold">

                Course

              </label>


              <select

                className="form-select"

                value={selectedCourse}

                onChange={
                  handleCourseChange
                }

              >

                <option value="">

                  Select Course

                </option>


                {

                  [
                    ...new Set(

                      classes.map(

                        (item) =>
                          item.courseId?.courseName

                      )

                    ),

                  ]

                  .filter(Boolean)

                  .map(

                    (course) => (

                      <option
                        key={course}
                        value={course}
                      >

                        {course}

                      </option>

                    )

                  )

                }

              </select>

            </div>


            {/* BATCH */}

            <div className="col-md-4">

              <label className="form-label fw-semibold">

                Batch

              </label>


              <select

                className="form-select"

                value={selectedBatch}

                onChange={(e) =>
                  setSelectedBatch(
                    e.target.value
                  )
                }

              >

                <option value="">

                  Select Batch

                </option>


                {

                  [
                    ...new Set(
                      availableBatches
                    ),

                  ]

                  .filter(Boolean)

                  .map(

                    (batch) => (

                      <option
                        key={batch}
                        value={batch}
                      >

                        {batch}

                      </option>

                    )

                  )

                }

              </select>

            </div>


            {/* DATE */}

            <div className="col-md-4">

              <label className="form-label fw-semibold">

                Date

              </label>


              <input

                type="date"

                className="form-control"

                value={date}

                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }

              />

            </div>

          </div>

        </div>

      </div>


      {/* ==================================
          STUDENT SECTION
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">


          {/* TOP BAR */}

          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                Attendance List

              </h5>


              <small className="text-muted">

                {
                  selectedCourse ||
                  'No course'
                }

                {' • '}

                {
                  selectedBatch ||
                  'No batch'
                }

                {' • '}

                {date}

              </small>

            </div>


            <div className="mt-3 mt-lg-0 d-flex gap-2">

              <button

                type="button"

                className="btn btn-outline-success btn-sm"

                onClick={
                  markAllPresent
                }

                disabled={
                  students.length === 0
                }

              >

                Mark All Present

              </button>


              <button

                type="button"

                className="btn btn-outline-danger btn-sm"

                onClick={
                  markAllAbsent
                }

                disabled={
                  students.length === 0
                }

              >

                Mark All Absent

              </button>

            </div>

          </div>


          {/* LOADING */}

          {studentsLoading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border"
                role="status"
              />

              <p className="text-muted mt-3">

                Loading students...

              </p>

            </div>

          ) : students.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: '42px',
                }}
              >

                📝

              </div>


              <h5 className="fw-bold mt-3">

                No Students Found

              </h5>


              <p className="text-muted mb-0">

                No students are available for
                this course and batch.

              </p>

            </div>

          ) : (

            <>

              {/* SUMMARY */}

              <div className="row g-3 mb-4">

                <div className="col-md-3">

                  <div className="border rounded p-3">

                    <small className="text-muted">

                      Total Students

                    </small>


                    <h4 className="fw-bold mb-0 mt-1">

                      {
                        students.length
                      }

                    </h4>

                  </div>

                </div>


                <div className="col-md-3">

                  <div className="border rounded p-3">

                    <small className="text-muted">

                      Present

                    </small>


                    <h4 className="fw-bold text-success mb-0 mt-1">

                      {
                        presentCount
                      }

                    </h4>

                  </div>

                </div>


                <div className="col-md-3">

                  <div className="border rounded p-3">

                    <small className="text-muted">

                      Absent

                    </small>


                    <h4 className="fw-bold text-danger mb-0 mt-1">

                      {
                        absentCount
                      }

                    </h4>

                  </div>

                </div>

                <div className="col-md-3">

                  <div className="border rounded p-3">

                    <small className="text-muted">
                      Late
                    </small>

                    <h4 className="fw-bold text-dark mb-0 mt-1">
                      {lateCount}
                    </h4>

                  </div>

                </div>

              </div>


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

                      <th>
                        Roll No.
                      </th>

                      <th>
                        Course
                      </th>

                      <th>
                        Batch
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {students.map(

                      (student, index) => (

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


                            <small className="text-muted">

                              {
                                student.contact ||
                                ''
                              }

                            </small>

                          </td>


                          <td>

                            {
                              student.admissionNumber
                            }

                          </td>


                          {/* ROLL NUMBER */}

                          <td>

                            {
                              student.rollNumber ||
                              '-'
                            }

                          </td>


                          <td>

                            {
                              student.course
                            }

                          </td>


                          <td>

                            {
                              student.batchTime ||
                              '-'
                            }

                          </td>


                          <td>

                            <div className="d-flex gap-2">

                              <button

                                type="button"

                                className={
                                  student.attendanceStatus ===
                                  'Present'

                                    ? 'btn btn-success btn-sm'

                                    : 'btn btn-outline-success btn-sm'
                                }

                                onClick={() =>
                                  handleStatusChange(

                                    student._id,

                                    'Present'

                                  )
                                }

                              >

                                Present

                              </button>


                              <button

                                type="button"

                                className={
                                  student.attendanceStatus ===
                                  'Absent'

                                    ? 'btn btn-danger btn-sm'

                                    : 'btn btn-outline-danger btn-sm'
                                }

                                onClick={() =>
                                  handleStatusChange(

                                    student._id,

                                    'Absent'

                                  )
                                }

                              >

                                Absent

                              </button>

                              <button

                                type="button"

                                className={
                                  student.attendanceIsLate === true
                                    ? 'btn btn-warning btn-sm text-dark'
                                    : 'btn btn-outline-warning btn-sm'
                                }

                                onClick={() =>
                                  handleStatusChange(
                                    student._id,
                                    'Late'
                                  )
                                }

                              >

                                Late

                              </button>

                            </div>

                            {student.attendanceIsLate === true && (

                              <input
                                type="text"
                                className="form-control form-control-sm mt-2"
                                value={student.attendanceRemarks || ''}
                                maxLength={500}
                                placeholder="Remarks required for Late"
                                aria-label={`Remarks for ${student.name}`}
                                onChange={(e) =>
                                  handleRemarksChange(
                                    student._id,
                                    e.target.value
                                  )
                                }
                              />

                            )}

                          </td>

                        </tr>

                      )

                    )}

                  </tbody>

                </table>

              </div>


              {/* SAVE */}

              <div className="d-flex justify-content-between align-items-center mt-3">

                <small className="text-muted">

                  Unmarked: {unmarkedCount}

                </small>


                <button

                  type="button"

                  className="btn btn-primary"

                  onClick={
                    handleSave
                  }

                  disabled={
                    saving ||
                    students.length === 0
                  }

                >

                  {saving

                    ? 'Saving...'

                    : 'Save Attendance'

                  }

                </button>

              </div>

            </>

          )}

        </div>

      </div>

    </div>

  )

}


export default TeacherAttendance