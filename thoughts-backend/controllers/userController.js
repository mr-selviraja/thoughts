const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BlacklistedToken = require("../models/BlacklistedTokenModel");
const mongoose = require("mongoose");
const cloudinaryUploadImg = require("../utilities/cloudinary");
const fs = require("fs");

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

        // Check if the interests array has at least one interest
        if (!interests || interests.length === 0) {
            res.status(400);
            throw new Error("At least one interest is required");
        }
    
        // Check if the interests array has more than three interests
        if (interests.length > 3) {
            res.status(400);
            throw new Error("Maximum of three interests allowed");
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

// @desc Get current user info
// @route GET  /api/users/current
// @access PRIVATE
const currentUser = asyncHandler(async (req, res) => {
    // Fetch the user role from DB, using req.user which was set in validateTokenHandler
    const currentUserEmail = req.user.email;
    const { name, username, role, interests } = await User.findOne({ email: currentUserEmail });

    // If user not found with the validated info
    if(!username) {
        res.status(401);
        throw new Error("User not found");
    }

    // Construct information to be sent to the client
    const currentUserInfo = {
        name,
        username,
        role,
        interests
    };

    // Check user role and send respective roles data
    if(role === "admin") {
        // Send admin specific data
    } else {
        // Send reader(or)author specific data
    }

    // DELETABLE CODE
    res.status(200).json({ success: "true", message: "User Authentication Successful", user: currentUserInfo });
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
    res.status(200).json({ success: true, message: "User Logout Successful" });
});

// @desc Get current user profile
// @route GET /api/users/:userId
// @access PRIVATE
const getUserProfile = asyncHandler(async (req, res) => {
    // Extract the userId from req.params
    const userId = req.params.userId;

    // Validate that userId is a valid ObjectId (MongoDB ID)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    // Query the user by ID
    const foundUser = await User.findById(userId);

    // Check if the user exists
    if (!foundUser) {
        res.status(401);
        throw new Error("User not found");
    }

    // Send current user object to client
    res.status(200).json({ success: true, message: "User Authentication Successful", user: {
        name: foundUser.name, 
        username: foundUser.username, 
        email: foundUser.email, 
        role: foundUser.role, 
        interests: foundUser.interests, 
        bio: foundUser.bio,
        img: foundUser.img
    } });
});

// @desc Upload profile image
// @route PUT /api/users/:userId/profile-img-upload
// @access PRIVATE
const profileImgUploadController = asyncHandler(async (req, res) => {
    // Get the path to the image
    const localPathToImg = `images/${req.file.fileName}`;

    // Upload image to cloudinary
    const uploadedImg = await cloudinaryUploadImg(localPathToImg);

    // Fetch the current user info
    const currentUserId = req.params.userId;

    console.log(currentUserId);

    // Validate that userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(currentUserId)) {
        res.status(400);
        throw new Error("Invalid user ID");
    }

    // Find user in the DB, using userId and update
    const foundUser = await User.findByIdAndUpdate(
        currentUserId,
        {
            img: uploadedImg.url
        },
        { new: true }
    );

    // Handle if user not found
    if(!foundUser) {
        res.status(401);
        throw new Error("User not found");
    }

    // Remove uploaded image from the server
    fs.unlinkSync(localPathToImg);

    res.json({ success: true, message: "Profile image uploaded", updatedUser: foundUser });
});


const updateUserProfile = asyncHandler(async (req, res) => {
    // Extract userId from user request
    const userId = req.params.userId;

    // Validate that userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400);
      throw new Error("Invalid user ID");
    }

    // Extract the updated user data from the request body
    const {
        name,
        interests,
        bio
    } = req.body;

    // Find user in the DB, using userId and update
    const foundUser = await User.findByIdAndUpdate(
        userId,
        { $set: {
            name,
            interests,
            bio
        }},
        { new: true }
    );

    // Handle if user not found
    if(!foundUser) {
        res.status(401);
        throw new Error("User not found");
    }

    res.json({ success: true, message: "User Profile Updated", updatedUser: foundUser });
});

module.exports = { 
    registerUser, 
    loginUser, 
    currentUser, 
    logoutUser, 
    getUserProfile,
    profileImgUploadController,
    updateUserProfile
};