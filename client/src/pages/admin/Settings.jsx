import {
  useEffect,
  useState,
} from 'react'

import axios from 'axios'

import {
  getSettings,
  updateSettings,
} from '../../services/settingsService'


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function Settings() {

  // ======================================
  // WEBSITE SETTINGS
  // ======================================

  const [formData, setFormData] =
    useState({

      instituteName: '',

      phone: '',

      email: '',

      address: '',

      googleMapUrl: '',

      instagram: '',

      youtube: '',

      linkedin: '',

      twitter: '',

      logo: null,

    })


  // ======================================
  // ORIGINAL SETTINGS
  // ======================================
  //
  // Used to detect which fields changed.
  //
  // Only changed fields will be sent
  // to the backend.
  // ======================================

  const [initialFormData, setInitialFormData] =
    useState({

      instituteName: '',

      phone: '',

      email: '',

      address: '',

      googleMapUrl: '',

      instagram: '',

      youtube: '',

      linkedin: '',

      twitter: '',

    })


  // ======================================
  // EXISTING LOGO
  // ======================================

  const [existingLogo, setExistingLogo] =
    useState('')


  // ======================================
  // ADMIN ACCOUNT
  // ======================================

  const [accountData, setAccountData] =
    useState({

      currentEmail: '',

      newEmail: '',

      currentPassword: '',

      newPassword: '',

      confirmPassword: '',

    })


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(false)


  // ======================================
  // FETCH SETTINGS ON LOAD
  // ======================================

  useEffect(() => {

    fetchSettings()

  }, [])


  // ======================================
  // FETCH SETTINGS
  // ======================================

  const fetchSettings =
    async () => {

      try {

        const settings =
          await getSettings()


        // ==================================
        // LOADED SETTINGS
        // ==================================

        const loadedSettings = {

          instituteName:
            settings.instituteName || '',

          phone:
            settings.phone || '',

          email:
            settings.email || '',

          address:
            settings.address || '',

          googleMapUrl:
            settings.googleMapUrl || '',

          instagram:
            settings.instagram || '',

          youtube:
            settings.youtube || '',

          linkedin:
            settings.linkedin || '',

          twitter:
            settings.twitter || '',

        }


        // ==================================
        // FORM DATA
        // ==================================

        setFormData({

          ...loadedSettings,

          logo: null,

        })


        // ==================================
        // SAVE ORIGINAL VALUES
        // ==================================
        //
        // These values will be compared
        // when Save Settings is clicked.
        // ==================================

        setInitialFormData(
          loadedSettings
        )


        // ==================================
        // EXISTING LOGO
        // ==================================

        setExistingLogo(
          settings.logo || ''
        )

      }

      catch (error) {

        console.log(
          'Fetch Settings Error:',
          error
        )

      }

    }


  // ======================================
  // IMAGE URL
  // ======================================
  //
  // Cloudinary:
  //     complete URL
  //
  // Old local upload:
  //     /uploads/filename
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


  // ======================================
  // HANDLE SETTINGS INPUT
  // ======================================

  const handleChange =
    (e) => {

      const {
        name,
        value,
      } = e.target


      setFormData(
        (previous) => ({

          ...previous,

          [name]:
            value,

        })
      )

    }


  // ======================================
  // HANDLE SETTINGS SUBMIT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      try {

        setLoading(true)


        const data =
          new FormData()


        // ==================================
        // SETTINGS TEXT FIELDS
        // ==================================

        const fields = [

          'instituteName',

          'phone',

          'email',

          'address',

          'googleMapUrl',

          'instagram',

          'youtube',

          'linkedin',

          'twitter',

        ]


        // ==================================
        // ONLY CHANGED FIELDS
        // ==================================
        //
        // If value has changed, send it.
        //
        // If value has not changed,
        // don't send it.
        //
        // This prevents existing settings
        // from being overwritten.
        // ==================================

        fields.forEach(
          (field) => {

            if (
              formData[field] !==
              initialFormData[field]
            ) {

              data.append(
                field,
                formData[field]
              )

            }

          }
        )


        // ==================================
        // LOGO
        // ==================================
        //
        // Only send logo if a new file
        // has actually been selected.
        // ==================================

        if (
          formData.logo
        ) {

          data.append(
            'logo',
            formData.logo
          )

        }


        // ==================================
        // UPDATE SETTINGS
        // ==================================

        await updateSettings(
          data
        )


        // ==================================
        // SUCCESS
        // ==================================

        alert(
          'Settings Updated Successfully'
        )


        // ==================================
        // FETCH UPDATED SETTINGS
        // ==================================

        await fetchSettings()

      }

      catch (error) {

        console.log(
          'Update Settings Error:',
          error
        )


        alert(

          error.response?.data?.message ||

          'Settings Update Failed'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // HANDLE ACCOUNT INPUT
  // ======================================

  const handleAccountChange =
    (e) => {

      setAccountData(
        (previous) => ({

          ...previous,

          [e.target.name]:
            e.target.value,

        })
      )

    }


  // ======================================
  // HANDLE ACCOUNT SUBMIT
  // ======================================

  const handleAccountSubmit =
    async (e) => {

      e.preventDefault()


      // ==================================
      // PASSWORD MATCH
      // ==================================

      if (

        accountData.newPassword &&

        accountData.newPassword !==
        accountData.confirmPassword

      ) {

        alert(
          'Passwords Do Not Match'
        )

        return

      }


      try {

        const response =
          await axios.put(

            `${API_BASE_URL}/api/account-settings`,

            {

              currentEmail:
                accountData.currentEmail,

              newEmail:
                accountData.newEmail,

              currentPassword:
                accountData.currentPassword,

              newPassword:
                accountData.newPassword,

            }

          )


        alert(
          response.data.message
        )


        // ==================================
        // RESET ACCOUNT FORM
        // ==================================

        setAccountData({

          currentEmail: '',

          newEmail: '',

          currentPassword: '',

          newPassword: '',

          confirmPassword: '',

        })

      }

      catch (error) {

        console.log(
          'Account Update Error:',
          error
        )


        alert(

          error.response?.data?.message ||

          'Update Failed'

        )

      }

    }


  return (

    <div className="applications-section">


      {/* ====================================== */}
      {/* PAGE HEADER */}
      {/* ====================================== */}

      <div className="applications-header">

        <h2>
          Website Settings
        </h2>

        <p>
          Manage your institute information,
          logo and social media links.
        </p>

      </div>


      {/* ====================================== */}
      {/* WEBSITE SETTINGS FORM */}
      {/* ====================================== */}

      <form
        onSubmit={handleSubmit}
      >

        <div className="row">


          {/* ==================================
              INSTITUTE NAME
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              Institute Name

            </label>


            <input

              type="text"

              className="form-control"

              placeholder="Institute Name"

              name="instituteName"

              value={
                formData.instituteName
              }

              onChange={
                handleChange
              }

            />

          </div>


          {/* ==================================
              PHONE
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              Phone Number

            </label>


            <input

              type="text"

              className="form-control"

              placeholder="Phone Number"

              name="phone"

              value={
                formData.phone
              }

              onChange={
                handleChange
              }

            />

          </div>


          {/* ==================================
              EMAIL
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              Email

            </label>


            <input

              type="email"

              className="form-control"

              placeholder="Email"

              name="email"

              value={
                formData.email
              }

              onChange={
                handleChange
              }

            />

          </div>


          {/* ==================================
              LOGO
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              Institute Logo

            </label>


            <input

              type="file"

              className="form-control"

              accept="image/*"

              onChange={(e) => {

                setFormData(
                  (previous) => ({

                    ...previous,

                    logo:
                      e.target.files?.[0] ||
                      null,

                  })
                )

              }}

            />


            {/* ==================================
                EXISTING LOGO PREVIEW
            ================================== */}

            {existingLogo && (

              <div className="mt-3">

                <small
                  className="
                    text-muted
                    d-block
                    mb-2
                  "
                >

                  Current Logo

                </small>


                <img

                  src={
                    getImageUrl(
                      existingLogo
                    )
                  }

                  alt="
                    Current Institute Logo
                  "

                  style={{

                    width: '100px',

                    height: '100px',

                    objectFit: 'contain',

                    borderRadius: '8px',

                    border:
                      '1px solid #ddd',

                    padding: '5px',

                  }}

                  onError={(e) => {

                    e.currentTarget.src =
                      '/logo.png'

                  }}

                />

              </div>

            )}

          </div>


          {/* ==================================
              ADDRESS
          ================================== */}

          <div className="col-12 mb-3">

            <label className="form-label">

              Address

            </label>


            <textarea

              rows="4"

              className="form-control"

              placeholder="Address"

              name="address"

              value={
                formData.address
              }

              onChange={
                handleChange
              }

            />

          </div>


          {/* ==================================
              GOOGLE MAP
          ================================== */}

          <div className="col-12 mb-3">

            <label className="form-label">

              Google Maps Embed URL

            </label>


            <input

              type="text"

              className="form-control"

              placeholder="
                Google Maps Embed URL
              "

              name="googleMapUrl"

              value={
                formData.googleMapUrl
              }

              onChange={
                handleChange
              }

            />

          </div>


          {/* ==================================
              INSTAGRAM
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              Instagram

            </label>


            <input

              type="text"

              className="form-control"

              placeholder="Instagram Link"

              name="instagram"

              value={
                formData.instagram
              }

              onChange={
                handleChange
              }

            />

          </div>


          {/* ==================================
              YOUTUBE
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              YouTube

            </label>


            <input

              type="text"

              className="form-control"

              placeholder="YouTube Link"

              name="youtube"

              value={
                formData.youtube
              }

              onChange={
                handleChange
              }

            />

          </div>


          {/* ==================================
              LINKEDIN
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              LinkedIn

            </label>


            <input

              type="text"

              className="form-control"

              placeholder="LinkedIn Link"

              name="linkedin"

              value={
                formData.linkedin
              }

              onChange={
                handleChange
              }

            />

          </div>


          {/* ==================================
              TWITTER / X
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              Twitter / X

            </label>


            <input

              type="text"

              className="form-control"

              placeholder="Twitter / X Link"

              name="twitter"

              value={
                formData.twitter
              }

              onChange={
                handleChange
              }

            />

          </div>


        </div>


        {/* ====================================== */}
        {/* SAVE SETTINGS */}
        {/* ====================================== */}

        <button

          type="submit"

          className="
            table-btn
            approve-btn
          "

          disabled={loading}

        >

          {
            loading
              ? 'Saving...'
              : 'Save Settings'
          }

        </button>


      </form>


      <hr
        className="
          my-5
        "
      />


      {/* ====================================== */}
      {/* ADMIN ACCOUNT SECURITY */}
      {/* ====================================== */}

      <div
        className="
          applications-header
        "
      >

        <h3>
          Admin Account Security
        </h3>

        <p>
          Update your admin login credentials.
        </p>

      </div>


      <form
        onSubmit={
          handleAccountSubmit
        }
      >

        <div className="row">


          {/* ==================================
              CURRENT EMAIL
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              Current Email

            </label>


            <input

              type="email"

              className="form-control"

              placeholder="Current Email"

              name="currentEmail"

              value={
                accountData.currentEmail
              }

              onChange={
                handleAccountChange
              }

              required

            />

          </div>


          {/* ==================================
              NEW EMAIL
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              New Email

            </label>


            <input

              type="email"

              className="form-control"

              placeholder="New Email"

              name="newEmail"

              value={
                accountData.newEmail
              }

              onChange={
                handleAccountChange
              }

            />

          </div>


          {/* ==================================
              CURRENT PASSWORD
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              Current Password

            </label>


            <input

              type="password"

              className="form-control"

              placeholder="Current Password"

              name="currentPassword"

              value={
                accountData.currentPassword
              }

              onChange={
                handleAccountChange
              }

              required

            />

          </div>


          {/* ==================================
              NEW PASSWORD
          ================================== */}

          <div className="col-md-6 mb-3">

            <label className="form-label">

              New Password

            </label>


            <input

              type="password"

              className="form-control"

              placeholder="New Password"

              name="newPassword"

              value={
                accountData.newPassword
              }

              onChange={
                handleAccountChange
              }

            />

          </div>


          {/* ==================================
              CONFIRM PASSWORD
          ================================== */}

          <div className="col-12 mb-3">

            <label className="form-label">

              Confirm New Password

            </label>


            <input

              type="password"

              className="form-control"

              placeholder="
                Confirm New Password
              "

              name="confirmPassword"

              value={
                accountData.confirmPassword
              }

              onChange={
                handleAccountChange
              }

            />

          </div>


        </div>


        {/* ====================================== */}
        {/* UPDATE ACCOUNT */}
        {/* ====================================== */}

        <button

          type="submit"

          className="
            table-btn
            approve-btn
          "

        >

          Update Login Credentials

        </button>


      </form>


    </div>

  )

}


export default Settings