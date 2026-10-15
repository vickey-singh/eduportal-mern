import { useEffect, useState } from 'react'



import { useNavigate, useParams } from 'react-router-dom'



import {

  getStudentAttendance,

  getMonthlyAttendance,

  getYearlyAttendance,

} from '../../services/attendanceService'





function StudentAttendance() {



  // ======================================

  // PARAMS

  // ======================================



  const {

    studentId,

  } = useParams()





  const navigate =

    useNavigate()





  // ======================================

  // STUDENT DATA

  // ======================================



  const [student, setStudent] =

    useState(null)





  // ======================================

  // OVERALL SUMMARY

  // ======================================



  const [summary, setSummary] =

    useState({



      total: 0,



      present: 0,



      absent: 0,



      percentage: 0,



    })





  // ======================================

  // DAILY ATTENDANCE

  // ======================================



  const [dailyAttendance, setDailyAttendance] =

    useState([])





  // ======================================

  // WEEKLY DATA

  // ======================================



  const [weeklySummary, setWeeklySummary] =

    useState(null)





  const [weeklyAttendance, setWeeklyAttendance] =

    useState([])





  const [selectedWeekStart, setSelectedWeekStart] =

    useState('')





  // ======================================

  // MONTHLY DATA

  // ======================================



  const [monthlySummary, setMonthlySummary] =

    useState(null)





  const [monthlyAttendance, setMonthlyAttendance] =

    useState([])





  // ======================================

  // YEARLY DATA

  // ======================================



  const [yearlySummary, setYearlySummary] =

    useState(null)





  const [yearlyAttendance, setYearlyAttendance] =

    useState([])





  // ======================================

  // ACTIVE TAB

  // ======================================



  const [activeTab, setActiveTab] =

    useState('daily')





  // ======================================

  // MONTH / YEAR

  // ======================================



  const currentDate =

    new Date()





  const [selectedMonth, setSelectedMonth] =

    useState(

      currentDate.getMonth() + 1

    )





  const [selectedYear, setSelectedYear] =

    useState(

      currentDate.getFullYear()

    )





  // ======================================

  // LOADING

  // ======================================



  const [loading, setLoading] =

    useState(true)





  // ======================================

  // LOAD STUDENT ATTENDANCE

  // ======================================



  useEffect(() => {



    if (studentId) {



      loadAttendance()



    }



  }, [studentId])





  const loadAttendance = async () => {



    try {



      setLoading(true)





      const response =

        await getStudentAttendance(

          studentId

        )





      setStudent(

        response.student

      )





      setSummary(

        response.summary || {



          total: 0,



          present: 0,



          absent: 0,



          percentage: 0,



        }

      )





      setDailyAttendance(

        response.attendance || []

      )



    }



    catch (error) {



      console.log(

        'Student Attendance Error:',

        error

      )





      alert(



        error.response?.data?.message ||



        'Unable to load attendance'



      )



    }



    finally {



      setLoading(false)



    }



  }





  // ======================================

  // LOAD MONTHLY ATTENDANCE

  // ======================================



  const loadMonthlyAttendance =

    async () => {



      try {



        const response =

          await getMonthlyAttendance(



            studentId,



            selectedYear,



            selectedMonth



          )





        setMonthlySummary(

          response.summary || null

        )





        setMonthlyAttendance(

          response.attendance || []

        )



      }



      catch (error) {



        console.log(

          'Monthly Attendance Error:',

          error

        )





        alert(



          error.response?.data?.message ||



          'Unable to load monthly attendance'



        )



      }



    }





  // ======================================

  // LOAD YEARLY ATTENDANCE

  // ======================================



  const loadYearlyAttendance =

    async () => {



      try {



        const response =

          await getYearlyAttendance(



            studentId,



            selectedYear



          )





        setYearlySummary(

          response.summary || null

        )





        setYearlyAttendance(

          response.attendance || []

        )





        setMonthlySummary(

          response.monthlySummary || {}

        )



      }



      catch (error) {



        console.log(

          'Yearly Attendance Error:',

          error

        )





        alert(



          error.response?.data?.message ||



          'Unable to load yearly attendance'



        )



      }



    }





  // ======================================

  // GET WEEK START DATE

  // MONDAY

  // ======================================



  const getWeekStart = (

    date

  ) => {



    const d =

      new Date(date)





    const day =

      d.getDay()





    const diff =

      day === 0

        ? -6

        : 1 - day





    d.setDate(

      d.getDate() + diff

    )





    return d



  }





  // ======================================

  // FORMAT DATE FOR INPUT

  // ======================================



  const getInputDate = (

    date

  ) => {



    const d =

      new Date(date)





    const year =

      d.getFullYear()





    const month =

      String(

        d.getMonth() + 1

      ).padStart(

        2,

        '0'

      )





    const day =

      String(

        d.getDate()

      ).padStart(

        2,

        '0'

      )





    return `${year}-${month}-${day}`



  }





  // ======================================

  // LOAD WEEKLY ATTENDANCE

  // ======================================



  const loadWeeklyAttendance =

    (weekStart) => {



      if (!weekStart) {



        setWeeklyAttendance([])



        setWeeklySummary(null)



        return



      }





      const start =

        new Date(

          `${weekStart}T00:00:00`

        )





      const end =

        new Date(start)





      end.setDate(

        end.getDate() + 6

      )





      const records =

        dailyAttendance.filter(

          (record) => {



            if (!record.date) {



              return false



            }





            const recordDate =

              new Date(

                `${record.date}T00:00:00`

              )





            return (

              recordDate >= start &&

              recordDate <= end

            )



          }

        )





      const total =

        records.length





      const present =

        records.filter((record) => record.status === 'Present' || record.status === 'Late').length





      const absent =

        records.filter(

          (record) =>

            record.status ===

            'Absent'

        ).length





      const percentage =

        total > 0



          ? Number(

              (

                (

                  present /

                  total

                ) * 100

              ).toFixed(2)

            )



          : 0





      setWeeklyAttendance(

        records

      )





      setWeeklySummary({



        total,



        present,



        absent,



        percentage,



      })



    }





  // ======================================

  // TAB CHANGE

  // ======================================



  const handleTabChange =

    async (tab) => {



      setActiveTab(

        tab

      )





      if (

        tab === 'weekly'

      ) {



        const today =

          new Date()





        const weekStart =

          getWeekStart(

            today

          )





        const weekStartString =

          getInputDate(

            weekStart

          )





        setSelectedWeekStart(

          weekStartString

        )





        loadWeeklyAttendance(

          weekStartString

        )



      }





      if (

        tab === 'monthly'

      ) {



        await loadMonthlyAttendance()



      }





      if (

        tab === 'yearly'

      ) {



        await loadYearlyAttendance()



      }



    }





  // ======================================

  // WEEK CHANGE

  // ======================================



  const handleWeekChange =

    (e) => {



      const selectedDate =

        e.target.value





      if (!selectedDate) {



        setSelectedWeekStart('')



        setWeeklyAttendance([])



        setWeeklySummary(null)



        return



      }





      const weekStart =

        getWeekStart(

          `${selectedDate}T00:00:00`

        )





      const weekStartString =

        getInputDate(

          weekStart

        )





      setSelectedWeekStart(

        weekStartString

      )





      loadWeeklyAttendance(

        weekStartString

      )



    }





  // ======================================

  // DATE FORMAT

  // ======================================



  const formatDate = (

    date

  ) => {



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

  // MONTH NAME

  // ======================================



  const getMonthName =

    (month) => {



      return new Date(

        2000,

        month - 1,

        1

      ).toLocaleString(

        'en-IN',

        {

          month: 'long',

        }

      )



    }





  // ======================================

  // MONTH CHANGE

  // ======================================



  const handleMonthChange =

    async (e) => {



      const month =

        Number(

          e.target.value

        )





      setSelectedMonth(

        month

      )





      try {



        const response =

          await getMonthlyAttendance(



            studentId,



            selectedYear,



            month



          )





        setMonthlySummary(

          response.summary || null

        )





        setMonthlyAttendance(

          response.attendance || []

        )



      }



      catch (error) {



        console.log(

          error

        )



      }



    }





  // ======================================

  // YEAR CHANGE

  // ======================================



  const handleYearChange =

    async (e) => {



      const year =

        Number(

          e.target.value

        )





      setSelectedYear(

        year

      )





      try {



        if (

          activeTab === 'monthly'

        ) {



          const response =

            await getMonthlyAttendance(



              studentId,



              year,



              selectedMonth



            )





          setMonthlySummary(

            response.summary || null

          )





          setMonthlyAttendance(

            response.attendance || []

          )



        }





        if (

          activeTab === 'yearly'

        ) {



          const response =

            await getYearlyAttendance(



              studentId,



              year



            )





          setYearlySummary(

            response.summary || null

          )





          setYearlyAttendance(

            response.attendance || []

          )





          setMonthlySummary(

            response.monthlySummary || {}

          )



        }



      }



      catch (error) {



        console.log(

          error

        )



      }



    }





  // ======================================

  // GENERATE PDF

  // ======================================



  const generateAttendancePDF = () => {
    // The print stylesheet shows only the clean report section.
    // Choose "Save as PDF" in the browser print dialog.
    window.print()
  }





  // ======================================

  // WEEK RANGE

  // ======================================



  const getWeekEnd = () => {



    if (!selectedWeekStart) {



      return ''



    }





    const end =

      new Date(

        `${selectedWeekStart}T00:00:00`

      )





    end.setDate(

      end.getDate() + 6

    )





    return getInputDate(

      end

    )



  }





  // ======================================

  // LOADING

  // ======================================




  // ======================================
  // PRINT REPORT DATA
  // ======================================

  const reportTitle = {
    daily: 'Daily Attendance Report',
    weekly: 'Weekly Attendance Report',
    monthly: 'Monthly Attendance Report',
    yearly: 'Yearly Attendance Report',
  }[activeTab] || 'Student Attendance Report'

  const reportRecords = {
    daily: dailyAttendance,
    weekly: weeklyAttendance,
    monthly: monthlyAttendance,
    yearly: yearlyAttendance,
  }[activeTab] || []

  const reportSummary = {
    daily: summary,
    weekly: weeklySummary,
    monthly: monthlySummary,
    yearly: yearlySummary,
  }[activeTab] || {}

  const reportPeriod = (() => {
    if (activeTab === 'weekly') {
      return selectedWeekStart
        ? `${formatDate(selectedWeekStart)} to ${formatDate(getWeekEnd())}`
        : 'Week not selected'
    }
    if (activeTab === 'monthly') {
      return `${getMonthName(Number(selectedMonth))} ${selectedYear}`
    }
    if (activeTab === 'yearly') {
      return String(selectedYear)
    }
    return 'All available attendance records'
  })()

  const reportGeneratedOn = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  if (loading) {



    return (



      <div className="applications-section">



        <div className="text-center p-5">



          Loading Attendance...



        </div>



      </div>



    )



  }





  // ======================================

  // STUDENT NOT FOUND

  // ======================================



  if (!student) {



    return (



      <div className="applications-section">



        <div className="alert alert-danger">



          Student attendance not found.



        </div>





        <button

          type="button"

          className="btn btn-secondary"

          onClick={() =>

            navigate(

              '/admin/attendance'

            )

          }

        >



          Back to Attendance



        </button>



      </div>



    )



  }





  return (



    <div className="applications-section">

      <style>{`
        .attendance-print-report { display: none; color: #172033; font-family: Arial, Helvetica, sans-serif; }
        @page { size: A4 portrait; margin: 14mm; }
        @media print {
          html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body * { visibility: hidden !important; }
          .attendance-print-report, .attendance-print-report * { visibility: visible !important; }
          .attendance-print-report { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 0 !important; margin: 0 !important; background: #fff !important; color: #172033 !important; font-size: 10pt !important; }
          .print-institute { text-align: center; font-size: 19pt; font-weight: 800; letter-spacing: .4px; margin: 0 0 4px; color: #102a56 !important; }
          .print-subtitle, .print-period { text-align: center; color: #526176 !important; }
          .print-subtitle { font-size: 9pt; margin: 0 0 12px; }
          .print-rule { height: 3px; border: 0; background: #1d4ed8 !important; margin: 0 0 14px; }
          .print-report-title { text-align: center; font-size: 14pt; font-weight: 700; margin: 0 0 4px; }
          .print-period { margin: 0 0 16px; }
          .print-student-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; border: 1px solid #d7deea; border-radius: 5px; padding: 12px; margin-bottom: 14px; page-break-inside: avoid; }
          .print-label { display: block; font-size: 8pt; color: #64748b !important; margin-bottom: 3px; text-transform: uppercase; letter-spacing: .3px; }
          .print-value { font-size: 10pt; font-weight: 700; overflow-wrap: anywhere; }
          .print-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; page-break-inside: avoid; }
          .print-summary-card { border: 1px solid #d7deea; border-top: 3px solid #1d4ed8; padding: 9px 7px; text-align: center; border-radius: 4px; }
          .print-summary-label { display: block; font-size: 8pt; color: #64748b !important; margin-bottom: 4px; }
          .print-summary-value { display: block; font-size: 14pt; font-weight: 800; color: #102a56 !important; }
          .print-section-title { font-size: 11pt; font-weight: 700; margin: 14px 0 7px; color: #102a56 !important; }
          .attendance-print-report table { width: 100%; border-collapse: collapse; font-size: 9pt; }
          .attendance-print-report thead { display: table-header-group; }
          .attendance-print-report tr { page-break-inside: avoid; }
          .attendance-print-report th { background: #eaf0fb !important; color: #102a56 !important; font-weight: 700; text-align: left; border: 1px solid #cbd5e1; padding: 8px 7px; }
          .attendance-print-report td { border: 1px solid #dbe2ec; padding: 7px; vertical-align: top; }
          .attendance-print-report tbody tr:nth-child(even) { background: #f8fafc !important; }
          .print-status { font-weight: 700; }
          .print-status-present { color: #166534 !important; }
          .print-status-absent { color: #b91c1c !important; }
          .print-status-late { color: #854d0e !important; background: #fef3c7 !important; }
          .print-empty { text-align: center; padding: 18px; color: #64748b !important; }
          .print-footer { margin-top: 24px; display: flex; justify-content: space-between; gap: 20px; font-size: 8pt; color: #64748b !important; page-break-inside: avoid; }
          .print-signature { margin-top: 30px; width: 180px; border-top: 1px solid #64748b; padding-top: 6px; text-align: center; color: #475569 !important; }
        }
      `}</style>

      <section className="attendance-print-report" aria-hidden="true">
        <header>
          <h1 className="print-institute">PRERNA INSTITUTE OF EXCELLENCE</h1>
          <p className="print-subtitle">Student Academic Records</p>
          <hr className="print-rule" />
          <h2 className="print-report-title">{reportTitle}</h2>
          <p className="print-period">Report Period: {reportPeriod}</p>
        </header>
        <section className="print-student-grid">
          <div><span className="print-label">Student Name</span><span className="print-value">{student.name || '-'}</span></div>
          <div><span className="print-label">Admission Number</span><span className="print-value">{student.admissionNumber || '-'}</span></div>
          <div><span className="print-label">Roll Number</span><span className="print-value">{student.rollNumber || '-'}</span></div>
          <div><span className="print-label">Course / Class</span><span className="print-value">{student.course || '-'}</span></div>
          <div><span className="print-label">Batch Time</span><span className="print-value">{student.batchTime || '-'}</span></div>
          <div><span className="print-label">Report Generated</span><span className="print-value">{reportGeneratedOn}</span></div>
        </section>
        <section className="print-summary">
          <div className="print-summary-card"><span className="print-summary-label">Total Classes</span><span className="print-summary-value">{Number(reportSummary?.total || 0)}</span></div>
          <div className="print-summary-card"><span className="print-summary-label">Present</span><span className="print-summary-value">{Number(reportSummary?.present || 0)}</span></div>
          <div className="print-summary-card"><span className="print-summary-label">Absent</span><span className="print-summary-value">{Number(reportSummary?.absent || 0)}</span></div>
          <div className="print-summary-card"><span className="print-summary-label">Attendance</span><span className="print-summary-value">{Number(reportSummary?.percentage || 0)}%</span></div>
        </section>
        {activeTab === 'yearly' && Object.keys(monthlySummary || {}).length > 0 && (
          <>
            <h3 className="print-section-title">Month-wise Attendance</h3>
            <table>
              <thead><tr><th>Month</th><th>Total Classes</th><th>Present</th><th>Absent</th><th>Attendance</th></tr></thead>
              <tbody>{Object.entries(monthlySummary).map(([month, data]) => (
                <tr key={month}><td>{getMonthName(Number(month.substring(5, 7)))} {month.substring(0, 4)}</td><td>{data.total ?? 0}</td><td>{data.present ?? 0}</td><td>{data.absent ?? 0}</td><td>{data.percentage ?? 0}%</td></tr>
              ))}</tbody>
            </table>
          </>
        )}
        <h3 className="print-section-title">Attendance Records</h3>
        <table>
          <thead><tr><th style={{ width: '7%' }}>S. No.</th><th style={{ width: '22%' }}>Date</th><th>Course / Class</th><th>Batch Time</th><th style={{ width: '18%' }}>Status</th></tr></thead>
          <tbody>
            {reportRecords.length === 0 ? (
              <tr><td className="print-empty" colSpan="5">No attendance records found for this report period.</td></tr>
            ) : reportRecords.map((record, index) => (
              <tr key={record._id || `${record.date}-${index}`}>
                <td>{index + 1}</td><td>{formatDate(record.date)}</td><td>{record.course || student.course || '-'}</td><td>{record.batchTime || student.batchTime || '-'}</td>
                <td>
                  <span className={`print-status ${record.status === 'Absent' ? 'print-status-absent' : 'print-status-present'}`}>
                    {record.status === 'Late' ? 'Present' : (record.status || '-')}
                  </span>
                  {(record.isLate === true || record.status === 'Late') && (
                    <span className="print-status print-status-late"> + Late</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer className="print-footer">
          <div><div>Generated on {reportGeneratedOn}</div><div>This is a computer-generated attendance report.</div></div>
          <div className="print-signature">Authorized Signature</div>
        </footer>
      </section>






      {/* ==================================

          HEADER

      ================================== */}



      <div className="applications-header">



        <h2>



          Student Attendance



        </h2>



        <p>



          View daily, weekly, monthly

          and yearly attendance.



        </p>



      </div>





      {/* ==================================

          STUDENT INFORMATION

      ================================== */}



      <div className="card p-4 mb-4">



        <div className="row">





          <div className="col-md-3 mb-3">



            <small className="text-muted">



              Student Name



            </small>



            <h5 className="mb-0">



              {

                student.name

              }



            </h5>



          </div>





          <div className="col-md-3 mb-3">



            <small className="text-muted">



              Admission Number



            </small>



            <h5 className="mb-0">



              {

                student.admissionNumber

              }



            </h5>



          </div>





          <div className="col-md-3 mb-3">



            <small className="text-muted">



              Roll Number



            </small>



            <h5 className="mb-0">



              {

                student.rollNumber ||

                '-'

              }



            </h5>



          </div>





          <div className="col-md-3 mb-3">



            <small className="text-muted">



              Course



            </small>



            <h5 className="mb-0">



              {

                student.course

              }



            </h5>



          </div>





          <div className="col-md-3 mb-3">



            <small className="text-muted">



              Batch Time



            </small>



            <h5 className="mb-0">



              {

                student.batchTime ||

                '-'

              }



            </h5>



          </div>





        </div>





        <button

          type="button"

          className="btn btn-secondary btn-sm"

          onClick={() =>

            navigate(

              '/admin/attendance'

            )

          }

        >



          ← Back to Attendance



        </button>



      </div>





      {/* ==================================

          OVERALL SUMMARY

      ================================== */}



      <div className="row mb-4">





        <div className="col-md-3 mb-3">



          <div className="card p-3 text-center">



            <small className="text-muted">



              Total Classes



            </small>



            <h3>



              {

                summary.total

              }



            </h3>



          </div>



        </div>





        <div className="col-md-3 mb-3">



          <div className="card p-3 text-center">



            <small className="text-muted">



              Present



            </small>



            <h3>



              {

                summary.present

              }



            </h3>



          </div>



        </div>





        <div className="col-md-3 mb-3">



          <div className="card p-3 text-center">



            <small className="text-muted">



              Absent



            </small>



            <h3>



              {

                summary.absent

              }



            </h3>



          </div>



        </div>





        <div className="col-md-3 mb-3">



          <div className="card p-3 text-center">



            <small className="text-muted">



              Attendance



            </small>



            <h3>



              {

                summary.percentage

              }%



            </h3>



          </div>



        </div>





      </div>





      {/* ==================================

          TABS

      ================================== */}



      <div className="mb-4">



        <button

          type="button"

          className={

            activeTab === 'daily'

              ? 'btn btn-primary me-2'

              : 'btn btn-outline-primary me-2'

          }

          onClick={() =>

            handleTabChange(

              'daily'

            )

          }

        >



          Daily



        </button>





        <button

          type="button"

          className={

            activeTab === 'weekly'

              ? 'btn btn-primary me-2'

              : 'btn btn-outline-primary me-2'

          }

          onClick={() =>

            handleTabChange(

              'weekly'

            )

          }

        >



          Weekly



        </button>





        <button

          type="button"

          className={

            activeTab === 'monthly'

              ? 'btn btn-primary me-2'

              : 'btn btn-outline-primary me-2'

          }

          onClick={() =>

            handleTabChange(

              'monthly'

            )

          }

        >



          Monthly



        </button>





        <button

          type="button"

          className={

            activeTab === 'yearly'

              ? 'btn btn-primary me-2'

              : 'btn btn-outline-primary me-2'

          }

          onClick={() =>

            handleTabChange(

              'yearly'

            )

          }

        >



          Yearly



        </button>





        <button

          type="button"

          className="btn btn-success"

          onClick={

            generateAttendancePDF

          }

        >



          📄 PDF



        </button>



      </div>





      {/* ==================================

          DAILY

      ================================== */}



      {activeTab === 'daily' && (



        <div className="card p-4">



          <div className="d-flex justify-content-between align-items-center mb-3">



            <h5 className="mb-0">



              Daily Attendance



            </h5>





            <button

              type="button"

              className="btn btn-success btn-sm"

              onClick={

                generateAttendancePDF

              }

            >



              📄 Generate PDF



            </button>



          </div>





          {dailyAttendance.length === 0 ? (



            <div className="alert alert-info">



              No attendance records found.



            </div>



          ) : (



            <div className="table-responsive">



              <table className="table applications-table">



                <thead>



                  <tr>



                    <th>

                      Date

                    </th>



                    <th>

                      Course

                    </th>



                    <th>

                      Batch Time

                    </th>



                    <th>

                      Status

                    </th>



                  </tr>



                </thead>





                <tbody>



                  {dailyAttendance.map(

                    (record) => (



                      <tr

                        key={

                          record._id

                        }

                      >



                        <td>



                          {

                            formatDate(

                              record.date

                            )

                          }



                        </td>



                        <td>



                          {

                            record.course

                          }



                        </td>



                        <td>



                          {

                            record.batchTime ||

                            '-'

                          }



                        </td>



                        <td>



                          <span className={record.status === 'Absent' ? 'badge bg-danger' : 'badge bg-success'}>
                            {record.status === 'Late' ? 'Present' : record.status}
                          </span>
                          {(record.isLate === true || record.status === 'Late') && (
                            <span className="badge bg-warning text-dark ms-1">Late</span>
                          )}



                        </td>



                      </tr>



                    )

                  )}



                </tbody>



              </table>



            </div>



          )}



        </div>



      )}





      {/* ==================================

          WEEKLY

      ================================== */}



      {activeTab === 'weekly' && (



        <div className="card p-4">



          <div className="d-flex justify-content-between align-items-center mb-4">



            <h5 className="mb-0">



              Weekly Attendance



            </h5>





            <button

              type="button"

              className="btn btn-success btn-sm"

              onClick={

                generateAttendancePDF

              }

            >



              📄 Generate PDF



            </button>



          </div>





          {/* WEEK SELECTOR */}



          <div className="row mb-4">



            <div className="col-md-4">



              <label className="form-label">



                Week Starting



              </label>





              <input

                type="date"

                className="form-control"

                value={

                  selectedWeekStart

                }

                onChange={

                  handleWeekChange

                }

              />





              {selectedWeekStart && (



                <small className="text-muted">



                  Week:



                  {' '}



                  {

                    formatDate(

                      selectedWeekStart

                    )

                  }



                  {' '}to{' '}



                  {

                    formatDate(

                      getWeekEnd()

                    )

                  }



                </small>



              )}



            </div>



          </div>





          {/* WEEK SUMMARY */}



          {weeklySummary && (



            <div className="row mb-4">





              <div className="col-md-3 mb-3">



                <div className="card p-3 text-center">



                  <small className="text-muted">



                    Total Classes



                  </small>



                  <h4>



                    {

                      weeklySummary.total

                    }



                  </h4>



                </div>



              </div>





              <div className="col-md-3 mb-3">



                <div className="card p-3 text-center">



                  <small className="text-muted">



                    Present



                  </small>



                  <h4>



                    {

                      weeklySummary.present

                    }



                  </h4>



                </div>



              </div>





              <div className="col-md-3 mb-3">



                <div className="card p-3 text-center">



                  <small className="text-muted">



                    Absent



                  </small>



                  <h4>



                    {

                      weeklySummary.absent

                    }



                  </h4>



                </div>



              </div>





              <div className="col-md-3 mb-3">



                <div className="card p-3 text-center">



                  <small className="text-muted">



                    Attendance



                  </small>



                  <h4>



                    {

                      weeklySummary.percentage

                    }%



                  </h4>



                </div>



              </div>





            </div>



          )}





          {/* WEEKLY RECORDS */}



          {weeklyAttendance.length === 0 ? (



            <div className="alert alert-info">



              No attendance records found

              for this week.



            </div>



          ) : (



            <div className="table-responsive">



              <table className="table applications-table">



                <thead>



                  <tr>



                    <th>

                      Date

                    </th>



                    <th>

                      Course

                    </th>



                    <th>

                      Batch Time

                    </th>



                    <th>

                      Status

                    </th>



                  </tr>



                </thead>





                <tbody>



                  {weeklyAttendance.map(

                    (record) => (



                      <tr

                        key={

                          record._id

                        }

                      >



                        <td>



                          {

                            formatDate(

                              record.date

                            )

                          }



                        </td>



                        <td>



                          {

                            record.course

                          }



                        </td>



                        <td>



                          {

                            record.batchTime ||

                            '-'

                          }



                        </td>



                        <td>



                          <span className={record.status === 'Absent' ? 'badge bg-danger' : 'badge bg-success'}>
                            {record.status === 'Late' ? 'Present' : record.status}
                          </span>
                          {(record.isLate === true || record.status === 'Late') && (
                            <span className="badge bg-warning text-dark ms-1">Late</span>
                          )}



                        </td>



                      </tr>



                    )

                  )}



                </tbody>



              </table>



            </div>



          )}



        </div>



      )}





      {/* ==================================

          MONTHLY

      ================================== */}



      {activeTab === 'monthly' && (



        <div className="card p-4">





          <div className="d-flex justify-content-between align-items-center mb-4">



            <h5 className="mb-0">



              Monthly Attendance



            </h5>





            <button

              type="button"

              className="btn btn-success btn-sm"

              onClick={

                generateAttendancePDF

              }

            >



              📄 Generate PDF



            </button>



          </div>





          <div className="row mb-4">





            {/* MONTH */}



            <div className="col-md-4">



              <label className="form-label">



                Month



              </label>



              <select

                className="form-control"

                value={

                  selectedMonth

                }

                onChange={

                  handleMonthChange

                }

              >



                {Array.from(

                  {

                    length: 12,

                  },

                  (_, index) => (



                    <option

                      key={

                        index + 1

                      }

                      value={

                        index + 1

                      }

                    >



                      {

                        getMonthName(

                          index + 1

                        )

                      }



                    </option>



                  )

                )}



              </select>



            </div>





            {/* YEAR */}



            <div className="col-md-4">



              <label className="form-label">



                Year



              </label>



              <select

                className="form-control"

                value={

                  selectedYear

                }

                onChange={

                  handleYearChange

                }

              >



                {Array.from(

                  {

                    length: 6,

                  },

                  (_, index) => {



                    const year =

                      currentDate.getFullYear() -

                      2 +

                      index





                    return (



                      <option

                        key={

                          year

                        }

                        value={

                          year

                        }

                      >



                        {

                          year

                        }



                      </option>



                    )



                  }

                )}



              </select>



            </div>





          </div>





          {/* MONTH SUMMARY */}



          {monthlySummary && (



            <div className="row mb-4">





              <div className="col-md-3">



                <div className="card p-3 text-center">



                  <small>



                    Total



                  </small>



                  <h4>



                    {

                      monthlySummary.total

                    }



                  </h4>



                </div>



              </div>





              <div className="col-md-3">



                <div className="card p-3 text-center">



                  <small>



                    Present



                  </small>



                  <h4>



                    {

                      monthlySummary.present

                    }



                  </h4>



                </div>



              </div>





              <div className="col-md-3">



                <div className="card p-3 text-center">



                  <small>



                    Absent



                  </small>



                  <h4>



                    {

                      monthlySummary.absent

                    }



                  </h4>



                </div>



              </div>





              <div className="col-md-3">



                <div className="card p-3 text-center">



                  <small>



                    Attendance



                  </small>



                  <h4>



                    {

                      monthlySummary.percentage

                    }%



                  </h4>



                </div>



              </div>





            </div>



          )}





          {/* MONTHLY RECORDS */}



          {monthlyAttendance.length === 0 ? (



            <div className="alert alert-info">



              No attendance records found

              for this month.



            </div>



          ) : (



            <div className="table-responsive">



              <table className="table applications-table">



                <thead>



                  <tr>



                    <th>

                      Date

                    </th>



                    <th>

                      Status

                    </th>



                  </tr>



                </thead>





                <tbody>



                  {monthlyAttendance.map(

                    (record) => (



                      <tr

                        key={

                          record._id

                        }

                      >



                        <td>



                          {

                            formatDate(

                              record.date

                            )

                          }



                        </td>



                        <td>



                          <span className={record.status === 'Absent' ? 'badge bg-danger' : 'badge bg-success'}>
                            {record.status === 'Late' ? 'Present' : record.status}
                          </span>
                          {(record.isLate === true || record.status === 'Late') && (
                            <span className="badge bg-warning text-dark ms-1">Late</span>
                          )}



                        </td>



                      </tr>



                    )

                  )}



                </tbody>



              </table>



            </div>



          )}



        </div>



      )}





      {/* ==================================

          YEARLY

      ================================== */}



      {activeTab === 'yearly' && (



        <div className="card p-4">





          <div className="d-flex justify-content-between align-items-center mb-4">



            <h5 className="mb-0">



              Yearly Attendance



            </h5>





            <button

              type="button"

              className="btn btn-success btn-sm"

              onClick={

                generateAttendancePDF

              }

            >



              📄 Generate PDF



            </button>



          </div>





          {/* YEAR */}



          <div className="row mb-4">



            <div className="col-md-4">



              <label className="form-label">



                Year



              </label>



              <select

                className="form-control"

                value={

                  selectedYear

                }

                onChange={

                  handleYearChange

                }

              >



                {Array.from(

                  {

                    length: 6,

                  },

                  (_, index) => {



                    const year =

                      currentDate.getFullYear() -

                      2 +

                      index





                    return (



                      <option

                        key={

                          year

                        }

                        value={

                          year

                        }

                      >



                        {

                          year

                        }



                      </option>



                    )



                  }

                )}



              </select>



            </div>



          </div>





          {/* YEAR SUMMARY */}



          {yearlySummary && (



            <div className="row mb-4">





              <div className="col-md-3">



                <div className="card p-3 text-center">



                  <small>



                    Total



                  </small>



                  <h4>



                    {

                      yearlySummary.total

                    }



                  </h4>



                </div>



              </div>





              <div className="col-md-3">



                <div className="card p-3 text-center">



                  <small>



                    Present



                  </small>



                  <h4>



                    {

                      yearlySummary.present

                    }



                  </h4>



                </div>



              </div>





              <div className="col-md-3">



                <div className="card p-3 text-center">



                  <small>



                    Absent



                  </small>



                  <h4>



                    {

                      yearlySummary.absent

                    }



                  </h4>



                </div>



              </div>





              <div className="col-md-3">



                <div className="card p-3 text-center">



                  <small>



                    Attendance



                  </small>



                  <h4>



                    {

                      yearlySummary.percentage

                    }%



                  </h4>



                </div>



              </div>





            </div>



          )}





          {/* MONTH-WISE SUMMARY */}



          {monthlySummary &&



            Object.keys(

              monthlySummary

            ).length > 0 && (



              <>



                <h5 className="mb-3">



                  Month-wise Attendance



                </h5>





                <div className="table-responsive">



                  <table className="table applications-table">



                    <thead>



                      <tr>



                        <th>

                          Month

                        </th>



                        <th>

                          Total

                        </th>



                        <th>

                          Present

                        </th>



                        <th>

                          Absent

                        </th>



                        <th>

                          Attendance

                        </th>



                      </tr>



                    </thead>





                    <tbody>



                      {Object.entries(

                        monthlySummary

                      ).map(

                        ([

                          month,

                          data,

                        ]) => (



                          <tr

                            key={

                              month

                            }

                          >



                            <td>



                              {

                                getMonthName(

                                  Number(

                                    month.substring(

                                      5,

                                      7

                                    )

                                  )

                                )

                              }



                              {' '}



                              {

                                month.substring(

                                  0,

                                  4

                                )

                              }



                            </td>



                            <td>



                              {

                                data.total

                              }



                            </td>



                            <td>



                              {

                                data.present

                              }



                            </td>



                            <td>



                              {

                                data.absent

                              }



                            </td>



                            <td>



                              {

                                data.percentage

                              }%



                            </td>



                          </tr>



                        )

                      )}



                    </tbody>



                  </table>



                </div>



              </>



            )}





          {/* YEARLY DAILY RECORDS */}



          {yearlyAttendance.length === 0 ? (



            <div className="alert alert-info mt-4">



              No attendance records found

              for this year.



            </div>



          ) : (



            <>



              <h5 className="mt-4 mb-3">



                Daily Records



              </h5>





              <div className="table-responsive">



                <table className="table applications-table">



                  <thead>



                    <tr>



                      <th>

                        Date

                      </th>



                      <th>

                        Status

                      </th>



                    </tr>



                  </thead>





                  <tbody>



                    {yearlyAttendance.map(

                      (record) => (



                        <tr

                          key={

                            record._id

                          }

                        >



                          <td>



                            {

                              formatDate(

                                record.date

                              )

                            }



                          </td>



                          <td>



                            <span className={record.status === 'Absent' ? 'badge bg-danger' : 'badge bg-success'}>
                            {record.status === 'Late' ? 'Present' : record.status}
                          </span>
                          {(record.isLate === true || record.status === 'Late') && (
                            <span className="badge bg-warning text-dark ms-1">Late</span>
                          )}



                          </td>



                        </tr>



                      )

                    )}



                  </tbody>



                </table>



              </div>



            </>



          )}



        </div>



      )}



    </div>



  )



}





export default StudentAttendance