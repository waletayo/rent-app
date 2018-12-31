const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');
const User = require('../models/register');
const logger = require('../helper/logger');
const multer = require('multer');
const passport = require('passport');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(null, false);

    }
};


const upload = multer({
    storage: storage, limits: {
        fileSize: 1024 * 1024 * 5//5mb
    },
    fileFilter: fileFilter
});


router.get('/', (req, res) => {
    res.json({
        message: "profile route"
    })
});

router.get('/get', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if (!profile) {
                errors.noprofile = "there is no profile for this account";
                return res.json({
                    status: false,
                    message: errors,
                    code: "404"
                });
            }
            res.json({
                status: true,
                message: "your profile",
                code: "200",
                data: {
                    profile: profile
                }
            });
        })
        .catch(err => res.json({
            status: false,
            code: "400",
            data: {
                err: err
            }
        }));
});
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    console.log(req.file);
    logger.log("req body:", req.body);
    const profileFields = {};
    profileFields.user = req.user.id;

    if (req.body.username) profileFields.username = req.body.username;
    if (req.body.fName) profileFields.fName = req.body.fName;
    if (req.body.Dob) profileFields.Dob = req.body.Dob;
    if (req.body.mobile) profileFields.mobile = req.body.mobile;
    if (typeof req.body.hobbies !== "undefined") {
        profileFields.hobbies = req.body.hobbies.split(',');
    }
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkdin) profileFields.social.linkdin = req.body.linkdin;
    if (req.body.twitter) profileFields.social.twitter = req.body.linkdin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    //update the profile
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if (profile) {
                Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileFields},
                    {new: true})
                    .then(profile => res.json({
                        status: true,
                        message: "profile created successfully",
                        data: {
                            profile: profile
                        }
                    }));

            } else {
                //create profile updater
                //check username
                Profile.findOne({username: profileFields.username})
                    .then(profile => {
                        if (profile) {
                            errors.username = "username already exist";
                            res.status(400).json({
                                status: false,
                                message: errors
                            });
                        }
                        //save
                        new Profile(profileFields).save().then(profile => res.json({
                            status: true,
                            message: "profile update is successful",
                            data: {
                                profile: profile
                            }
                        }))
                    });

            }
        });


});

router.post('/location', passport.authenticate("jwt", {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            const newLocation = {
                country: req.body.country,
                state: req.body.state,
                city: req.body.city,
                haddress: req.body.haddress
            };

            profile.location.unshift(newLocation);
            profile.save().then(profile => {
                res.json({
                    status: true,
                    message: "location added successfully",
                    data: {
                        profile: profile
                    }

                });


            })
        })
});
router.post('/student', passport.authenticate("jwt", {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            const newEducation = {
                school: req.body.school,
                degree: req.body.degree,
                fieldOfStudy: req.body.fieldOfStudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            };
            profile.student.unshift(newEducation);
            profile.save().then(profile => {
                res.json({
                    status: true,
                    message: "student details  added successfully",
                    data: {
                        profile: profile
                    }

                });


            })
        })
});


router.post('/picture', upload.single("imgUp"), passport.authenticate("jwt", {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            const uploadImg = {
                imgUp: req.file.path
            };

            profile.profileImg.unshift(uploadImg);
            profile.save().then(profile => {
                res.json({
                    status: true,
                    message: "profile picture added successfully",
                    data: {
                        profile: profile
                    }

                });


            })
        })
});



module.exports=router;
