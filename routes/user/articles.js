var express = require('express');
var router = express.Router();
var Article = require(appRoot + '/models/op_articles');
var config = require(appRoot + '/libs/config');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var imagePath = 'uploads/articles/';
const CONSTANTS = require(appRoot + '/Constants/constant');
var imagePath = 'uploads/articles/';
var UserSession = require(appRoot + '/models/op_userSession');
var request = require('request');
var _ = require('lodash');
var underscore = require('underscore');

/* 
Description: Get five articles for daily awareness screen
*/
router.post('/getArticles', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var articlesData = [];
        var lat = req.body.lat;
        var long = req.body.lng;

        if (lat != null || lat != undefined || long != null || long != undefined) {
            var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long + "&sensor=false";
            request(url, function(err, response, body) {
                var info = JSON.parse(body)
                var formatedAddress = info.results[0].formatted_address;
                var arr = formatedAddress.toString().split(",");
                var city = arr[arr.length - 3].replace(/\s/g, '');
                var state = arr[arr.length - 2].replace(/\s/g, '');
                var stateWithNoDigits = state.replace(/[0-9]/g, '');
                var country = arr[arr.length - 1].replace(/\s/g, '');

                Article.find({
                    "location": {
                        "$regex": stateWithNoDigits,
                        "$options": "i"
                    }
                }).limit(5).then(function(data) {
                    var userSession = new UserSession({
                        'userId': result.userId,
                        'apiName': "User viewed all articles"
                    });
                    userSession.save(function(er, db) {
                       if (data.length > 0) {
                            res.json({
                                'success': true,
                                'msg': "Featced all articles by location successfully",
                                'data': data
                            });
                            return;
                        } else {
                            Article.find().limit(5).then(function(output) {
                                res.json({
                                    'success': true,
                                    'msg': "Featced all articles successfully without location",
                                    'data': output
                                });
                                return;
                            })
                        }
                    })
                    

                }).catch(function(error) {
                    res.json({
                        'success': false,
                        'msg': "Somthing went wrong while fetching articles by location"
                    });
                    return;
                })
            })
        } else {
            Article.find().limit(5).then(function(info) {
                if (info) {
                    var count = 0;
                    info.forEach(function(data) {
                        if (data.image != undefined) {
                            if (data.image.length) {
                                var picture = CONSTANTS.baseUrl + imagePath + data.image;
                                data.image = picture;
                            }
                        }
                        articlesData.push(data);
                        count = count + 1;
                        if (count == info.length) {
                            var userSession = new UserSession({
                                'userId': result.userId,
                                'apiName': "User viewed all articles"
                            });
                            userSession.save(function(er, db) {
                                res.json({
                                'success': true,
                                'msg': "Articles fetched successfully",
                                'data': articlesData
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
                    'msg': "Somthing went wrong while fetching articles"
                });
                return;
            })
        }
    }).catch(function(error) {
        // console.log(error);
        res.json({
            'success': false,
            'msg': "Authentication failed"
        });
        return;
    })
})

/* 
Description: Update the status of article as viewed when user read particular article
*/
router.post('/getArticle', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = req.body.userId;
        var articleId = req.body.articleId;
        Article.findOne({
            '_id': articleId
        }).then(function(articleData) {
            if (articleData) {
                
                articleData.userIds.push(userId);
                articleData.status = "viewed";
                articleData.save(function(err, data) {
                    if (err) {
                        console.log(err);
                        res.json({
                            'success': false,
                            'msg': "Failed to update status of article as viewed"
                        })
                    } else {
                        var userSession = new UserSession({
                            'userId': result.userId,
                            'apiName': "User viewed article"
                        });
                        userSession.save(function(er, db) {
                            res.json({
                                    'success': true,
                                    'msg': "User status is updated as viewed "
                                });
                            return;
                        })
                    }
                })
            } else {
                res.json({
                    'success': false,
                    'msg': "No article found by given id"
                })
            }
        }).catch(function(error) {
            res.json({
                'success': false,
                'msg': "Somthing went wrong while viewing the article"
            })
        })
    }).catch(function(error) {
        res.json({
            'success': false,
            'msg': "Authentication failed"
        })
    })
})

/* 
Description: Get article by types (Medication Alert, Disease Alert, Infection Alert, Announcement) and user 
    should not get those article which he seen 
*/
router.post('/getArticleByTypes', function(req, res, next) {
    // console.log("req.originalUrl->>",req.protocol + '://' + req.get('host') + req.originalUrl);
    // console.log(req.headers);
    var token = req.headers['accesstoken'];
    // var token = req.headers.authorization.split('accesstoken');
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = "'" + req.body.userId + "'";
        var articles = [];
        var filteredArticles = [];
    // return new Promise(function(resolve, reject) {
        Article.find().then(function(allArticles) {
            if (allArticles) {
                var count = 0;
                allArticles.forEach(function(article) {
                    // console.log("article=>"+article);
                    if(article.userIds!=undefined){
                        if (article.userIds.length > 0) {
                        var userCount = 0;
                        var userExists = [];
                            article.userIds.forEach(function(userData) {
                                var id = "'" + userData + "'";
                                if (id.toString() === userId.toString()) {
                                    userExists.push(true);
                                } else {
                                    userExists.push(false);
                                }
                            })
                            if (userExists.includes(true) == false) {
                                articles.push(article);
                            }
                        } else {
                            articles.push(article);
                        }
                    }
                    else
                    {
                         articles.push(article);
                    }
                });
                if (articles.length == 0) {
                    res.send({
                        'success': false,
                        'msg': "No article for user as he viewed all"
                    })
                }
                else
                {
                var total = 0;
                var new_article = JSON.parse(JSON.stringify(articles));
                new_article.forEach(function(data) {                  
                    if (data.type == "Announcements") {
                        if (underscore.contains(filteredArticles, data.type) == false) {
                            if (data.image.length) {
                                if (data.image != null) {
                                    var picture = CONSTANTS.baseUrl + imagePath + data.image.replace((CONSTANTS.baseUrl + imagePath), "");
                                    data.image = picture;
                                }
                            }
                            filteredArticles.push(data);
                            total = total + 1;
                        }
                        
                    }
                    if (data.type == "Infection Alert") {
                        if (underscore.contains(filteredArticles, data.type) == false) {
                            if (data.image.length) {
                                if (data.image != null) {
                                    var picture = CONSTANTS.baseUrl + imagePath + data.image.replace((CONSTANTS.baseUrl + imagePath), "");
                                    data.image = picture;
                                }
                            }
                            filteredArticles.push(data);
                            total = total + 1;
                        }
                        
                    }
                    if (data.type == "Medication Alert") {
                        if (underscore.contains(filteredArticles, data.type) == false) {
                            if (data.image.length) {
                                if (data.image != null) {
                                    var picture = CONSTANTS.baseUrl + imagePath + data.image.replace((CONSTANTS.baseUrl + imagePath), "");
                                    data.image = picture;
                                }
                            }
                            filteredArticles.push(data);
                            total = total + 1;
                        }
                       
                    }
                    if (data.type == "Disease Alert") {
                        if (underscore.contains(filteredArticles, data.type) == false) {
                            if (data.image.length) {
                                if (data.image != null) {
                                    var picture = CONSTANTS.baseUrl + imagePath + data.image.replace((CONSTANTS.baseUrl + imagePath), "");
                                    data.image = picture;
                                }
                            }
                            filteredArticles.push(data);
                            total = total + 1;
                        }
                        
                    }
                    if (filteredArticles.length == 4) {
                        //console.log(filteredArticles.length);
                        res.json({
                            'success': true,
                            'msg': "Fetched user articles by type",
                            'data': filteredArticles
                        })
                    } else if (filteredArticles.length == articles.length && filteredArticles.length < 4) {
                        res.json({
                            'success': true,
                            'msg': "Fetched user articles by type",
                            'data': filteredArticles
                        });
                        return;
                    }
                })
                }
            } else {
                res.json({
                    'success': false,
                    'msg': "No articles are available"
                });
                return;
            }
        }).catch(function(error) {
            console.log(error);
            res.json({
                'success': false,
                'msg': "Something went wrong while featching the articles by types"
            });
            return;
        })
    // })
    }).catch(function(result) {
        console.log("=>" + result);
        res.json({
            'success': false,
            'msg': "Authentication failed"
        });
        return;
    })

})

module.exports = router;