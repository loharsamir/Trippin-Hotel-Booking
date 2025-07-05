const express=require("express");
const router =express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");
const user = require("../models/user.js");

router.get("/signup",userController.renderSignupForm);
//for SignUp
router.post("/signup",wrapAsync(userController.signup));
//for Login
router.get("/login",userController.renderLoginForm);
router.post("/login",saveRedirectUrl,
    passport.authenticate("local",{
    failureRedirect: "/login",
    failureFlash: true,
}),userController.login)
//for logout
router.get("/logout",userController.logout);

module.exports=router;