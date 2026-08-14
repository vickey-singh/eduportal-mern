import ScrollToTop from '../components/ScrollToTop'

import { Outlet } from 'react-router-dom'

import TopLoginBar from '../components/TopLoginBar'

import Navbar from '../components/Navbar'

import Footer from '../components/Footer'


function MainLayout() {

  return (

    <>

      {/* ====================================== */}
      {/* TOP LOGIN BAR */}
      {/* ====================================== */}

      <TopLoginBar />


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