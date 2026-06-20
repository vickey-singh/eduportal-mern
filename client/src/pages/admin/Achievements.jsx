import { useState, useEffect } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'

function Achievements() {

  // ======================================
  // STATE
  // ======================================

  const [formData, setFormData]
    = useState({

      studentName: '',

      course: '',

      rank: '',

      marks: '',

      image: '',

      description: '',

    })

  const [achievementData,
    setAchievementData]

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

        if (formData.image) {

          achievementFormData.append(
            'image',
            formData.image
          )

        }

        let response

        // ======================================
        // UPDATE ACHIEVEMENT
        // ======================================

        if (editId) {

          response =
            await axios.put(

              `https://eduportal-backend-m5t1.onrender.com/api/achievements/${editId}`,

              achievementFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          // Update UI
          setAchievementData(

            achievementData.map((item) =>

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

        // ======================================
        // ADD ACHIEVEMENT
        // ======================================

        else {

          response =
            await axios.post(

              'https://eduportal-backend-m5t1.onrender.com/api/achievements',

              achievementFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          // Add New Achievement
          setAchievementData([

            response.data.achievement,

            ...achievementData,

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

          rank: '',

          marks: '',

          image: '',

          description: '',

        })

      } catch (error) {

        console.log(error)

        alert('Achievement Operation Failed')

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
              'https://eduportal-backend-m5t1.onrender.com/api/achievements'
            )

          setAchievementData(
            response.data
          )

        } catch (error) {

          console.log(error)

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
          `https://eduportal-backend-m5t1.onrender.com/api/achievements/${id}`
        )

        setAchievementData(

          achievementData.filter(
            (item) => item._id !== id
          )

        )

        alert(
          'Achievement Deleted Successfully'
        )

      } catch (error) {

        console.log(error)

        alert('Delete Failed')

      }

    }

  // ======================================
  // EDIT ACHIEVEMENT
  // ======================================

  const editAchievement =
    (item) => {

      setFormData({

        studentName:
          item.studentName,

        course:
          item.course,

        rank:
          item.rank,

        marks:
          item.marks,

        image: '',

        description:
          item.description,

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

            {/* Rank */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Rank
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter rank"
                name="rank"
                value={formData.rank}
                onChange={handleChange}
              />

            </div>

            {/* Marks */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Marks
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter marks"
                name="marks"
                value={formData.marks}
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

            {/* Description */}
            <div className="col-12 mb-4">

              <label className="form-label">
                Description
              </label>

              <textarea
                className="form-control"
                rows="5"
                placeholder="Write achievement details"
                name="description"
                value={formData.description}
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
              ? 'Update Achievement'
              : 'Add Achievement'}

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

              <th>Rank</th>

              <th>Marks</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {achievementData.map((item) => (

              <tr key={item._id}>

                {/* Image */}
                <td>

                  <img
                    src={`https://eduportal-backend-m5t1.onrender.com${item.image}`}
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

                {/* Rank */}
                <td>
                  {item.rank}
                </td>

                {/* Marks */}
                <td>
                  {item.marks}
                </td>

                {/* Actions */}
                <td>

                  <div className="d-flex gap-2">

                    <button
                      className="table-btn approve-btn"
                      onClick={() =>
                        editAchievement(item)
                      }
                    >

                      Edit

                    </button>

                    <button
                      className="table-btn reject-btn"
                      onClick={() =>
                        deleteAchievement(item._id)
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

export default Achievements