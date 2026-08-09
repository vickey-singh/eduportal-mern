import { useState, useEffect } from 'react'

import axios from 'axios'

import Lightbox from 'yet-another-react-lightbox'

import 'yet-another-react-lightbox/styles.css'

import '../assets/styles/gallery.css'


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function Gallery() {

  // ======================================
  // STATE
  // ======================================

  const [galleryData,
    setGalleryData]

    = useState([])


  const [open, setOpen] =
    useState(false)


  const [index, setIndex] =
    useState(0)


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
  // IMAGE URL
  // ======================================
  //
  // Cloudinary:
  //     complete URL
  //
  // Old local upload:
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


  // ======================================
  // LIGHTBOX IMAGES
  // ======================================

  const images =
    galleryData.map(
      (item) => ({

        src:
          getImageUrl(
            item.image
          ),

      })
    )


  return (

    <>

      {/* ====================================== */}
      {/* GALLERY SECTION */}
      {/* ====================================== */}

      <section

        id="gallery"

        className="gallery-section py-5 bg-light"

        data-aos="fade-up"

      >

        <div className="container">


          {/* ==================================
              HEADING
          ================================== */}

          <div className="text-center mb-5">

            <h2 className="fw-bold">

              Our Gallery

            </h2>

          </div>


          {/* ====================================== */}
          {/* ANIMATED TEXT */}
          {/* ====================================== */}

          <div

            className="text-center animated-text mb-4"

            data-aos="fade-up"

          >

            <p>

              Celebrating success,
              one event at a time.

            </p>


            <p>

              Moments of learning,
              growth, and achievements.

            </p>


            <p>

              Join us in creating more
              memories together.

            </p>

          </div>


          {/* ====================================== */}
          {/* GALLERY GRID */}
          {/* ====================================== */}

          <div className="row g-3">

            {galleryData.length === 0 ? (

              <div className="col-12 text-center">

                <p className="text-muted">

                  No gallery images available.

                </p>

              </div>

            ) : (

              galleryData.map(
                (item, i) => (

                  <div

                    className="col-md-4"

                    key={
                      item._id
                    }

                    data-aos="zoom-in"

                    data-aos-delay={
                      i * 100
                    }

                  >

                    <img

                      src={
                        getImageUrl(
                          item.image
                        )
                      }

                      className="img-fluid rounded shadow-sm gallery-img"

                      alt={
                        item.title
                      }

                      onClick={() => {

                        setOpen(true)

                        setIndex(i)

                      }}

                      onError={(e) => {

                        e.currentTarget.src =
                          '/logo.png'

                      }}

                    />

                  </div>

                )

              )

            )}

          </div>

        </div>

      </section>


      {/* ====================================== */}
      {/* LIGHTBOX */}
      {/* ====================================== */}

      <Lightbox

        open={open}

        close={() =>
          setOpen(false)
        }

        slides={images}

        index={index}

      />

    </>

  )

}


export default Gallery