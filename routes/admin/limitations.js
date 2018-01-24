var express = require('express');
var config = require(appRoot + '/libs/config');
var Limits = require(appRoot + '/models/op_limits');

module.exports = function(app) {

    app.get('/limitations', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            Limits.find(function(err, data) {
            	console.log(data)
                res.render('admin/limits', {
                    page_title: "All Limits",
                    navigation: 'limitations',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });

    app.get('/editLimits/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var limitId = req.params.id;
            Limits.findOne({'_id': limitId}, function(err, data) {
                console.log(data)
                if (err) {
                    return console.dir(err);
                } else {
                    res.render('admin/editLimits', {
                        page_title: "Edit Limits",
                        navigation: 'limitations',
                        data: data,
                        adminFirstName : sess.adminFirstName
                    });
                }
            });
        }
    });

    //update hos data process
    app.post('/update_limits',function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;

        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
               
            Limits.findOneAndUpdate({
                _id: req.body.LimitId
            }, {
                $set: {
                    'caseLimit': req.body.caseLimit,
                    'followLimit': req.body.followLimit
                }
            }, {
                'new': true
            }, function(err, data) {
                console.log(data)

                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Limitations data not Updated');
                    res.redirect('/Limitations');
                } else {
                    req.flash('success', 'Successful updated Limitations Data');
                    res.redirect('/Limitations');
                }
            
            });
        }
    });


}