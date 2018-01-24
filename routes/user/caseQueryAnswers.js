var express = require('express');
var router = express.Router();
var jwtAuth = require(appRoot + '/libs/jwtAuth');
const CONSTANTS = require(appRoot + '/Constants/constant');
var Case = require(appRoot + '/models/op_cases');
var DoctorOpinion = require(appRoot + '/models/op_doctorOpinion');
var CaseQueryAnswer = require(appRoot + '/models/op_caseQueryAnswers');

var UserSession = require(appRoot + '/models/op_userSession');
var config = require(appRoot + '/libs/config');
var priceOptions = require(appRoot + '/models/op_prices');
var followUp_mail = require(appRoot + '/message.json'); 
var pushNotification = require(appRoot + '/push_notification');
var _ = require('lodash');
var Limits = require(appRoot + '/models/op_limits');

/*
Input Parameter :caseId,Query
Description: Add user question when he ask for follow up the question
*/
router.post('/addQuery', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var answer = req.body.answer;
        var caseId = req.body.caseId;
        
        CaseQueryAnswer.findOne({
            'caseId': caseId
        }).populate('userId').populate('doctorId').populate('caseId').exec().then(function(caseQueryInfo) {
            // console.log("caseQueryInfo"+caseQueryInfo);
            // return
            var mail_to_patient = caseQueryInfo.userId.email;
            var patient_name    = caseQueryInfo.userId.fullname;
            var mail_to_doctor  = caseQueryInfo.doctorId.email;
            var doctor_name     = caseQueryInfo.doctorId.fullname;
            var case_no         = caseQueryInfo.caseId.caseNo;

        var insertData={};
        if(req.body.query)
        {
            var query       = req.body.query;
            var paymentId   = req.body.paymentId;
            var amount      = req.body.amount;
            var priceId     = req.body.priceId;
            var priceType   = req.body.priceType;
           
            if(req.body.query)
                insertData.query = req.body.query;
            
            if(req.body.paymentId)
                insertData.paymentId = req.body.paymentId;
            
            if(req.body.amount)
                insertData.amount = req.body.amount;
            
            if(req.body.priceId)
                insertData.priceId = req.body.priceId;
            
            if(req.body.priceType)
                insertData.priceType = req.body.priceType;
            
            insertData.queryTime = config.currentTimestamp;
            //insertData=JSON.stringify(insertData);
        }
        else
        {
            console.log('send query');
        }
            if (caseQueryInfo) {
                
                if(query){
                    console.log("caseQueryInfo.queries.length",caseQueryInfo.queries.length)

                    /*LIMIT DATA*/
                    Limits.find().then(function(LimitData) {
                        var caseLimit = LimitData[0].caseLimit
                        var followLimit = LimitData[0].followLimit
                    
                        if (caseQueryInfo.queries.length < followLimit) {
                            console.log("we are here")

                            Case.findOneAndUpdate({
                                '_id': req.body.caseId
                            }, {
                                $set: {
                                    doctorstatus: 'received',
                                    status: 'completed',
                                    updatedAt: config.currentTimestamp,
                                    completedDate: config.currentTimestamp
                                }
                            }, {
                                'new': true
                            }).exec().then(function(caseStatus) {
                               
                            })
                            caseQueryInfo.queries.push(insertData);
                            
                            caseQueryInfo.save(function(err, data) {
                                console.log("we are here 2")
                                if (err) {
                                    res.json({
                                        success: false,
                                        msg: "Something went wrong while adding query"
                                    });
                                    return;
                                }else{
                                    //-------follow up question submitted
                                    var subject = followUp_mail.follow_ques_mail.follow_ques_title_submit;
                                    //----------email template code--------
                                    var follow_up_ques_submit = {
                                        to : mail_to_patient.toLowerCase(),
                                        subject :  subject,
                                        template : 'follow_up_ques_submit.ejs',
                                        content : {
                                                first_name : patient_name,
                                                case_no : case_no,
                                                base_url : CONSTANTS.baseUrl
                                            }
                                    };
                                    config.sendEmailTemplate(follow_up_ques_submit);
                                    //--------follow up question received --------
                                    var subject = followUp_mail.follow_ques_mail.follow_ques_title;
                                    //----------email template code--------
                                    var follow_up_ques_received = {
                                        to : mail_to_doctor.toLowerCase(),
                                        subject :  subject,
                                        template : 'follow_up_ques_received.ejs',
                                        content : {
                                                first_name : doctor_name,
                                                case_no : case_no,
                                                base_url : CONSTANTS.baseUrl
                                            }
                                    };
                                    config.sendEmailTemplate(follow_up_ques_received);
                                    //--------------------------
                                    var pushDeviceTokens = [];
                                    var deviceTokens = caseQueryInfo.doctorId.deviceTokens;
                                    for (var i = 0; i < deviceTokens.length; i++) {
                                        pushDeviceTokens.push(deviceTokens[i].device_token);
                                    };
                                    //------Push Notification on followup question to doctor-----------
                                    var pushTitle = 'You got a new followup question on case no #'+case_no;
                                    var pushBody = req.body.query;
                                    var pushCustoms = {
                                          sender: 'followUpQuestionReceived'
                                    }
                                    // if (pushDeviceTokens!=undefined) {
                                    //     pushNotification.sendPushNotification(pushTitle, pushBody,pushDeviceTokens,pushCustoms,function(error, callback) {
                                    //         if (error) {
                                    //             console.log(error);
                                    //         }
                                    //         else
                                    //         {
                                    //             console.log(callback);
                                    //         }
                                    //     });
                                    // }
                                    //----------------------------------------------------------------
                                    var userSession = new UserSession({
                                        'userId': result.userId,
                                        'apiName': "Use case added to case query"
                                    });
                                    userSession.save(function(er, db) {
                                        res.json({
                                            success: true,
                                            msg: "User question added successfully in case query",
                                            data: caseQueryInfo
                                        });
                                        return;
                                    })
                                }
                            })
                        }else{
                            console.log("we are here 3");
                            res.json({
                                'success': false,
                                'msg': "Thanks for using our service. You have reached your limit to ask follow up question. Please wait for the full release of the product to ask more opinions."
                            });
                            return;
                        }

                    }).catch(function(error){
                        res.json({
                            'success': false,
                            'msg': ""
                        });
                        return
                    });
                    return;
                    /*LIMIT DATA END*/
                }else{
                    var allqueries = caseQueryInfo.queries;
                    var allqueries_length = allqueries.length;
                    
                    var pushDeviceTokens = [];
                    var deviceTokens = caseQueryInfo.userId.deviceTokens;
                    for (var i = 0; i < deviceTokens.length; i++) {
                        pushDeviceTokens.push(deviceTokens[i].device_token);
                    };

                    insertData = allqueries[allqueries_length-1];
                     Case.findOneAndUpdate({
                        '_id': req.body.caseId
                    }, {
                        $set: {
                            status: 'received',
                            doctorstatus: 'completed',
                            updatedAt: config.currentTimestamp,
                            receivedDate: config.currentTimestamp
                        }
                    }, {
                        'new': true
                    }).exec().then(function(caseStatus) {
                       
                    })
                    if(answer)
                    {
                        insertData.answer = req.body.answer;
                        insertData.answerTime = config.currentTimestamp;
                    }
                    
                    caseQueryInfo.save(function(err, data) {
                        if (err) {
                            console.log(err);
                            res.json({
                                success: false,
                                msg: "Something went wrong while adding query"
                            });
                            return;
                        }
                        else{
                            //-----------------
                            //follow up ans submitted
                            // var text = followUp_mail.follow_ans_mail.follow_ans_body_submit + ' # ' + 
                            //     case_no;
                            
                            // var subject = followUp_mail.follow_ans_mail.follow_ans_title_submit;
                            
                            // config.sendMail(mail_to_doctor.toLowerCase(), text, subject).then(function(result, error) {
                            //     if (error) {
                            //         console.log(error);
                            //     }
                            // });
                            //follow up ans received
                            // var text = followUp_mail.follow_ans_mail.follow_ans_body + ' # ' + 
                                // case_no;
                            
                            var subject = followUp_mail.follow_ans_mail.follow_ans_title;
                            
                            // config.sendMail(mail_to_patient.toLowerCase(), text, subject).then(function(result, error) {
                                // if (error) {
                                    // console.log(error);
                                // }
                            // });
                            //----------email template code--------
                            var follow_up_ans_received = {
                                to : mail_to_patient.toLowerCase(),
                                subject :  subject,
                                template : 'follow_up_ans_received.ejs',
                                content : {
                                        first_name : patient_name,
                                        case_no : case_no,
                                        base_url : CONSTANTS.baseUrl
                                    }
                            };
                            config.sendEmailTemplate(follow_up_ans_received);
                            //---------------
                            //------Push Notification on followup answer to patient-----------
                            var pushTitle = 'Check answer on follow question';
                            var pushBody = req.body.answer;
                            var pushCustoms = {
                                  sender: 'followUpAnswerSubmitted'
                            }
                            // if (pushDeviceTokens!=undefined) {
                            //     pushNotification.sendPushNotification(pushTitle, pushBody,pushDeviceTokens,pushCustoms,function(error, callback) {
                            //         if (error) {
                            //             console.log(error);
                            //         }
                            //         else
                            //         {
                            //             console.log(callback);
                            //         }
                            //     });
                            // }
                            //----------------------------------------------------------------
                            var userSession = new UserSession({
                                'userId': result.userId,
                                'apiName': "Use case added to case query"
                            });
                            userSession.save(function(er, db) {
                                if (er) {
                                    res.json({
                                        'success': false,
                                        'msg': "failed to add user session data"
                                    });
                                    return;
                                }
                                else{
                                    res.json({
                                        success: true,
                                        msg: "User answer added successfully in case query",
                                        data: caseQueryInfo
                                    });
                                    return;
                                }
                            })
                        }
                    })
                }                   
            } else {
                res.json({
                    success: false,
                    msg: "failed to add user query in case query"
                })
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Something went wrong adding user query in caseQuery"
            })
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
Input Parameter:caseId
Description : Get the user question and doctor reply of particular case
*/
router.post('/getCaseQueryAnswers', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        CaseQueryAnswer.findOne({'caseId': req.body.caseId}).populate('doctorOpinionId').populate('caseId').exec().then(function(caseQueryData) {
            // console.log("caseQueryData"+caseQueryData);
            priceOptions.findOne({'type': '2'}).then(function(priceOptionsResult) {
            // console.log("priceOptionsResult"+caseQueryData);
                if (caseQueryData) {
                    // console.log("-->"+caseQueryData.priceType);
                    // console.log("----->"+caseQueryData.queries.length);

                    if(caseQueryData.caseId.priceType=='0') //0: ONLY OPINION, 1= OPINION PLUS FOLLOWUP, 2= ONLY FOLLOWUP
                    {
                        followup = 1;
                    }
                    else if(caseQueryData.caseId.priceType=='1' && caseQueryData.queries.length>0)
                    {
                        followup = 1;
                    }
                    else
                    {
                        followup = 0;
                    }
                    //caseQueryData.followupPrice=1999;
                    var userSession = new UserSession({
                        'userId': result.userId,
                        'apiName': "User viewed all queries and answers"
                    });
                    userSession.save(function(er, db) {
                            res.json({
                                success: true,
                                msg: "Fetched user case query and answers successfully",
                                data: caseQueryData,
                                followupPrice:followup,
                                followupQuestionDetails:priceOptionsResult
                            });
                            return;                        
                    });                
                } else {
                    res.json({
                        success: false,
                        msg: "failed to fetched case query and answer"
                    });
                    return;
                }
            });
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

module.exports = router;