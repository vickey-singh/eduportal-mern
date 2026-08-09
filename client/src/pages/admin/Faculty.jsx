import { useState, useEffect } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function Faculty() {

  // ======================================
  // STATE
  // ======================================

  const [formData, setFormData] =
    useState({

      name: '',

      designation: '',

      experience: '',

      subject: '',

      image: '',

      description: '',

    })


  const [facultyData, setFacultyData] =
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
        // CREATE FORMDATA
        // ==================================

        const facultyFormData =
          new FormData()


        facultyFormData.append(
          'name',
          formData.name
        )


        facultyFormData.append(
          'designation',
          formData.designation
        )


        facultyFormData.append(
          'experience',
          formData.experience
        )


        facultyFormData.append(
          'subject',
          formData.subject
        )


        facultyFormData.append(
          'description',
          formData.description
        )


        // ==================================
        // IMAGE
        // ==================================

        if (
          formData.image
        ) {

          facultyFormData.append(
            'image',
            formData.image
          )

        }


        let response


        // ==================================
        // UPDATE FACULTY
        // ==================================

        if (editId) {

          response =
            await axios.put(

              `${API_BASE_URL}/api/faculty/${editId}`,

              facultyFormData,

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

          setFacultyData(

            facultyData.map(
              (item) =>

                item._id === editId

                  ? response.data.faculty

                  : item

            )

          )


          alert(
            'Faculty Updated Successfully'
          )


          setEditId(null)

        }


        // ==================================
        // ADD FACULTY
        // ==================================

        else {

          response =
            await axios.post(

              `${API_BASE_URL}/api/faculty`,

              facultyFormData,

              {

                headers: {

                  'Content-Type':
                    'multipart/form-data',

                },

              }

            )


          // ==================================
          // ADD NEW FACULTY TO UI
          // ==================================

          setFacultyData([

            response.data.faculty,

            ...facultyData,

          ])


          alert(

            response.data.message ||

            'Faculty Added Successfully'

          )

        }


        // ==================================
        // RESET FORM
        // ==================================

        setFormData({

          name: '',

          designation: '',

          experience: '',

          subject: '',

          image: '',

          description: '',

        })

      }

      catch (error) {

        console.log(
          'Faculty Operation Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Faculty Operation Failed'

        )

      }

    }


  // ======================================
  // FETCH FACULTY
  // ======================================

  useEffect(() => {

    const fetchFaculty =
      async () => {

        try {

          const response =
            await axios.get(

              `${API_BASE_URL}/api/faculty`

            )


          setFacultyData(
            response.data
          )

        }

        catch (error) {

          console.log(
            'Fetch Faculty Error:',
            error
          )

        }

      }


    fetchFaculty()

  }, [])


  // ======================================
  // DELETE FACULTY
  // ======================================

  const deleteFaculty =
    async (id) => {

      try {

        await axios.delete(

          `${API_BASE_URL}/api/faculty/${id}`

        )


        setFacultyData(

          facultyData.filter(

            (item) =>
              item._id !== id

          )

        )


        alert(
          'Faculty Deleted Successfully'
        )

      }

      catch (error) {

        console.log(
          'Delete Faculty Error:',
          error
        )


        alert(
          'Delete Failed'
        )

      }

    }


  // ======================================
  // EDIT FACULTY
  // ======================================

  const editFaculty =
    (item) => {

      setFormData({

        name:
          item.name || '',

        designation:
          item.designation || '',

        experience:
          item.experience || '',

        subject:
          item.subject || '',

        // ==================================
        // IMPORTANT
        // Existing image is NOT put here
        // ==================================

        image: '',

        description:
          item.description || '',

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
          Faculty Management
        </h2>


        <p>
          Add and manage faculty members.
        </p>

      </div>


      {/* ====================================== */}
      {/* FACULTY FORM */}
      {/* ====================================== */}

      <div className="admin-form-wrapper">

        <form
          onSubmit={handleSubmit}
        >

          <div className="row">


            {/* ==================================
                NAME
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Faculty Name

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter faculty name"

                name="name"

                value={
                  formData.name
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* ==================================
                DESIGNATION
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Designation

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter designation"

                name="designation"

                value={
                  formData.designation
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* ==================================
                EXPERIENCE
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Experience

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter experience"

                name="experience"

                value={
                  formData.experience
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* ==================================
                SUBJECT
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Subject

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter subject"

                name="subject"

                value={
                  formData.subject
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* ==================================
                FACULTY IMAGE
            ================================== */}

            <div className="col-12 mb-3">

              <label className="form-label">

                Upload Faculty Image

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
                DESCRIPTION
            ================================== */}

            <div className="col-12 mb-4">

              <label className="form-label">

                Description

              </label>


              <textarea

                className="form-control"

                rows="5"

                placeholder="Write faculty description"

                name="description"

                value={
                  formData.description
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

              ? 'Update Faculty'

              : 'Add Faculty'

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

                  name: '',

                  designation: '',

                  experience: '',

                  subject: '',

                  image: '',

                  description: '',

                })

              }}

            >

              Cancel

            </button>

          )}

        </form>

      </div>


      {/* ====================================== */}
      {/* FACULTY TABLE */}
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
                Subject
              </th>

              <th>
                Experience
              </th>

              <th>
                Designation
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {facultyData.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="text-center"
                >

                  No faculty found.

                </td>

              </tr>

            ) : (

              facultyData.map(
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
                          item.name
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
                      {item.name}
                    </td>


                    {/* ==================================
                        SUBJECT
                    ================================== */}

                    <td>
                      {item.subject}
                    </td>


                    {/* ==================================
                        EXPERIENCE
                    ================================== */}

                    <td>
                      {item.experience}
                    </td>


                    {/* ==================================
                        DESIGNATION
                    ================================== */}

                    <td>
                      {item.designation}
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
                            editFaculty(
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
                            deleteFaculty(
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


export default Faculty