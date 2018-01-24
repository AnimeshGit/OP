//case data:-
var express = require('express');
var router = express.Router();

var User = require(appRoot + '/models/op_users');
var dependUsers = require(appRoot + '/models/op_familyhistory');
var BookMark = require(appRoot + '/models/op_bookmark');
var Case = require(appRoot + '/models/op_cases');
var UserSession = require(appRoot + '/models/op_userSession');

var jwtAuth = require(appRoot + '/libs/jwtAuth');
var _ = require('lodash');
var config = require(appRoot + '/libs/config');

var fileUpload = require(appRoot + '/libs/fileupload');
var math = require("mathjs");

var documentPath = "/public/uploads/userDocuments";

var UserSession = require(appRoot + '/models/op_userSession');
var getImage = 'uploads/users/';
const CONSTANTS = require(appRoot + '/Constants/constant');
var getDependentImage = 'uploads/dependents/';
var getDocument = 'uploads/userDocuments';

//delete data from admin panel:-
const path = require('path');
var fs = require("fs");
var ObjectId = require('mongoose').Types.ObjectId;

    
router.post('/delete_each_user', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
    
    var user_id = req.body.user_id;
  
        if(user_id==undefined)
        {
            res.json({
                'success': false,
                'msg': "user_id can't be undefined"
                });
             return;
        }
        else
        {
            User.findOneAndRemove({_id: user_id},function(err, userData) {
                if(!err)
                {
                    if(userData!=null)
                    {
                    
                    if (userData.photo != '')
                    {
                        if (fs.existsSync('./public/uploads/users/' + userData.photo))
                        {
                            //Delete patient_img from folder
                            fs.unlink('./public/uploads/users/' + userData.photo);
                        }
                    }
                    dependUsers.deleteMany({userId: user_id},function(err, DepData) {
                        // console.log("DepData"+DepData);
                        // var files = DepData.photo;
                        BookMark.deleteMany({userId: user_id},function(err, BookData) {
                           
                            Case.deleteMany({userId: user_id},function(err, CaseData) {
                            
                                UserSession.deleteMany({userId: user_id},function(err, UserSessionData) {
                                    
                                        if (err) {
                                            res.json({
                                            'success': false,
                                            'msg': "Something went wrong while deleting user"
                                            });
                                            return;
                                        } else {
                                            res.json({
                                            'success': true,
                                            'msg': "User Deleted successfully"
                                            });
                                            return;
                                        }
                                    });
                                });
                            });    
                        });    
                    }
                    else
                    {
                        res.json({
                        'success': false,
                        'msg': "user not exist"
                        });
                        return;
                    }
                }
                else
                {
                    res.json({
                    'success': false,
                    'msg': "Something went wrong while deleting user"
                    });
                    return;
                }
            }); 
        }      
    }).catch(function(error) {
        console.log("errr" + error);
        res.json({
            success: false,
            msg: "Authentication failed"
        });return;
    });    
})


router.post('/delete_each_dependent', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
    
    var dependentId = req.body.dependent_id;
    
        dependUsers.findOneAndRemove({_id: dependentId},function(err, dependentData) {
            
            if (dependentData.photo != '')
            {
                if (fs.existsSync('./public/uploads/dependents/' + dependentData.photo))
                {
                    //Delete patient_img from folder
                    fs.unlink('./public/uploads/dependents/' + dependentData.photo);
                }
            }

            if (err) {
                res.json({
                'success': false,
                'msg': "Something went wrong while Deleting Dependent"
                });return;
            } else {
                res.json({
                'success': true,
                'msg': "Dependents Deleted successfully"
                });return;
            }
        });       
    }).catch(function(error) {
        console.log("errr" + error);
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

module.exports = router;
