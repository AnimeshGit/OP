var express = require('express');
var config = require(appRoot + '/libs/config');
//var router = express.Router();
// var constant = require(appRoot + '/routes/constants');
var fetch = require('node-fetch');
var md = require("markdown").markdown;
//var marked = require('marked');
var groupArray = require('group-array');
// var adminUser = require(appRoot + '/models/op_users');
var Search = require(appRoot + '/models/op_search');
module.exports = function(app) {

    app.get('/search', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
         if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            Search.find().sort({
                'count': -1
            }).limit(10).populate('userId').then(function(data) {
                if (data) {
                    res.render('admin/frequesntly_search', {
                        page_title: "Frequently  Search",
                        navigation: 'search',
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