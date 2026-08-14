import { Link } from 'react-router-dom'

function TopLoginBar() {

  return (

    <div className="top-login-bar">

      <div className="container">

        <div className="top-login-content">

          <Link
            to="/student/login"
            className="
              top-login-btn
              student-login-btn
            "
          >

            🎓 Student Login

          </Link>


          <Link
            to="/teacher/login"
            className="
              top-login-btn
              teacher-login-btn
            "
          >

            👨‍🏫 Teacher Login

          </Link>

        </div>

      </div>

    </div>

  )

}

export default TopLoginBar