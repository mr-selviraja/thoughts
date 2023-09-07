const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/BlacklistedTokenModel");

// @desc Register a new user
// @route POST /api/users/register
// @access PUBLIC
const registerUser = asyncHandler(async (req, res) => {
        // Extract user data from the request body
        const { name, username, email, password, role, interests, bio } = req.body;

        // Validate the user data
        if(!name || !username || !email || !password || !interests) {
            res.status(400);
            throw new Error("Please fill all  fields to Register");
        }

        // Check whether user is already existing
        const emailExists = await User.findOne({ email });
        const usernameExists = await User.findOne({ username });
        if(emailExists && usernameExists) {
            res.status(400);
            throw new Error(`User with the Email address ${emailExists.email} and Username ${usernameExists.username} already exists`);
        }
        else if(emailExists) {
            res.status(400);
            throw new Error(`User with the Email address ${emailExists.email} already exists`);
        } else if(usernameExists) {
            res.status(400);
            throw new Error(`User with the Username ${usernameExists.username} already exists`);
        }

        // Create new user in the DB
        const newUser = User.create({
            name,
            email,
            username,
            password: await bcrypt.hash(password, 10), // hash the password before saving
            role,
            interests,
            bio
        });

        // Acknowledge the client about new user creation
        if(newUser) {
            res.status(201).json({ 
                _id: (await newUser).id, 
                email: (await newUser).email,
                success: true, 
                message: "User Registered" 
            });
        }
        // Acknowledge the client in case of errors
        else {
            res.status(400);
            throw new Error("User data is not valid");
        }
});

// @desc Login a user
// @route POST /api/users/login
// @access PUBLIC
const loginUser = asyncHandler(async (req, res) => {
    // Extract user data from the request body
    const { email, password } = req.body;

    // Validate the user login data
    if(!email || !password) {
        res.status(400);
        throw new Error("Please fill all fields to login..!");
    }

    // Find the user using the provided email
    const foundUser = await User.findOne({ email });

    // Login the user, if the provided password and found user password are the same
    if(foundUser && await(bcrypt.compare(password, foundUser.password))) {
        // Generate an access token using jwt
        const accessToken = jwt.sign(
            {
                user: {
                    username: foundUser.name,
                    email: foundUser.email,
                    id: foundUser.id
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );

        // Acknowledge the client about the successful login and send the access token
        res.status(200).json({ success: true, message: "User Login Successful", accessToken });
    }
    // If no user found with given credentials
    else {
        res.status(401);
        throw new Error("Invalid login credentials");
    }
});

const currentUser = asyncHandler(async (req, res) => {
    // Fetch the user role from DB, using req.user which was set in validateTokenHandler
    const currentUserEmail = req.user.email;
    const foundUser = await await User.findOne({ email: currentUserEmail });

    // If user not found with the validated info
    if(!foundUser) {
        res.status(401);
        throw new Error("User not found");
    }

    // Check user role and send respective roles data
    if(foundUser.role === "admin") {
        // Send admin specific data
    } else {
        // Send reader(or)author specific data
    }

    // DELETABLE CODE
    res.status(200).json({ success: "true", message: "User Authentication Successful", user: foundUser });
});

// @desc Logout current user
// @route POST /api/users/logout
// @access PRIVATE
const logoutUser = asyncHandler(async (req, res) => {
    let authHeader = req.headers.authorization || req.headers.Authorization;

    // Extract the token from the request headers
    const token = authHeader.split(" ")[1];

    // Check if the token is already blacklisted
    const isTokenBlacklisted = await BlacklistedToken.findOne({ token });

    // If the token is already blacklisted, acknowledge the client that user has logged out
    if(isTokenBlacklisted) {
        res.status(200).json({ message: "User Logout Successful" });
    }

    // If the token is not blacklisted, add it to the blacklist
    await BlacklistedToken.create({ token });

    // Respond with a success message
    res.status(200).json({ message: "User Logout Successful" });
});

module.exports = { registerUser, loginUser, currentUser, logoutUser };