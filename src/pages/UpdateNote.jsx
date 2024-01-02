import axios from "../axios";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style.css";
import TextareaAutosize from 'react-textarea-autosize';

const UpdateNote = () => {
  const [note, setNote] = useState({
    Title: "",
    Description: "",
    ReportAuthor: "",
    LastEdited: "",
  });

  const [tag, setTag] = useState(""); // For new tag input
  const [tags, setTags] = useState([]); // To store existing tags

  const navigate = useNavigate();
  const location = useLocation();
  const noteId = location.pathname.split("/")[2];

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`/notes/${noteId}`);
        const noteData = response.data;
        setNote(noteData);
        // Fetch existing tags for this note
        const tagsResponse = await axios.get(`/notestag/${noteId}`);
        setTags(tagsResponse.data);
      } catch (err) {
        console.log(err);
        console.log("Error getting note data");
      }
    };

    fetchNote();
  }, [noteId]);

  const handleChange = (e) => {
    setNote((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTagChange = (e) => {
    setTag(e.target.value);
  };

  const handleTagClick = async (e) => {
    e.preventDefault();
    try {
      const newTag = {
        tagId: noteId, // Assuming tagId is the noteId
        Name: tag.trim(),
      };

      await axios.post("/notestag", newTag);

      // Update the tags state with the new tag
      setTags((prevTags) => [...prevTags, newTag]);

      // Clear the input field
      setTag("");
    } catch (err) {
      console.log("The Tag was not added to the note...");
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

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const currentTime = getCurrentTime(); // Get the current time
      note.LastEdited = currentTime; // Assign it to TimeCreated
      await axios.put(`/notes/${noteId}`, note);
      navigate("/searchdriveoffs");
    } catch (err) {
      console.log("The Note was not updated...");
      console.log(err);
    }
  };

  const deleteTag = async (id) => {
    try {
      await axios.delete(`/notestag/individaul/${id}`);
      // Update the tags state to remove the deleted tag
      setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
    } catch (err) {
      console.log("Error deleting tag:", err);
    }
  };

  const handleComplete = async (e) =>{
    if (tag.trim() !== "") {
      handleTagClick(e);
    }
    handleClick(e);
  }

  return (
    <article className="form">
      <div>
        <h1>Update Note</h1>
        <h3>Mandatory Details: </h3>
        <p>Title:</p>
        <input
          type="text"
          placeholder="Title"
          value={note.Title}
          onChange={handleChange}
          name="Title"
        />
        <p>Date:</p>
        <input
          id="dateInput"
          type="date"
          value={note.Date}
          onChange={handleChange}
          name="Date"
        />
        <p>Details:</p>
        <TextareaAutosize
          className="formDetails"
          minRows={3}
          maxRows={10}
          onChange={handleChange}
          value={note.Description || ""}
          placeholder='Description'
          name="Description"
        />
        <br/>
        <div>
          <p>Tag Name:</p>
          <input
            type="text"
            placeholder="Tag"
            value={tag}
            onChange={handleTagChange}
            name="Name"
          />
          <button onClick={handleTagClick} className='defaultBtn' id='exportPDFBtn'>
            <img className="defaultIcon" src={require('../imgs/AddTag.png')}/>
            <a>ADD TAG</a>
          </button>
        </div>
        {/* Display Existing Tags */}
        <h3>Tags:</h3>
        <div className="added-tags">
          {tags.map((tag) => (
            <span key={tag.id} className="tags">
              {tag.Name}
              <button onClick={() => deleteTag(tag.id)}> (delete) </button>
            </span>
          ))}
        </div>

        <button onClick={handleComplete} className='defaultBtn' id='exportPDFBtn'>
          <img className="defaultIcon" src={require('../imgs/Save.png')}></img>
          <a>SAVE CHANGES</a>
        </button>
      </div>
    </article>
  );
};

export default UpdateNote;