import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  getAdminAttendanceStudents,
  saveAdminBulkAttendance,
} from '../../services/attendanceService'

import {
  getCourses,
} from '../../services/courseService'


function Attendance() {

  // ======================================
  // NAVIGATION
  // ======================================

  const navigate =
    useNavigate()


  // ======================================
  // COURSES
  // ======================================

  const [courseData, setCourseData] =
    useState([])


  // ======================================
  // STUDENTS
  // ======================================

  const [students, setStudents] =
    useState([])


  // ======================================
  // SELECTED COURSE
  // ======================================

  const [selectedCourse, setSelectedCourse] =
    useState('')


  // ======================================
  // SELECTED BATCH TIME
  // ======================================

  const [selectedBatchTime, setSelectedBatchTime] =
    useState('')


  // ======================================
  // COURSE STUDENTS
  // ======================================
  //
  // Course select karne ke baad course ke
  // saare students temporarily load honge.
  //
  // In students ke actual batchTime se
  // Attendance batch dropdown banega.
  //
  // ======================================

  const [courseStudents, setCourseStudents] =
    useState([])


  // ======================================
  // DATE
  // ======================================

  const getTodayDate = () => {

    const today =
      new Date()

    const year =
      today.getFullYear()

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, '0')

    const day =
      String(
        today.getDate()
      ).padStart(2, '0')

    return `${year}-${month}-${day}`

  }


  const [selectedDate, setSelectedDate] =
    useState(
      getTodayDate()
    )


  // ======================================
  // ATTENDANCE
  // ======================================
  //
  // Example:
  //
  // {
  //   studentId: 'Present'
  // }
  //
  // ======================================

  const [attendance, setAttendance] =
    useState({})


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(false)


  // ======================================
  // LOADING BATCHES
  // ======================================

  const [loadingBatches, setLoadingBatches] =
    useState(false)


  // ======================================
  // SAVING
  // ======================================

  const [saving, setSaving] =
    useState(false)


  // ======================================
  // FETCH COURSES
  // ======================================

  useEffect(() => {

    fetchCourses()

  }, [])


  // ======================================
  // GET COURSES
  // ======================================

  const fetchCourses = async () => {

    try {

      const data =
        await getCourses()


      setCourseData(
        data || []
      )

    }

    catch (error) {

      console.log(
        'Fetch Courses Error:',
        error
      )

    }

  }


  // ======================================
  // AVAILABLE BATCH TIMES
  // ======================================
  //
  // Course ke students ke actual
  // batchTime se unique batch list banegi.
  //
  // ======================================

  const batchTimes =
    useMemo(() => {

      if (
        !courseStudents.length
      ) {

        return []

      }


      const times =
        courseStudents
          .map(
            (student) =>
              String(
                student.batchTime || ''
              ).trim()
          )
          .filter(
            (time) =>
              time !== ''
          )


      return [
        ...new Set(times)
      ]

    }, [
      courseStudents,
    ])


  // ======================================
  // COURSE CHANGE
  // ======================================

  const handleCourseChange = async (e) => {

    const value =
      e.target.value


    setSelectedCourse(
      value
    )


    // ==================================
    // RESET BATCH
    // ==================================

    setSelectedBatchTime('')


    // ==================================
    // RESET STUDENTS
    // ==================================

    setStudents([])


    // ==================================
    // RESET COURSE STUDENTS
    // ==================================

    setCourseStudents([])


    // ==================================
    // RESET ATTENDANCE
    // ==================================

    setAttendance({})


    // ==================================
    // NO COURSE
    // ==================================

    if (!value) {

      return

    }


    try {

      setLoadingBatches(true)


      // ==================================
      // GET ALL STUDENTS OF COURSE
      // ==================================
      //
      // Batch time intentionally empty.
      // Backend then returns all students
      // belonging to this course.
      //
      // ==================================

      const response =
        await getAdminAttendanceStudents({

          course:
            value,

          batchTime:
            '',

          date:
            selectedDate,

        })


      const studentList =
        response?.students || []


      setCourseStudents(
        studentList
      )

    }

    catch (error) {

      console.log(
        'Load Course Students Error:',
        error
      )


      setCourseStudents([])

    }

    finally {

      setLoadingBatches(false)

    }

  }


  // ======================================
  // BATCH CHANGE
  // ======================================

  const handleBatchChange = (e) => {

    const value =
      e.target.value


    setSelectedBatchTime(
      value
    )


    // Students reset
    setStudents([])


    // Attendance reset
    setAttendance({})

  }


  // ======================================
  // DATE CHANGE
  // ======================================

  const handleDateChange = (e) => {

    const value =
      e.target.value


    setSelectedDate(
      value
    )


    // Existing loaded students reset
    setStudents([])


    // Attendance reset
    setAttendance({})

  }


  // ======================================
  // LOAD STUDENTS
  // ======================================

  const loadStudents = async () => {

    // ==================================
    // COURSE CHECK
    // ==================================

    if (!selectedCourse) {

      alert(
        'Please select a course'
      )

      return

    }


    // ==================================
    // BATCH CHECK
    // ==================================

    if (!selectedBatchTime) {

      alert(
        'Please select a batch time'
      )

      return

    }


    // ==================================
    // DATE CHECK
    // ==================================

    if (!selectedDate) {

      alert(
        'Please select a date'
      )

      return

    }


    try {

      setLoading(true)


      // ==================================
      // GET STUDENTS
      // ==================================

      const response =
        await getAdminAttendanceStudents({

          course:
            selectedCourse,

          batchTime:
            selectedBatchTime,

          date:
            selectedDate,

        })


      const studentList =
        response?.students || []


      setStudents(
        studentList
      )


      // ==================================
      // EXISTING ATTENDANCE
      // ==================================

      const attendanceData = {}


      studentList.forEach(
        (student) => {

          if (
            student.attendanceStatus
          ) {

            attendanceData[
              student._id
            ] =
              student.attendanceStatus

          }

        }
      )


      setAttendance(
        attendanceData
      )

    }

    catch (error) {

      console.log(
        'Load Attendance Students Error:',
        error
      )


      alert(

        error.response?.data?.message ||

        'Unable to load students'

      )

    }

    finally {

      setLoading(false)

    }

  }


  // ======================================
  // MARK ATTENDANCE
  // ======================================

  const markAttendance = (
    studentId,
    status
  ) => {

    setAttendance(
      (previous) => ({

        ...previous,

        [studentId]:
          status,

      })
    )

  }


  // ======================================
  // MARK ALL PRESENT
  // ======================================

  const markAllPresent = () => {

    const updatedAttendance = {}


    students.forEach(
      (student) => {

        updatedAttendance[
          student._id
        ] = 'Present'

      }
    )


    setAttendance(
      updatedAttendance
    )

  }


  // ======================================
  // MARK ALL ABSENT
  // ======================================

  const markAllAbsent = () => {

    const updatedAttendance = {}


    students.forEach(
      (student) => {

        updatedAttendance[
          student._id
        ] = 'Absent'

      }
    )


    setAttendance(
      updatedAttendance
    )

  }


  // ======================================
  // SAVE ATTENDANCE
  // ======================================

  const handleSaveAttendance =
    async () => {

      // ==================================
      // STUDENT CHECK
      // ==================================

      if (
        students.length === 0
      ) {

        alert(
          'No students found'
        )

        return

      }


      // ==================================
      // CHECK UNMARKED
      // ==================================

      const unmarkedStudents =
        students.filter(
          (student) =>
            !attendance[
              student._id
            ]
        )


      if (
        unmarkedStudents.length > 0
      ) {

        alert(
          'Please mark Present or Absent for all students'
        )

        return

      }


      try {

        setSaving(true)


        // ==================================
        // PREPARE DATA
        // ==================================

        const attendanceData =
          students.map(
            (student) => ({

              student:
                student._id,

              status:
                attendance[
                  student._id
                ],

            })
          )


        // ==================================
        // SAVE
        // ==================================

        const response =
          await saveAdminBulkAttendance({

            date:
              selectedDate,

            attendance:
              attendanceData,

          })


        alert(

          response.message ||

          'Attendance Saved Successfully'

        )


        // ==================================
        // RELOAD
        // ==================================

        await loadStudents()

      }

      catch (error) {

        console.log(
          'Save Attendance Error:',
          error
        )


        alert(

          error.response?.data?.message ||

          'Unable to save attendance'

        )

      }

      finally {

        setSaving(false)

      }

    }


  // ======================================
  // VIEW STUDENT ATTENDANCE
  // ======================================

  const handleView = (
    studentId
  ) => {

    navigate(
      `/admin/attendance/student/${studentId}`
    )

  }


  // ======================================
  // COUNTS
  // ======================================

  const presentCount =
    students.filter(
      (student) =>
        attendance[
          student._id
        ] === 'Present'
    ).length


  const absentCount =
    students.filter(
      (student) =>
        attendance[
          student._id
        ] === 'Absent'
    ).length


  const unmarkedCount =
    students.length -
    presentCount -
    absentCount


  return (

    <div className="applications-section">


      {/* ==================================
          HEADER
      ================================== */}

      <div className="applications-header">

        <h2>
          Attendance Management
        </h2>

        <p>
          Manage daily student attendance
          batch-wise.
        </p>

      </div>


      {/* ==================================
          FILTER SECTION
      ================================== */}

      <div className="card p-4 mb-4">

        <div className="row">


          {/* ==================================
              COURSE
          ================================== */}

          <div className="col-md-4 mb-3">

            <label className="form-label">

              Course

            </label>


            <select
              className="form-control"
              value={
                selectedCourse
              }
              onChange={
                handleCourseChange
              }
            >

              <option value="">

                Select Course

              </option>


              {courseData.map(
                (course) => (

                  <option
                    key={
                      course._id
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
              )}

            </select>

          </div>


          {/* ==================================
              BATCH TIME
          ================================== */}

          <div className="col-md-4 mb-3">

            <label className="form-label">

              Batch Time

            </label>


            <select
              className="form-control"
              value={
                selectedBatchTime
              }
              onChange={
                handleBatchChange
              }
              disabled={
                !selectedCourse ||
                loadingBatches
              }
            >

              <option value="">

                {loadingBatches

                  ? 'Loading Batch Times...'

                  : 'Select Batch Time'

                }

              </option>


              {batchTimes.map(
                (batch) => (

                  <option
                    key={
                      batch
                    }
                    value={
                      batch
                    }
                  >

                    {
                      batch
                    }

                  </option>

                )
              )}

            </select>

          </div>


          {/* ==================================
              DATE
          ================================== */}

          <div className="col-md-4 mb-3">

            <label className="form-label">

              Attendance Date

            </label>


            <input
              type="date"
              className="form-control"
              value={
                selectedDate
              }
              onChange={
                handleDateChange
              }
            />

          </div>


        </div>


        {/* ==================================
            LOAD STUDENTS
        ================================== */}

        <button
          type="button"
          className="table-btn approve-btn"
          onClick={
            loadStudents
          }
          disabled={
            loading
          }
        >

          {loading
            ? 'Loading...'
            : 'Load Students'}

        </button>

      </div>


      {/* ==================================
          SUMMARY
      ================================== */}

      {students.length > 0 && (

        <div className="row mb-4">


          {/* TOTAL */}

          <div className="col-md-4 mb-3">

            <div className="card p-3 text-center">

              <h6>
                Total Students
              </h6>

              <h3>
                {
                  students.length
                }
              </h3>

            </div>

          </div>


          {/* PRESENT */}

          <div className="col-md-4 mb-3">

            <div className="card p-3 text-center">

              <h6>
                Present
              </h6>

              <h3>
                {
                  presentCount
                }
              </h3>

            </div>

          </div>


          {/* ABSENT */}

          <div className="col-md-4 mb-3">

            <div className="card p-3 text-center">

              <h6>
                Absent
              </h6>

              <h3>
                {
                  absentCount
                }
              </h3>

            </div>

          </div>


        </div>

      )}


      {/* ==================================
          ATTENDANCE TABLE
      ================================== */}

      {students.length > 0 && (

        <div className="card p-4">


          {/* ==================================
              TABLE HEADER
          ================================== */}

          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">

            <div>

              <h5 className="mb-1">

                {
                  selectedCourse
                }

              </h5>

              <small className="text-muted">

                {
                  selectedBatchTime
                }

                {' | '}

                {
                  selectedDate
                }

              </small>

            </div>


            {/* ==================================
                MARK ALL
            ================================== */}

            <div>

              <button
                type="button"
                className="btn btn-sm btn-success me-2"
                onClick={
                  markAllPresent
                }
              >

                Mark All Present

              </button>


              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={
                  markAllAbsent
                }
              >

                Mark All Absent

              </button>

            </div>

          </div>


          {/* ==================================
              TABLE
          ================================== */}

          <div className="table-responsive">

            <table className="table applications-table">

              <thead>

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
                    Batch Time
                  </th>

                  <th>
                    Attendance
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {students.map(
                  (
                    student,
                    index
                  ) => (

                    <tr
                      key={
                        student._id
                      }
                    >


                      {/* NUMBER */}

                      <td>

                        {
                          index + 1
                        }

                      </td>


                      {/* STUDENT */}

                      <td>

                        <strong>

                          {
                            student.name
                          }

                        </strong>

                      </td>


                      {/* ADMISSION NUMBER */}

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


                      {/* BATCH TIME */}

                      <td>

                        {
                          student.batchTime ||
                          '-'
                        }

                      </td>


                      {/* ATTENDANCE */}

                      <td>


                        <button
                          type="button"
                          className={

                            attendance[
                              student._id
                            ] === 'Present'

                              ? 'btn btn-success btn-sm me-2'

                              : 'btn btn-outline-success btn-sm me-2'

                          }
                          onClick={() =>
                            markAttendance(

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

                            attendance[
                              student._id
                            ] === 'Absent'

                              ? 'btn btn-danger btn-sm'

                              : 'btn btn-outline-danger btn-sm'

                          }
                          onClick={() =>
                            markAttendance(

                              student._id,

                              'Absent'

                            )
                          }
                        >

                          Absent

                        </button>


                      </td>


                      {/* VIEW */}

                      <td>

                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() =>
                            handleView(
                              student._id
                            )
                          }
                        >

                          View

                        </button>

                      </td>


                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>


          {/* ==================================
              SAVE SECTION
          ================================== */}

          <div className="mt-3">


            {unmarkedCount > 0 && (

              <p className="text-warning mb-2">

                {
                  unmarkedCount
                }

                {' '}

                student(s) not marked yet.

              </p>

            )}


            <button
              type="button"
              className="table-btn approve-btn"
              onClick={
                handleSaveAttendance
              }
              disabled={
                saving ||
                unmarkedCount > 0
              }
            >

              {saving

                ? 'Saving...'

                : 'Save Attendance'

              }

            </button>


          </div>


        </div>

      )}


      {/* ==================================
          NO STUDENTS
      ================================== */}

      {!loading &&

        selectedCourse &&

        selectedBatchTime &&

        students.length === 0 && (

          <div className="alert alert-info">

            No students found for this
            course and batch.

          </div>

        )}


      {/* ==================================
          NO BATCH TIME
      ================================== */}

      {!loadingBatches &&

        selectedCourse &&

        batchTimes.length === 0 && (

          <div className="alert alert-warning">

            No batch time found for students
            in this course.

          </div>

        )}

    </div>

  )

}


export default Attendance