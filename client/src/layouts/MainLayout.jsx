import ScrollToTop from '../components/ScrollToTop'

import { Outlet } from 'react-router-dom'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'


function MainLayout() {

  return (

    <>

      {/* ====================================== */}
      {/* NAVBAR */}
      {/* ====================================== */}

      <Navbar />


      {/* ====================================== */}
      {/* SCROLL TO TOP */}
      {/* ====================================== */}

      <ScrollToTop />


      {/* ====================================== */}
      {/* PAGE CONTENT */}
      {/* ====================================== */}

      <main>

        <Outlet />

      </main>


      {/* ====================================== */}
      {/* FOOTER */}
      {/* ====================================== */}

      <Footer />

    </>

  )

}


export default MainLayout