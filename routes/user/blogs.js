var express = require('express');
var router = express.Router();
var User = require(appRoot + '/models/op_users');
var Blogs = require(appRoot + '/models/op_blogs');
var Comment = require(appRoot + '/models/op_comment');
var Likes = require(appRoot + '/models/op_likes');
var config = require(appRoot + '/libs/config');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var imagePath = 'uploads/blogs/';
const CONSTANTS = require(appRoot + '/Constants/constant');
var userImagePath = 'uploads/users/';
var Admin = require(appRoot + '/models/masterAdmin');
var _ = require('lodash');
var UserSession = require(appRoot + '/models/op_userSession');

/*
  Description: Get the blogs with likes and comment 
*/
router.post('/getBlogs', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        // var blogId = req.body.blogId;
        // if (blogId == null) {
        var blogs = [];

        var getCommentCount = function(blogId) {
            return new Promise(function(resolve, reject) {
                Comment.count({
                    'blogId': blogId
                }).then(function(blogComments) {
                    if (blogComments) {
                        resolve(blogComments);
                    } else {
                        resolve(blogComments);
                    }
                })
            });
        }

        var getLikesCount = function(blogId) {
           // console.log("blog id " + blogId);
            return new Promise(function(resolve, reject) {
                Likes.find({
                    'blogId': blogId
                }).then(function(blogLikes) {
                    if (blogLikes) {
                        resolve(blogLikes);
                    } else {
                        resolve(blogLikes);
                    }
                })
            });
        }

        var getUserData = function(userId) {
            return new Promise(function(resolve, reject) {
                User.findOne({
                    '_id': userId
                }).then(function(data) {
                    if (data) {
                        if (data.photo != null) {
                            if (data.photo.length) {
                                data.photo = CONSTANTS.baseUrl + userImagePath + data.photo;
                            }
                        }
                        resolve(data)
                    } else {
                        resolve(data);
                    }
                })
            })
        }

        var getAdminData = function(userId) {
            return new Promise(function(resolve, reject) {
                Admin.findOne({
                    '_id': userId
                }).then(function(data) {
                    if (data) {
                        resolve(data)
                    } else {
                        resolve(data);
                    }
                })
            })
        }
        Blogs.find().then(function(blogData) {
                if (blogData.length > 0) {
                    blogData.forEach(function(retrivedBlog) {
                            var userInformation = null;
                            var commentsCount = 0;
                            var likesCount = [];
                            var likesByUsers = [];
                            var totalLikes = 0;
                            if (retrivedBlog) {
                                getCommentCount(retrivedBlog._id).then(function(retrivedComment) {
                                    if (retrivedComment) {
                                        commentsCount = retrivedComment;
                                    }
                                }).then(function() {
                                    getLikesCount(retrivedBlog._id).then(function(retrivedLikes) {
                                        if (retrivedLikes) {
                                            //likesCount = retrivedLikes;
                                            var arrCount = 0;
                                            retrivedLikes.forEach(function(userLikes) {
                                                likesCount.push(userLikes.userId);
                                                arrCount = arrCount + 1;
                                                if (retrivedLikes.length == arrCount) {
                                                    likesByUsers = likesCount;
                                                    //console.log("here is unique " + new Set(retrivedLikes));
                                                    totalLikes = arrCount;
                                                }
                                            })
                                        }
                                    })
                                }).then(function() {
                                    getUserData(retrivedBlog.userId).then(function(retrivedUser) {
                                        if (retrivedUser != null) {
                                            retrivedUser = retrivedUser.toObject();
                                            delete retrivedUser.password;
                                            userInformation = retrivedUser;
                                        }
                                    })
                                }).then(function() {
                                    getAdminData(retrivedBlog.userId).then(function(retrivedAdmin) {
                                        if (retrivedAdmin != null) {
                                            retrivedAdmin.photo = "";
                                            retrivedAdmin = retrivedAdmin.toObject();
                                            delete retrivedAdmin.password;
                                            userInformation = retrivedAdmin;
                                        }
                                        //})
                                    }).then(function() {

                                        if (retrivedBlog.image != null) {
                                            if (retrivedBlog.image.length) {
                                                var picture = CONSTANTS.baseUrl + imagePath + retrivedBlog.image;
                                                retrivedBlog.image = picture;
                                            }
                                        }
                                        if (commentsCount == undefined) {
                                            commentsCount = 0;
                                        }
                                        /*if (likesCount == undefined) {
                                            likesCount = 0;
                                        }*/

                                        var blogInfo = {
                                            'blogId': retrivedBlog._id,
                                            'title': retrivedBlog.title,
                                            'authorName': retrivedBlog.authorName,
                                            'image': retrivedBlog.image,
                                            'postedDate': retrivedBlog.postedDate,
                                            'content': retrivedBlog.content,
                                            'userLikes': likesByUsers,
                                            'likes': totalLikes,
                                            'comments': commentsCount,
                                            'user': userInformation
                                        }

                                        blogs.push(blogInfo);
                                        if (blogs.length == blogData.length) {
                                            var userSession = new UserSession({
                                                'userId': result.userId,
                                                'apiName': "User viewed all blogs"
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
                                                msg: 'list of blogs',
                                                data: blogs
                                            })
                                        }
                                    })
                                })
                            }
                        })
                        //})
                } else {
                    res.json({
                        success: true,
                        msg: 'No blogs available',
                        data: blogs
                    })
                }
            }).catch(function(error) {
                res.json({
                    success: false,
                    msg: "Something went wrong, Failed to fetch all blogs"
                })
            })
            // }
            /* else {
                        blogs.findOne({
                            '_id': blogId
                        }).then(function(retrivedBlog) {
                            var userInformation = null;
                            if (retrivedBlog) {
                                getCommentCount(retrivedBlog._id).then(function(retrivedComment) {
                                    if (retrivedComment) {
                                        commentsCount = retrivedComment.length;
                                    }
                                }).then(function() {
                                    getLikesCount(retrivedBlog._id).then(function(retrivedLikes) {
                                        if (retrivedLikes) {
                                            likesCount = retrivedLikes.length;
                                        }
                                    })
                                }).then(function() {
                                    getUserData(retrivedBlog.userId).then(function(retrivedUser) {
                                        if (retrivedUser != null) {
                                            userInformation = retrivedUser;
                                        }
                                    })
                                }).then(function() {
                                    getAdminData(retrivedBlog.userId).then(function(retrivedAdmin) {
                                        if (retrivedAdmin != null) {

                                            userInformation = retrivedAdmin;
                                        }
                                    }).then(function() {
                                        if (retrivedBlog.image.length) {
                                            if (retrivedBlog.image != null) {
                                                var picture = CONSTANTS.baseUrl + imagePath + retrivedBlog.image;
                                                retrivedBlog.image = picture;
                                            }
                                        }
                                        if (commentsCount == undefined) {
                                            commentsCount = 0;
                                        }

                                        var blogInfo = {
                                            'blogId': retrivedBlog._id,
                                            'title': retrivedBlog.title,
                                            'authorName': retrivedBlog.authorName,
                                            'image': retrivedBlog.image,
                                            'postedDate': retrivedBlog.postedDate,
                                            'content': retrivedBlog.content,
                                            'likes': likesCount,
                                            'comments': commentsCount,
                                            'user': userInformation
                                        }
                                        res.json({
                                                success: true,
                                                msg: 'Blog fetchd successfully',
                                                data: blogInfo
                                            })
                                    })
                                })
                            } else {
                                res.json({
                                    success: false,
                                    msg: 'Failed to fetch the blog, please enter valid blogId'
                                })
                            }
                        }).catch(function(error) {
                            res.json({
                                success: false,
                                msg: 'Somthing went wrong, Failes to fetch blog'
                            })
                        })
                    }*/
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Authentication failed"
        });
    })
});

module.exports = router;