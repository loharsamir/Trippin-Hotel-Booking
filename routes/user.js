const express=require("express");
const router =express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup",(req,res)=>{
 res.render("users/signup.ejs")
});
//for SignUp
router.post("/signup",wrapAsync(async(req,res)=>{
    try{
        let {username,email,password}=req.body;
    const newUser=new User({username,email});
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    //for->if already signedin(then no need to login)
    req.login(registeredUser, (err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to Wanderlust");
        res.redirect("/listings")
    })
    
    } catch(err){
        req.flash("error",err.message);
        res.redirect("/signup");
    }
    
}));
//for Login
router.get("/login",(req,res)=>{
    res.render("users/login.ejs")
});
router.post("/login",saveRedirectUrl,
    passport.authenticate("local",{
    failureRedirect: "/login",
    failureFlash: true,
}),async(req,res)=>{
    req.flash("success","Welcome back to Wamderlust!");
    res.redirect(res.locals.redirectUrl);
})
//for logout
router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are logged out!");
        res.redirect("/listings");  
    });
});

module.exports=router;