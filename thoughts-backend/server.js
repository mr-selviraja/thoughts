require("dotenv").config();
const express = require("express");
const connectDB = require("./config/dbConnection");

// Connect to DB
connectDB();

// Create an Express application instance
const app = express();
// Set the port number for the server to run on
const port = process.env.PORT || 3001;

// Listen for requests on the root route
app.get("/", (req, res) => {
    console.log("GET request received at '/' route");
    res.send({ success: true, message: "Hello, from the Server..!" });
});

// Start the Express server and listen on the specified port
app.listen(port, () => {
    console.log(`Server started on the port: ${port}`);
});