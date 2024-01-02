import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from '../axios'; // Import the Axios instance with the base URL
import '../style.css';

const DetailsShop = () => {
  const [shop, setShop] = useState(null);
  const location = useLocation();
  const shopId = location.pathname.split('/')[2];
  const [currentUserPosition, setCurrentUserPosition] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const navigate = useNavigate();

  const logOut = () => {
    window.location.reload(true);
  }

  useEffect(() => {
    const fetchShop = async () => {
      try {
        // Use the Axios instance with the base URL
        const response = await axios.get(`/shops/${shopId}`);
        if (response.status === 200) {
          setShop(response.data);
        } else {
          throw new Error('Error occurred while fetching shop details. Please try again.');
        }
      } catch (err) {
        console.error(err);
        console.log('Error occurred while fetching shop details. Please try again.');
      }
    };

    const checkCurrentUserPos = () => {
      setCurrentUserPosition(currentUser.Position);
    };

    checkCurrentUserPos();
    fetchShop();
  }, [shopId]);

  return (
    <article>
      {shop && (
        <div className="driveOff">
          <div>
            <h2>Hello {currentUser.Name}!</h2>
            <div className='userAccountDetails'>
              <h3>Position: {currentUser.Position}</h3>
              <Link to={`/updateuser/${currentUser.id}`}>
                <button className='defaultBtn'>
                  Edit User Details
                  <img className="defaultIcon" src={require('../imgs/Edit.png')} alt="Edit" />
                </button>
              </Link>
            </div>

            <br/>
            <h2>Shop Address</h2>
            <h3>{shop.AddressLine1}</h3>
            <h3>{shop.AddressLine2}</h3>
            <h3>{shop.AddressLine3}</h3>
            <h3>{shop.AddressLine4}</h3>
            <h3>{shop.Eircode}</h3>
            <br />
            <h3>Phone Number:</h3>
            <h3>{shop.PhoneNumber}</h3>
            <br />
            <h3>Email:</h3>
            <h3>{shop.Email}</h3>
          </div>

          {(currentUserPosition === 'Manager' || currentUserPosition === 'Master') ? (
            <>
              <button className='defaultBtn' id='exportPDFBtn'>
                <Link to={`/updateshop/${shopId}`}>
                  Edit Shop Details
                  <img className="defaultIcon" src={require('../imgs/Edit.png')} alt="Edit" />
                </Link>
              </button>
            </>
          ) : null}
          <br/>
          <button className='defaultBtn' id='exportPDFBtn' onClick={logOut}>
            Log Out
            <img className="defaultIcon" src={require('../imgs/LogOut.png')}></img>
          </button>
        </div>
      )}
    </article>
  );
};

export default DetailsShop; 