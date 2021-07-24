  
var express = require("express");
const AuthController = require("../../controllers/auth.controller");

var router = express.Router();

router.post("/register", AuthController.register);
router.get("/list", AuthController.list);
router.get("/getUser/:_id", AuthController.getUser);
router.post("/updateUser", AuthController.updateUser);
router.get("/delete/:_id", AuthController.deleteUser);

router.post("/login", AuthController.login);
router.post("/verify-otp", AuthController.verifyOTP);
// router.post("/resend-verify-otp", AuthController.resendConfirmOtp);

module.exports = router;