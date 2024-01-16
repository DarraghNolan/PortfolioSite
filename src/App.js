import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import DetailsProject from './pages/DetailsProject';
// import ThreeDScene from './pages/ThreeDScene';
import Protected from './Protected';
import { AuthContext } from './AuthContext';

function App() {

  return (
    <div className="App">      
      <BrowserRouter>
          <Routes>
            <Route
              path="/*"
              element={
                <Login/>
              }
            />
            <Route
            path="/detailsproject/:id"
            element={
              <DetailsProject/>
            }>
            </Route>
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
