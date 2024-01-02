import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DriveOffs from './pages/DriveOffs';
import AddDriveOff from './pages/AddDriveOffs';
import AddNote from './pages/AddNotes';
import AddTheft from './pages/AddThefts';
import AddUser from './pages/AddUsers';
import UpdateDriveOff from './pages/UpdateDriveOff';
import UpdateNote from './pages/UpdateNote';
import UpdateTheft from './pages/UpdateTheft';
import UpdateUser from './pages/UpdateUser';
import UpdateShop from './pages/UpdateShop';
import DetailsDriveOff from './pages/DetailsDriveOff';
import DetailsNote from './pages/DetailsNote';
import DetailsTheft from './pages/DetailsTheft';
import DetailsShop from './pages/DetailsShop';
import SearchDriveOffs from './pages/SearchDriveOffs';
import PDFDriveOff from './pages/PDFDriveOff';
import PDFTheft from './pages/PDFTheft';
import UsersMenu from './pages/UsersMenu';
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
            <Route
              path="/driveoffs"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <DriveOffs />
                </Protected>
              }
            />
            <Route
              path="/adddriveoff"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <AddDriveOff />
                </Protected>
              }
            />            
            <Route
              path="/addnote"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <AddNote />
                </Protected>
              }
            />
            <Route
              path="/addtheft"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <AddTheft />
                </Protected>
              }
            />
            <Route
              path="/addusers"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <AddUser />
                </Protected>
              }
            />
            <Route
              path="/updatedriveoff/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <UpdateDriveOff />
                </Protected>
              }
            />
            <Route
              path="/updatenote/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <UpdateNote />
                </Protected>
              }
            />
            <Route
              path="/updatetheft/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <UpdateTheft />
                </Protected>
              }
            />
            <Route
              path="/updateuser/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <UpdateUser />
                </Protected>
              }
            />
            <Route
              path="/updateshop/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <UpdateShop />
                </Protected>
              }
            />
            <Route
              path="/detailsdriveoff/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <DetailsDriveOff />
                </Protected>
              }
            />
            <Route
              path="/detailsnote/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <DetailsNote />
                </Protected>
              }
            />
            <Route
              path="/detailstheft/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <DetailsTheft />
                </Protected>
              }
            />
            <Route
              path="/detailsshop/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <DetailsShop />
                </Protected>
              }
            />
            <Route
              path="/searchdriveoffs"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <SearchDriveOffs />
                </Protected>
              }
            />
            <Route
              path="/pdfdriveoff/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <PDFDriveOff />
                </Protected>
              }
            />
            <Route
              path="/pdftheft/:id"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <PDFTheft />
                </Protected>
              }
            />
            <Route
              path="/usersmenu"
              element={
                <Protected isLoggedIn={auth.isLoggedIn}>
                  <UsersMenu />
                </Protected>
              }
            />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
