import {
  useEffect,
  useState,
} from 'react'

import axios
from 'axios'

import { Link }
from 'react-router-dom'

import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from 'react-icons/fa'

import { FaXTwitter }
from 'react-icons/fa6'

import '../assets/styles/footer.css'


// ======================================
// API BASE URL
// ======================================

const API_BASE_URL =
  'https://eduportal-backend-m5t1.onrender.com'


function Footer() {

  // ======================================
  // SETTINGS
  // ======================================

  const [settings,
    setSettings] =
    useState(null)


  // ======================================
  // FETCH SETTINGS
  // ======================================

  useEffect(() => {

    fetchSettings()

  }, [])


  // ======================================
  // GET SETTINGS
  // ======================================

  const fetchSettings =
    async () => {

      try {

        const response =
          await axios.get(
            `${API_BASE_URL}/api/settings`
          )


        setSettings(
          response.data
        )

      }

      catch (error) {

        console.log(
          'Footer Settings Error:',
          error
        )

      }

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
  //
  // Example:
  //
  // Prerna Institute Of Excellence
  //
  // Prerna
  // Institute Of Excellence
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

    <footer className="footer">

      <div className="container">

        <div className="footer-grid">


          {/* ==================================================
              ABOUT
          ================================================== */}

          <div className="footer-column">

            <h2 className="footer-logo">

              <span
                className="
                  footer-edu
                "
              >

                {
                  firstInstituteWord
                }

              </span>{' '}


              {
                remainingInstituteName && (

                  <span
                    className="
                      footer-portal
                    "
                  >

                    {
                      remainingInstituteName
                    }

                  </span>

                )

              }

            </h2>


            <p
              className="
                footer-description
              "
            >

              Empowering students through
              quality education, innovation,
              and modern learning experiences.

              Building confident learners and
              future leaders through excellence.

            </p>

          </div>


          {/* ==================================================
              DOWNLOADS
          ================================================== */}

          <div className="footer-column">

            <h4>
              Downloads
            </h4>


            <ul>

              <li>

                <Link
                  to="/downloads"
                >

                  Study Material

                </Link>

              </li>


              <li>

                <Link
                  to="/downloads"
                >

                  Syllabus

                </Link>

              </li>


              <li>

                <Link
                  to="/downloads"
                >

                  Resources

                </Link>

              </li>


              <li>

                <Link
                  to="/downloads"
                >

                  Assignment

                </Link>

              </li>

            </ul>

          </div>


          {/* ==================================================
              CONTACT
          ================================================== */}

          <div className="footer-column">

            <h4>
              Contact Us
            </h4>


            <ul>

              <li>

                <FaMapMarkerAlt />

                {
                  settings?.address ||
                  ''
                }

              </li>


              <li>

                <FaPhoneAlt />

                {
                  settings?.phone ||
                  ''
                }

              </li>


              <li>

                <FaEnvelope />

                {
                  settings?.email ||
                  ''
                }

              </li>


              <li>

                <FaClock />

                Mon - Sat
                09:00 AM - 06:00 PM

              </li>

            </ul>

          </div>


          {/* ==================================================
              WHY INSTITUTE
          ================================================== */}

          <div className="footer-column">

            <h4>

              Why {instituteName}?

            </h4>


            <ul>

              <li>
                ✓ Experienced Faculty
              </li>


              <li>
                ✓ Modern Infrastructure
              </li>


              <li>
                ✓ Student-Centric Learning
              </li>


              <li>
                ✓ Career Focused Education
              </li>

            </ul>

          </div>

        </div>


        {/* ==================================================
            DIVIDER
        ================================================== */}

        <div
          className="
            footer-divider
          "
        ></div>


        {/* ==================================================
            SOCIAL
        ================================================== */}

        <div
          className="
            footer-social
          "
        >

          <h5>
            Follow Our Journey
          </h5>


          <div
            className="
              social-icons
            "
          >

            {/* ==========================================
                INSTAGRAM
            ========================================== */}

            <a
              href={
                settings?.instagram ||
                '#'
              }
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >

              <FaInstagram />

            </a>


            {/* ==========================================
                YOUTUBE
            ========================================== */}

            <a
              href={
                settings?.youtube ||
                '#'
              }
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >

              <FaYoutube />

            </a>


            {/* ==========================================
                X / TWITTER
            ========================================== */}

            <a
              href={
                settings?.twitter ||
                '#'
              }
              target="_blank"
              rel="noreferrer"
              aria-label="X / Twitter"
            >

              <FaXTwitter />

            </a>


            {/* ==========================================
                LINKEDIN
            ========================================== */}

            <a
              href={
                settings?.linkedin ||
                '#'
              }
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >

              <FaLinkedin />

            </a>

          </div>

        </div>


        {/* ==================================================
            COPYRIGHT
        ================================================== */}

        <div
          className="
            footer-bottom
          "
        >

          {/* COPYRIGHT */}

          <p>

            © 2026

            <span>

              {' '}
              {instituteName}

            </span>

            . All Rights Reserved.

          </p>


          {/* TAGLINE */}

          <p
            className="
              footer-tagline
            "
          >

            Empowering Students For
            A Better Tomorrow.

          </p>


          {/* DEVELOPER CREDIT */}

          <p
            className="
              footer-credit
            "
          >

            Designed & Developed by{' '}

            <a
              href="
                https://vickey-singh.netlify.app/
              "
              target="_blank"
              rel="noreferrer"
            >

              Vickey Singh

            </a>

          </p>

        </div>

      </div>

    </footer>

  )

}


export default Footer