var express = require('express');
var router = express.Router();
var UserSession = require(appRoot + '/models/op_userSession');
var _ = require('lodash');

/*
Input Parameter : startTime,userId
Description : when user login or open the app add the data and track user
*/
router.post('/userSessionStart', function(req, res, next) {
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;

    var usersession = new UserSession({
        'startTime': startTime,
        'userId': req.body.userId,
        'apiName': "/userSessionStart"
    });

    usersession.save(function(err, data) {
        if (err) {
            res.json({
                'success': false,
                'msg': "Failed to start user session"
            });
            return;
        } else {
            res.json({
                'success': true,
                'msg': "User session starts successfully"
            });
            return;
        }
    })
})

/*
Input Parameter : userId
Description : when user logout from the app update the user session
*/
router.post('/updateUserSession', function(req, res, next) {
    var userId = req.body.userId;

    usersession.findOne({
        'userId': userId
    }).then(function(userData) {
        if (userData) {
            var sessionData = _.merge(userData, req.body);
            sessionData.save(function(err, data) {
                if (err) {
                    res.json({
                        'success': false,
                        'msg': "Failed to update user session"
                    })
                } else {
                    res.json({
                        'success': true,
                        'msg': "User session updated successfully",
                        'data': data
                    })
                }
            })
        } else {
            res.json({
                'success': false,
                'msg': "User Id is not present"
            })
        }
    })
})

module.exports = router;