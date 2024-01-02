import axios from "../axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import "../style.css";

const AddUsers = () => {
  const [newuser, setUser] = useState({
    Name: "",
    Position: "Employee",
    Password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      newuser.ShopId = user.ShopId;
      // Standard LocalHost Connection
      await axios.post("/users", newuser);

      navigate(`/usersmenu`);
    } catch (err) {
      console.log("The User was not Added...");
    }
  };

  return (
    <article className="form">
      <div>
        <h1>Add New User</h1>
        <div>
          <h4>
              Name:
          </h4>
          <input
            type="text"
            placeholder="Name"
            onChange={handleChange}
            name="Name"
          />
        </div>
        <div> 
          <h4>
            Position:
          </h4>
          <select
            id="ManagerODBox"
            onChange={handleChange}
            name="Position"
            value={newuser.Position} // Set the selected value
          >
            <option value="Employee">Employee</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        <div>
          <h4>
            Password:
          </h4>
          <input
            type="text"
            placeholder="Password"
            onChange={handleChange}
            name="Password"
          />
        </div>
        <button onClick={handleClick} className='defaultBtn' id="exportPDFBtn">
          <img className="defaultIcon" src={require('../imgs/NewUser.png')}></img>
          Add User
        </button>
      </div>      
    </article>
  );
};

export default AddUsers;