var express = require('express');
var router = express.Router();
var User = require(appRoot + '/models/op_users');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var Case = require(appRoot + '/models/op_cases');
var DoctorOpinion = require(appRoot + '/models/op_doctorOpinion');
var _ = require('lodash');
var CaseQuery = require(appRoot + '/models/op_caseQueryAnswers');
var config = require(appRoot + '/libs/config');
var getImage = 'uploads/users/';
var getPracImage = 'uploads/practice_photos/';
var getDocImage = 'uploads/userDocuments/';
const CONSTANTS = require(appRoot + '/Constants/constant');
var UserSession = require(appRoot + '/models/op_userSession');
var priceOptions = require(appRoot + '/models/op_prices');
var op_email = require(appRoot + '/message.json'); 
var pushNotification = require(appRoot + '/push_notification');
/*
Input Parameter :doctorId,caseId,opinionSummery,furtherStudies,therapaticSuggestions,recommendedSpecialists
Description: Doctor gives the opinion when user demand for seek opinion
*/
router.post('/addOpinion', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        if (req.body.opinionId == null || req.body.opinionId == undefined) {
            var doctorOpinion = new DoctorOpinion({
                doctorId: req.body.doctorId,
                caseId: req.body.caseId,
                opinionSummery: req.body.opinionSummery,
                furtherStudies: req.body.furtherStudies,
                therapaticSuggestions: req.body.therapaticSuggestions,
                recommendedSpecialists: req.body.recommendedSpecialists
            });
            doctorOpinion.save(function(err, data) {
                // console.log("data->"+data);
                if (err) {
                    res.json({
                        success: false,
                        msg: "Failed to save doctor opinion"
                    });
                    return;
                } else {
                    CaseQuery.findOne({
                        'caseId': req.body.caseId
                    }).populate('userId').populate('caseId').then(function(caseInfo) {
                        // console.log("addOpinion 1"+caseInfo);
                        DoctorOpinion.findOne({
                            'caseId': req.body.caseId
                        }).populate('doctorId').then(function(updateDoctorOpinion) {
                            // console.log("addOpinion 2"+updateDoctorOpinion);

                            var mail_to_patient = caseInfo.userId.email;
                            var patient_name = caseInfo.userId.fullname;
                            var mail_to_doctor = updateDoctorOpinion.doctorId.email;
                            var doctor_name = updateDoctorOpinion.doctorId.fullname;
                            var case_no = caseInfo.caseId.caseNo;

                            var deviceToken = [];
                            var deviceTokens = caseInfo.userId.deviceTokens;
                            for (var i = 0; i < deviceTokens.length; i++) {
                                deviceToken.push(deviceTokens[i].device_token);
                            };
                            if (caseInfo) {
                                var case1 = {
                                    'doctorOpinionId': data._id,
                                    'doctorId': data.doctorId
                                };
                                var updatedCaseQuery = _.merge(caseInfo, case1);
                                
                                updatedCaseQuery.save(function(err, info) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            msg: "Failed to add doctor opinion in case query"
                                        })
                                    } else {
                                        //send mail to patient
                                        var subject = op_email.op_rcv.rcv_op_title;
                                        //----------email template code--------
                                        var opinion_received = {
                                            to : mail_to_patient.toLowerCase(),
                                            subject :  subject,
                                            template : 'opinion_received.ejs',
                                            content : {
                                                first_name : patient_name,
                                                case_no : case_no,
                                                base_url : CONSTANTS.baseUrl
                                            }
                                        };
                                        config.sendEmailTemplate(opinion_received);
                                        //---------------

                                        //----------------------------------------
                                        //send mail to doctor
                                        var subject = op_email.op_given.doc_op_title;
                                      
                                        //----------email template code--------
                                        // var opinion_given = {
                                        //     to : mail_to_doctor.toLowerCase(),
                                        //     subject :  subject,
                                        //     template : 'opinion_given.ejs',
                                        //     content : {
                                        //             first_name : doctor_name,
                                        //             case_no : case_no,
                                        //             base_url : CONSTANTS.baseUrl
                                        //         }
                                        // };
                                        // config.sendEmailTemplate(opinion_given);
                                        //---------------
                                        //push notification-------------------
                                        var pushTitle = 'Got new opinion';
                                        var pushBody = 'Received opinion for case no #'+case_no;
                                        var pushDeviceTokens = deviceToken;
                                        var pushCustoms = {
                                              sender: 'opinionSubmitted'
                                        }
                                        // console.log("request ",pushDeviceTokens);
                                        // if (pushDeviceTokens!=undefined&&pushDeviceTokens!=null&&pushDeviceTokens!="") {
                                        //     pushNotification.sendPushNotification(pushTitle, pushBody,pushDeviceTokens,pushCustoms,function(error, callback) {
                                        //         if (error) {
                                        //             console.log(error);
                                        //         }
                                        //         else
                                        //         {
                                        //             console.log("response",JSON.stringify(callback));
                                        //         }
                                        //     });
                                        // }
                                        
                                        //----------------------------------------
                                        var userSession = new UserSession({
                                            'userId': result.userId,
                                            'apiName': "Doctor gave opinion"
                                        });
                                        userSession.save(function(er, db) {
                                            
                                            Case.findOneAndUpdate({
                                                '_id': req.body.caseId
                                            }, {
                                                $set: {
                                                    doctorstatus: 'completed',
                                                    status: 'received',
                                                    updatedAt: config.currentTimestamp,
                                                    completedDate: config.currentTimestamp,
                                                    receivedDate: config.currentTimestamp
                                                }
                                            }, {
                                                'new': true
                                            }).exec().then(function(caseStatus) {
                                                // console.log("addOpinion 2",caseStatus);

                                                if (caseStatus) {
                                                    res.json({
                                                        success: true,
                                                        msg: "Doctor opinion submitted successfully",
                                                        data: data
                                                    })
                                                } else {
                                                    res.json({
                                                        success: true,
                                                        msg: "Something went wrong while giving the opinion"
                                                    })
                                                }
                                            })
                                        })
                                    }
                                })
                            } else {
                                res.json({
                                    success: false,
                                    msg: "Failed to fetch case while adding doctor opinion"
                                });
                                return;
                            }
                        }).catch(function(error) {
                            res.json({
                                'success': false,
                                'msg': "Something went wrong while geting doctor opinion data"
                            });
                            return;
                        })
                    }).catch(function(error) {
                        res.json({
                            success: false,
                            msg: "Something went wrong to fetched case query in while adding doctor opinion"
                        });
                        return;
                    })
                }
            })
        } else {
            //If doctor edit his opinion (currently not in use code)
            DoctorOpinion.findOne({
                '_id': req.body.opinionId
            }).then(function(updateDoctorOpinion) {
                if (updateDoctorOpinion) {
                    var updateOpinion = _.merge(updateDoctorOpinion, req.body);
                    updateOpinion.save(function(error, data) {
                        if (error) {
                            res.json({
                                'success': false,
                                'msg': "Failed to update doctor opinion"
                            });
                            return;
                        } else {
                            res.json({
                                'success': true,
                                'msg': "Update doctor opinion successfully",
                                'data': data
                            });
                            return;
                        }
                    })
                }
            }).catch(function(error) {
                res.json({
                    'success': false,
                    'msg': "Something went wrong while updating doctor opinion"
                });
                return;
            })
        }
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

/*
Input Parameter: CaseId
Description :get the opinion details when doctor gave tha opinion 
*/
router.post('/getOpinionDetails', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var caseId = req.body.caseId;
        DoctorOpinion.findOne({'caseId': caseId}).populate('doctorId').populate('caseId').exec().then(function(opinionDetails) {
        
            priceOptions.findOne({'type': '2'}).then(function(priceOptionsResult) {

            if (opinionDetails) {
                console.log("opinionDetails"+opinionDetails.caseId.priceType);
                // 0: ONLY OPINION, 1= OPINION PLUS FOLLOWUP, 2= ONLY FOLLOWUP
                if(opinionDetails.priceType=='0')
                {
                    followup = 1;
                }
                else if(opinionDetails.caseId.priceType=='1')// && opinionDetails.queries.length>0
                {
                    followup = 1;
                }
                else
                {
                    followup = 0;
                }

                var userSession = new UserSession({
                    'userId': result.userId,
                    'apiName': "Doctor viewed opinion details"
                });
                userSession.save(function(er, db) {
                    
                    if (opinionDetails.doctorId.photo != null && opinionDetails.doctorId.photo != "" && opinionDetails.doctorId.photo != undefined) {
                        var picture = CONSTANTS.baseUrl + getImage + opinionDetails.doctorId.photo;
                        opinionDetails.doctorId.photo = picture;
                    }
                    for (var i = 0; i < opinionDetails.doctorId.practice_photos.length; i++) {
                        // opinionDetails.doctorId.practice_photos[i]
                        if (opinionDetails.doctorId.practice_photos[i] != null && opinionDetails.doctorId.practice_photos[i] != "" && opinionDetails.doctorId.practice_photos[i] != undefined) {
                        var picture = CONSTANTS.baseUrl + getPracImage + opinionDetails.doctorId.practice_photos[i];
                        opinionDetails.doctorId.practice_photos[i] = picture;
                        }
                    };
                    for (var i = 0; i < opinionDetails.caseId.documents.length; i++) {
                        // opinionDetails.caseId.documents[i]
                        if (opinionDetails.caseId.documents[i] != null && opinionDetails.caseId.documents[i] != "" && opinionDetails.caseId.documents[i] != undefined) {
                        var picture = CONSTANTS.baseUrl + getDocImage + opinionDetails.caseId.documents[i];
                        opinionDetails.caseId.documents[i] = picture;
                        }
                    };
                    
                    // console.log(opinionDetails);
                    res.json({
                        success: true,
                        msg: "fetched case doctor opinion successfully",
                        data: opinionDetails,
                        followupPrice : followup,
                        followupQuestionDetails : priceOptionsResult
                    });
                    return;
                })

            } else {
                res.json({
                    success: false,
                    msg: "Failed to fetch doctor opinion"
                })
            }
        });
        })//
    })
})

module.exports = router;