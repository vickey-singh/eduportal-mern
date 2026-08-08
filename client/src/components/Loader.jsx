import { Player } from '@lottiefiles/react-lottie-player'

import animationData from '../assets/lottie/loader.json'

import '../assets/styles/loader.css'

function Loader() {

  return (

    <div className="loader-wrapper">

      {/* Animation */}
      <div className="loader-animation">

        <Player
          autoplay
          loop
          src={animationData}
          style={{ height: '250px', width: '250px' }}
        />

      </div>

      {/* Brand Text */}
      <h1 className="loader-text">

        <span className="loader-edu">
          Prerna
        </span>{' '}

        <span className="loader-portal">
          Institute Of Excellence
        </span>

      </h1>

    </div>

  )
}

export default Loader