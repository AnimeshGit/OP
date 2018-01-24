var express = require('express');
var config = require(appRoot + '/libs/config');
// var router = express.Router();
// var constant = require(appRoot + '/routes/constants');
var adminUser = require(appRoot + '/models/masterAdmin');
var opUsers = require(appRoot + '/models/op_users');
var opBlog = require(appRoot + '/models/op_blogs');
var opCase = require(appRoot + '/models/op_cases');
var randomstring = require("randomstring");
bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
const session = require('express-session');
var email_for_approval = require(appRoot + '/message.json');
const CONSTANTS = require(appRoot + '/Constants/constant');


/* GET Login page. */
module.exports = function(app) {

    //admin panel login page:-
    app.get('/admin_login', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        console.log(adminId);
        if (adminId != undefined) {
            res.redirect('/dashboard');
        } else {
            res.render('admin/admin_login', {
                page_title: "Login Page",
                success: req.flash('success'),
                error: req.flash('error')
            });
        }
    });

    //admin panel sign up page:-
    app.get('/admin_signup', function(req, res) {
        var sess = req.session;
        var adminId = sess.adminId;
        // console.log(adminId);
        // if (adminId == undefined) {
        //     res.redirect('/admin/dashboard');
        // } else {
            res.render('admin/admin_signup', {
                page_title: "SignUp Page",
                approot: appRoot
            });
        // }
    });

    //display dashboard page
    app.get('/dashboard', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            /*-----------------------*/
            opUsers.find({
                'isDoctor': false
            }).sort({
                'createdAt': -1
            }).limit(5).then(function(patientData) {
                opUsers.find({
                    'isDoctor': true
                }).sort({
                    'createdAt': -1
                }).limit(5).then(function(doctorData) {
                    opBlog.find().sort({
                        'createdAt': -1
                    }).limit(5).then(function(blogData) {
                        opCase.find({'isDraft':false}).populate('userId').sort({
                            'createdAt': -1
                        }).limit(5).then(function(caseData) {
                           
                            opUsers.count({
                                'isDoctor': false
                            }).then(function(userCount) {
                                opUsers.count({
                                    'isDoctor': true
                                }).then(function(doctorCount) {
                                    opBlog.count().then(function(blogCount) {
                                        opCase.count({'isDraft':false}).then(function(caseCount) {
                                            res.render('admin/dashboard', {
                                                page_title: "Dashboard Page",
                                                navigation: 'dashboard',
                                                patientData: patientData,
                                                doctorData: doctorData,
                                                adminFirstName : sess.adminFirstName,
                                                blogData: blogData,
                                                caseData: caseData,
                                                doctorCount: doctorCount,
                                                userCount: userCount,
                                                blogCount: blogCount,
                                                caseCount: caseCount
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
            /*----------------------------*/
        }
    });

    app.get('/admin_profile', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            res.render('admin/admin_profile', {
                page_title: "Profile Page",
                adminFirstName : sess.adminFirstName,
                adminEmail : sess.adminEmail,
                adminId : sess.adminId,
                adminLastName : sess.adminLastName,
                navigation: 'admin_profile',
                success: req.flash('success'),
                error: req.flash('error'),
            });
        }
    });

    //get approval by super admin
    app.get('/get_approval/:id',function(req,res) {
        // var is_approved = true;
        var approval_id = req.params.id;
            adminUser.findOneAndUpdate({
                _id: approval_id
            }, {
                $set: {
                    'is_approved': true
                }
            }, {
                'new': true
            }, function(err, data) {
                console.log("Approved_Data->"+data)
                if (err) {
                    req.flash('error', 'Opps!!!!......something goes wrong');
                    res.redirect('/admin_login');
                } else {
                    req.flash('success', 'Successfully approved');
                    res.redirect('/admin_login');
                }
            })
        // var adminUser
        // body...
    })

    //admin panel sign_up process:
    app.post('/admin_register', function(req, res, next) {
        // var link_for_approval = CONSTANTS.baseUrl;
        // var mail_link = "<a href=\"CONSTANTS.baseUrl\">Click here!!</a>";

        var input = JSON.parse(JSON.stringify(req.body));
        var fname = input.adminFirstName;
        var lname = input.adminLastName;
        var email = input.adminEmail;
        var password = input.adminPassword;
        var hash_password = bcrypt.hashSync(password, salt);
        // var super_admin = 'aniket.meshram@eeshana.com';
        //create table and save data in the table 

        adminUser.findOne({
            'adminEmail': email.toLowerCase()
        }).then(function(userData) {
            
            if (userData == null || userData == '') {
                var newUser = new adminUser({
                    adminFirstName: fname,
                    adminLastName: lname,
                    adminEmail: email.toLowerCase(),
                    adminPassword:hash_password
                    //adminPassword: config.encrypt(password)
                });

                newUser.save(function(err, data) {
                    console.log("newAdminData->"+data);
                    if (err) {
                        res.render('admin/admin_login', {
                            page_title: "Login Page",
                            success: false,
                            adminFirstName : sess.adminFirstName,
                            msg: 'Username already exists.',
                            data: data
                        });
                    } else {

                        var text = 'You are receiving this because\t' + fname + '\t' + lname +
                                    '\tregistered for OpinionPlus admin panel kindly ' +
                                    '<a href=http://node.bizmoapps.com:8000/get_approval/' + data._id + '> Click here </a>' +'to approve.\n\n'

                        var subject = 'Admin approval Notification';
                        
                        config.sendMail(email_for_approval.super_admin, text, subject).then(function(result, error) {
                            if (error) {
                            console.log(error);
                            }
                        });
                        req.flash('success', 'Congradulations!! you become a Admin. Wait for Approval');
                        res.redirect('/admin_login');
                    }
                });
            } else {
                req.flash('error', 'Email id already exists');
                res.redirect('/admin_login');
            }
        })
    });

    // Login Process:-
    app.post('/admin_signin', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        var input = JSON.parse(JSON.stringify(req.body));
        var email = input.username;
        var password = input.password;
        if (input.username != null) {
            adminUser.findOne({
                'adminEmail': email
            }).then(function(adminData) {
                if (adminData) {
                    if (adminData.is_approved==true) {
                        if(bcrypt.compareSync(password, adminData.adminPassword)){
                            sess.adminId = adminData._id;
                            sess.adminEmail = adminData.adminEmail;
                            sess.adminFirstName = adminData.adminFirstName;
                            sess.adminLastName = adminData.adminLastName;
                            res.redirect('/dashboard');
                        } else {
                            req.flash('error', 'Please enter correct password');
                            res.redirect('/admin_login');
                        }
                    }else{
                        req.flash('error', 'You are not approved yet. Please Confirm your approval');
                        res.redirect('/admin_login');                    
                    }
                } else {
                    req.flash('error', 'Please enter the username');
                    res.redirect('/admin_login');
                }
            })
        } else {
            req.flash('error', 'Please enter the username');
            res.redirect('/admin_login');
        }
    });

    //Logout Process:
    app.get('/admin_logout', function(req, res) {
        req.session.destroy(function (err) {
            if (err) {
              console.log(err);
            } else {
               res.redirect('/admin_login');
            }
        });
    });
    
    //update_admin_profile
    app.post('/update_admin_profile', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;

        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {

            var input = JSON.parse(JSON.stringify(req.body));
            var admin_id = input.admin_id;

            var FirstName = input.admin_first_name;
            var LastName = input.admin_last_name;
            var Email = input.admin_email;

            adminUser.findOneAndUpdate({
                _id: admin_id
            }, {
                $set: {
                    'adminFirstName': FirstName,
                    'adminLastName': LastName,
                    'adminEmail': Email,

                }
            }, {
                'new': true
            }, function(err, data) {

                if (err) {
                    req.flash('error', 'Opps!!!!......Profile data not Updated');
                    res.redirect('/admin_profile');

                } else {
                    if (data != null) {
                        sess.adminId = data._id;
                        sess.adminEmail = data.adminEmail;
                        sess.adminFirstName = data.adminFirstName;
                        sess.adminLastName = data.adminLastName;
                    }
                    req.flash('success', 'Successful updated Profile Data');
                    res.redirect('/admin_profile');

                }
            })
        }
    });

    //change password:
    app.post('/changepassword', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var input = JSON.parse(JSON.stringify(req.body));
            var admin_id = input.admin_id;

            var new_pass = input.newPassword;
            var conf_pass = input.confirmPassword;
            var hash_password = bcrypt.hashSync(new_pass, salt);
            adminUser.findOneAndUpdate({
                _id: admin_id
            }, {
                $set: {
                    adminPassword: hash_password
                }
            }, {
                'new': true
            }, function(err, data) {

                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Profile Password Not Change');
                    res.redirect('/admin_profile');
                } else {
                    req.flash('success', 'Successful updated Profile Password');
                    res.redirect('/admin_profile');
                }
            })
        }
    });

    app.post('/forgetPassword', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));
      
        var email = input.email;
        var randomPassword = randomstring.generate(6);
          var hash_password = bcrypt.hashSync(randomPassword, salt);
        adminUser.findOneAndUpdate({
            'adminEmail': email
        }, {
            $set: {
                password: hash_password,
                updatedAt: config.currentTimestamp
            }
        }, {
            'new': true
        }, function(err, data) {
            if (data) {
             
                var text = 'You are receiving this because you ' +
                    'have requested reset of ' +
                    'password for your account.\n\n Your code' +
                    ' is ' + randomPassword + '. Please login with this code as password.';
                
                var subject = 'Password Reset Notification';
                config.sendMail(req.body.email.toLowerCase(), text, subject).then(function(result, error) {
                    if (error) {
                        console.log(error);
                        req.flash('error', 'Failed to send notification to your registered email ID.');
                        res.redirect('/admin_login');
                    } else {
                        req.flash('success', 'Notification sent to your registered email ID.');
                        res.redirect('/admin_login');
                    }
                });
            } else {
               
                req.flash('error', 'User Not found with entered email Id');
                res.redirect('/admin_profile');
            }
        })
    })
}