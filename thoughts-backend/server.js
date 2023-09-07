require("dotenv").config();
const express = require("express");
const connectDB = require("./config/dbConnection");
const errorHandler = require("./middlewares/errorHandler");

// Connect to DB
connectDB();

// Create an Express application instance
const app = express();
// Set the port number for the server to run on
const port = process.env.PORT || 3001;

// Parse JSON request bodies
app.use(express.json());

// Use userRoutes for handling user-related API endpoints
app.use("/api/users", require("./routes/userRoutes"));
// Use errorHandler to handle client-server erros
app.use(errorHandler);

// Start the Express server and listen on the specified port
app.listen(port, () => {
    console.log(`Server started on the port: ${port}`);
});