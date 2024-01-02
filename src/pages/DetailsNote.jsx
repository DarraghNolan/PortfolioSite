import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from '../axios';
import "../style.css"
import { useNavigate } from 'react-router-dom';

const DetailsNote = () => {
    const [note, setNote] = useState(null);
    const [tags, setTags] = useState([]);
  
    const location = useLocation();
    const noteId = location.pathname.split("/")[2];

    const [currentUserPosition, setCurrentUserPosition] = useState("");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [showDeleteModal, setshowDeleteModal] = useState(false); // State to track button display

    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchNote = async () => {
        try {
          const noteResponse = await axios.get(`/notes/${noteId}`);
          if (noteResponse.status === 200) {
            setNote(noteResponse.data);
          } else {
            throw new Error('Error occurred while fetching note details. Error code: Note 1.');
          }
        } catch (err) {
          console.log(err);
          console.log("Error occurred while fetching note details. Error code: Note 2.");
        }
      };
  
      const fetchTags = async () => {
        try {
          const tagsResponse = await axios.get(`/notestag/${noteId}`);
          if (tagsResponse.status === 200) {
            setTags(tagsResponse.data);
          } else {
            throw new Error('Error occurred while fetching tags. Please try again.');
          }
        } catch (err) {
          console.log(err);
          console.log("Error occurred while fetching tags. Please try again.");
        }
      };  

      const checkCurrentUserPos = () => {
        setCurrentUserPosition(currentUser.Position); // Set the current user's position
      };
      
      checkCurrentUserPos();
      fetchNote();
      fetchTags();
    }, [noteId]);

    const toggleDeleteModal = () => {
      setshowDeleteModal(!showDeleteModal); // Toggle the state when the button is clicked
    }
  
    const handleDelete = async (id)=>{
      try{

        await axios.delete("/notestag/"+id)
        //  --  Standard LocalHost Connection
        await axios.delete("/notes/"+id)

        await axios.delete("/notestag/"+id)
        
        navigate("/searchdriveoffs");
      }catch(err){
        console.log(err)
      }
    }

    const formatDate = (dateString) => {
      // Parse the input date string into a JavaScript Date object
      const inputDate = new Date(dateString);
    
      // Check if the input date is valid
      if (isNaN(inputDate)) {
        return "Invalid Date"; // Handle invalid date
      }
    
      // Format the date into "DD/MM/YYYY" format
      const day = inputDate.getDate().toString().padStart(2, '0');
      const month = (inputDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
      const year = inputDate.getFullYear();
    
      return `${day}/${month}/${year}`;
    };

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
    
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
      const year = date.getFullYear();
    
      return `${hours}:${minutes}, ${day}/${month}/${year}`;
    };

    return (
      <article>
        <div>
          <h1 id='Drive-OffsH1'>Note Report Details</h1>
          {note && (
            <div className="driveOff">
              <h2>Title:</h2>
              <h2>{note.Title}</h2>
              <div>
                <h3>Date:</h3>
                <h3 className='reportDetailValueh3'>{formatDate(note.Date)}</h3>
              </div>
              <h3>Description: </h3>
              <h4 className='formDisplayDetails'>{note.Description}</h4>
              <div>
                <h3>Report Author: </h3>
                <h3 className='reportDetailValueh3'> {note.ReportAuthor}</h3>
              </div>
              <div>
                <h4>Tags:</h4>
                {tags.map((tag) => (
                  <span key={tag.noteId} className='tags'>
                    {tag.Name}
                  </span>
                ))}
              </div>
              <br/>
              <h3>Last Edited: {formatTimestamp(note.LastEdited)}</h3>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
              <>
                <div className='detailsCrudBtns'>
                  <div>
                    <button className='defaultBtn'>
                      <Link to={`/updatenote/${note.id}`}>
                        UPDATE
                        <img className="defaultIcon" src={require('../imgs/Edit.png')} alt="Edit"/>
                      </Link>
                    </button>
                  </div>
                  <div>
                    <button className='defaultBtn' onClick={toggleDeleteModal}>
                      DELETE
                      <img className="defaultIcon" src={require('../imgs/Delete.png')} alt="Edit"/>
                    </button>
                  </div>                
                </div>
              </>
              ) : null}
              <div id='overlay' style={{ display: showDeleteModal ? 'flex' : 'none' }}>
                <div className='deleteModalOverlay'>
                  <div className='deleteModal'>
                    <h1>
                      ARE YOU SURE YOU WANT TO DELETE THIS REPORT?
                    </h1>
                    <div className='detailsCrudBtns' id='deleteModalBtns' >
                      <button className='defaultBtn' onClick={toggleDeleteModal}>
                        CANCEL
                        <img className="defaultIcon" src={require('../imgs/Back.png')} alt="Edit"/>
                      </button>
                      <button className='defaultBtn' onClick={()=>handleDelete(note.id)}>
                        DELETE
                        <img className="defaultIcon" src={require('../imgs/Delete.png')} alt="Edit"/>
                      </button>
                    </div>                  
                  </div>                  
                </div>
              </div>
            </div>
          )}
        </div>        
      </article>
    );
  };
  
  export default DetailsNote;