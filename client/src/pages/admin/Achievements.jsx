import { useState, useEffect } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function Achievements() {

  // ======================================
  // STATE
  // ======================================

  const [formData, setFormData] =
    useState({

      studentName: '',

      course: '',

      rank: '',

      marks: '',

      image: '',

      description: '',

    })


  const [achievementData, setAchievementData] =
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

        const achievementFormData =
          new FormData()


        achievementFormData.append(
          'studentName',
          formData.studentName
        )


        achievementFormData.append(
          'course',
          formData.course
        )


        achievementFormData.append(
          'rank',
          formData.rank
        )


        achievementFormData.append(
          'marks',
          formData.marks
        )


        achievementFormData.append(
          'description',
          formData.description
        )


        // ==================================
        // IMAGE
        // ==================================

        if (
          formData.image
        ) {

          achievementFormData.append(
            'image',
            formData.image
          )

        }


        let response


        // ==================================
        // UPDATE ACHIEVEMENT
        // ==================================

        if (editId) {

          response =
            await axios.put(

              `${API_BASE_URL}/api/achievements/${editId}`,

              achievementFormData,

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

          setAchievementData(

            achievementData.map(
              (item) =>

                item._id === editId

                  ? response.data.achievement

                  : item

            )

          )


          alert(
            'Achievement Updated Successfully'
          )


          setEditId(null)

        }


        // ==================================
        // ADD ACHIEVEMENT
        // ==================================

        else {

          response =
            await axios.post(

              `${API_BASE_URL}/api/achievements`,

              achievementFormData,

              {

                headers: {

                  'Content-Type':
                    'multipart/form-data',

                },

              }

            )


          // ==================================
          // ADD NEW ACHIEVEMENT TO UI
          // ==================================

          setAchievementData([

            response.data.achievement,

            ...achievementData,

          ])


          alert(
            response.data.message ||
            'Achievement Added Successfully'
          )

        }


        // ==================================
        // RESET FORM
        // ==================================

        setFormData({

          studentName: '',

          course: '',

          rank: '',

          marks: '',

          image: '',

          description: '',

        })

      }

      catch (error) {

        console.log(
          'Achievement Operation Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Achievement Operation Failed'

        )

      }

    }


  // ======================================
  // FETCH ACHIEVEMENTS
  // ======================================

  useEffect(() => {

    const fetchAchievements =
      async () => {

        try {

          const response =
            await axios.get(

              `${API_BASE_URL}/api/achievements`

            )


          setAchievementData(

            response.data

          )

        }

        catch (error) {

          console.log(
            'Fetch Achievements Error:',
            error
          )

        }

      }


    fetchAchievements()

  }, [])


  // ======================================
  // DELETE ACHIEVEMENT
  // ======================================

  const deleteAchievement =
    async (id) => {

      try {

        await axios.delete(

          `${API_BASE_URL}/api/achievements/${id}`

        )


        setAchievementData(

          achievementData.filter(

            (item) =>
              item._id !== id

          )

        )


        alert(
          'Achievement Deleted Successfully'
        )

      }

      catch (error) {

        console.log(
          'Delete Achievement Error:',
          error
        )


        alert(
          'Delete Failed'
        )

      }

    }


  // ======================================
  // EDIT ACHIEVEMENT
  // ======================================

  const editAchievement =
    (item) => {

      setFormData({

        studentName:
          item.studentName || '',

        course:
          item.course || '',

        rank:
          item.rank || '',

        marks:
          item.marks || '',

        // ==================================
        // IMPORTANT
        // Don't put existing image URL here
        // ==================================

        image: '',

        description:
          item.description || '',

      })


      setEditId(
        item._id
      )


      // Scroll to top
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
  // item.image = complete URL
  //
  // Old records:
  // item.image = /uploads/filename.jpg
  //
  // This helper supports BOTH.
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
          Achievement Management
        </h2>


        <p>
          Add and manage topper achievements.
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
                RANK
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Rank

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter rank"

                name="rank"

                value={
                  formData.rank
                }

                onChange={
                  handleChange
                }

                required

              />

            </div>


            {/* ==================================
                MARKS
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Marks

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter marks"

                name="marks"

                value={
                  formData.marks
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


              {/* Existing image notice */}

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

                placeholder="Write achievement details"

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
              SUBMIT BUTTON
          ====================================== */}

          <button

            type="submit"

            className="table-btn approve-btn"

          >

            {editId

              ? 'Update Achievement'

              : 'Add Achievement'

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

                  rank: '',

                  marks: '',

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
                Rank
              </th>

              <th>
                Marks
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {achievementData.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="text-center"
                >

                  No achievements found.

                </td>

              </tr>

            ) : (

              achievementData.map(
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
                        RANK
                    ================================== */}

                    <td>

                      {
                        item.rank
                      }

                    </td>


                    {/* ==================================
                        MARKS
                    ================================== */}

                    <td>

                      {
                        item.marks
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
                            editAchievement(
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
                            deleteAchievement(
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


export default Achievements