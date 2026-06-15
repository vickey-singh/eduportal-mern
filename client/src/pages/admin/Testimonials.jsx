import { useState, useEffect } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'

function Testimonials() {

  // ======================================
  // STATE
  // ======================================

  const [formData, setFormData]
    = useState({

      studentName: '',

      course: '',

      image: '',

      review: '',

    })

  const [testimonialData,
    setTestimonialData]

    = useState([])

  const [editId, setEditId]
    = useState(null)

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

        // ======================================
        // FORMDATA
        // ======================================

        const testimonialFormData =
          new FormData()

        testimonialFormData.append(
          'studentName',
          formData.studentName
        )

        testimonialFormData.append(
          'course',
          formData.course
        )

        testimonialFormData.append(
          'review',
          formData.review
        )

        if (formData.image) {

          testimonialFormData.append(
            'image',
            formData.image
          )

        }

        let response

        // ======================================
        // UPDATE TESTIMONIAL
        // ======================================

        if (editId) {

          response =
            await axios.put(

              `http://localhost:8000/api/testimonials/${editId}`,

              testimonialFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          // Update UI
          setTestimonialData(

            testimonialData.map((item) =>

              item._id === editId
                ? response.data.testimonial
                : item

            )

          )

          alert(
            'Testimonial Updated Successfully'
          )

          setEditId(null)

        }

        // ======================================
        // ADD TESTIMONIAL
        // ======================================

        else {

          response =
            await axios.post(

              'http://localhost:8000/api/testimonials',

              testimonialFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          // Add New Testimonial
          setTestimonialData([

            response.data.testimonial,

            ...testimonialData,

          ])

          alert(
            response.data.message
          )

        }

        // ======================================
        // RESET FORM
        // ======================================

        setFormData({

          studentName: '',

          course: '',

          image: '',

          review: '',

        })

      } catch (error) {

        console.log(error)

        alert('Testimonial Operation Failed')

      }

    }

  // ======================================
  // FETCH TESTIMONIALS
  // ======================================

  useEffect(() => {

    const fetchTestimonials =
      async () => {

        try {

          const response =
            await axios.get(
              'http://localhost:8000/api/testimonials'
            )

          setTestimonialData(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchTestimonials()

  }, [])

  // ======================================
  // DELETE TESTIMONIAL
  // ======================================

  const deleteTestimonial =
    async (id) => {

      try {

        await axios.delete(
          `http://localhost:8000/api/testimonials/${id}`
        )

        setTestimonialData(

          testimonialData.filter(
            (item) => item._id !== id
          )

        )

        alert(
          'Testimonial Deleted Successfully'
        )

      } catch (error) {

        console.log(error)

        alert('Delete Failed')

      }

    }

  // ======================================
  // EDIT TESTIMONIAL
  // ======================================

  const editTestimonial =
    (item) => {

      setFormData({

        studentName:
          item.studentName,

        course:
          item.course,

        image: '',

        review:
          item.review,

      })

      setEditId(item._id)

    }

  return (

    <div className="applications-section">

      {/* ====================================== */}
      {/* PAGE HEADER */}
      {/* ====================================== */}

      <div className="applications-header">

        <h2>
          Testimonials Management
        </h2>

        <p>
          Add and manage student testimonials.
        </p>

      </div>

      {/* ====================================== */}
      {/* FORM */}
      {/* ====================================== */}

      <div className="admin-form-wrapper">

        <form onSubmit={handleSubmit}>

          <div className="row">

            {/* Student Name */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Student Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter student name"
                name="studentName"
                value={formData.studentName}
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

            {/* Image */}
            <div className="col-12 mb-3">

              <label className="form-label">
                Upload Student Image
              </label>

              <input
                type="file"
                className="form-control"
                name="image"
                onChange={(e) =>

                  setFormData({

                    ...formData,

                    image:
                      e.target.files[0],

                  })

                }
              />

            </div>

            {/* Review */}
            <div className="col-12 mb-4">

              <label className="form-label">
                Review Message
              </label>

              <textarea
                className="form-control"
                rows="5"
                placeholder="Write testimonial review"
                name="review"
                value={formData.review}
                onChange={handleChange}
              ></textarea>

            </div>

          </div>

          {/* Submit */}
          <button
            type="submit"
            className="table-btn approve-btn"
          >

            {editId
              ? 'Update Testimonial'
              : 'Add Testimonial'}

          </button>

        </form>

      </div>

      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="table-responsive mt-5">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Image</th>

              <th>Name</th>

              <th>Course</th>

              <th>Review</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {testimonialData.map((item) => (

              <tr key={item._id}>

                {/* Image */}
                <td>

                  <img
                    src={`http://localhost:8000${item.image}`}
                    alt={item.studentName}
                    width="60"
                    height="60"
                    style={{
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />

                </td>

                {/* Name */}
                <td>
                  {item.studentName}
                </td>

                {/* Course */}
                <td>
                  {item.course}
                </td>

                {/* Review */}
                <td>
                  {item.review}
                </td>

                {/* Actions */}
                <td>

                  <div className="d-flex gap-2">

                    <button
                      className="table-btn approve-btn"
                      onClick={() =>
                        editTestimonial(item)
                      }
                    >

                      Edit

                    </button>

                    <button
                      className="table-btn reject-btn"
                      onClick={() =>
                        deleteTestimonial(item._id)
                      }
                    >

                      Delete

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default Testimonials