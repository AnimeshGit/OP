var express = require('express');
var config = require(appRoot + '/libs/config');
var imgurl = require(appRoot + '/Constants/constant');
var op_app_rating = require(appRoot + '/models/op_app_rating');
var _ = require('lodash');

module.exports = function(app) { 
    app.get('/opinionplus_feedback', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            op_app_rating.find().populate('user_id').sort({'createdAt':-1}).then(function(data) {
                res.render('admin/opinionplus_feedback', {
                    page_title: "Feedbacks",
                    navigation: 'opinionplus_feedback',
                    data: data,
                    adminFirstName : sess.adminFirstName,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });
};