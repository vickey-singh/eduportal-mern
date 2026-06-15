import { Navigate } from 'react-router-dom'

function PrivateRoute({ children }) {

  // Get Token
  const token =
    localStorage.getItem('token')

  // If Token Exists
  if (token) {

    return children

  }

  // Redirect Login
  return (
    <Navigate
      to="/admin/login"
      replace
    />
  )

}

export default PrivateRoute