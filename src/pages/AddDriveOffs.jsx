import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css"; // Import the date picker styles
import TextareaAutosize from 'react-textarea-autosize';
import axios from "../axios";
import { useNavigate } from "react-router-dom";
import "../style.css";

const AddDriveOff = () => {
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

    const [newdriveoff, setDriveOff] = useState({
        RegistrationNumber: "",
        Cost: "",
        Date: "",
        Time: "",
        FuelType: "",
        Make: "",
        Model: "",
        Details: "",
        Recorded: 0,
        Reported: 0,
        Collected: 0,
        Resolved: 0,
        EmployeeOD: "",
        ManagerOD: "",
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

    const fuelTypes = ["Unleaded", "Diesel", "Premium Unleaded", "Premium Diesel"];

    const navigate = useNavigate()

    const handleChange = (e) => {
        setDriveOff((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    

    const handleRecordedChange = (e) =>{
        const currentTime = getCurrentTime(); // Get the current time
        newdriveoff.TimeRecorded = currentTime;
        newdriveoff.RecordedUser = currentUser.Name;

        setDriveOff((prev)=>({...prev, [e.target.name] : e.target.value }));
    };

    const handleReportedChange = (e) =>{
        const currentTime = getCurrentTime(); // Get the current time
        newdriveoff.TimeReported = currentTime;
        newdriveoff.ReportedUser = currentUser.Name;

        setDriveOff((prev)=>({...prev, [e.target.name] : e.target.value }));
    };

    const handleCollectedChange = (e) =>{
        const currentTime = getCurrentTime(); // Get the current time
        newdriveoff.TimeCollected = currentTime;
        newdriveoff.CollectedUser = currentUser.Name;

        setDriveOff((prev)=>({...prev, [e.target.name] : e.target.value }));
    };

    const handleResolvedChange = (e) =>{
        const currentTime = getCurrentTime(); // Get the current time
        newdriveoff.TimeResolved = currentTime;
        newdriveoff.ResolvedUser = currentUser.Name;

        setDriveOff((prev)=>({...prev, [e.target.name] : e.target.value }));
    };

    const handleTimeChange = (time) => {
        setDriveOff((prev) => ({ ...prev, Time: time }));
    };

    const getCurrentTime = () => {
        const currentDateTime = new Date();
        currentDateTime.setHours(currentDateTime.getHours()); 
    
        const year = currentDateTime.getFullYear();
        const month = (currentDateTime.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const day = currentDateTime.getDate().toString().padStart(2, '0');
        const hours = currentDateTime.getHours().toString().padStart(2, '0');
        const minutes = currentDateTime.getMinutes().toString().padStart(2, '0');
        const seconds = currentDateTime.getSeconds().toString().padStart(2, '0');
        
        const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        
        return formattedDateTime;
    };

    const sortUsersAlphabetically = (users) => {
      return users.slice().sort((a, b) => a.Name.localeCompare(b.Name));
    };

    const user = JSON.parse(localStorage.getItem("user"));

    const handleClick = async (e) => {
        e.preventDefault();
        try {
          // Set the ReportAuthor to the user's Name
          newdriveoff.ReportAuthor = user.Name;
          newdriveoff.RecentAuthor = user.Name;
          newdriveoff.ShopId = user.ShopId;

          const currentTime = getCurrentTime(); // Get the current time
          newdriveoff.TimeCreated = currentTime; // Assign it to TimeCreated
          newdriveoff.LastEdited = currentTime; // Assign it to TimeCreated

          if(newdriveoff.Date === ""){
            newdriveoff.Date = currentTime;
          }
          if(newdriveoff.Time === ""){
            newdriveoff.Time = currentTime;
          }
          
          await axios.post("/driveoffs", newdriveoff);
          navigate("/searchdriveoffs");
        } catch (err) {
          console.log("The Drive Off Report was not logged...");
        }
    };

    return (
        <article className='form'>
            <div>
            <h1>Add New Drive Off Report</h1>
            <h3>Mandatory Details: </h3>
            <p>Registration Number:</p>
            <input 
                type="text"
                placeholder='Registration Number'
                onChange={handleChange}
                name="RegistrationNumber"
            /> 
            <p>Cost:</p>
            <input 
                type="number"
                min="0.1"
                placeholder='Cost (the value of stolen Fuel)'
                onChange={handleChange}
                name="Cost"
            />
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
                value={newdriveoff.Time}
                onChange={handleChange}
            />
            <p>Fuel Type:</p>
            <select
                id="ManagerODBox"
                onChange={handleChange}
                value={newdriveoff.FuelType}
                name="FuelType"
            >
            <option value="">Select Fuel Type</option>
                {fuelTypes.map((fuelType) => (
                    <option key={fuelType} value={fuelType}>
                    {fuelType}
                    </option>
                ))}
            </select>
            <p>Make:</p>
            <input 
                type="text" 
                placeholder='Make (Car Manufacturer)'
                onChange={handleChange}
                name="Make"
            />
            <br/>
            <br/>
            <br/>
            <p>Model:</p>
            <input 
                type="text" 
                placeholder='Model (Car Type)'
                onChange={handleChange}
                name="Model"
            />
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
                            checked={newdriveoff.Recorded === 1} // Check if the value is 1 (true)
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
                                checked={newdriveoff.Reported === 1} // Check if the value is 1 (true)
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
                            checked={newdriveoff.Collected === 1} // Check if the value is 1 (true)
                            onChange={(e) => handleCollectedChange({ target: { name: "Collected", value: e.target.checked ? 1 : 0 } })}
                            name="Collected"
                        />
                        <span class="sliderRound" id="collectedSlider">
                            <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                        </span>
                    </label>
                </button>  
                <input 
                    id="gardaNameInput"
                    type="text"
                    placeholder='Garda Name and Shoulder Number'
                    onChange={handleChange}
                    name="CollectedGarda"
                />            
            </div>
            <div>
                <button id="progressFields">
                    <p>Has the incident been fully RESOLVED?</p>
                    <label class="switch">
                        <input
                            type="checkbox"
                            checked={newdriveoff.Resolved === 1} // Check if the value is 1 (true)
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
            </div>
            <button onClick={handleClick} className='defaultBtn' id="exportPDFBtn">
                <img className="defaultIcon" src={require('../imgs/Save.png')} alt="Drive Off"></img>
                Save New Drive Off Report
            </button>
            </div>
        </article>
    )
}

export default AddDriveOff