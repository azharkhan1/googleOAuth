const passport = require("passport");
const { userModel } = require("../derepo/index");

var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.serializeUser(function (user, done) {
  // done(null, user.id);
  done(null, user);
});

//
// passport.deserializeUser(function (id, done) {
passport.deserializeUser(function (user, done) {
  // User.findById(id, function (err, user) {
  done(null, user);
  // console.log("passport 16", user);
  //   });
});

passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.CLIENTID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {

      userModel.findOne({ userEmail: profile.emails[0].value }, function (err, user) {
        console.log('profile email is', profile);
        if (user) {
          // console.log('mongo user',user);
          done(null, user);
        } else {
          var newUser = new userModel({
            userEmail: profile.emails[0].value.toLowerCase(),
            userName: `${profile.name.givenName} ${profile.name.familyName}`,
            userPassword: '123',
            role: 'user'
          })
          newUser.save((err, saved) => {
            if (!err) {
              done(err, saved)
            }
            else {
              done(err);
            }
          })
          done(err);
        }
      });
      // done(null , profile);
    }
  )
);