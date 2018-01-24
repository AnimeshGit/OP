var express = require('express');
var config = require(appRoot + '/libs/config');
//var router = express.Router();
// var constant = require(appRoot + '/routes/constants');
var Blog_Data = require(appRoot + '/models/op_blogs');
var config = require(appRoot + '/libs/config');
var imagePath = "/public/uploads/blogs";
var upload = require(appRoot + '/libs/fileupload');

const path = require('path');
var fs = require("fs");


module.exports = function(app) {
    // body...
    app.get('/blogs', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            Blog_Data.find({}).sort({'createdAt':-1}).then(function(data) {
                res.render('admin/blogs', {
                    page_title: "All Blogs",
                    navigation: 'blogs',
                    data: data,
                    adminFirstName : sess.adminFirstName,
                    success: req.flash('success'),
                    error: req.flash('error')
                })
            });
        }
    });

    app.get('/add_blogs', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            res.render('admin/add_blogs', {
                page_title: "Add Blogs",
                adminFirstName : sess.adminFirstName,
                navigation: 'add_blogs',
            });
        }
    });

    app.post('/insert_blogs', upload.uploadImage('blog_image', imagePath), function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var input = JSON.parse(JSON.stringify(req.body));

            var filename = (!req.files[0]) ? "" : req.files[0].filename;

            var op_blog = new Blog_Data({
                title: input.blog_title,
                image: filename,
                authorName: input.blog_author,
                postedDate: config.currentTimestamp,
                content: input.blog_content
            });

            op_blog.save(function(error, data) {
                if (error) {
                    res.render('admin/blogs', {
                        navigation: 'blogs',
                        page_title: "Blog List",
                        success: false,
                        adminFirstName : sess.adminFirstName,
                        msg: 'Blog data not inserted',
                        // data: data
                    });
                } else {
                    req.flash('success', 'Successful Inserted Blog data');
                    res.redirect('/blogs');
                }
            })
        }
    })


    app.get('/edit_each_blog/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var blogId = req.params.id;
          
            Blog_Data.findOne({
                '_id': blogId
            }, function(err, data) {
                if (err)
                    console.log("Error Selecting : %s ", err);
              
                res.render('admin/edit_each_blog', {
                    page_title: "Edit Blog Data",
                    navigation: 'blogs',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                });
            });
        }
    });


    //update hos data process
    app.post('/update_blog_data', upload.uploadImage('blog_image', imagePath), function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        var filename;

        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            // var password;

            var input = JSON.parse(JSON.stringify(req.body));
         
            // return;
            var blogId = input.blog_id;

            Blog_Data.findOne({
                '_id': blogId
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
                                fs.unlink('./public/uploads/blogs/' + data.image);
                            }
                        }
                        filename = req.files[0].filename;
                    }
                }

            }).then(function() {
               
                Blog_Data.findOneAndUpdate({
                    _id: blogId
                }, {
                    $set: {
                        'title': input.blog_title,
                        'authorName': input.blog_author,
                        'content': input.blog_content,
                        'image': filename,
                        adminFirstName : sess.adminFirstName,
                        'updatedAt': config.currentTimestamp
                    }
                }, {
                    'new': true
                }, function(err, data) {

                    if (err) {
                        console.log(err);
                        req.flash('error', 'Opps!!!!......Blogs data not Updated');
                        res.redirect('/blogs');

                    } else {
                      
                        req.flash('success', 'Successful updated Blogs data');
                        res.redirect('/blogs');

                    }
                });
            })
        }
    });


    //view each hospital page
    app.get('/view_each_blog/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var blogId = req.params.id;
           
            Blog_Data.findOne({
                '_id': blogId
            }, function(err, data) {
                if (err)
                    console.log("Error Selecting : %s ", err);
             
                res.render('admin/view_each_blog', {
                    page_title: "View Blog Data",
                    adminFirstName : sess.adminFirstName,
                    navigation: 'blogs',
                    data: data,
                });
            });
        }
    });

    //to delete data
    app.post('/delete_blog_data', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));

        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {

            var blog_image = input.setvalueimage;
            var blog_id = input.setvalue;


            if (blog_image != '') {
                if (fs.existsSync('./public/uploads/blogs/' + blog_image)) {
                    //Delete hospital_logo from folder
                    fs.unlink('./public/uploads/blogs/' + blog_image);
                }
            }

            Blog_Data.findOneAndRemove({
                    _id: blog_id
                },
                function(err, data) {
                    if (err) {
                        console.log(err);
                        req.flash('error', 'Opps!!!!......Blogs Data not Deleted');
                        res.redirect('/blogs');
                    } else {
                       
                        req.flash('success', 'Successful Deleted Blogs Data');
                        res.redirect('/blogs');
                    }
                });
        }
    });

}