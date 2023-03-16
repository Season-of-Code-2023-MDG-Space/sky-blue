//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
  }));
  
app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery', false);
mongoose.connect(
    "mongodb://127.0.0.1",
    // options,
    (err) => {
     if(err) console.log(err) 
     else console.log("mongdb is connected");
    }
  );

const userSchema = new mongoose.Schema ({
    email: String,
    password: String

});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/hostorjoin", function(req,res){
    User.find({"_id": req.user.id }, function(err, foundUser){
        if (err) {
          console.log(err);
        } else {
          if (foundUser) {
            res.render("hostorjoin",{currentUser: foundUser});
            currentUser=foundUser;
          }
        }
    });
    // console.log(currentUserEmail);
    
});
// app.get("views/partials/header", function(req,res){
//     User.find({"_id": req.user.id }, function(err, foundUser){
//         if (err) {
//           console.log(err);
//         } else {
//           if (foundUser) {
//             res.render("views/partials/header",{currentUser: foundUser});
//           }
//         }
//     });
// });

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

app.get("/host",function(req,res){
    User.find({"email": {$ne: null}}, function(err, foundUsers){
        if (err){
          console.log(err);
        } else {
          if (foundUsers) {
            res.render("host", {users: foundUsers});
          }
        }
      });
});
app.get("/join",function(req,res){
    res.render("join");
});


  
  app.post("/register", function(req, res){
  
    User.register({username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/hostorjoin");
        });
      }
    });
  
  });
  
  app.post("/login", function(req, res){
  
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/hostorjoin");
        });
      }
    });
  
  });

app.listen(4000,function(){
    console.log("Server started on port 4000.");
});