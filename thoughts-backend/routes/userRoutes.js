const router = require("express").Router();
const { registerUser, loginUser, currentUser, logoutUser, getUserProfile, profileImgUploadController, updateUserProfile }  = require("../controllers/userController");
const { profileImgUpload, profileImgResize } = require("../middlewares/profileImgUploadHandler");
const validateToken = require("../middlewares/validateTokenHandler");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

router.post("/logout", validateToken, logoutUser);

router.get("/:userId", validateToken, getUserProfile);

router.put(
    "/:userId/profile-img-upload", 
    validateToken, 
    profileImgUpload.single("image"), 
    profileImgResize, 
    profileImgUploadController
);

router.put("/:userId/update-user-profile", validateToken, updateUserProfile);


module.exports = router;