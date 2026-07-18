import { useEffect, useState } from 'react'

import {
  getSettings,
  updateSettings,
} from '../../services/settingsService'

function Settings() {

  const [formData, setFormData] =
    useState({

      instituteName: '',

      phone: '',

      email: '',

      address: '',

      instagram: '',

      youtube: '',

      linkedin: '',

      twitter: '',

      logo: null,

    })
    
    const [accountData, setAccountData] =
      useState({
    
        currentEmail: '',
    
        newEmail: '',
    
        currentPassword: '',
    
        newPassword: '',
    
        confirmPassword: '',
    
      })

    

  useEffect(() => {

    fetchSettings()

  }, [])

  const fetchSettings =
    async () => {

      try {

        const response = await getSettings()

        setFormData({

          instituteName:
            response.data.instituteName || '',

          phone:
            response.data.phone || '',

          email:
            response.data.email || '',

          address:
            response.data.address || '',

          instagram:
            response.data.instagram || '',

          youtube:
            response.data.youtube || '',

          linkedin:
            response.data.linkedin || '',

          twitter:
            response.data.twitter || '',

          logo: null,

        })

    
      }

      catch (error) {

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
          'instituteName',
          formData.instituteName
        )

        data.append(
          'phone',
          formData.phone
        )

        data.append(
          'email',
          formData.email
        )

        data.append(
          'address',
          formData.address
        )

        data.append(
          'instagram',
          formData.instagram
        )

        data.append(
          'youtube',
          formData.youtube
        )

        data.append(
          'linkedin',
          formData.linkedin
        )

        data.append(
          'twitter',
          formData.twitter
        )

        if (formData.logo) {

          data.append(
            'logo',
            formData.logo
          )

        }

        await updateSettings(data)

        alert(
          'Settings Updated Successfully'
        )

      }

      catch (error) {

        console.log(error)

      }

    }

    const handleAccountChange =
  (e) => {

    setAccountData({

      ...accountData,

      [e.target.name]:
        e.target.value,

    })

  }

const handleAccountSubmit =
  async (e) => {

    e.preventDefault()

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

          'https://eduportal-backend-m5t1.onrender.com/api/account-settings',

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

      setAccountData({

        currentEmail: '',

        newEmail: '',

        currentPassword: '',

        newPassword: '',

        confirmPassword: '',

      })

    }

    catch (error) {

      alert(

        error.response?.data?.message ||

        'Update Failed'

      )

    }

  }

  return (

    <div className="applications-section">

      <div className="applications-header">

        <h2>

          Website Settings

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
              placeholder="Institute Name"
              name="instituteName"
              value={formData.instituteName}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

            <input
              type="email"
              className="form-control"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) =>

                setFormData({

                  ...formData,

                  logo:
                    e.target.files[0],

                })

              }
            />

          </div>

          <div className="col-12 mb-3">

            <textarea
              rows="4"
              className="form-control"
              placeholder="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Instagram Link"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="YouTube Link"
              name="youtube"
              value={formData.youtube}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="LinkedIn Link"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
            />

          </div>

          <div className="col-md-6 mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Twitter / X Link"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
            />

          </div>

        </div>

        <button
          className="table-btn approve-btn"
        >

          Save Settings

        </button>

      </form>
      <hr className="my-5" />

<div className="applications-header">

  <h2>

    Admin Account Security

  </h2>

</div>

<form
  onSubmit={handleAccountSubmit}
>

  <div className="row">

    <div className="col-md-6 mb-3">

      <input
        type="email"
        className="form-control"
        placeholder="Current Email"
        name="currentEmail"
        value={accountData.currentEmail}
        onChange={handleAccountChange}
        required
      />

    </div>

    <div className="col-md-6 mb-3">

      <input
        type="email"
        className="form-control"
        placeholder="New Email"
        name="newEmail"
        value={accountData.newEmail}
        onChange={handleAccountChange}
      />

    </div>

    <div className="col-md-6 mb-3">

      <input
        type="password"
        className="form-control"
        placeholder="Current Password"
        name="currentPassword"
        value={accountData.currentPassword}
        onChange={handleAccountChange}
        required
      />

    </div>

    <div className="col-md-6 mb-3">

      <input
        type="password"
        className="form-control"
        placeholder="New Password"
        name="newPassword"
        value={accountData.newPassword}
        onChange={handleAccountChange}
      />

    </div>

    <div className="col-12 mb-3">

      <input
        type="password"
        className="form-control"
        placeholder="Confirm New Password"
        name="confirmPassword"
        value={accountData.confirmPassword}
        onChange={handleAccountChange}
      />

    </div>

  </div>

  <button
    type="submit"
    className="table-btn approve-btn"
  >

    Update Login Credentials

  </button>

</form>

    </div>

  )

}

export default Settings