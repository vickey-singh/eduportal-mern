import { useEffect, useState } from 'react'

import CourseForm from './CourseForm'
import CourseTable from './CourseTable'

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../../services/courseService'

function Course() {

  const [courseData, setCourseData] = useState([])

  const [editId, setEditId] = useState(null)

  const [formData, setFormData] = useState({

    courseName: '',
    courseCode: '',
    description: '',
    duration: '',
    totalFee: '',
    registrationFee: '',
    installmentAllowed: true,
    monthlyInstallment: '',
    threeMonthInstallment: '',
    sixMonthInstallment: '',
    fullPaymentFee: '',
    status: 'Active',

  })

  // ======================================
  // FETCH COURSES
  // ======================================

  useEffect(() => {

    fetchCourses()

  }, [])

  const fetchCourses = async () => {

    try {

      const data = await getCourses()

      setCourseData(data)

    } catch (error) {

      console.log(error)

    }

  }

  // ======================================
  // ADD / UPDATE COURSE
  // ======================================

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      let response

      if (editId) {

        response = await updateCourse(
          editId,
          formData
        )

      } else {

        response = await createCourse(
          formData
        )

      }

      alert(response.message)

      await fetchCourses()

      setEditId(null)

      setFormData({

        courseName: '',
        courseCode: '',
        description: '',
        duration: '',
        totalFee: '',
        registrationFee: '',
        installmentAllowed: true,
        monthlyInstallment: '',
        threeMonthInstallment: '',
        sixMonthInstallment: '',
        fullPaymentFee: '',
        status: 'Active',
      })

    } catch (error) {

      console.log(error)

      alert('Something went wrong')

    }

  }

  // ======================================
  // DELETE COURSE
  // ======================================

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(

      'Are you sure you want to delete this course?'

    )

    if (!confirmDelete) return

    try {

      const response = await deleteCourse(id)

      alert(response.message)

      await fetchCourses()

    } catch (error) {

      console.log(error)

      alert('Something went wrong')

    }

  }

  return (

    <div className="applications-section">

      <div className="applications-header">

        <h2>

          Course Management

        </h2>

        <p>

          Add and manage all institute courses.

        </p>

      </div>

      <CourseForm

        formData={formData}
        setFormData={setFormData}
        editId={editId}
        handleSubmit={handleSubmit}

      />

      <CourseTable

        courseData={courseData}
        setFormData={setFormData}
        setEditId={setEditId}
        handleDelete={handleDelete}

      />

    </div>

  )

}

export default Course