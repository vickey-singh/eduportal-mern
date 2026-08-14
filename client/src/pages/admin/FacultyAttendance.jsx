import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function FacultyAttendance() {

  // ======================================
  // SELECTED DATE
  // ======================================

  const [selectedDate, setSelectedDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0]
    )


  // ======================================
  // FACULTY
  // ======================================

  const [faculty, setFaculty] =
    useState([])


  // ======================================
  // ATTENDANCE
  // ======================================

  const [attendance, setAttendance] =
    useState({})


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)


  // ======================================
  // MESSAGE
  // ======================================

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')


  // ======================================
  // VIEW MODAL
  // ======================================

  const [selectedFaculty, setSelectedFaculty] =
    useState(null)


  const [viewType, setViewType] =
    useState('daily')


  const [viewData, setViewData] =
    useState(null)


  const [viewLoading, setViewLoading] =
    useState(false)


  // ======================================
  // GET ADMIN TOKEN
  // ======================================

  const getToken = () => {

    return localStorage.getItem('token')

  }


  // ======================================
  // AUTH HEADERS
  // ======================================

  const getHeaders = () => {

    return {

      headers: {

        Authorization:
          `Bearer ${getToken()}`,

      },

    }

  }


  // ======================================
  // FETCH ATTENDANCE
  // ======================================

  const fetchAttendance =
    async () => {

      try {

        setLoading(true)

        setError('')

        setMessage('')


        const response =
          await axios.get(

            `${API_URL}/faculty-attendance`,

            {

              ...getHeaders(),

              params: {

                date:
                  selectedDate,

              },

            }

          )


        if (
          response.data.success
        ) {

          const facultyList =
            response.data.faculty || []


          setFaculty(
            facultyList
          )


          // ==============================
          // BUILD ATTENDANCE OBJECT
          // ==============================

          const attendanceData = {}


          facultyList.forEach(

            (member) => {

              attendanceData[
                member.facultyId
              ] =
                member.status || ''

            }

          )


          setAttendance(
            attendanceData
          )

        }

        else {

          setError(

            response.data.message ||
            'Unable to load faculty attendance.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Faculty Attendance Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load faculty attendance.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // LOAD WHEN DATE CHANGES
  // ======================================

  useEffect(() => {

    fetchAttendance()

  }, [selectedDate])


  // ======================================
  // MARK ATTENDANCE
  // ======================================

  const markAttendance =
    (
      facultyId,
      status
    ) => {

      setAttendance(

        (previous) => ({

          ...previous,

          [facultyId]:
            status,

        })

      )


      setMessage('')

      setError('')

    }


  // ======================================
  // SAVE ALL ATTENDANCE
  // ======================================

  const saveAttendance =
    async () => {

      try {

        setSaving(true)

        setError('')

        setMessage('')


        const records =
          faculty.map(

            (member) => ({

              facultyId:
                member.facultyId,

              status:
                attendance[
                  member.facultyId
                ],

            })

          )
          .filter(

            (item) =>

              item.status ===
                'Present' ||

              item.status ===
                'Absent'

          )


        if (
          records.length === 0
        ) {

          setError(

            'Please mark attendance for at least one faculty member.'

          )

          return

        }


        const response =
          await axios.post(

            `${API_URL}/faculty-attendance/bulk`,

            {

              date:
                selectedDate,

              attendance:
                records,

            },

            getHeaders()

          )


        if (
          response.data.success
        ) {

          setMessage(

            'Faculty attendance saved successfully.'

          )


          // Reload current date

          await fetchAttendance()

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

          'Save Faculty Attendance Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to save faculty attendance.'

        )

      }

      finally {

        setSaving(false)

      }

    }


  // ======================================
  // VIEW FACULTY ATTENDANCE
  // ======================================

  const openView =
    async (member) => {

      setSelectedFaculty(
        member
      )

      setViewType('daily')

      setViewData(null)

      await fetchViewData(

        member.facultyId,

        'daily'

      )

    }


  // ======================================
  // FETCH VIEW DATA
  // ======================================

  const fetchViewData =
    async (
      facultyId,
      type
    ) => {

      try {

        setViewLoading(true)

        setError('')


        let response


        // ==================================
        // DAILY
        // ==================================

        if (
          type === 'daily'
        ) {

          response =
            await axios.get(

              `${API_URL}/faculty-attendance/${facultyId}/daily`,

              getHeaders()

            )

        }


        // ==================================
        // MONTHLY
        // ==================================

        if (
          type === 'monthly'
        ) {

          const now =
            new Date()


          response =
            await axios.get(

              `${API_URL}/faculty-attendance/${facultyId}/monthly`,

              {

                ...getHeaders(),

                params: {

                  year:
                    now.getFullYear(),

                  month:
                    now.getMonth() + 1,

                },

              }

            )

        }


        // ==================================
        // YEARLY
        // ==================================

        if (
          type === 'yearly'
        ) {

          const now =
            new Date()


          response =
            await axios.get(

              `${API_URL}/faculty-attendance/${facultyId}/yearly`,

              {

                ...getHeaders(),

                params: {

                  year:
                    now.getFullYear(),

                },

              }

            )

        }


        if (
          response?.data?.success
        ) {

          setViewData(
            response.data
          )

        }

        else {

          setViewData(null)

          setError(

            response?.data?.message ||
            'Unable to load attendance records.'

          )

        }

      }

      catch (error) {

        console.log(

          'View Faculty Attendance Error:',

          error

        )


        setViewData(null)

        setError(

          error?.response?.data?.message ||

          'Unable to load attendance records.'

        )

      }

      finally {

        setViewLoading(false)

      }

    }


  // ======================================
  // CHANGE VIEW TYPE
  // ======================================

  const changeViewType =
    async (type) => {

      setViewType(type)

      setViewData(null)


      if (
        selectedFaculty
      ) {

        await fetchViewData(

          selectedFaculty.facultyId,

          type

        )

      }

    }


  // ======================================
  // CLOSE VIEW
  // ======================================

  const closeView =
    () => {

      setSelectedFaculty(null)

      setViewData(null)

      setViewType('daily')

    }


  // ======================================
  // FORMAT DATE
  // ======================================

  const formatDate =
    (date) => {

      if (!date) {

        return '-'

      }


      const parts =
        date.split('-')


      if (
        parts.length !== 3
      ) {

        return date

      }


      return `${parts[2]}-${parts[1]}-${parts[0]}`

    }


  // ======================================
  // STATUS BADGE
  // ======================================

  const getStatusBadge =
    (status) => {

      if (
        status === 'Present'
      ) {

        return 'badge bg-success'

      }


      if (
        status === 'Absent'
      ) {

        return 'badge bg-danger'

      }


      return 'badge bg-secondary'

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

          Loading faculty attendance...

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

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">

            Faculty Attendance

          </h2>


          <p className="text-muted mb-0">

            Mark and manage faculty attendance.

          </p>

        </div>


        <button

          type="button"

          className="btn btn-outline-secondary"

          onClick={fetchAttendance}

        >

          <i className="fas fa-sync-alt me-2" />

          Refresh

        </button>

      </div>


      {/* ==================================
          ALERTS
      ================================== */}

      {message && (

        <div className="alert alert-success">

          {message}

        </div>

      )}


      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {/* ==================================
          DATE + SAVE
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">

          <div className="row align-items-end g-3">


            <div className="col-md-4">

              <label className="form-label fw-semibold">

                Attendance Date

              </label>


              <input

                type="date"

                className="form-control"

                value={
                  selectedDate
                }

                onChange={(
                  event
                ) =>
                  setSelectedDate(
                    event.target.value
                  )
                }

              />

            </div>


            <div className="col-md-8 text-md-end">

              <small className="text-muted d-block mb-2">

                {

                  faculty.length

                }

                {' '}

                Active Faculty

              </small>


              <button

                type="button"

                className="btn btn-primary"

                onClick={
                  saveAttendance
                }

                disabled={
                  saving ||
                  faculty.length === 0
                }

              >

                {saving ? (

                  <>

                    <span
                      className="spinner-border spinner-border-sm me-2"
                    />

                    Saving...

                  </>

                ) : (

                  <>

                    <i className="fas fa-save me-2" />

                    Save Attendance

                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================
          FACULTY TABLE
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          {faculty.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: '48px',
                }}
              >

                👨‍🏫

              </div>


              <h5 className="fw-bold mt-3">

                No Active Faculty

              </h5>


              <p className="text-muted mb-0">

                There are no active faculty members.

              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Faculty
                    </th>

                    <th>
                      Designation
                    </th>

                    <th>
                      Subject
                    </th>

                    <th>
                      Attendance
                    </th>

                    <th>
                      View
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {faculty.map(

                    (member, index) => (

                      <tr
                        key={
                          member.facultyId
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
                              member.name
                            }

                          </div>


                          {member.employeeId && (

                            <small className="text-muted">

                              ID: {

                                member.employeeId

                              }

                            </small>

                          )}

                        </td>


                        <td>

                          {
                            member.designation
                          }

                        </td>


                        <td>

                          {
                            member.subject
                          }

                        </td>


                        <td>

                          <div className="d-flex gap-2 flex-wrap">


                            <button

                              type="button"

                              className={

                                attendance[
                                  member.facultyId
                                ] === 'Present'

                                  ? 'btn btn-success btn-sm'

                                  : 'btn btn-outline-success btn-sm'

                              }

                              onClick={() =>

                                markAttendance(

                                  member.facultyId,

                                  'Present'

                                )

                              }

                            >

                              <i className="fas fa-check me-1" />

                              Present

                            </button>


                            <button

                              type="button"

                              className={

                                attendance[
                                  member.facultyId
                                ] === 'Absent'

                                  ? 'btn btn-danger btn-sm'

                                  : 'btn btn-outline-danger btn-sm'

                              }

                              onClick={() =>

                                markAttendance(

                                  member.facultyId,

                                  'Absent'

                                )

                              }

                            >

                              <i className="fas fa-times me-1" />

                              Absent

                            </button>

                          </div>

                        </td>


                        <td>

                          <button

                            type="button"

                            className="btn btn-outline-primary btn-sm"

                            onClick={() =>
                              openView(member)
                            }

                          >

                            <i className="fas fa-eye me-1" />

                            View

                          </button>

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


      {/* ==================================
          VIEW MODAL
      ================================== */}

      {selectedFaculty && (

        <div

          className="modal d-block"

          tabIndex="-1"

          style={{

            backgroundColor:
              'rgba(0, 0, 0, 0.5)',

          }}

        >

          <div className="modal-dialog modal-lg modal-dialog-scrollable">

            <div className="modal-content">


              {/* HEADER */}

              <div className="modal-header">

                <div>

                  <h5 className="modal-title fw-bold">

                    {
                      selectedFaculty.name
                    }

                  </h5>


                  <small className="text-muted">

                    {
                      selectedFaculty.designation
                    }

                    {' • '}

                    {
                      selectedFaculty.subject
                    }

                  </small>

                </div>


                <button

                  type="button"

                  className="btn-close"

                  onClick={
                    closeView
                  }

                />

              </div>


              {/* BODY */}

              <div className="modal-body">


                {/* TABS */}

                <div className="btn-group w-100 mb-4">

                  <button

                    type="button"

                    className={

                      viewType === 'daily'

                        ? 'btn btn-primary'

                        : 'btn btn-outline-primary'

                    }

                    onClick={() =>
                      changeViewType(
                        'daily'
                      )
                    }

                  >

                    Daily

                  </button>


                  <button

                    type="button"

                    className={

                      viewType === 'monthly'

                        ? 'btn btn-primary'

                        : 'btn btn-outline-primary'

                    }

                    onClick={() =>
                      changeViewType(
                        'monthly'
                      )
                    }

                  >

                    Monthly

                  </button>


                  <button

                    type="button"

                    className={

                      viewType === 'yearly'

                        ? 'btn btn-primary'

                        : 'btn btn-outline-primary'

                    }

                    onClick={() =>
                      changeViewType(
                        'yearly'
                      )
                    }

                  >

                    Yearly

                  </button>

                </div>


                {/* VIEW LOADING */}

                {viewLoading ? (

                  <div className="text-center py-4">

                    <div
                      className="spinner-border"
                      role="status"
                    >

                      <span className="visually-hidden">

                        Loading...

                      </span>

                    </div>

                  </div>

                ) : (

                  <>

                    {/* ==================================
                        DAILY
                    ================================== */}

                    {viewType === 'daily' && (

                      <>

                        <h6 className="fw-bold mb-3">

                          Attendance Records

                        </h6>


                        {viewData?.records?.length === 0 ? (

                          <div className="alert alert-light border">

                            No attendance records found.

                          </div>

                        ) : (

                          <div className="table-responsive">

                            <table className="table table-bordered align-middle">

                              <thead className="table-light">

                                <tr>

                                  <th>
                                    #
                                  </th>

                                  <th>
                                    Date
                                  </th>

                                  <th>
                                    Status
                                  </th>

                                </tr>

                              </thead>


                              <tbody>

                                {viewData?.records?.map(

                                  (record, index) => (

                                    <tr
                                      key={
                                        record._id
                                      }
                                    >

                                      <td>

                                        {
                                          index + 1
                                        }

                                      </td>


                                      <td>

                                        {
                                          formatDate(
                                            record.date
                                          )
                                        }

                                      </td>


                                      <td>

                                        <span
                                          className={
                                            getStatusBadge(
                                              record.status
                                            )
                                          }
                                        >

                                          {
                                            record.status
                                          }

                                        </span>

                                      </td>

                                    </tr>

                                  )

                                )}

                              </tbody>

                            </table>

                          </div>

                        )}

                      </>

                    )}


                    {/* ==================================
                        MONTHLY
                    ================================== */}

                    {viewType === 'monthly' && (

                      <>

                        <div className="row g-3 mb-4">


                          <div className="col-md-3">

                            <div className="card border">

                              <div className="card-body">

                                <small className="text-muted">

                                  Present

                                </small>


                                <h4 className="fw-bold text-success mb-0 mt-2">

                                  {
                                    viewData?.summary?.present || 0
                                  }

                                </h4>

                              </div>

                            </div>

                          </div>


                          <div className="col-md-3">

                            <div className="card border">

                              <div className="card-body">

                                <small className="text-muted">

                                  Absent

                                </small>


                                <h4 className="fw-bold text-danger mb-0 mt-2">

                                  {
                                    viewData?.summary?.absent || 0
                                  }

                                </h4>

                              </div>

                            </div>

                          </div>


                          <div className="col-md-3">

                            <div className="card border">

                              <div className="card-body">

                                <small className="text-muted">

                                  Total

                                </small>


                                <h4 className="fw-bold mb-0 mt-2">

                                  {
                                    viewData?.summary?.total || 0
                                  }

                                </h4>

                              </div>

                            </div>

                          </div>


                          <div className="col-md-3">

                            <div className="card border">

                              <div className="card-body">

                                <small className="text-muted">

                                  Attendance

                                </small>


                                <h4 className="fw-bold mb-0 mt-2">

                                  {
                                    viewData?.summary?.percentage || 0
                                  }%

                                </h4>

                              </div>

                            </div>

                          </div>

                        </div>


                        <div className="table-responsive">

                          <table className="table table-bordered align-middle">

                            <thead className="table-light">

                              <tr>

                                <th>
                                  #
                                </th>

                                <th>
                                  Date
                                </th>

                                <th>
                                  Status
                                </th>

                              </tr>

                            </thead>


                            <tbody>

                              {viewData?.records?.map(

                                (record, index) => (

                                  <tr
                                    key={
                                      record._id
                                    }
                                  >

                                    <td>

                                      {
                                        index + 1
                                      }

                                    </td>


                                    <td>

                                      {
                                        formatDate(
                                          record.date
                                        )
                                      }

                                    </td>


                                    <td>

                                      <span
                                        className={
                                          getStatusBadge(
                                            record.status
                                          )
                                        }
                                      >

                                        {
                                          record.status
                                        }

                                      </span>

                                    </td>

                                  </tr>

                                )

                              )}

                            </tbody>

                          </table>

                        </div>

                      </>

                    )}


                    {/* ==================================
                        YEARLY
                    ================================== */}

                    {viewType === 'yearly' && (

                      <>

                        <div className="row g-3 mb-4">


                          <div className="col-md-3">

                            <div className="card border">

                              <div className="card-body">

                                <small className="text-muted">

                                  Present

                                </small>


                                <h4 className="fw-bold text-success mb-0 mt-2">

                                  {
                                    viewData?.summary?.present || 0
                                  }

                                </h4>

                              </div>

                            </div>

                          </div>


                          <div className="col-md-3">

                            <div className="card border">

                              <div className="card-body">

                                <small className="text-muted">

                                  Absent

                                </small>


                                <h4 className="fw-bold text-danger mb-0 mt-2">

                                  {
                                    viewData?.summary?.absent || 0
                                  }

                                </h4>

                              </div>

                            </div>

                          </div>


                          <div className="col-md-3">

                            <div className="card border">

                              <div className="card-body">

                                <small className="text-muted">

                                  Total

                                </small>


                                <h4 className="fw-bold mb-0 mt-2">

                                  {
                                    viewData?.summary?.total || 0
                                  }

                                </h4>

                              </div>

                            </div>

                          </div>


                          <div className="col-md-3">

                            <div className="card border">

                              <div className="card-body">

                                <small className="text-muted">

                                  Attendance

                                </small>


                                <h4 className="fw-bold mb-0 mt-2">

                                  {
                                    viewData?.summary?.percentage || 0
                                  }%

                                </h4>

                              </div>

                            </div>

                          </div>

                        </div>


                        <div className="table-responsive">

                          <table className="table table-bordered align-middle">

                            <thead className="table-light">

                              <tr>

                                <th>
                                  #
                                </th>

                                <th>
                                  Date
                                </th>

                                <th>
                                  Status
                                </th>

                              </tr>

                            </thead>


                            <tbody>

                              {viewData?.records?.map(

                                (record, index) => (

                                  <tr
                                    key={
                                      record._id
                                    }
                                  >

                                    <td>

                                      {
                                        index + 1
                                      }

                                    </td>


                                    <td>

                                      {
                                        formatDate(
                                          record.date
                                        )
                                      }

                                    </td>


                                    <td>

                                      <span
                                        className={
                                          getStatusBadge(
                                            record.status
                                          )
                                        }
                                      >

                                        {
                                          record.status
                                        }

                                      </span>

                                    </td>

                                  </tr>

                                )

                              )}

                            </tbody>

                          </table>

                        </div>

                      </>

                    )}

                  </>

                )}

              </div>


              {/* FOOTER */}

              <div className="modal-footer">

                <button

                  type="button"

                  className="btn btn-secondary"

                  onClick={
                    closeView
                  }

                >

                  Close

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}


export default FacultyAttendance