import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import "../style.css"

const UserMenu = () => {
  const [users, setUsers] = useState([]);

  const [error, setError] = useState(null);

  const [showReportBtns, setShowReportBtns] = useState(false); // State to track button display

  const [currentUserPosition, setCurrentUserPosition] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  //  --  Old Fetch Requests
    useEffect(() => {
      const fetchAllUsers = async () => {
        try {
          const resRemoteHome = await axios.get("/users/");
          
          const filteredUsers = resRemoteHome.data.filter(user => user.ShopId === currentUser.ShopId);

          setUsers(filteredUsers);
        } catch (err) {
          console.log(err);
          setError("Error occurred while fetching users. Please try again.");
        }
      };    

      const checkCurrentUserPos = () => {
        setCurrentUserPosition(currentUser.Position); // Set the current user's position
      };

      fetchAllUsers();
      checkCurrentUserPos();
    }, []);
  
    const groupedUsers = users.reduce((groups, user) => {
      const position = user.Position;

      // Initialize arrays for each position if they don't exist
      if (!groups[position]) {
      groups[position] = [];
      }

      // Push the user into the appropriate position group
      groups[position].push(user);
      return groups;
    }, {});

    // Order the groups as Manager, Supervisor, Employee
    const orderedGroups = [
      "Manager",
      "Supervisor",
      "Employee",
    ].map((position) => ({
      position,
      users: groupedUsers[position] || [],
    }));

    const toggleDeleteModal = (userId = null) => {
      setDeleteUserId(userId); // Set the user ID to be deleted
      setShowDeleteModal(!showDeleteModal); // Toggle the state when the button is clicked
    };
    
    const deleteUser = async () => {
      try {
        await axios.delete(`/users/${deleteUserId}`);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteUserId));
        toggleDeleteModal(); // Close the delete modal
      } catch (err) {
        console.log("Error deleting user:", err);
      }
    };

    const sortUsersAlphabetically = (users) => {
      return users.slice().sort((a, b) => a.Name.localeCompare(b.Name));
    };

  return (
    <article className='caption'>
      <div id='mainPanel'>
        <h1 id='Drive-OffsH1'>Users</h1>
        <br/>
        {error && <div>{error}</div>}
        <div className="driveOffs">
        {orderedGroups.map((group) => (
          <div key={group.position}>
            <h2 id='Drive-OffsH1'>{group.position}s</h2>
            {sortUsersAlphabetically(group.users).map((user) => (
            <div className={`userList ${user.Position.toLowerCase()}`} key={user.id}>
            <div className='deleteModalOverlay' style={{ display: showDeleteModal && deleteUserId === user.id ? 'flex' : 'none' }}>
              <div id='deleteUserModalOverlay' className='deleteModalOverlay'>
                <div className='deleteModal'>
                  <h1>
                    ARE YOU SURE YOU WANT TO REMOVE {user.Name.toUpperCase()}?
                  </h1>
                  <div className='detailsCrudBtns' id='deleteModalBtns' >
                    <button className='defaultBtn' onClick={() => toggleDeleteModal(null)}>
                      CANCEL
                      <img className="defaultIcon" src={require('../imgs/Back.png')} alt="Edit"/>
                    </button>
                    <button className='defaultBtn' onClick={deleteUser}>
                      DELETE
                      <img className="defaultIcon" src={require('../imgs/Delete.png')} alt="Edit"/>
                    </button>
                  </div>                  
                </div>                  
              </div>
            </div>
              <div id='userDetails' >
                <h3>{user.Name} -</h3>
                <h3>- {user.Position}</h3>
              </div>
              <div className='EditNDeleteUserBtns'>
                {/* Conditionally render edit/delete buttons based on the user's position */}
                {currentUser && (currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
                <>
                  <button className={`EditNDeleteUserBtn ${user.Position.toLowerCase()}`}>
                    <Link to={`/updateuser/${user.id}`}>
                      <img className="defaultIcon" src={require('../imgs/Edit.png')} alt="Edit"/>
                      <a id='userMenuBtnText'> 
                        EDIT
                      </a>
                    </Link>
                  </button>
                  {(currentUser.id != user.id) ? (
                  <>
                    <a id='userMenuBtnText'> |</a>
                    <button className={`EditNDeleteUserBtn ${user.Position.toLowerCase()}`} onClick={() => toggleDeleteModal(user.id)}>
                      <img className="defaultIcon" src={require('../imgs/Delete.png')} alt="Delete" />
                      <a id='userMenuBtnText'> 
                        DELETE
                      </a>
                    </button>
                  </>
                  ) : (currentUser.id === user.id) ? (
                  <>
                    <a id='userMenuBtnText'> |</a>
                    <button className={`EditNDeleteUserBtn ${user.Position.toLowerCase()}`}  onClick={() => toggleDeleteModal(user.id)}>
                      <img className="defaultIcon" src={require('../imgs/Delete.png')} alt="Delete" />
                      <a id='userMenuBtnText'> 
                        DELETE
                      </a>
                    </button>
                  </>
                  ) : null}
                </>
                ) : null}

                {currentUser && (user.id === currentUser.id && (currentUserPosition === "Supervisor" || currentUserPosition === "Employee")) ? (
                <>
                  <button className={`EditNDeleteUserBtn ${user.Position.toLowerCase()}`}>
                    <Link to={`/updateuser/${user.id}`}>
                      <img className="defaultIcon" src={require('../imgs/Edit.png')} alt="Edit"/>
                      <a id='userMenuBtnText'> 
                        EDIT
                      </a>
                    </Link>
                  </button>
                </>
                ) : null}
              </div>
              
            </div>
            ))}
          </div>
          ))}
        </div>
      </div>
      {currentUser && (currentUserPosition === "Manager" || currentUserPosition === "Master") ? (
        <>
        <button className='newReportBtn'>
          <Link to="/addusers" className='WIDESCREEN_newRptContent'>
            <img id='closeOverlayBtn' src={require('../imgs/NewUser.png')}/>
          </Link>
        </button>
        <div className='WIDESCREEN_newReportBtns'>
          <button>
            <Link to="/addusers" className='WIDESCREEN_newRptContent'>
              <img className='newUserBtn' src={require('../imgs/NewUser.png')} alt="Create User" />
              <h3 id='newReportBtnH3'>CREATE USER</h3>
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

export default UserMenu;