import axios from "../axios";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import "../style.css";
import TextareaAutosize from 'react-textarea-autosize';

const UpdateDriveOff = () =>{
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

    const [driveoff, setDriveOff] = useState({
        RegistrationNumber:"",
        Cost: null,
        Date:"",
        Time:"",
        FuelType:"",
        Make:"",
        Model:"",
        Details:"",
        Recorded: null,
        Reported: null,
        Collected: null,
        Resolved: null,
        ManagerOD: "",
        EmployeeOD:"",
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

    const [updateStatus, setUpdateStatus] = useState("");

    const navigate = useNavigate()
    const location = useLocation()

    const driveOffId = location.pathname.split("/")[2]
    
    const [selectedDate, setSelectedDate] = useState(null);

    const fuelTypes = ["Unleaded", "Diesel", "Premium Unleaded", "Premium Diesel"];

    const user = JSON.parse(localStorage.getItem("user"));

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
        // const formattedDateTime = `${hours}:${minutes}:${seconds} ${day}/${month}-${year}`;
        
        return formattedDateTime;
    };

    useEffect(() => {
        const fetchDriveOff = async () => {
          try {
            const response = await axios.get(`/driveoffs/${driveOffId}`);
            
            const driveOffData = response.data;
            setDriveOff(driveOffData);
          } catch (err) {
            console.log(err);
          }
        };
    
        fetchDriveOff();
    }, [driveOffId]);
    

    const handleChange = (e) =>{
        setDriveOff((prev)=>({...prev, [e.target.name] : e.target.value }));
    };
    

    const handleRecordedChange = (e) =>{
        const currentTime = getCurrentTime(); // Get the current time
        driveoff.TimeRecorded = currentTime;
        driveoff.RecordedUser = currentUser.Name;

        setDriveOff((prev)=>({...prev, [e.target.name] : e.target.value }));
    };

    const handleReportedChange = (e) =>{
        const currentTime = getCurrentTime(); // Get the current time
        driveoff.TimeReported = currentTime;
        driveoff.ReportedUser = currentUser.Name;

        setDriveOff((prev)=>({...prev, [e.target.name] : e.target.value }));
    };

    const handleCollectedChange = (e) =>{
        const currentTime = getCurrentTime(); // Get the current time
        driveoff.TimeCollected = currentTime;
        driveoff.CollectedUser = currentUser.Name;

        setDriveOff((prev)=>({...prev, [e.target.name] : e.target.value }));
    };

    const handleResolvedChange = (e) =>{
        const currentTime = getCurrentTime(); // Get the current time
        driveoff.TimeResolved = currentTime;
        driveoff.ResolvedUser = currentUser.Name;

        setDriveOff((prev)=>({...prev, [e.target.name] : e.target.value }));
    };


    const handleTimeChange = (time) => {
      setDriveOff((prev) => ({ ...prev, Time: time }));
    };

    const handleClick = async e =>{
        e.preventDefault()
        try{
            const currentTime = getCurrentTime(); // Get the current time
            driveoff.LastEdited = currentTime;
            driveoff.RecentAuthor = user.Name;
            await axios.put("/driveoffs/" + driveOffId, driveoff)

            navigate("/searchdriveoffs")
        }catch(err){
            console.log("The Drive Off Report was not updated...")
            console.log(err)
            setUpdateStatus("The Drive Off Report was not updated...");
        }
    };

    const sortUsersAlphabetically = (users) => {
        return users.slice().sort((a, b) => a.Name.localeCompare(b.Name));
    };

    return (
        <article className='form'>
            <div>
                <h1>Update Drive Off Report</h1>
                <h3>Mandatory Details: </h3>
                <p>Registration Number:</p>
                <input 
                    type="text"
                    placeholder='Registration Number'
                    value={driveoff.RegistrationNumber || ""}
                    onChange={handleChange}
                    name="RegistrationNumber"
                />
                <p>Cost:</p>
                <input 
                    className="costInput"
                    type="number"
                    placeholder='Cost (the value of stolen Fuel)'
                    value={driveoff.Cost || ""}
                    min="0.1"
                    step="0.01"
                    onChange={handleChange}
                    name="Cost"
                />
                <p>Date:</p>
                <input
                    id="dateInput"
                    type="date"
                    value={driveoff.Date || ""}
                    onChange={handleChange}
                    name="Date"
                />
                <p>Time:</p>
                <input 
                    type="time" 
                    id="timeInput" 
                    name="Time"
                    value={driveoff.Time || ""}
                    onChange={handleChange}
                />
                <div>
                <p>Fuel Type:</p>
                <select
                    id="ManagerODBox"
                    onChange={handleChange}
                    value={driveoff.FuelType || ""}
                    name="FuelType"
                >
                <option value="">Select Fuel Type</option>
                    {fuelTypes.map((fuelType) => (
                        <option key={fuelType} value={fuelType}>
                        {fuelType}
                        </option>
                    ))}
                </select>
            </div>
                <br/>
                <p>Make:</p>
                <input 
                    type="text" 
                    placeholder='Make (Car Manufacturer)'
                    value={driveoff.Make || ""}
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
                    value={driveoff.Model || ""}
                    onChange={handleChange}
                    name="Model"
                />
                <p>Details:</p>
                <TextareaAutosize
                    className="formDetails"
                    minRows={3}
                    maxRows={10}
                    placeholder='Details'
                    onChange={handleChange}
                    value={driveoff.Details || ""}
                    name="Details"
                />
                <h3>Progress:</h3>
                <div>
                    <button id="progressFields">
                        <p>Has the footage been RECORDED?</p>
                        <label class="switch">
                            <input
                                type="checkbox"
                                checked={driveoff.Recorded === 1} // Check if the value is 1 (true)
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
                                checked={driveoff.Reported === 1} // Check if the value is 1 (true)
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
                                checked={driveoff.Collected === 1} // Check if the value is 1 (true)
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
                            value={driveoff.CollectedGarda || ""}
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
                                checked={driveoff.Resolved === 1} // Check if the value is 1 (true)
                                onChange={(e) => handleResolvedChange({ target: { name: "Resolved", value: e.target.checked ? 1 : 0 } })}
                                name="Resolved"
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
                        value={driveoff.ManagerOD || ""}
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
                        value={driveoff.EmployeeOD || ""}
                        name="EmployeeOD"
                    >
                        {sortUsersAlphabetically(normalUsers).map((user) => (
                            <option key={user.id} value={user.Name}>{user.Name}</option>
                        ))}
                    </select>
                </div>
            </div>
                <button onClick={handleClick} className='defaultBtn' id="exportPDFBtn">
                    <img className="defaultIcon" src={require('../imgs/Save.png')}></img>
                    SAVE CHANGES
                </button>
                <div>
                    <h3>{updateStatus}</h3>
                </div>
            </div>            
        </article>
    )
}

export default UpdateDriveOff