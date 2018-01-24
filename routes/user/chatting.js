var express = require('express');
var router = express.Router();
var CaseQueryAnswer = require(appRoot + '/models/op_caseQueryAnswers');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var Case = require(appRoot + '/models/op_cases');
var DoctorOpinion = require(appRoot + '/models/op_doctorOpinion');
var _ = require('lodash');
var UserSession = require(appRoot + '/models/op_userSession');

/*
Input Parameter :caseId,Query
Description: Add user question when he ask for follow up the question
*/
router.post('/addQuery', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var query = req.body.query;
        var caseId = req.body.caseId;
        CaseQueryAnswer.findOne({
            'caseId': caseId
        }).exec().then(function(caseQueryInfo) {
            if (caseQueryInfo) {
                caseQueryInfo.queries.push({
                    'query': req.body.query
                });
                caseQueryInfo.save(function(err, data) {
                    if (err) {
                        res.json({
                            success: false,
                            msg: "Something went wrong while adding query"
                        })
                    }
                    var userSession = new UserSession({
                        'userId': result.userId,
                        'apiName': "Use case added to case query"
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
                        msg: "User question added successfully in case query",
                        data: caseQueryInfo
                    })
                })

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
Input Parameter : answer,caseId
Description : Add doctor opinion or reply against that case for the user question
*/
router.post('/addAnswer', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var answer = req.body.answer;
        var caseId = req.body.caseId;
        CaseQueryAnswer.findOne({
            'caseId': caseId
        }).exec().then(function(caseQueryInfo) {
            if (caseQueryInfo) {
                caseQueryInfo.queries.push({
                    'answer': req.body.answer
                });
                caseQueryInfo.save(function(err, data) {
                    if (err) {
                        res.json({
                            success: false,
                            msg: "Something went wrong while adding query"
                        })
                    }
                    var userSession = new UserSession({
                        'userId': result.userId,
                        'apiName': "User answered on query"
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
                        msg: "User question added successfully in case query",
                        data: caseQueryInfo
                    })
                })
            } else {
                res.json({
                    success: false,
                    msg: "failed to add doctor answer in case answer"
                })
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Something went wrong adding doctor answer in caseQuery"
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
Input Parameter:caseId
Description : Get the user question and doctor reply of particular case
*/
router.post('/getCaseQueryAnswers', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        CaseQueryAnswer.findOne({
            'caseId': req.body.caseId
        }).populate('doctorOpinionId').populate('caseId').exec().then(function(caseQueryData) {
            if (caseQueryData) {
                var userSession = new UserSession({
                    'userId': result.userId,
                    'apiName': "User viewed all queries and ansers"
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
                    msg: "Fetched user case query and answers successfully",
                    data: caseQueryData
                })
            } else {
                res.json({
                    success: false,
                    msg: "failed to fetched case query and answer"
                })
            }
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

module.exports = router;