const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

// Storage
const fileStorage = multer.memoryStorage();

// File type checking
const fileFilter = (req, file, cb) => {
    // Check file
    if(file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        // Rejected files
        cb({ message: "Unsupported file format" }, false);
    }
};

const profileImgUpload = multer({
    storage: fileStorage,
    fileFilter,
    limits: {
        fileSize: 2000000
    }
});

const profileImgResize = async(req, res, next) => {
	// Check if there is no file
	if(!req.file) return next();

	req.file.fileName = `user-${Date.now()}-${req.file.originalname}`;

	await sharp(req.file.buffer)
        .resize(250, 250)
        .toFormat("jpeg").jpeg({ quality: 90 })
        .toFile(path.join(`images/${req.file.fileName}`));

	next();
};

module.exports = { profileImgUpload, profileImgResize };