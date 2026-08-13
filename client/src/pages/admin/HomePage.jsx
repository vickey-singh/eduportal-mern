import {
  useEffect,
  useState,
} from 'react'

import {
  getHomeSliders,
  addHomeSlider,
  updateHomeSlider,
  deleteHomeSlider,
} from '../../services/homeSliderService'

import {
  getSettings,
  updateSettings,
} from '../../services/settingsService'

import '../../assets/styles/admin.css'


// ======================================
// BACKEND URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function HomePage() {

  // ======================================
  // SLIDER FORM
  // ======================================

  const [sliderFormData, setSliderFormData] =
    useState({

      mediaType: 'image',

      media: '',

      title: '',

      description: '',

      isActive: true,

      order: 0,

    })


  // ======================================
  // SLIDER DATA
  // ======================================

  const [sliderData, setSliderData] =
    useState([])


  // ======================================
  // SLIDER EDIT ID
  // ======================================

  const [editSliderId, setEditSliderId] =
    useState(null)


  // ======================================
  // SETTINGS DATA
  // ======================================

  const [settings, setSettings] =
    useState(null)


  // ======================================
  // HOME PAGE FORM
  // ======================================

  const [homeFormData, setHomeFormData] =
    useState({

      aboutImage: '',

      directorName: '',

      directorDesignation: '',

      directorImage: '',

    })


  // ======================================
  // LOADING STATES
  // ======================================

  const [sliderLoading, setSliderLoading] =
    useState(false)


  const [homeLoading, setHomeLoading] =
    useState(false)


  // ======================================
  // LOAD HOME DATA
  // ======================================

  const fetchHomeData =
    async () => {

      try {

        setSliderLoading(true)

        setHomeLoading(true)


        // ==================================
        // GET SLIDERS
        // ==================================

        const sliderResponse =
          await getHomeSliders()


        setSliderData(
          sliderResponse.sliders || []
        )


        // ==================================
        // GET SETTINGS
        // ==================================

        const settingsResponse =
          await getSettings()


        setSettings(
          settingsResponse
        )


        setHomeFormData({

          aboutImage:
            '',

          directorName:
            settingsResponse?.directorName ||
            '',

          directorDesignation:
            settingsResponse?.directorDesignation ||
            '',

          directorImage:
            '',

        })

      }

      catch (error) {

        console.log(
          'Load Home Page Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Failed to load Home Page data'

        )

      }

      finally {

        setSliderLoading(false)

        setHomeLoading(false)

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    fetchHomeData()

  }, [])


  // ======================================
  // SLIDER INPUT CHANGE
  // ======================================

  const handleSliderChange =
    (e) => {

      const {
        name,
        value,
      } = e.target


      setSliderFormData({

        ...sliderFormData,

        [name]:
          value,

      })

    }


  // ======================================
  // SLIDER MEDIA TYPE
  // ======================================

  const handleMediaTypeChange =
    (e) => {

      setSliderFormData({

        ...sliderFormData,

        mediaType:
          e.target.value,

        media: '',

      })

    }


  // ======================================
  // SLIDER FILE
  // ======================================

  const handleSliderFileChange =
    (e) => {

      setSliderFormData({

        ...sliderFormData,

        media:
          e.target.files[0] || '',

      })

    }


  // ======================================
  // SLIDER ACTIVE
  // ======================================

  const handleSliderActiveChange =
    (e) => {

      setSliderFormData({

        ...sliderFormData,

        isActive:
          e.target.checked,

      })

    }


  // ======================================
  // RESET SLIDER FORM
  // ======================================

  const resetSliderForm =
    () => {

      setSliderFormData({

        mediaType: 'image',

        media: '',

        title: '',

        description: '',

        isActive: true,

        order: 0,

      })

      setEditSliderId(null)

    }


  // ======================================
  // ADD / UPDATE SLIDER
  // ======================================

  const handleSliderSubmit =
    async (e) => {

      e.preventDefault()


      // ==================================
      // NEW SLIDER FILE REQUIRED
      // ==================================

      if (
        !editSliderId &&
        !sliderFormData.media
      ) {

        alert(
          'Please select an image or video'
        )

        return

      }


      try {

        setSliderLoading(true)


        const formData =
          new FormData()


        formData.append(

          'mediaType',

          sliderFormData.mediaType

        )


        formData.append(

          'title',

          sliderFormData.title

        )


        formData.append(

          'description',

          sliderFormData.description

        )


        formData.append(

          'isActive',

          sliderFormData.isActive

        )


        formData.append(

          'order',

          sliderFormData.order

        )


        // ==================================
        // MEDIA
        // ==================================

        if (
          sliderFormData.media
        ) {

          formData.append(

            'media',

            sliderFormData.media

          )

        }


        // ==================================
        // UPDATE
        // ==================================

        if (editSliderId) {

          const response =
            await updateHomeSlider(

              editSliderId,

              formData

            )


          setSliderData(

            sliderData.map(

              (item) =>

                item._id === editSliderId

                  ? response.slider

                  : item

            )

          )


          alert(

            response.message ||

            'Home Slider Updated Successfully'

          )

        }


        // ==================================
        // ADD
        // ==================================

        else {

          const response =
            await addHomeSlider(
              formData
            )


          setSliderData([

            ...sliderData,

            response.slider,

          ])


          alert(

            response.message ||

            'Home Slider Added Successfully'

          )

        }


        resetSliderForm()

      }

      catch (error) {

        console.log(
          'Home Slider Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Home Slider Operation Failed'

        )

      }

      finally {

        setSliderLoading(false)

      }

    }


  // ======================================
  // EDIT SLIDER
  // ======================================

  const editSlider =
    (item) => {

      setSliderFormData({

        mediaType:
          item.mediaType || 'image',

        media: '',

        title:
          item.title || '',

        description:
          item.description || '',

        isActive:
          item.isActive !== false,

        order:
          item.order || 0,

      })


      setEditSliderId(
        item._id
      )


      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      })

    }


  // ======================================
  // DELETE SLIDER
  // ======================================

  const handleDeleteSlider =
    async (id) => {

      const confirmed =
        window.confirm(

          'Are you sure you want to delete this slider?'

        )


      if (!confirmed) {

        return

      }


      try {

        setSliderLoading(true)


        const response =
          await deleteHomeSlider(
            id
          )


        setSliderData(

          sliderData.filter(

            (item) =>
              item._id !== id

          )

        )


        alert(

          response.message ||

          'Home Slider Deleted Successfully'

        )

      }

      catch (error) {

        console.log(
          'Delete Slider Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Delete Failed'

        )

      }

      finally {

        setSliderLoading(false)

      }

    }


  // ======================================
  // HOME PAGE INPUT CHANGE
  // ======================================

  const handleHomeChange =
    (e) => {

      const {
        name,
        value,
      } = e.target


      setHomeFormData({

        ...homeFormData,

        [name]:
          value,

      })

    }


  // ======================================
  // ABOUT IMAGE CHANGE
  // ======================================

  const handleAboutImageChange =
    (e) => {

      setHomeFormData({

        ...homeFormData,

        aboutImage:
          e.target.files[0] || '',

      })

    }


  // ======================================
  // DIRECTOR IMAGE CHANGE
  // ======================================

  const handleDirectorImageChange =
    (e) => {

      setHomeFormData({

        ...homeFormData,

        directorImage:
          e.target.files[0] || '',

      })

    }


  // ======================================
  // SAVE ABOUT + DIRECTOR
  // ======================================

  const handleHomeSettingsSubmit =
    async (e) => {

      e.preventDefault()


      try {

        setHomeLoading(true)


        const formData =
          new FormData()


        // ==================================
        // DIRECTOR NAME
        // ==================================

        formData.append(

          'directorName',

          homeFormData.directorName

        )


        // ==================================
        // DIRECTOR DESIGNATION
        // ==================================

        formData.append(

          'directorDesignation',

          homeFormData.directorDesignation

        )


        // ==================================
        // ABOUT IMAGE
        // ==================================

        if (
          homeFormData.aboutImage
        ) {

          formData.append(

            'aboutImage',

            homeFormData.aboutImage

          )

        }


        // ==================================
        // DIRECTOR IMAGE
        // ==================================

        if (
          homeFormData.directorImage
        ) {

          formData.append(

            'directorImage',

            homeFormData.directorImage

          )

        }


        // ==================================
        // UPDATE SETTINGS
        // ==================================

        const response =
          await updateSettings(
            formData
          )


        // ==================================
        // UPDATE LOCAL SETTINGS
        // ==================================

        setSettings(
          response.settings
        )


        setHomeFormData({

          aboutImage: '',

          directorName:
            response.settings?.directorName ||
            '',

          directorDesignation:
            response.settings?.directorDesignation ||
            '',

          directorImage: '',

        })


        alert(

          response.message ||

          'Home Page Settings Updated Successfully'

        )

      }

      catch (error) {

        console.log(
          'Home Settings Update Error:',
          error
        )


        alert(

          error?.response?.data?.message ||

          'Home Page Settings Update Failed'

        )

      }

      finally {

        setHomeLoading(false)

      }

    }


  // ======================================
  // MEDIA URL
  // ======================================

  const getMediaUrl =
    (mediaUrl) => {

      if (!mediaUrl) {

        return ''

      }


      if (

        mediaUrl.startsWith(
          'http://'
        ) ||

        mediaUrl.startsWith(
          'https://'
        )

      ) {

        return mediaUrl

      }


      return `${API_BASE_URL}${

        mediaUrl.startsWith('/')

          ? mediaUrl

          : `/${mediaUrl}`

      }`

    }


  return (

    <div className="applications-section">


      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="applications-header">

        <h2>
          Home Page Management
        </h2>

        <p>

          Manage homepage slider,
          about section and
          director section.

        </p>

      </div>


      {/* ==================================================
          HERO SLIDER
      ================================================== */}

      <div className="admin-form-wrapper">

        <h4 className="mb-4">

          Hero Slider

        </h4>


        <form
          onSubmit={
            handleSliderSubmit
          }
        >

          <div className="row">


            {/* ==================================
                MEDIA TYPE
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Media Type

              </label>


              <select

                className="form-select"

                name="mediaType"

                value={
                  sliderFormData.mediaType
                }

                onChange={
                  handleMediaTypeChange
                }

              >

                <option value="image">

                  Image

                </option>

                <option value="video">

                  Video

                </option>

              </select>

            </div>


            {/* ==================================
                DISPLAY ORDER
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Display Order

              </label>


              <input

                type="number"

                className="form-control"

                name="order"

                min="0"

                value={
                  sliderFormData.order
                }

                onChange={
                  handleSliderChange
                }

              />

            </div>


            {/* ==================================
                TITLE
            ================================== */}

            <div className="col-12 mb-3">

              <label className="form-label">

                Title

              </label>


              <input

                type="text"

                className="form-control"

                name="title"

                placeholder="Enter slider title"

                value={
                  sliderFormData.title
                }

                onChange={
                  handleSliderChange
                }

              />

            </div>


            {/* ==================================
                DESCRIPTION
            ================================== */}

            <div className="col-12 mb-3">

              <label className="form-label">

                Description

              </label>


              <textarea

                className="form-control"

                rows="3"

                name="description"

                placeholder="Enter slider description"

                value={
                  sliderFormData.description
                }

                onChange={
                  handleSliderChange
                }

              ></textarea>

            </div>


            {/* ==================================
                MEDIA
            ================================== */}

            <div className="col-12 mb-3">

              <label className="form-label">

                {sliderFormData.mediaType === 'video'

                  ? 'Upload Video'

                  : 'Upload Image'

                }

              </label>


              <input

                type="file"

                className="form-control"

                name="media"

                accept={

                  sliderFormData.mediaType === 'video'

                    ? 'video/mp4,video/webm,video/quicktime'

                    : 'image/jpeg,image/png,image/jpg,image/webp'

                }

                onChange={
                  handleSliderFileChange
                }

              />


              {editSliderId && (

                <small className="text-muted">

                  Leave empty to keep
                  existing media.

                </small>

              )}

            </div>


            {/* ==================================
                ACTIVE
            ================================== */}

            <div className="col-12 mb-4">

              <div className="form-check">

                <input

                  type="checkbox"

                  className="form-check-input"

                  id="sliderActive"

                  checked={
                    sliderFormData.isActive
                  }

                  onChange={
                    handleSliderActiveChange
                  }

                />


                <label

                  className="form-check-label"

                  htmlFor="sliderActive"

                >

                  Active on Home Page

                </label>

              </div>

            </div>

          </div>


          {/* ==================================
              SUBMIT
          ================================== */}

          <button

            type="submit"

            className="table-btn approve-btn"

            disabled={
              sliderLoading
            }

          >

            {sliderLoading

              ? 'Please Wait...'

              : editSliderId

              ? 'Update Slider'

              : 'Add Slider'

            }

          </button>


          {editSliderId && (

            <button

              type="button"

              className="table-btn reject-btn ms-2"

              onClick={
                resetSliderForm
              }

              disabled={
                sliderLoading
              }

            >

              Cancel

            </button>

          )}

        </form>

      </div>


      {/* ==================================================
          SLIDER LIST
      ================================================== */}

      <div className="table-responsive mt-5">

        <table className="table applications-table">

          <thead>

            <tr>

              <th>
                Preview
              </th>

              <th>
                Type
              </th>

              <th>
                Title
              </th>

              <th>
                Order
              </th>

              <th>
                Status
              </th>

              <th>
                Action
              </th>

            </tr>

          </thead>


          <tbody>

            {sliderData.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="text-center"
                >

                  No home sliders found.

                </td>

              </tr>

            ) : (

              sliderData.map(

                (item) => (

                  <tr
                    key={
                      item._id
                    }
                  >

                    {/* ==============================
                        PREVIEW
                    ============================== */}

                    <td>

                      {item.mediaType === 'video' ? (

                        <video

                          src={
                            getMediaUrl(
                              item.mediaUrl
                            )
                          }

                          width="120"

                          height="70"

                          muted

                          controls

                          style={{

                            objectFit:
                              'cover',

                            borderRadius:
                              '8px',

                          }}

                        />

                      ) : (

                        <img

                          src={
                            getMediaUrl(
                              item.mediaUrl
                            )
                          }

                          alt={
                            item.title ||
                            'Home Slider'
                          }

                          width="120"

                          height="70"

                          style={{

                            objectFit:
                              'cover',

                            borderRadius:
                              '8px',

                          }}

                        />

                      )}

                    </td>


                    {/* ==============================
                        TYPE
                    ============================== */}

                    <td>

                      {item.mediaType}

                    </td>


                    {/* ==============================
                        TITLE
                    ============================== */}

                    <td>

                      {
                        item.title ||
                        '-'
                      }

                    </td>


                    {/* ==============================
                        ORDER
                    ============================== */}

                    <td>

                      {
                        item.order
                      }

                    </td>


                    {/* ==============================
                        STATUS
                    ============================== */}

                    <td>

                      {item.isActive ? (

                        <span className="badge bg-success">

                          Active

                        </span>

                      ) : (

                        <span className="badge bg-secondary">

                          Inactive

                        </span>

                      )}

                    </td>


                    {/* ==============================
                        ACTION
                    ============================== */}

                    <td>

                      <div className="d-flex gap-2">

                        <button

                          type="button"

                          className="table-btn approve-btn"

                          onClick={() =>
                            editSlider(
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
                            handleDeleteSlider(
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


      {/* ==================================================
          ABOUT SECTION
      ================================================== */}

      <div className="admin-form-wrapper mt-5">

        <h4 className="mb-4">

          About Section

        </h4>


        <form
          onSubmit={
            handleHomeSettingsSubmit
          }
        >

          <div className="row">


            {/* ==================================
                CURRENT ABOUT IMAGE
            ================================== */}

            <div className="col-md-5 mb-4">

              <label className="form-label">

                Current About Image

              </label>


              <div>

                {settings?.aboutImage ? (

                  <img

                    src={
                      getMediaUrl(
                        settings.aboutImage
                      )
                    }

                    alt="About"

                    style={{

                      width: '220px',

                      height: '150px',

                      objectFit: 'cover',

                      borderRadius: '10px',

                      border:
                        '1px solid #ddd',

                    }}

                  />

                ) : (

                  <div

                    className="text-muted p-4"

                    style={{

                      border:
                        '1px dashed #ccc',

                      borderRadius:
                        '10px',

                    }}

                  >

                    About image not
                    available.

                  </div>

                )}

              </div>

            </div>


            {/* ==================================
                NEW ABOUT IMAGE
            ================================== */}

            <div className="col-md-7 mb-4">

              <label className="form-label">

                Change About Image

              </label>


              <input

                type="file"

                className="form-control"

                accept="image/jpeg,image/png,image/jpg,image/webp"

                onChange={
                  handleAboutImageChange
                }

              />


              <small className="text-muted">

                Leave empty to keep
                existing image.

              </small>

            </div>

          </div>


          {/* ======================================
              SAVE ABOUT
          ====================================== */}

          <button

            type="submit"

            className="table-btn approve-btn"

            disabled={
              homeLoading
            }

          >

            {homeLoading

              ? 'Please Wait...'

              : 'Save About Image'

            }

          </button>

        </form>

      </div>


      {/* ==================================================
          DIRECTOR SECTION
      ================================================== */}

      <div className="admin-form-wrapper mt-5">

        <h4 className="mb-4">

          Principal / Director Section

        </h4>


        <form
          onSubmit={
            handleHomeSettingsSubmit
          }
        >

          <div className="row">


            {/* ==================================
                DIRECTOR NAME
            ================================== */}

            <div className="col-md-6 mb-3">

              <label className="form-label">

                Name

              </label>


              <input

                type="text"

                className="form-control"

                name="directorName"

                placeholder="Enter Director Name"

                value={
                  homeFormData.directorName
                }

                onChange={
                  handleHomeChange
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

                name="directorDesignation"

                placeholder="Director / Principal"

                value={
                  homeFormData.directorDesignation
                }

                onChange={
                  handleHomeChange
                }

                required

              />

            </div>


            {/* ==================================
                CURRENT DIRECTOR IMAGE
            ================================== */}

            <div className="col-md-5 mb-4">

              <label className="form-label">

                Current Image

              </label>


              <div>

                {settings?.directorImage ? (

                  <img

                    src={
                      getMediaUrl(
                        settings.directorImage
                      )
                    }

                    alt="Director"

                    style={{

                      width: '160px',

                      height: '160px',

                      objectFit: 'cover',

                      borderRadius: '50%',

                      border:
                        '3px solid #00adb5',

                    }}

                  />

                ) : (

                  <div

                    className="text-muted p-4"

                    style={{

                      border:
                        '1px dashed #ccc',

                      borderRadius:
                        '10px',

                    }}

                  >

                    Director image not
                    available.

                  </div>

                )}

              </div>

            </div>


            {/* ==================================
                NEW DIRECTOR IMAGE
            ================================== */}

            <div className="col-md-7 mb-4">

              <label className="form-label">

                Change Director Image

              </label>


              <input

                type="file"

                className="form-control"

                accept="image/jpeg,image/png,image/jpg,image/webp"

                onChange={
                  handleDirectorImageChange
                }

              />


              <small className="text-muted">

                Leave empty to keep
                existing image.

              </small>

            </div>

          </div>


          {/* ======================================
              SAVE DIRECTOR
          ====================================== */}

          <button

            type="submit"

            className="table-btn approve-btn"

            disabled={
              homeLoading
            }

          >

            {homeLoading

              ? 'Please Wait...'

              : 'Save Director Changes'

            }

          </button>

        </form>

      </div>


    </div>

  )

}


export default HomePage