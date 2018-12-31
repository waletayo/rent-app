const express = require('express');
const router = express.Router();
const logger = require('../helper/logger');
const User = require('../models/register');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require("../config/keys");
const bcrypt = require('bcryptjs');
const sendGrid = require('../helper/sendMail');
const crypto = require('crypto');
const _=require('lodash');


let async = require('async');

router.get("/", (req, res) => {
    res.json({
        status: true,
        code: 200,
        message: "welcome"
    });
});

router.post("/register", (req, res) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if (user) {
                return res.json({
                    status: false,
                    code: 400,
                    message: "email already exist"
                });
            } else {
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phoneNumber: req.body.phoneNumber,
                    email: req.body.email,
                    password: req.body.password

                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                let sendEmail = sendGrid.sendMail("no-reply@deveconnector.com", user.email, "Welcome Email",
                                    "Hello " + user.name + " \n" +
                                    "Welcome to epayments we are so excited to see you on our platfom, please click the link below to" +
                                    "verify your email http://localhost:9000/api/users/verify-email/alclmalalmas334929e . Thanks " +
                                    "");

                                if (sendEmail) {
                                    logger.log("send email success", sendEmail);
                                } else {
                                    logger.log("send email failed", sendEmail);
                                }
                                res.json({
                                    status: true,
                                    message: "e-payment registration is successful",
                                    data: user
                                });
                            })
                            .catch(err => {
                                return res.json({
                                    status: false,
                                    message: "hoops an error occur",
                                    data: err
                                })
                            })
                    })
                })
            }
        })
});

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email}).then(user => {
        if (!user) {
            return res.json({
                status: false,
                code: 404,
                message: "User not found",
                data: email
            });
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                const payload = {id: user.id, firstName: user.firstName};
                jwt.sign(payload, "keys", {expiresIn: 36000}, (error, token) => {

                    res.json({
                        status: true,
                        code: 200,
                        message: "Login Successful",
                        data: {
                            token:"Bearer " + token,
                            user: user
                        }
                    });
                });
            } else {
                return res.json({
                    status: false,
                    code: 400,
                    message: "Invalid email or password"
                })
            }
        });
    })
});

router.get(
    "/current",
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        res.json(
            {
                id: req.user.id,
                firstNme: req.user.firstName,
                email: req.user.email
            }
        );
    }
);


function forgotPassword(req, res, next) {
    console.log('--- forgotPassword ---');
    console.log('--- req.body ---');
    console.log(req.body);

    let userData = _.pick(req.body, 'email', 'phoneNo');
    console.log('--- userData ----');
    console.log(userData);

    async.waterfall([

        (callback) => {
            User.findOne({email: req.body.email})
                .exec((err, user) => {

                    if (err) {
                        console.error(err);

                        return callback(err);
                    }

                    // no user found just return the empty user
                    if (!user) {
                        return callback({
                            name: "NoUserFound",
                            message: "User does not exist"
                        });
                    }

                    return callback(null, user);
                })
        },
        (user, callback) => {
            console.log('--- user ---');
            console.log(user);

            generateRandomUnique(function (err, token) {
                console.log('--- err ---');
                console.log(err);
                console.log('---- token ----');
                console.log(token);

                return callback(null, token, user);

            });
        },
        (token, user, callback) => {

            console.log('--- token ---');
            console.log(token);

            console.log('--- user ---');
            console.log(user);

            user.reset_password_token = token;
            user.reset_password_expires = Date.now() + 3600000; // 1 hour

            user.save((err, saved) => {
                if (err) {
                    console.error(err);
                    return callback(err);
                }

                return callback(null, token, saved);
            });
        },
        (token, user, callback) => {
            console.log('--- user ---');
            console.log(user);

            console.log('--- config.baseUrl ---');
            // console.log(config.baseUrl);

            // let fromEmail = new Helper.Email('no-reply@password-reset.qwikii.com');
            // let toEmail = new Helper.Email(user.email);
            // let subject = 'Qwikki Password Reset';
            // let content = new Helper.Content('text/plain', 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            //     'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            //     config.baseUrl + '/v1/auth/reset-password/' + token + '\n\n' +
            //     'If you did not request this, please ignore this email and your password will remain unchanged.\n');
            //
            // let mail = new Helper.Mail(fromEmail, subject, toEmail, content);
            //
            // let request = sg.emptyRequest({
            //     method: 'POST',
            //     path: '/v3/mail/send',
            //     body: mail.toJSON()
            // });
            let sendEmail = sendGrid.sendMail("no-reply@deveconnector.com", user.email, "epayment password reset",
              'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://localhost:5000' + '/reset-password/' + token + '\n\n' +
                 'If you did not request this, please ignore this email and your password will remain unchanged.\n ');

            if (sendEmail) {
                logger.log("send email success", sendEmail);
            } else {
                logger.log("send email failed", sendEmail);
            }


            return callback(null, user);
        }

    ], (err, user) => {

        console.log('--- err ---');
        console.log(err);

        console.log('--- user ---');
        console.log(user);

        if (err) {
            console.error(err);

            return res.json({
                code: '99',
                status: 'error',
                success: false,
                message: 'Unable to register user',
                data: {
                    error: err.name,
                    errorMessage: err.message
                }
            });
        }


        return res.json({
            code: '00',
            status: 'success',
            success: true,
            message: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
        });
    })
}

function generateRandomUnique(callback) {

    crypto.randomBytes(20, (err, buff) => {
        if (err) {
            console.error(err);
        }
        let token = buff.toString('hex');

        logger.log('token:', token);

        callback(err, token);
    });
}

function resetPassword(req, res, next) {
    console.log('--- reesetPassword ---');
    console.log('--- req.params ---');
    console.log(req.params);

    let token = req.params.token;

    User.findOne({
        reset_password_token: token,
        reset_password_expires: {$gt: Date.now()}
    }, (err, user) => {
        if (!user) {

            return res.json({
                status: false,
                message: 'Password reset token is invalid or has expired.'
            });

        }

        /* return res.redirect('/reset-password/deeplink?url=kolowiseapp://kolowise.intelligentinnovations.co/forgotpassword?token=' + token
            + '&fallback=http://kolowise.com/reset-password?token=' + token);
 */
        // return res.redirect('http://localhost:4003/reset-password?token=' + token);
        return res.redirect('http://app.qwikkii.com/reset-password?token=' + token);


    });
}

module.exports = router;

