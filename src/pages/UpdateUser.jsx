import axios from "../axios";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import "../style.css";

const UpdateUser = () =>{
    const [user, setUser] = useState({
        Name:"",
        Position:"",
        Password:""
    });

    const [updateStatus, setUpdateStatus] = useState("");

    const navigate = useNavigate()
    const location = useLocation()

    const userId = location.pathname.split("/")[2]

    const [currentUserPosition, setCurrentUserPosition] = useState("");
    const currentUser = JSON.parse(localStorage.getItem("user")); // Remove 'const'

    useEffect(() => {
        const fetchUser = async () => {
          try {
            //  --  Standard Localhost Connection
            const response = await axios.get(`/users/${userId}`);
            
            const userData = response.data;
            setUser(userData);
          } catch (err) {
            console.log(err);
          }
        };

        const checkCurrentUserPos = () => {
            setCurrentUserPosition(currentUser.Position); // Set the current user's position
        };
        
        checkCurrentUserPos();
        fetchUser();
    }, [userId]);
    

    const handleChange = (e) =>{
        setUser((prev)=>({...prev, [e.target.name] : e.target.value }));
    };

    const handleClick = async e =>{
        e.preventDefault()
        try{
            //  --  Standard LocalHost Connection
            await axios.put("/users/" + userId, user)

            navigate("/usersmenu")
        }catch(err){
            console.log("The User was not updated...")
            console.log(err)
            setUpdateStatus("The User was not updated...");
        }
    };

    return (
        <article className='form'>
            <div>
                <div> 
                    <h4>
                        Password:
                    </h4>
                    <input
                        type="text"
                        placeholder="Password"
                        value={user.Password || ""}
                        onChange={handleChange}
                        name="Password"
                    />
                </div>
                {(currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                    <div> 
                        <h4>
                            Name:
                        </h4>
                        <input
                            type="text"
                            placeholder="Name"
                            value={user.Name || ""}
                            onChange={handleChange}
                            name="Name"
                        />
                    </div>
                    <div> 
                        <h4>
                            Position:
                        </h4>
                        <select
                            id="ManagerODBox"
                            onChange={handleChange}
                            name="Position"
                            value={user.Position || ""} // Set the selected value
                        >
                            {(currentUser.id === user.id) ? (
                            <>
                                <option value="Manager">Manager</option>
                            </>
                            ) : null}
                            {(currentUser.id != user.id) ? (
                            <>
                                <option value="Employee">Employee</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Manager">Manager</option>
                            </>
                            ) : null}
                        </select>
                    </div>
                </>
                ) : null}
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

export default UpdateUser