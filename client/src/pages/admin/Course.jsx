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

  // ======================================
  // COURSE DATA
  // ======================================

  const [courseData, setCourseData] =
    useState([])


  // ======================================
  // EDIT ID
  // ======================================

  const [editId, setEditId] =
    useState(null)


  // ======================================
  // FORM DATA
  // ======================================

  const [formData, setFormData] = useState({

    courseName: '',

    courseCode: '',

    description: '',

    // ==================================
    // DURATION
    // ==================================

    duration: '',


    // ==================================
    // BATCH TIME
    // ==================================

    batchTime: '',


    // ==================================
    // FEES
    // ==================================

    totalFee: '',

    registrationFee: '',


    // ==================================
    // PAYMENT
    // ==================================

    fullPaymentFee: '',


    // ==================================
    // INSTALLMENT
    // ==================================

    installmentAllowed: true,


    // ==================================
    // STATUS
    // ==================================

    status: 'Active',

  })


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
        data
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
  // RESET FORM
  // ======================================

  const resetForm = () => {

    setFormData({

      courseName: '',

      courseCode: '',

      description: '',

      duration: '',

      batchTime: '',


      totalFee: '',

      registrationFee: '',


      fullPaymentFee: '',


      installmentAllowed: true,

      status: 'Active',

    })


    setEditId(null)

  }


  // ======================================
  // ADD / UPDATE COURSE
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      try {

        let response


        // ==================================
        // UPDATE
        // ==================================

        if (editId) {

          response =
            await updateCourse(

              editId,

              formData

            )

        }


        // ==================================
        // ADD
        // ==================================

        else {

          response =
            await createCourse(
              formData
            )

        }


        // ==================================
        // SUCCESS
        // ==================================

        alert(
          response.message
        )


        // ==================================
        // REFRESH
        // ==================================

        await fetchCourses()


        // ==================================
        // RESET
        // ==================================

        resetForm()

      }

      catch (error) {

        console.log(
          'Course Submit Error:',
          error
        )


        alert(

          error.response?.data?.message ||

          'Something went wrong'

        )

      }

    }


  // ======================================
  // DELETE COURSE
  // ======================================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(

          'Are you sure you want to delete this course?'

        )


      if (!confirmDelete) {

        return

      }


      try {

        const response =
          await deleteCourse(
            id
          )


        alert(
          response.message
        )


        await fetchCourses()

      }

      catch (error) {

        console.log(
          'Delete Course Error:',
          error
        )


        alert(

          error.response?.data?.message ||

          'Something went wrong'

        )

      }

    }


  return (

    <div className="applications-section">


      {/* ==================================
          HEADER
      ================================== */}

      <div className="applications-header">

        <h2>
          Course Management
        </h2>

        <p>
          Add and manage all institute courses.
        </p>

      </div>


      {/* ==================================
          COURSE FORM
      ================================== */}

      <CourseForm

        formData={
          formData
        }

        setFormData={
          setFormData
        }

        editId={
          editId
        }

        handleSubmit={
          handleSubmit
        }

      />


      {/* ==================================
          CANCEL EDIT
      ================================== */}

      {editId && (

        <button
          type="button"
          className="
            table-btn
            reject-btn
            mt-2
          "
          onClick={
            resetForm
          }
        >

          Cancel Edit

        </button>

      )}


      {/* ==================================
          COURSE TABLE
      ================================== */}

      <CourseTable

        courseData={
          courseData
        }

        setFormData={
          setFormData
        }

        setEditId={
          setEditId
        }

        handleDelete={
          handleDelete
        }

      />

    </div>

  )

}

export default Course