import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style.css"

const Login = ({ setIsLoggedIn }) => {

  const navigate = useNavigate();

  const [loginStatus, setLogInStatus] = useState("");

  return (
    <article className="form">
      <div className='loginForm'>
        <img id='loginIMG' src={require('../imgs/IncidenTracker.png')}></img>
        <h1 id='LoginH1'>Darragh Nolan Site</h1>
        <br/>
        <input 
          required type="text" 
          placeholder='Username' 
          name="Name" 
        />
        <input 
          required type="password" 
          placeholder='Password' 
          name="Password" 
        />
        <button className='defaultBtn'>
          LOGIN
          <img className="defaultIcon" src={require('../imgs/Login.png')}></img>
        </button>
      </div>
      <h2>{loginStatus}</h2>
    </article>
  );
};

export default Login;