var express = require('express');
var router = express.Router();
var User = require(appRoot + '/models/op_users');
var Token = require(appRoot + '/models/op_token');
var config = require(appRoot + '/libs/config');
var jwt = require('jsonwebtoken');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var randomString = require('randomstring');
var _ = require('lodash');
var familyHistory = require(appRoot + '/models/op_familyhistory');
var fileUpload = require(appRoot + '/libs/fileupload');
var Case = require(appRoot + '/models/op_cases');
var math = require("mathjs");
var fs = require("fs");
var ObjectId = require('mongoose').Types.ObjectId;
const CONSTANTS = require(appRoot + '/Constants/constant');
var getImage = 'uploads/users/';
var getPracImage = 'uploads/practice_photos/';
var userImage = '/public/uploads/users/';
var pracImage = '/public/uploads/practice_photos/';
var UserSession = require(appRoot + '/models/op_userSession');
bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var signUp_msg = require(appRoot + '/message.json'); 
// var load_me = require(appRoot + '/load_me'); 
var async = require("async");
// appRoot + '/message.json';
// var UserSession = require(appRoot + '/models/op_userSession');

/*
 * User Singup
 * created by - AniMesh;
 */
router.post('/signup', function(req, res, next) {
    var fullname = req.body.fullname;
    var email = req.body.email;
    var number = req.body.phoneNumber;
    var password = req.body.password;
    var gender = req.body.gender;//newly added
    var newUser;
    var device = deviceType = req.body.deviceType;
    var deviceToken = req.body.deviceToken;
    var isDoctor = req.body.isDoctor;

    if (!req.body.fullname || !req.body.password) {
        res.json({
            success: false,
            msg: 'Please fill all Details.'
        });
        return;
    }else{
        if (req.body.email || req.body.phoneNumber) {
            var deviceData={};
            deviceData.device_type = deviceType;
            deviceData.device_token = deviceToken;
            User.findOne({
                $or: [{
                    'email': email.toLowerCase()
                }, {
                    'phoneNumber': req.body.phoneNumber
                }]
            }).then(function(userData) {
                console.log(userData)
                if (userData == null || userData == '') {
                    password = bcrypt.hashSync(req.body.password, salt);
                    newUser = new User({
                        fullname: fullname,
                        password: password,
                        email: email.toLowerCase(),
                        phoneNumber: number,
                        gender: gender,
                        isDoctor: isDoctor,
                        dateOfBirth: "",
                        photo: "",
                        practice_country:""                       
                    });
                    newUser.deviceTokens = [];
                    newUser.deviceTokens.push(deviceData);
                    newUser.save(function(err, data) {
                        var Id = data._id

                        if (err) {
                            res.send({
                                success: false,
                                msg: 'Username already exists.'
                            });
                        } else {
                            //----------email template code--------
                            var email_data = {
                                to : req.body.email,
                                subject :  signUp_msg.signup_success.signup_title,
                                template : 'registration.ejs',
                                content : {
                                    first_name : req.body.fullname,
                                    base_url : CONSTANTS.baseUrl,
                                    id: Id
                                }
                            };
                            
                            config.sendEmailTemplate(email_data);
                            //---------------
                            var tokenData = {
                                username: data.email,
                                timestamp: config.currentTimestamp,
                                id: data._id
                            };
                            var generatedToken = jwt.sign(tokenData, config.secret);
                            Token.findOne({
                                userId: data._id
                            }).then(function(userInfo) {
                                if (userInfo == null) {
                                    var newToken = new Token({
                                        userId: data._id,
                                        token: generatedToken,
                                        deviceType: device
                                    });
                                    newToken.save(function(error, info) {
                                        if (error) {
                                            res.json({
                                                success: false,
                                                msg: "Failed to add token"
                                            })
                                        } else {
                                            var userSession = new UserSession({
                                                'userId': data._id,
                                                'apiName': "User is just signup"
                                            });
                                            userSession.save(function(er, db) {
                                            var createdUser = {
                                                'userId': data._id,
                                                'fullName': data.fullname,
                                                'email': data.email,
                                                'phoneNumber': data.phoneNumber,
                                                'gender': data.gender,
                                                'isDoctor': data.isDoctor,
                                                'token': info.token,
                                                'dateOfBirth': data.dateOfBirth,
                                                'photo': data.photo
                                                };
                                              
                                                res.json({
                                                    success: true,
                                                    msg: 'Successful created new user.',
                                                    data: createdUser
                                                });
                                                return;
                                            });
                                        }
                                    });
                                } else {
                                    res.json("User token already exist");
                                    return;
                                }
                            });
                        }
                    }).catch(function(error) {
                        res.send("User registration failed");
                        return;
                    })
                } else {
                    res.json({
                        success: false,
                        msg: "Email id or phone number is already exist"
                    });
                    return;
                }
            })
        }else{
            res.json({
                success: false,
                msg: "Please enter email or phoneNumber"
            });
            return;
        }
    }
});

/*
 * User Login
 * created by - AniMesh;
 */
router.post('/login', function(req, res, next) {
    var password = req.body.password;
    var email = req.body.email;
    var phoneNumber = req.body.phoneNumber;
    var device = deviceType = req.body.deviceType;
    var deviceToken = req.body.deviceToken;
    // console.log(deviceToken);
    var checkUser = req.body.isDoctor;

    if (req.body.email) {
        User.findOne({
            'email': email.toLowerCase()
        }).then(function(userData) {

            if(checkUser=='false' || checkUser==false)
                checkUser = false;
            else
                checkUser = true;

            if (userData != null) {
                if (checkUser != userData.isDoctor) {
                    if (!userData.isDoctor) {
                        res.json({
                            'success': false,
                            'msg': 'You can not login as Doctor'
                        });
                        return;
                    } else {
                        res.json({
                            'success': false,
                            'msg': 'You can not login as Patient'
                        });
                        return;
                    }
                }
                
                if(bcrypt.compareSync(req.body.password, userData.password))
                {
                    if (deviceToken!=undefined) {
                        //--------------
                        var flag=1;
                        if(userData.deviceTokens)
                        {
                            async.forEach(userData.deviceTokens,function (item,callback) {
                                if(item.device_token == deviceToken)
                                {
                                    flag=0;
                                }
                                callback();
                            },function(){
                                if(flag==1){
                                    var deviceData={};
                                    deviceData.device_type = deviceType;
                                    deviceData.device_token = deviceToken;                                        
                                    userData.deviceTokens.push(deviceData);
                                }
                            });
                        }
                        else{
                            var deviceData={};
                            deviceData.device_type = deviceType;
                            deviceData.device_token = deviceToken;                                        
                            userData.deviceTokens.push(deviceData);
                        }
                    }
                    // var text = signUp_msg.congo +'\n\n'+
                            // signUp_msg.login_success.login_body;

                    // var text = load_me;


                    // var subject = signUp_msg.login_success.login_title;

                    // config.sendMail(req.body.email.toLowerCase(), text, subject).then(function(result, error) {

                        // if (error) {
                        // console.log(error);
                        // }
                        
                        var tokenData = {
                            username: userData.email,
                            timestamp: config.currentTimestamp,
                            id: userData._id
                        };
                        var generatedToken = jwt.sign(tokenData, config.secret);
                        
                        Token.findOne({
                            userId: userData._id
                        }).populate('userId').then(function(userInfo) {

                                //------------
                                    if (deviceToken != undefined) {
                                        var updatedUserData = _.merge(userData, userData);
                                                
                                        updatedUserData.save(function(err, data) {
                                            // console.log("deviceToken@loginByEmail->"+data);
                                        })
                                    } 
                                //------------------

                            
                            if (userInfo == null) {
                                var newToken = new Token({
                                    userId: userData._id,
                                    token: generatedToken,
                                    deviceType: device
                                });
                                
                                newToken.save(function(error, info) {
                                    
                                    if (userData.photo != null) {
                                        if (userData.photo.length) {
                                            var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                            userData.photo = picture;
                                        }
                                    }
                                    
                                    var userGeneratedToken = {
                                        'userId': info.userId,
                                        'token': info.token,
                                        'fullName': userData.fullname,
                                        'email': userData.email,
                                        'phoneNumber': userData.phoneNumber,
                                        'gender': userData.gender,
                                        'isDoctor': userData.isDoctor,
                                        'photo': userData.photo
                                    };
                                    
                                    //------------
                                    // if (deviceToken != undefined) {
                                    //     var updatedUserData = _.merge(userData, userData);
                                                
                                    //     updatedUserData.save(function(err, data) {
                                    //         // console.log("deviceToken@loginByEmail->"+data);
                                    //     })
                                    // } 
                                    //------------------
                                    
                                    if (error) {
                                        res.send("Failed to save token");
                                    } else {
                                        var userSession = new UserSession({
                                            'userId': info.userId,
                                            'apiName': "User is login into app"
                                        });
                                        userSession.save(function(er, db) {
                                            if (er) {
                                                res.json({
                                                    'success': false,
                                                    'msg': "failed to add user session data"
                                                })
                                            }
                                        })
                                        //console.log(userGeneratedToken);
                                        res.json({
                                            success: true,
                                            msg: "Token generated successfully",
                                            data: userGeneratedToken
                                        });
                                    }
                                })
                            } else {
                                if (userInfo.userId.photo != null) {
                                    if (userInfo.userId.photo.length) {
                                        var picture = CONSTANTS.baseUrl + getImage + userInfo.userId.photo;
                                        userInfo.userId.photo = picture;
                                    }
                                }
                                var userUpdatedToken = {
                                    'userId': userInfo.userId._id,
                                    'token': userInfo.token,
                                    'fullName': userInfo.userId.fullname,
                                    'email': userInfo.userId.email,
                                    'phoneNumber': userInfo.userId.phoneNumber,
                                    'gender': userInfo.userId.gender,
                                    'isDoctor': userInfo.userId.isDoctor,
                                    'doctor_specialization': userInfo.userId.doctor_specialization,
                                    'address': userInfo.userId.address,
                                    'photo': userInfo.userId.photo
                                    
                                };
                                //------------
                                    // if (deviceToken != undefined) {
                                    //     var updatedUserData = _.merge(userData, userData);
                                                
                                    //     updatedUserData.save(function(err, data) {
                                    //         // console.log("deviceToken@loginByEmail->"+data);
                                    //     })
                                    // } 
                                //------------------
                                var userSession = new UserSession({
                                    'userId': userInfo.userId,
                                    'apiName': "User is login into app"
                                });
                                userSession.save(function(er, db) {
                                    res.json({
                                            success: true,
                                            msg: "Token updated successfully",
                                            data: userUpdatedToken
                                        });
                                })
                            }
                        })
                    
                    // });
                    
                } else {
                    res.json({
                        success: false,
                        msg: "Please enter correct password"
                    });
                }
            } else {
                res.send({
                    success: false,
                    msg: 'User not found with entered mail id.'
                });
            }
        })
    } else {
        console.log("else->"+phoneNumber);
        console.log(typeof phoneNumber);
        User.findOne({
            'phoneNumber': {$regex : ".*"+phoneNumber+".*"} //phoneNumber
        }).then(function(userData) {
            // {$regex : ".*"+phoneNumber+".*"}
            // {$regex : ".*phoneNumber.*"}
            console.log("DataByPhone"+userData);

                if(checkUser=='false' || checkUser==false)
                    checkUser = false;
                else
                    checkUser = true;

            if (userData) {
                if (checkUser != userData.isDoctor) {
                    if (!userData.isDoctor) {
                        res.json({
                            'success': false,
                            'msg': 'You can not login as Doctor'
                        });
                        return;
                    } else {
                        res.json({
                            'success': false,
                            'msg': 'You can not login as Patient'
                        });
                        return;
                    }
                }
                
                if(bcrypt.compareSync(req.body.password, userData.password)){

                    //--------------
                    if (deviceToken!=undefined) {
                    
                        var flag=1;
                        if(userData.deviceTokens)
                        {
                            async.forEach(userData.deviceTokens,function (item,callback) {
                                if(item.device_token == deviceToken)
                                {
                                    flag=0;
                                }
                                callback();
                            },function(){
                                if(flag==1){
                                    var deviceData={};
                                    deviceData.device_type = deviceType;
                                    deviceData.device_token = deviceToken;                                        
                                    userData.deviceTokens.push(deviceData);
                                }
                            });
                        }
                        else{
                            var deviceData={};
                            deviceData.device_type = deviceType;
                            deviceData.device_token = deviceToken;                                        
                            userData.deviceTokens.push(deviceData);
                        }
                    }
                    //------------
                    var tokenData = {
                        username: userData.email,
                        timestamp: config.currentTimestamp,
                        id: userData._id
                    };
                    // var secret = new Buffer(config.secret, "base64").toString();
                    var generatedToken = jwt.sign(tokenData, config.secret);
                    
                    Token.findOne({
                        userId: userData._id
                    }).populate('userId').then(function(userInfo) {
                        // console.log(" here is user info " + userInfo);

                        //------------
                            if (deviceToken != undefined) {
                                var updatedUserData = _.merge(userData, userData);
                                        
                                updatedUserData.save(function(err, data) {
                                    // console.log("deviceToken@loginByEmail->"+data);
                                })
                            } 
                        //------------------


                        if (userInfo == null) {
                            var newToken = new Token({
                                userId: userData._id,
                                token: generatedToken,
                                deviceType: device
                            });
                            newToken.save(function(error, info) {
                                if (userData.photo != null) {
                                    if (userData.photo.length) {
                                        var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                        userData.photo = picture;
                                    }
                                }

                                var userGeneratedToken = {
                                    'userId': info.userId,
                                    'token': info.token,
                                    'fullName': userData.fullname,
                                    'email': userData.email,
                                    'phoneNumber': userData.phoneNumber,
                                    'gender': userData.gender,//*****************
                                    'isDoctor': userData.isDoctor,
                                    'photo': userData.photo
                                };


                                if (error) {
                                    res.send("Failed to save token");
                                } else {
                                    var userSession = new UserSession({
                                        'userId': info.userId,
                                        'apiName': "user is login into app"
                                    });
                                    userSession.save(function(er, db) {
                                        if (er) {
                                            res.json({
                                                'success': false,
                                                'msg': "failed to add user session data"
                                            })
                                        }
                                    })
                                    res.json({
                                        success: true,
                                        msg: "Token generated successfully",
                                        data: userGeneratedToken
                                    });
                                }
                            })
                        } else {
                            if (userInfo.userId.photo != null) {
                                if (userInfo.userId.photo.length) {
                                    var picture = CONSTANTS.baseUrl + getImage + userInfo.userId.photo;
                                    userInfo.userId.photo = picture;
                                }
                            }
                            var userUpdatedToken = {
                                'userId': userInfo.userId._id,
                                'token': userInfo.token,
                                'fullName': userInfo.userId.fullname,
                                'email': userInfo.userId.email,
                                'phoneNumber': userInfo.userId.phoneNumber,
                                'gender': userInfo.userId.gender,//*************
                                'isDoctor': userInfo.userId.isDoctor,
                                'doctor_specialization': userInfo.userId.doctor_specialization,
                                'address': userInfo.userId.address,
                                'photo': userInfo.userId.photo
                            };
                            
                            
                            var userSession = new UserSession({
                                'userId': userInfo.userId,
                                'apiName': "User is login into app"
                            });
                            userSession.save(function(er, db) {
                                res.json({
                                success: true,
                                msg: "Token updated successfully",
                                data: userUpdatedToken
                                });
                                return;
                            });
                            //--------------------------                                
                            
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        msg: "Please enter correct password"
                    });
                }
            } else {
                res.send({
                    success: false,
                    msg: 'User not found with entered phone number'
                });
                return;
            }
        }).catch(function(error) {
            console.log(error);
            res.send({
                success: false,
                msg: 'User not found with entered phone number1'
            });
            return;
        })
    }
});

/*
 * User Forget Password
 * created by - AniMesh;
 */
router.post('/forgetPassword', function(req, res, next) {
    var email = req.body.email;
    var phoneNumber = req.body.phoneNumber;
    var randomPassword;
    
    if (email != null && email != undefined && email != "") {
        
        User.findOne({
            'email': email.toLowerCase()
        }).then(function(userData) {
            if (userData) {
                //randomPassword = randomString.generate(4);
                randomPassword = Math.floor(1000 + Math.random() * 9000);
                // console.log("randomPassword=>" + randomPassword);
                
                User.findOneAndUpdate({
                    '_id': userData._id
                }, {
                    $set: {
                        otp_code : randomPassword,
                        oneTimePassword: true,
                        updatedAt: config.currentTimestamp
                    }
                }, {
                    'new': true
                }).then(function(updatedUserData) {
                    if (updatedUserData) {
                        var text = 'You are receiving this because you ' +
                            'have requested reset of ' +
                            'password for your account.\n\n Your code' +
                            ' is ' + randomPassword;
                        var subject = 'Password Reset Notification';
                        config.sendMail(req.body.email.toLowerCase(), text, subject).then(function(result, error) {
                            if (error) {
                                console.log(error);
                            }
                            var userSession = new UserSession({
                                'userId': userData._id,
                                'apiName': "User request to forget password"
                            });
                            userSession.save(function(er, db) {
                                if (er) {
                                    res.json({
                                        'success': false,
                                        'msg': "failed to add user session data"
                                    })
                                }
                            })
                            res.json({
                                success: true,
                                msg: 'Notification sent to your ' +
                                    'registered email ID.'
                            });
                        });
                    }
                }).catch(function(error) {
                    res.json({
                        success: false,
                        msg: 'Something went wrong, password reset failed'
                    });
                })
            } else {
                res.json({
                    success: false,
                    msg: "Please enter valid email Id"
                });
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: 'Please enter valid mail id'
            });
        });
    } else {
        User.findOne({
            'phoneNumber': {$regex : ".*"+phoneNumber+".*"}
        }).then(function(userData) {
            if (userData) {
                // randomPassword = randomString.generate(4);
                randomPassword = Math.floor(1000 + Math.random() * 9000);
                // var hash_password = bcrypt.hashSync(randomPassword, salt);
                
                User.findOneAndUpdate({
                    '_id': userData._id
                }, {
                    $set: {
                        otp_code: randomPassword,
                        oneTimePassword: true,
                        updatedAt: config.currentTimestamp
                    }
                }, {
                    'new': true
                }).then(function(updatedUserData) {
                    if (updatedUserData) {
                        var text = "Your OTP for reset password of OpinionPlus is " + randomPassword;
                        config.sendMsg(phoneNumber, text).then(function(result, error) {
                            if (error) {
                                console.log(err);
                                res.json({
                                    success: false,
                                    msg: 'Something went wrong while sending otp on phone number'
                                })
                            } else {
                                var userSession = new UserSession({
                                    'userId': userData._id,
                                    'apiName': "User requested to forget password"
                                });
                                userSession.save(function(er, db) {
                                    if (er) {
                                        res.json({
                                            'success': false,
                                            'msg': "failed to add user session data"
                                        })
                                    }
                                })
                                res.json({
                                    success: true,
                                    msg: "OTP sent successfully on user's phone number"
                                });
                            }
                        })
                    } else {
                        res.send("failed to update ");
                    }
                }).catch(function(error) {
                    res.json({
                        success: false,
                        msg: 'Somthing went wrong while sending otp on mobile'
                    })
                });
            } else {
                res.send({
                    success: false,
                    msg: "User is not exist with entered phone number"
                })
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: 'Please enter valid phone number'
            });
        })
    }
})

/*
 * User Verify
 * created by - AniMesh;
 */
router.post('/verify', function(req, res, next) {
    var randomPassword = req.body.code;
    var email = req.body.email;
    var phoneNumber = req.body.phoneNumber;

    if (email) {
        User.findOne({
            'email': email.toLowerCase()
        }).then(function(userData) {
            if (userData) {
                var otp_code = userData.otp_code;
                if (randomPassword == otp_code) {
                    var userSession = new UserSession({
                        'userId': userData._id,
                        'apiName': "User verify its OTP to reset password"
                    });
                    userSession.save(function(er, db) {
                        if (er) {
                            res.json({
                                'success': false,
                                'msg': "failed to add user session data"
                            })
                        }
                    })
                    res.json({
                        success: true,
                        msg: 'User code verification successfully',
                        data: {
                            'userId': userData._id,
                            'emailId': userData.email
                                //'phoneNumber': userData.phoneNumber
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        msg: 'User code verifiaction failed'
                    })
                }
            } else {
                res.json({
                    success: false,
                    msg: "Please enter valid mail Id"
                })
            }
        })
    } else {
        User.findOne({
            'phoneNumber': phoneNumber
        }).then(function(userData) {
            if (userData) {
                var otp_code = userData.otp_code;
                if (randomPassword == otp_code) {
                    var userSession = new UserSession({
                        'userId': userData._id,
                        'apiName': "User verify its OTP to reset password"
                    });
                    userSession.save(function(er, db) {
                        if (er) {
                            res.json({
                                'success': false,
                                'msg': "failed to add user session data"
                            })
                        }
                    })
                    res.json({
                        success: true,
                        msg: 'User code verification successfully',
                        data: {
                            'userId': userData._id,
                            //'emailId': userData.email,
                            'phoneNumber': userData.phoneNumber
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        msg: 'User code verifiaction failed'
                    })
                }
            } else {
                res.json({
                    success: false,
                    msg: "Please enter valid phone number"
                })
            }
        })
    }
})

/*
 * User Reset Password
 * created by - AniMesh;
 */
router.post('/resetPassword', function(req, res, next) {
    var password = req.body.newPassword;
    var newPassword = req.body.confirmNewPassword;
    var email = req.body.email;
    var phoneNumber = req.body.phoneNumber;

    if (!req.body.newPassword || !req.body.confirmNewPassword || req.body.newPassword == undefined || req.body.confirmNewPassword == undefined) {
        res.json({
            success: false,
            msg: 'Please enter new password or confirm new password'
        })
    }
    if (req.body.newPassword != req.body.confirmNewPassword) {
        res.json({
            success: false,
            msg: 'New password and confirm new password should be same'
        })
    }
    if (email) {
        User.findOne({
            'email': email.toLowerCase()
        }).exec().then(function(userData) {
            // console.log(userData);
            var hash_password = bcrypt.hashSync(newPassword, salt);
            if (userData) {
                if (userData.oneTimePassword == true) {
                    User.findOneAndUpdate({
                        _id: userData._id
                    }, {
                        $set: {
                           // password: config.encrypt(newPassword),
                           password: hash_password,
                            oneTimePassword: false,
                            updatedAt: config.currentTimestamp
                        }
                    }, {
                        'new': true
                    }).then(function(updatedUserData) {
                        if (updatedUserData) {
                            var userSession = new UserSession({
                                'userId': userData._id,
                                'apiName': "User reset the password"
                            });
                            userSession.save(function(er, db) {
                                if (er) {
                                    res.json({
                                        'success': false,
                                        'msg': "failed to add user session data"
                                    })
                                }
                            })
                            res.json({
                                success: true,
                                msg: 'Password reset successfully'
                            })
                        } else {
                            res.json({
                                success: false,
                                msg: 'Password reset failed'
                            })
                        }
                    }).catch(function(error) {
                        res.send("Somthing went wrong in reset password");
                    })
                }
            } else {
                res.json({
                    success: false,
                    msg: "User not found with entered email"
                })
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Please enter valid email id or phone number"
            });
        })
    } else {
        User.findOne({
            'phoneNumber': phoneNumber
        }).exec().then(function(userData) {
            if (userData) {
                 var hash_password = bcrypt.hashSync(newPassword, salt);
                if (userData.oneTimePassword == true) {
                    User.findOneAndUpdate({
                        _id: userData._id
                    }, {
                        $set: {
                           // password: config.encrypt(newPassword),
                            password: hash_password,
                            oneTimePassword: false,
                            updatedAt: config.currentTimestamp
                        }
                    }, {
                        'new': true
                    }).then(function(updatedUserData) {
                        if (updatedUserData) {
                            var userSession = new UserSession({
                                'userId': userData._id,
                                'apiName': "User reset the password"
                            });
                            userSession.save(function(er, db) {
                                if (er) {
                                    res.json({
                                        'success': false,
                                        'msg': "failed to add user session data"
                                    })
                                }
                            })
                            res.json({
                                success: true,
                                msg: 'Password reset successfully'
                            })
                        } else {
                            res.json({
                                success: false,
                                msg: 'Password reset failed'
                            })
                        }
                    }).catch(function(error) {
                        res.send("Somthing went wrong in reset password");
                    })
                }
            } else {
                res.json({
                    success: false,
                    msg: "User not found with entered phone number"
                })
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Please enter valid email id or phone number"
            })
        })
    }
})

/*
 * Get User
 * created by - AniMesh;
 */
router.post('/getUser', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;
        // console.log("use id " + JSON.stringify(req.body));
        User.findOne({
            '_id': userId
        }).then(function(userData) {
            // console.log("userData.length->"+userData.practice_photos.length);
            if (userData) {
                // practice_photos
                if (userData.practice_photos.length) {
                    for (var i = 0; i < userData.practice_photos.length; i++) {
                        if (userData.practice_photos[i] != null && userData.practice_photos[i] != "" && userData.practice_photos[i] != undefined) {
                            var picture = CONSTANTS.baseUrl + getPracImage + userData.practice_photos[i];
                            userData.practice_photos[i] = picture;
                        }
                    };
                }
                
                if (userData.photo.length) {
                    if (userData.photo != null && userData.photo != "" && userData.photo != undefined) {
                        var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                        userData.photo = picture;
                    }
                }
                userData = userData.toObject();
                // console.log("photo"+userData);
                delete userData.password;
                // console.log("get response " + JSON.stringify(userData));

                var userSession = new UserSession({
                    'userId': userData._id,
                    'apiName': "User view the profile"
                });
                userSession.save(function(er, db) {
                    if (er) {
                        res.json({
                            'success': false,
                            'msg': "failed to add user session data"
                        })
                    }
                })
                res.json({
                    success: true,
                    msg: "Fetched user record successfully",
                    data: userData
                });
            } else {
                res.json({
                    success: false,
                    msg: "Failed to get user record"
                })
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Failed to get user data"
            })
        })
    }).catch(function(error) {
        console.log("****" + error);
        res.json({
            success: false,
            msg: "Authentication failed"
        });
    })
})

/*
 * Edit User Profile
 * created by - AniMesh;
 */
router.post('/editProfile', fileUpload.uploadImage('photo', userImage), function(req, res, next) {
    var token = req.headers['accesstoken'];
    // console.log(token);
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;
        // console.log(userId);

        console.log("photo info " + JSON.stringify(req.files));
        console.log("req body" + JSON.stringify(req.body));
        
        if (req.files == undefined) {
            console.log(" ok np");
        } else {
            if (req.files.length > 0 || req.files != undefined) {
                var originalName = req.files[0].filename;
                console.log("here is original name" + originalName);
            }
        }

        User.findOne({
            '_id': userId
        }).then(function(userInfo) {
            // console.log(userInfo);
            if (userInfo) {
                if (req.body.newPassword != null || req.body.confirmPassword != undefined) {
                    var newPassword = req.body.newPassword;
                    // var currentPassword = req.body.confirmPassword;
                    // var password = config.decrypt(userInfo.password);
                    // var newEncryptPassword = config.encrypt(newPassword);
                    var newEncryptPassword = bcrypt.hashSync(newPassword, salt);
                    //if (password == currentPassword) {
                    User.findOneAndUpdate({
                            _id: userInfo._id
                        }, {
                            $set: {
                                password: newEncryptPassword,
                                updatedAt: config.currentTimestamp
                            }
                        }, {
                            'new': true
                        }).exec().then(function(updatedUserData) {
                            if (updatedUserData) {
                                delete req.body.newPassword;

                                req.body.photo = originalName;
                                var updatedUser = _.merge(updatedUserData, req.body);
                                updatedUser.save(function(err, output) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            msg: "Failed to update user data"
                                        })
                                    } else {
                                        output = output.toObject();
                                        delete output.password;
                                        if (output.photo != null) {
                                            var picture = CONSTANTS.baseUrl + getImage + output.photo;
                                            output.photo = picture;
                                        }
                                        var userSession = new UserSession({
                                            'userId': updatedUserData._id,
                                            'apiName': "User updated the profile"
                                        });
                                        userSession.save(function(er, db) {
                                            if (er) {
                                                res.json({
                                                    'success': false,
                                                    'msg': "failed to add user session data"
                                                })
                                            }
                                        })
                                        res.json({
                                            success: true,
                                            msg: "User profile updated and password changed successfully",
                                            data: output
                                            // {
                                            //     'data': output
                                            // }
                                        });
                                    }
                                });
                            } else {
                                res.send(" Failed to change password");
                            }
                        })
                        /*} else {
                            res.json({
                                success: false,
                                msg: "Current password is not correct "
                            });
                        }*/
                } else {
                    if (userInfo.photo != '')
                    {
                        if (fs.existsSync('./public/uploads/users/' + userInfo.photo))
                        {
                            //Delete patient_img from folder
                            fs.unlink('./public/uploads/users/' + userInfo.photo);
                        }
                    }

                    req.body.photo = originalName;
                    var updatedUser = _.merge(userInfo, req.body);
                    delete updatedUser.password;

                    updatedUser.save(function(err, output) {
                        if (err) {
                            res.json({
                                success: false,
                                msg: "Failed to update and add user data"
                            })
                        } else {
                            output = output.toObject();
                            delete output.password;
                            if (output.photo != null) {
                                var picture = CONSTANTS.baseUrl + getImage + output.photo;
                                output.photo = picture;
                            }
                            var userSession = new UserSession({
                                'userId': output._id,
                                'apiName': "User update the profile"
                            });
                            userSession.save(function(er, db) {
                                if (er) {
                                    res.json({
                                        'success': false,
                                        'msg': "failed to add user session data"
                                    })
                                }
                            })
                            res.json({
                                success: true,
                                msg: "User profile updated successfully",
                                data: output
                            });
                        }
                    }).catch(function(error) {
                        console.log(error);
                        res.json({
                            success: false,
                            msg: "Somthing went wrong while updating user profile"
                        })
                    })
                }
            } else {
                res.send("user not found");
            }
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

/*
 * Edit Doctor Profle
 * created by - AniMesh;
 */
router.post('/editDoctor', fileUpload.uploadImage('photo', userImage), function(req, res, next) {
    var token = req.headers['accesstoken'];

    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;

        var calculate_age = function(birth_month, birth_day, birth_year) {
            return new Promise(function(resolve, reject) {
                var today_date = new Date();
                var today_year = today_date.getFullYear();
                var today_month = today_date.getMonth();
                var today_day = today_date.getDate();
                var age = today_year - birth_year;

                if (today_month < (birth_month - 1)) {
                    age--;
                }
                if (((birth_month - 1) == today_month) && (today_day < birth_day)) {
                    age--;
                }
                resolve(age);
            })
        }
        if (req.body.dateOfBirth != null || req.body.dateOfBirth != undefined) {
            var dob = req.body.dateOfBirth.split('T');
            var splitDob = dob[0].split('-');
            calculate_age(splitDob[1], splitDob[2], splitDob[0]).then(function(userCalculateAge) {
                var userAge = userCalculateAge;
                req.body.age = userAge;
            });
        }

        User.findOneAndUpdate({
            _id: userId
        }, {
            $set: {
                updatedAt: config.currentTimestamp
            }
        }, {
            'new': true
        }).exec().then(function(updatedDoctorData) {
            // console.log("updatedDoctorData"+updatedDoctorData);
            if (req.files == undefined) {
                console.log(" ok np");
            } else {
                if (req.files.length > 0 || req.files != undefined) {
                    // console.log("1");
                    if (updatedDoctorData.photo.length) {
                        // console.log("2");
                        if (updatedDoctorData.photo != null || updatedDoctorData.photo.length != 0) {
                            // console.log("3");
                            fs.unlink('./public/uploads/users/' + updatedDoctorData.photo);
                        }
                    }
                    var originalName = req.files[0].filename;
                    // console.log("here is original name" + originalName);
                }
            }

            delete req.body.userId;
            
            if (updatedDoctorData) {
                if (req.body.changePassword != null || req.body.newPassword != null || req.body.changePassword != undefined || req.body.newPassword != undefined) {
                    var newPassword = req.body.newPassword;
                    //var currentPassword = req.body.currentPassword;
                    //var password = config.decrypt(updatedDoctorData.password);
                    //var newEncryptPassword = config.encrypt(newPassword);
                     var newEncryptPassword = bcrypt.hashSync(newPassword, salt);
                    //if (password == currentPassword) {
                    User.findOneAndUpdate({
                        _id: updatedDoctorData._id
                    }, {
                        $set: {
                            password: newEncryptPassword,
                            updatedAt: config.currentTimestamp
                        }
                    }, {
                        'new': true
                    }).exec().then(function(updatedUserData) {
                        
                        if (updatedUserData) {
                            delete req.body.changePassword;
                            delete req.body.newPassword;

                            req.body.photo = originalName;
                            // console.log("days"+req.body.workingDays.length);
                            if (req.body.workingDays.length > 0) {
                                var days = [];
                                var count = 0;
                                req.body.workingDays.forEach(function(day) {
                                    if (days) {
                                        days.push(day);
                                        count = count + 1;
                                    }
                                    if (count == req.body.workingDays.length) {
                                        updatedUserData.workingDays = days;
                                    }
                                })
                                // console.log("updatedUserData.workingDays"+updatedUserData.workingDays);
                            }

                            
                            var updatedUser = _.merge(updatedUserData, req.body);
                            updatedUser.save(function(err, output) {
                                // console.log("output"+output);
                                if (err) {
                                    res.json({
                                        success: false,
                                        msg: "Failed to update doctor data"
                                    })
                                } else {
                                    var userSession = new UserSession({
                                        'userId': output._id,
                                        'apiName': "Doctor update the profile"
                                    });
                                    userSession.save(function(er, db) {
                                        
                                        output = output.toObject();
                                        delete output.password;
                                        
                                        if (output.photo != null) {
                                            var picture = CONSTANTS.baseUrl + getImage + output.photo;
                                            output.photo = picture;
                                        }
                                        res.json({
                                            success: true,
                                            msg: "Doctor profile updated and password changed successfully",
                                            data: output
                                            // {
                                            //     'data': output
                                            // }
                                        });
                                        return;
                                    })
                                    
                                }
                            });
                        } else {
                            res.send(" Failed to change password");
                        }
                    })
                } else {
                    req.body.photo = originalName;
                    // console.log("//////" + req.body.age);
                    var userCase = _.merge(updatedDoctorData, req.body);
                
                    if (req.body.workingDays != null || req.body.workingDays != undefined || req.body.workingDays != "") {
                        var workingDays = req.body.workingDays.split("&");
                        if (req.body.workingDays.length > 0) {
                            var days = [];
                            var count = 0;
                            
                            workingDays.forEach(function(day) {
                                if (days) {
                                    days.push(day);
                                    count = count + 1;
                                }
                                if (count == workingDays.length) {
                                    updatedDoctorData.workingDays = days;
                                }
                            })
                        }else{
                            updatedDoctorData.workingDays = [];
                        }
                    }

                    // m_b_certification
                    if (req.body.m_b_certification != null || req.body.m_b_certification != undefined || req.body.m_b_certification != "") {
                        var m_b_certification = req.body.m_b_certification.split("&");
                        if (req.body.m_b_certification.length > 0) {
                            var certificates = [];
                            var count2 = 0;
                            
                            m_b_certification.forEach(function(certificate) {
                                if (certificates) {
                                    certificates.push(certificate);
                                    count2 = count2 + 1;
                                }
                                if (count2 == m_b_certification.length) {
                                    updatedDoctorData.m_b_certification = certificates;
                                }
                            })
                        }else{
                            updatedDoctorData.m_b_certification = [];
                        }
                    }
                    //work_history
                    if (req.body.work_history != null || req.body.work_history != undefined || req.body.work_history != "") {
                        var work_history = req.body.work_history.split("&");
                        if (req.body.work_history.length > 0) {
                            var histories = [];
                            var count3 = 0;
                            
                            work_history.forEach(function(history) {
                                if (histories) {
                                    histories.push(history);
                                    count3 = count3 + 1;
                                }
                                if (count3 == work_history.length) {
                                    updatedDoctorData.work_history = histories;
                                }
                            })
                        }else{
                            updatedDoctorData.work_history = [];
                        }
                    }
                    // awards_accolades
                    if (req.body.awards_accolades != null || req.body.awards_accolades != undefined || req.body.awards_accolades != "") {
                        var awards_accolades = req.body.awards_accolades.split("&");
                        if (req.body.awards_accolades.length > 0) {
                            var awards = [];
                            var count4 = 0;
                            
                            awards_accolades.forEach(function(award) {
                                if (awards) {
                                    awards.push(award);
                                    count4 = count4 + 1;
                                }
                                if (count4 == awards_accolades.length) {
                                    updatedDoctorData.awards_accolades = awards;
                                }
                            })
                        }else{
                            updatedDoctorData.awards_accolades = [];
                        }
                    }

                    userCase.save(function(err, doctorInfo) {
                        // console.log("doctorInfo->"+doctorInfo);
                        if (err) {
                            res.json({
                                success: false,
                                msg: "failed to update doctor profile",
                                'er': err
                            })
                        } else {
                            doctorInfo = doctorInfo.toObject();
                            delete doctorInfo.password;
                            var userSession = new UserSession({
                                'userId': doctorInfo._id,
                                'apiName': "Doctor update the profile"
                            });
                            userSession.save(function(er, db) {
                                if (doctorInfo.photo != null) {
                                    var picture = CONSTANTS.baseUrl + getImage + doctorInfo.photo;
                                    doctorInfo.photo = picture;
                                }
                                res.json({
                                    success: true,
                                    msg: "Doctor profile updated successfully",
                                    data: doctorInfo
                                });
                                return;
                            })
                           
                        }
                    })
                }
            } else {
                res.json({
                    success: false,
                    msg: "Please enter valid doctor Id"
                });
                return;
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Something went wrong while updating doctor profile"
            });
            return;
        })
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

/*
 * insertPracticePhotos
 * created by - Aniket Meshram;
 */
router.post('/insertPracticePhotos', fileUpload.uploadImage('practice_photo', pracImage), function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;
        var practice_photos = [];
            if (req.files.length > 0 || req.files != undefined || req.files != null || req.files != "") {
                var originalName = req.files[0].filename;
                practice_photos[0]= originalName;
                User.findOne({
                    '_id': userId
                }).then(function(caseData) {
                    if (practice_photos.length > 0) {
                        caseData.practice_photos.push(practice_photos);
                    }
                    caseData.updatedAt = config.currentTimestamp;
                    caseData.save(function(err, data) {
                        if (err) {
                            res.json({
                                success: false,
                                msg: "Failed to Insert Practice Photos"
                            });
                            return;
                        } else {
                            var userSession = new UserSession({
                                'userId': data.userId,
                                'apiName': "User inserted the Practice Photos"
                            });
                            userSession.save(function(er, db) {
                                res.json({
                                    success: true,
                                    msg: "Practice Photos inserted successfully",
                                    data: data
                                });
                                return;
                            })
                           
                        }
                    })
                }).catch(function(error) {
                    res.json({
                        success: false,
                        msg: "Please enter valid userId"
                    });
                    return;
                })
            }else{
                res.json({
                    success: false,
                    msg: "Please enter Image"
                });
                return;
            }
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})
/*
 * Delete Practice Photos
 * created by - Aniket Meshram;
 */
router.post('/deletePracticePhotos', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;
        var indexId = req.body.indexId;
        console.log("indexId->"+indexId)
  
        User.findOne({'_id': userId}).then(function(userData) {
            
            userData.practice_photos.splice(indexId,1);
            console.log("->"+userData.practice_photos.splice(indexId,1));
            console.log("-->"+userData.practice_photos);

            
            var photo = userData.practice_photos[indexId];
            
            console.log("deletePracPIC->"+photo);
            
            if (photo!=undefined||photo!=null||photo!="") {
                fs.unlink('./public/uploads/practice_photos/' + photo);
            } else{
                console.log('no file');
            };
            
            User.update({'_id': userId},{$set : {"practice_photos" : userData.practice_photos}}).then(function(userData1) {
                if (userData1) {
                    var userSession = new UserSession({
                        'userId': userData._id,
                        'apiName': "User view the profile"
                    });
                    
                    userSession.save(function(er, db) {
                        res.json({
                            success: true,
                            msg: "Fetched user record successfully",
                            data: userData
                        });
                        return;
                    })
                } else {
                    res.json({
                        success: false,
                        msg: "Failed to get user record"
                    });
                    return;
                }
            }).catch(function(error) {
                console.log(error);
                res.json({
                    success: false,
                    msg: "Failed to get user data"
                });
                return;
            })
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Failed to get user data"
            });
            return;
        })
    }).catch(function(error) {
        console.log("****" + error);
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

/*
 * Get all doctors
 * created by - AniMesh;
 */
router.post('/getAllDoctor', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var isDoctor = req.body.isDoctor;
        var userId = req.body.userId;
        var doctorData = [];
        User.find({'isDoctor': isDoctor}).then(function(info) {
            if (info.length > 0) {
                var count = 0;
                info.forEach(function(data) {

                    if (data.practice_photos.length) {
                        for (var i = 0; i < data.practice_photos.length; i++) {
                            if (data.practice_photos[i] != null && data.practice_photos[i] != "" && data.practice_photos[i] != undefined) {
                                var picture = CONSTANTS.baseUrl + getPracImage + data.practice_photos[i];
                                data.practice_photos[i] = picture;
                            }
                        };
                    }
                    
                    if (data.photo != undefined) {
                        if (data.photo.length) {
                            var picture = CONSTANTS.baseUrl + getImage + data.photo;
                            data.photo = picture;
                        }
                    }
                    doctorData.push(data);
                    count = count + 1;
                    if (count == info.length) {
                        var userSession = new UserSession({
                            'userId': userId,
                            'apiName': "User viewed doctor's"
                        });
                        userSession.save(function(er, db) {
                            res.json({
                            'success': true,
                            'msg': "Doctor fetched successfully",
                            'data': doctorData
                            });
                            return;
                        })
                    }
                })
            }else {
                res.json({
                    'success': false,
                    'msg': "No Doctors "
                })
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                'success': false,
                'msg': "Something went wrong while fetching Doctors"
            });
            return;
        })
    }).catch(function(error) {
        console.log(error);
        res.json({
            'success': false,
            'msg': "Authentication failed"
        });
        return;
    })
})

/*
 * User social signup
 * created by - AniMesh
 */
router.post('/socialSignup', function(req, res, next) {
    var facebookId = req.body.facebookId;
    var email = req.body.email;
    var googleId = req.body.googleId;
    var phoneNumber = req.body.phoneNumber;
    var fullname = req.body.fullName;
    var gender = req.body.gender;//newly added
    var isDoctor = req.body.isDoctor;
    var device = deviceType = req.body.deviceType;
    var deviceToken = req.body.deviceToken;

    if (email != null) {
        User.findOne({
            'email': email
        }).then(function(userData) {
            if (userData) {
                res.json({
                    'success': false,
                    'msg': "Email id is already exist"
                })
            } else {
                //-------------------------------------
                var deviceData={};
                deviceData.device_type = deviceType;
                deviceData.device_token = deviceToken;
                //-------------------------------------    
                if (facebookId != null) {
                    User.findOne({
                        'facebookId': facebookId
                    }).then(function(userData) {
                        if (userData) {
                            var tokenData = {
                                username: userData.email,
                                timestamp: config.currentTimestamp,
                                id: userData._id
                            };
                            //var secret = new Buffer(config.secret, "base64").toString();
                            var generatedToken = jwt.sign(tokenData, config.secret);
                            Token.findOneAndUpdate({
                                _id: userData._id
                            }, {
                                $set: {
                                    token: generatedToken,
                                    updatedAt: config.currentTimestamp
                                }
                            }, {
                                'new': true
                            }).exec().then(function(updatedToken) {
                                if (userData.photo != null) {
                                    if (userData.photo.length) {
                                        var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                        userData.photo = picture;
                                    }
                                }
                                var userUpdatedToken = {
                                    'userId': updatedToken.userId,
                                    'token': updatedToken.token,
                                    'fullName': userData.fullname,
                                    'email': userData.email,
                                    'phoneNumber': userData.phoneNumber,
                                    'gender': userData.gender,//new field
                                    'isDoctor': userData.isDoctor,
                                    'photo': userData.photo
                                };
                                if (updatedToken) {
                                    // console.log(userUpdatedToken);
                                    res.json({
                                        success: true,
                                        msg: "Token updated successfully",
                                        data: userUpdatedToken
                                    });
                                } else {
                                    res.send("something went wrong");
                                }
                            }).catch(function(error) {
                                console.log(error);
                            })
                        } else {
                            var user = new User({
                                'fullname': fullname,
                                'email': email.toLowerCase(),
                                'phoneNumber': req.body.phoneNumber,
                                'facebookId': req.body.facebookId,
                                'gender': req.body.gender,//new
                                'photo': "",
                                'isDoctor': req.body.isDoctor
                            });
                            //------------
                            //save device tokens in user table
                            user.deviceTokens = [];
                            user.deviceTokens.push(deviceData);
                            //--------------
                            user.save(function(err, data) {
                                if (data) {
                                    var tokenData = {
                                        username: data.email,
                                        timestamp: config.currentTimestamp,
                                        id: data._id
                                    };
                                    //var secret = new Buffer(config.secret, "base64").toString();
                                    var generatedToken = jwt.sign(tokenData, config.secret);
                                    Token.findOne({
                                        userId: data._id
                                    }).then(function(userInfo) {
                                        if (userInfo == null) {
                                            var newToken = new Token({
                                                userId: data._id,
                                                token: generatedToken,
                                                deviceType: req.body.deviceType
                                            });
                                            newToken.save(function(error, info) {
                                                if (error) {
                                                    res.json({
                                                        success: false,
                                                        msg: "Failed to add token"
                                                    })
                                                } else {
                                                    var createdUser = {
                                                        'userId': data._id,
                                                        'fullName': data.fullname,
                                                        'email': data.email,
                                                        'phoneNumber': data.phoneNumber,
                                                        'gender': data.gender,
                                                        'isDoctor': data.isDoctor,
                                                        'token': info.token,
                                                        'photo': data.photo
                                                    };
                                                    res.json({
                                                        success: true,
                                                        msg: 'User created successfully with facebookId.',
                                                        data: createdUser
                                                    });
                                                }
                                            });
                                        } else {
                                            res.json("user token alredy exist");
                                        }
                                    });
                                } else {
                                    console.log(err);
                                    res.json({
                                        'success': false,
                                        'msg': "User signup failed through facebookId"
                                    })
                                }
                            })
                        }
                    })
                } else if (googleId != null) {
                    User.findOne({
                        'googleId': googleId
                    }).then(function(userData) {
                        if (userData) {
                            var tokenData = {
                                username: userData.email,
                                timestamp: config.currentTimestamp,
                                id: userData._id
                            };
                            //var secret = new Buffer(config.secret, "base64").toString();
                            var generatedToken = jwt.sign(tokenData, config.secret);
                            Token.findOneAndUpdate({
                                _id: userData._id
                            }, {
                                $set: {
                                    token: generatedToken,
                                    updatedAt: config.currentTimestamp
                                }
                            }, {
                                'new': true
                            }).exec().then(function(updatedToken) {
                                if (userData.photo != null) {
                                    if (userData.photo.length) {
                                        var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                        userData.photo = picture;
                                    }
                                }
                                var userUpdatedToken = {
                                    'userId': updatedToken.userId,
                                    'token': updatedToken.token,
                                    'fullName': userData.fullname,
                                    'email': userData.email,
                                    'phoneNumber': userData.phoneNumber,
                                    'gender': userData.gender,
                                    'isDoctor': userData.isDoctor,
                                    'photo': userData.photo
                                };
                                if (updatedToken) {
                                    // console.log(userUpdatedToken);
                                    res.json({
                                        success: true,
                                        msg: "Token updated successfully",
                                        data: userUpdatedToken
                                    });
                                } else {
                                    res.send("somthing went wrong");
                                }
                            }).catch(function(error) {
                                console.log(error);
                            })
                        } else {
                            var user = new User({
                                'fullname': req.body.fullName,
                                'email': email.toLowerCase(),
                                'phoneNumber': req.body.phoneNumber,
                                'gender': req.body.gender,
                                'googleId': req.body.googleId,
                                'photo': "",
                                'isDoctor': req.body.isDoctor
                            });
                            //------------
                            //save device tokens in user table
                            user.deviceTokens = [];
                            user.deviceTokens.push(deviceData);
                            //--------------
                            user.save(function(err, data) {
                                if (data) {
                                    var tokenData = {
                                        username: data.email,
                                        timestamp: config.currentTimestamp,
                                        id: data._id
                                    };
                                    //var secret = new Buffer(config.secret, "base64").toString();
                                    var generatedToken = jwt.sign(tokenData, config.secret);
                                    Token.findOne({
                                        userId: data._id
                                    }).then(function(userInfo) {
                                        if (userInfo == null) {
                                            var newToken = new Token({
                                                userId: data._id,
                                                token: generatedToken,
                                                deviceType: req.body.deviceType
                                            });
                                            newToken.save(function(error, info) {
                                                if (error) {
                                                    res.json({
                                                        success: false,
                                                        msg: "Failed to add token"
                                                    })
                                                } else {
                                                    var createdUser = {
                                                        'userId': data._id,
                                                        'fullName': data.fullname,
                                                        'email': data.email,
                                                        'phoneNumber': data.phoneNumber,
                                                        'gender': data.gender,
                                                        'isDoctor': data.isDoctor,
                                                        'token': info.token,
                                                        'photo': data.photo
                                                    };
                                                    res.json({
                                                        success: true,
                                                        msg: 'User created successfully with googleId.',
                                                        data: createdUser
                                                    });
                                                }
                                            });
                                        } else {
                                            res.json("user token alredy exist");
                                        }
                                    });
                                } else {
                                    res.json({
                                        'success': false,
                                        'msg': "User signup failed through googleId",
                                        'err': err
                                    })
                                }
                            })
                        }
                    })
                } else {
                    res.json({
                        'success': false,
                        'msg': "Please enter facebookId or googleId and email"
                    })
                }
            }
        })
    }
})

/*
Login from facebook or google 
*/
router.post('/socialLogin', function(req, res, next) {
    var checkUser = req.body.isDoctor;
    var device = deviceType = req.body.deviceType;
    var deviceToken = req.body.deviceToken;

    if (req.body.facebookId != null) {
        User.findOne({
            'facebookId': req.body.facebookId
        }).then(function(userData) {
            if (userData) {
                if (checkUser != userData.isDoctor) {
                    if (!userData.isDoctor) {
                        res.json({
                            'success': false,
                            'msg': 'You can not login as Doctor'
                        })
                    } else {
                        res.json({
                            'success': false,
                            'msg': 'You can not login as Patient'
                        })
                    }
                }
                //--------------
                var flag=1;
                if(userData.deviceTokens)
                {
                    async.forEach(userData.deviceTokens,function (item,callback) {
                        if(item.device_token == deviceToken)
                        {
                            flag=0;
                        }
                        callback();
                    },function(){
                        if(flag==1){
                            var deviceData={};
                            deviceData.device_type = deviceType;
                            deviceData.device_token = deviceToken;                                        
                            userData.deviceTokens.push(deviceData);
                        }
                    });
                }else{
                    var deviceData={};
                    deviceData.device_type = deviceType;
                    deviceData.device_token = deviceToken;                                        
                    userData.deviceTokens.push(deviceData);
                }
                //------------------
                var tokenData = {
                    username: userData.email,
                    timestamp: config.currentTimestamp,
                    id: userData._id
                };

                var generatedToken = jwt.sign(tokenData, config.secret);

                Token.findOne({
                    'userId': userData._id
                }).populate('userId').then(function(userInfo) {

                    if (userInfo == null) {
                        var newToken = new Token({
                            userId: userData._id,
                            token: generatedToken,
                            deviceType: device
                        });
                        
                        newToken.save(function(error, info) {
                            
                            if (userData.photo != null) {
                                if (userData.photo.length) {
                                    var picture = CONSTANTS.baseUrl + getImage + userData.photo;
                                    userData.photo = picture;
                                }
                            }
                            
                            var userGeneratedToken = {
                                'userId': info.userId,
                                'token': info.token,
                                'fullName': userData.fullname,
                                'email': userData.email,
                                'phoneNumber': userData.phoneNumber,
                                'gender': userData.gender,
                                'isDoctor': userData.isDoctor,
                                'photo': userData.photo
                            };
                            
                            //------------
                            var updatedUserData = _.merge(userData, userData);
                                    
                            updatedUserData.save(function(err, data) {
                                // console.log("deviceToken@loginByEmail->"+data);
                            })
                            //------------------
                            
                            if (error) {
                                res.send("Failed to save token");
                            } else {
                                var userSession = new UserSession({
                                    'userId': info.userId,
                                    'apiName': "User is login into app"
                                });
                                userSession.save(function(er, db) {
                                    if (er) {
                                        res.json({
                                            'success': false,
                                            'msg': "failed to add user session data"
                                        })
                                    }
                                })
                                //console.log(userGeneratedToken);
                                res.json({
                                    success: true,
                                    msg: "Token generated successfully",
                                    data: userGeneratedToken
                                });
                            }
                        })
                    } else {
                        if (userInfo.userId.photo != null) {
                            if (userInfo.userId.photo.length) {
                                var picture = CONSTANTS.baseUrl + getImage + userInfo.userId.photo;
                                userInfo.userId.photo = picture;
                            }
                        }
                        var userUpdatedToken = {
                            'userId': userInfo.userId._id,
                            'token': userInfo.token,
                            'fullName': userInfo.userId.fullname,
                            'email': userInfo.userId.email,
                            'phoneNumber': userInfo.userId.phoneNumber,
                            'gender': userInfo.userId.gender,//new field
                            'isDoctor': userInfo.userId.isDoctor,
                            'photo': userInfo.userId.photo
                        };
                        //--------------
                        var updatedUserData = _.merge(userData, userData);
                        
                        updatedUserData.save(function(err, data) {
                            // console.log("updatedTokenData"+data);
                        })
                        //------------
                        var userSession = new UserSession({
                            'userId': userInfo.userId,
                            'apiName': "User is login into app"
                        });
                        userSession.save(function(er, db) {
                            res.json({
                                    success: true,
                                    msg: "Token updated successfully",
                                    data: userUpdatedToken
                                });
                        })
                    }
                    
                    
                }).catch(function(error) {
                    res.json({
                        'success': false,
                        'msg': "Something went wrong getting user token"
                    })
                })
            } else {
                res.json({
                    'success': false,
                    'msg': "User need to signup and then login with this facebookId"
                })
            }
        }).catch(function(error) {
            res.json({
                'success': false,
                'msg': "Something went wrong while getting user in social login"
            })
        })
    }

    if (req.body.googleId != null) {
        User.findOne({
            'googleId': req.body.googleId
        }).then(function(userData) {
            if (userData) {
                if (checkUser != userData.isDoctor) {
                    if (!userData.isDoctor) {
                        res.json({
                            'success': false,
                            'msg': 'You can not login as Doctor'
                        })
                    } else {
                        res.json({
                            'success': false,
                            'msg': 'You can not login as Patient'
                        })
                    }
                }
                //--------------
                var flag=1;
                if(userData.deviceTokens)
                {
                    async.forEach(userData.deviceTokens,function (item,callback) {
                        if(item.device_token == deviceToken)
                        {
                            flag=0;
                        }
                        callback();
                    },function(){
                        if(flag==1){
                            var deviceData={};
                            deviceData.device_type = deviceType;
                            deviceData.device_token = deviceToken;                                        
                            userData.deviceTokens.push(deviceData);
                        }
                    });
                }
                else{
                    var deviceData={};
                    deviceData.device_type = deviceType;
                    deviceData.device_token = deviceToken;                                        
                    userData.deviceTokens.push(deviceData);
                }
                var updatedUserData = _.merge(userData, userData);
                
                updatedUserData.save(function(err, data) {
                    console.log("updatedTokenData"+data);
                })

                Token.findOne({
                    'userId': userData._id
                }).populate('userId').then(function(userInfo) {
                    if (userInfo) {
                        if (userInfo.userId.photo.length) {
                            if (userInfo.userId.photo != null || userInfo.userId.photo != "") {
                                var picture = CONSTANTS.baseUrl + getImage + userInfo.userId.photo;
                                userInfo.userId.photo = picture;
                            }
                        }
                        var userToken = {
                            'userId': userInfo.userId._id,
                            'token': userInfo.token,
                            'fullName': userInfo.userId.fullname,
                            'email': userInfo.userId.email,
                            'phoneNumber': userInfo.userId.phoneNumber,
                            'gender': userInfo.userId.gender,
                            'isDoctor': userInfo.userId.isDoctor,
                            'photo': userInfo.userId.photo
                        };
                        // console.log(userToken);
                        var userSession = new UserSession({
                            'userId': userInfo.userId,
                            'apiName': "User is login into app through googleId"
                        });
                        userSession.save(function(er, db) {
                            if (er) {
                                res.json({
                                    'success': false,
                                    'msg': "failed to add user session data"
                                })
                            } else {
                                res.json({
                                    success: true,
                                    msg: "User login successfully with googleId",
                                    data: userToken
                                });
                            }
                        })
                    } else {
                        res.json({
                            'success': false,
                            'msg': "User does not have token"
                        })
                    }
                }).catch(function(error) {
                    res.json({
                        'success': false,
                        'msg': "Something went wrong getting user token"
                    })
                })
            } else {
                res.json({
                    'success': false,
                    'msg': "User need to signup and then login with this googleId"
                })
            }
        }).catch(function(error) {
            res.json({
                'success': false,
                'msg': "Something went wrong while getting user in social login"
            })
        })
    }
})

/*
User logout from app
*/
router.post('/logout', function(req, res, next) {
    var token = req.headers['accesstoken'];
    var userId = req.body.userId;
    var Device_Token = req.body.DeviceToken; 
    // console.log("DeviceTokenOnLogout->"+Device_Token)
    User.findOne({
        '_id': userId
    }).then(function(userData) {
        // console.log("userData.deviceTokens->"+userData.deviceTokens);
        if (userData != null) {
            //--------------
            if (Device_Token!=undefined && Device_Token!=null && Device_Token!="") {
                var flag=1;
                if(userData.deviceTokens)
                {
                    async.forEach(userData.deviceTokens,function (item,callback) {
                        // console.log("item.device_token->"+item.device_token);

                        if(item.device_token == Device_Token)
                        {
                            flag=0;
                            userData.deviceTokens.splice(userData.deviceTokens.indexOf(item),1);
                            
                        }
                        callback();
                    },function(){
                        if(flag==1){
                            var deviceData={};
                            deviceData.device_type = userData.deviceTokens.deviceType;
                            deviceData.device_token = userData.deviceTokens.deviceToken;                                        
                            userData.deviceTokens.push(deviceData);
                        }
                    });
                }
            }
            //------------
            Token.findOneAndRemove({
                'userId': userId
            }).then(function(userTokenInfo) {

                if (Device_Token!=undefined && Device_Token!=null && Device_Token!="") {
                
                    var logOutData = _.merge(userData, userData);
                    logOutData.save(function(err, data) {
                        // console.log("logOutData"+data);
                    })
                }
                
                if (userTokenInfo != null) {
                    res.json({
                        'success': true,
                        'msg': "User logout successfully"
                    });
                    return;
                } else {
                    res.json({
                        'success': false,
                        'msg': "User dont have token"
                    });
                    return;
                }
            }).catch(function(error) {
                res.json({
                    'success': false,
                    'msg': "Something went wrong while user logout"
                });
                return;
            })
        } else {
            res.json({
                'success': false,
                'msg': "User id is not exists"
            });
            return;
        }
    }).catch(function(error){
        res.json({
           'success': false,
           'msg': "User is already deleted From admin panel"
        });
        return;
    });
})
// to confirm email
// created_on : 15th Dec 2017
router.get('/confirm_email/:id', function(req,res,next) {
    User.findOne({'_id':req.params.id}).then(function(result) {
        console.log(result)
        if (result.confirm_email==true) {
                res.redirect('http://www.opinionplus.com/reconfirmed_email');
        } else{
            req.body.confirm_email = true;
            var emailConfirmed = _.merge(result, req.body);
            emailConfirmed.save(function(err,result2) {
            console.log(result2)
                if (err) {
                    res.redirect('http://www.opinionplus.com/404_error');
                } else{
                    res.redirect('http://www.opinionplus.com/confirmed_email');
                };
            });
        };
    }).catch(function(error) {
        console.log(error)
        res.json({
            success:false,
            msg:"invalid user id"
        })
        return
    })
})

module.exports = router;