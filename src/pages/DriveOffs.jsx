import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import "../style.css"

const DriveOffs = () => {
  const [driveOffs, setDriveOffs] = useState([]);

  const [notes, setNotes] = useState([]);
  const [noteTags, setNoteTags] = useState([]);

  const [thefts, setThefts] = useState([]);
  const [theftItems, setTheftItems] = useState({});

  const [allReports, setAllReports] = useState([]); // Combine all report types into a single array

  const [error, setError] = useState(null);

  const [showReportBtns, setShowReportBtns] = useState(false); // State to track button display

  const [currentUserPosition, setCurrentUserPosition] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  //  --  Old Fetch Requests
  useEffect(() => {
    const fetchAllDriveOffs = async () => {
      try {
        const resRemoteHome = await axios.get("/driveoffs");
        
        setDriveOffs(resRemoteHome.data);
      } catch (err) {
        console.log(err);
        setError("Error occurred while fetching drive-offs. Please try again.");
      }
    };

    const checkCurrentUserPos = () => {
      setCurrentUserPosition(currentUser.Position); // Set the current user's position
    };
    
    checkCurrentUserPos();

    fetchAllDriveOffs();
  }, []);

  useEffect(() => {
    const fetchAllNotes = async () => {
      try {
        //  --  Standard LocalHost Connect
        const resRemoteHome = await axios.get("/notes");
        setNotes(resRemoteHome.data);

        const notesPromises = resRemoteHome.data.map(async (note) => {
          const response = await axios.get(`/notestag/${note.id}`);
          return response.data[0];
        });

        const notesData = await Promise.all(notesPromises);
        const notesMap = {};
        notesData.forEach((note, index) => {
          notesMap[resRemoteHome.data[index].id] = note;
        });
        setNoteTags(notesMap);
      } catch (err) {
        console.log(err);
        setError("Error occurred while fetching Notes. Please try again.");
      }
    };

    fetchAllNotes();
  }, []);

  useEffect(() => {
    const fetchAllThefts = async () => {
      try {
        const resRemoteHome = await axios.get("/thefts");
        setThefts(resRemoteHome.data);

        // Fetch items associated with each theft report
        const itemsPromises = resRemoteHome.data.map(async (theft) => {
          const response = await axios.get(`/theftsitem/${theft.id}`);
          return response.data[0]; // Get the first associated item
        });

        const itemsData = await Promise.all(itemsPromises);
        const itemsMap = {};
        itemsData.forEach((item, index) => {
          itemsMap[resRemoteHome.data[index].id] = item;
        });
        setTheftItems(itemsMap);
      } catch (err) {
        console.log(err);
        setError("Error occurred while fetching Thefts. Please try again.");
      }
    };

    fetchAllThefts();
  }, []);

  const calculateTotalCost = () => {
    let totalCost = 0;
    for (const item of theftItems) {
      totalCost += item.Cost * item.Quantity;
    }
    return totalCost;
  };

  const toggleReportBtns = () => {
    setShowReportBtns(!showReportBtns); // Toggle the state when the button is clicked
  }

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        // Fetch all reports (drive-offs, notes, and thefts)
        const resDriveOffs = await axios.get("/driveoffs");
        const resNotes = await axios.get("/notes");
        const resThefts = await axios.get("/thefts");

        // Combine reports into a single array and add a "type" property to distinguish them
        const combinedReports = [
          ...resDriveOffs.data.map(report => ({ ...report, type: 'driveOff' })),
          ...resNotes.data.map(report => ({ ...report, type: 'note' })),
          ...resThefts.data.map(report => ({ ...report, type: 'theft' })),
        ];

        // Sort the combined reports by "TimeCreated" in descending order (most recent first)
        combinedReports.sort((a, b) => new Date(b.LastEdited) - new Date(a.LastEdited));

        const filteredCombinedReports = combinedReports.filter(combinedReport => combinedReport.ShopId === currentUser.ShopId);

        setAllReports(filteredCombinedReports);
      } catch (err) {
        console.log(err);
        setError("Error occurred while fetching reports. Please try again.");
      }
    };

    fetchAllReports();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
    <article className='caption'>
      <div id='mainPanel'>
        <h1 id='Drive-OffsH1'>Home</h1>
        {error && <div>{error}</div>}
        <div className="driveOffs">
          {allReports.map((report) => (
            <div className="driveoff" key={report.id}>
              <button className='driveOffCard'>
                {report.type === 'driveOff' && (
                  <Link to={`/detailsdriveoff/${report.id}`} className='contentDetailsCard'>
                    <div className='contentCardIMGs'>
                      <img className='contentCardIMG' src={require('../imgs/D-O.png')} alt="Drive Off"></img>
                      {report.Resolved === 1 && (
                        <img className='PAIDOverlay' src={require('../imgs/PAID.png')} alt="Resolved" />
                      )}
                    </div>
                    <div className='cardTitle'>
                      <div>
                        {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                          <>
                          <h2>{report.RegistrationNumber}</h2>
                          </>
                        ) : null}
                        {(currentUserPosition === "Employee") ? (
                          <>
                          <h2>********</h2>
                          </>
                        ) : null}
                        <div className='cardContent'>
                          <div className='cardDetails'>
                            <h3>€{report.Cost}</h3>
                            <h3>{report.Date}</h3>
                          </div>
                          <div className='reportTimestamp'>
                            <h4>Edited: {formatTimestamp(report.LastEdited)}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                {report.type === 'note' && (
                  <Link to={`/detailsnote/${report.id}`} className='contentDetailsCard'>
                  <div className='contentCardIMGs'>
                    <img className='contentCardIMG' src={require('../imgs/Note.png')} alt="Drive Off"></img>
                  </div>
                    <div className='cardTitle'>
                      <h2>{report.Title}</h2>
                      <div className='cardContent'>
                        <div className='cardDetails'>
                          <h4>{report.ReportAuthor}</h4>
                          {noteTags[report.id] && (
                            <div className="associated-item">
                              <p>{noteTags[report.id].Name}</p>
                            </div>
                          )}
                          </div>
                          <div className='reportTimestamp'>
                            <h4>Edited: {formatTimestamp(report.LastEdited)}</h4>
                          </div>
                      </div>
                    </div>
                  </Link>
                )}
                {report.type === 'theft' && (
                  <Link to={`/detailstheft/${report.id}`} className='contentDetailsCard'>
                    <div className='contentCardIMGs'>
                      <img className='contentCardIMG' src={require('../imgs/Theft.png')} alt="Drive Off"></img>
                      {report.Resolved === 1 && (
                        <img className='PAIDOverlay' src={require('../imgs/PAID.png')} alt="Resolved" />
                      )}
                    </div>
                    <div>
                      <div className='cardTitle'>
                        <h2>{formatDate(report.Date)}</h2>
                        <div className='cardContent'>
                          <div className='cardDetails'>
                            <h3>€ {report.Cost}</h3>
                            {theftItems[report.id] && (
                              <div className="associated-item">
                                <h3>{theftItems[report.id].Quantity}X {theftItems[report.id].Name}</h3>
                              </div>
                            )}
                          </div>
                          <div className='reportTimestamp'>
                            <h4>Edited: {formatTimestamp(report.LastEdited)}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </button>
            </div>
          ))}
        </div>
      {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
        <>
        <button className='newReportBtn' onClick={toggleReportBtns}>
          <a style={{ display: showReportBtns ? 'none' : 'block' }}>+</a>
          <a id='closeOverlayBtn' style={{ display: showReportBtns ? 'block' : 'none' }}>X</a>
        </button>
        <div id='overlay' style={{ display: showReportBtns ? 'block' : 'none' }}>
          <div className='newReportBtns'>
            <button>
              <Link to="/adddriveoff" className='newReportBtnInd'>
                <h3 id='newReportBtnH3'>
                  <img className='newReportIcon' src={require('../imgs/D-OThumbnailS.png')}></img>
                  NEW DRIVE-OFF
                </h3>
              </Link>
            </button>
            <p></p>
            <button>
              <Link to="/addnote" className='newReportBtnInd'>
                <h3 id='newReportBtnH3'>
                  <img className='newReportIcon' src={require('../imgs/NoteThumbnailS.png')}></img>
                  NEW NOTE
                </h3>
              </Link>
            </button>
            <p></p>
            <button>
              <Link to="/addtheft" className='newReportBtnInd'>
                <h3 id='newReportBtnH3'>
                  <img className='newReportIcon' src={require('../imgs/TheftThumbnailS.png')}></img>
                  NEW THEFT
                </h3>
              </Link>
            </button>
          </div>
        </div>
        </>
      ) : null}
      </div>
      {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
        <>
        <div className='WIDESCREEN_newReportBtns'>ADD INCIDENT REPORT
          <button>
            <Link to="/adddriveoff" className='WIDESCREEN_newRptContent'>
              <img src={require('../imgs/D-OThumbnailS.png')}></img>
              <h3 id='newReportBtnH3'>NEW DRIVE-OFF</h3>
            </Link>
          </button>
          <p></p>
          <button>
            <Link to="/addnote" className='WIDESCREEN_newRptContent'>
              <img src={require('../imgs/NoteThumbnailS.png')}></img>
              <h3 id='newReportBtnH3'>NEW NOTE</h3>
            </Link>
          </button>
          <p></p>
          <button>
            <Link to="/addtheft" className='WIDESCREEN_newRptContent'>
              <img src={require('../imgs/TheftThumbnailS.png')}></img>
              <h3 id='newReportBtnH3'>NEW THEFT</h3>
            </Link>
          </button>
        </div>
        </>
      ) : null}
    </article>
  );
};

export default DriveOffs;