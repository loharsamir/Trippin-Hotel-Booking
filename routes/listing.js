//this page is created for understanding- no bulky code in app.js(using express router)
const express=require("express");
const router =express.Router();
const Listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema ,reviewSchema}=require("../schema.js");
const{isLoggedIn,isOwner,validateListing}=require("../middleware.js");

const listingController= require("../controllers/listings.js");

router
  .route("/")
  //index route
  .get( wrapAsync(listingController.index))
  //creat route
  .post(isLoggedIn, validateListing, wrapAsync(listingController.createListing));

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm)


router
  .route("/:id")
  //show route
  .get(wrapAsync(listingController.showListing))
  //update route
  .put(isLoggedIn,isOwner,validateListing, wrapAsync(listingController.updateListing))
  //delete route
  .delete(isLoggedIn,isOwner, wrapAsync(listingController.deleteListing)); 


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,
    wrapAsync(listingController.renderEdit));

router.get("/", wrapAsync(async (req, res) => {
    const { category } = req.query;
    const categories = ["Sea View", "Hill View", "Pool Villa", "Forest View", "Budget Stay"];
    let listings;

    if (category && categories.includes(category)) {
        listings = await Listing.find({ category });
    } else {
        listings = await Listing.find({});
    }

    res.render("listings/index", {
        allListings: listings,
        selectedCategory: category || "",
        categories
    });
}));




module.exports=router;