/* eslint-disable react/prop-types */
import { useContext, useState } from 'react'
import './LoginPopUp.css'
import { assets } from '../../assets/assets.js'
import { StoreContext } from '../../context/StoreContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopUp = ({ setShowLogin }) => {

    const { url, setToken } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Login")
    const [otp, setOtp] = useState("")
    const [tempToken, setTempToken] = useState("") 
    const [verifyType, setVerifyType] = useState("") 
    const [loading, setLoading] = useState(false) // State to track OTP generation

    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
        event.preventDefault()
        setLoading(true); // Start loading immediately
        
        // --- STEP 2: VERIFY OTP ---
        if (currState === "Verify") {
            try {
                const endpoint = verifyType === "login" ? "/api/user/verify-login" : "/api/user/verify-otp";
                const payload = verifyType === "login" 
                    ? { otp, loginToken: tempToken } 
                    : { otp, accountToken: tempToken };

                const response = await axios.post(url + endpoint, payload)

                if (response.data.success) {
                    setToken(response.data.accessToken);
                    localStorage.setItem("token", response.data.accessToken)
                    setShowLogin(false)
                    toast.success("Login Successful")
                } else {
                    toast.error(response.data.message)
                }
            } catch (error) {
                toast.error("Verification failed. Session might have expired.")
            } finally {
                setLoading(false);
            }
            return;
        }

        // --- STEP 1: INITIAL LOGIN/SIGNUP ---
        let newUrl = url + (currState === "Login" ? "/api/user/login" : "/api/user/register");

        try {
            const response = await axios.post(newUrl, data)

            if (response.data.success) {
                if (response.data.verifyLogin) {
                    setTempToken(response.data.loginToken)
                    setVerifyType("login")
                    setCurrState("Verify")
                } 
                else if (response.data.verifyOtp) {
                    setTempToken(response.data.accountToken)
                    setVerifyType("register")
                    setCurrState("Verify")
                } 
                else {
                    setToken(response.data.accessToken);
                    localStorage.setItem("token", response.data.accessToken)
                    setShowLogin(false)
                }
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error("Error connecting to server")
        } finally {
            setLoading(false); // Stop loading after request finishes
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className='login-popup-container'>
                <div className='login-popup-logo-container'>
                    <img src={assets.logo} alt="Logo" className='login-popup-logo' />
                </div>

                <div className='login-popup-title'>
                    <h2>{currState === "Verify" ? `Verify ${verifyType === "login" ? "Login" : "Account"}` : currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt='Close' />
                </div>

                <div className='login-popup-inputs'>
                    {/* If loading and not in Verify state, show the Generating message */}
                    {loading && currState !== "Verify" ? (
                        <div className="otp-loading">
                            <div className="spinner"></div>
                            <p>Generating OTP...</p>
                        </div>
                    ) : (
                        <>
                            {currState === "Verify" ? (
                                <div className="otp-input-section">
                                    <p className="otp-instruction">Enter the 6-digit code sent to <b>{data.email}</b></p>
                                    <input 
                                        type='text' 
                                        placeholder='Enter OTP' 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value)} 
                                        required 
                                        maxLength="6"
                                        className="otp-display-input"
                                    />
                                </div>
                            ) : (
                                <>
                                    {currState === "Login" ? null : <input name='name' onChange={onChangeHandler} value={data.name} type='text' placeholder='Your name' required />}
                                    <input name='email' onChange={onChangeHandler} value={data.email} type='email' placeholder='Your email' required />
                                    <input name='password' onChange={onChangeHandler} value={data.password} type='password' placeholder='Password' required />
                                </>
                            )}
                        </>
                    )}
                </div>

                <button type='submit' disabled={loading}>
                    {loading ? "Please Wait..." : (currState === "Verify" ? "Verify & Continue" : (currState === "Sign Up" ? "Create account" : "Login"))}
                </button>

                {currState !== "Verify" && !loading && (
                    <div className='login-popup-condition'>
                        <input type='checkbox' required />
                        <p>By continuing, I agree to the terms of use and privacy policy.</p>
                    </div>
                )}

                {!loading && (
                    <div className="login-popup-switch">
                        {currState === "Login"
                            ? <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
                            : currState === "Sign Up" 
                                ? <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
                                : <p>Entered wrong email? <span onClick={() => {setCurrState("Login"); setVerifyType("")}}>Go back</span></p>
                        }
                    </div>
                )}
            </form>
        </div>
    )
}

export default LoginPopUp