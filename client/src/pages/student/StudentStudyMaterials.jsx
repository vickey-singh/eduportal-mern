import { useEffect, useState } from 'react'

import axios from 'axios'

import { API_URL } from '../../config/api'


function StudentStudyMaterials() {

  // ======================================
  // MATERIALS
  // ======================================

  const [materials, setMaterials] =
    useState([])


  // ======================================
  // COURSE
  // ======================================

  const [course, setCourse] =
    useState('')


  // ======================================
  // BATCH
  // ======================================

  const [batchTime, setBatchTime] =
    useState('')


  // ======================================
  // LOADING
  // ======================================

  const [loading, setLoading] =
    useState(true)


  // ======================================
  // ERROR
  // ======================================

  const [error, setError] =
    useState('')


  // ======================================
  // FETCH MATERIALS
  // ======================================

  useEffect(() => {

    const fetchMaterials =
      async () => {

        try {

          setLoading(true)

          setError('')


          // ==================================
          // GET TOKEN
          // ==================================

          const token =
            localStorage.getItem(
              'studentToken'
            )


          if (!token) {

            setError(
              'Student authentication required.'
            )

            return

          }


          // ==================================
          // API REQUEST
          // ==================================

          const response =
            await axios.get(

              `${API_URL}/student/materials`,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`,

                },

              }

            )


          // ==================================
          // SUCCESS
          // ==================================

          if (
            response.data.success
          ) {

            setMaterials(

              response.data.materials ||

              []

            )


            setCourse(

              response.data.course ||

              ''

            )


            setBatchTime(

              response.data.batchTime ||

              ''

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

            'Student Study Materials Error:',

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


    fetchMaterials()

  }, [])


  // ======================================
  // LOADING
  // ======================================

  if (loading) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 text-center">


            <div
              style={{
                fontSize: '48px',
              }}
            >

              📂

            </div>


            <h5 className="fw-bold mt-3">

              Study Materials

            </h5>


            <p className="text-muted mb-4">

              Your study materials available here.

            </p>


            <div>

              <div
                className="spinner-border text-primary"
                role="status"
              >

                <span className="visually-hidden">

                  Loading...

                </span>

              </div>

            </div>


          </div>

        </div>

      </div>

    )

  }


  // ======================================
  // ERROR
  // ======================================

  if (error) {

    return (

      <div>

        <div className="card border-0 shadow-sm">

          <div className="card-body p-4 text-center">


            <div
              style={{
                fontSize: '48px',
              }}
            >

              📂

            </div>


            <h5 className="fw-bold mt-3">

              Study Materials

            </h5>


            <p className="text-muted mb-4">

              Your study materials available here.

            </p>


            <div
              className="alert alert-danger mb-0"
              role="alert"
            >

              {error}

            </div>


          </div>

        </div>

      </div>

    )

  }


  return (

    <div>


      {/* ==================================
          MAIN CARD
      ================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body p-4">


          {/* ==================================
              ICON + TITLE
          ================================== */}

          <div className="text-center">

            <div
              style={{
                fontSize: '48px',
              }}
            >

              📂

            </div>


            <h5 className="fw-bold mt-3">

              Study Materials

            </h5>


            <p className="text-muted mb-4">

              Your study materials available here.

            </p>

          </div>


          {/* ==================================
              COURSE + BATCH
          ================================== */}

          <div className="row g-3 mb-4">


            <div className="col-md-6">

              <small className="text-muted">

                Course

              </small>

              <div className="fw-semibold">

                {
                  course ||
                  '-'
                }

              </div>

            </div>


            <div className="col-md-6">

              <small className="text-muted">

                Batch Time

              </small>

              <div className="fw-semibold">

                {
                  batchTime ||
                  '-'
                }

              </div>

            </div>


          </div>


          {/* ==================================
              NO MATERIALS
          ================================== */}

          {materials.length === 0 ? (

            <div
              className="alert alert-info text-center mb-0"
            >

              No study materials are available
              for your course and batch yet.

            </div>

          ) : (


            /* ==================================
                MATERIAL LIST
            ================================== */

            <div>

              {materials.map(

                (material) => (

                  <div

                    key={
                      material._id
                    }

                    className="border rounded p-4 mb-3"

                  >


                    {/* ==============================
                        TITLE
                    ============================== */}

                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">

                      <div>

                        <h6 className="fw-bold mb-1">

                          {
                            material.title ||
                            '-'
                          }

                        </h6>


                        {material.subject && (

                          <small className="text-muted">

                            Subject: {' '}

                            {
                              material.subject
                            }

                          </small>

                        )}

                      </div>


                      <span className="badge text-bg-primary">

                        {
                          material.materialType ||
                          'Material'
                        }

                      </span>


                    </div>


                    {/* ==============================
                        DESCRIPTION
                    ============================== */}

                    {material.description && (

                      <div className="mb-3">

                        <small className="text-muted">

                          Description

                        </small>

                        <p className="mb-0 mt-1">

                          {
                            material.description
                          }

                        </p>

                      </div>

                    )}


                    {/* ==============================
                        INFORMATION
                    ============================== */}

                    <div className="row g-3">


                      {/* SUBJECT */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Subject

                        </small>

                        <div className="fw-semibold">

                          {
                            material.subject ||
                            '-'
                          }

                        </div>

                      </div>


                      {/* MATERIAL TYPE */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Material Type

                        </small>

                        <div className="fw-semibold">

                          {
                            material.materialType ||
                            '-'
                          }

                        </div>

                      </div>


                      {/* TEACHER */}

                      <div className="col-md-4">

                        <small className="text-muted">

                          Teacher

                        </small>

                        <div className="fw-semibold">

                          {
                            material.teacherId?.name ||
                            'Teacher'
                          }

                        </div>

                      </div>


                    </div>


                    {/* ==============================
                        FILE NAME
                    ============================== */}

                    {material.fileName && (

                      <div className="mt-3">

                        <small className="text-muted">

                          File

                        </small>

                        <div className="fw-semibold">

                          📎 {' '}

                          {
                            material.fileName
                          }

                        </div>

                      </div>

                    )}


                    {/* ==============================
                        ACTIONS
                    ============================== */}

                    <div className="mt-4 d-flex flex-wrap gap-2">


                      {/* FILE */}

                      {material.fileUrl && (

                        <a

                          href={
                            material.fileUrl
                          }

                          target="_blank"

                          rel="noreferrer"

                          className="btn btn-outline-primary"

                        >

                          📂 Open Material

                        </a>

                      )}


                      {/* EXTERNAL LINK */}

                      {material.externalLink && (

                        <a

                          href={
                            material.externalLink
                          }

                          target="_blank"

                          rel="noreferrer"

                          className="btn btn-outline-success"

                        >

                          🔗 Open Link

                        </a>

                      )}


                    </div>


                  </div>

                )

              )}

            </div>

          )}


        </div>

      </div>


    </div>

  )

}


export default StudentStudyMaterials