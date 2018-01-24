var express = require('express');
var config = require(appRoot + '/libs/config');

var article_data = require(appRoot + '/models/op_articles');

var config = require(appRoot + '/libs/config');
var imagePath = "/public/uploads/articles";
var upload = require(appRoot + '/libs/fileupload');
var MongoClient = require('mongodb').MongoClient;
const url = require(appRoot + '/libs/dbConfig');

const path = require('path');
var fs = require("fs");

module.exports = function(app) {
    // body...
    app.get('/articles', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            article_data.find(function(err, data) {
                // console.log(data);
                res.render('admin/articles', {
                    page_title: "All articles",
                    navigation: 'articles',
                    data: data,
                    adminFirstName : sess.adminFirstName,
                    success: req.flash('success'),
                    error: req.flash('error')

                });
            });

        }
    });

    app.get('/add_articles', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {

            MongoClient.connect(url.mongoUrl, function(err, db) {
                if (err) {
                    return console.dir(err);
                } else {
                    var testStates = db.collection('states1');
                    testStates.find().toArray(function(error, output) {
                       
                        res.render('admin/add_articles', {
                            page_title: "Add articles",
                            navigation: 'add_articles',
                            adminFirstName : sess.adminFirstName,
                            data: output
                        });
                    })
                }
            })
        }
    });

    app.post('/insert_articles', upload.uploadImage('article_image', imagePath), function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var input = JSON.parse(JSON.stringify(req.body));
           
            var filename = (!req.files[0]) ? "" : req.files[0].filename;

            var op_articles = new article_data({
                title: input.article_title,
                image: filename,
                state: input.state,
                type: input.types,
                authorName: input.article_author,
                postedDate: config.currentTimestamp,
                content: input.article_content
            });

            op_articles.save(function(error, data) {
                if (error) {
                    req.flash('error', 'Articles Data not Inserted');
                    res.redirect('/articles');
                } else {
                    console.log(data);
                    req.flash('success', 'Successful Inserted Articles data');
                    res.redirect('/articles');
                }
            })
        }
    })


    app.get('/edit_each_article/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var article_id = req.params.id;
            article_data.findOne({'_id': article_id}, function(err, data) {

                MongoClient.connect(url.mongoUrl, function(err, db) {
                    if (err) {
                        return console.dir(err);
                    } else {
                        var testStates = db.collection('states1');
                        testStates.find().toArray(function(error, output) {

                            if (err)
                                console.log("Error Selecting : %s ", err);
                            
                            res.render('admin/edit_each_article', {
                                page_title: "Edit Article Data",
                                navigation: 'article',
                                adminFirstName : sess.adminFirstName,
                                data: JSON.parse(JSON.stringify(data)),
                                data1:output
                            });
                        })
                    }
                });

            });
        }
    });

    //update hos data process
    app.post('/update_articles', upload.uploadImage('article_image', imagePath), function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        var filename;

        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var input = JSON.parse(JSON.stringify(req.body));
           
            var article_id = input.article_id;

            article_data.findOne({
                '_id': article_id
            }, function(err, data) {

                if (req.files == '') {
                    filename = data.image;
                    console.log(" ok np");
                } else {
                    //filename = data.hospital_logo;
                    if (req.files.length > 0 || req.files != '') {
                        // console.log("1");
                        if (data.image.length) {
                            // console.log("2");
                            if (data.image != null || data.image.length != 0) {
                                // console.log("3");
                                fs.unlink('./public/uploads/articles/' + data.image);
                            }
                        }
                        filename = req.files[0].filename;
                    }
                }

            }).then(function() {
               
                article_data.findOneAndUpdate({
                    _id: article_id
                }, {
                    $set: {
                        'title': input.article_title,
                        'authorName': input.article_author,
                        'content': input.article_content,
                        'image': filename,
                        'state': input.state,
                        'type': input.types,
                        'updatedAt': config.currentTimestamp
                    }
                }, {
                    'new': true
                }, function(err, data) {

                    if (err) {
                        console.log(err);
                        req.flash('error', 'Opps!!!!......Articles data not Updated');
                        res.redirect('/articles');

                    } else {
                        
                        req.flash('success', 'Successful updated Articles Data');
                        res.redirect('/articles');

                    }
                });
            })
        }
    });
    //view each Articles page
    app.get('/view_each_article/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var article_id = req.params.id;
            
            article_data.findOne({
                '_id': article_id
            }, function(err, data) {
                if (err)
                    console.log("Error Selecting : %s ", err);
               
                res.render('admin/view_each_article', {
                    page_title: "View Article Data",
                    navigation: 'articles',
                    adminFirstName : sess.adminFirstName,
                    data: data
                });
            });
        }
    });
    //to delete data
    app.post('/delete_article_data', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));

        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {

            var article_image = input.setvalueimage;
            var article_id = input.setvalue;

            if (article_image != '') {
                if (fs.existsSync('./public/uploads/articles/' + article_image)) {
                    //Delete hospital_logo from folder
                    fs.unlink('./public/uploads/articles/' + article_image);
                }
            }

            article_data.findOneAndRemove({
                    _id: article_id
                },
            function(err, data) {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Articles Data not Deleted');
                    res.redirect('/articles');
                } else {
                    req.flash('success', 'Successful Deleted Articles Data');
                    res.redirect('/articles');
                }
            });
        }
    });
}