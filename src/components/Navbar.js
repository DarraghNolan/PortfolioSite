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
                {/* <div id="navbarContent">
                    <button onClick={toggleSidebar}><img src={require('../imgs/Sidebar.png')}></img></button>
                </div>
                <h1>Hello {user.Name}!</h1> */}
            </header>
            {/* <div id="overlay" style={{display: showSidebar ? 'block' : 'none'}}>
                <div id="sidebar">
                    <h2>
                        <Link to="/driveoffs" onClick={toggleHome}>
                            HOME
                            <img className='HomeOutline' src={require('../imgs/HomeOutline.png')} style={{ display: showHome ? 'none' : 'block' }}></img>
                            <img className='HomePressed' src={require('../imgs/Home.png')} style={{ display: showHome ? 'block' : 'none' }}></img>
                        </Link>
                    </h2>
                    <h2>
                        <Link to="/searchdriveoffs" onClick={toggleSearch}>
                            SEARCH
                            <img className='SearchOutline' src={require('../imgs/Search2Outline.png')} style={{ display: showSearch ? 'none' : 'block' }}></img>
                            <img className='SearchPressed' src={require('../imgs/Search2.png')} style={{ display: showSearch ? 'block' : 'none' }}></img>
                        </Link>
                    </h2>
                    <h2>
                        <Link to="/usersmenu" onClick={toggleUsers}>
                            <div>
                                USERS MENU
                            </div>
                            <div>
                                <img className='UsersOutline' src={require('../imgs/UsersOutline.png')} style={{ display: showUsers ? 'none' : 'block' }}></img>
                                <img className='UsersPressed' src={require('../imgs/Users.png')} style={{ display: showUsers ? 'block' : 'none' }}></img>
                            </div>                            
                        </Link>
                    </h2>
                    <h2>
                        <Link to={`detailsshop/${shopId}`} onClick={toggleShop}>
                            SHOP DETAILS
                            <img className='ShopOutline' src={require('../imgs/ShopOutline.png')} style={{ display: showShop ? 'none' : 'block' }}></img>
                            <img className='ShopPressed' src={require('../imgs/Shop3.png')} style={{ display: showShop ? 'block' : 'none' }}></img>
                        </Link>
                    </h2>
                    <h2 onClick={logOut}>
                        LOG OUT
                        <img src={require('../imgs/LogOut.png')}></img>
                    </h2>
                </div>
            </div> */}
            <div id="BottomNavbar">
                <h3></h3>
                <h2>
                    <Link to="/searchdriveoffs" onClick={toggleHome}>
                        <img className='HomeOutline' src={require('../imgs/HomeOutline.png')} style={{ display: showHome ? 'none' : 'block' }}></img>
                        <img className='HomePressed' src={require('../imgs/Home.png')} style={{ display: showHome ? 'block' : 'none' }}></img>
                    </Link>
                </h2>
                <h2>
                    <Link to="/usersmenu" onClick={toggleUsers}>
                        <img className='UsersOutline' src={require('../imgs/UsersOutline.png')} style={{ display: showUsers ? 'none' : 'block' }}></img>
                        <img className='UsersPressed' src={require('../imgs/Users.png')} style={{ display: showUsers ? 'block' : 'none' }}></img>                           
                    </Link>
                </h2>
                <h2>
                    <Link to={`/detailsshop/${shopId}`} onClick={toggleShop}>
                        <img className='HomeOutline' src={require('../imgs/AccountOutline.png')} style={{ display: showShop ? 'none' : 'block' }}></img>
                        <img className='HomePressed' src={require('../imgs/Account.png')} style={{ display: showShop ? 'block' : 'none' }}></img>
                    </Link>
                </h2>
            </div>
            <div id="WIDESCREEN_overlay">
                <div id="sidebar">
                    <h2>
                        <Link to="/searchdriveoffs" onClick={toggleHome}>
                            HOME
                            <img className='HomeOutline' src={require('../imgs/HomeOutline.png')} style={{ display: showHome ? 'none' : 'block' }}></img>
                            <img className='HomePressed' src={require('../imgs/Home.png')} style={{ display: showHome ? 'block' : 'none' }}></img>
                        </Link>
                    </h2>
                    <h2>
                        <Link to="/usersmenu" onClick={toggleUsers}>
                            USERS
                            <img className='UsersOutline' src={require('../imgs/UsersOutline.png')} style={{ display: showUsers ? 'none' : 'block' }}></img>
                            <img className='UsersPressed' src={require('../imgs/Users.png')} style={{ display: showUsers ? 'block' : 'none' }}></img>                           
                        </Link>
                    </h2>
                    <h2>
                        <Link to={`detailsshop/${shopId}`} onClick={toggleShop}>
                            ACCOUNT
                            <img className='ShopOutline' src={require('../imgs/AccountOutline.png')} style={{ display: showShop ? 'none' : 'block' }}></img>
                            <img className='ShopPressed' src={require('../imgs/Account.png')} style={{ display: showShop ? 'block' : 'none' }}></img>
                        </Link>
                    </h2>
                    <br/>
                    <h2>
                        <Link onClick={logOut}>
                            LOG OUT
                            <img src={require('../imgs/LogOut.png')}></img>
                        </Link>
                    </h2>
                    <h2>
                        <button className='WIDESCREEN_scrollToTop' onClick={() => {window.scrollTo({top: 0, left: 0, behavior: 'smooth'});}}>
                            <img src={require('../imgs/ToTop.png')}></img>
                            <h3>SCROLL TO TOP</h3>
                        </button>
                    </h2>
                </div>
            </div>
        </div>        
    )
}

export default Navbar;