const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/BlacklistedTokenModel")

/** 
    Since, the application needs to handle multiple user requests and server has to make sure that
    each user is having a valid auth token which needs reassignments as and when needed. This is 
    why we're using "let" instead of "const".
*/

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;

    // Ckeck the prensence and validation of auth header
    if(authHeader && authHeader.startsWith("Bearer")) {

        // Extract token from the auth header
        token = authHeader.split(" ")[1];

        // Check if the token is blacklisted
        const isBlacklisted = await BlacklistedToken.findOne({ token });

        // If the token is blacklisted, acknowledge the client
        if (isBlacklisted) {
            res.status(401); // Unauthorized status code
            throw new Error("User is not Authorized, Please login");
        }

        // Verify the token using jwt
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedInfo) => {
            // If error occurs while verifying the token
            if(err) {
                res.status(400);
                throw new Error("User is not Authorized");
            }

            // Set the decoded info to req.user object, on successful verification of jwt token
            req.user = decodedInfo.user;
            next();
        });

        // If token is absent (or) missing
        if(!token) {
            res.status(400);
            throw new Error("User is not Authorised (or) Auth token is missing");
        }
    }
});

module.exports = validateToken;