import { Navigate } from 'react-router-dom'


function StudentPrivateRoute({ children }) {

  // ======================================
  // GET STUDENT TOKEN
  // ======================================

  const token =
    localStorage.getItem(
      'studentToken'
    )


  // ======================================
  // TOKEN EXISTS
  // ======================================

  if (token) {

    return children

  }


  // ======================================
  // REDIRECT LOGIN
  // ======================================

  return (

    <Navigate
      to="/student/login"
      replace
    />

  )

}


export default StudentPrivateRoute