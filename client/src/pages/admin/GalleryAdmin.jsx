import { useState, useEffect } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'

function GalleryAdmin() {

  // ======================================
  // STATE
  // ======================================

  const [formData, setFormData]
    = useState({

      title: '',

      image: '',

    })

  const [galleryData,
    setGalleryData]

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

        const galleryFormData =
          new FormData()

        galleryFormData.append(
          'title',
          formData.title
        )

        if (formData.image) {

          galleryFormData.append(
            'image',
            formData.image
          )

        }

        let response

        // ======================================
        // UPDATE GALLERY
        // ======================================

        if (editId) {

          response =
            await axios.put(

              `https://eduportal-backend-m5t1.onrender.com/api/gallery/${editId}`,

              galleryFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          // Update UI
          setGalleryData(

            galleryData.map((item) =>

              item._id === editId
                ? response.data.gallery
                : item

            )

          )

          alert(
            'Gallery Updated Successfully'
          )

          setEditId(null)

        }

        // ======================================
        // ADD GALLERY
        // ======================================

        else {

          response =
            await axios.post(

              'https://eduportal-backend-m5t1.onrender.com/api/gallery',

              galleryFormData,

              {
                headers: {
                  'Content-Type':
                    'multipart/form-data',
                },
              }

            )

          // Add New Gallery
          setGalleryData([

            response.data.gallery,

            ...galleryData,

          ])

          alert(
            response.data.message
          )

        }

        // ======================================
        // RESET FORM
        // ======================================

        setFormData({

          title: '',

          image: '',

        })

      } catch (error) {

        console.log(error)

        alert('Gallery Operation Failed')

      }

    }

  // ======================================
  // FETCH GALLERY
  // ======================================

  useEffect(() => {

    const fetchGallery =
      async () => {

        try {

          const response =
            await axios.get(
              'https://eduportal-backend-m5t1.onrender.com/api/gallery'
            )

          setGalleryData(
            response.data
          )

        } catch (error) {

          console.log(error)

        }

      }

    fetchGallery()

  }, [])

  // ======================================
  // DELETE GALLERY
  // ======================================

  const deleteGallery =
    async (id) => {

      try {

        await axios.delete(
          `https://eduportal-backend-m5t1.onrender.com/api/gallery/${id}`
        )

        setGalleryData(

          galleryData.filter(
            (item) => item._id !== id
          )

        )

        alert(
          'Gallery Deleted Successfully'
        )

      } catch (error) {

        console.log(error)

        alert('Delete Failed')

      }

    }

  // ======================================
  // EDIT GALLERY
  // ======================================

  const editGallery =
    (item) => {

      setFormData({

        title:
          item.title,

        image: '',

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
          Gallery Management
        </h2>

        <p>
          Add and manage gallery images.
        </p>

      </div>

      {/* ====================================== */}
      {/* FORM */}
      {/* ====================================== */}

      <div className="admin-form-wrapper">

        <form onSubmit={handleSubmit}>

          <div className="row">

            {/* Title */}
            <div className="col-12 mb-3">

              <label className="form-label">
                Image Title
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter image title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />

            </div>

            {/* Image */}
            <div className="col-12 mb-4">

              <label className="form-label">
                Upload Image
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

          </div>

          {/* Submit */}
          <button
            type="submit"
            className="table-btn approve-btn"
          >

            {editId
              ? 'Update Image'
              : 'Add Image'}

          </button>

        </form>

      </div>

      {/* ====================================== */}
      {/* GALLERY TABLE */}
      {/* ====================================== */}

      <div className="table-responsive mt-5">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>Image</th>

              <th>Title</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {galleryData.map((item) => (

              <tr key={item._id}>

                {/* Image */}
                <td>

                  <img
                    src={`https://eduportal-backend-m5t1.onrender.com${item.image}`}
                    alt={item.title}
                    width="80"
                    height="60"
                    style={{
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />

                </td>

                {/* Title */}
                <td>
                  {item.title}
                </td>

                {/* Actions */}
                <td>

                  <div className="d-flex gap-2">

                    <button
                      className="table-btn approve-btn"
                      onClick={() =>
                        editGallery(item)
                      }
                    >

                      Edit

                    </button>

                    <button
                      className="table-btn reject-btn"
                      onClick={() =>
                        deleteGallery(item._id)
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

export default GalleryAdmin