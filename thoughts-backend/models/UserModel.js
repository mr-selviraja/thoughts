const mongoose = require("mongoose");

// Define the user schema using Mongoose
const userSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: [true, "Please provide the name"]
    },                  
    username: { 
        type: String,
        required: [true, "Please provide the username"],
        unique: true 
    }, 
    email: { 
        type: String,
        required: true,
        unique: [true, "Please provide the email"] 
    },    
    password: { 
        type: String,
        required: [true, "Please provide the password"] 
    },             
    role: {
      type: String,
      enum: ['reader', 'author', 'admin'],
      default: 'reader',
    },
    interests: {
        type: [String],
        required: [true, 'At least one interest is required.'],
        validate: [
            {
                validator: function (value) {
                    return value.length > 0;
                },
                message: 'At least one interest is required.',
            },
            {
                validator: function (value) {
                    return value.length <= 3;
                },
                message: 'Maximum of three interests allowed.',
            },
        ],
    },                                                      
    bio: { 
        type: String,
        default:  "Exploring the world of infinite possibilities, leaving a spark of love everywhere I go..!"
     },
    img: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Circle-icons-profile.svg/512px-Circle-icons-profile.svg.png?20160314153816"
    },
    profilePicture: { type: String },                                    
    savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],  
    lovedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],  
    createdArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }], 
    flaggedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }], 
});

module.exports = mongoose.model("User", userSchema);