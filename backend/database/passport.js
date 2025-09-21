const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModel = require("../models/userModel"); // Replace with your user model
const dotenv = require("dotenv").config();
const path = require("path");

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id); // Replace with your DB query
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth strategy configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3500/almaHub/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userModel.findOne({ googleId: profile.id });
        if (!user) {
          user = await userModel.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            authType: "google",
            role: "student",
          });
          console.log("New user created:", user);
        } else {
          console.log("Existing user found:", user);
        }

        return done(null, user); // Pass the user to Passport
      } catch (error) {
        console.error("Error during authentication:", error);
        return done(error, null); // Handle errors
      }
    }
  )
);
