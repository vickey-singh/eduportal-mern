import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  FaDownload,
  FaFilePdf,
} from 'react-icons/fa'

import '../assets/styles/downloads.css'

function Downloads() {

  const [downloads, setDownloads] =
    useState([])

  const [category, setCategory] =
    useState('All')

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

  const filteredDownloads =

    category === 'All'

      ? downloads

      : downloads.filter(

          (item) =>

            item.category === category

        )

  return (

    <section className="downloads-page">

      <div className="container">

        {/* Header */}

        <div className="downloads-header">

          <h1>

            Downloads & Study Materials

          </h1>

          <p>

            Access study materials,
            syllabus, forms and useful
            educational resources.

          </p>

        </div>

        {/* Filter */}

        <div className="downloads-filter">

          <button
            className={
              category === 'All'
                ? 'active-filter'
                : ''
            }
            onClick={() =>
              setCategory('All')
            }
          >
            All
          </button>

          <button
            className={
              category === 'Study Material'
                ? 'active-filter'
                : ''
            }
            onClick={() =>
              setCategory(
                'Study Material'
              )
            }
          >
            Study Material
          </button>

          <button
            className={
              category === 'Syllabus'
                ? 'active-filter'
                : ''
            }
            onClick={() =>
              setCategory(
                'Syllabus'
              )
            }
          >
            Syllabus
          </button>

          <button
            className={
              category === 'Resources'
                ? 'active-filter'
                : ''
            }
            onClick={() =>
              setCategory(
                'Resources'
              )
            }
          >
            Resources
          </button>

          <button
            className={
              category === 'Forms'
                ? 'active-filter'
                : ''
            }
            onClick={() =>
              setCategory(
                'Forms'
              )
            }
          >
            Assignments
          </button>

        </div>

        {/* Downloads */}

        <div className="downloads-grid">

          {

            filteredDownloads.length > 0

              ? filteredDownloads.map(

                  (item) => (

                    <div
                      key={item._id}
                      className="download-card"
                    >

                      <div className="download-icon">

                        <FaFilePdf />

                      </div>

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.description}
                      </p>

                      <span className="download-category">

                        {item.category}

                      </span>

                      <div className="download-actions">

                        <a
                          href={`https://eduportal-backend-m5t1.onrender.com${item.file}`}
                          target="_blank"
                          rel="noreferrer"
                          className="preview-btn"
                        >
                          Preview
                        </a>

                        <a
                          href={`https://eduportal-backend-m5t1.onrender.com${item.file}`}
                          download
                          className="download-btn"
                        >

                          <FaDownload />

                          Download

                        </a>

                      </div>

                    </div>

                  )

                )

              : (

                <div className="empty-downloads">

                  <h3>

                    No Files Available

                  </h3>

                  <p>

                    Downloads will appear
                    here once uploaded by
                    the administrator.

                  </p>

                </div>

              )

          }

        </div>

      </div>

    </section>

  )

}

export default Downloads