var express = require('express');
var config = require(appRoot + '/libs/config');
var UserSession = require(appRoot + '/models/op_userSession');
module.exports = function(app) {

    app.get('/usersession', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            UserSession.find().sort({
                'createdAt': -1
            }).limit(20).populate('userId').then(function(data) {
                if (data) {
                    res.render('admin/user_session', {
                        page_title: "User Session",
                        navigation: 'usersession',
                        adminFirstName : sess.adminFirstName,
                        data: data

                        /*success: req.flash('success'),
                        error: req.flash('error')*/
                    });
                }
            })
        }
    });
}