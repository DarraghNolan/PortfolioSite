import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Accordion, AccordionItem } from '@szhsin/react-accordion';
import axios from '../axios';
import "../style.css"
import { useNavigate } from 'react-router-dom';

const DetailsDriveOff = () => {
  const [driveOff, setDriveOff] = useState(null);
  
  const location = useLocation();
  const driveOffId = location.pathname.split("/")[2];

  const [currentUserPosition, setCurrentUserPosition] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [showDeleteModal, setshowDeleteModal] = useState(false); // State to track button display

  const navigate = useNavigate()

  useEffect(() => {
    const fetchDriveOff = async () => {
      try {
        //  --  Standard Localhost Connection
        const response = await axios.get(`/driveoffs/${driveOffId}`);
        if (response.status === 200) {
          setDriveOff(response.data);
        } else {
          throw new Error('Error occurred while fetching drive-off details. Please try again.');
        }
      } catch (err) {
        console.log(err);
        console.log("Error occurred while fetching drive-off details. Please try again.");
      }
    };

    const checkCurrentUserPos = () => {
      setCurrentUserPosition(currentUser.Position); // Set the current user's position
    };
    
    checkCurrentUserPos();
    fetchDriveOff();
  }, [driveOffId]);

  const toggleDeleteModal = () => {
    setshowDeleteModal(!showDeleteModal); // Toggle the state when the button is clicked
  }
  
  const handleDelete = async (id)=>{
    try{
      //  --  Standard LocalHost Connection
      await axios.delete("/driveoffs/"+id)
      
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
        <h1 id='Drive-OffsH1'>Drive-Off Report Details</h1>
        {driveOff && (
          <div className="driveOff">
            <h2>Registration Number:</h2>
            {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
              <>
              <h2>{driveOff.RegistrationNumber}</h2>
              </>
            ) : null}
            {(currentUserPosition === "Employee") ? (
              <>
              <h2>********</h2>
              </>
            ) : null}
            <div>
              <h3>Cost:</h3>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                <h3 className='reportDetailValueh3'>€{driveOff.Cost}</h3>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                <h3 className='reportDetailValueh3'>********</h3>
                </>
              ) : null}
            </div>
            <div>
              <h3>Date:</h3>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                <h3 className='reportDetailValueh3'>{formatDate(driveOff.Date)}</h3>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                <h3 className='reportDetailValueh3'>********</h3>
                </>
              ) : null}
            </div>
            <br/>
            <div>
              <h3>Time:</h3>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                <h3 className='reportDetailValueh3'>{driveOff.Time}</h3>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                <h3 className='reportDetailValueh3'>********</h3>
                </>
              ) : null}
            </div>
            <div>
              <h3>Fuel:</h3>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                <h3 className='reportDetailValueh3'> {driveOff.FuelType}</h3>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                <h3 className='reportDetailValueh3'>********</h3>
                </>
              ) : null}
            </div>
            <div>
              <h3>Make:</h3>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                <h3 className='reportDetailValueh3'>{driveOff.Make}</h3>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                <h3 className='reportDetailValueh3'>********</h3>
                </>
              ) : null}
            </div>
            <div>
              <h3>Model:</h3>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                <h3 className='reportDetailValueh3'>{driveOff.Model}</h3>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                <h3 className='reportDetailValueh3'>********</h3>
                </>
              ) : null}
            </div>
            <br/>
            <h3>Details:</h3>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                <h4 className='formDisplayDetails'>{driveOff.Details}</h4>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                <h3 className='reportDetailValueh3'>********</h3>
                </>
              ) : null}
            <div>
              <div>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                <h3>Progress:</h3>
                <br/>
                <Accordion>
                  <button className="progress-bar-BG">
                    <div className="progressBarTopHome" id='progressBarTopDetails'>
                      <a className="progressBoolRecordedHome" style={{ display: driveOff.Recorded === 1 ? "block" : "none", borderTopLeftRadius: "35px", borderBottomLeftRadius: "35px" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                      </a>
                      <a className="progressBoolHomeBlank" style={{ display: driveOff.Recorded === 1 ? "none" : "block", borderTopLeftRadius: "35px", borderBottomLeftRadius: "35px" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                      </a>
                      <a className="progressBoolReportedHome" style={{ display: driveOff.Reported === 1 ? "block" : "none" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                      </a>
                      <a className="progressBoolHomeBlank" style={{ display: driveOff.Reported === 1 ? "none" : "blank" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                      </a>
                      <a className="progressBoolCollectedHome" style={{ display: driveOff.Collected === 1 ? "block" : "none" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                      </a>
                      <a className="progressBoolHomeBlank" style={{ display: driveOff.Collected === 1 ? "none" : "blank" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                      </a>
                      <a className="progressBoolResolvedHome" style={{ display: driveOff.Resolved === 1 ? "block" : "none", borderTopRightRadius: "35px", borderBottomRightRadius: "35px" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                      </a>
                      <a className="progressBoolHomeBlank" style={{ display: driveOff.Resolved === 1 ? "none" : "block", borderTopRightRadius: "35px", borderBottomRightRadius: "35px" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                      </a>
                    </div>
                  <AccordionItem>
                    <div>
                      <div className='progressBooleanContainer' id='recorded' style={{ borderStyle: driveOff.Recorded === 1 ? "solid" : "hidden", paddingRight: driveOff.Recorded === 1 ? "0.5rem" : "1.125rem", paddingLeft: driveOff.Recorded === 1 ? "0.5rem" : "1.125rem"}}>
                        <div style={{ display: "flex" }}>
                          <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                        </div>
                        <div className='progressBooleanValueContainer'>
                          <h4 className='progressBooleanValues'>{driveOff.Recorded === 1 ? "Recorded at: " : "Not Recorded"}</h4>
                          <div style={{ display: driveOff.Recorded === 1 ? "block" : "none" }} className='progressBooleanValueContainer'>
                            <br/>
                            <h4 className='progressBooleanValues'> {formatTimestamp(driveOff.TimeRecorded)}</h4>
                            <br/>
                            <h4 className='progressBooleanValues'> By {driveOff.RecordedUser}</h4>
                          </div>
                        </div>
                      </div>
                      <div className='progressBooleanContainer' id='reported' style={{ borderStyle: driveOff.Reported === 1 ? "solid" : "hidden", paddingRight: driveOff.Reported === 1 ? "0.5rem" : "1.125rem", paddingLeft: driveOff.Reported === 1 ? "0.5rem" : "1.125rem"}}>
                        <div style={{ display: "flex" }}>
                          <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                        </div>
                        <div className='progressBooleanValueContainer'>
                          <h4 className='progressBooleanValues'>{driveOff.Reported === 1 ? "Reported at: " : "Not Reported"}</h4>
                          <div style={{ display: driveOff.Reported === 1 ? "block" : "none" }} className='progressBooleanValueContainer'>
                            <br/>
                            <h4 className='progressBooleanValues'> {formatTimestamp(driveOff.TimeReported)}</h4>
                            <br/>
                            <h4 className='progressBooleanValues'> By {driveOff.ReportedUser}</h4>
                          </div>
                        </div>
                      </div>
                      <div className='progressBooleanContainer' id='collected' style={{ borderStyle: driveOff.Collected === 1 ? "solid" : "hidden", paddingRight: driveOff.Collected === 1 ? "0.5rem" : "1.125rem", paddingLeft: driveOff.Collected === 1 ? "0.5rem" : "1.125rem"}}>
                        <div style={{ display: "flex" }}>
                          <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                        </div>
                        <div className='progressBooleanValueContainer'>
                          <h4 className='progressBooleanValues'>{driveOff.Collected === 1 ? "Collected at: " : "Not Collected by Gardaí"}</h4>
                          <div style={{ display: driveOff.Collected === 1 ? "block" : "none" }} className='progressBooleanValueContainer'>
                            <br/>
                            <h4 className='progressBooleanValues'> {formatTimestamp(driveOff.TimeCollected)}</h4>
                            <br/>
                            <h4 className='progressBooleanValues'> By {driveOff.CollectedUser}</h4>
                            <br/>
                            <h4 className='progressBooleanValues'> Garda Name: {driveOff.CollectedGarda}</h4>
                          </div>
                        </div>
                      </div>
                      <div className='progressBooleanContainer' id='resolved' style={{ borderStyle: driveOff.Resolved === 1 ? "solid" : "hidden", paddingRight: driveOff.Resolved === 1 ? "0.5rem" : "1.125rem", paddingLeft: driveOff.Resolved === 1 ? "0.5rem" : "1.125rem"}}>
                        <div style={{ display: "flex" }}>
                          <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                        </div>
                        <div className='progressBooleanValueContainer'>
                          <h4 className='progressBooleanValues'>{driveOff.Resolved === 1 ? "Resolved at: " : "Not fully Resolved"}</h4>
                          <div style={{ display: driveOff.Resolved === 1 ? "block" : "none" }}>
                            <br/>
                            <h4 className='progressBooleanValues'> @ {formatTimestamp(driveOff.TimeResolved)}</h4>
                            <br/>
                            <h4 className='progressBooleanValues'> By {driveOff.ResolvedUser}</h4>
                          </div>
                        </div>
                      </div>
                      <div>
                        {/* <div className="progress-bar-container">
                          <button className="progress-bar">
                            <button className="progressBoolRecordedV" style={{ display: driveOff.Recorded === 1 ? "block" : "none" }}></button>
                            <button className="progressBoolReportedV" style={{ display: driveOff.Reported === 1 ? "block" : "none" }}></button>
                            <button className="progressBoolCollectedV" style={{ display: driveOff.Collected === 1 ? "block" : "none" }}></button>
                            <button className="progressBoolResolvedV" style={{ display: driveOff.Resolved === 1 ? "block" : "none" }}></button>
                          </button>
                        </div> */}
                      </div>
                    </div>
                    <br/>
                  </AccordionItem>
                  </button>
                </Accordion>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                <h3 className='reportDetailValueh3'>********</h3>
                </>
              ) : null}
              </div>
            </div>
            <div>
              <h3>Employee on Tills:</h3>
              <h3 className='reportDetailValueh3'>{driveOff.EmployeeOD}</h3>
            </div>
            <div>
              <h3>Manager on Duty:</h3>
              <h3 className='reportDetailValueh3'> {driveOff.ManagerOD}</h3>
            </div>
            <div>
              <h3>Report Author: </h3>
              <h3 className='reportDetailValueh3'> {driveOff.ReportAuthor}</h3>
            </div>
            <br/>
            <div>
              <h3>Recent changes by: </h3>
              <h3 className='reportDetailValueh3'> {driveOff.RecentAuthor}</h3>
            </div>
            <br/>
            <h3>Last Edited: {formatTimestamp(driveOff.LastEdited)}</h3>
            {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
              <>
              <div className='detailsCrudBtns'>
                <button className='defaultBtn' >
                  <Link to={`/updatedriveoff/${driveOff.id}`}>
                    <a>UPDATE</a>
                    <img className="defaultIcon" src={require('../imgs/Edit.png')} alt="Edit"/>
                  </Link>
                </button>
                <button className='defaultBtn' onClick={toggleDeleteModal}>
                  <a>DELETE</a>
                  <img className="defaultIcon" src={require('../imgs/Delete.png')} alt="Edit"/>
                </button>
              </div>
              <button className='defaultBtn' id='exportPDFBtn'>
                <Link to={`/pdfdriveoff/${driveOff.id}`}>
                  <a>EXPORT PDF</a>
                  <img className="defaultIcon" src={require('../imgs/Export.png')} alt="Edit"/>
                </Link>
              </button>
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
                    <button className='defaultBtn' onClick={()=>handleDelete(driveOff.id)}>
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

export default DetailsDriveOff;