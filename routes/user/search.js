var express = require('express');
var router = express.Router();
var Search = require(appRoot + '/models/op_search');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var UserSession = require(appRoot + '/models/op_userSession');
var _ = require('lodash');
var config = require(appRoot + '/libs/config');

/*
Input Parameters : name,blogId,userId,searchType,articleId,doctorId,problemId,medicationId,image
Description : Add data whatever user search like problem, medication, article etc
*/
router.post('/addSearchData', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var count = 0;
        var search = {};

        if (req.body.blogId != null) {
            search.blogId = req.body.blogId;
            search.userId = req.body.userId;
        } else if (req.body.articleId != null) {
            search.articleId = req.body.articleId;
            search.userId = req.body.userId;
        } else if (req.body.doctorId != null) {
            search.doctorId = req.body.doctorId;
            search.userId = req.body.userId;
        } else if (req.body.problemId != null) {
            search.problemId = req.body.problemId;
            search.userId = req.body.userId;
        } else if (req.body.medicationId != null) {
            search.medicationId = req.body.medicationId;
            search.userId = req.body.userId;
        }

        Search.find(
            search
        ).sort({
            'count': -1
        }).limit(1).then(function(data) {
            if (data.length > 0) {
                var total = data[0]['count'];
                var searchData = {
                    'name': req.body.name,
                    'blogId': req.body.blogId,
                    'userId': req.body.userId,
                    'count': total + 1,
                    'searchType': req.body.searchType,
                    'articleId': req.body.articleId,
                    'doctorId': req.body.doctorId,
                    'problemId': req.body.problemId,
                    'medicationId': req.body.medicationId,
                    'image': req.body.image
                }
                var mergeData = _.merge(data[0], searchData);
                mergeData.save(function(error, output) {
                    if (error) {
                        res.json({
                            'success': false,
                            'msg': "Failed to add search data"
                        });
                        return;
                    } else {
                        var userSession = new UserSession({
                            'userId': output.userId,
                            'apiName': "User search something"
                        });
                        userSession.save(function(er, db) {
                            res.json({
                            'success': true,
                            'msg': "Search data added successfully",
                            'data': output
                            });
                            return;
                        });                        
                    }
                })
            } else {
                var searchData = new Search({
                    'name': req.body.name,
                    'problemId': req.body.problemId,
                    'medicationId': req.body.medicationId,
                    'blogId': req.body.blogId,
                    'userId': req.body.userId,
                    'count': count + 1,
                    'searchType': req.body.searchType,
                    'articleId': req.body.articleId,
                    'doctorId': req.body.doctorId,
                    'image': req.body.image
                })
                searchData.save(function(error, output) {
                    if (error) {
                        res.json({
                            'success': false,
                            'msg': "Failed to add search data"
                        });
                        return;
                    } else {
                        var userSession = new UserSession({
                            'userId': output.userId,
                            'apiName': "User search something"
                        });
                        userSession.save(function(er, db) {
                             res.json({
                            'success': true,
                            'msg': "Search data added successfully",
                            });
                            return;
                        })
                       
                    }
                })
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                'success': false,
                'msg': "Something went wrong while adding search data"
            });
            return;
        })
    }).catch(function(error) {
        console.log(error);
        res.send({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

/*
Input Parameter : userId
Description : Get user recently search data
*/
router.post('/recentlySearch', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;
        Search.find({
            'userId': userId
        }).populate('doctorId').populate('blogId').populate('articleId').populate('articleId').sort({
            'updatedAt': -1
        }).limit(5).then(function(data) {
            if (data) {
                var userSession = new UserSession({
                    'userId': userId,
                    'apiName': "User viewed his recently search"
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
                    'msg': 'Fetched user recent search data',
                    'data': data
                })
            } else {
                res.json({
                    'success': false,
                    'msg': "User don't have any recent search"
                })
            }
        }).catch(function(error) {
            res.json({
                'success': false,
                'msg': "Something went wrong while fetching user recent search data"
            })
        })
    }).catch(function(error) {
        res.send({
            success: false,
            msg: "Authentication failed"
        })
    })
})

/*
Description : Get users frequently search data
*/
router.get('/frequentlySearch', function(req, res, next) {
    Search.find().sort({
        'count': -1
    }).limit(10).populate('userId').then(function(data) {
        if (data) {
            res.json({
                'success': true,
                'msg': 'Fetched user recent search data',
                'data': data
            })
        }
    })
})

module.exports = router;