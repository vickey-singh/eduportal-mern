import { useState, useEffect } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'

function Faculty() {

  // ======================================
  // STATE
  // ======================================

  const [formData, setFormData]
    = useState({

      name: '',

      designation: '',

      experience: '',

      subject: '',

      image: '',

      description: '',

    })

  const [facultyData, setFacultyData]
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
        // CREATE FORMDATA
        // ======================================

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

        // Image Optional
        if (formData.image) {

          facultyFormData.append(
            'image',
            formData.image
          )

        }

        let response

        // ======================================
        // UPDATE FACULTY
        // ======================================

        if (editId) {

          response =
            await axios.put(

              `http://localhost:8000/api/faculty/${editId}`,

              facultyFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          // Update UI
          setFacultyData(

            facultyData.map((item) =>

              item._id === editId
                ? response.data.faculty
                : item

            )

          )

          alert(
            'Faculty Updated Successfully'
          )

          // Reset Edit ID
          setEditId(null)

        }

        // ======================================
        // ADD FACULTY
        // ======================================

        else {

          response =
            await axios.post(

              'http://localhost:8000/api/faculty',

              facultyFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          // Add New Faculty To UI
          setFacultyData([

            response.data.faculty,

            ...facultyData,

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

          designation: '',

          experience: '',

          subject: '',

          image: '',

          description: '',

        })

      } catch (error) {

        console.log(error)

        alert('Faculty Operation Failed')

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
              'http://localhost:8000/api/faculty'
            )

          setFacultyData(
            response.data
          )

        } catch (error) {

          console.log(error)

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
          `http://localhost:8000/api/faculty/${id}`
        )

        // Remove From UI
        setFacultyData(

          facultyData.filter(
            (item) => item._id !== id
          )

        )

        alert(
          'Faculty Deleted Successfully'
        )

      } catch (error) {

        console.log(error)

        alert('Delete Failed')

      }

    }

  // ======================================
  // EDIT FACULTY
  // ======================================

  const editFaculty = (item) => {

    setFormData({

      name: item.name,

      designation: item.designation,

      experience: item.experience,

      subject: item.subject,

      image: '',

      description: item.description,

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

        <form onSubmit={handleSubmit}>

          <div className="row">

            {/* Name */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Faculty Name
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter faculty name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />

            </div>

            {/* Designation */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Designation
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />

            </div>

            {/* Experience */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Experience
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
              />

            </div>

            {/* Subject */}
            <div className="col-md-6 mb-3">

              <label className="form-label">
                Subject
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />

            </div>

            {/* Faculty Image */}
            <div className="col-12 mb-3">

              <label className="form-label">
                Upload Faculty Image
              </label>

              <input
                type="file"
                className="form-control"
                name="image"
                onChange={(e) =>

                  setFormData({

                    ...formData,

                    image: e.target.files[0],

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
                placeholder="Write faculty description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>

            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="table-btn approve-btn"
          >

            {editId
              ? 'Update Faculty'
              : 'Add Faculty'}

          </button>

        </form>

      </div>

      {/* ====================================== */}
      {/* FACULTY TABLE */}
      {/* ====================================== */}

      <div className="table-responsive mt-5">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Image</th>

              <th>Name</th>

              <th>Subject</th>

              <th>Experience</th>

              <th>Designation</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {facultyData.map((item) => (

              <tr key={item._id}>

                {/* Image */}
                <td>

                  <img
                    src={`http://localhost:8000${item.image}`}
                    alt={item.name}
                    width="60"
                    height="60"
                    style={{
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />

                </td>

                {/* Name */}
                <td>{item.name}</td>

                {/* Subject */}
                <td>{item.subject}</td>

                {/* Experience */}
                <td>{item.experience}</td>

                {/* Designation */}
                <td>{item.designation}</td>

                {/* Actions */}
                <td>

                  <div className="d-flex gap-2">

                    <button
                      className="table-btn approve-btn"
                      onClick={() =>
                        editFaculty(item)
                      }
                    >

                      Edit

                    </button>

                    <button
                      className="table-btn reject-btn"
                      onClick={() =>
                        deleteFaculty(item._id)
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

export default Faculty