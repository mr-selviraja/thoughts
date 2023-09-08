const { constants } = require("../config/constants");

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    switch(statusCode) {
        case constants.VALIDATION_ERROR:
            res.json({
                title: "Validation Failed",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        
        case constants.UNAUTHORIZED:
            res.json({
                title: "Unauthorized Request",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        
        case constants.FORBIDDEN:
            res.json({
                title: "Forbidden Request",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        
        case constants.NOT_FOUND:
            res.json({
                title: "Resource Not Found",
                message: err.message,
                stackTrace: err.stack
            });
            break;
        
        case constants.SERVER_ERROR:
            res.json({
                title: "Internal Server Error",
                message: err.message,
                stackTrace: err.stack
            });
            break;
            
        default:
            if(err) res.status(statusCode).json({ 
                title: err.message, 
                message: err.message, 
                stackTrace: err.stack 
            });
            else console.log("No Error. Request served successfully..!");
            break;
    }
};

module.exports = errorHandler;