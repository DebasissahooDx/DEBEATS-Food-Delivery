import { assets } from '../../assets/assets';
import './Footer.css';

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className='footer-content'>
        {/* Left section */}
        <div className='footer-content-left'>
          <img src={assets.logo} alt="DEBEATS" className='footer-logo' />
          <p>
            Fueling the digital age with high-voltage flavors. <span>DEBEATS</span> delivers industrial-grade meals for the modern hustle. From <span>CYBER SALADS</span> to <span>COBALT CURRIES</span>, we power your performance.
          </p>
          <div className='footer-social-icons'>
            <img src={assets.facebook_icon} alt="Facebook" />
            <img src={assets.twitter_icon} alt="Twitter" />
            <img src={assets.linkedin_icon} alt="LinkedIn"/>
          </div>
        </div>

        {/* Center section */}
        <div className='footer-content-center'>
          <h2>COMMAND CENTER</h2>
          <ul>
            <li>TERMINAL HOME</li>
            <li>OUR MISSION</li>
            <li>THE MENU</li>
            <li>PRIVACY PROTOCOL</li>
          </ul>
        </div>

        {/* Right section */}
        <div className='footer-content-right'>
          <h2>SUPPORT LINE</h2>
          <ul>
            <li>+91-99999-99999</li>
            <li>CORE@DEBEATS.COM</li>
          </ul>
        </div>
      </div>

      <hr/>

      <p className='footer-copyright'>
        SYSTEM STATUS: ONLINE | 2026 © <span>DEBEATS</span> - ALL RIGHTS RESERVED.
      </p>
    </div>
  );
}

export default Footer;