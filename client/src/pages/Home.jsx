import { Link } from 'react-router-dom'

import {
  useEffect,
  useState,
} from 'react'

import axios from 'axios'

import CountUp from 'react-countup'

import {
  getActiveHomeSliders,
} from '../services/homeSliderService'

import {
  getSettings,
} from '../services/settingsService'

import '../assets/styles/home.css'


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function Home() {

  // ======================================
  // NOTICE STATE
  // ======================================

  const [notices, setNotices] =
    useState([])


  // ======================================
  // IMPORTANT NOTICE POPUP
  // ======================================

  const [showPopup, setShowPopup] =
    useState(true)


  // ======================================
  // SELECTED NOTICE
  // ======================================

  const [selectedNotice, setSelectedNotice] =
    useState(null)


  // ======================================
  // HOME SLIDER
  // ======================================

  const [sliders, setSliders] =
    useState([])


  const [activeSlide, setActiveSlide] =
    useState(0)


  // ======================================
  // VIDEO SOUND
  // ======================================

  const [videoMuted, setVideoMuted] =
    useState(true)


  // ======================================
  // SETTINGS
  // ======================================

  const [settings, setSettings] =
    useState(null)


  // ======================================
  // HOME LOADING
  // ======================================

  const [homeLoading, setHomeLoading] =
    useState(true)


  // ======================================
  // FETCH NOTICES
  // ======================================

  useEffect(() => {

    fetchNotices()

  }, [])


  // ======================================
  // FETCH HOME DATA
  // ======================================

  useEffect(() => {

    fetchHomeData()

  }, [])


  // ======================================
  // FETCH HOME DATA
  // ======================================

  const fetchHomeData =
    async () => {

      try {

        setHomeLoading(true)


        const [
          sliderResponse,
          settingsResponse,
        ] = await Promise.all([

          getActiveHomeSliders(),

          getSettings(),

        ])


        // ==================================
        // SLIDERS
        // ==================================

        setSliders(

          Array.isArray(
            sliderResponse?.sliders
          )

            ? sliderResponse.sliders

            : []

        )


        // ==================================
        // SETTINGS
        // ==================================

        setSettings(
          settingsResponse || null
        )


        // ==================================
        // RESET SLIDE
        // ==================================

        setActiveSlide(0)

      }

      catch (error) {

        console.log(
          'Fetch Home Data Error:',
          error
        )

      }

      finally {

        setHomeLoading(false)

      }

    }


  // ======================================
  // AUTO SLIDER
  // ======================================

  useEffect(() => {

    if (
      sliders.length === 0
    ) {

      return

    }


    const currentSlider =
      sliders[activeSlide]


    if (!currentSlider) {

      return

    }


    // ==================================
    // VIDEO
    // ==================================

    if (
      currentSlider.mediaType ===
      'video'
    ) {

      const video =
        document.getElementById(
          `home-video-${currentSlider._id}`
        )


      if (video) {

        video.currentTime = 0

        video.muted =
          videoMuted

        video.play().catch(() => {})

      }


      return

    }


    // ==================================
    // IMAGE
    // ==================================

    const timer =
      setTimeout(() => {

        setActiveSlide(

          (previous) =>

            previous >=
            sliders.length - 1

              ? 0

              : previous + 1

        )

      }, 5000)


    return () =>
      clearTimeout(timer)

  }, [
    activeSlide,
    sliders,
    videoMuted,
  ])


  // ======================================
  // KEEP SLIDE VALID
  // ======================================

  useEffect(() => {

    if (
      sliders.length === 0
    ) {

      setActiveSlide(0)

      return

    }


    if (
      activeSlide >=
      sliders.length
    ) {

      setActiveSlide(0)

    }

  }, [
    sliders,
    activeSlide,
  ])


  // ======================================
  // PINNED NOTICE
  // ======================================

  const pinnedNotice =
    notices.find(
      (notice) =>
        notice.isPinned
    )


  // ======================================
  // IMPORTANT NOTICE
  // ======================================

  const importantNotice =
    notices.find(
      (notice) =>
        notice.isImportant
    )


  // ======================================
  // IMPORTANT NOTICE POPUP
  // ======================================

  useEffect(() => {

    if (!importantNotice) {

      return

    }


    const closedNotice =
      localStorage.getItem(
        'closedNotice'
      )


    if (
      closedNotice ===
      importantNotice._id
    ) {

      setShowPopup(false)

    }

    else {

      setShowPopup(true)

    }

  }, [
    importantNotice,
  ])


  // ======================================
  // FETCH NOTICES
  // ======================================

  const fetchNotices =
    async () => {

      try {

        const response =
          await axios.get(
            `${API_BASE_URL}/api/notices`
          )


        setNotices(

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

    }


  // ======================================
  // IMAGE URL
  // ======================================

  const getImageUrl =
    (image) => {

      if (!image) {

        return ''

      }


      // ==================================
      // EXTERNAL URL
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
      // LOCAL UPLOAD
      // ==================================

      return `${API_BASE_URL}${

        image.startsWith('/')

          ? image

          : `/${image}`

      }`

    }


  // ======================================
  // NOTICE IMAGE
  // ======================================

  const getNoticeImageUrl =
    (image) => {

      return getImageUrl(
        image
      )

    }


  // ======================================
  // OPEN NOTICE
  // ======================================

  const openNoticeDetails =
    (notice) => {

      if (!notice) {

        return

      }


      setSelectedNotice(
        notice
      )

    }


  // ======================================
  // CLOSE NOTICE
  // ======================================

  const closeNoticeDetails =
    () => {

      setSelectedNotice(
        null
      )

    }


  // ======================================
  // ESC CLOSE
  // ======================================

  useEffect(() => {

    const handleEscape =
      (event) => {

        if (
          event.key === 'Escape'
        ) {

          closeNoticeDetails()

        }

      }


    document.addEventListener(
      'keydown',
      handleEscape
    )


    return () => {

      document.removeEventListener(
        'keydown',
        handleEscape
      )

    }

  }, [])


  // ======================================
  // CLOSE IMPORTANT POPUP
  // ======================================

  const closeImportantPopup =
    () => {

      if (
        importantNotice
      ) {

        localStorage.setItem(

          'closedNotice',

          importantNotice._id

        )

      }


      setShowPopup(false)

    }


  // ======================================
  // PREVIOUS SLIDE
  // ======================================

  const previousSlide =
    () => {

      if (
        sliders.length === 0
      ) {

        return

      }


      setActiveSlide(

        (previous) =>

          previous === 0

            ? sliders.length - 1

            : previous - 1

      )

    }


  // ======================================
  // NEXT SLIDE
  // ======================================

  const nextSlide =
    () => {

      if (
        sliders.length === 0
      ) {

        return

      }


      setActiveSlide(

        (previous) =>

          previous >=
          sliders.length - 1

            ? 0

            : previous + 1

      )

    }


  // ======================================
  // MANUAL SLIDE
  // ======================================

  const goToSlide =
    (index) => {

      setActiveSlide(
        index
      )

    }


  // ======================================
  // INSTITUTE NAME
  // ======================================

  const instituteName =
    settings?.instituteName ||
    'Prerna Institute Of Excellence'


  // ======================================
  // SPLIT INSTITUTE NAME
  // ======================================

  const instituteWords =
    instituteName
      .trim()
      .split(/\s+/)


  const firstInstituteWord =
    instituteWords.shift()


  const remainingInstituteName =
    instituteWords.join(' ')


  return (

    <>


      {/* ==================================================
          IMPORTANT NOTICE POPUP
      ================================================== */}

      {
        importantNotice &&
        showPopup && (

          <div
            className="
              notice-popup-overlay
            "
            onClick={
              closeImportantPopup
            }
          >

            <div
              className="
                notice-popup
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="
                  popup-close
                "
                onClick={
                  closeImportantPopup
                }
                aria-label="
                  Close notice
                "
              >

                ×

              </button>


              <h3>

                ⚠ Important Notice

              </h3>


              <h4>

                {
                  importantNotice.title
                }

              </h4>


              {
                importantNotice.createdAt && (

                  <small>

                    {
                      new Date(
                        importantNotice.createdAt
                      ).toLocaleDateString()
                    }

                  </small>

                )
              }


              <p>

                {
                  importantNotice.description
                }

              </p>


              {
                importantNotice.image && (

                  <img
                    src={
                      getNoticeImageUrl(
                        importantNotice.image
                      )
                    }
                    alt={
                      importantNotice.title
                    }
                    className="
                      notice-popup-image
                    "
                  />

                )
              }


              <button
                type="button"
                className="
                  btn
                  btn-primary
                  mt-3
                "
                onClick={
                  closeImportantPopup
                }
              >

                Close

              </button>

            </div>

          </div>

        )

      }


      {/* ==================================================
          SELECTED NOTICE DETAILS
      ================================================== */}

      {
        selectedNotice && (

          <div
            className="
              notice-details-overlay
            "
            onClick={
              closeNoticeDetails
            }
          >

            <div
              className="
                notice-details-modal
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="
                  notice-details-close
                "
                onClick={
                  closeNoticeDetails
                }
                aria-label="
                  Close notice
                "
              >

                ×

              </button>


              <h2>

                {
                  selectedNotice.title
                }

              </h2>


              {
                selectedNotice.createdAt && (

                  <small>

                    {
                      new Date(
                        selectedNotice.createdAt
                      ).toLocaleDateString()
                    }

                  </small>

                )
              }


              <div
                className="
                  notice-details-description
                "
              >

                {
                  selectedNotice.description
                }

              </div>


              {
                selectedNotice.image && (

                  <div
                    className="
                      notice-details-image-wrapper
                    "
                  >

                    <img
                      src={
                        getNoticeImageUrl(
                          selectedNotice.image
                        )
                      }
                      alt={
                        selectedNotice.title
                      }
                      className="
                        notice-details-image
                      "
                      onError={(event) => {

                        event.currentTarget.style.display =
                          'none'

                      }}
                    />

                  </div>

                )

              }


              <div
                className="
                  text-center
                  mt-4
                "
              >

                <button
                  type="button"
                  className="
                    btn
                    btn-secondary
                    px-4
                  "
                  onClick={
                    closeNoticeDetails
                  }
                >

                  Close

                </button>

              </div>

            </div>

          </div>

        )

      }


      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section
        className="
          py-5
          text-center
          bg-light
        "
        id="about"
        data-aos="fade-up"
      >

        <div className="container">

          <h1
            className="
              fw-bold
              display-4
            "
          >

            Welcome to{' '}

            <span
              className="
                hero-edu
              "
            >

              {firstInstituteWord}

            </span>{' '}

            {
              remainingInstituteName && (

                <span
                  className="
                    hero-portal
                  "
                >

                  {remainingInstituteName}

                </span>

              )

            }

          </h1>


          <p
            className="
              lead
              mt-3
            "
          >

            Your trusted partner for
            academic excellence.

          </p>

        </div>

      </section>


      {/* ==================================================
          PINNED NOTICE
      ================================================== */}

      {
        pinnedNotice && (

          <section
            className="
              pinned-notice
            "
          >

            <div className="container">

              <button
                type="button"
                className="
                  pinned-notice-card
                "
                onClick={() =>
                  openNoticeDetails(
                    pinnedNotice
                  )
                }
              >

                <span
                  className="
                    pin-badge
                  "
                >

                  📌 Pinned Notice

                </span>


                <div>

                  <h3>

                    {
                      pinnedNotice.title
                    }

                  </h3>


                  <p>

                    {
                      pinnedNotice.description
                    }

                  </p>

                </div>

              </button>

            </div>

          </section>

        )

      }


      {/* ==================================================
          HOME IMAGE / VIDEO SLIDER
      ================================================== */}

      <section
        className="
          home-slider
        "
      >

        <div
          className="
            home-slider-container
          "
        >

          {
            homeLoading ? (

              <div
                className="
                  home-slide
                  active
                  d-flex
                  align-items-center
                  justify-content-center
                "
              >

                <div className="text-center">

                  <div
                    className="
                      spinner-border
                      text-primary
                    "
                    role="status"
                  ></div>


                  <p className="mt-3">

                    Loading...

                  </p>

                </div>

              </div>

            ) : sliders.length === 0 ? (

              <div
                className="
                  home-slide
                  active
                  d-flex
                  align-items-center
                  justify-content-center
                "
              >

                <div className="text-center">

                  <h4>

                    Welcome to{' '}

                    {
                      settings?.instituteName ||
                      'Prerna Institute Of Excellence'
                    }

                  </h4>

                </div>

              </div>

            ) : (

              sliders.map(

                (slider, index) => (

                  <div
                    key={
                      slider._id
                    }
                    className={`
                      home-slide
                      ${
                        activeSlide === index
                          ? 'active'
                          : ''
                      }
                    `}
                  >

                    {/* IMAGE */}

                    {
                      slider.mediaType ===
                      'image' && (

                        <img
                          src={
                            getImageUrl(
                              slider.mediaUrl
                            )
                          }
                          alt={
                            slider.title ||
                            'Prerna Institute Of Excellence'
                          }
                        />

                      )
                    }


                    {/* VIDEO */}

                    {
                      slider.mediaType ===
                      'video' && (

                        <>

                          <video
                            id={
                              `home-video-${slider._id}`
                            }
                            muted={
                              videoMuted
                            }
                            playsInline
                            preload="metadata"
                            onEnded={
                              nextSlide
                            }
                          >

                            <source
                              src={
                                getImageUrl(
                                  slider.mediaUrl
                                )
                              }
                              type="video/mp4"
                            />

                          </video>


                          <button
                            type="button"
                            className="
                              video-sound-button
                            "
                            onClick={() =>
                              setVideoMuted(
                                (previous) =>
                                  !previous
                              )
                            }
                          >

                            {
                              videoMuted
                                ? '🔇'
                                : '🔊'
                            }

                          </button>

                        </>

                      )
                    }


                    {/* SLIDE TITLE */}

                    {
                      (
                        slider.title ||
                        slider.description
                      ) && (

                        <div
                          className="
                            home-slide-content
                          "
                        >

                          {
                            slider.title && (

                              <h3>

                                {
                                  slider.title
                                }

                              </h3>

                            )
                          }


                          {
                            slider.description && (

                              <p>

                                {
                                  slider.description
                                }

                              </p>

                            )
                          }

                        </div>

                      )
                    }

                  </div>

                )

              )

            )
          }


          {/* PREVIOUS */}

          {
            sliders.length > 1 && (

              <button
                type="button"
                className="
                  home-slider-prev
                "
                onClick={
                  previousSlide
                }
              >

                ❮

              </button>

            )

          }


          {/* NEXT */}

          {
            sliders.length > 1 && (

              <button
                type="button"
                className="
                  home-slider-next
                "
                onClick={
                  nextSlide
                }
              >

                ❯

              </button>

            )

          }


          {/* INDICATORS */}

          {
            sliders.length > 1 && (

              <div
                className="
                  home-slider-indicators
                "
              >

                {
                  sliders.map(

                    (slider, index) => (

                      <button
                        key={
                          slider._id
                        }
                        type="button"
                        className={

                          activeSlide === index

                            ? 'active'

                            : ''

                        }
                        onClick={() =>
                          goToSlide(
                            index
                          )
                        }
                        aria-label={
                          `Slide ${index + 1}`
                        }
                      />

                    )

                  )
                }

              </div>

            )

          }

        </div>

      </section>


      {/* ==================================================
          ABOUT US
      ================================================== */}

      <section
        className="
          py-5
          bg-white
        "
        data-aos="fade-up"
      >

        <div className="container">

          <div
            className="
              row
              align-items-center
            "
          >

            {/* IMAGE */}

            <div
              className="
                col-lg-5
                mb-4
                mb-lg-0
              "
            >

              {
                settings?.aboutImage ? (

                  <img
                    src={
                      getImageUrl(
                        settings.aboutImage
                      )
                    }
                    alt="
                      About Prerna Institute
                    "
                    className="
                      img-fluid
                      rounded
                      shadow
                    "
                  />

                ) : (

                  <div
                    className="
                      text-center
                      p-5
                      bg-light
                      rounded
                    "
                  >

                    About image not
                    available.

                  </div>

                )

              }

            </div>


            {/* CONTENT */}

            <div
              className="
                col-lg-7
              "
            >

              <h2
                className="
                  fw-bold
                  mt-2
                  mb-4
                "
              >

                About Prerna Institute
                Of Excellence

              </h2>


              <p>

                Prerna Institute Of Excellence
                Institute is a trusted educational
                institution dedicated to providing
                quality education and career-oriented
                learning for students. Our mission
                is to empower learners with knowledge,
                confidence, and practical skills that
                help them succeed in academics,
                competitive examinations, and
                professional careers.

              </p>


              <p>

                With experienced faculty members,
                modern teaching methodologies,
                well-equipped classrooms, and a
                student-focused approach, we create
                an environment where every learner
                can achieve excellence. We believe
                education is not just about passing
                examinations—it is about building
                character, confidence, leadership,
                and lifelong learning habits.

              </p>


              <p>

                At Prerna Institute Of Excellence,
                we continuously strive to maintain
                the highest academic standards
                through regular assessments,
                personalized mentoring, doubt
                clearing sessions, digital learning
                resources, and career guidance.
                Thousands of students have trusted
                us to shape their future, and we
                remain committed to helping every
                learner reach their full potential.

              </p>


              <div
                className="
                  row
                  mt-4
                "
              >

                <div className="col-md-6">

                  <p>
                    ✔ Experienced Faculty Members
                  </p>

                  <p>
                    ✔ Smart Digital Classrooms
                  </p>

                  <p>
                    ✔ Regular Mock Tests
                  </p>

                </div>


                <div className="col-md-6">

                  <p>
                    ✔ Career Guidance
                  </p>

                  <p>
                    ✔ Personalized Mentorship
                  </p>

                  <p>
                    ✔ Affordable Quality Education
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          QUICK STATS
      ================================================== */}

      <section
        className="
          py-5
          bg-light
          text-center
        "
        data-aos="fade-up"
      >

        <div className="container">

          <div className="row">

            <div className="col-md-3 mb-3">

              <h3
                className="
                  text-primary
                "
              >

                500+

              </h3>

              <p>
                Students
              </p>

            </div>


            <div className="col-md-3 mb-3">

              <h3
                className="
                  text-success
                "
              >

                50+

              </h3>

              <p>
                Qualified Teachers
              </p>

            </div>


            <div className="col-md-3 mb-3">

              <h3
                className="
                  text-danger
                "
              >

                10+

              </h3>

              <p>
                Years of Experience
              </p>

            </div>


            <div className="col-md-3 mb-3">

              <h3
                className="
                  text-warning
                "
              >

                100%

              </h3>

              <p>
                Result Guarantee
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          DIRECTOR MESSAGE
      ================================================== */}

      <section
        className="
          py-5
          bg-light
        "
      >

        <div className="container">

          <div
            className="
              row
              align-items-center
            "
          >

            {/* IMAGE */}

            <div
              className="
                col-lg-4
                text-center
                mb-4
                mb-lg-0
              "
            >

              {
                settings?.directorImage ? (

                  <img
                    src={
                      getImageUrl(
                        settings.directorImage
                      )
                    }
                    alt={
                      settings?.directorName ||
                      'Director'
                    }
                    className="
                      principal-image
                      img-fluid
                      shadow
                    "
                  />

                ) : (

                  <div
                    className="
                      text-muted
                      p-4
                    "
                  >

                    Director image
                    not available.

                  </div>

                )

              }


              <h4
                className="
                  mt-4
                  mb-1
                "
              >

                {
                  settings?.directorName ||
                  'Director'
                }

              </h4>


              <p
                className="
                  text-muted
                "
              >

                {
                  settings?.directorDesignation ||
                  'Director'
                }

              </p>

            </div>


            {/* CONTENT */}

            <div
              className="
                col-lg-8
              "
            >

              <h2 className="mb-4">

                Director's Message

              </h2>


              <p>

                At Prerna Institute, we don't
                just teach—we inspire. We believe
                that every student has the potential
                to achieve excellence when guided
                with the right knowledge, discipline,
                and encouragement.

              </p>


              <p>

                Our mission is to provide quality
                education through experienced
                faculty members, innovative teaching
                methods, and continuous academic
                support. We focus on building
                confident, responsible, and
                future-ready individuals who can
                contribute positively to society.

              </p>


              <blockquote
                className="
                  principal-quote
                "
              >

                "Education is the foundation
                of a successful future. Our
                responsibility is not only to
                teach students but also to inspire
                them to become confident,
                responsible, and lifelong learners."

              </blockquote>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          ACHIEVEMENTS PREVIEW
      ================================================== */}

      <section
        className="
          py-5
          bg-light
          text-center
        "
      >

        <div className="container">

          <h2 className="mb-3">

            Our Achievements

          </h2>


          <p>

            Our achievements reflect the
            dedication of our faculty, the
            determination of our students,
            and the continuous support of
            parents. Every success story
            motivates us to deliver even
            higher standards of education.

          </p>


          <Link
            to="/achievements"
            className="
              btn
              btn-outline-primary
              mt-3
            "
          >

            View Achievements

          </Link>

        </div>

      </section>


      {/* ==================================================
          WHY CHOOSE US
      ================================================== */}

      <section
        className="
          py-5
        "
        data-aos="fade-right"
      >

        <div
          className="
            container
            text-center
          "
        >

          <h2 className="mb-4">

            Why Choose Prerna Institute
            Of Excellence?

          </h2>


          <p className="mb-5">

            Prerna Institute Of Excellence
            is committed to delivering quality
            education through modern infrastructure,
            experienced faculty, practical learning,
            and personalized guidance. We ensure
            every student receives the attention
            and support required to achieve
            academic excellence.

          </p>


          <div className="row">

            <div className="col-md-4">

              <i
                className="
                  bi
                  bi-book
                  fs-1
                  text-primary
                "
              ></i>


              <h5 className="mt-3">

                Modern Curriculum

              </h5>


              <p>

                Updated syllabi with practical,
                real-world integration.

              </p>

            </div>


            <div className="col-md-4">

              <i
                className="
                  bi
                  bi-person-check
                  fs-1
                  text-success
                "
              ></i>


              <h5 className="mt-3">

                Experienced Faculty

              </h5>


              <p>

                Dedicated educators with proven
                success records.

              </p>

            </div>


            <div className="col-md-4">

              <i
                className="
                  bi
                  bi-building
                  fs-1
                  text-warning
                "
              ></i>


              <h5 className="mt-3">

                Smart Infrastructure

              </h5>


              <p>

                State-of-the-art facilities for
                optimal learning.

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          STUDENT & TEACHER PORTAL
      ================================================== */}

      <section
        className="
          py-5
          bg-white
        "
        data-aos="fade-up"
      >

        <div className="container">


          {/* ==========================================
              HEADING
          ========================================== */}

          <div className="text-center mb-5">

            <h2 className="fw-bold">

              Student & Teacher Portal

            </h2>


            <p className="text-muted mb-0">

              Access your dedicated portal for
              learning, communication, and
              academic management.

            </p>

          </div>


          <div
            className="
              row
              justify-content-center
              g-4
            "
          >


            {/* ==========================================
                STUDENT LOGIN
            ========================================== */}

            <div
              className="
                col-md-5
                col-lg-4
              "
            >

              <div
                className="
                  card
                  border-0
                  shadow-sm
                  h-100
                  text-center
                "
                style={{
                  borderRadius: '16px',
                }}
              >

                <div className="card-body p-4">


                  <div
                    style={{
                      width: '75px',
                      height: '75px',
                      borderRadius: '50%',
                      backgroundColor: '#e8f1ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      fontSize: '36px',
                    }}
                  >

                    🎓

                  </div>


                  <h4 className="fw-bold">

                    Student Login

                  </h4>


                  <p className="text-muted">

                    Access your student dashboard,
                    attendance, study materials,
                    exams, marks, fees, messages
                    and reports.

                  </p>


                  <Link
                    to="/student/login"
                    className="
                      btn
                      btn-primary
                      px-4
                      mt-2
                    "
                  >

                    Student Login

                  </Link>

                </div>

              </div>

            </div>


            {/* ==========================================
                TEACHER LOGIN
            ========================================== */}

            <div
              className="
                col-md-5
                col-lg-4
              "
            >

              <div
                className="
                  card
                  border-0
                  shadow-sm
                  h-100
                  text-center
                "
                style={{
                  borderRadius: '16px',
                }}
              >

                <div className="card-body p-4">


                  <div
                    style={{
                      width: '75px',
                      height: '75px',
                      borderRadius: '50%',
                      backgroundColor: '#eaf8ef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      fontSize: '36px',
                    }}
                  >

                    👨‍🏫

                  </div>


                  <h4 className="fw-bold">

                    Teacher Login

                  </h4>


                  <p className="text-muted">

                    Access your teacher dashboard,
                    attendance, assignments, study
                    materials, exams, marks,
                    announcements and student
                    communication.

                  </p>


                  <Link
                    to="/teacher/login"
                    className="
                      btn
                      btn-success
                      px-4
                      mt-2
                    "
                  >

                    Teacher Login

                  </Link>

                </div>

              </div>

            </div>


          </div>

        </div>

      </section>


      {/* ==================================================
          ADMISSIONS CTA
      ================================================== */}

      <section
        className="
          py-5
          text-center
          text-white
        "
        style={{
          backgroundColor: '#007bff',
        }}
        data-aos="fade-up"
      >

        <div className="container">

          <h3>

            Admissions Open for 2026-27

          </h3>


          <p>

            Enroll today and be part of a
            future-focused education system.

          </p>


          <Link
            to="/apply"
            className="
              btn
              btn-light
              mt-2
            "
          >

            Apply Now

          </Link>

        </div>

      </section>


    </>

  )

}


export default Home