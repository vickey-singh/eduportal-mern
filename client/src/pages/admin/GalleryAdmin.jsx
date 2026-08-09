import { useState, useEffect } from 'react'

import axios from 'axios'

import '../../assets/styles/admin.css'


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function GalleryAdmin() {

  // ======================================
  // STATE
  // ======================================

  const [formData, setFormData] =
    useState({

      title: '',

      image: '',

    })


  const [galleryData, setGalleryData] =
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

        const galleryFormData =
          new FormData()


        galleryFormData.append(
          'title',
          formData.title
        )


        // ==================================
        // IMAGE
        // ==================================

        if (
          formData.image
        ) {

          galleryFormData.append(
            'image',
            formData.image
          )

        }


        let response


        // ==================================
        // UPDATE GALLERY
        // ==================================

        if (editId) {

          response =
            await axios.put(

              `${API_BASE_URL}/api/gallery/${editId}`,

              galleryFormData,

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

          setGalleryData(

            galleryData.map(
              (item) =>

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


        // ==================================
        // ADD GALLERY
        // ==================================

        else {

          response =
            await axios.post(

              `${API_BASE_URL}/api/gallery`,

              galleryFormData,

              {

                headers: {

                  'Content-Type':
                    'multipart/form-data',

                },

              }

            )


          // ==================================
          // ADD NEW GALLERY
          // ==================================

          setGalleryData([

            response.data.gallery,

            ...galleryData,

          ])


          alert(

            response.data.message ||

            'Gallery Added Successfully'

          )

        }


        // ==================================
        // RESET FORM
        // ==================================

        setFormData({

          title: '',

          image: '',

        })

      }

      catch (error) {

        console.log(
          'Gallery Operation Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Gallery Operation Failed'

        )

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

              `${API_BASE_URL}/api/gallery`

            )


          setGalleryData(
            response.data
          )

        }

        catch (error) {

          console.log(
            'Fetch Gallery Error:',
            error
          )

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

          `${API_BASE_URL}/api/gallery/${id}`

        )


        setGalleryData(

          galleryData.filter(

            (item) =>
              item._id !== id

          )

        )


        alert(
          'Gallery Deleted Successfully'
        )

      }

      catch (error) {

        console.log(
          'Delete Gallery Error:',
          error
        )


        alert(
          'Delete Failed'
        )

      }

    }


  // ======================================
  // EDIT GALLERY
  // ======================================

  const editGallery =
    (item) => {

      setFormData({

        title:
          item.title || '',

        // ==================================
        // IMPORTANT
        // Don't put existing image URL here
        // ==================================

        image: '',

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

        <form
          onSubmit={handleSubmit}
        >

          <div className="row">


            {/* ==================================
                TITLE
            ================================== */}

            <div className="col-12 mb-3">

              <label className="form-label">

                Image Title

              </label>


              <input

                type="text"

                className="form-control"

                placeholder="Enter image title"

                name="title"

                value={
                  formData.title
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

            <div className="col-12 mb-4">

              <label className="form-label">

                Upload Image

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

          </div>


          {/* ======================================
              SUBMIT
          ====================================== */}

          <button

            type="submit"

            className="table-btn approve-btn"

          >

            {editId

              ? 'Update Image'

              : 'Add Image'

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

                  title: '',

                  image: '',

                })

              }}

            >

              Cancel

            </button>

          )}

        </form>

      </div>


      {/* ====================================== */}
      {/* GALLERY TABLE */}
      {/* ====================================== */}

      <div className="table-responsive mt-5">

        <table className="table applications-table">


          <thead>

            <tr>

              <th>
                Image
              </th>

              <th>
                Title
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {galleryData.length === 0 ? (

              <tr>

                <td
                  colSpan="3"
                  className="text-center"
                >

                  No gallery images found.

                </td>

              </tr>

            ) : (

              galleryData.map(
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
                          item.title
                        }

                        width="80"

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
                        TITLE
                    ================================== */}

                    <td>

                      {
                        item.title
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
                            editGallery(
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
                            deleteGallery(
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


export default GalleryAdmin