const joi = require("joi");

module.exports.listingSchema = joi.object({
  listing: joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    location: joi.string().required(),
    country: joi.string().required(),
    price: joi.number().required().min(0),

    image: joi.object({
      url: joi.string().allow("", null),
      filename: joi.string().allow("", null), // in case filename is passed
    }).allow(null),

    // ✅ Add category with enum-like validation
    category: joi
      .string()
      .valid(
        "Sea View",
        "Hill View",
        "Pool Villa",
        "Forest View",
        "Budget Stay",
        "Luxury Stay",
        "Desert Camp",
        "Lake House"
      )
    //   .required(),
  }).required(),
});

module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().required().min(1).max(5),
      comment: joi.string().required(),
    })
    .required(),
});