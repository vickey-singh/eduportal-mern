import { useEffect, useState }
  from 'react'

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

import { FaXTwitter } from 'react-icons/fa6'

import '../assets/styles/footer.css'

function Footer() {

  const [settings,
  setSettings]

  = useState(null)

  useEffect(() => {

  fetchSettings()

}, [])

const fetchSettings =
  async () => {

    try {

      const response =
        await axios.get(
          'https://eduportal-backend-m5t1.onrender.com/api/settings'
        )

      setSettings(
        response.data
      )

    }

    catch (error) {

      console.log(error)

    }

  }

  return (

    <footer className="footer">

      <div className="container">

        <div className="footer-grid">

          {/* About */}

          <div className="footer-column">

            <h2 className="footer-logo">

              <span className="footer-edu">
                Prerna 
              </span>{' '}

              <span className="footer-portal">
                Institute
              </span>

            </h2>

            <p className="footer-description">

              Empowering students through
              quality education, innovation,
              and modern learning experiences.

              Building confident learners and
              future leaders through excellence.

            </p>

          </div>

          {/* Downloads */}

          <div className="footer-column">

            <h4>
              Downloads
            </h4>

            <ul>

              <li>

                <Link to="/downloads">
              
                  Study Material
              
                </Link>
              
              </li>
              
              <li>
              
                <Link to="/downloads">
              
                  Syllabus
              
                </Link>
              
              </li>
              
              <li>
              
                <Link to="/downloads">
              
                  Resources
              
                </Link>
              
              </li>
              
              <li>
              
                <Link to="/downloads">
              
                  Assignment
              
                </Link>
              
              </li>

            </ul>

          </div>

          {/* Contact */}

          <div className="footer-column">

            <h4>
              Contact Us
            </h4>

            <ul>

              <li>

                <FaMapMarkerAlt />

                {settings?.address}

              </li>

              <li>

                <FaPhoneAlt />

                {settings?.phone}

              </li>

              <li>

                <FaEnvelope />

                {settings?.email}

              </li>

              <li>

                <FaClock />

                Mon - Sat
                09:00 AM - 06:00 PM

              </li>

            </ul>

          </div>

          {/* Why Prerna Institute */}

          <div className="footer-column">

            <h4>
              Why Prerna Institute?
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

        {/* Divider */}

        <div className="footer-divider"></div>

        {/* Social */}

        <div className="footer-social">

          <h5>
            Follow Our Journey
          </h5>

          <div className="social-icons">

            <a
              href={
                settings?.instagram ||
                '#'
              }
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram />
            </a>

            <a
              href={
                settings?.youtube ||
                '#'
              }
              target="_blank"
              rel="noreferrer"
            >
              <FaYoutube />
            </a>

            <a
              href={
                settings?.twitter ||
                '#'
              }
              target="_blank"
              rel="noreferrer"
            >
              <FaXTwitter />
            </a>

            <a
              href={
                settings?.linkedin ||
                '#'
              }
              target="_blank"
              rel="noreferrer"
            >
              <FaLinkedin />
            </a>

          </div>

        </div>

        {/* Copyright */}

        <div className="footer-bottom">

          <p>

            © 2026

            <span>
              {' '}Prerna Institute
            </span>

            . All Rights Reserved.

          </p>

          <p className="footer-tagline">

            Empowering Students For A Better Tomorrow.

          </p>

          <p className="footer-credit">

            Designed by

            <span>
              {' '}Vickey Singh
            </span>

          </p>

        </div>

      </div>

    </footer>

  )

}

export default Footer