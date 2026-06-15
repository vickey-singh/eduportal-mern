import { useEffect, useState } from 'react'

import axios from 'axios'

function Notices() {

  // ======================================
  // STATE
  // ======================================

  const [noticeData,
    setNoticeData]

    = useState([])

  const [editId,
    setEditId]

    = useState(null)

  const [formData,
    setFormData]

    = useState({

      title: '',

      description: '',

      image: '',

      isImportant: false,

      isPinned: false,

    })

  // ======================================
  // FETCH NOTICES
  // ======================================

  useEffect(() => {

    fetchNotices()

  }, [])

  const fetchNotices =
    async () => {

      try {

        const response =
          await axios.get(
            'http://localhost:8000/api/notices'
          )

        setNoticeData(
          response.data
        )

      } catch (error) {

        console.log(error)

      }

    }

  // ======================================
  // HANDLE INPUT
  // ======================================

  const handleChange =
    (e) => {

      const {

        name,

        value,

        type,

        checked,

      } = e.target

      setFormData({

        ...formData,

        [name]:

          type === 'checkbox'

            ? checked

            : value,

      })

    }

  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      try {

        const noticeFormData =
          new FormData()

        noticeFormData.append(
          'title',
          formData.title
        )

        noticeFormData.append(
          'description',
          formData.description
        )

        noticeFormData.append(
          'isImportant',
          formData.isImportant
        )

        noticeFormData.append(
          'isPinned',
          formData.isPinned
        )

        if (formData.image) {

          noticeFormData.append(
            'image',
            formData.image
          )

        }

        if (editId) {

          await axios.put(

            `http://localhost:8000/api/notices/${editId}`,

            noticeFormData

          )

          alert(
            'Notice Updated Successfully'
          )

        }

        else {

          await axios.post(

            'http://localhost:8000/api/notices',

            noticeFormData

          )

          alert(
            'Notice Added Successfully'
          )

        }

        setEditId(null)

        setFormData({

          title: '',

          description: '',

          image: '',

          isImportant: false,

          isPinned: false,

        })

        fetchNotices()

      } catch (error) {

        console.log(error)

      }

    }

  // ======================================
  // DELETE
  // ======================================

  const deleteNotice =
    async (id) => {

      try {

        await axios.delete(

          `http://localhost:8000/api/notices/${id}`

        )

        fetchNotices()

      } catch (error) {

        console.log(error)

      }

    }

  // ======================================
  // EDIT
  // ======================================

  const editNotice =
    (notice) => {

      setEditId(
        notice._id
      )

      setFormData({

        title:
          notice.title,

        description:
          notice.description,

        image: '',

        isImportant:
          notice.isImportant,

        isPinned:
          notice.isPinned,

      })

    }

  return (

    <div className="applications-section">

      <div className="applications-header">

        <h2>
          Notice Management
        </h2>

        <p>
          Add and manage notices.
        </p>

      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="mb-5"
      >

        <div className="row">

          <div className="col-md-6 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Notice Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

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

          <div className="col-12 mb-3">

            <textarea
              className="form-control"
              rows="4"
              placeholder="Notice Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-3 mb-3">

            <label>

              <input
                type="checkbox"
                name="isImportant"
                checked={formData.isImportant}
                onChange={handleChange}
              />

              {' '}
              Important Notice

            </label>

          </div>

          <div className="col-md-3 mb-3">

            <label>

              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
              />

              {' '}
              Pin Notice

            </label>

          </div>

        </div>

        <button
          type="submit"
          className="table-btn approve-btn"
        >

          {editId
            ? 'Update Notice'
            : 'Add Notice'}

        </button>

      </form>

      {/* TABLE */}

      <div className="table-responsive">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Image</th>

              <th>Title</th>

              <th>Important</th>

              <th>Pinned</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {noticeData.map((item) => (

              <tr key={item._id}>

                <td>

                  {item.image && (

                    <img
                      src={`http://localhost:8000${item.image}`}
                      alt=""
                      width="60"
                    />

                  )}

                </td>

                <td>
                  {item.title}
                </td>

                <td>

                  {item.isImportant
                    ? 'Yes'
                    : 'No'}

                </td>

                <td>

                  {item.isPinned
                    ? 'Yes'
                    : 'No'}

                </td>

                <td>

                  <button
                    className="table-btn approve-btn me-2"
                    onClick={() =>
                      editNotice(item)
                    }
                  >

                    Edit

                  </button>

                  <button
                    className="table-btn reject-btn"
                    onClick={() =>
                      deleteNotice(item._id)
                    }
                  >

                    Delete

                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default Notices