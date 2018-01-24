var express = require('express');
var router = express.Router();
var AboutOpinion = require(appRoot + '/models/op_about');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var UserSession = require(appRoot + '/models/op_userSession');

router.get('/getAboutOpinion', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        AboutOpinion.findOne().then(function(data) {
            if (data) {
                var userSession = new UserSession({
                    'userId': result.userId,
                    'apiName': "getAboutOpinion"
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
                    msg: "Retrived information successfully",
                    data: data
                })
            } else {
                res.json({
                    success: false,
                    msg: "No information is available "
                })
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Somthing went wrong, can not fetch data about OP"
            })
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication failed"
        })
    })
})

module.exports = router;