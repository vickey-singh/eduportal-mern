import AOS from 'aos'
import 'aos/dist/aos.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'

console.log("ENV =>", import.meta.env)

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css'

// Global CSS
import './assets/styles/main.css'

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

AOS.init({
  duration: 1000,
  once: true,
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)