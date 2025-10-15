const express = require("express");
const router = express.Router();
const { forgotPassword, resetPassword,VerifyCode } = require("../../controllers/authCon");

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify",VerifyCode)
module.exports = router;

