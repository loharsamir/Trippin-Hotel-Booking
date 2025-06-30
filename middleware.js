module.exports.isLoggedIn=(req,res,next)=>{
    
    if(!req.isAuthenticated()){
        req.session.redirecturl=req.originalUrl;
        req.flash("success","You must be logged in to create listing!");
         return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}