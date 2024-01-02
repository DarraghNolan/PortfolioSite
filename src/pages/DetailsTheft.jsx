import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from '../axios';
import "../style.css"
import { Accordion, AccordionItem } from '@szhsin/react-accordion';

const DetailsTheft = () => {
    const [theft, setTheft] = useState(null);
    const [items, setItems] = useState([]);

    const location = useLocation();
    const theftId = location.pathname.split("/")[2];

    const [currentUserPosition, setCurrentUserPosition] = useState("");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [showDeleteModal, setshowDeleteModal] = useState(false); // State to track button display

    const navigate = useNavigate();

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [theftResponse, itemsResponse] = await Promise.all([
            axios.get(`/thefts/${theftId}`),
            axios.get(`/theftsitem/${theftId}`)
          ]);

          if (theftResponse.status === 200) {
            const theftData = theftResponse.data;
            setTheft(theftData);
          }

          if (itemsResponse.status === 200) {
            const itemsData = itemsResponse.data;
            setItems(itemsData);
          }
        } catch (err) {
          console.log(err);
        }
      };

      const checkCurrentUserPos = () => {
          setCurrentUserPosition(currentUser.Position); // Set the current user's position
      };
      
      checkCurrentUserPos();

      fetchData();
    }, [theftId]);

    // Calculate the total cost of stolen items
    const calculateTotalCost = () => {
      let totalCost = 0;
      for (const item of items) {
        totalCost += item.Cost * item.Quantity;
      }
      return totalCost;
    };

    const toggleDeleteModal = () => {
      setshowDeleteModal(!showDeleteModal); // Toggle the state when the button is clicked
    }

    const handleDelete = async (id) => {
      try {
        // Delete items associated with the theft report
        await axios.delete(`/theftsitem/${id}`);
        // Delete the theft report itself
        await axios.delete(`/thefts/${id}`);
        await axios.delete(`/theftsitem/${id}`);

        navigate("/searchdriveoffs");
      } catch (err) {
        console.log(err);
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
          <h1 id='Drive-OffsH1'>Theft Report Details</h1>
          {theft && (
            <div className="driveOffs">
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                  <div>
                    <h3>Date:</h3>
                    <h3 className='reportDetailValueh3'>{formatDate(theft.Date)}</h3>
                  </div>
                  <div>
                    <h3>Time:</h3>
                    <h3 className='reportDetailValueh3'>{theft.Time}</h3>
                  </div>
                  <br/>
                  <div className="items">
                    <h4>Stolen items:</h4>
                    {items.map((item) => (
                      <h5 key={item.theftId}>
                        {item.Quantity}X {item.Name}, €{item.Cost} each
                      </h5>
                    ))}
                  </div>
                  <br/>
                  <div>
                    <h3>Total Cost of Stolen Items:</h3>
                    <h3 className='reportDetailValueh3'>  €{calculateTotalCost()}</h3>
                  </div>                  
                  <br/>
                  <h3>Details: </h3>
                  <h4 className='formDisplayDetails'>{theft.Details}</h4>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                  <div>
                    <h3>Date:</h3>
                    <h3 className='reportDetailValueh3'>********</h3>
                  </div>
                  <div>
                    <h3>Time:</h3>
                    <h3 className='reportDetailValueh3'>********</h3>
                  </div>
                  <br/>
                  <div className="items">
                    <h4>Stolen items:</h4>
                    {items.map((item) => (
                      <h5 key={item.theftId}>
                        ********
                      </h5>
                    ))}
                    <h3>Total Cost of Stolen Items:</h3>
                    <h3 className='reportDetailValueh3'>  €********</h3>
                  </div>
                  <br/>
                  <h3>Details: </h3>
                  <h4 className='formDisplayDetails'>********</h4>
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
                      <a className="progressBoolRecordedHome" style={{ display: theft.Recorded === 1 ? "block" : "none", borderTopLeftRadius: "35px", borderBottomLeftRadius: "35px" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                      </a>
                      <a className="progressBoolHomeBlank" style={{ display: theft.Recorded === 1 ? "none" : "block", borderTopLeftRadius: "35px", borderBottomLeftRadius: "35px" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                      </a>
                      <a className="progressBoolReportedHome" style={{ display: theft.Reported === 1 ? "block" : "none" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                      </a>
                      <a className="progressBoolHomeBlank" style={{ display: theft.Reported === 1 ? "none" : "blank" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                      </a>
                      <a className="progressBoolCollectedHome" style={{ display: theft.Collected === 1 ? "block" : "none" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                      </a>
                      <a className="progressBoolHomeBlank" style={{ display: theft.Collected === 1 ? "none" : "blank" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                      </a>
                      <a className="progressBoolResolvedHome" style={{ display: theft.Resolved === 1 ? "block" : "none", borderTopRightRadius: "35px", borderBottomRightRadius: "35px" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                      </a>
                      <a className="progressBoolHomeBlank" style={{ display: theft.Resolved === 1 ? "none" : "block", borderTopRightRadius: "35px", borderBottomRightRadius: "35px" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                      </a>
                    </div>
                    {/* <button className="progress-bar-top">
                      <a className="progressBoolRecorded" style={{ display: theft.Recorded === 1 ? "block" : "none" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                      </a>
                      <a className="progressBoolReported" style={{ display: theft.Reported === 1 ? "block" : "none" }}>
                        <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                      </a>
                      <a className="progressBoolCollected" style={{ display: theft.Collected === 1 ? "block" : "none" }}>                      
                        <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                      </a>
                      <a className="progressBoolResolved" style={{ display: theft.Resolved === 1 ? "block" : "none" }}>                      
                        <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                      </a>
                    </button> */}
                    <AccordionItem>
                      <div>
                        <div className='progressBooleanContainer' id='recorded' style={{ borderStyle: theft.Recorded === 1 ? "solid" : "hidden", paddingRight: theft.Recorded === 1 ? "0.5rem" : "1.125rem", paddingLeft: theft.Recorded === 1 ? "0.5rem" : "1.125rem"}}>
                          <div style={{ display: "flex" }}>
                            <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                          </div>
                          <div className='progressBooleanValueContainer'>
                            <h4 className='progressBooleanValues'>{theft.Recorded === 1 ? "Recorded at: " : "Not Recorded"}</h4>
                            <div style={{ display: theft.Recorded === 1 ? "block" : "none" }}>
                              <br/>
                              <h4 className='progressBooleanValues'> {formatTimestamp(theft.TimeRecorded)}</h4>
                              <br/>
                              <h4 className='progressBooleanValues'> By {theft.RecordedUser}</h4>
                            </div>
                          </div>
                        </div>
                        <div className='progressBooleanContainer' id='reported' style={{ borderStyle: theft.Reported === 1 ? "solid" : "hidden", paddingRight: theft.Reported === 1 ? "0.5rem" : "1.125rem", paddingLeft: theft.Reported === 1 ? "0.5rem" : "1.125rem"}}>
                          <div style={{ display: "flex" }}>
                            <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                          </div>
                          <div className='progressBooleanValueContainer'>
                            <h4 className='progressBooleanValues'>{theft.Reported === 1 ? "Reported at: " : "Not Reported"}</h4>
                            <div style={{ display: theft.Reported === 1 ? "block" : "none" }}>
                              <br/>
                              <h4 className='progressBooleanValues'> {formatTimestamp(theft.TimeReported)}</h4>
                              <br/>
                              <h4 className='progressBooleanValues'> By {theft.ReportedUser}</h4>
                            </div>
                          </div>
                        </div>
                        <div className='progressBooleanContainer' id='collected' style={{ borderStyle: theft.Collected === 1 ? "solid" : "hidden", paddingRight: theft.Collected === 1 ? "0.5rem" : "1.125rem", paddingLeft: theft.Collected === 1 ? "0.5rem" : "1.125rem"}}>
                          <div style={{ display: "flex" }}>
                            <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                          </div>
                          <div className='progressBooleanValueContainer'>
                            <h4 className='progressBooleanValues'>{theft.Collected === 1 ? "Collected at: " : "Not Collected by Gardaí"}</h4>
                            <div style={{ display: theft.Collected === 1 ? "block" : "none" }}>
                              <br/>
                              <h4 className='progressBooleanValues'> {formatTimestamp(theft.TimeCollected)}</h4>
                              <br/>
                              <h4 className='progressBooleanValues'> By {theft.CollectedUser}</h4>
                              <br/>
                              <h4 className='progressBooleanValues'> Garda Name: {theft.CollectedGarda}</h4>
                            </div>
                          </div>
                        </div>
                        <div className='progressBooleanContainer' id='resolved' style={{ borderStyle: theft.Resolved === 1 ? "solid" : "hidden", paddingRight: theft.Resolved === 1 ? "0.5rem" : "1.125rem", paddingLeft: theft.Resolved === 1 ? "0.5rem" : "1.125rem"}}>
                          <div style={{ display: "flex" }}>
                            <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                          </div>
                          <div className='progressBooleanValueContainer'>
                            <h4 className='progressBooleanValues'>{theft.Resolved === 1 ? "Resolved at: " : "Not fully Resolved"}</h4>
                            <div style={{ display: theft.Resolved === 1 ? "block" : "none" }}>
                              <br/>
                              <h4 className='progressBooleanValues'> @ {formatTimestamp(theft.TimeResolved)}</h4>
                              <br/>
                              <h4 className='progressBooleanValues'> By {theft.ResolvedUser}</h4>
                            </div>
                          </div>
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
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                <div>
                  <h3>Employee on Tills:</h3>
                  <h3 className='reportDetailValueh3'>{theft.EmployeeOD}</h3>
                </div>
                <div>
                  <h3>Manager on Duty:</h3>
                  <h3 className='reportDetailValueh3'> {theft.ManagerOD}</h3>
                </div>
                <div>
                  <h3>Report Author: </h3>
                  <h3 className='reportDetailValueh3'> {theft.ReportAuthor}</h3>
                </div>
                </>
              ) : null}
              {(currentUserPosition === "Employee") ? (
                <>
                <div>
                  <h3>Employee on Tills:</h3>
                <h3 className='reportDetailValueh3'>********</h3>
                </div>
                <div>
                  <h3>Manager on Duty:</h3>
                <h3 className='reportDetailValueh3'>********</h3>
                </div>
                <div>
                  <h3>Report Author: </h3>
                <h3 className='reportDetailValueh3'>********</h3>
                </div>
                </>
              ) : null}
              <br/>
              <h3>Last Edited: {formatTimestamp(theft.LastEdited)}</h3>
              {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
              <>
                <div className='detailsCrudBtns'>
                  <button className='defaultBtn'>
                    <Link to={`/updatetheft/${theft.id}`}>
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
                  <Link to={`/pdftheft/${theft.id}`}>
                    EXPORT PDF
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
                    <button className='defaultBtn' onClick={()=>handleDelete(theft.id)}>
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
  
  export default DetailsTheft;