import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../axios';
import "../style.css"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Create Document Component
const PDFDriveOff = () => {
    const [driveOff, setDriveOff] = useState(null);
    const [shop, setShop] = useState(null);

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
  
    const location = useLocation();

    const driveOffId = location.pathname.split("/")[2];
    const shopId = user.ShopId;

    const pdfWidth = 595.28;
    const pdfHeight = 841.89;

    const maxPDFWidth = 580;

    useEffect(() => {
      const fetchData = async () => {
        try {
          //  --  Standard Localhost Connection
          const[driveOffResponse, shopResponse] = await Promise.all([
            axios.get(`/driveoffs/${driveOffId}`),
            axios.get(`/shops/${shopId}`)            
          ])

          if (driveOffResponse.status === 200) {
            const driveOffData = driveOffResponse.data;
            setDriveOff(driveOffData);
          }

          if (shopResponse.status === 200) {
            const shopData = shopResponse.data;
            setShop(shopData);
          }
        } catch (err) {
          console.log(err);
          console.log("Error occurred while fetching drive-off details. Err Code 2.");
        }
      };
      fetchData();
    }, [driveOffId]);

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

    const downloadPDF = () => {
      const input = document.getElementById('pdfRef');
      html2canvas(input, { width: pdfWidth, height: pdfHeight })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]); // 'p' for portrait, 'pt' for points
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`DriveOff_€${driveOff.Cost}_${driveOff.FuelType}_${driveOff.Make}_${formatDate(driveOff.Date)}.pdf`);
      });
    };

    const goBack = () => {
      navigate(`/detailsdriveoff/${driveOffId}`);
    };

    return (    
        <article>
            <div className="driveOff">
              <div className='detailsCrudBtns'>
                <button className='defaultBtn' onClick={goBack}>
                  <img className="defaultIcon" src={require('../imgs/Back.png')}></img>BACK
                </button>
                <button className='defaultBtn' onClick={downloadPDF}>
                  <img className="defaultIcon" src={require('../imgs/Download.png')}></img>DOWNLOAD
                </button>
              </div>
                <div id="pdfRef" >
                    <div>
                        {driveOff && (
                          <div>
                            <div className='pdfTop'>
                              <div id='pdfLeft'>
                                <h1 style={{width: 300}}>Drive-Off Details</h1>
                                <a></a>
                                <div>
                                  <h2>Registration Number:</h2>
                                  <h2 style={{fontWeight: 900}}>{driveOff.RegistrationNumber}</h2>
                                  <br/>
                                  <h3>Cost: €{driveOff.Cost}</h3>
                                  <a></a>
                                  <h3>Date: {formatDate(driveOff.Date)}</h3>
                                  <a></a>
                                  <h3>Time: {driveOff.Time}</h3>
                                  <a></a>
                                  <h3>Fuel: {driveOff.FuelType}</h3>
                                  <a></a>
                                  <h3>Make: {driveOff.Make}</h3>
                                  <h3>Model: {driveOff.Model}</h3>
                                  <a></a>
                                </div>
                              </div>
                                <div id='pdfRight'>
                                  <a></a>
                                  <h4>{shop.AddressLine1}</h4>
                                  <h4>{shop.AddressLine2}</h4>
                                  <h4>{shop.AddressLine3}</h4>
                                  <h4>{shop.AddressLine4}</h4>
                                  <h4>{shop.Eircode}</h4>
                                  <a></a>
                                  <h4>Phone Number:</h4>
                                  <h4>{shop.PhoneNumber}</h4>
                                  <a></a>
                                  <h4>Email:</h4>
                                  <h4 id='shopEmailPDF'>{shop.Email}</h4>
                                </div>
                              </div>
                              <div className='pdfBottom' style={{maxWidth:(maxPDFWidth)}}>
                                <h3>Details:</h3>
                                <h4>{driveOff.Details}</h4>
                                <br/>
                                <h3>Report Author: {driveOff.ReportAuthor}</h3>
                              </div>
                            </div>
                            
                        )}
                        
                    </div>
                </div>
                <button className='defaultBtn' onClick={downloadPDF} id='exportPDFBtn'>
                  <img className="defaultIcon" src={require('../imgs/Download.png')}></img>DOWNLOAD
                </button>
          </div>
        </article>
    );
};

export default PDFDriveOff;