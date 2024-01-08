import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar(){

    const [showSidebar, setShowSidebar] = useState(false);

    const [showHome, setHome] = useState(true);
    const [showSearch, setSearch] = useState(false);
    const [showUsers, setUsers] = useState(false);
    const [showShop, setShop] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const shopId = user.ShopId;

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    }

    const logOut = () => {
        window.location.reload(true);
    }

    const toggleHome = () => {
        setHome(true);
        setSearch(false);
        setUsers(false);
        setShop(false);

        toggleSidebar();
    }
    const toggleUsers = () => {
        setHome(false);
        setSearch(false);
        setUsers(true);
        setShop(false);

        toggleSidebar();
    }
    const toggleShop = () => {
        setHome(false);
        setSearch(false);
        setUsers(false);
        setShop(true);

        toggleSidebar();
    }

    return(
        <div>
            <header className="searchBar">
            </header>
            <div id="BottomNavbar">
                <h3></h3>
                <h2>
                    <Link to="/searchdriveoffs" onClick={toggleHome}>
                        <img className='HomeOutline' src={require('../imgs/D-O.png')} style={{ display: showHome ? 'none' : 'block' }}></img>
                        <img className='HomePressed' src={require('../imgs/D-O.png')} style={{ display: showHome ? 'block' : 'none' }}></img>
                    </Link>
                </h2>
                <h2>
                    <Link to="/usersmenu" onClick={toggleUsers}>
                        <img className='UsersOutline' src={require('../imgs/D-O.png')} style={{ display: showUsers ? 'none' : 'block' }}></img>
                        <img className='UsersPressed' src={require('../imgs/D-O.png')} style={{ display: showUsers ? 'block' : 'none' }}></img>                           
                    </Link>
                </h2>
                <h2>
                    <Link to={`/detailsshop/${shopId}`} onClick={toggleShop}>
                        <img className='HomeOutline' src={require('../imgs/D-O.png')} style={{ display: showShop ? 'none' : 'block' }}></img>
                        <img className='HomePressed' src={require('../imgs/D-O.png')} style={{ display: showShop ? 'block' : 'none' }}></img>
                    </Link>
                </h2>
            </div>
            <div id="WIDESCREEN_overlay">
                <div id="sidebar">
                    <h2>
                        <Link to="/searchdriveoffs" onClick={toggleHome}>
                            HOME
                            <img className='HomeOutline' src={require('../imgs/D-O.png')} style={{ display: showHome ? 'none' : 'block' }}></img>
                            <img className='HomePressed' src={require('../imgs/D-O.png')} style={{ display: showHome ? 'block' : 'none' }}></img>
                        </Link>
                    </h2>
                    <h2>
                        <Link to="/usersmenu" onClick={toggleUsers}>
                            USERS
                            <img className='UsersOutline' src={require('../imgs/D-O.png')} style={{ display: showUsers ? 'none' : 'block' }}></img>
                            <img className='UsersPressed' src={require('../imgs/D-O.png')} style={{ display: showUsers ? 'block' : 'none' }}></img>                           
                        </Link>
                    </h2>
                    <h2>
                        <Link to={`detailsshop/${shopId}`} onClick={toggleShop}>
                            ACCOUNT
                            <img className='ShopOutline' src={require('../imgs/D-O.png')} style={{ display: showShop ? 'none' : 'block' }}></img>
                            <img className='ShopPressed' src={require('../imgs/D-O.png')} style={{ display: showShop ? 'block' : 'none' }}></img>
                        </Link>
                    </h2>
                    <br/>
                    <h2>
                        <Link onClick={logOut}>
                            LOG OUT
                            <img src={require('../imgs/D-O.png')}></img>
                        </Link>
                    </h2>
                    <h2>
                        <button className='WIDESCREEN_scrollToTop' onClick={() => {window.scrollTo({top: 0, left: 0, behavior: 'smooth'});}}>
                            <img src={require('../imgs/D-O.png')}></img>
                            <h3>SCROLL TO TOP</h3>
                        </button>
                    </h2>
                </div>
            </div>
        </div>        
    )
}

export default Navbar;