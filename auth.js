const express = require("express"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	flash = require("connect-flash"),
	user = require("./models/user"),
	bodyParser = require("body-parser"),
	localStrategy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose");

// $("#reqDeliveryDate").val() 

const app = express();
mongoose.connect("mongodb://127.0.0.1/events", {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

app.use(require("express-session")({
	secret: "No go kill yourself",
	resave: false,
	saveUninitialized: false
}));

app.use(express.static("assets"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.info = req.flash('info');
   res.locals.error = req.flash('error');
   next();
});

passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// ============
// ROUTES
// ============

app.get("/", isLoggedIn, function(req,res){
	console.log(req.sessionID);
	res.render('index');
});
app.get("/dashboard", isLoggedIn, function(req,res){
	res.render('user');
	console.log(req.sessionID)
});
app.get("/login", function(req,res){
	res.render('login');
});

app.get("/register", function(req,res){
	res.render('register');
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/dashboard",
	failureRedirect: "/login"
}), function(req,res){
});

app.post("/register", function(req,res) {
	req.body.username
	req.body.password
	req.body.repassword
	if(req.body.password != req.body.repassword){
		console.log("NO No Boo")
		req.flash("error", "Input Error");
		res.redirect("/register");
	}
	else{
		user.register(new user({username: req.body.username}), req.body.password, function(err, user){
			if(err){
				console.log("ERRORS :");
				console.log(err);
				req.flash("error", "Username Already Exists.");
				return res.render("register");
			}
			passport.authenticate("local")(req, res, function(){
				console.log("user registered");
				req.flash("success", "Successfully Registered.");
				res.redirect("/dashboard");
			});
		}
	)};
});

app.get("/logout", function(req,res){
	req.logout();
	req.flash("success", "LOGGED YOU OUT!");
	res.redirect("/login");
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(8000, function(){
	console.log("Server is listening on port 8000...");
});


// Anna password