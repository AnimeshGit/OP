var express = require('express');
var router = express.Router();
var User = require(appRoot + '/models/op_users');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var familyHistory = require(appRoot + '/models/op_familyhistory');
var fs = require('fs');
var _ = require('lodash');
var fileUpload = require(appRoot + '/libs/fileupload');
var query = require('url');
var Case = require(appRoot + '/models/op_cases');
var config = require(appRoot + '/libs/config');
var dependentImage = "/public/uploads/dependents";
var getDependentImage = 'uploads/dependents/';
const CONSTANTS = require(appRoot + '/Constants/constant');
var getUserImage = 'uploads/users/';
var UserSession = require(appRoot + '/models/op_userSession');

/*
Input Parameter: fullname,dateOfBirth,age,region,gender,relationship,allergies,currentMedication,
        medicalConditions,userId,photo
Description : Add user family member or dependent data        
*/
router.post('/addDependent', fileUpload.uploadImage('photo', dependentImage), function(req, res, next) {
    var token = req.headers['accesstoken'];
    let caseAdded = {};
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;
        console.log(req.body);
        if (req.files == undefined) {
            console.log(" ok np");
            req.body.photo = "";
            console.log("//////" + req.body.photo);
        } else {
            if (req.files.length > 0 || req.files != undefined) {
                var originalName = req.files[0].filename;
                req.body.photo = originalName;
            }
        }

        var familyData = new familyHistory({
            fullname: req.body.fullname,
            dateOfBirth: req.body.dateOfBirth,
            age: req.body.age,
            region: req.body.region,
            gender: req.body.gender,
            relationship: req.body.relationship,
            //isDefault: req.body.isDefault,
            allergies: req.body.allergies,
            currentMedication: req.body.currentMedication,
            medicalConditions: req.body.medicalConditions,
            userId: userId,
            photo: req.body.photo
        });
        // console.log(familyData);

        familyData.save(function(err, data) {
            if (err) {
                console.log(err);
                res.json({
                    success: false,
                    msg: "Failed to add dependent"
                })
            } else {
                var userSession = new UserSession({
                    'userId': data.userId,
                    'apiName': "User added his dependent"
                });
                userSession.save(function(er, db) {
                    if (er) {
                        res.json({
                            'success': false,
                            'msg': "failed to add user session data"
                        })
                    }
                })
                if (data.photo.length) {
                    if (data.photo != null) {
                        var picture = CONSTANTS.baseUrl + getDependentImage + data.photo;
                        data.photo = picture;
                    }
                }

                res.json({
                    success: true,
                    msg: "Dependent added successfully",
                    data: {
                        'data': data
                    }
                })
            }
        })
    }).catch(function(error) {
        console.log("*****" + error);
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    });
});

/*
Input Parameter :UserId
Description : Get all dependents of particular user
*/
router.post('/getDependent', function(req, res, next) {
    var token = req.headers['accesstoken'];
    var userId = req.body.userId;
    var userData = {};
    jwtAuth.checkAuth(token).then(function(result) {
        var familyData = [];
        if (userId) {
            User.findOne({
                '_id': userId
            }).then(function(userInfo) {
                if (userInfo) {
                    if (userInfo.photo != undefined&&userInfo.photo != null&&userInfo.photo != "") {
                        // if (userData.photo.length) {
                        var picture = CONSTANTS.baseUrl + getUserImage + userInfo.photo;
                        userInfo.photo = picture;
                        // }
                    }
                    userData = userInfo;
                }
            }).then(function() {
                familyHistory.find({
                    'userId': userId
                }).then(function(familyInfo) {
                    if (familyInfo.length > 0) {
                        var count = 0;
                        familyInfo.forEach(function(family) {
                            //var userFamilyInfo = family;
                            if (family.photo.length) {
                                if (family.photo != null) {
                                    var picture = CONSTANTS.baseUrl + getDependentImage + family.photo;
                                    family.photo = picture;
                                }
                            }

                            /*if (family.isDefault == true) {
                                familyData.push(userData);
                                userData = family;
                            } else {*/
                            familyData.push(family);
                            //}
                            count = count + 1;
                            if (count == familyInfo.length) {
                                userData = userData.toObject();
                                delete userData.password;
                                var userSession = new UserSession({
                                    'userId': userId,
                                    'apiName': "User viewed his all dependent"
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
                                    msg: "User dependent fetched successfully",
                                    data: {
                                        'userInfo': userData,
                                        'userDependent': familyData
                                    }
                                })
                            }
                        })
                    } else {
                        res.json({
                            success: true,
                            msg: "User don't have any dependent",
                            data: {
                                'userInfo': userData,
                                'userDependent': familyData
                            }
                        })
                    }
                }).catch(function(error) {
                    console.log(error);
                    res.json({
                        success: false,
                        msg: "Something went wrong to fetch user dependent"
                    })
                })
            })
        } else {
            res.json({
                success: false,
                msg: "Please enter valid userId"
            })
        }
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

/*
Input Parameter: familyMemberId
Description: Get details of particular familyMember
*/
router.post('/getSingleDependent', function(req, res, next) {
    console.log(req.body);
    var token = req.headers['accesstoken'];
    console.log(token);
    jwtAuth.checkAuth(token).then(function(result) {

        var familyMemberId = req.body.familyMemberId;
        console.log(familyMemberId);
        if (familyMemberId == null) {
            res.send({
                success: false,
                msg: "Please enter family Member Id"
            })
        }

        familyHistory.findOne({
            '_id': familyMemberId
        }).then(function(dependentInfo) {
            console.log("dependentInfo=>"+dependentInfo);
            if (dependentInfo != null) {
                var userSession = new UserSession({
                    'userId': dependentInfo.userId,
                    'apiName': "User viewed dependent profile"
                });
                userSession.save(function(er, db) {
                    if (er) {
                        res.json({
                            'success': false,
                            'msg': "failed to add user session data"
                        })
                    }
                })
                if (dependentInfo.photo != null && dependentInfo.photo != undefined && dependentInfo.photo != "") {
                    var picture = CONSTANTS.baseUrl + getDependentImage + dependentInfo.photo;
                    dependentInfo.photo = picture;
                }
                res.json({
                    success: true,
                    msg: "Dependent record fetched successfully",
                    data: dependentInfo
                })
            } else {
                res.json({
                    success: false,
                    msg: "Please enter valid family member id"
                })
            }
        }).catch(function(error) {
            res.send("Something went wrong while fetching dependent");
        })
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

/*
Input Paramerter : familyMemebrId,fullname,dateOfBirth,age,region,gender,relationship,allergies,currentMedication,
        medicalConditions,photo
Description : Update the data of particular family memeber data
*/
router.post('/updateDependent', fileUpload.uploadImage('photo', dependentImage), function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var familyMemberId = req.body.familyMemberId;
        var userId = req.body.userId;
        var listData = [];
        console.log("photo info " + JSON.stringify(req.body.userId));
        //console.log("familymember id " + familyMemberId);
        //console.log("photo info " + JSON.stringify(req.files));
        if (req.files == undefined) {
            console.log("ok np");
        } else {
            if (req.files.length > 0 || req.files != undefined) {
                var originalName = req.files[0].filename;
                //req.body.photo = originalName;
                console.log("******" + originalName);
            }
        }

        var checkDefaults = function(userId) {
            return new Promise(function(resolve, reject) {
                familyHistory.find({
                    'userId': userId
                }).then(function(familyDetails) {
                    if (familyDetails.length > 0) {
                        var count = 0;
                        familyDetails.forEach(function(info) {
                            if (info.isDefault == true) {
                                listData.push(info)
                            }
                            count = count + 1;
                            if (count == familyDetails.length) {
                                console.log("count is " + count);
                                console.log("list is " + listData.length);
                                resolve(listData);
                            }
                        })
                    } else {
                        resolve(true);
                    }
                }).then(function() {

                })
            })
        }

        var updateDependentInfo = function(familyMemberId) {
            return new Promise(function(resolve, reject) {
                familyHistory.findOneAndUpdate({
                    _id: familyMemberId
                }, {
                    $set: {
                        updatedAt: config.currentTimestamp
                    }
                }, {
                    'new': true
                }).exec().then(function(familyData) {
                    if (familyData) {
                        delete req.body.userId;
                        delete req.body.familyMemberId;

                        req.body.photo = originalName;
                        var updateDependent = _.merge(familyData, req.body);
                        updateDependent.save(function(err, updatedData) {
                            if (err) {
                                console.log("in error " + err);
                                reject(error);
                            } else {
                                if (updatedData.photo != null) {
                                    var picture = CONSTANTS.baseUrl + getDependentImage + updatedData.photo;
                                    updatedData.photo = picture;
                                }
                                console.log("ipdatedData is" + updatedData);
                                resolve(updatedData);
                            }
                        })
                    }
                }).catch(function(error) {
                    console.log(error);
                    reject(error);
                })
            })
        }

        if (req.body.isDefault == true) {
            console.log("caught you");
            checkDefaults(userId).then(function(data) {
                if (data.length > 0) {
                    console.log("data is" + data);
                    res.send({
                        success: false,
                        msg: "User already set the default user"
                    });
                } else {
                    var updatedData;
                    updateDependentInfo(familyMemberId).then(function(info, err) {
                        if (info) {
                            updatedData = info;

                            var userSession = new UserSession({
                                'userId': info.userId,
                                'apiName': "User update his dependent"
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
                                msg: "User dependent updated successfully",
                                data: updatedData
                            })
                        } else {
                            res.json({
                                success: false,
                                msg: "Failed to update the user dependent"
                            })
                        }
                    }).catch(function(error) {
                        res.json({
                            success: false,
                            msg: "Something went wrong, Failed to update user dependent"
                        })
                    })
                }
            })
        } else {
            var updatedData;
            updateDependentInfo(familyMemberId).then(function(info) {
                console.log("got it " + info)
                if (info) {
                    updatedData = info;
                    /*var userSession = new UserSession({
                        'userId': info.userId,
                        'apiName': "updateDependent"
                    });
                    userSession.save(function(er, db) {
                        if (er) {
                            res.json({
                                'success': false,
                                'msg': "failed to add user session data"
                            })
                        }
                    })*/
                    res.send({
                        success: true,
                        msg: "User dependent updated successfully",
                        data: updatedData
                    })
                } else {
                    res.json({
                        success: false,
                        msg: "Failed to update the user dependent"
                    })
                }
            }).catch(function(error) {
                console.log("******" + error);
                res.json({
                    success: false,
                    msg: "Something went wrong, Failed to update user dependent"
                })
            })
        }
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

module.exports = router;