const router = require("express").Router();
const { registerUser, loginUser, currentUser, logoutUser }  = require("../controllers/userController");
const validateToken = require("../middlewares/validateTokenHandler");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

router.post("/logout", validateToken, logoutUser);

module.exports = router;