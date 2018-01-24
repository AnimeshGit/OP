var express = require('express');
var router = express.Router();
var User = require(appRoot + '/models/op_users');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var Case = require(appRoot + '/models/op_cases');
var _ = require('lodash');
var CaseQuery = require(appRoot + '/models/op_caseQueryAnswers');
var config = require(appRoot + '/libs/config');
var fileUpload = require(appRoot + '/libs/fileupload');
var math = require("mathjs");
var documentPath = "/public/uploads/userDocuments";
var UserSession = require(appRoot + '/models/op_userSession');
const CONSTANTS = require(appRoot + '/Constants/constant');
var getImage = 'uploads/users/';
var getDependentImage = 'uploads/dependents/';
var getDocument = 'uploads/userDocuments/';
var getPracticePhotos = 'uploads/practice_photos/';
var case_email = require(appRoot + '/message.json'); 
const path = require('path');
var fs = require("fs");
var Limits = require(appRoot + '/models/op_limits');

/*
Input parameter : UserId,primeryDiagnosisName,description,familyMemberId,physicainReviewer
                    documents,isDraft,isAnonymous,isPrimaryDiagnosis,paymentId,paymentStatus

Description: Add case when user ask for seek opinion
*/
router.post('/addLimits',function(req,res,next){
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {

        Limits.create({ 
            caseLimit : req.body.caseLimit,
            followLimit : req.body.followLimit
        }, function (err, result) {
            if (err) {
                res.json({
                    success: false,
                    msg: 'Limits are not inserted'
                });
            } else {
                res.json({
                    success: true,
                    msg: 'Successful inserted new Limits',
                    data: result
                });
                return;
            }
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })

})

router.post('/addCase', fileUpload.uploadImage('document', documentPath), function(req, res, next) {
    var token = req.headers['accesstoken'];
    // console.log(token);
    jwtAuth.checkAuth(token).then(function(result) {
        var documents = [];

        if (req.files == undefined || req.files == null || req.files == "") {

        } else {
            if (req.files.length>0 || req.files!=undefined || req.files!=null || req.files!= "") {
                var originalName = req.files[0].filename;
                
                console.log(originalName);
                req.files.forEach(function(fileinfo) {
                    documents.push(fileinfo.filename);
                })
            }
        }

        var primeryDiagnosisName = req.body.primeryDiagnosisName;
        var description = req.body.diagnosisDescription;
        var userId = req.body.userId;
        var familyMemberId = req.body.familyMemberId;
        var priceId = req.body.priceId;
        var physicainReviewer = req.body.physicainReviewer;
        var doctorId = req.body.doctorId;

    if (req.body.primaryAmount)
        var primaryAmount = parseInt(req.body.primaryAmount);
    else
        var primaryAmount = "";
        
    if (req.body.priceAmount) 
        var priceAmount = parseInt(req.body.priceAmount);
    else
        var priceAmount = 0;
        
    if (req.body.priceType) 
        var priceType = req.body.priceType;
    else
        var priceType = "";

        var val = math.random(99999);
        var num = val.toFixed(0);
        if (req.body.isDraft==true||req.body.isDraft=="true") {
            status="draft";
            req.body.draftDate= config.currentTimestamp;

        }else{
            status="unassigned";
            req.body.unassignedDate= config.currentTimestamp;
        };

        var userCase = new Case({
            'userId': userId,
            'caseNo': num,
            'familyMemberId': familyMemberId,
            'primeryDiagnosisName': primeryDiagnosisName,
            'diagnosisDescription': description,
            'physicainReviewer': physicainReviewer,
            'documents': documents,
            'priceId': priceId,
            'doctorId': doctorId,
            'status': status,
            'primaryAmount': primaryAmount,
            'priceAmount': priceAmount,
            'priceType': priceType,
            'draftDate': req.body.draftDate,
            'isDraft': req.body.isDraft,
            'isAnonymous': req.body.isAnonymous,
            'isPrimaryDiagnosis': req.body.isPrimaryDiagnosis,
            'paymentId': req.body.paymentId,
            'paymentStatus': req.body.paymentStatus
        })
        userCase.save(function(err, userCaseInfo) {
            // console.log("case after save"+userCaseInfo);
            if (err) {
                console.log(err);
                res.json({
                    'success': false,
                    'msg': "Failed to add user case"
                })
            } else {
                var casequery = new CaseQuery({
                    'caseId': userCaseInfo._id,
                    'userId': userId
                });
                casequery.save(function(err, data) {
                    if (err) {
                        console.log(err);
                        res.json({
                            success: false,
                            msg: "failed to add case in case query"
                        })
                    } else {
                        var userSession = new UserSession({
                            'userId': userId,
                            'apiName': "User submitted his case"
                        });
                        userSession.save(function(er, db) {
                            if (er) {
                                console.log("err while session " + er);
                                res.json({
                                    'success': false,
                                    'msg': "failed to add user session data"
                                })
                            } else {
                                res.json({
                                    success: true,
                                    msg: "Case added successfully",
                                    data: userCase
                                })  
                            }
                        })
                    }
                }).catch(function(error) {
                    res.json({
                        'success': false,
                        'msg': "Something went wrong while adding case in casequery"
                    })
                })
            }
        }).catch(function(error) {
            res.json({
                'success': false,
                'msg': "Something went wrong while adding case"
            });
            return;
        })
    }).catch(function(error) {
        console.log("errr" + error);
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

/*
Input parameter: caseId,userId,primeryDiagnosisName,description,familyMemberId,physicainReviewer
                    documents,isDraft,isAnonymous,isPrimaryDiagnosis,paymentId,paymentStatus
Description: Update case when user done changes in case
*/
router.post('/updateCase',fileUpload.uploadImage('document',documentPath),function(req, res, next) {
    var token = req.headers['accesstoken'];

    jwtAuth.checkAuth(token).then(function(result) {
        var caseId = req.body.caseId;
        var documents = [];
        // console.log(req.body);
        // return;
        if (req.body.isDraft==true||req.body.isDraft=="true") {
            req.body.status="draft";
            req.body.draftDate= config.currentTimestamp;
        }else if (req.body.doctorId) {
            req.body.status="assigned";
            req.body.assignedDate= config.currentTimestamp;
        }else{
            req.body.status="unassigned";
            req.body.unassignedDate= config.currentTimestamp;
        };


        if (req.files == undefined || req.files == null || req.files == "") {
            
            Case.findOne({
                    '_id': caseId
                }).populate('userId').populate("familyMemberId").then(function(caseData) {
                    if (caseData.userId.confirm_email == false) {
                        if(req.body.status == "unassigned")
                        {
                            res.json({
                                'success': false,
                                'msg': "Your case is saved in the draft securely. Please confirm your email id before submitting the case"
                            });
                            return;
                        }
                    } 
                Case.find({
                    'userId': caseData.userId
                }).count().then(function(countofcase1) {
                    console.log("countofcase1->"+countofcase1);
                    
                    Case.find({
                        'familyMemberId': caseData.familyMemberId
                    }).count().then(function(countofcase2) {
                        console.log("countofcase2->"+countofcase2);
                    
                    /*LIMIT DATA*/
                    Limits.find().then(function(LimitData) {
                        var caseLimit = LimitData[0].caseLimit
                        var followLimit = LimitData[0].followLimit

                        var flag = 2;
                        if (caseData.familyMemberId!=null) {
                            flag=1;
                        } else{
                            flag=2;
                        };
                    

                        if (flag==2 && countofcase1>=caseLimit) {
                            if(req.body.status == "unassigned")
                            {
                                res.json({
                                    'success': false,
                                    'msg': "Thanks for using our service. You have reached your limit to ask Opinion. Please wait for the full release of the product to ask more opinions."
                                });
                                return;
                            }
                        } else{
                            if (countofcase2>=caseLimit) {
                                if(req.body.status == "unassigned")
                                {
                                    res.json({
                                        'success': false,
                                        'msg': "Thanks for using our service. You have reached your limit to ask Opinion. Please wait for the full release of the product to ask more opinions."
                                    });
                                    return;
                                }   
                            } 
                        };

                        var mail_receiver = caseData.userId.email;
                        var mail_receiver_name = caseData.userId.fullname;
                        var case_no = caseData.caseNo;

                        delete req.body.caseId;
                        var updatedCaseData = _.merge(caseData, req.body);
                        // console.log("case after merge in update"+updatedCaseData);
                        updatedCaseData.updatedAt = config.currentTimestamp;
                        updatedCaseData.save(function(err, data) {
                        // console.log("case after save in update"+data);
                            if (err) {
                                res.json({
                                    success: false,
                                    msg: "failed to update case"
                                });
                                return;
                            } else {
                                if (req.body.priceId){
                                    var subject = case_email.case_update_success.case_update_title;
                                    //----------email template code--------
                                    var case_data = {
                                        to : mail_receiver.toLowerCase(),
                                        subject :  subject,
                                        template : 'case_submitted.ejs',
                                        content : {
                                            first_name : mail_receiver_name,
                                            case_no : case_no,
                                            base_url : CONSTANTS.baseUrl
                                        }
                                    };
                                    config.sendEmailTemplate(case_data);
                                    //---------------
                                }
                                var userSession = new UserSession({
                                    'userId': data.userId,
                                    'apiName': "User update the case"
                                });
                                userSession.save(function(er, db) {
                                    res.json({
                                        success: true,
                                        msg: "Case updated successfully",
                                        data: data
                                    });
                                    return;
                                })
                            }
                        })
                        
                        }).catch(function(error){
                            res.json({
                                'success': false,
                                'msg': ""
                            });
                            return;
                        });
                        return;
                        /*LIMIT DATA END*/
                    }).catch(function(error){
                        res.json({
                            'success': false,
                            'msg': ""
                        });
                    });
                    return;
                }).catch(function(error){
                    res.json({
                        'success': false,
                        'msg': ""
                    });
                    return;
                });
            }).catch(function(error) {
                res.json({
                    success: false,
                    msg: "Please enter valid case Id"
                });
                return;
            })
        } else {
            if (req.files.length>0||req.files!=undefined||req.files!=null||req.files!="") {
                var originalName = req.files[0].filename;
                // console.log("file uploading");
                // console.log("updatePhoto"+originalName);
                documents[0]=originalName;
                Case.findOne({
                    '_id': caseId
                }).populate('userId').then(function(caseData) {
                    // console.log("1-"+caseData);
                    delete req.body.caseId;
                    // console.log(doctorId);
                    // return;
                    // if (req.body.doctorId == null){
                    //     delete req.body.doctorId;
                    // }
                    var updatedCaseData = _.merge(caseData, req.body);
                    // console.log("2-"+updatedCaseData);
                    if (documents.length > 0) {
                        updatedCaseData.documents.push(documents);
                    }
                    updatedCaseData.updatedAt = config.currentTimestamp;
                    // console.log("3-"+updatedCaseData);
                    updatedCaseData.save(function(err, data) {
                        // console.log("err->"+err);
                        // console.log("case after save in update->"+data);
                        if (err) {
                            res.json({
                                success: false,
                                msg: "failed to update case"
                            });
                            return;
                        } else {
                            var userSession = new UserSession({
                                'userId': data.userId,
                                'apiName': "User update the case"
                            });
                            userSession.save(function(er, db) {
                                res.json({
                                    success: true,
                                    msg: "Case updated successfully",
                                    data: data
                                });
                                return;
                            })
                        }
                    })
                }).catch(function(error) {
                    res.json({
                        success: false,
                        msg: "Please enter valid case Id"
                    });
                    return;
                })
            }else{
                Case.findOne({
                    '_id': caseId
                }).populate('userId').then(function(caseData) {
                    delete req.body.caseId;
                        // console.log("CaseData"+caseData);
                    var updatedCaseData = _.merge(caseData, req.body);
                        // console.log("case after merge in update"+updatedCaseData);
                    updatedCaseData.updatedAt = config.currentTimestamp;
                    updatedCaseData.save(function(err, data) {
                        // console.log("case after save in update"+data);
                        if (err) {
                            res.json({
                                success: false,
                                msg: "failed to update case"
                            });
                            return;
                        } else {
                            var userSession = new UserSession({
                                'userId': data.userId,
                                'apiName': "User update the case"
                            });
                            userSession.save(function(er, db) {
                                res.json({
                                    success: true,
                                    msg: "Case updated successfully",
                                    data: data
                                });
                                return;
                            })
                        }
                    })
                }).catch(function(error) {
                    res.json({
                        success: false,
                        msg: "Please enter valid case Id3"
                    });
                    return;
                })
            }
        }     
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

/*
 * Delete Documents Photos
 * created by - Aniket Meshram;
 */
router.post('/deleteDocuments', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var caseId = req.body.caseId;
        var indexId = req.body.indexId;
        console.log("indexId"+indexId);
  
        Case.findOne({'_id': caseId}).then(function(caseData) {
            // console.log("caseData->"+caseData);
            // return;
            caseData.documents.splice(indexId,1);
            var photo = caseData.documents[indexId];
            console.log("deleteDocPIC->"+photo);
            
            if (photo!=undefined) {
                fs.unlink('./public/uploads/userDocuments/' + photo);
            } else{
                console.log('no file');
            };
            
            Case.update({'_id': caseId},{$set : {"documents" : caseData.documents}}).then(function(caseData1) {
                // console.log("caseData.length->"+caseData.documents.length);
                if (caseData1) {
                    var userSession = new UserSession({
                        'userId': caseData.userId,
                        'apiName': "Delete Documents Api"
                    });
                    userSession.save(function(er, db) {
                        res.json({
                            success: true,
                            msg: "Fetched deleting Documents successfully",
                            data: caseData
                        });
                    })
                } else {
                    res.json({
                        success: false,
                        msg: "Failed to get Deleting Documents record"
                    })
                }
            }).catch(function(error) {
                console.log(error);
                res.json({
                    success: false,
                    msg: "Failed to get case data"
                })
            })
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Failed to get case data"
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
 * Delete Case
 * created by - Aniket Meshram;
 */
router.post('/deleteCase', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var caseId = req.body.caseId;
        Case.findOneAndRemove({_id: caseId},function(err, data) {
            if (err) {
                res.json({
                'success': false,
                'msg': "Something went wrong while deleting case"
                })
            } else {
                res.json({
                'success': true,
                'msg': "case deleted successfully"
                })
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

/*
Input parameter : caseId
Description: Get particular case of user
*/
router.post('/getCase', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        //var isAnonymous = req.body.isAnonymous;
        Case.findOne({
            '_id': req.body.caseId
        }).populate('userId', "-password").populate('familyMemberId').populate('doctorId').exec().then(function(caseInfo) {
           // console.log("caseInfo.ID"+caseInfo);
            CaseQuery.findOne({'caseId':caseInfo._id}).exec().then(function(CaseQueryInfo) {
                    // console.log("CaseQueryInfo"+CaseQueryInfo.queries);
                    var getQueries = CaseQueryInfo.queries;
                    var temp_arr = JSON.parse(JSON.stringify(caseInfo));
                    // console.log(temp_arr);
                    temp_arr.QuesAns = [];
                    temp_arr.QuesAns = getQueries;
                    // console.log(temp_arr);
                
                if (temp_arr != null) {
                    // console.log("temp_arr.documents"+temp_arr.documents);
                    if (temp_arr.documents.length) {
                        for (var i = 0; i < temp_arr.documents.length; i++) {
                            if (temp_arr.documents[i]!= null && temp_arr.documents[i]!= undefined && temp_arr.documents[i]!= "") {
                                var picture = CONSTANTS.baseUrl + getDocument + temp_arr.documents[i];
                                temp_arr.documents[i] = picture;
                            }
                        }
                    }
                    if (temp_arr.userId.photo.length) {
                        if (temp_arr.userId.photo != null) {
                            var picture = CONSTANTS.baseUrl + getImage + temp_arr.userId.photo.replace((CONSTANTS.baseUrl + getImage), "");
                            temp_arr.userId.photo = picture;
                        }
                    }
                        // console.log("->"+temp_arr.doctorId.practice_photos.length);

                    if (temp_arr.doctorId != null) {
                        if (temp_arr.doctorId.practice_photos.length) {
                            for (var i = 0; i < temp_arr.doctorId.practice_photos.length; i++) {
                                if (temp_arr.doctorId.practice_photos[i] != null && temp_arr.doctorId.practice_photos[i] != undefined && temp_arr.doctorId.practice_photos[i] != "") {
                                    var picture = CONSTANTS.baseUrl + getPracticePhotos + temp_arr.doctorId.practice_photos[i];
                                    temp_arr.doctorId.practice_photos[i] = picture;
                                }
                            }
                        }
                    }
                    // .replace((CONSTANTS.baseUrl + getImage), "");
                    if (temp_arr.familyMemberId != null) {
                        if (temp_arr.familyMemberId.photo.length) {
                            if (temp_arr.familyMemberId.photo != null) {
                                var picture = CONSTANTS.baseUrl + getDependentImage + temp_arr.familyMemberId.photo.replace((CONSTANTS.baseUrl + getImage), "");
                                temp_arr.familyMemberId.photo = picture;
                            }
                        }
                    }
                    if (temp_arr.doctorId != null) {
                        if (temp_arr.doctorId.photo.length) {
                            if (temp_arr.doctorId.photo != null) {
                                var picture = CONSTANTS.baseUrl + getImage + temp_arr.doctorId.photo.replace((CONSTANTS.baseUrl + getImage), "");
                                temp_arr.doctorId.photo = picture;
                            }
                        }
                    }
                    var userSession = new UserSession({
                        'userId': temp_arr.userId,
                        'apiName': "User viewed the case"
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
                        msg: "Case fetched successfully",
                        data: temp_arr
                    })
                } else {
                    res.json({
                        success: false,
                        msg: "Please enter valid case Id"
                    })
                }
            }).catch(function(error) {
                res.json({
                    success: false,
                    msg: "Failed to fetched CaseQueryInfo"
                })
            })

        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Failed to fetched case"
            })
        })

    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication Failed"
        })
    })
})

/*
Input parameter : isDraft,userId
Description: Get only user's draft cases
*/
router.post('/getUserDraftCases', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;
        var isDraft = req.body.isDraft;
        Case.find({
            'userId': userId,
            'isDraft': isDraft
        }).sort({'updatedAt':-1}).then(function(userCaseInfo) {
            /*.populate('userId', "-password").populate('familyMemberId').exec()*/
            if (userCaseInfo) {
                var userSession = new UserSession({
                    'userId': userId,
                    'apiName': "User viewed the draft cases"
                });
                userSession.save(function(er, db) {
                    if (er) {
                        res.json({
                            'success': false,
                            'msg': "Failed to add user session data"
                        })
                    }
                })
                res.json({
                    success: true,
                    msg: "Fetched user draft cases successfully",
                    data: userCaseInfo
                })
            } else {
                res.json({
                    success: false,
                    msg: "Failed to fetch user draft cases"
                })
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Please enter valid case Id"
            })
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

/*
Input parameter : isDraft,userId
Description: Get user's cases by the status
*/
router.post('/getCasesByStatus', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var status = req.body.status;
        var doctorId = req.body.doctorId;
        var userId = req.body.userId;
        var search = {};

        if (req.body.doctorId != null || req.body.doctorId != undefined) {
            search.doctorId = req.body.doctorId;
        }

        if (req.body.userId != null || req.body.userId != undefined) {
            search.userId = req.body.userId;
        }
        if (req.body.status != null || req.body.status != undefined) {
            search.status = req.body.status
        }

        //User.findOne(search).then(function(doctorInfo) {
        // if (doctorInfo != null) {
        Case.find(search
            /*{
                        'status': status,
                        'physicainReviewer': doctorInfo.doctor_specialization
                    }*/
        ).sort({'updatedAt': -1}).then(function(cases) {
            if (cases) {
                var userSession = new UserSession({
                    'userId': result.userId,
                    'apiName': "User get the all cases"
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
                    msg: "User cases fetched by status successfully",
                    data: cases
                })
            } else {
                res.json({
                    'success': false,
                    'msg': "User dont have any case by this status"
                })
            }
        }).catch(function(error) {
            res.send({
                success: false,
                mag: "Something went wrong while fetching the case by status"
            })
        });
        /* } else {
             res.json({
                 success: false,
                 msg: "Doctor not found"
             })
         }*/
    }).catch(function(error) {
        console.log(error);
        res.json({
                success: false,
                msg: "Something went wrong while fetching doctor specialization"
            })
            // })
    }).catch(function(error) {
        res.send({
            success: false,
            msg: "Authentication failed"
        })
    });
})

/*
Input parameter : userId
Description: Get all cases of user
*/
router.post('/getAllCases', function(req, res, next) {
    var token = req.headers['accesstoken'];

    jwtAuth.checkAuth(token).then(function(result) {
        Case.find({'userId': req.body.userId}).populate('userId').populate('familyMemberId').populate('doctorId').skip(req.body.offset).limit(20).sort({'updatedAt': -1}).then(function(data) {
            
            var casesList = [];
            if (data.length > 0) {
                var count = 0;
                i=0;
                data.forEach(function(usercase) {
                    
                    var temp_arr = JSON.parse(JSON.stringify(usercase));
                    temp_arr.QuesAns = [];
                    
                    CaseQuery.findOne({'caseId':usercase._id}).exec().then(function(CaseQueryInfo) {
                    
                        var getQueries = CaseQueryInfo.queries;
                        temp_arr.QuesAns = getQueries;
                        
                        if (temp_arr.documents.length) {
                            for (var i = 0; i < temp_arr.documents.length; i++) {
                                if (temp_arr.documents[i]!= null && temp_arr.documents[i]!= undefined && temp_arr.documents[i]!= "") {
                                    var picture = CONSTANTS.baseUrl + getDocument + temp_arr.documents[i];
                                    temp_arr.documents[i] = picture;
                                }
                            };
                        }
                        if (temp_arr.userId.photo.length) {
                            if (temp_arr.userId.photo != null) {
                                var picture = CONSTANTS.baseUrl + getImage + temp_arr.userId.photo.replace((CONSTANTS.baseUrl + getImage), "");
                                temp_arr.userId.photo = picture;
                            }
                        }
                        if (temp_arr.doctorId != null) {
                            if (temp_arr.doctorId.practice_photos.length) {
                                for (var i = 0; i < temp_arr.doctorId.practice_photos.length; i++) {
                                    if (temp_arr.doctorId.practice_photos[i] != null && temp_arr.doctorId.practice_photos[i] != undefined && temp_arr.doctorId.practice_photos[i] != "") {
                                        var picture = CONSTANTS.baseUrl + getPracticePhotos + temp_arr.doctorId.practice_photos[i];
                                        temp_arr.doctorId.practice_photos[i] = picture;
                                    }
                                }
                            }
                        }
                        if (temp_arr.familyMemberId != null) {
                            if (temp_arr.familyMemberId.photo.length) {
                                if (temp_arr.familyMemberId.photo != null) {
                                    var picture = CONSTANTS.baseUrl + getDependentImage + temp_arr.familyMemberId.photo.replace((CONSTANTS.baseUrl + getDependentImage), "");
                                    temp_arr.familyMemberId.photo = picture;
                                }
                            }
                        }
                        
                        casesList.push(temp_arr);
                        // console.log(casesList);
                        count = count + 1;
                       
                        if (count == data.length) {
                            
                            var userSession = new UserSession({
                                'userId': result.userId,
                                'apiName': "User get the all cases"
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
                                'success': true,
                                'msg': "Get all cases fetched successfully",
                                'data': casesList
                            })
                        }

                    }).catch(function(error) {
                        res.json({
                            success: false,
                            msg: "Failed to fetched CaseQueryInfo"
                        })
                    })

                })
            } else {
                res.json({
                    'success': false,
                    'msg': "No cases "
                })
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                'success': false,
                'msg': "Something went wrong while fetching get all case"
            })
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

/*
Input parameter : doctorId
Description: Get all  cases of user for Doctor according to his specialization
*/
router.post('/getCaseByDrSpecialization', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var doctorId = req.body.userId;
        User.findOne({'_id': doctorId}).sort({'updatedAt': -1}).then(function(userData) {
            // console.log("userData"+userData);
            if (userData != null) {
                if (userData.doctor_specialization != null) {
                    Case.find({
                        $or: [{
                            $and:[
                            {
                                'physicainReviewer': userData.doctor_specialization
                            },
                            {
                                'status':"unassigned"
                            }
                            // ,
                            // {
                            //     'doctorId': {$exists:false}    
                            // }
                            ]
                        }, {
                                'doctorId': doctorId    
                            } //,'paymentStatus':success
                        ]
                    }).populate('userId').populate('familyMemberId').skip(req.body.offset).limit(20).sort({'updatedAt': -1}).then(function(doctorCases) {
                        if (doctorCases) {
                            doctorCases.forEach(function(userCase) {
                                if(userCase.doctorstatus=='received'){
                                    userCase.status='received';
                                }
                                 if(userCase.doctorstatus=='completed'){
                                    userCase.status='completed';
                                }
                                if(userCase.userId){
                                    if (userCase.userId.photo != null) {
                                        if (userCase.userId.photo.length) {
                                            var picture = CONSTANTS.baseUrl + getImage + userCase.userId.photo.replace((CONSTANTS.baseUrl + getImage), "");
                                            userCase.userId.photo = picture;
                                        }
                                    }
                                }
                                if (userCase.familyMemberId != null) {
                                    if (userCase.familyMemberId.photo.length) {
                                        if (userCase.familyMemberId.photo != null) {
                                            var picture = CONSTANTS.baseUrl + getDependentImage + userCase.familyMemberId.photo.replace((CONSTANTS.baseUrl + getDependentImage), "");
                                            userCase.familyMemberId.photo = picture;
                                        }
                                    }
                                }
                                if ((userCase.documents != null) && (userCase.documents != undefined) && (userCase.documents != []) && (userCase.documents != '')) {
                                    if (userCase.documents.length > 0) {
                                        var docs = []
                                        var count = 0;

                                        userCase.documents.forEach(function(doc) {
                                            var picture = CONSTANTS.baseUrl + getDocument + doc.replace((CONSTANTS.baseUrl + getDocument), "");
                                            doc = picture;
                                            docs.push(doc);
                                            count = count + 1;
                                            if (count == userCase.documents.length) {
                                                userCase.documents = docs;
                                            }
                                        })
                                    }
                                }
                            })
                            var userSession = new UserSession({
                                'userId': result.userId,
                                'apiName': "Doctor viewed all cases"
                            });
                            userSession.save(function(er, db) {
                                if (er) {
                                    res.json({
                                        'success': false,
                                        'msg': "failed to add user session data"
                                    })
                                } else {
                                    res.json({
                                        'success': true,
                                        'msg': "Get all cases by doctor specialization successfully",
                                        'data': doctorCases
                                    })
                                }
                            })

                        } else {
                            res.json({
                                'success': false,
                                'msg': "No cases for doctor"
                            })
                        }
                    })
                } else {
                    res.json({
                        'success': false,
                        'msg': "Doctor does not have specialization"
                    })
                }
            } else {
                res.json({
                    'success': false,
                    'msg': "User doen not exist"
                })
            }
        })
    }).catch(function(error) {
        res.json({
            'success': false,
            'msg': "Authentication failed"
        })
    })
})

router.post('/closeCase',function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var caseId = req.body.caseId;
        var isClosed = req.body.isClosed;
        req.body.status = "completed";
        req.body.closedDate = config.currentTimestamp;
        if (isClosed==true|| isClosed=="true") {
            Case.findOne({'_id': caseId}).populate('userId').then(function(caseData) {
                var mail_receiver = caseData.userId.email;
                var case_no = caseData.caseNo;

                delete req.body.caseId;
                var updatedCaseData = _.merge(caseData, req.body);
                updatedCaseData.updatedAt = config.currentTimestamp;
                updatedCaseData.save(function(err, data) {
                    
                    if (err) {
                        res.json({
                            success: false,
                            msg: "failed to close case"
                        })
                    } else {
                        // var text = case_email.congo + '\n\n' +
                        //             case_email.close_case.case1 +''+ case_no +'\n\n'+  case_email.close_case.case2 ;
                        //     var subject = case_email.close_case.close_case_title;
                            
                        //     config.sendMail(mail_receiver.toLowerCase(), text, subject).then(function(result, error) {
                        //     if (error) {
                        //         console.log(error);
                        //     }
                        // });
                        var userSession = new UserSession({
                            'userId': data.userId,
                            'apiName': "User close the case"
                        });
                        userSession.save(function(er, db) {
                            res.json({
                            success: true,
                            msg: "Case Closed successfully",
                            data: data
                            });
                            return;
                        });                        
                    }
                })
            }).catch(function(error) {
                res.json({
                    success: false,
                    msg: "Please enter valid case Id"
                });
            })
        } else{
            res.json({
                success: false,
                msg: "Please provide Closed flag"
            })
        }
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})


module.exports = router;