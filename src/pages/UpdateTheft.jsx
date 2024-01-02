import axios from "../axios";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style.css";
import TextareaAutosize from 'react-textarea-autosize';

const UpdateTheft = () => {

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [theft, setTheft] = useState({
    Cost: null,
    Date: "",
    Time: "",    
    Details: "",
    Recorded: null,
    Reported: null,
    Collected: null,
    Resolved: null,
    ManagerOD: "",
    EmployeeOD: "",
    ReportAuthor: "",
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

  const [item, setItem] = useState({
    Name: "",
    Cost: "",
    Quantity: "",
  });

  const [users, setUsers] = useState([]);
  const [managerialUsers, setManagerialUsers] = useState([]);
  const [normalUsers, setNormalUsers] = useState([]);

  const [error, setError] = useState(null);
  
  const [itemList, setItemList] = useState([]);
  const [items, setItems] = useState([]); // To store existing items

  const [editedItems, setEditedItems] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const theftId = location.pathname.split("/")[2];

  useEffect(() => {
    const fetchTheft = async () => {
      try {
        const response = await axios.get(`/thefts/${theftId}`);
        const theftData = response.data;
        setTheft(theftData);
        // Fetch existing tags for this theft report
        const itemsResponse = await axios.get(`/theftsitem/${theftId}`);
        setItems(itemsResponse.data);
      } catch (err) {
        console.log(err);
        console.log("Error getting theft report data");
      }
    };

    fetchTheft();
  }, [theftId]);

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

  const handleChange = (e) => {
    setTheft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateTotalCost = () => {
    let totalCost = 0;
    for (const item of items) {
      totalCost += item.Cost * item.Quantity;
    }
    return totalCost;
  };

  const handleItemChange = async (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));

    const totalCost = calculateTotalCost();
    setTheft((prev) => ({ ...prev, Cost: totalCost }));
  };

  const handleTimeChange = (time) => {
    setTheft((prev) => ({ ...prev, Time: time }));
  };

  const handleItemClick = async (e) => {
    e.preventDefault();
    try {
      const newItem = {
        itemId: theftId,
        Name: item.Name,
        Cost: item.Cost,
        Quantity: item.Quantity,
      };
      // Then, update the list of theft items
      await axios.post("/theftsitem", newItem);

      const itemsResponse = await axios.get(`/theftsitem/${theftId}`);
      setItems(itemsResponse.data);
  
      // Update itemList and clear input fields
      setItemList((itemList) => [...itemList, newItem]);
      setItem({ Name: "", Cost: "", Quantity: "" });

    } catch (err) {
      console.log("The item was not added to the theft report...");
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`/theftsitem/individual/${id}`);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  
      // Update the total cost after deleting the item
      const totalCost = calculateTotalCost();
      // Update the theft report including the total cost
      axios.put(`/thefts/${theftId}`, { ...theft, Cost: totalCost });
    } catch (err) {
      console.log("Error deleting item:", err);
    }
  };
  
  const handleEditItemChange = (e, itemId, property) => {
    const { value } = e.target;
    setEditedItems((prevEditedItems) => ({
      ...prevEditedItems,
      [itemId]: {
        ...prevEditedItems[itemId],
        [property]: value,
      },
    }));
  
    // Update the total cost immediately after editing the item
    const totalCost = calculateTotalCost();
    // Update the theft report including the total cost
    axios.put(`/thefts/${theftId}`, { ...theft, Cost: totalCost });
  };

  const handleUpdateItem = async (itemId) => {
    try {
      const updatedItem = {
        ...items.find(item => item.id === itemId),
        ...editedItems[itemId],
      };
  
      await axios.put(`/theftsitem/${itemId}`, updatedItem);
  
      // Update the items list and clear editedItems
      setItems((prevItems) =>
        prevItems.map((prevItem) =>
          prevItem.id === itemId ? updatedItem : prevItem
        )
      );
      setEditedItems((prevEditedItems) => ({
        ...prevEditedItems,
        [itemId]: {},
      }));
  
      // Calculate the total cost after updating the item
      const totalCost = calculateTotalCost();
      setTheft((prev) => ({ ...prev, Cost: totalCost }));
  
      // Update the theft report including the total cost
      await axios.put(`/thefts/${theftId}`, { ...theft, Cost: totalCost });
  
    } catch (err) {
      console.log("Error updating item:", err);
    }
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
    

  const handleRecordedChange = async (e) =>{
    const currentTime = getCurrentTime(); // Get the current time
    theft.TimeRecorded = currentTime;
    theft.RecordedUser = currentUser.Name;

    setTheft((prev)=>({...prev, [e.target.name] : e.target.value }));
  };

  const handleReportedChange = async (e) =>{
    const currentTime = getCurrentTime(); // Get the current time
    theft.TimeReported = currentTime;
    theft.ReportedUser = currentUser.Name;

    setTheft((prev)=>({...prev, [e.target.name] : e.target.value }));
  };

  const handleCollectedChange = async (e) =>{
    const currentTime = getCurrentTime(); // Get the current time
    theft.TimeCollected = currentTime;
    theft.CollectedUser = currentUser.Name;

    setTheft((prev)=>({...prev, [e.target.name] : e.target.value }));
  };

  const handleResolvedChange = async (e) =>{
    const currentTime = getCurrentTime(); // Get the current time
    theft.TimeResolved = currentTime;
    theft.ResolvedUser = currentUser.Name;
    
    setTheft((prev)=>({...prev, [e.target.name] : e.target.value }));
  };
  
  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const currentTime = getCurrentTime(); // Get the current time
      theft.LastEdited = currentTime; // Assign it to TimeCreated
      theft.RecentAuthor = currentUser.Name;
  
      // Update the list of theft items
      await Promise.all(items.map(async (item) => {
        const updatedItem = {
          ...item,
          ...editedItems[item.id],
        };
        await axios.put(`/theftsitem/${item.id}`, updatedItem);
      }));

      const totalCost = calculateTotalCost();
      setTheft((prev) => ({ ...prev, Cost: totalCost }));

      await axios.put("/thefts/" + theftId, theft);

    } catch (err) {
      console.log("The Theft report was not updated...");
      console.log(err);
    }
  };

  const handleComplete = async (e) => {
    if (item.Name.trim() !== "") {
      handleItemClick(e);
    }
    handleClick(e);

    navigate("/searchdriveoffs");
  }

  const sortUsersAlphabetically = (users) => {
    return users.slice().sort((a, b) => a.Name.localeCompare(b.Name));
  };

  return (
    <article className="form">
      <div>
        <h1>Update Theft Report</h1>
        <h3>Mandatory Details: </h3>
        <p>Date:</p>
        <input
          id="dateInput"
          type="date"
          value={theft.Date || ""}
          onChange={handleChange}
          name="Date"
        />
        <p>Time:</p>
        <input 
          type="time" 
          id="timeInput" 
          name="Time"
          value={theft.Time || ""}
          onChange={handleChange}
        />
        <br/>
        <h3>Stolen Item Details: </h3>
        <p>Name:</p>
        <input
          type="text"
          placeholder="Name of stolen item"
          value={item.Name || ""}
          onChange={handleItemChange}
          name="Name"
        />
        <p>Cost:</p>
        <input
          type="number"
          placeholder="Cost of the individual item"
          value={item.Cost || ""}
          min="0.1"
          step="0.01"
          onChange={handleItemChange}
          name="Cost"
        />
        <p>Quantity:</p>
        <input
          type="number"
          placeholder="How many of this item was stolen? (put 1 if only 1)"
          value={item.Quantity || ""}
          step="1"
          min="1"
          onChange={handleItemChange}
          name="Quantity"
        />
        <button onClick={handleItemClick} className='defaultBtn' id="exportPDFBtn">
          ADD ITEM
          <img className="defaultIcon" src={require('../imgs/AddItems.png')}></img>
        </button>
        <h3>Edit Added Items:</h3>        
        <ul>          
          {items.map((item) => (
            <li key={item.id} className="addedItems">
              <p></p>
              <input
                type="text"
                placeholder={item.Name}
                onChange={(e) => handleEditItemChange(e, item.id, 'Name')}
              />
              <input
                type="number"
                min="0.1"
                placeholder={"€" + item.Cost}
                onChange={(e) => handleEditItemChange(e, item.id, 'Cost')}
              />
              <input
                type="number"
                min="1"
                placeholder={"X"+item.Quantity}
                onChange={(e) => handleEditItemChange(e, item.id, 'Quantity')}
              />
              <p></p>
              <div className='detailsCrudBtns'>
                <button onClick={() => handleUpdateItem(item.id)} className='defaultBtn'>
                  UPDATE
                  <img className="defaultIcon" src={require('../imgs/Edit.png')}></img>
                </button>
                <button onClick={() => deleteItem(item.id)} className='defaultBtn'>
                  DELETE
                  <img className="defaultIcon" src={require('../imgs/Delete.png')}></img>
                </button>
              </div>
            </li>
          ))}
        </ul>
        <h3>Total Cost: €{calculateTotalCost()}</h3>
        <br/>
        <p>Details:</p>
      <TextareaAutosize
        className="formDetails"
        minRows={3}
        maxRows={10}
        onChange={handleChange}
        placeholder='Details'
        name="Details"
        value={theft.Details || ""}
      />
      <h3>Progress:</h3>
      <div>
        <button id="progressFields">
          <p>Has the footage been RECORDED?</p>
          <label class="switch">
            <input
              type="checkbox"
              checked={theft.Recorded === 1} // Check if the value is 1 (true)
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
              checked={theft.Reported === 1} // Check if the value is 1 (true)
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
              checked={theft.Collected === 1} // Check if the value is 1 (true)
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
            value={theft.CollectedGarda || ""}
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
              checked={theft.Resolved === 1} // Check if the value is 1 (true)
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
              value={theft.ManagerOD || ""}
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
              value={theft.EmployeeOD || ""}
              name="EmployeeOD"
            >
              {sortUsersAlphabetically(normalUsers).map((user) => (
                <option key={user.id} value={user.Name}>{user.Name}</option>
              ))}
            </select>
          </div>
        </div>
        <br/>
        <button onClick={handleComplete} className='defaultBtn' id="exportPDFBtn">
          SAVE CHANGES
          <img className="defaultIcon" src={require('../imgs/Save.png')}></img>
        </button>
      </div>
    </article>
  );
};

export default UpdateTheft;