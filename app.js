if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema ,reviewSchema}=require("./schema.js");
const Review=require("./models/review.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js")

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

const store= MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})
store.on("error", ()=>{
    console.log("ERROR on MONGO SESSION STORE", err);
})

const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now()+ 7*24*60*60*1000,
        maxAge:  7*24*60*60*1000,
        httponly: true,
    }
}
app.use(session(sessionOptions));
app.use(flash());

//initialized passport for authentication
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//midle-ware for flash(pop-up text)
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})





main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err)
});
async function main() {
    await mongoose.connect(dbUrl);
}

app.get("/demouser", async(req,res)=>{
    let fakeUser= new User({
        email: "samir@gmail.com",
        username: "Sami123"
    });
    let registeredUser = await User.register(fakeUser, "0000");
    res.send(registeredUser);

})
//reStructure listing and review routes(use Express router)
//all those routes are in routers folder(listing.js ans review.js)
app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.get("/",(req,res)=>{
    res.send("hi..I am root..!")
});


// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"));
// });


// app.use((req, res, next) => {
//     res.status(404).json({
//         success: false,
//         message: "Resource not found"
//     });
// });

// Place this after all other routes
// app.use((req, res, next) => {
//     res.status(404).render("error.ejs", { err: { statusCode: 404, message: "Page Not Found" } });
// });

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs",{message});
});
app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
})