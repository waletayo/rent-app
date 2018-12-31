'use strict';
const jwtstra = require("passport-jwt").Strategy;
const ExtJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const logger = require("../helper/logger");
const keys = require("./keys");

const opts = {};
opts.jwtFromRequest = ExtJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.keys;
module.exports = passport => {
    passport.use(
        new jwtstra(opts, (jwt_payload, done) => {
            logger.log("jwt-payload:", jwt_payload);
            User.findById(jwt_payload.id)
                .then(user => {
                    if (user) {
                        return done(null, user);
                    }
                    return done(null, false, "invalid token");
                })
                .catch(err => {
                    if (err) {
                        return done(err, null);
                    }
                });
        })
    );
};
