import { useState, useEffect } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function Testimonials() {

  // ======================================
  // STATE
  // ======================================

  const [formData, setFormData] =
    useState({

      studentName: '',

      course: '',

      image: '',

      review: '',

    })


  const [testimonialData, setTestimonialData] =
    useState([])


  const [editId, setEditId] =
    useState(null)


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

        // ==================================
        // FORMDATA
        // ==================================

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


        // ==================================
        // IMAGE
        // ==================================

        if (
          formData.image
        ) {

          testimonialFormData.append(
            'image',
            formData.image
          )

        }


        let response


        // ==================================
        // UPDATE TESTIMONIAL
        // ==================================

        if (editId) {

          response =
            await axios.put(

              `${API_BASE_URL}/api/testimonials/${editId}`,

              testimonialFormData,

              {

                headers: {

                  'Content-Type':
                    'multipart/form-data',

                },

              }

            )


          // ==================================
          // UPDATE UI
          // ==================================

          setTestimonialData(

            testimonialData.map(
              (item) =>

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


        // ==================================
        // ADD TESTIMONIAL
        // ==================================

        else {

          response =
            await axios.post(

              `${API_BASE_URL}/api/testimonials`,

              testimonialFormData,

              {

                headers: {

                  'Content-Type':
                    'multipart/form-data',

                },

              }

            )


          // ==================================
          // ADD NEW TESTIMONIAL
          // ==================================

          setTestimonialData([

            response.data.testimonial,

            ...testimonialData,

          ])


          alert(

            response.data.message ||

            'Testimonial Added Successfully'

          )

        }


        // ==================================
        // RESET FORM
        // ==================================

        setFormData({

          studentName: '',

          course: '',

          image: '',

          review: '',

        })

      }

      catch (error) {

        console.log(
          'Testimonial Operation Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Testimonial Operation Failed'

        )

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

              `${API_BASE_URL}/api/testimonials`

            )


          setTestimonialData(
            response.data
          )

        }

        catch (error) {

          console.log(
            'Fetch Testimonials Error:',
            error
          )

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

          `${API_BASE_URL}/api/testimonials/${id}`

        )


        setTestimonialData(

          testimonialData.filter(

            (item) =>
              item._id !== id

          )

        )


        alert(
          'Testimonial Deleted Successfully'
        )

      }

      catch (error) {

        console.log(
          'Delete Testimonial Error:',
          error
        )


        alert(
          'Delete Failed'
        )

      }

    }


  // ======================================
  // EDIT TESTIMONIAL
  // ======================================

  const editTestimonial =
    (item) => {

      setFormData({

        studentName:
          item.studentName || '',

        course:
          item.course || '',

        // ==================================
        // IMPORTANT
        // Existing image is NOT placed here
        // ==================================

        image: '',

        review:
          item.review || '',

      })


      setEditId(
        item._id
      )


      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      })

    }


  // ======================================
  // IMAGE URL
  // ======================================
  //
  // Cloudinary:
  //     complete URL
  //
  // Old records:
  //     /uploads/filename.jpg
  //
  // Supports both.
  // ======================================

  const getImageUrl =
    (image) => {

      if (!image) {

        return '/logo.png'

      }


      // ==================================
      // CLOUDINARY / EXTERNAL URL
      // ==================================

      if (

        image.startsWith(
          'http://'
        ) ||

        image.startsWith(
          'https://'
        )

      ) {

        return image

      }


      // ==================================
      // OLD LOCAL UPLOAD
      // ==================================

      return `${API_BASE_URL}${

        image.startsWith('/')

          ? image

          : `/${image}`

      }`

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

        <form
          onSubmit={handleSubmit}
        >

          <div className="row">


            {/* ==================================
                STUDENT NAME
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Student Name

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter student name"

                name="studentName"

                value={
                  formData.studentName
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* ==================================
                COURSE
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Course

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter course"

                name="course"

                value={
                  formData.course
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* ==================================
                IMAGE
            ================================== */}

            <div className="col-12 mb-3">

              <label className="form-label">

                Upload Student Image

              </label>


              <input

                type="file"

                className="form-control"

                name="image"

                accept="image/jpeg,image/png,image/jpg,image/webp"

                onChange={(e) => {

                  setFormData({

                    ...formData,

                    image:
                      e.target.files[0] || '',

                  })

                }}

              />


              {editId && (

                <small className="text-muted">

                  Leave this empty to keep the
                  existing image.

                </small>

              )}

            </div>


            {/* ==================================
                REVIEW
            ================================== */}

            <div className="col-12 mb-4">

              <label className="form-label">

                Review Message

              </label>


              <textarea

                className="form-control"

                rows="5"

                placeholder="Write testimonial review"

                name="review"

                value={
                  formData.review
                }

                onChange={
                  handleChange
                }

                required

              ></textarea>

            </div>

          </div>


          {/* ======================================
              SUBMIT
          ====================================== */}

          <button

            type="submit"

            className="table-btn approve-btn"

          >

            {editId

              ? 'Update Testimonial'

              : 'Add Testimonial'

            }

          </button>


          {/* ======================================
              CANCEL EDIT
          ====================================== */}

          {editId && (

            <button

              type="button"

              className="table-btn reject-btn ms-2"

              onClick={() => {

                setEditId(null)

                setFormData({

                  studentName: '',

                  course: '',

                  image: '',

                  review: '',

                })

              }}

            >

              Cancel

            </button>

          )}

        </form>

      </div>


      {/* ====================================== */}
      {/* TABLE */}
      {/* ====================================== */}

      <div className="table-responsive mt-5">

        <table className="table applications-table">


          <thead>

            <tr>

              <th>
                Image
              </th>

              <th>
                Name
              </th>

              <th>
                Course
              </th>

              <th>
                Review
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {testimonialData.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  className="text-center"
                >

                  No testimonials found.

                </td>

              </tr>

            ) : (

              testimonialData.map(
                (item) => (

                  <tr
                    key={
                      item._id
                    }
                  >


                    {/* ==================================
                        IMAGE
                    ================================== */}

                    <td>

                      <img

                        src={
                          getImageUrl(
                            item.image
                          )
                        }

                        alt={
                          item.studentName
                        }

                        width="60"

                        height="60"

                        style={{

                          objectFit:
                            'cover',

                          borderRadius:
                            '8px',

                        }}

                        onError={(e) => {

                          e.currentTarget.src =
                            '/logo.png'

                        }}

                      />

                    </td>


                    {/* ==================================
                        NAME
                    ================================== */}

                    <td>

                      {
                        item.studentName
                      }

                    </td>


                    {/* ==================================
                        COURSE
                    ================================== */}

                    <td>

                      {
                        item.course
                      }

                    </td>


                    {/* ==================================
                        REVIEW
                    ================================== */}

                    <td>

                      {
                        item.review
                      }

                    </td>


                    {/* ==================================
                        ACTIONS
                    ================================== */}

                    <td>

                      <div className="d-flex gap-2">


                        <button

                          type="button"

                          className="table-btn approve-btn"

                          onClick={() =>
                            editTestimonial(
                              item
                            )
                          }

                        >

                          Edit

                        </button>


                        <button

                          type="button"

                          className="table-btn reject-btn"

                          onClick={() =>
                            deleteTestimonial(
                              item._id
                            )
                          }

                        >

                          Delete

                        </button>

                      </div>

                    </td>

                  </tr>

                )

              )

            )}

          </tbody>

        </table>

      </div>

    </div>

  )

}


export default Testimonials