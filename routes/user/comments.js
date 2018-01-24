var express = require('express');
var router = express.Router();
var Comments = require(appRoot + '/models/op_comment');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var config = require(appRoot + '/libs/config');
var getImage = 'uploads/users/';
const CONSTANTS = require(appRoot + '/Constants/constant');
var User = require(appRoot + '/models/op_users');
var UserSession = require(appRoot + '/models/op_userSession');

/*
Input Parameter : blogId,comment,userId
Description : Add the user comment on particular blog 
 */
router.post('/addComment', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {

        var comment = new Comments({
            'blogId': req.body.blogId,
            'comment': req.body.comment,
            'userId': req.body.userId,
            'date': config.currentTimestamp
        })

        comment.save(function(err, data) {
            if (err) {
                res.send({
                    success: false,
                    msg: "Failed to add user comment"
                })
            } else {
                var userSession = new UserSession({
                    'userId': data.userId,
                    'apiName': "User add comment on blog"
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
                    msg: "Fetched user comments successfully",
                    data: data
                })
            }
        })
    }).catch(function(error) {
        res.send({
            success: false,
            msg: "AUthentication failed"
        })
    })
})

/*
Input Parameter : commentId,userId,comment
Description: Reply on user comment on particular blog
*/
router.post('/replyOnComment', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var commentId = req.body.commentId;
        var userId = req.body.userId;
        var comment = req.body.comment;

        Comments.findByIdAndUpdate(
            commentId, {
                $push: {
                    "replies": {
                        userId: req.body.userId,
                        replyToComment: req.body.comment,
                        date: config.currentTimestamp
                    }
                }
            }, {
                safe: true,
                new: true
            }).then(function(repliedComment) {
            if (repliedComment) {
                var userSession = new UserSession({
                    'userId': userId,
                    'apiName': "User replied on comment of blog"
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
                    'msg': "User reply comment added successfully",
                    'data': repliedComment
                })
            } else {
                res.json({
                    'success': false,
                    'msg': "Failed to add reply on comment"
                })
            }
        }).catch(function(error) {
            res.json({
                'success': false,
                'msg': "Somthing went wrong while adding reply comment"
            })
        })
    }).catch(function(error) {
        res.send({
            success: false,
            msg: "AUthentication failed"
        })
    })
})

/*
Input Parameter : BlogId
Description:Get all the comment of particular blog
*/
router.post('/getComments', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var blogId = req.body.blogId;
        Comments.find({
            'blogId': blogId
        }).populate('userId').populate('replies.userId').exec().then(function(retrivedComments) {
            if (retrivedComments.length > 0) {
                var count = 0;
                var userData = [];
                var userReplies = [];
                retrivedComments.forEach(function(userInfo) {
                    if (userInfo.replies.length > 0) {
                        var total = 0;
                        userInfo.replies.forEach(function(userReply) {
                            if (userReply.userId.photo != null) {
                                if (userReply.userId.photo.length) {
                                    var picture = CONSTANTS.baseUrl + getImage + userReply.userId.photo.replace((CONSTANTS.baseUrl + getImage), "");
                                    userReply.userId.photo = picture;
                                }
                                userReplies.push(userReply);
                                total = total + 1;
                            }
                            if (userInfo.replies.length == total) {
                                userInfo.replies = userReplies;
                            }
                        })
                    }
                    if (userInfo.userId.photo != null) {
                        if (userInfo.userId.photo.length) {
                            var picture = CONSTANTS.baseUrl + getImage + userInfo.userId.photo.replace((CONSTANTS.baseUrl + getImage), "");
                            userInfo.userId.photo = picture;
                        }
                    }
                    count = count + 1;
                    userData.push(userInfo);
                    if (retrivedComments.length == count) {
                        var userSession = new UserSession({
                            'userId': result.userId,
                            'apiName': "User viewd all comments of blog"
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
                            'msg': "User comments fetched successfully",
                            'data': userData
                        })
                    }

                })
            } else {
                res.json({
                    success: true,
                    msg: "Blog has no comments",
                    data: retrivedComments
                })
            }
        }).catch(function(error) {
            res.send({
                success: false,
                msg: "Somthing went wrong while fetching the comments"
            })
        })
    }).catch(function(error) {
        res.send({
            success: false,
            msg: "AUthentication failed"
        })
    })
})

module.exports = router;