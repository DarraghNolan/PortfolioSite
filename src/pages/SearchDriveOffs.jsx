import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axios';
import "../style.css"
import { format } from 'date-fns';

function SearchDriveOffs() {
  const [driveOffs, setDriveOffs] = useState([]);

  const [notes, setNotes] = useState([]);
  const [noteTags, setNoteTags] = useState([]);

  const [thefts, setThefts] = useState([]);
  const [theftItems, setTheftItems] = useState({});
  
  const [allReports, setAllReports] = useState([]);

  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  const [showNotesResults, setNotesBtn] = useState([]);
  const [showDOsResults, setDOsBtn] = useState([]);
  const [showTheftsResults, setTheftsBtn] = useState([]);
  const [showReportTypeFilter, setReportTypeFilterBtn] = useState(false);
  const [resolvedReports, setResolvedReports] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [showReportBtns, setShowReportBtns] = useState(false); // State to track button display

  const [currentUserPosition, setCurrentUserPosition] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const checkCurrentUserPos = () => {
      setCurrentUserPosition(currentUser.Position); // Set the current user's position
    };
    
    checkCurrentUserPos();
  }, []);

  const fetchAllReports = async () => {
    try {

      //    --    THEFTS

      const resThefts = await axios.get("/thefts");
      const filteredThefts = resThefts.data.filter(thefts => thefts.ShopId === currentUser.ShopId);
      setThefts(filteredThefts);

      // Fetch items associated with each theft report
      const itemsPromises = resThefts.data.map(async (theft) => {
        const response = await axios.get(`/theftsitem/${theft.id}`);
        return response.data; // Return the entire array of associated items
      });

      const itemsData = await Promise.all(itemsPromises);
      const itemsMap = {};
      itemsData.forEach((items, index) => {
        itemsMap[resThefts.data[index].id] = items;
      });
      setTheftItems(itemsMap);

      //    --    DRIVE-OFFS

      const resDriveOffs = await axios.get("/driveoffs");
      const filteredDriveOffs = resDriveOffs.data.filter(driveOffs => driveOffs.ShopId === currentUser.ShopId);
      setDriveOffs(filteredDriveOffs);
      
      const resNotes = await axios.get("/notes");
      const filteredNotes = resNotes.data.filter(notes => notes.ShopId === currentUser.ShopId);
      setNotes(filteredNotes);

      const notesPromises = resNotes.data.map(async (note) => {
        const response = await axios.get(`/notestag/${note.id}`);
        return response.data;
      });

      //    --    NOTES

      const notesData = await Promise.all(notesPromises);
      const notesMap = {};
      notesData.forEach((tags, index) => {
        notesMap[resNotes.data[index].id] = tags;
      });
      setNoteTags(notesMap);      

      //    --    ALL REPORTS COMBINED

      const combinedReports = [
        ...resDriveOffs.data.map(report => ({ ...report, type: 'driveOff' })),
        ...resNotes.data.map(report => ({ ...report, type: 'note' })),
        ...resThefts.data.map(report => ({ ...report, type: 'theft' })),
      ];

      // Sort the combined reports by "LastEdited" in descending order (most recent first)
      combinedReports.sort((a, b) => new Date(b.LastEdited) - new Date(a.LastEdited));

      const filteredCombinedReports = combinedReports.filter(combinedReport => combinedReport.ShopId === currentUser.ShopId);

      setAllReports(filteredCombinedReports);
    } catch (err) {
      console.log(err);
      setError("Error occurred while fetching reports. Please try again.");
    }
  };

  const calculateTheftTotalCost = (theftId) => {
    const items = theftItems[theftId];
  
    if (!items) {
      return 0; // Return 0 if there are no associated items
    }
  
    // Calculate the total cost by summing up the cost of each item (quantity * cost)
    const totalCost = items.reduce((acc, item) => acc + item.Quantity * item.Cost, 0);
  
    return totalCost;
  };

  const filterTheftKeys = ["Cost", "Time", "ReportAuthor"]
  const filterDOKeys = ["RegistrationNumber", "Cost", "FuelType", "Make", "Model"]
  const filterNoteKeys = ["Title", "ReportAuthor"]

  useEffect(() => {  
    fetchAllReports();
  }, []);

  const searchAllReports = (data) => {
    return data.filter((report) => {

      if (report.Resolved === 1 && !resolvedReports) {
        return false; // Filter out resolved reports when the slider is checked
      }

      const items = theftItems[report.id];

      if (items) {
        const itemNames = items.map((item) => item.Name.toLowerCase());
        return (
          filterTheftKeys.some((key) =>
            typeof report[key] === 'string' && report[key].toLowerCase().includes(query.toLowerCase())
          ) ||
          itemNames.some((itemName) => typeof itemName === 'string' && itemName.includes(query.toLowerCase()))
        );
      }

      const tags = noteTags[report.id];
      
      if (tags) {
        const tagNames = tags.map((tag) => tag.Name.toLowerCase());
        return (
          filterNoteKeys.some((key) =>
            typeof report[key] === 'string' && report[key].toLowerCase().includes(query.toLowerCase())
          ) ||
          tagNames.some((tagName) => typeof tagName === 'string' && tagName.toLowerCase().includes(query.toLowerCase()))
        );
      }

      const keysToSearch = 
        report.type === 'driveOff' ? filterDOKeys :
        report.type === 'note' ? filterNoteKeys :
        filterTheftKeys;
        
      return keysToSearch.some((key) =>
        typeof report[key] === 'string' && report[key].toLowerCase().includes(query.toLowerCase())
      );
    });
  };
  
  const toggleTheftResults = () => {
    setTheftsBtn(!showTheftsResults);
  }

  const toggleNotesResults = () => {
    setNotesBtn(!showNotesResults);
  }

  const toggleDOsResults = () => {
    setDOsBtn(!showDOsResults);
  }
  
  const filterByDate = () => {
    // Ensure fromDate and toDate are not empty
    if (!fromDate && !toDate) {
      // Reset the date filters and fetch all reports
      setFromDate("");
      setToDate("");
      fetchAllReports();
      return;
    } 
    
    if(!toDate){
      setToDate(fromDate);
      fetchAllReports();
      return;
    }
  
    // Convert fromDate and toDate strings to Date objects
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);
  
    // Filter the reports based on the date range
    const filteredReports = allReports.filter((report) => {
      const reportDate = new Date(report.Date);
  
      return reportDate >= fromDateObj && reportDate <= toDateObj;
    });
  
    // Update the state with the filtered reports
    setAllReports(filteredReports);
  };

  const clearFilters = () => {
    // Clear the "From" and "To" date fields
    setFromDate("");
    setToDate("");
    setDOsBtn(true);
    setNotesBtn(true);
    setTheftsBtn(true);

    filterByDate();
  };
  
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

  const toggleReportBtns = () => {
    setShowReportBtns(!showReportBtns); // Toggle the state when the button is clicked
  }

  const toggleFilterBtns = () => {
    setReportTypeFilterBtn(!showReportTypeFilter); // Toggle the state when the button is clicked
  }

  // Create a function to categorize and sort reports
  const categorizeReports = (reports) => {
    const categorized = {};
    const today = new Date(); // Get the current date

    reports.forEach((report) => {
      const lastEditedDate = new Date(report.LastEdited);
      const diffInDays = Math.floor((today - lastEditedDate) / (1000 * 60 * 60 * 24));

      let category;

      if (diffInDays === 0) {
        category = 'Today';
      } else if (diffInDays === 1) {
        category = 'Yesterday';
      } else {
        // Format the date as "Thursday, DD/MM/YYYY"
        category = format(lastEditedDate, 'EEEE, dd/MM/yyyy');
      }

      if (!categorized[category]) {
        categorized[category] = [];
      }

      categorized[category].push(report);
    });

    // Sort each category by LastEdited in descending order
    Object.keys(categorized).forEach((category) => {
      categorized[category].sort(
        (a, b) => new Date(b.LastEdited) - new Date(a.LastEdited)
      );
    });

    return categorized;
  };

  // console.log(query)
  return (
    <article>
      <div className="driveOffs">
        <div id="searchReportsDiv">
          <input
            type="text" 
            placeholder="Search Incident Reports" 
            id="searchDriveOffs" 
            onChange={e=>setQuery(e.target.value)}
          />
          <button id='filterSearchBtn' onClick={toggleFilterBtns}>
            <img className='FRPressedBtn' src={require('../imgs/Filter.png')} style={{ display: showReportTypeFilter ? 'block' : 'none' }}></img>
            <img className='FRThumbnailBtn' src={require('../imgs/FilterOutline.png')} style={{ display: showReportTypeFilter ? 'none' : 'block' }}></img>
          </button>
        </div>
        <button id="filterDateBtn" className="defaultBtn" onClick={clearFilters} style={{ display: showReportTypeFilter ? 'block' : 'none' }}>
          <img className='defaultIcon' src={require('../imgs/Delete.png')} ></img>
          Clear Filters
        </button>
        <button id="resolvedFilterBtn" className="defaultBtn" style={{ display: showReportTypeFilter ? 'block' : 'none' }}>
          <h5>Show Resolved Reports</h5>
          <label class="switch">
            <input
              type="checkbox"
              checked={resolvedReports}
              onChange={(e) => setResolvedReports(e.target.checked)}
            />
            <span class="sliderRound" id="resolvedSlider">
              <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
            </span>
          </label>
        </button>
        <div className='searchResultsBtns' style={{ display: showReportTypeFilter ? 'flex' : 'none' }}>
          <button onClick={toggleNotesResults} style={{ display: showNotesResults ? 'block' : 'none', backgroundColor: 'var(--Blu2Dark)'}}>
            <img className='SRPressedBtn' src={require('../imgs/NotePressedS.png')}></img>
            <a style={{ color: showNotesResults ? 'var(--Blu1LIGHT)' : 'var(--Blu3Darker)'}}>Notes</a>
          </button>
          <button onClick={toggleNotesResults} style={{ display: showNotesResults ? 'none' : 'block', backgroundColor: 'var(--Blu1LIGHT)'}}>
            <img className='SRPressedBtn' src={require('../imgs/NoteThumbnailS.png')}></img>
            <a style={{ color: showNotesResults ? 'var(--Blu1LIGHT)' : 'var(--Blu3Darker)'}}>Notes</a>
          </button>
          <button onClick={toggleDOsResults} style={{ display: showDOsResults ? 'block' : 'none', backgroundColor: 'var(--Blu2Dark)'}}>
            <a style={{ color: showDOsResults ? 'var(--Blu1LIGHT)' : 'var(--Blu3Darker)'}}>Drive-Offs</a>
            <img className='SRPressedBtn' src={require('../imgs/D-OPressedS.png')}></img>
          </button>
          <button onClick={toggleDOsResults} style={{ display: showDOsResults ? 'none' : 'block', backgroundColor: 'var(--Blu1LIGHT)'}}>
            <a style={{ color: showDOsResults ? 'var(--Blu1LIGHT)' : 'var(--Blu3Darker)'}}>Drive-Offs</a>
            <img className='SRPressedBtn' src={require('../imgs/D-OThumbnailS.png')}></img>
          </button>
          <button onClick={toggleTheftResults} style={{ display: showTheftsResults ? 'block' : 'none', backgroundColor: 'var(--Blu2Dark)'}}>
            <a style={{ color: showTheftsResults ? 'var(--Blu1LIGHT)' : 'var(--Blu3Darker)'}}>Thefts</a>
            <img className='SRPressedBtn' src={require('../imgs/TheftPressedS.png')}></img>
          </button>
          <button onClick={toggleTheftResults} style={{ display: showTheftsResults ? 'none' : 'block', backgroundColor: 'var(--Blu1LIGHT)'}}>
            <a style={{ color: showTheftsResults ? 'var(--Blu1LIGHT)' : 'var(--Blu3Darker)'}}>Thefts</a>
            <img className='SRPressedBtn' src={require('../imgs/TheftThumbnailS.png')}></img>
          </button>
        </div>
        <div style={{ display: showReportTypeFilter ? 'block' : 'none' }}>
          <div id="dateFilterDiv">
            <div>
              <h4>From:</h4>
              <input
                type="date"
                placeholder="From Date"
                id="fromDate"
                onChange={(e) => setFromDate(e.target.value)}
                value={fromDate}
              />
            </div>
            <a></a>
            <div>
              <h4>To:</h4>
              <input
                type="date"
                placeholder="To Date"
                id="toDate"
                onChange={(e) => setToDate(e.target.value)}
                value={toDate}
              />
            </div>
          </div>
          <button id="filterDateBtn" className="defaultBtn" onClick={filterByDate}>
            <img className='defaultIcon' src={require('../imgs/Filter.png')} ></img>
            Filter by Date
          </button>
        </div>
          <ul id="searchDriveOffResults" className="list">
            {(searchAllReports(allReports)).map((report) => (
              <li key={report.id} className="driveoff" id="searchReportResults">
                {/* Render report content here */}
                <div style={{ display: showDOsResults ? 'block' : 'none' }}>
                  {report.type === 'driveOff' && (
                    <button className="driveOffCard">
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
                              <h2>Drive-Off</h2>
                              <h2>€{report.Cost}</h2>
                              <div className='cardContent'>
                                <div className='cardDetails'>
                                  <h3>{report.RegistrationNumber}</h3>
                                  <h3>{formatDate(report.Date)}</h3>
                                </div>
                                <div className='reportTimestamp'>
                                  <h4>Edited: {formatTimestamp(report.LastEdited)}</h4>
                                </div>
                              </div>
                              </>
                            ) : null}
                            {(currentUserPosition === "Employee") ? (
                              <>
                              <h2>********</h2>
                              <div className='cardContent'>
                                <div className='cardDetails'>
                                  <h3>********</h3>
                                  <h3>********</h3>
                                </div>
                                <div className='reportTimestamp'>
                                  <h4>Edited: {formatTimestamp(report.LastEdited)}</h4>
                                </div>
                              </div>
                              </>
                            ) : null}
                          </div>
                          <div style={{ display: report.Recorded === 1 ? "block" : "none" }}>
                            <div className="progressBarTopHome">
                              <a className="progressBoolRecordedHome" style={{ display: report.Recorded === 1 ? "block" : "none", borderTopLeftRadius: "35px", borderBottomLeftRadius: "35px" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                              </a>
                              <a className="progressBoolHomeBlank" style={{ display: report.Recorded === 1 ? "none" : "block", borderTopLeftRadius: "35px", borderBottomLeftRadius: "35px" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                              </a>
                              <a className="progressBoolReportedHome" style={{ display: report.Reported === 1 ? "block" : "none" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                              </a>
                              <a className="progressBoolHomeBlank" style={{ display: report.Reported === 1 ? "none" : "blank" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                              </a>
                              <a className="progressBoolCollectedHome" style={{ display: report.Collected === 1 ? "block" : "none" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                              </a>
                              <a className="progressBoolHomeBlank" style={{ display: report.Collected === 1 ? "none" : "blank" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                              </a>
                              <a className="progressBoolResolvedHome" style={{ display: report.Resolved === 1 ? "block" : "none", borderTopRightRadius: "35px", borderBottomRightRadius: "35px" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                              </a>
                              <a className="progressBoolHomeBlank" style={{ display: report.Resolved === 1 ? "none" : "block", borderTopRightRadius: "35px", borderBottomRightRadius: "35px" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                              </a>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </button>
                  )}
                </div>
                <div style={{ display: showTheftsResults ? 'block' : 'none' }}>
                  {report.type === 'theft' && (
                    <button className="driveOffCard">
                      <Link to={`/detailstheft/${report.id}`} className='contentDetailsCard'>
                        <div className='contentCardIMGs'>
                          <img className='contentCardIMG' src={require('../imgs/Theft.png')} alt="Drive Off"></img>
                          {report.Resolved === 1 && (
                            <img className='PAIDOverlay' src={require('../imgs/PAID.png')} alt="Resolved" />
                          )}
                        </div>
                        <div>
                          <div className='cardTitle'>
                          {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                              <>
                              <h2>Theft</h2>
                              <h2>€ {calculateTheftTotalCost(report.id)}</h2>
                              <div className='cardContent'>
                                <div className='cardDetails'>
                                  {theftItems[report.id] && (
                                    <div className="stolenItem">
                                      <a>{theftItems[report.id].map(item => `${item.Quantity}X ${item.Name}`).join(', ')}</a>
                                    </div>
                                  )}
                                  <h3>{formatDate(report.Date)}</h3>
                                </div>
                                <div className='reportTimestamp'>
                                  <h4>Edited: {formatTimestamp(report.LastEdited)}</h4>
                                </div>
                              </div>
                              </>
                            ) : null}
                            {(currentUserPosition === "Employee") ? (
                              <>
                              <h2>********</h2>
                              <div className='cardContent'>
                                <div className='cardDetails'>
                                  <h3>********</h3>
                                  <h3>********</h3>
                                </div>
                                <div className='reportTimestamp'>
                                  <h4>Edited: {formatTimestamp(report.LastEdited)}</h4>
                                </div>
                              </div>
                              </>
                            ) : null}
                          </div>
                          <div style={{ display: report.Recorded === 1 ? "block" : "none" }}>
                            <div className="progressBarTopHome">
                              <a className="progressBoolRecordedHome" style={{ display: report.Recorded === 1 ? "block" : "none", borderTopLeftRadius: "35px", borderBottomLeftRadius: "35px" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                              </a>
                              <a className="progressBoolHomeBlank" style={{ display: report.Recorded === 1 ? "none" : "block", borderTopLeftRadius: "35px", borderBottomLeftRadius: "35px" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Recorded.png')}></img>
                              </a>
                              <a className="progressBoolReportedHome" style={{ display: report.Reported === 1 ? "block" : "none" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                              </a>
                              <a className="progressBoolHomeBlank" style={{ display: report.Reported === 1 ? "none" : "block" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Reported.png')}></img>
                              </a>
                              <a className="progressBoolCollectedHome" style={{ display: report.Collected === 1 ? "block" : "none" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                              </a>
                              <a className="progressBoolHomeBlank" style={{ display: report.Collected === 1 ? "none" : "block" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Collected.png')}></img>
                              </a>
                              <a className="progressBoolResolvedHome" style={{ display: report.Resolved === 1 ? "block" : "none", borderTopRightRadius: "35px", borderBottomRightRadius: "35px" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                              </a>
                              <a className="progressBoolHomeBlank" style={{ display: report.Resolved === 1 ? "none" : "block", borderTopRightRadius: "35px", borderBottomRightRadius: "35px" }}>
                                <img className='progressRecordedIMG' src={require('../imgs/Resolved.png')}></img>
                              </a>
                            </div>
                          </div>                        
                        </div>
                      </Link>
                    </button>
                  )}
                </div>
                <div style={{ display: showNotesResults ? 'block' : 'none' }}>
                  {report.type === 'note' && (
                    <button className="driveOffCard">
                      <Link to={`/detailsnote/${report.id}`} className='contentDetailsCard'>
                        <div className='contentCardIMGs'>
                          <img className='contentCardIMG' src={require('../imgs/Note.png')} alt="Drive Off"></img>
                        </div>
                        <div className='cardTitle'>
                          <h2>Note</h2>
                          <h2>{report.Title}</h2>
                          <div className='cardContent'>
                            <div className='cardDetails'>
                              <h3>{report.ReportAuthor}</h3>
                              <h3>{formatDate(report.Date)}</h3>
                              {noteTags[report.id] && (
                                <div className="associated-itemHOME">
                                  {noteTags[report.id].map((tag) => (
                                    <span key={tag.noteId} className='tags'>
                                      {tag.Name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              </div>
                              <div className='reportTimestamp'>
                                <h4>Edited: {formatTimestamp(report.LastEdited)}</h4>
                              </div>
                          </div>
                        </div>
                      </Link>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <button className='scrollToTop' onClick={() => {window.scrollTo({top: 0, left: 0, behavior: 'smooth'});}}>
              <img src={require('../imgs/ToTop.png')}></img>
          </button>
      {(currentUserPosition === "Supervisor" || currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
        <>
        <button className='newReportBtn' onClick={toggleReportBtns}>
          <img id='closeOverlayBtn' style={{ display: showReportBtns ? 'none' : 'block' }} src={require('../imgs/Add.png')}></img>
          <img id='closeOverlayBtn' style={{ display: showReportBtns ? 'block' : 'none' }} src={require('../imgs/Close.png')}></img>
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
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
    </article>
  );
};

export default SearchDriveOffs;