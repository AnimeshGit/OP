var express = require('express');
var router = express.Router();
var OpinionPrice = require(appRoot + '/models/op_prices');
var jwtAuth = require(appRoot + '/libs/jwtAuth');
var UserSession = require(appRoot + '/models/op_userSession');

/*
Description : Get all the prices
*/
router.post('/getPrice', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        var userId = result.userId;
        OpinionPrice.find({"type":{"$ne":"2"}}).then(function(prices) {

            
            if (prices) {
                var userSession = new UserSession({
                    'userId': userId,
                    'apiName': "User viewed all prices"
                });
                userSession.save(function(er, db) {
                    res.json({
                        success: true,
                        msg: "Fetched all prices successfully",
                        data: prices
                    });
                    return;
                })
            } else {
                res.json({
                    success: true,
                    msg: "No prices available",
                    data: prices
                });
                return;
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Somthing went wrong while fetching price"
            });
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