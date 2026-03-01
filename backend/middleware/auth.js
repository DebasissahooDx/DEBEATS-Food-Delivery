import jwt from 'jsonwebtoken'

const authMiddleware = async (req, res, next) => {
    // 1. Get token from headers
    const { token } = req.headers;

    // 2. Comprehensive check: Is the token missing, or is it a "placeholder" string?
    if (!token || token === "undefined" || token === "null") {
        return res.json({ 
            success: false, 
            message: 'Not authorized. Please login again.' 
        });
    }

    try {
        // 3. Verify the token against your secret
        // If this is a loginToken being used here, it will fail (which is good)
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach the decoded userId to the request body
        req.body.userId = token_decode.id;
        
        next();
    } catch (error) {
        console.log("Auth Error:", error.message);
        
        // Distinguish between expired and malformed tokens for better debugging
        const errorMessage = error.name === "TokenExpiredError" 
            ? "Session expired. Please login again." 
            : "Invalid token. Authorization denied.";

        res.json({ success: false, message: errorMessage });
    }
}

export default authMiddleware;