import React from 'react'
import './Header.css'

const Header = () => {
  return (
    <div className='header'>
        <div className='header-contents'>
            <div className="header-tag">VOLTAGE CHARGED</div>
            <h2>UNLEASH THE <br/><span>THUNDER</span></h2>
            <p>
              Forget ordinary dining. <strong>DEBEATS</strong> delivers high-voltage flavors 
              and monster-sized satisfaction straight to your hideout. Fuel the beast within 
              with our electric selection of legendary mains.
            </p>
            <div className="header-actions">
                <button>Attack the Menu</button>
            </div>
        </div>
    </div>
  )
}

export default Header