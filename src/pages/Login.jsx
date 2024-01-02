import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import "../style.css"

const Login = ({ setIsLoggedIn }) => {

  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [shopId, setShopId] = useState(""); // Add shopId state

  const [loginStatus, setLogInStatus] = useState("");

  const [error, setError] = useState(null);

  const [shops, setShops] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllShops = async () => {
      try {
        const resRemoteHome = await axios.get("/shops");
        setShops(resRemoteHome.data);
      } catch (err) {
        console.log(err);
        setError("Error occurred while fetching shops. Please try again.");
      }
    };
    fetchAllShops();
  }, []); // Only fetch shops once

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if a shop is selected
    if (!shopId) {
      setError("Please select a shop.");
      return;
    }

    axios.post(
      "/login", {
      Name: name,
      Password: password,
      ShopId: shopId,
    }).then((response) => {

      if (response.data.message) {
        console.log(response);
        setError(response.data.message);
        setLogInStatus("login failed");
        setIsLoggedIn(false); // Set isLoggedIn to false for incorrect credentials
      } else {
        if (response.data.ShopId != shopId) { // Check if shopId matches
          setError("Selected shop does not match the user's shop.");
          setIsLoggedIn(false);
        } else {
          localStorage.setItem("user", JSON.stringify(response.data));
          console.log(response);
          setError("");
          setIsLoggedIn(true); // Set isLoggedIn to true for correct credentials
          navigate("/searchdriveoffs");
        }
      }
    })
    .catch((error) => {
      console.log(error);
      setError("Invalid username or password");
      setLogInStatus("");
    });
  }

  const handleChange = (e) => {
    // Update the selected shop ID when the dropdown changes
    setShopId(e.target.value);
  };

  return (
    <article className="form">
      <div className='loginForm'>
        <img id='loginIMG' src={require('../imgs/IncidenTracker.png')}></img>
        <h1 id='LoginH1'>IncidenTracker</h1>
        <br/>
        {error && <div>{error}</div>}
        <div>
          <p>Select Shop:</p>
          <select 
            id="ManagerODBox"
            onChange={handleChange}
            value={shopId} // Bind the selected value to the shopId state
          >
            <option value="">Select a shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>{shop.Name}</option> // Set the value to shop.id
            ))}
          </select>
        </div>
        <input 
          required type="text" 
          placeholder='Username' 
          name="Name" 
          onChange={(e) =>{
            setName(e.target.value);
          }}
        />
        <input 
          required type="password" 
          placeholder='Password' 
          name="Password" 
          onChange={(e) =>{
            setPassword(e.target.value);
          }}
        />
        <button className='defaultBtn' onClick={handleSubmit}>
          LOGIN
          <img className="defaultIcon" src={require('../imgs/Login.png')}></img>
        </button>
      </div>
      <h2>{loginStatus}</h2>
    </article>
  );
};

export default Login;