const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");
const logger =require("./helper/logger");
const users=require ("./router/register");
const profile=require ("./router/profile");
const app = express();
//
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

const DB = require("./config/keys").mongoURI;

//connect to mongo db
mongoose
    .connect(DB)
    .then(() => {
        // console.log("connection to DataBase sucessfull")
        logger.log("mongoose:", "connection to DataBase sucessfull");
    })
    .catch(err => console.log(err));
//passport middle
app.use(passport.initialize());


app.use(function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization,x-api-key");
    next();
});
app.use("/api/users", users);
app.use("/api/profile", profile);

require("./config/passport")(passport);
const port = process.env.PORT || 6000;
app.listen(port, logger.log("e-payment server is running on ", port));


