import { useEffect, useState } from 'react'

import axios from 'axios'

function Downloads() {

  const [downloads,
    setDownloads]

    = useState([])

  const [editId,
    setEditId]

    = useState(null)

  const [formData,
    setFormData]

    = useState({

      title: '',

      category: 'Study Material',

      description: '',

      file: null,

    })

  useEffect(() => {

    fetchDownloads()

  }, [])

  const fetchDownloads =
    async () => {

      try {

        const response =
          await axios.get(
            'https://eduportal-backend-m5t1.onrender.com/api/downloads'
          )

        setDownloads(
          response.data
        )

      } catch (error) {

        console.log(error)

      }

    }

  const handleChange =
    (e) => {

      setFormData({

        ...formData,

        [e.target.name]:
          e.target.value,

      })

    }

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      try {

        const data =
          new FormData()

        data.append(
          'title',
          formData.title
        )

        data.append(
          'category',
          formData.category
        )

        data.append(
          'description',
          formData.description
        )

        if (formData.file) {

          data.append(
            'file',
            formData.file
          )

        }

        if (editId) {

          await axios.put(

            `https://eduportal-backend-m5t1.onrender.com/api/downloads/${editId}`,

            data

          )

        }

        else {

          await axios.post(

            'https://eduportal-backend-m5t1.onrender.com/api/downloads',

            data

          )

        }

        setEditId(null)

        setFormData({

          title: '',

          category:
            'Study Material',

          description: '',

          file: null,

        })

        fetchDownloads()

      }

      catch (error) {

        console.log(error)

      }

    }

  const deleteDownload =
    async (id) => {

      try {

        await axios.delete(

          `https://eduportal-backend-m5t1.onrender.com/api/downloads/${id}`

        )

        fetchDownloads()

      }

      catch (error) {

        console.log(error)

      }

    }

  const editDownload =
    (item) => {

      setEditId(
        item._id
      )

      setFormData({

        title:
          item.title,

        category:
          item.category,

        description:
          item.description,

        file: null,

      })

    }

  return (

    <div className="applications-section">

      <div className="applications-header">

        <h2>
          Downloads Management
        </h2>

      </div>

      <form
        onSubmit={handleSubmit}
      >

        <div className="row">

          <div className="col-md-6 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />

          </div>

          <div className="col-md-6 mb-3">

            <select
              className="form-control"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >

              <option>
                Study Material
              </option>

              <option>
                Syllabus
              </option>

              <option>
                Resources
              </option>

              <option>
                Assignments
              </option>

            </select>

          </div>

          <div className="col-12 mb-3">

            <textarea
              className="form-control"
              rows="4"
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

          </div>

          <div className="col-12 mb-3">

            <input
              type="file"
              className="form-control"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>

                setFormData({

                  ...formData,

                  file:
                    e.target.files[0],

                })

              }
            />

          </div>

        </div>

        <button
          className="table-btn approve-btn"
        >

          {

            editId

              ? 'Update File'

              : 'Upload File'

          }

        </button>

      </form>

      <hr />

      <div className="table-responsive">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Title</th>

              <th>Category</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {

              downloads.map(

                (item) => (

                  <tr key={item._id}>

                    <td>
                      {item.title}
                    </td>

                    <td>
                      {item.category}
                    </td>

                    <td>

                      <button
                        className="table-btn approve-btn me-2"
                        onClick={() =>
                          editDownload(item)
                        }
                      >

                        Edit

                      </button>

                      <button
                        className="table-btn reject-btn"
                        onClick={() =>
                          deleteDownload(item._id)
                        }
                      >

                        Delete

                      </button>

                    </td>

                  </tr>

                )

              )

            }

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default Downloads