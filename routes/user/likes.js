var express = require('express');
var router = express.Router();
var Likes = require(appRoot + '/models/op_likes');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var UserSession = require(appRoot + '/models/op_userSession');

/*
Input Parameter : blogId,userId,isLike
Description : Add the like on blog if isLike is true. if isLike is false the unlike the blog
*/
router.post('/addLikes', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {

        if (!req.body.userId || !req.body.blogId) {
            res.send({
                success: false,
                msg: "BlogId or userId is missing"
            });
            return;
        }
        else
        {
        var isLike = req.body.isLike;

        if (isLike) {
            var getCount = function(blogId) {
                return new Promise(function(resolve, reject) {
                    Likes.count({
                        'blogId': blogId
                    }).then(function(bloglikes) {
                        if (bloglikes) {
                            resolve(bloglikes);
                        } else {
                            resolve(true);
                        }
                    })
                });
            }

            var likes = new Likes({
                'userId': req.body.userId,
                'blogId': req.body.blogId
            });

            likes.save(function(err, data) {
                if (err) {
                    console.log(err);
                    res.send({
                        success: false,
                        msg: "Failed to add likes"
                    });
                    return;
                } else {
                    var userSession = new UserSession({
                        'userId': data.userId,
                        'apiName': "User like the blog"
                    });
                    userSession.save(function(er, db) {
                        getCount(data.blogId).then(function(info) {
                        if (info != null) {
                            res.json({
                                'success': true,
                                'msg': "Get user likes count successfully",
                                'count': info
                            });return;
                        }
                        else
                        {
                            res.json({
                                'success': false,
                                'msg': "Something went wrong" 
                            });
                            return;
                        }
                        })
                    })
                    
                }
            }).catch(function(er) {
                res.send({
                    "msg": "Somthing went wrong while add likes"
                });
                return;
            })
        } else {
            Likes.find({
                'userId': req.body.userId
            }).sort({
                'createdAt': -1
            }).limit(1).then(function(bloglikes) {
                if (bloglikes.length > 0) {
                    Likes.remove({
                        '_id': bloglikes[0]._id
                    }).then(function(op) {
                  
                        Likes.count({
                            'blogId': req.body.blogId
                        }).then(function(total) {
                            var userSession = new UserSession({
                                'userId': req.body.userId,
                                'apiName': "User dislike the blog"
                            });
                            userSession.save(function(er, db) {
                                 res.send({
                                "success": true,
                                "msg": "dislike the blog",
                                "count": total
                                });
                                return;
                            })
                           
                        })
                    })
                }
                else
                {
                    res.send({
                    "success": true,
                    "msg": "dislike the blog",
                    "count": 0
                    });
                    return;
                }
            })
        }
        }
    }).catch(function(error) {
        res.send({
            success: false,
            msg: "Authentication failed"
        });
        return;
    })
})

/*
Input Parameter : blogId,userId
Description : Add the dislike on blog 
*/
router.post('/dislike', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        if (!req.body.userId || !req.body.blogId) {
            res.send({
                success: false,
                msg: "BlogId or userId is missing"
            })
        }

        Likes.find({
            'userId': req.body.userId
        }).sort({
            'createdAt': -1
        }).limit(1).then(function(bloglikes) {
            if (bloglikes.length > 0) {
                Likes.remove({
                    '_id': bloglikes[0]._id
                }).then(function(op) {
                   
                    Likes.count({
                        'blogId': req.body.blogId
                    }).then(function(total) {
                        console.log("here is to " + total);
                        res.send({
                            "success": true,
                            "msg": "dislike the blog",
                            "count": total
                        })
                    })
                })
            }
        })

    }).catch(function(error) {
        console.log(error);
        res.send({
            success: false,
            msg: "Authentication failed"
        })
    })
})


module.exports = router;