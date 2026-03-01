import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { sendOTPEmail } from "../config/emailConfig.js";

// --- Helper Functions ---

const generateTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// --- Controllers ---

/**
 * 1. REGISTER: Validates data and sends OTP. 
 * User is NOT saved to DB yet; data is carried in a JWT.
 */
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        const exists = await userModel.findOne({ email: email.toLowerCase() });
        if (exists && exists.isVerified) {
            return res.json({ success: false, message: 'User already exists.' });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Invalid email format.' });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        
        const hashedOtp = await bcrypt.hash(otp, salt);
        const hashedPassword = await bcrypt.hash(password, salt);

        const accountToken = jwt.sign(
            { name, email: email.toLowerCase(), hashedPassword, hashedOtp },
            process.env.JWT_SECRET,
            { expiresIn: '15m' } 
        );

        try {
            await sendOTPEmail(email, otp, 'register', name);
            res.json({ 
                success: true, 
                message: "Registration OTP sent to your email!", 
                accountToken, 
                verifyOtp: true 
            });
        } catch (mailErr) {
            res.json({ success: false, message: "Failed to send email." });
        }

    } catch (error) {
        res.json({ success: false, message: "Registration error." });
    }
}

/**
 * 2. VERIFY REGISTER: Finalizes registration and saves user to DB.
 */
const verifyRegisterOtp = async (req, res) => {
    const { otp, accountToken } = req.body;
    try {
        if (!accountToken) {
            return res.json({ success: false, message: "No session found. Please register again." });
        }

        const decoded = jwt.verify(accountToken, process.env.JWT_SECRET);

        const isMatch = await bcrypt.compare(otp, decoded.hashedOtp);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid OTP code." });
        }

        const exists = await userModel.findOne({ email: decoded.email });
        if (exists) return res.json({ success: false, message: "User already registered." });

        const newUser = new userModel({
            name: decoded.name,
            email: decoded.email,
            password: decoded.hashedPassword,
            isVerified: true 
        });

        const user = await newUser.save();
        const { accessToken, refreshToken } = generateTokens(user._id);

        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.json({ success: true, message: "Account verified!", accessToken });

    } catch (error) {
        const msg = error.name === "TokenExpiredError" ? "Session expired. Register again." : "Invalid session.";
        res.json({ success: false, message: msg });
    }
}

/**
 * 3. LOGIN: Validates password and sends Login OTP (2FA).
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (!user || !user.isVerified) {
            return res.json({ success: false, message: 'User does not exist or not verified.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid credentials.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        const loginToken = jwt.sign(
            { id: user._id, hashedOtp },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        try {
            await sendOTPEmail(user.email, otp, 'login', user.name);
            res.json({ 
                success: true, 
                message: "Login OTP sent to your email!", 
                loginToken, 
                verifyLogin: true 
            });
        } catch (mailErr) {
            res.json({ success: false, message: "Failed to send login OTP." });
        }

    } catch (error) {
        res.json({ success: false, message: "Login error" });
    }
}

/**
 * 4. VERIFY LOGIN OTP: Finalizes the 2FA login process.
 */
const verifyLoginOtp = async (req, res) => {
    const { otp, loginToken } = req.body;
    try {
        if (!loginToken) {
            return res.json({ success: false, message: "Session expired. Please login again." });
        }

        const decoded = jwt.verify(loginToken, process.env.JWT_SECRET);

        const isMatch = await bcrypt.compare(otp, decoded.hashedOtp);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid OTP code." });
        }

        const { accessToken, refreshToken } = generateTokens(decoded.id);

        res.cookie('refreshToken', refreshToken, cookieOptions);
        res.json({ success: true, message: "Login successful!", accessToken });

    } catch (error) {
        res.json({ success: false, message: "Invalid or expired login session." });
    }
}

/**
 * 5. REFRESH TOKEN: Silent refresh for expired access tokens.
 */
const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Logged out. Please login." });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.json({ success: true, accessToken });
    } catch (error) {
        res.status(403).json({ success: false, message: "Session expired. Please login again." });
    }
}

/**
 * 6. LOGOUT: Clears the secure refresh token cookie.
 */
const logoutUser = async (req, res) => {
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ success: true, message: "Logged out" });
};

export { 
    loginUser, 
    registerUser, 
    verifyRegisterOtp, 
    verifyLoginOtp, 
    refreshAccessToken, 
    logoutUser 
};