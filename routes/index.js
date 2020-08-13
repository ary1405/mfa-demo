const express = require("express");
const router = express.Router();
const session = require("express-session");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
var core = require("@otplib/core");
const { authenticator, totp, hotp } = require("otplib");

var token = 0;
// Welcome Page
router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

//dashboard

router.get("./dashboard", ensureAuthenticated, (req, res, next) => {
  next();
});

//load user model

const User = require("../models/User");

// otp check
router.get("/otpcheck", ensureAuthenticated, (req, res) => {
  console.log("111");
  totp.options = {
    algorithm: "sha1",
    epoch: Date.now(),
    digits: 6,
    step: 30,
  };
  User.findOne({ email: req.user.email }).then((user) => {
    console.log(user);

    const counter = 1;
    token = authenticator.generate(user.secret);
    console.log(token);
    //const secret = authenticator.generateSecret(320);
    //token = totp.generate(secret);
    // console.log(token);
    console.log(totp.timeRemaining());
    res.render("otpcheck", {
      user: req.user,
      otp: token,
    });
  });
});

router.post("/otpcheck", ensureAuthenticated, (req, res) => {
  User.findOne({ email: req.user.email }).then((user) => {
    console.log(user.secret);
  });
  const { otp } = req.body;
  let errors = [];
  console.log(req.user);
  console.log(otp);
  if (!otp) {
    errors.push({ msg: "Please enter the OTP" });
  }

  if (otp === token) {
    res.render("./dashboard", {
      user: req.user,
    });
  } else {
    errors.push({ msg: "OTP do not match" });
  }
  if (errors.length > 0) {
    res.render("otpcheck", {
      errors,
      user: req.user,
    });
  }
  console.log(errors);
});

module.exports = router;
