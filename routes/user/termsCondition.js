var express = require('express');
var router = express.Router();
var TermsConditions = require(appRoot + '/models/op_termsconditions');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var UserSession = require(appRoot + '/models/op_userSession');

/*
Description : Get terms and condition information
*/
router.get('/getTermsConditions', function(req, res, next) {
    var token = req.headers['Access-Token'];
    jwtAuth.checkAuth(token).then(function(result) {
        TermsConditions.findOne().then(function(data) {
            if (data) {
                var userSession = new UserSession({
                    'userId': result.userId,
                    'apiName': "getTermsConditions"
                });
                userSession.save(function(er, db) {
                     res.json({
                        success: true,
                        msg: "Terms and conditions fetched successfully ",
                        data: data
                    });
                    return;
                })
               
            } else {
                res.json({
                    success: false,
                    msg: "Failed to fetch terms and conditions "
                });
                return;
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Somthing went wrong, failed to fetch terms and conditions "
            })
            return;
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