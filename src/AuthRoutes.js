import { Navigate } from 'react-router-dom';

const AuthRoutes = ({ children }) => {
  if(localStorage.getItem("token")){
    return children;
  }

  return <Navigate to ='/' />;
}

export default AuthRoutes