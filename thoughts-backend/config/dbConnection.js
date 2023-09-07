const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const db = await mongoose.connect(process.env.CONNECTION_STRING);

        console.log(`Connected to the Database: ${db.connection.name}, on the host ${db.connection.host}`);
    } catch(err) {
        console.log(`Error connecting to the Database: ${err}`);

        // acknowledge other processes that this process has failed
        process.exit(1);
    }
}

module.exports= connectDB;