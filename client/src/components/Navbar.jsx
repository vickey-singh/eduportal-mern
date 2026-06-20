import { Link, NavLink } from 'react-router-dom'

// Import Navbar CSS
import '../assets/styles/navbar.css'

// Import Logo Image
import logo from '../assets/images/logo.jpeg'

function Navbar() {
    const closeNavbar = () => {
  const navbar = document.getElementById('navbarNav')

  if (navbar.classList.contains('show')) {
    navbar.classList.remove('show')
  }
}
  return (
    <>
      {/* ✅ Navbar Start */}
      <nav className="navbar navbar-expand-lg fixed-top custom-navbar">
        <div className="container">

          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img
              src={logo}
              alt="Logo"
              width="40"
              height="40"
              className="me-2 rounded-circle"
            />

            <span className="fw-bold brand-text">
              <span className="edu">Prerna</span>
              <span className="portal">Institute</span>
            </span>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navbar Links */}
          <div className="collapse navbar-collapse" id="navbarNav">

            <ul className="navbar-nav ms-auto">

              <li className="nav-item">

                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active-nav' : 'nav-link'
                  }
                  onClick={closeNavbar}
                >
                  Home
                </NavLink>

              </li>

              <li className="nav-item">
                <NavLink
                  to="/services"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active-nav' : 'nav-link'
                  }
                  onClick={closeNavbar}
                >
                  Services
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/achievements"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active-nav' : 'nav-link'
                  }
                  onClick={closeNavbar}
                >
                  Achievements
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/faculty"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active-nav' : 'nav-link'
                  }
                  onClick={closeNavbar}
                >
                  Faculty
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                to="/gallery"
                className={({ isActive }) =>
                  isActive ? 'nav-link active-nav' : 'nav-link'
                }
                onClick={closeNavbar}
              >
                Gallery
              </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                to="/testimonials"
                className={({ isActive }) =>
                  isActive ? 'nav-link active-nav' : 'nav-link'
                }
                onClick={closeNavbar}
              >
                Testimonials
              </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    isActive ? 'nav-link active-nav' : 'nav-link'
                  }
                  onClick={closeNavbar}
                >
                  Contact
                </NavLink>
              </li>

            </ul>

          </div>
        </div>
      </nav>
      {/* ✅ Navbar End */}
    </>
  )
}

export default Navbar