import ScrollToTop from '../components/ScrollToTop'

import { Outlet } from 'react-router-dom'

import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MainLayout() {
  return (
    <>
  <Navbar />

  <ScrollToTop />

  <main className="pt-5 mt-5">
    <Outlet />
  </main>

  <Footer />
</>
  )
}

export default MainLayout