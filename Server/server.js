// read: 
// Querying/reading data from database: https://mongoosejs.com/docs/models.html#querying
// deleting data from database: https://mongoosejs.com/docs/models.html#deleting
// updating data in database: https://mongoosejs.com/docs/models.html#updating


var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken
var cookieParser = require("cookie-parser");
var path = require("path");
var authRoutes = require("./routes/auth");
var http = require("http");
var { SERVER_SECRET, PORT } = require("./core");
var { userModel} = require("./derepo");


// For passport Js Oauth2.0
var passport = require('passport');
require('./passport');



var app = express();
var server = http.createServer(app);

//Passport JS oAuth 2.0
app.use(passport.initialize());
app.use(passport.session());


app.use(morgan("dev"));
app.use(bodyParser.json());

app.use(cors({
  origin: ["http://localhost:3000", 'https://envycle.herokuapp.com'],
  credentials: true,
}));


app.use(cookieParser());

app.use('/auth', authRoutes);
app.use("/", express.static(path.resolve(path.join(__dirname, "../Web/build"))));


//Passport JS oAuth2.0
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google"),

  (req, res, next) => {
    console.log('profile is', req.user);
    var token =
      jwt.sign({
        id: req.user._id,
        userEmail: req.user.userEmail,
        userName: req.user.userName,
        userPassword: req.user.userPassword,
        role: req.user.role,
        points: req.user.points,
      }, SERVER_SECRET)

    res.cookie('jToken', token, {
      maxAge: 86_400_000,
      httpOnly: true
    });
    res.redirect('/');

  }
);

// Session Checking middleware

app.use(function (req, res, next) {
  
  if (!req.cookies.jToken) {
    res.status(401).send("include http-only credentials with every request")
    return;
  }
  jwt.verify(req.cookies.jToken, SERVER_SECRET, function (err, decodedData) {
    if (!err) {
      // console.log('decoded my data',decodedData);
      const issueDate = decodedData.iat * 1000; // 1000 miliseconds because in js ms is in 16 digits
      const nowDate = new Date().getTime();
      const diff = nowDate - issueDate; // 86400,000

      if (diff > 30000000) { // expire after 5 min (in milis)
        res.clearCookie('jToken');
        res.status(401).send("token expired")
      }
      else {
        var token = jwt.sign({
          id: decodedData.id,
          userName: decodedData.userName,
          userEmail: decodedData.userEmail,
          role: decodedData.role,
        }, SERVER_SECRET)
        res.cookie('jToken', token, {
          maxAge: 86_400_000,
          httpOnly: true
        });
        req.body.jToken = decodedData;
        req.headers.jToken = decodedData;
        next();
      }
    } else {
      res.status(401).send("invalid token")
    }
  });
})

app.get("/profile", (req, res, next) => {
  userModel.findById(req.body.jToken.id, "userName userEmail role points",
    function (err, doc) {
      if (!err) {
        res.send({
          profile: doc
        })
      } else {
        res.status(500).send({
          message: "server error"
        })
      }
    })
});




app.post("/logout", (req, res, next) => {
  res.cookie('jToken', '', {
    maxAge: 0,
    httpOnly: true,
  })
  res.clearCookie('jToken');
  res.send({
    message: 'logout succesfully'
  })
});



server.listen(PORT, () => {
  console.log("server is running on: ", PORT);
})