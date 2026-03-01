/* eslint-disable react/prop-types */
import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'
import { assets } from '../../assets/assets.js'
import { StoreContext } from '../../context/StoreContext.jsx'

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const [showSearch, setShowSearch] = useState(false);
  
  // Pull search and setSearch from Context
  const { getTotalCartAmount, token, setToken, search, setSearch } = useContext(StoreContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token")
    setToken("")
    navigate("/")
  }

  return (
    <div className='navbar'>
      <Link to='/'><img className='logo' src={assets.logo} alt="DebEATS" /></Link>
      
      <ul className='navbar-menu'>
        <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>HOME</Link>
        <a href='#explore-menu' onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>MENU</a>
        <a href='#app-download' onClick={() => setMenu("mobile-app")} className={menu == "mobile-app" ? "active" : ""}>REVIEWS</a>
        <a href='#footer' onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>CONTACT</a>
      </ul>

      <div className='navbar-right'>
        <div className={`nav-search-container ${showSearch ? "show" : ""}`}>
            <input 
              type="text" 
              placeholder="Search flavors..." 
              className="nav-search-input"
              value={search} // Controlled input
              onChange={(e) => setSearch(e.target.value)} // Updates global search state
            />
            <img 
                src={assets.search_icon} 
                alt="search" 
                className="nav-search-btn" 
                onClick={() => setShowSearch(!showSearch)} 
            />
        </div>
        
        <div className='navbar-search-icon'>
          <Link to='/cart'><img src={assets.basket_icon} alt="cart"/></Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {!token ? (
          <button className="nav-signin-btn" onClick={() => setShowLogin(true)}>
            SIGN IN
          </button>
        ) : (
          <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="profile" className="profile-img" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/myorders')}>
                <img src={assets.bag_icon} alt="" /><p>Orders</p>
              </li>
              <hr/>
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" /><p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar