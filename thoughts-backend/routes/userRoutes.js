const router = require("express").Router();
const { registerUser, loginUser, currentUser, logoutUser, getUserProfile }  = require("../controllers/userController");
const validateToken = require("../middlewares/validateTokenHandler");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

router.post("/logout", validateToken, logoutUser);

router.get("/:userId", validateToken, getUserProfile);


module.exports = router;