import axios from "../axios";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import "../style.css";

const UpdateShop = () =>{
    const [shop, setShop] = useState({
        Name:"",
        AddressLine1:"",
        AddressLine2:"",
        AddressLine3:"",
        AddressLine4:"",
        Eircode:"",
        Email:"",
        PhoneNumber:""
    });

    const [updateStatus, setUpdateStatus] = useState("");

    const navigate = useNavigate()
    const location = useLocation()

    const shopId = location.pathname.split("/")[2]

    const [currentUserPosition, setCurrentUserPosition] = useState("");
    const currentUser = JSON.parse(localStorage.getItem("user")); // Remove 'const'

    useEffect(() => {
        const fetchShop = async () => {
          try {
            //  --  Standard Localhost Connection
            const response = await axios.get(`/shops/${shopId}`);
            
            const shopData = response.data;
            setShop(shopData);
          } catch (err) {
            console.log(err);
          }
        };

        const checkCurrentUserPos = () => {
            setCurrentUserPosition(currentUser.Position); // Set the current user's position
        };
        
        checkCurrentUserPos();
        fetchShop();
    }, [shopId]);
    
    const handleChange = (e) =>{
        setShop((prev)=>({...prev, [e.target.name] : e.target.value }));
    };

    const handleClick = async e =>{
        e.preventDefault()
        try{

            //  --  Standard LocalHost Connection
            await axios.put("/shop/" + shopId, shop)

            navigate(`/detailsshop/${shopId}`)
        }catch(err){
            console.log("The Shop was not updated...")
            console.log(err)
            setUpdateStatus("The Shop was not updated...");
        }
    };

    return (
        <article className='form'>
            <div>
                <h4>
                    Shop Name:
                </h4>
                <input
                    type="text"
                    placeholder="Name"
                    value={shop.Name || ""}
                    onChange={handleChange}
                    name="Name"
                />
                <h4>
                    Address Line 1:
                </h4>
                <input
                    type="text"
                    placeholder="Address Line 2"
                    value={shop.AddressLine1 || ""}
                    onChange={handleChange}
                    name="Name"
                />
                <h4>
                    Address Line 2:
                </h4>
                <input
                    type="text"
                    placeholder="Address Line 2"
                    value={shop.AddressLine2 || ""}
                    onChange={handleChange}
                    name="AddressLine2"
                />
                <h4>
                    Address Line 3:
                </h4>
                <input
                    type="text"
                    placeholder="Address Line 3"
                    value={shop.AddressLine3 || ""}
                    onChange={handleChange}
                    name="AddressLine3"
                />
                <h4>
                    Address Line 4:
                </h4>
                <input
                    type="text"
                    placeholder="Address Line 4"
                    value={shop.AddressLine4 || ""}
                    onChange={handleChange}
                    name="AddressLine4"
                />
                <h4>
                    Eircode:
                </h4>
                <input
                    type="text"
                    placeholder="Eircode"
                    value={shop.Eircode || ""}
                    onChange={handleChange}
                    name="Eircode"
                />
                <h4>
                    Email:
                </h4>
                <input
                    type="text"
                    placeholder="Email"
                    value={shop.Email || ""}
                    onChange={handleChange}
                    name="Email"
                />
                <h4>
                    Phone Number:
                </h4>
                <input
                    type="text"
                    placeholder="PhoneNumber"
                    value={shop.PhoneNumber || ""}
                    onChange={handleChange}
                    name="PhoneNumber"
                />
                <button onClick={handleClick} id="exportPDFBtn" className='defaultBtn'>
                    <img className="defaultIcon" src={require('../imgs/Save.png')}></img>
                    Save Changes
                </button>
                <div>
                    <h3>{updateStatus}</h3>
                </div>
            </div>            
        </article>
    )
}

export default UpdateShop