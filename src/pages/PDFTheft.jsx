import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../axios';
import "../style.css"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Create Document Component
const PDFTheft = () => {
    const [theft, setTheft] = useState(null);
    const [items, setItems] = useState([]);
    const [shop, setShop] = useState(null);

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
  
    const location = useLocation();

    const theftId = location.pathname.split("/")[2];
    const shopId = user.ShopId;

    const pdfWidth = 595.28;
    const pdfHeight = 841.89;

    const maxPDFWidth = 580;
    
    useEffect(() => {
        const fetchData = async () => {
          try {
            const [theftResponse, itemsResponse, shopResponse] = await Promise.all([
              axios.get(`/thefts/${theftId}`),
              axios.get(`/theftsitem/${theftId}`),
              axios.get(`/shops/${shopId}`)
            ]);
  
            if (theftResponse.status === 200) {
              const theftData = theftResponse.data;
              setTheft(theftData);
            }
  
            if (itemsResponse.status === 200) {
              const itemsData = itemsResponse.data;
              setItems(itemsData);
            }

            if (shopResponse.status === 200) {
              const shopData = shopResponse.data;
              setShop(shopData);
            }
          } catch (err) {
            console.log(err);
          }
        };
  
        fetchData();
    }, [theftId]);

    const calculateTotalCost = () => {
      let totalCost = 0;
      for (const item of items) {
        totalCost += item.Cost * item.Quantity;
      }
      return totalCost;
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

    const downloadPDF = () => {
      const input = document.getElementById('pdfRef');
      html2canvas(input, { width: pdfWidth, height: pdfHeight })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', [pdfWidth, pdfHeight]); // 'p' for portrait, 'pt' for points
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Theft_€${theft.Cost}_${formatDate(theft.Date)}.pdf`);
      });
    };

    const goBack = () => {
      navigate(`/detailstheft/${theftId}`);
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
                        {theft && (
                            <div>
                                <div className='pdfTop'>
                                    <div id='pdfLeft'>
                                      <h1 style={{width: 300}}>Theft Details</h1>
                                      <a></a>
                                      <div>
                                        <h3>Date: {formatDate(theft.Date)}</h3>
                                        <a></a>
                                        <h3>Time: {theft.Time}</h3>
                                        <br/>
                                        <a></a>
                                        <div className="items">
                                        <h4>Stolen items:</h4>
                                        {items.map((item) => (
                                          <h5 key={item.theftId}>
                                            {item.Quantity}X {item.Name}, €{item.Cost} each
                                          </h5>
                                          ))}
                                        </div>
                                        <br/>
                                        <h3>Total Cost of Stolen Items:</h3>
                                        <h3 style={{fontWeight: 900}}>€{calculateTotalCost()}</h3>
                                        <br/>
                                      </div>
                                    </div>
                                    <div id='pdfRight'>
                                      <a></a>
                                      <h4>{shop.AddressLine1}</h4>
                                      <h4>{shop.AddressLine2}</h4>
                                      <h4>{shop.AddressLine3}</h4>
                                      <h4>{shop.AddressLine4}</h4>
                                      <h4>{shop.Eircode}</h4>
                                      <br/>
                                      <h4>Phone Number:</h4>
                                      <h4>{shop.PhoneNumber}</h4>
                                      <br/>
                                      <h4>Email:</h4>
                                      <h4>{shop.Email}</h4>
                                    </div>
                                </div>
                                <div className='pdfBottom' style={{maxWidth:(maxPDFWidth)}}>
                                    <h3>Details:</h3>
                                    <h4>{theft.Details}</h4>
                                    <br/>
                                    <h3>Report Author: {theft.ReportAuthor}</h3>
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

export default PDFTheft;