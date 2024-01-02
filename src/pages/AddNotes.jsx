import axios from "../axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import "../style.css";
import TextareaAutosize from 'react-textarea-autosize';

const AddNote = () => {
  const [newnote, setNote] = useState({
    Title: "",
    Description: "",
    ReportAuthor: "",
    TimeCreated: "",
    LastEdited: "",
    Date: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setNote((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const currentUser = JSON.parse(localStorage.getItem("user"));

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

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      newnote.ReportAuthor = currentUser.Name;
      newnote.ShopId = currentUser.ShopId;

      const currentTime = getCurrentTime(); // Get the current time
      newnote.TimeCreated = currentTime; // Assign it to TimeCreated
      newnote.LastEdited = currentTime; // Assign it to TimeCreated

      if(newnote.Date === ""){
        newnote.Date = currentTime;
      }
      
      await axios.post("/notes", newnote);

      // Fetch all notes to find the one with the highest ID
      const response = await axios.get("/notes");
      const notes = response.data;
      const newNoteId = Math.max(...notes.map((note) => note.id)); // Find highest ID

      navigate(`/updatenote/${newNoteId}`);
    } catch (err) {
      console.log("The Note Report was not logged...");
    }
  };

  return (
    <article className="form">
      <div>
        <h1>Add New Note</h1>
        <p>Title:</p>
        <input
          type="text"
          placeholder="Title"
          onChange={handleChange}
          name="Title"
        />
        <p>Date:</p>
        <input
          id="dateInput"
          type="date"
          onChange={handleChange}
          name="Date"
        />
        <p>Details:</p>
        <TextareaAutosize
          className="formDetails"
          minRows={3}
          maxRows={10}
          onChange={handleChange}
          placeholder='Details'
          name="Description"
        />

        <button onClick={handleClick} className='defaultBtn' id="exportPDFBtn">
          Add Tags
          <img className="defaultIcon" src={require('../imgs/Edit.png')} alt="Edit"/>
        </button>
      </div>      
    </article>
  );
};

export default AddNote;