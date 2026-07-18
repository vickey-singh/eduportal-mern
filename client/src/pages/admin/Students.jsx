import { useEffect, useState } from 'react'

import { API_BASE_URL } from '../../config/api'

import {

  getStudents,

  createStudent,

  updateStudent,

  deleteStudentById,

  addStudentPayment,

} from '../../services/studentService'

import {

  getCourses,

} from '../../services/courseService'

import '../../assets/styles/admin.css'

import PaymentForm from './PaymentForm'

import PaymentHistory from './PaymentHistory'

import ReceiptButton from './ReceiptButton'

function Students() {

  // ======================================
  // STATE
  // ======================================

  const [studentData, setStudentData]
    = useState([])

    const [courses, setCourses] 
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

      minimumInstallment: '',

      installmentAllowed: false,

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
          await getStudents()
          
          setStudentData(response)

        } catch (error) {

          console.log(error)

        }

      }

      const fetchCourses = async () => {

      try {
    
        const response =
        await getCourses()
        
        setCourses(response)
    
    
      } catch (error) {
    
        console.log(error)
    
      }
    
    }

    fetchStudents()
    fetchCourses()
    

  }, [])

  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange = (e) => {

  const { name, value } = e.target

  // ==============================
  // COURSE SELECTED
  // ==============================

  if (name === 'course') {

    const selectedCourse = courses.find(

      (course) => course.courseName === value

    )

    if (selectedCourse) {

      setFormData({

        ...formData,

        course: value,

        totalFees: selectedCourse.totalFee,

        paidFees: selectedCourse.registrationFee,

         minimumInstallment:
           selectedCourse.minimumInstallment,
       
         installmentAllowed:
           selectedCourse.installmentAllowed,


      })

      return

    }

  }

  // ==============================
  // NORMAL INPUT
  // ==============================

  setFormData({

    ...formData,

    [name]: value,

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
          await updateStudent(
          
              editId,
          
              studentFormData
          
          )

          setStudentData(

            studentData.map((item) =>

              item._id === editId
                ? response.student
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
            await createStudent(
                studentFormData
            )

          setStudentData([

            response.student,

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

        await deleteStudentById(id)

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
          await addStudentPayment(
          
              studentId,
          
              paymentData
          
          )

        // ======================================
        // UPDATE STUDENTS
        // ======================================

        setStudentData(

          studentData.map((item) =>

            item._id === studentId
              ? response.student
              : item

          )

        )

        // ======================================
        // UPDATE SELECTED STUDENT
        // ======================================

        setSelectedStudent(
          response.student
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
            
              <select
                className="form-control"
                name="course"
                value={formData.course}
                onChange={handleChange}
              >
            
                <option value="">
                  Select Course
                </option>
            
                {courses.map((course) => (
            
                  <option
                    key={course._id}
                    value={course.courseName}
                  >
            
                    {course.courseName}
            
                  </option>
            
                ))}
            
              </select>
            
            </div>

            {/* Total Fees */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Total Fees
              </label>

              <input
                type="number"
                className="form-control"
                name="totalFees"
                value={formData.totalFees}
                readOnly
              />

            </div>

            {/* Paid Fees
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Registration Fee
              </label>

              <input
                type="number"
                className="form-control"
                name="paidFees"
                value={formData.paidFees}
                readOnly
              />

            </div> */}

            {/* Minimum Installment */}
            <div className="col-md-6 mb-3">
            
              <label className="form-label">
                Minimum Installment
              </label>
            
              <input
                type="number"
                className="form-control"
                value={formData.minimumInstallment || ''}
                readOnly
              />
            
            </div>

            {/* Installment Allowed */}
            <div className="col-md-6 mb-3">
            
              <label className="form-label">
                Installment Allowed
              </label>
            
              <input
                type="text"
                className="form-control"
                value={
                  formData.installmentAllowed
                    ? 'Yes'
                    : 'No'
                }
                readOnly
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
                    src={`${API_BASE_URL}${item.image}`}
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
                src={`${API_BASE_URL}${selectedStudent.image}`}
                alt={selectedStudent.name}
                className="student-modal-image"
              />

            </div>

            <PaymentForm
              paymentData={paymentData}
              setPaymentData={setPaymentData}
              selectedStudent={selectedStudent}
              addPayment={addPayment}
            />

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


        
          
          <ReceiptButton
                selectedStudent={selectedStudent}
          />



            <PaymentHistory
                selectedStudent={selectedStudent}
            />

          </div>

        </div>

      )}

    </div>

  )

}

export default Students