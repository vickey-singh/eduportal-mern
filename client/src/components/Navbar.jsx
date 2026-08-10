import { useEffect, useRef, useState } from 'react'

import {
  Link,
  NavLink,
} from 'react-router-dom'

// Import Navbar CSS
import '../assets/styles/navbar.css'

// Import Logo Image
import logo from '../assets/images/logo.jpeg'


function Navbar() {

  // ======================================
  // ADMISSION DROPDOWN STATE
  // ======================================

  const [studentMenu, setStudentMenu] =
    useState(false)


  // ======================================
  // ADMISSION DROPDOWN REF
  // ======================================

  const admissionRef =
    useRef(null)


  // ======================================
  // CLOSE MOBILE NAVBAR
  // ======================================

  const closeNavbar = () => {

    const navbar =
      document.getElementById(
        'navbarNav'
      )

    if (
      navbar &&
      navbar.classList.contains('show')
    ) {

      navbar.classList.remove('show')

    }

  }


  // ======================================
  // CLOSE ADMISSION DROPDOWN
  // ======================================

  const closeStudentMenu = () => {

    setStudentMenu(false)

  }


  // ======================================
  // TOGGLE ADMISSION DROPDOWN
  // ======================================

  const toggleStudentMenu = (
    event
  ) => {

    event.stopPropagation()

    setStudentMenu(
      (previous) => !previous
    )

  }


  // ======================================
  // NORMAL NAVIGATION CLICK
  // ======================================

  const handleNavClick = () => {

    closeNavbar()

    closeStudentMenu()

  }


  // ======================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ======================================

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        // Desktop + Mobile
        if (
          admissionRef.current &&
          !admissionRef.current.contains(
            event.target
          )
        ) {

          setStudentMenu(false)

        }

        // Mobile Navbar
        if (
          window.innerWidth < 992
        ) {

          const navbar =
            document.getElementById(
              'navbarNav'
            )

          const toggler =
            document.querySelector(
              '.navbar-toggler'
            )


          if (
            navbar &&
            navbar.classList.contains(
              'show'
            ) &&
            !navbar.contains(
              event.target
            ) &&
            !toggler?.contains(
              event.target
            )
          ) {

            closeNavbar()

            closeStudentMenu()

          }

        }

      }


    document.addEventListener(
      'click',
      handleOutsideClick
    )


    return () => {

      document.removeEventListener(
        'click',
        handleOutsideClick
      )

    }

  }, [])


  // ======================================
  // CLOSE MOBILE NAVBAR ON SCROLL
  // ======================================

  useEffect(() => {

    const handleScroll = () => {

      if (
        window.innerWidth >= 992
      ) {

        return

      }


      const navbar =
        document.getElementById(
          'navbarNav'
        )


      if (
        navbar &&
        navbar.classList.contains(
          'show'
        )
      ) {

        closeNavbar()

        closeStudentMenu()

      }

    }


    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    )


    return () => {

      window.removeEventListener(
        'scroll',
        handleScroll
      )

    }

  }, [])


  // ======================================
  // CLOSE DROPDOWN ON ESC
  // ======================================

  useEffect(() => {

    const handleEscape = (
      event
    ) => {

      if (
        event.key === 'Escape'
      ) {

        closeStudentMenu()

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


  return (

    <>
      {/* ====================================== */}
      {/* NAVBAR START */}
      {/* ====================================== */}

      <nav
        className="
          navbar
          navbar-expand-lg
          navbar-dark
          custom-navbar
          shadow-sm
          sticky-top
        "
      >

        <div className="container">


          {/* ================================== */}
          {/* LOGO */}
          {/* ================================== */}

          <Link
            className="
              navbar-brand
              d-flex
              align-items-center
            "
            to="/"
            onClick={
              handleNavClick
            }
          >

            <img
              src={logo}
              alt="Logo"
              width="40"
              height="40"
              className="
                me-2
                rounded-circle
              "
            />


            <span className="fw-bold brand-text">

              <span className="edu">
                Prerna
              </span>

              {' '}

              <span className="portal">

                Institute
                <br />
                Of Excellence

              </span>

            </span>

          </Link>


          {/* ================================== */}
          {/* MOBILE TOGGLE */}
          {/* ================================== */}

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => {

              closeStudentMenu()

            }}
          >

            <span className="navbar-toggler-icon"></span>

          </button>


          {/* ================================== */}
          {/* NAVBAR LINKS */}
          {/* ================================== */}

          <div
            className="
              collapse
              navbar-collapse
            "
            id="navbarNav"
          >

            <ul className="navbar-nav ms-auto">


              {/* ================================== */}
              {/* HOME */}
              {/* ================================== */}

              <li className="nav-item">

                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-link active-nav'
                      : 'nav-link'
                  }
                  onClick={
                    handleNavClick
                  }
                >

                  Home

                </NavLink>

              </li>


              {/* ================================== */}
              {/* SERVICES */}
              {/* ================================== */}

              <li className="nav-item">

                <NavLink
                  to="/services"
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-link active-nav'
                      : 'nav-link'
                  }
                  onClick={
                    handleNavClick
                  }
                >

                  Services

                </NavLink>

              </li>


              {/* ================================== */}
              {/* ACHIEVEMENTS */}
              {/* ================================== */}

              <li className="nav-item">

                <NavLink
                  to="/achievements"
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-link active-nav'
                      : 'nav-link'
                  }
                  onClick={
                    handleNavClick
                  }
                >

                  Achievements

                </NavLink>

              </li>


              {/* ================================== */}
              {/* FACULTY */}
              {/* ================================== */}

              <li className="nav-item">

                <NavLink
                  to="/faculty"
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-link active-nav'
                      : 'nav-link'
                  }
                  onClick={
                    handleNavClick
                  }
                >

                  Faculty

                </NavLink>

              </li>


              {/* ================================== */}
              {/* GALLERY */}
              {/* ================================== */}

              <li className="nav-item">

                <NavLink
                  to="/gallery"
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-link active-nav'
                      : 'nav-link'
                  }
                  onClick={
                    handleNavClick
                  }
                >

                  Gallery

                </NavLink>

              </li>


              {/* ================================== */}
              {/* ADMISSION DROPDOWN */}
              {/* ================================== */}

              <li
                ref={admissionRef}
                className={`
                  nav-item
                  admission-dropdown
                  ${
                    studentMenu
                      ? 'dropdown-open'
                      : ''
                  }
                `}
              >

                {/* Admission Button */}

                <button
                  type="button"
                  className="
                    nav-link
                    admission-dropdown-btn
                  "
                  onClick={
                    toggleStudentMenu
                  }
                  aria-expanded={
                    studentMenu
                  }
                >

                  Admission

                  <span className="ms-1">
                    ▾
                  </span>

                </button>


                {/* ==================================
                    DROPDOWN MENU
                ================================== */}

                <div
                  className="
                    admission-dropdown-menu
                  "
                >

                  {/* New Admission */}

                  <NavLink
                    to="/apply"
                    className={({ isActive }) =>
                      isActive
                        ? `
                          admission-dropdown-item
                          active-dropdown-item
                        `
                        : `
                          admission-dropdown-item
                        `
                    }
                    onClick={
                      handleNavClick
                    }
                  >

                    New Admission

                  </NavLink>


                  {/* Existing Student */}

                  <NavLink
                    to="/existing-student"
                    className={({ isActive }) =>
                      isActive
                        ? `
                          admission-dropdown-item
                          active-dropdown-item
                        `
                        : `
                          admission-dropdown-item
                        `
                    }
                    onClick={
                      handleNavClick
                    }
                  >

                    Existing Student

                  </NavLink>

                </div>

              </li>


              {/* ================================== */}
              {/* TESTIMONIALS */}
              {/* ================================== */}

              <li className="nav-item">

                <NavLink
                  to="/testimonials"
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-link active-nav'
                      : 'nav-link'
                  }
                  onClick={
                    handleNavClick
                  }
                >

                  Testimonials

                </NavLink>

              </li>


              {/* ================================== */}
              {/* CONTACT */}
              {/* ================================== */}

              <li className="nav-item">

                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    isActive
                      ? 'nav-link active-nav'
                      : 'nav-link'
                  }
                  onClick={
                    handleNavClick
                  }
                >

                  Contact

                </NavLink>

              </li>

            </ul>

          </div>

        </div>

      </nav>

      {/* ====================================== */}
      {/* NAVBAR END */}
      {/* ====================================== */}

    </>

  )

}


export default Navbar