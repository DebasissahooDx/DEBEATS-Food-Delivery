import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    // OTP Fields
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    // Verification Status
    isVerified: { type: Boolean, default: false } 
}, { minimize: false, timestamps: true }); // added timestamps to see when they registered

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;