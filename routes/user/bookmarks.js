var express = require('express');
var router = express.Router();
var BookMark = require(appRoot + '/models/op_bookmark');
var Blogs = require(appRoot + '/models/op_blogs');
var config = require(appRoot + '/libs/config');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var _ = require('lodash');
var userImage = 'uploads/users/';
var articleImage = 'uploads/articles/';
var blogImage = 'uploads/blogs/';
const CONSTANTS = require(appRoot + '/Constants/constant');
var UserSession = require(appRoot + '/models/op_userSession');

/*
Input Parameter : userId,bookmarkName,blogId,doctorId,articleId,bookmarkType,medicationId,problemId,
                    subTitle,name,image
Description : Bookmark the data if isBookmark is true . remove bookmark if isBookmark is false
*/
router.post('/addBookmark', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var isBookmark = req.body.isBookmark;
        // console.log("bookmerk request "+isBookmark);
        // console.log(config.decrypt("1599d1823568"));
        if (isBookmark == true) {
            var bookmark = new BookMark({
                userId: req.body.userId,
                bookmarkName: req.body.bookmarkName,
                blogId: req.body.blogId,
                doctorId: req.body.doctorId,
                articleId: req.body.articleId,
                bookmarkType: req.body.bookmarkType,
                medicationId: req.body.medicationId,
                problemId: req.body.problemId,
                subTitle: req.body.subTitle,
                name: req.body.name,
                image: req.body.image,
                status: 'ACTIVE'
            })
            var checks = [];
            BookMark.find({
                'userId': req.body.userId
            }).then(function(bookmarkedData) {
                if (bookmarkedData.length > 0) {
                    var count = 0;
                    bookmarkedData.forEach(function(mark) {
                        var test;
                        if (mark.bookmarkType == "BLOG") {
                            if (req.body.blogId != null) {
                                if (mark.blogId == req.body.blogId) {
                                    test = true;
                                }
                            }
                        } else if (mark.bookmarkType == "ARTICLE") {
                            if (req.body.articleId != null) {
                                if (mark.articleId == req.body.articleId) {
                                    test = true;
                                }
                            }
                        } else if (mark.bookmarkType == "DOCTOR") {
                            if (req.body.doctorId != null) {
                                if (mark.doctorId == req.body.doctorId) {
                                    test = true;
                                }
                            }
                        } else if (mark.bookmarkType == "PROBLEM") {
                            if (req.body.problemId != null) {
                                if (mark.problemId == req.body.problemId) {
                                    test = true;
                                }
                            }
                        } else if (mark.bookmarkType == "MEDICATION" || mark.status == 'ACTIVE') {
                            if (req.body.medicationId != null) {
                                if (mark.medicationId == req.body.medicationId) {
                                    test = true;
                                }
                            }
                        } else {
                            console.log("***" + "Nothing");
                        }
                        checks.push(test);
                        count = count + 1;
                        if (bookmarkedData.length == count) {
                            var check = checks.includes(true);
                            if (!check) {
                                bookmark.save(function(err, data) {
                                    if (err) {
                                        res.json({
                                            success: false,
                                            msg: "Failed to save the bookmark"
                                        })
                                    } else {
                                        var userSession = new UserSession({
                                            'userId': data.userId,
                                            'apiName': "User bookmark the data"
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
                                            msg: "Bookmark successfully",
                                            data: data
                                        })
                                    }
                                })
                            } else {
                                res.json({
                                    'success': false,
                                    'msg': "User already bookmark this data"
                                })
                            }
                        }
                    })
                } else {
                    bookmark.save(function(err, data) {
                        if (err) {
                            res.json({
                                success: false,
                                msg: "Failed to save the bookmark"
                            })
                        } else {
                            var userSession = new UserSession({
                                'userId': data.userId,
                                'apiName': "User bookmark the data"
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
                                msg: "Bookmark successfully",
                                data: data
                            })
                        }
                    })
                }
            })
        } else {
            var bookmarkId = req.body.bookMarkId;
            BookMark.findOneAndRemove({
                '_id': bookmarkId
            }).then(function(bookmarkInfo) {
                // console.log("bokkmark data " + bookmarkInfo);
                if (bookmarkInfo) {
                    var userSession = new UserSession({
                        'userId': bookmarkInfo.userId,
                        'apiName': "User unbookmark the data"
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
                        'msg': "Bookmark removed successfully"
                    })
                } else {
                    res.json({
                        'success': false,
                        'msg': "Enter valid bookmark Id"
                    })
                }
            }).catch(function(error) {
                res.json({
                    'success': false,
                    'msg': "Something went wrong while removing the bookmark"
                })
            })
        }
    }).catch(function(error) {
        res.json({
            'success': false,
            'msg': "Authentication Failed"
        })
    })
})

/*
Input Parameter : UserId
Description: Get user bookmark data
*/
router.post('/getBookmark', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        BookMark.find({
            'userId': req.body.userId,
            'status': 'ACTIVE'
        }).populate('articleId').populate('doctorId').populate('blogId').exec().then(function(bookmarkData) {
            if (bookmarkData.length > 0) {
                var markedData = [];
                var count = 0;
                bookmarkData.forEach(function(data) {
                    if (data.blogId != null) {
                        if (data.blogId.image != null) {
                            if (data.blogId.image.length) {
                                var picture = CONSTANTS.baseUrl + blogImage + data.blogId.image.replace((CONSTANTS.baseUrl + blogImage), "");
                                data.blogId.image = picture;
                            }
                        }
                    }
                    if (data.articleId != null) {
                        if (data.articleId.image != null) {
                            if (data.articleId.image.length) {
                                var picture = CONSTANTS.baseUrl + articleImage + data.articleId.image.replace((CONSTANTS.baseUrl + articleImage), "");
                                data.articleId.image = picture;
                            }
                        }
                    }
                    if (data.doctorId != null) {
                        if (data.doctorId.photo != null) {
                            if (data.doctorId.photo.length) {
                                var picture = CONSTANTS.baseUrl + userImage + data.doctorId.photo.replace((CONSTANTS.baseUrl + userImage), "");
                                data.doctorId.photo = picture;
                            }
                        }
                    }
                    markedData.push(data);
                    count += 1;
                    if (bookmarkData.length == count) {
                        var userSession = new UserSession({
                            'userId': req.body.userId,
                            'apiName': "User viewed all his bookmark data"
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
                            msg: "Fetched all user bookmarks successfully",
                            data: bookmarkData
                        })
                    }
                })
            } else {
                res.json({
                    success: false,
                    msg: "User don't have bookmark"
                })
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Something went wrong while fetching user bookmarks"
            })
        })
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Authentication Failed"
        })
    })
})

/*
Input Parameter: userId
Description :Get user bookmark data Id's
*/
router.post('/getBookmarkIdList', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        BookMark.find({
            'userId': req.body.userId,
            'status': 'ACTIVE'
        }).then(function(bookmarkData) {
            if (bookmarkData.length > 0) {
                var markedData = [];
                var count = 0;
                bookmarkData.forEach(function(data) {
                    if (data.blogId != null) {
                        var output = {
                            'bookmarkId': data._id,
                            'bookmarkType': data.bookmarkType,
                            'typeId': data.blogId
                        }
                    }
                    if (data.articleId != null) {
                        var output = {
                            'bookmarkId': data._id,
                            'bookmarkType': data.bookmarkType,
                            'typeId': data.articleId
                        }
                    }
                    if (data.doctorId != null) {
                        var output = {
                            'bookmarkId': data._id,
                            'bookmarkType': data.bookmarkType,
                            'typeId': data.doctorId
                        }
                    }
                    if (data.problemId != null) {
                        var output = {
                            'bookmarkId': data._id,
                            'bookmarkType': data.bookmarkType,
                            'typeId': data.problemId
                        }
                    }
                    if (data.medicationId != null) {
                        var output = {
                            'bookmarkId': data._id,
                            'bookmarkType': data.bookmarkType,
                            'typeId': data.medicationId
                        }
                    }
                    markedData.push(output);
                    count += 1;
                    if (bookmarkData.length == count) {
                        var userSession = new UserSession({
                            'userId': req.body.userId,
                            'apiName': "getBookmarkIdList"
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
                            msg: "Fetched all user bookmark id's successfully",
                            data: markedData
                        })
                    }
                })
            } else {
                res.json({
                    success: false,
                    msg: "User dont have bookmark"
                })
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                success: false,
                msg: "Something went wrong while fetching user bookmark id's"
            })
        })
    }).catch(function(error) {
        console.log(error);
        res.json({
            success: false,
            msg: "Authentication Failed"
        })
    })
})

module.exports = router;