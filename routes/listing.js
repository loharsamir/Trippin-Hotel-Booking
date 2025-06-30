//this page is created for understanding- no bulky code in app.js(using express router)
const express=require("express");
const router =express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema ,reviewSchema}=require("../schema.js");
const{isLoggedIn,isOwner,validateListing}=require("../middleware.js");




//index route
router.get("/", 
    wrapAsync(async (req,res,next)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

//new route
router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs");
})
//show route
router.get("/:id",
    wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}));
//creat route
router.post("/",isLoggedIn, validateListing,
    wrapAsync(async (req,res,next)=>{
        let listing=req.body.listing;
        const newListing=new Listing(listing);
        newListing.owner=req.user._id;
        await newListing.save();
        req.flash("success" ,"New Listing Created..!")
        res.redirect("/listings");    
  
        
}));
//edit route
router.get("/:id/edit",isLoggedIn,isOwner,
    wrapAsync(async (req,res,next)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!")
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));
//update route
router.put("/:id",isLoggedIn,isOwner,validateListing,
    wrapAsync(async(req,res,next)=>{   
    let {id}=req.params;    
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success" ,"Listing Updated..!")
    res.redirect(`/listings/${id}`);
}));
//delete route
router.delete("/:id", isLoggedIn,isOwner,
    wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" ,"Listing Deleted..!")
    res.redirect("/listings");
}));

module.exports=router;