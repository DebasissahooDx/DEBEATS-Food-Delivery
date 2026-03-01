import nodemailer from 'nodemailer';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get the current directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTPEmail = async (email, otp, type = 'login', name = 'User') => {
    
    let subject = "";
    let messageBody = "";

    if (type === 'register') {
        subject = `Welcome to the Family, ${name.split(' ')[0]}! 🍔`;
        messageBody = `
            <div style="padding: 10px 0; text-align: left;">
                <h2 style="color: #333; font-size: 26px; margin-bottom: 15px; font-weight: 800;">Hey ${name},</h2>
                <p style="font-size: 17px; color: #444; line-height: 1.8;">
                    Welcome to <strong>DEBEATS</strong>! We're absolutely thrilled to have another food lover in our community. 
                </p>
                <p style="font-size: 17px; color: #444; line-height: 1.8;">
                    You're just one tiny step away from unlocking the best local flavors delivered straight to your door. Use the secure code below to verify your account and start your first order!
                </p>
                <div style="background: linear-gradient(135deg, #fff5f2 0%, #fff0eb 100%); border-radius: 16px; padding: 35px; text-align: center; margin: 35px 0; border: 2px solid #ff4c24;">
                    <p style="margin: 0 0 12px 0; color: #ff4c24; font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 2px;">Your Exclusive Access Code</p>
                    <h1 style="color: #1a1a1a; font-size: 48px; letter-spacing: 12px; margin: 0; font-family: 'Courier New', Courier, monospace; font-weight: 900;">${otp}</h1>
                    <p style="margin: 15px 0 0 0; color: #999; font-size: 13px;">This code expires in 5 minutes for your security.</p>
                </div>
                <p style="font-size: 16px; color: #555; text-align: center; font-style: italic; margin-top: 20px;">
                    Grab your fork, your favorite meal is just a few clicks away!
                </p>
            </div>
        `;
    } else {
        subject = "Login Verification - DEBEATS";
        messageBody = `
            <div style="padding: 10px 0;">
                <h2 style="color: #333; font-size: 22px; font-weight: 700;">Secure Sign-In</h2>
                <p style="font-size: 16px; color: #555;">Please enter the following verification code to access your DEBEATS account:</p>
                <div style="background-color: #f8f8f8; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; border: 1px solid #eee;">
                    <h1 style="color: #333; font-size: 40px; letter-spacing: 8px; margin: 0; font-weight: 800;">${otp}</h1>
                </div>
                <p style="font-size: 13px; color: #a0a0a0;">If this wasn't you, please ignore this email or contact support.</p>
            </div>
        `;
    }

    const mailOptions = {
        from: `"DEBEATS Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: `
            <div style="background-color: #f6f6f6; padding: 50px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; padding: 45px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
                    
                    ${messageBody}
                    
                    <div style="margin-top: 45px; padding-top: 25px; border-top: 1px solid #f0f0f0; text-align: center;">
                        <p style="font-size: 13px; color: #cccccc; margin: 0;">
                            © 2026 DEBEATS Food Delivery. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        `
        // attachments section removed
    };

    return await transporter.sendMail(mailOptions);
};