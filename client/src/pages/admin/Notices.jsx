import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


// ======================================
// NOTICE MANAGEMENT
// ======================================

function Notices() {

  // ======================================
  // STATE
  // ======================================

  const [noticeData, setNoticeData] =
    useState([])


  const [editId, setEditId] =
    useState(null)


  const [loading, setLoading] =
    useState(false)


  const [formData, setFormData] =
    useState({

      title: '',

      description: '',

      image: null,

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

        setLoading(true)


        const response =
          await axios.get(
            `${API_URL}/notices`
          )


        setNoticeData(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        )

      }

      catch (error) {

        console.log(
          'Fetch Notices Error:',
          error
        )

      }

      finally {

        setLoading(false)

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


      setFormData(
        (previous) => ({

          ...previous,

          [name]:
            type === 'checkbox'
              ? checked
              : value,

        })
      )

    }


  // ======================================
  // HANDLE IMAGE
  // ======================================

  const handleImageChange =
    (e) => {

      const file =
        e.target.files?.[0] || null


      setFormData(
        (previous) => ({

          ...previous,

          image: file,

        })
      )

    }


  // ======================================
  // RESET FORM
  // ======================================

  const resetForm =
    () => {

      setEditId(null)


      setFormData({

        title: '',

        description: '',

        image: null,

        isImportant: false,

        isPinned: false,

      })


      // Reset file input

      const fileInput =
        document.getElementById(
          'noticeImage'
        )


      if (fileInput) {

        fileInput.value = ''

      }

    }


  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      // ======================================
      // VALIDATION
      // ======================================

      if (
        !formData.title.trim()
      ) {

        alert(
          'Please enter notice title.'
        )

        return

      }


      if (
        !formData.description.trim()
      ) {

        alert(
          'Please enter notice description.'
        )

        return

      }


      try {

        setLoading(true)


        // ======================================
        // FORM DATA
        // ======================================

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
          String(
            formData.isImportant
          )
        )


        noticeFormData.append(
          'isPinned',
          String(
            formData.isPinned
          )
        )


        // ======================================
        // IMAGE
        // ======================================

        if (
          formData.image
        ) {

          noticeFormData.append(
            'image',
            formData.image
          )

        }


        // ======================================
        // UPDATE
        // ======================================

        if (editId) {

          await axios.put(

            `${API_URL}/notices/${editId}`,

            noticeFormData

          )


          alert(
            'Notice Updated Successfully'
          )

        }


        // ======================================
        // ADD
        // ======================================

        else {

          await axios.post(

            `${API_URL}/notices`,

            noticeFormData

          )


          alert(
            'Notice Added Successfully'
          )

        }


        // ======================================
        // RESET
        // ======================================

        resetForm()


        // ======================================
        // REFRESH LIST
        // ======================================

        await fetchNotices()

      }

      catch (error) {

        console.log(
          'Notice Submit Error:',
          error
        )


        alert(
          error.response?.data?.message ||
          'Something went wrong while saving notice.'
        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // DELETE
  // ======================================

  const deleteNotice =
    async (id) => {

      const confirmDelete =
        window.confirm(
          'Are you sure you want to delete this notice?'
        )


      if (!confirmDelete) {

        return

      }


      try {

        setLoading(true)


        await axios.delete(

          `${API_URL}/notices/${id}`

        )


        alert(
          'Notice Deleted Successfully'
        )


        await fetchNotices()

      }

      catch (error) {

        console.log(
          'Delete Notice Error:',
          error
        )


        alert(
          error.response?.data?.message ||
          'Unable to delete notice.'
        )

      }

      finally {

        setLoading(false)

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
          notice.title || '',

        description:
          notice.description || '',

        // Existing image is NOT
        // put into file input.
        // New image can be selected
        // only if required.

        image: null,

        isImportant:
          Boolean(
            notice.isImportant
          ),

        isPinned:
          Boolean(
            notice.isPinned
          ),

      })


      // Scroll to form

      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      })

    }


  // ======================================
  // IMAGE URL
  // ======================================
  //
  // Used only for displaying the
  // existing image in admin table.
  //
  // Cloudinary URL:
  //     returned directly
  //
  // Old /uploads path:
  //     prepend API origin
  //
  // ======================================

  const getImageUrl =
    (image) => {

      if (!image) {

        return ''

      }


      // Cloudinary / external URL

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


      // Old local upload path

      const apiOrigin =
        API_URL.replace(
          /\/api$/,
          ''
        )


      return `${apiOrigin}${
        image.startsWith('/')
          ? image
          : `/${image}`
      }`

    }


  return (

    <div
      className="
        applications-section
      "
    >

      {/* ======================================
          HEADER
      ====================================== */}

      <div
        className="
          applications-header
        "
      >

        <h2>

          Notice Management

        </h2>


        <p>

          Add and manage notices.

        </p>

      </div>


      {/* ======================================
          FORM
      ====================================== */}

      <form
        onSubmit={
          handleSubmit
        }
        className="mb-5"
      >

        <div className="row">

          {/* TITLE */}

          <div
            className="
              col-md-6
              mb-3
            "
          >

            <input
              type="text"
              className="
                form-control
              "
              placeholder="
                Notice Title
              "
              name="title"
              value={
                formData.title
              }
              onChange={
                handleChange
              }
            />

          </div>


          {/* IMAGE */}

          <div
            className="
              col-md-6
              mb-3
            "
          >

            <input
              id="noticeImage"
              type="file"
              className="
                form-control
              "
              accept="
                image/jpeg,
                image/jpg,
                image/png,
                image/webp
              "
              onChange={
                handleImageChange
              }
            />


            <small
              className="
                text-muted
              "
            >

              JPG, JPEG, PNG or WEBP
              (Max 5MB)

            </small>

          </div>


          {/* DESCRIPTION */}

          <div
            className="
              col-12
              mb-3
            "
          >

            <textarea
              className="
                form-control
              "
              rows="4"
              placeholder="
                Notice Description
              "
              name="description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
            />

          </div>


          {/* IMPORTANT */}

          <div
            className="
              col-md-3
              mb-3
            "
          >

            <label>

              <input
                type="checkbox"
                name="isImportant"
                checked={
                  formData.isImportant
                }
                onChange={
                  handleChange
                }
              />

              {' '}

              Important Notice

            </label>

          </div>


          {/* PINNED */}

          <div
            className="
              col-md-3
              mb-3
            "
          >

            <label>

              <input
                type="checkbox"
                name="isPinned"
                checked={
                  formData.isPinned
                }
                onChange={
                  handleChange
                }
              />

              {' '}

              Pin Notice

            </label>

          </div>

        </div>


        {/* ======================================
            BUTTONS
        ====================================== */}

        <button
          type="submit"
          className="
            table-btn
            approve-btn
          "
          disabled={
            loading
          }
        >

          {
            loading
              ? 'Please Wait...'
              : editId
                ? 'Update Notice'
                : 'Add Notice'
          }

        </button>


        {
          editId && (

            <button
              type="button"
              className="
                table-btn
                reject-btn
                ms-2
              "
              onClick={
                resetForm
              }
              disabled={
                loading
              }
            >

              Cancel

            </button>

          )
        }

      </form>


      {/* ======================================
          TABLE
      ====================================== */}

      <div
        className="
          table-responsive
        "
      >

        <table
          className="
            table
            applications-table
          "
        >

          <thead>

            <tr>

              <th>
                Image
              </th>

              <th>
                Title
              </th>

              <th>
                Important
              </th>

              <th>
                Pinned
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {
              noticeData.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      text-center
                    "
                  >

                    {
                      loading
                        ? 'Loading Notices...'
                        : 'No Notices Found'
                    }

                  </td>

                </tr>

              ) : (

                noticeData.map(
                  (item) => (

                    <tr
                      key={
                        item._id
                      }
                    >

                      {/* IMAGE */}

                      <td>

                        {
                          item.image ? (

                            <img
                              src={
                                getImageUrl(
                                  item.image
                                )
                              }
                              alt={
                                item.title ||
                                'Notice'
                              }
                              width="60"
                              height="60"
                              style={{
                                objectFit:
                                  'cover',
                                borderRadius:
                                  '8px',
                              }}
                              onError={(
                                event
                              ) => {

                                event.currentTarget.style.display =
                                  'none'

                              }}
                            />

                          ) : (

                            <span
                              className="
                                text-muted
                              "
                            >

                              No Image

                            </span>

                          )
                        }

                      </td>


                      {/* TITLE */}

                      <td>

                        {
                          item.title
                        }

                      </td>


                      {/* IMPORTANT */}

                      <td>

                        {
                          item.isImportant
                            ? 'Yes'
                            : 'No'
                        }

                      </td>


                      {/* PINNED */}

                      <td>

                        {
                          item.isPinned
                            ? 'Yes'
                            : 'No'
                        }

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <button
                          type="button"
                          className="
                            table-btn
                            approve-btn
                            me-2
                          "
                          onClick={() =>
                            editNotice(
                              item
                            )
                          }
                          disabled={
                            loading
                          }
                        >

                          Edit

                        </button>


                        <button
                          type="button"
                          className="
                            table-btn
                            reject-btn
                          "
                          onClick={() =>
                            deleteNotice(
                              item._id
                            )
                          }
                          disabled={
                            loading
                          }
                        >

                          Delete

                        </button>

                      </td>

                    </tr>

                  )
                )

              )
            }

          </tbody>

        </table>

      </div>

    </div>

  )

}


export default Notices