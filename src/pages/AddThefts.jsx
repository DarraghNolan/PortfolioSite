import axios from "../axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import "../style.css";
import "react-datepicker/dist/react-datepicker.css"; // Import the date picker styles
import TextareaAutosize from 'react-textarea-autosize';

const AddTheft = () => {
  const [users, setUsers] = useState([]);
  const [managerialUsers, setManagerialUsers] = useState([]);
  const [normalUsers, setNormalUsers] = useState([]);

  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        //  --  Standard LocalHost Connect
        const resRemoteHome = await axios.get("/users");
          
        const filteredUsers = resRemoteHome.data.filter(user => user.ShopId === currentUser.ShopId);

        setUsers(filteredUsers);
      } catch (err) {
        console.log(err);
        setError("Error occurred while fetching users. Please try again.");
      }
    };

    setManagerialUsers(users.filter((user) => user.Position === "Supervisor" || user.Position === "Manager"));

    setNormalUsers(users.filter((user) => user.Position != "Master"));

    fetchAllUsers();
  }, [users]);

  const [newtheft, setTheft] = useState({
    Date: "",
    Time: "",
    Details: "",
    Recorded: 0,
    Reported: 0,
    Collected: 0,
    Resolved: 0,
    ManagerOD: "",
    EmployeeOD: "",
    ReportAuthor: "",
    TimeCreated: "",
    ShopId: 0,
    LastEdited: "",
    TimeRecorded: "",
    TimeReported: "",
    TimeCollected: "",
    TimeResolved: "",
    RecordedUser: "",
    ReportedUser: "",
    CollectedUser: "",
    CollectedGarda: "",
    ResolvedUser: "",
    RecentAuthor: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setTheft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
    

  const handleRecordedChange = async (e) =>{
    const currentTime = getCurrentTime(); // Get the current time
    newtheft.TimeRecorded = currentTime;
    newtheft.RecordedUser = currentUser.Name;

    setTheft((prev)=>({...prev, [e.target.name] : e.target.value }));
  };

  const handleReportedChange = async (e) =>{
    const currentTime = getCurrentTime(); // Get the current time
    newtheft.TimeReported = currentTime;
    newtheft.ReportedUser = currentUser.Name;

    setTheft((prev)=>({...prev, [e.target.name] : e.target.value }));
  };

  const handleCollectedChange = async (e) =>{
    const currentTime = getCurrentTime(); // Get the current time
    newtheft.TimeCollected = currentTime;
    newtheft.CollectedUser = currentUser.Name;

    setTheft((prev)=>({...prev, [e.target.name] : e.target.value }));
  };

  const handleResolvedChange = async (e) =>{
    const currentTime = getCurrentTime(); // Get the current time
    newtheft.TimeResolved = currentTime;
    newtheft.ResolvedUser = currentUser.Name;
    
    setTheft((prev)=>({...prev, [e.target.name] : e.target.value }));
  };

  const handleTimeChange = (time) => {
    setTheft((prev) => ({ ...prev, Time: time }));
  };

  const user = JSON.parse(localStorage.getItem("user"));

  const getCurrentTime = () => {
  const currentDateTime = new Date();
  currentDateTime.setHours(currentDateTime.getHours() + 1); 

  const year = currentDateTime.getFullYear();
  const month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const day = currentDateTime.getDate().toString().padStart(2, '0');
  const hours = currentDateTime.getHours().toString().padStart(2, '0');
  const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentDateTime.getSeconds().toString().padStart(2, '0');
  
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  return formattedDateTime;
};

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      newtheft.ReportAuthor = user.Name;
      newtheft.RecentAuthor = user.Name;
      newtheft.ShopId = user.ShopId;

      const currentTime = getCurrentTime(); // Get the current time
      newtheft.TimeCreated = currentTime; // Assign it to TimeCreated
      newtheft.LastEdited = currentTime; // Assign it to TimeCreated

      if(newtheft.Date === ""){
        newtheft.Date = currentTime;
      }
      if(newtheft.Time === ""){
        newtheft.Time = currentTime;
      }
      
      // Standard LocalHost Connection
      await axios.post("/thefts", newtheft);

      // Fetch all notes to find the one with the highest ID
      const response = await axios.get("/thefts");
      const thefts = response.data;
      const newTheftId = Math.max(...thefts.map((theft) => theft.id)); // Find highest ID

      navigate(`/updatetheft/${newTheftId}`);
    } catch (err) {
      console.log("The Note Report was not logged...");
    }
  };

  const sortUsersAlphabetically = (users) => {
    return users.slice().sort((a, b) => a.Name.localeCompare(b.Name));
  };

  return (
    <article className="form">
      <div>
      <h1>Add New Theft Report</h1>
      <h3>Mandatory Details: </h3>
      <p>Date:</p>
      <input
        id="dateInput"
        type="date"
        onChange={handleChange}
        name="Date"
      />
      <p>Time:</p>
      <input 
        type="time" 
        id="timeInput" 
        name="Time"
        onChange={handleChange}
      />
      <br/>
      <button onClick={handleClick} className='defaultBtn' id="exportPDFBtn">
        <a>Add Items</a>
        <img className="defaultIcon" src={require('../imgs/AddItems.png')}></img>
      </button>
      <h3></h3>
      <p>Details:</p>
      <TextareaAutosize
        className="formDetails"
        minRows={3}
        maxRows={10}
        onChange={handleChange}
        placeholder='Details'
        name="Details"
      />
      <h3>Progress:</h3>
      <div>
        <button id="progressFields">
          <p>Has the footage been RECORDED?</p>
          <label class="switch">
            <input
              type="checkbox"
              checked={newtheft.Recorded === 1} // Check if the value is 1 (true)
              onChange={(e) => handleRecordedChange({ target: { name: "Recorded", value: e.target.checked ? 1 : 0 } })}
              name="Recorded"
            />
            <span class="sliderRound" id="recordedSlider">
                <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
            </span>
          </label>
        </button>
      </div>
    <div>
        <button id="progressFields">
          <p>Has the incident been REPORTED to the Gardaí?</p>
          <label class="switch">
          <input
            type="checkbox"
            checked={newtheft.Reported === 1} // Check if the value is 1 (true)
            onChange={(e) => handleReportedChange({ target: { name: "Reported", value: e.target.checked ? 1 : 0 } })}
            name="Reported"
          />
          <span class="sliderRound" id="reportedSlider">
              <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
          </span>
          </label>
        </button>
    </div>
    <div>
        <button id="progressFields">
          <p>Has the footage been COLLECTED by Gardaí?</p>   
          <label class="switch">
            <input
              type="checkbox"
              checked={newtheft.Collected === 1} // Check if the value is 1 (true)
              onChange={(e) => handleCollectedChange({ target: { name: "Collected", value: e.target.checked ? 1 : 0 } })}
              name="Collected"
            />
            <span class="sliderRound" id="collectedSlider">
                <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
            </span>
          </label>
        </button>
        <a>
          <input 
            id="gardaNameInput"
            type="text"
            value={newtheft.CollectedGarda || ""}
            placeholder='Garda Name and Shoulder Number'
            onChange={handleChange}
            name="CollectedGarda"
          /> 
        </a>
    </div>
    <div>
        <button id="progressFields">
          <p>Has the incident been fully RESOLVED?</p>
          <label class="switch">
            <input
              type="checkbox"
              checked={newtheft.Resolved === 1} // Check if the value is 1 (true)
              onChange={(e) => handleResolvedChange({ target: { name: "Resolved", value: e.target.checked ? 1 : 0 } })}
              name="Collected"
            />
            <span class="sliderRound" id="resolvedSlider">
                <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
            </span>
          </label>
        </button>
      </div>
        <h3>Staff Details: </h3>
        <div id="staffDetails">
          {error && <div>{error}</div>}
          <div>
            <p>Manager on Duty:</p>
            <select 
              id="ManagerODBox"
              onChange={handleChange}
              name="ManagerOD"
            >
              {sortUsersAlphabetically(managerialUsers).map((user) => ( // Use filteredUsers instead of users here
                <option key={user.id} value={user.Name}>{user.Name}</option>
              ))}
            </select>
          </div>
          <br/>
          <div>
            <p>Employee on Duty:</p>
            <select 
              id="ManagerODBox"
              onChange={handleChange}
              name="EmployeeOD"
            >
            {sortUsersAlphabetically(normalUsers).map((user) => (
              <option key={user.id} value={user.Name}>{user.Name}</option>
            ))}
            </select>
          </div>
          <br/>
        </div>
      </div>      
    </article>
  );
};

export default AddTheft;