import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function TeacherMaterials() {

  // ======================================
  // TEACHER
  // ======================================

  const teacher =
    JSON.parse(
      localStorage.getItem(
        'teacher'
      ) || 'null'
    )


  // ======================================
  // MATERIALS
  // ======================================

  const [materials, setMaterials] =
    useState([])


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  // ======================================
  // SUBMIT LOADING
  // ======================================

  const [submitting, setSubmitting] =
    useState(false)


  // ======================================
  // ERROR
  // ======================================

  const [error, setError] =
    useState('')


  // ======================================
  // SUCCESS
  // ======================================

  const [success, setSuccess] =
    useState('')


  // ======================================
  // EDIT MODE
  // ======================================

  const [editingId, setEditingId] =
    useState(null)


  // ======================================
  // FORM
  // ======================================

  const [formData, setFormData] =
    useState({

      title: '',

      subject: '',

      course: '',

      batchTime: '',

      description: '',

      materialType: 'PDF',

      externalLink: '',

      file: null,

    })


  // ======================================
  // ASSIGNED CLASSES
  // ======================================

  const [assignedClasses, setAssignedClasses] =
    useState([])


  // ======================================
  // FETCH TEACHER DATA
  // ======================================

  const fetchTeacher =
    async () => {

      try {

        const token =
          localStorage.getItem(
            'teacherToken'
          )


        if (!token) {

          return

        }


        const response =
          await axios.get(

            `${API_URL}/teacher/me`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          const teacherData =
            response.data.teacher


          setAssignedClasses(

            teacherData.assignedClasses ||
            []

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Teacher Error:',

          error

        )

      }

    }


  // ======================================
  // FETCH MATERIALS
  // ======================================

  const fetchMaterials =
    async () => {

      try {

        setLoading(true)

        setError('')


        const token =
          localStorage.getItem(
            'teacherToken'
          )


        if (!token) {

          setError(
            'Teacher authentication token not found.'
          )

          return

        }


        const response =
          await axios.get(

            `${API_URL}/teacher/materials`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setMaterials(

            response.data.materials ||
            []

          )

        }

        else {

          setError(

            response.data.message ||
            'Unable to load study materials.'

          )

        }

      }

      catch (error) {

        console.log(

          'Fetch Materials Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to load study materials.'

        )

      }

      finally {

        setLoading(false)

      }

    }


  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {

    fetchTeacher()

    fetchMaterials()

  }, [])


  // ======================================
  // HANDLE INPUT
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
  // HANDLE FILE
  // ======================================

  const handleFileChange =
    (e) => {

      const file =
        e.target.files?.[0] ||
        null


      setFormData(
        (previous) => ({

          ...previous,

          file,

        })
      )

    }


  // ======================================
  // RESET FORM
  // ======================================

  const resetForm =
    () => {

      setFormData({

        title: '',

        subject: '',

        course: '',

        batchTime: '',

        description: '',

        materialType: 'PDF',

        externalLink: '',

        file: null,

      })


      setEditingId(null)


      const fileInput =
        document.getElementById(
          'materialFile'
        )


      if (fileInput) {

        fileInput.value = ''

      }

    }


  // ======================================
  // COURSE CHANGE
  // ======================================

  const handleCourseChange =
    (e) => {

      const course =
        e.target.value


      setFormData(
        (previous) => ({

          ...previous,

          course,

          batchTime: '',

        })
      )

    }


  // ======================================
  // GET BATCHES FOR COURSE
  // ======================================

  const getBatchesForCourse =
    () => {

      if (!formData.course) {

        return []

      }


      return assignedClasses.filter(

        (assignment) => {

          const course =
            assignment.courseId


          if (!course) {

            return false

          }


          return (

            course.courseName ===
            formData.course

          )

        }

      )

    }


  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit =
    async (e) => {

      e.preventDefault()


      setError('')

      setSuccess('')


      // ==================================
      // VALIDATION
      // ==================================

      if (
        !formData.title.trim()
      ) {

        setError(
          'Please enter material title.'
        )

        return

      }


      if (
        !formData.course
      ) {

        setError(
          'Please select a course.'
        )

        return

      }


      if (
        !formData.batchTime
      ) {

        setError(
          'Please select a batch.'
        )

        return

      }


      if (
        formData.materialType ===
        'Link'
      ) {

        if (
          !formData.externalLink.trim()
        ) {

          setError(
            'Please enter the external link.'
          )

          return

        }

      }

      else if (
        !editingId &&
        !formData.file
      ) {

        setError(
          'Please select a file.'
        )

        return

      }


      try {

        setSubmitting(true)


        const token =
          localStorage.getItem(
            'teacherToken'
          )


        if (!token) {

          setError(
            'Teacher authentication token not found.'
          )

          return

        }


        // ==================================
        // FORM DATA
        // ==================================

        const data =
          new FormData()


        data.append(
          'title',
          formData.title.trim()
        )

        data.append(
          'subject',
          formData.subject.trim()
        )

        data.append(
          'course',
          formData.course
        )

        data.append(
          'batchTime',
          formData.batchTime
        )

        data.append(
          'description',
          formData.description.trim()
        )

        data.append(
          'materialType',
          formData.materialType
        )

        data.append(
          'externalLink',
          formData.externalLink.trim()
        )


        if (formData.file) {

          data.append(
            'file',
            formData.file
          )

        }


        // ==================================
        // CREATE / UPDATE
        // ==================================

        let response


        if (editingId) {

          response =
            await axios.put(

              `${API_URL}/teacher/materials/${editingId}`,

              data,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },

              }

            )

        }

        else {

          response =
            await axios.post(

              `${API_URL}/teacher/materials`,

              data,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },

              }

            )

        }


        // ==================================
        // SUCCESS
        // ==================================

        if (
          response.data.success
        ) {

          setSuccess(

            editingId

              ? 'Study material updated successfully.'

              : 'Study material uploaded successfully.'

          )


          resetForm()

          await fetchMaterials()

        }

        else {

          setError(

            response.data.message ||

            'Unable to save study material.'

          )

        }

      }

      catch (error) {

        console.log(

          'Save Material Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          error?.message ||

          'Unable to save study material.'

        )

      }

      finally {

        setSubmitting(false)

      }

    }


  // ======================================
  // EDIT
  // ======================================

  const handleEdit =
    (material) => {

      setEditingId(
        material._id
      )


      setFormData({

        title:
          material.title || '',

        subject:
          material.subject || '',

        course:
          material.course || '',

        batchTime:
          material.batchTime || '',

        description:
          material.description || '',

        materialType:
          material.materialType ||
          'PDF',

        externalLink:
          material.externalLink || '',

        file: null,

      })


      setError('')

      setSuccess('')


      window.scrollTo({

        top: 0,

        behavior: 'smooth',

      })

    }


  // ======================================
  // DELETE
  // ======================================

  const handleDelete =
    async (id) => {

      const confirmed =
        window.confirm(

          'Are you sure you want to delete this study material?'

        )


      if (!confirmed) {

        return

      }


      try {

        setError('')

        setSuccess('')


        const token =
          localStorage.getItem(
            'teacherToken'
          )


        const response =
          await axios.delete(

            `${API_URL}/teacher/materials/${id}`,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            }

          )


        if (
          response.data.success
        ) {

          setSuccess(
            'Study material deleted successfully.'
          )


          await fetchMaterials()

        }

        else {

          setError(

            response.data.message ||
            'Unable to delete material.'

          )

        }

      }

      catch (error) {

        console.log(

          'Delete Material Error:',

          error

        )


        setError(

          error?.response?.data?.message ||

          'Unable to delete material.'

        )

      }

    }


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div className="text-center py-5">

        <div
          className="spinner-border"
          role="status"
        >

          <span className="visually-hidden">

            Loading...

          </span>

        </div>


        <p className="text-muted mt-3">

          Loading study materials...

        </p>

      </div>

    )

  }


  // ======================================
  // RENDER
  // ======================================

  return (

    <div>


      {/* ==================================
          HEADER
      ================================== */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">

          Study Materials

        </h2>


        <p className="text-muted mb-0">

          Upload and manage study materials
          for your assigned classes.

        </p>

      </div>


      {/* ==================================
          ALERTS
      ================================== */}

      {error && (

        <div className="alert alert-danger">

          {error}

        </div>

      )}


      {success && (

        <div className="alert alert-success">

          {success}

        </div>

      )}


      {/* ==================================
          ADD / EDIT MATERIAL
      ================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <div>

              <h5 className="fw-bold mb-1">

                {editingId

                  ? 'Edit Study Material'

                  : 'Add Study Material'

                }

              </h5>


              <small className="text-muted">

                Only your assigned courses and
                batches can be selected.

              </small>

            </div>


            {editingId && (

              <button

                type="button"

                className="btn btn-outline-secondary"

                onClick={resetForm}

              >

                Cancel Edit

              </button>

            )}

          </div>


          <form
            onSubmit={handleSubmit}
          >

            <div className="row g-3">


              {/* TITLE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Material Title

                </label>


                <input

                  type="text"

                  name="title"

                  className="form-control"

                  placeholder="Enter material title"

                  value={
                    formData.title
                  }

                  onChange={
                    handleChange
                  }

                  required

                />

              </div>


              {/* SUBJECT */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Subject

                </label>


                <input

                  type="text"

                  name="subject"

                  className="form-control"

                  placeholder="e.g. Mathematics"

                  value={
                    formData.subject
                  }

                  onChange={
                    handleChange
                  }

                />

              </div>


              {/* COURSE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Course

                </label>


                <select

                  name="course"

                  className="form-select"

                  value={
                    formData.course
                  }

                  onChange={
                    handleCourseChange
                  }

                  required

                >

                  <option value="">

                    Select Course

                  </option>


                  {assignedClasses.map(

                    (assignment, index) => {

                      const course =
                        assignment.courseId


                      if (!course) {

                        return null

                      }


                      return (

                        <option

                          key={

                            course._id ||
                            index

                          }

                          value={
                            course.courseName
                          }

                        >

                          {
                            course.courseName
                          }

                        </option>

                      )

                    }

                  )}

                </select>

              </div>


              {/* BATCH */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Batch

                </label>


                <select

                  name="batchTime"

                  className="form-select"

                  value={
                    formData.batchTime
                  }

                  onChange={
                    handleChange
                  }

                  required

                  disabled={
                    !formData.course
                  }

                >

                  <option value="">

                    Select Batch

                  </option>


                  {getBatchesForCourse().map(

                    (assignment, index) => (

                      <option

                        key={index}

                        value={
                          assignment.batchTime
                        }

                      >

                        {
                          assignment.batchTime
                        }

                      </option>

                    )

                  )}

                </select>

              </div>


              {/* MATERIAL TYPE */}

              <div className="col-md-6">

                <label className="form-label fw-semibold">

                  Material Type

                </label>


                <select

                  name="materialType"

                  className="form-select"

                  value={
                    formData.materialType
                  }

                  onChange={
                    handleChange
                  }

                >

                  <option value="PDF">

                    PDF

                  </option>


                  <option value="Document">

                    Document

                  </option>


                  <option value="Presentation">

                    Presentation

                  </option>


                  <option value="Video">

                    Video

                  </option>


                  <option value="Link">

                    External Link

                  </option>


                  <option value="Other">

                    Other

                  </option>

                </select>

              </div>


              {/* FILE */}

              {formData.materialType !==
                'Link' && (

                <div className="col-md-6">

                  <label className="form-label fw-semibold">

                    File

                  </label>


                  <input

                    id="materialFile"

                    type="file"

                    className="form-control"

                    accept="

                      .pdf,

                      .doc,

                      .docx,

                      .ppt,

                      .pptx

                    "

                    onChange={
                      handleFileChange
                    }

                  />


                  <small className="text-muted">

                    Maximum file size: 20 MB

                  </small>


                  {editingId && (

                    <small className="d-block text-muted mt-1">

                      Leave empty to keep
                      the existing file.

                    </small>

                  )}

                </div>

              )}


              {/* EXTERNAL LINK */}

              {formData.materialType ===
                'Link' && (

                <div className="col-md-6">

                  <label className="form-label fw-semibold">

                    External Link

                  </label>


                  <input

                    type="url"

                    name="externalLink"

                    className="form-control"

                    placeholder="https://..."

                    value={
                      formData.externalLink
                    }

                    onChange={
                      handleChange
                    }

                  />

                </div>

              )}


              {/* DESCRIPTION */}

              <div className="col-12">

                <label className="form-label fw-semibold">

                  Description

                </label>


                <textarea

                  name="description"

                  className="form-control"

                  rows="4"

                  placeholder="Enter material description"

                  value={
                    formData.description
                  }

                  onChange={
                    handleChange
                  }

                />

              </div>


              {/* SUBMIT */}

              <div className="col-12">

                <button

                  type="submit"

                  className="btn btn-primary"

                  disabled={
                    submitting
                  }

                >

                  {submitting

                    ? (

                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                        />

                        {editingId
                          ? 'Updating...'
                          : 'Uploading...'
                        }

                      </>

                    )

                    : (

                      editingId
                        ? 'Update Material'
                        : 'Upload Material'

                    )

                  }

                </button>


                {!editingId && (

                  <button

                    type="button"

                    className="btn btn-outline-secondary ms-2"

                    onClick={
                      resetForm
                    }

                  >

                    Clear

                  </button>

                )}

              </div>

            </div>

          </form>

        </div>

      </div>


      {/* ==================================
          MATERIAL LIST
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          <div className="d-flex justify-content-between align-items-center mb-4">

            <h5 className="fw-bold mb-0">

              My Study Materials

            </h5>


            <span className="badge bg-secondary">

              {
                materials.length
              }

              {' '}

              Material(s)

            </span>

          </div>


          {materials.length === 0 ? (

            <div className="text-center py-5">

              <div
                style={{
                  fontSize: '48px',
                }}
              >

                📂

              </div>


              <h6 className="fw-bold mt-3">

                No Study Materials

              </h6>


              <p className="text-muted mb-0">

                Upload your first study material
                using the form above.

              </p>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Material
                    </th>

                    <th>
                      Course
                    </th>

                    <th>
                      Batch
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Date
                    </th>

                    <th className="text-end">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {materials.map(

                    (material, index) => (

                      <tr
                        key={
                          material._id
                        }
                      >

                        <td>

                          {
                            index + 1
                          }

                        </td>


                        <td>

                          <div className="fw-semibold">

                            {
                              material.title
                            }

                          </div>


                          {material.subject && (

                            <small className="text-muted">

                              {
                                material.subject
                              }

                            </small>

                          )}

                        </td>


                        <td>

                          {
                            material.course
                          }

                        </td>


                        <td>

                          {
                            material.batchTime
                          }

                        </td>


                        <td>

                          <span className="badge bg-light text-dark border">

                            {
                              material.materialType
                            }

                          </span>

                        </td>


                        <td>

                          {
                            material.createdAt

                            ? new Date(
                                material.createdAt
                              ).toLocaleDateString()

                            : '-'

                          }

                        </td>


                        <td>

                          <div className="d-flex justify-content-end gap-2">

                            {/* OPEN */}

                            {(

                              material.fileUrl ||

                              material.externalLink

                            ) && (

                              <a

                                href={

                                  material.fileUrl ||

                                  material.externalLink

                                }

                                target="_blank"

                                rel="noreferrer"

                                className="btn btn-sm btn-outline-primary"

                              >

                                Open

                              </a>

                            )}


                            {/* EDIT */}

                            <button

                              type="button"

                              className="btn btn-sm btn-outline-warning"

                              onClick={() =>
                                handleEdit(
                                  material
                                )
                              }

                            >

                              Edit

                            </button>


                            {/* DELETE */}

                            <button

                              type="button"

                              className="btn btn-sm btn-outline-danger"

                              onClick={() =>
                                handleDelete(
                                  material._id
                                )
                              }

                            >

                              Delete

                            </button>

                          </div>

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>

  )

}


export default TeacherMaterials