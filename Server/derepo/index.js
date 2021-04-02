
var {DBURI} = require("../core");

// console.log('db uri is=>',DBURI);

var mongoose = require("mongoose");





mongoose.connect(DBURI, { useNewUrlParser: true, useUnifiedTopology: true });

////////////////mongodb connected disconnected events///////////////////////////////////////////////

mongoose.connection.on("connected", () => { // MONGODB Connected
    console.log("Mongoose connected");
})


mongoose.connection.on("disconnected", () => {
    console.log("MONGODB disconnected");
    process.exit(1);
});

mongoose.connection.on("error", (err) => {
    console.log("MongoDB disconnected due to : " + err);
    process.exit(1);
});

process.on("SIGINT", () => {
    console.log("App is terminating");
    mongoose.connection.close(() => {
        console.log("MONGODB disconnected");
        process.exit(0);
    })

})

var userSchema = new mongoose.Schema({
    userEmail: String,
    userName: String,
    userPassword: String,
    role : String,
    points : String,
    gender : String,
    points : Number,
});

var userModel = mongoose.model("users", userSchema);




var otpSchema = new mongoose.Schema({
    "userEmail": String,
    "otp": String,
    "createdOn" : { "type": Date, "default": Date.now },
});


var otpModel = mongoose.model("otp", otpSchema);


module.exports = {
    userModel: userModel,
    otpModel: otpModel,
}