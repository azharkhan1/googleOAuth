var express = require("express");
var bcrypt = require("bcrypt-inzi");


var jwt = require("jsonwebtoken");
var { SERVER_SECRET } = require("../core");
var { userModel } = require("../derepo");
var api = express.Router();


api.post("/signup", (req, res, next) => {
    if (!req.body.userEmail
        || !req.body.userPassword
        || !req.body.userName

    ) {
        res.status(403).send(`
            please send name, email, passwod and gender in json body.
            e.g:
            {
                "userName": "Azhar",
                "userEmail": "azhar@gmail.com",
                "userPassword": "abc",
                'gender' : 'yourgender'
            }`)
        return;
    }
    userModel.findOne({ userEmail: req.body.userEmail },
        (err, data) => {
            if (!err && !data) {
                bcrypt.stringToHash(req.body.userPassword).then(hashPassword => {

                    var newUser = new userModel({
                        userEmail: req.body.userEmail,
                        userPassword: hashPassword,
                        userName: req.body.userName,
                        role: 'user',
                    });

                    newUser.save((err, data) => {
                        if (!err) {
                            console.log("user created");
                            res.status(200).send({
                                message: "Signed up succesfully",
                            })
                        }
                        else {
                            console.log("Could not save due to: " + err);
                            res.status(500).send("error is =>>" + err);
                        }
                    })
                })
            }
            else if (err) {
                res.status(500).send({
                    message: "Database error"
                })
            }
            else {
                res.status(409).send({
                    message: "User already exists",
                })
            }
        })
});



api.post("/login", (req, res, next) => {
    if (!req.body.userEmail || !req.body.userPassword) {
        res.status(403).send(`
            please send email and password in json body
            e.g:
            {
            userEmail : "abc@gmail.com",
            userPassword: "1234",
            }
         `)
        return;
    }
    userModel.findOne({ userEmail: req.body.userEmail }, (err, user) => {
        if (err) {
            res.status(503).send({
                message: "an error occured " + JSON.stringify(err),
            })
        }
        else if (user) {

            bcrypt.varifyHash(req.body.userPassword, user.userPassword).then(isMatched => {
                if (isMatched) {
                    var token =
                        jwt.sign({
                            id: user._id,
                            userEmail: user.userEmail,
                            userName: user.userName,
                            userPassword: user.userPassword,
                            role: user.role,
                        }, SERVER_SECRET)

                    res.cookie('jToken', token, {
                        maxAge: 86_400_000,
                        httpOnly: true
                    });

                    res.status(200).send({
                        message: "signed in succesfully",
                        user: {
                            userEmail: user.userEmail,
                            userName: user.userName,
                            role: user.role,
                        },
                        token: token,
                    })
                } else {
                    res.status(409).send({
                        message: "Password not matched",
                    })
                }
            })
        }
        else {
            res.status(409).send({
                message: "User not found",
            })
        }
    })
})







module.exports = api;

