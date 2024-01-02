import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Protected from './Protected';
import { AuthContext } from './AuthContext';

function App() {

  const auth = useContext(AuthContext);

  return (
    <div className="App">      
      <BrowserRouter>
      <Protected isLoggedIn={auth.isLoggedIn}>
        <Navbar/>
      </Protected>
          <Routes>
            <Route
              path="/*"
              element={
                <Login isLoggedIn={auth.isLoggedIn} setIsLoggedIn={auth.logIn} />
              }
            />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
