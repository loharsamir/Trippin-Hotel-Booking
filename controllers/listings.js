const Listing = require("../models/listing");

// 🟢 List all or filtered listings
module.exports.index = async (req, res, next) => {
  const { category } = req.query;
  let allListings;

  if (category && category !== "All") {
    allListings = await Listing.find({ category });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index.ejs", { allListings, selectedCategory: category || "All" });
};

// 🟢 Render form for new listing
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// 🟢 Show single listing
module.exports.showListing = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// 🟢 Create new listing with category
module.exports.createListing = async (req, res, next) => {
  const listing = req.body.listing;
  const newListing = new Listing(listing);
  newListing.owner = req.user._id;

  await newListing.save();
  req.flash("success", "New Listing Created..!");
  res.redirect("/listings");
};

// 🟢 Render edit form
module.exports.renderEdit = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
};

// 🟢 Update listing with category
module.exports.updateListing = async (req, res, next) => {
  let { id } = req.params;

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing Updated..!");
  res.redirect(`/listings/${id}`);
};

// 🟢 Delete listing and reviews
module.exports.deleteListing = async (req, res, next) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);

  console.log(deletedListing);
  req.flash("success", "Listing Deleted..!");
  res.redirect("/listings");
};