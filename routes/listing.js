const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

// Categories list for filtering
const categories = [
  "Sea View",
  "Hill View",
  "Pool Villa",
  "Forest View",
  "Budget Stay",
  "Luxury Stay",
  "Desert Camp",
];

// Helper to escape special regex characters
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// ✅ Combined GET route for index, search, and filter
router.get("/", wrapAsync(async (req, res) => {
  const { search, category,mine } = req.query;
  let query = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { title: regex },
      { location: regex },
      { description: regex },
      { country: regex },
      { category: regex } 
    ];
  }

  if (category && categories.includes(category)) {
    query.category = category;
  }
   // 👤 "My Listings" Filter
  let onlyMine = false;
  if (mine === "true" && req.isAuthenticated()) {
    query.owner = req.user._id;
    onlyMine = true;
  }

  const listings = await Listing.find(query);

  res.render("listings/index", {
    listings,
    searchQuery: search || "",
    selectedCategory: category || "",
    onlyMine,
    categories,
    currentUser: req.user
  });
}));

// CREATE
router
  .route("/")
  .post(isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);

// SHOW / UPDATE / DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// EDIT
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEdit));

module.exports = router;