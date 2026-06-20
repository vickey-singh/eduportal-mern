import { useEffect, useState } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'

function Students() {

  // ======================================
  // STATE
  // ======================================

  const [studentData, setStudentData]
    = useState([])

  const [editId, setEditId]
    = useState(null)

  const [searchTerm, setSearchTerm]
    = useState('')

  const [selectedStudent,
    setSelectedStudent]
    = useState(null)

  const [statusFilter, setStatusFilter]
    = useState('All')

  const [paymentData,
    setPaymentData]

    = useState({

      amount: '',

      paymentMethod: 'Cash',

      paymentDate: '',

    })

  const [formData, setFormData]
    = useState({

      name: '',

      admissionNumber: '',

      course: '',

      totalFees: '',

      paidFees: '',

      dueDate: '',

      contact: '',

      email: '',

      admissionDate: '',

      image: '',

    })

  // ======================================
  // FETCH STUDENTS
  // ======================================

  useEffect(() => {

    const fetchStudents =
      async () => {

        try {

          const response =
            await axios.get(
              'https://eduportal-backend-m5t1.onrender.com/api/students'
            )

          setStudentData(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchStudents()

  }, [])

  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,

    })

  }

  // ======================================
  // HANDLE SUBMIT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      try {

        const studentFormData =
          new FormData()

        studentFormData.append(
          'name',
          formData.name
        )

        studentFormData.append(
          'admissionNumber',
          formData.admissionNumber
        )

        studentFormData.append(
          'course',
          formData.course
        )

        studentFormData.append(
          'totalFees',
          formData.totalFees
        )

        studentFormData.append(
          'paidFees',
          formData.paidFees
        )

        studentFormData.append(
          'dueDate',
          formData.dueDate
        )

        studentFormData.append(
          'contact',
          formData.contact
        )

        studentFormData.append(
          'email',
          formData.email
        )

        studentFormData.append(
          'admissionDate',
          formData.admissionDate
        )

        if (formData.image) {

          studentFormData.append(
            'image',
            formData.image
          )

        }

        let response

        // ======================================
        // UPDATE STUDENT
        // ======================================

        if (editId) {

          response =
            await axios.put(

              `https://eduportal-backend-m5t1.onrender.com/api/students/${editId}`,

              studentFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          setStudentData(

            studentData.map((item) =>

              item._id === editId
                ? response.data.student
                : item

            )

          )

          alert(
            'Student Updated Successfully'
          )

          setEditId(null)

        }

        // ======================================
        // ADD STUDENT
        // ======================================

        else {

          response =
            await axios.post(

              'https://eduportal-backend-m5t1.onrender.com/api/students',

              studentFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          setStudentData([

            response.data.student,

            ...studentData,

          ])

          alert(
            response.data.message
          )

        }

        // ======================================
        // RESET FORM
        // ======================================

        setFormData({

          name: '',

          admissionNumber: '',

          course: '',

          totalFees: '',

          paidFees: '',

          dueDate: '',

          contact: '',

          email: '',

          admissionDate: '',

          image: '',

        })

      } catch (error) {

        console.log(error)

        alert(
          'Student Operation Failed'
        )

      }

    }

  // ======================================
  // DELETE STUDENT
  // ======================================

  const deleteStudent =
    async (id) => {

      try {

        await axios.delete(
          `https://eduportal-backend-m5t1.onrender.com/api/students/${id}`
        )

        setStudentData(

          studentData.filter(
            (item) => item._id !== id
          )

        )

        alert(
          'Student Deleted Successfully'
        )

      } catch (error) {

        console.log(error)

      }

    }

  // ======================================
  // ADD PAYMENT
  // ======================================

  const addPayment =
    async (studentId) => {

      try {

        const response =
          await axios.put(

            `https://eduportal-backend-m5t1.onrender.com/api/students/add-payment/${studentId}`,

            paymentData

          )

        // ======================================
        // UPDATE STUDENTS
        // ======================================

        setStudentData(

          studentData.map((item) =>

            item._id === studentId
              ? response.data.student
              : item

          )

        )

        // ======================================
        // UPDATE SELECTED STUDENT
        // ======================================

        setSelectedStudent(
          response.data.student
        )

        // ======================================
        // RESET PAYMENT FORM
        // ======================================

        setPaymentData({

          amount: '',

          paymentMethod: 'Cash',

          paymentDate: '',

        })

        alert(
          'Payment Added Successfully'
        )

      } catch (error) {

        console.log(error)

        alert(
          'Payment Failed'
        )

      }

    }

  // ======================================
  // EDIT STUDENT
  // ======================================

  const editStudent =
    (item) => {

      setFormData({

        name:
          item.name,

        admissionNumber:
          item.admissionNumber,

        course:
          item.course,

        totalFees:
          item.totalFees,

        paidFees:
          item.paidFees,

        dueDate:
          item.dueDate,

        contact:
          item.contact,

        email:
          item.email,

        admissionDate:
          item.admissionDate,

        image: '',

      })

      setEditId(item._id)

    }

  // ======================================
  // FILTER STUDENTS
  // ======================================

  const filteredStudents =
    studentData.filter((item) => {

      const matchesSearch =

        item.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )

        ||

        item.admissionNumber
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )

      const matchesStatus =

        statusFilter === 'All'

        ||

        item.feesStatus === statusFilter

      return (
        matchesSearch &&
        matchesStatus
      )

    })

  return (

    <div className="applications-section">

      {/* ====================================== */}
      {/* PAGE HEADER */}
      {/* ====================================== */}

      <div className="applications-header">

        <h2>
          Student Management
        </h2>

        <p>
          Add and manage students with fees tracking.
        </p>

      </div>

      {/* ====================================== */}
      {/* STUDENT FORM */}
      {/* ====================================== */}

      <div className="admin-form-wrapper">

        <form onSubmit={handleSubmit}>

          <div className="row">

            {/* Name */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Student Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter student name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />

            </div>

            {/* Roll Number */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Admission Number
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter admission number"
                name="admissionNumber"
                value={formData.admissionNumber}
                onChange={handleChange}
              />

            </div>

            {/* Course */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Course
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter course"
                name="course"
                value={formData.course}
                onChange={handleChange}
              />

            </div>

            {/* Total Fees */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Total Fees
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="Enter total fees"
                name="totalFees"
                value={formData.totalFees}
                onChange={handleChange}
              />

            </div>

            {/* Paid Fees */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Paid Fees
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="Enter paid fees"
                name="paidFees"
                value={formData.paidFees}
                onChange={handleChange}
              />

            </div>

            {/* Due Date */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Fees Due Date
              </label>

              <input
                type="date"
                className="form-control"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />

            </div>

            {/* Contact */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Contact Number
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter contact number"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
              />

            </div>

            {/* Email */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />

            </div>

            {/* Admission Date */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Admission Date
              </label>

              <input
                type="date"
                className="form-control"
                name="admissionDate"
                value={formData.admissionDate}
                onChange={handleChange}
              />

            </div>

            {/* Image */}
            <div className="col-md-6 mb-4">

              <label className="form-label">
                Upload Student Image
              </label>

              <input
                type="file"
                className="form-control"
                onChange={(e) =>

                  setFormData({

                    ...formData,

                    image:
                      e.target.files[0],

                  })

                }
              />

            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="table-btn approve-btn"
          >

            {editId
              ? 'Update Student'
              : 'Add Student'}

          </button>

        </form>

      </div>

      {/* ====================================== */}
      {/* SEARCH + FILTER */}
      {/* ====================================== */}

      <div className="row mt-5 mb-4">

        {/* Search */}
        <div className="col-md-6 mb-3">

          <input
            type="text"
            className="form-control"
            placeholder="Search by Name or Admission Number"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

        </div>

        {/* Filter */}
        <div className="col-md-6 mb-3">

          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >

            <option value="All">
              All Status
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Partial">
              Partial
            </option>

            <option value="Pending">
              Pending
            </option>

          </select>

        </div>

      </div>

      {/* ====================================== */}
      {/* STUDENT TABLE */}
      {/* ====================================== */}

      <div
        className="table-responsive mt-4"
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          width: '100%',
        }}
      >

        <table
          className="table applications-table"
          style={{
            minWidth: '1600px',
          }}
        >

          <thead>

            <tr>

              <th>Photo</th>

              <th>Name</th>

              <th>Admission No.</th>

              <th>Course</th>

              <th>Total Fees</th>

              <th>Paid Fees</th>

              <th>Remaining</th>

              <th>Status</th>

              <th>Due Date</th>

              <th>Contact</th>

              <th>Email</th>

              <th>Admission Date</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredStudents.map((item) => (

              <tr key={item._id}>

                <td style={{ whiteSpace: 'nowrap' }}>

                  <img
                    src={`https://eduportal-backend-m5t1.onrender.com${item.image}`}
                    alt={item.name}
                    width="60"
                    height="60"
                    style={{
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />

                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  {item.name}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  {item.admissionNumber}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  {item.course}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  ₹ {item.totalFees}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  ₹ {item.paidFees}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  ₹ {item.remainingFees}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>

                  <span
                    className={`status ${item.feesStatus.toLowerCase()}`}
                  >

                    {item.feesStatus}

                  </span>

                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  {item.dueDate}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  {item.contact}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  {item.email}
                </td>

                <td style={{ whiteSpace: 'nowrap' }}>
                  {item.admissionDate}
                </td>

                {/* Actions */}
                <td style={{ whiteSpace: 'nowrap' }}>

                  <div className="d-flex gap-2">

                    <button
                      className="table-btn approve-btn"
                      onClick={() =>
                        editStudent(item)
                      }
                    >

                      Edit

                    </button>

                    <button
                      className="table-btn reject-btn"
                      onClick={() =>
                        deleteStudent(item._id)
                      }
                    >

                      Delete

                    </button>

                    <button
                      className="table-btn view-btn"
                      onClick={() =>
                        setSelectedStudent(item)
                      }
                    >

                      View

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ====================================== */}
      {/* STUDENT VIEW MODAL */}
      {/* ====================================== */}

      {selectedStudent && (

        <div className="student-modal-overlay">

          <div className="student-modal">

            {/* Close Button */}
            <button
              className="student-modal-close"
              onClick={() =>
                setSelectedStudent(null)
              }
            >

              ×

            </button>

            {/* Student Image */}
            <div className="text-center mb-4">

              <img
                src={`https://eduportal-backend-m5t1.onrender.com${selectedStudent.image}`}
                alt={selectedStudent.name}
                className="student-modal-image"
              />

            </div>

            {/* ====================================== */}
            {/* ADD PAYMENT */}
            {/* ====================================== */}

            <div className="mb-4">

              <h4 className="mb-3">
                Add Payment
              </h4>

              <div className="row">

                {/* Amount */}
                <div className="col-md-4 mb-3">

                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter Amount"
                    value={paymentData.amount}
                    onChange={(e) =>

                      setPaymentData({

                        ...paymentData,

                        amount:
                          e.target.value,

                      })

                    }
                  />

                </div>

                {/* Payment Method */}
                <div className="col-md-4 mb-3">

                  <select
                    className="form-control"
                    value={paymentData.paymentMethod}
                    onChange={(e) =>

                      setPaymentData({

                        ...paymentData,

                        paymentMethod:
                          e.target.value,

                      })

                    }
                  >

                    <option value="Cash">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Card">
                      Card
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>

                  </select>

                </div>

                {/* Date */}
                <div className="col-md-4 mb-3">

                  <input
                    type="date"
                    className="form-control"
                    value={paymentData.paymentDate}
                    onChange={(e) =>

                      setPaymentData({

                        ...paymentData,

                        paymentDate:
                          e.target.value,

                      })

                    }
                  />

                </div>

              </div>

              <button
                className="table-btn approve-btn"
                onClick={() =>
                  addPayment(
                    selectedStudent._id
                  )
                }
              >

                Add Payment

              </button>

            </div>

            {/* ====================================== */}
            {/* STUDENT DETAILS */}
            {/* ====================================== */}

            <h3 className="text-center mb-4">

              {selectedStudent.name}

            </h3>

            <div className="student-details-grid">

              <div>

                <strong>
                  Admission Number:
                </strong>
                
                <p>
                  {selectedStudent.admissionNumber}
                </p>

              </div>

              <div>

                <strong>
                  Course:
                </strong>

                <p>
                  {selectedStudent.course}
                </p>

              </div>

              <div>

                <strong>
                  Total Fees:
                </strong>

                <p>
                  ₹ {selectedStudent.totalFees}
                </p>

              </div>

              <div>

                <strong>
                  Paid Fees:
                </strong>

                <p>
                  ₹ {selectedStudent.paidFees}
                </p>

              </div>

              <div>

                <strong>
                  Remaining Fees:
                </strong>

                <p>
                  ₹ {selectedStudent.remainingFees}
                </p>

              </div>

              <div>

                <strong>
                  Fees Status:
                </strong>

                <p>

                  <span
                    className={`status ${selectedStudent.feesStatus.toLowerCase()}`}
                  >

                    {selectedStudent.feesStatus}

                  </span>

                </p>

              </div>

              <div>

                <strong>
                  Due Date:
                </strong>

                <p>
                  {selectedStudent.dueDate}
                </p>

              </div>

              <div>

                <strong>
                  Contact:
                </strong>

                <p>
                  {selectedStudent.contact}
                </p>

              </div>

              <div>

                <strong>
                  Email:
                </strong>

                <p>
                  {selectedStudent.email}
                </p>

              </div>

              <div>

                <strong>
                  Admission Date:
                </strong>

                <p>
                  {selectedStudent.admissionDate}
                </p>

              </div>

            </div>


          {/* ====================================== */}
          {/* RECEIPT BUTTON */}
          {/* ====================================== */}
          
          <div className="mb-4">
          
            <button
              className="table-btn view-btn"
              onClick={() => {
          
                if (
          
                  !selectedStudent.paymentHistory ||
          
                  selectedStudent.paymentHistory.length === 0
          
                ) {
          
                  alert(
                    'No Payment History Found'
                  )
          
                  return
          
                }
          
                // ======================================
                // LAST PAYMENT INDEX
                // ======================================
          
                const lastPaymentIndex =
          
                  selectedStudent.paymentHistory.length - 1
          
                // ======================================
                // OPEN RECEIPT
                // ======================================
          
                window.open(
          
                  `https://eduportal-backend-m5t1.onrender.com/api/receipt/${selectedStudent._id}/${lastPaymentIndex}`,
          
                  '_blank'
          
                )
          
              }}
            >
          
              Generate Receipt
          
            </button>
          
          </div>



            {/* ====================================== */}
            {/* PAYMENT HISTORY */}
            {/* ====================================== */}

            <div className="mt-5">

              <h4 className="mb-3">
                Payment History
              </h4>

              <div className="table-responsive">

                <table className="table applications-table">

                  <thead>

                    <tr>

                      <th>Amount</th>

                      <th>Method</th>

                      <th>Date</th>

                    </tr>

                  </thead>

                  <tbody>

                    {selectedStudent.paymentHistory &&
                    selectedStudent.paymentHistory.length > 0 ? (

                      selectedStudent.paymentHistory.map(

                        (payment, index) => (

                          <tr key={index}>

                            <td>
                              ₹ {payment.amount}
                            </td>

                            <td>
                              {payment.paymentMethod}
                            </td>

                            <td>
                              {payment.paymentDate}
                            </td>

                          </tr>

                        )

                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="3"
                          className="text-center"
                        >

                          No Payment History

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}

export default Students