const router = require("express").Router();
const { registerUser, loginUser, currentUser }  = require("../controllers/userController");
const validateToken = require("../middlewares/validateTokenHandler");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/current", validateToken, currentUser);

module.exports = router;