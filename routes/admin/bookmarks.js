var express = require('express');
var config = require(appRoot + '/libs/config');
var Bookmark = require(appRoot + '/models/op_bookmark');

module.exports = function(app) {
    //show all Unassigned list     
    app.get('/bookmarks', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var data = {};
            Bookmark.find().populate('userId').then(function(totalCount) {
                if (totalCount) {
                    data.total = totalCount.length;
                    data.bookmarks = totalCount;
                }
                Bookmark.find({
                    'bookmarkType': "MEDICATION"
                }).populate('userId').then(function(medicationCount) {
                    if (medicationCount) {
                        data.medication = medicationCount.length;
                        data.medicationData = medicationCount;
                    }
                    Bookmark.find({
                        'bookmarkType': "PROBLEM"
                    }).populate('userId').then(function(problemCount) {
                        if (problemCount) {
                            data.problem = problemCount.length;
                            data.problemData = problemCount;
                        }
                        Bookmark.find({
                            'bookmarkType': "BLOG"
                        }).populate('userId').then(function(blogCount) {
                            if (blogCount) {
                                data.blog = blogCount.length;
                                data.blogData = blogCount;
                            }
                            Bookmark.find({
                                'bookmarkType': "ARTICLE"
                            }).populate('userId').then(function(articleCount) {
                                if (articleCount) {
                                    data.article = articleCount.length;
                                    data.articleData = articleCount;
                                }
                               
                                res.render('admin/bookmarks', {
                                    page_title: "Bookmarks",
                                    navigation: 'bookmarks',
                                    adminFirstName : sess.adminFirstName,
                                    data: data
                                        /*success: req.flash('success'),
                                        error: req.flash('error')*/
                                });
                            })
                        })

                    })
                })
            })
        }
    });
}