var express = require('express');
var bodyParser = require('body-parser');
var config = require(appRoot + '/libs/config');

var pharmacy_data = require(appRoot + '/models/op_pharmacy'); //table pharmacy data var

var upload = require(appRoot + '/libs/fileupload');
var imgurl = require(appRoot + '/Constants/constant');
var imagePath = "/public/uploads/pharmacy_logos";

const path = require('path');
var fs = require("fs");

module.exports = function(app) {
    //display all pharmacy list
    app.get('/pharmacy', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            pharmacy_data.find(function(err, data) {
                // return;
                res.render('admin/pharmacy', {
                    page_title: "Pharmacy List",
                    navigation: 'pharmacy',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });

    //display add pharmacy page
    app.get('/add_pharmacy', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            res.render('admin/add_pharmacy', {
                page_title: "All Pharmacy",
                adminFirstName : sess.adminFirstName,
                navigation: 'add_pharmacy',
            });
        }
    });

    //insert hos data process
    app.post('/insert_pharmacy', upload.uploadImage('pharmacy_logo', imagePath), function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            // var password;
            var input = JSON.parse(JSON.stringify(req.body));
            // return;
            var filename = (!req.files[0]) ? "" : req.files[0].filename; // keep as it is for image uploading
            // console.log(filename);
            var pharm_name = input.pharmacy_name;
            var pharm_tagline = input.pharmacy_tagline;
            var pharm_email = input.pharmacy_email;
            var about_pharm = input.about_pharmacy;
            var pharm_address = input.pharmacy_address;
            var pharm_timing = input.pharmacy_timing1 + '-' + input.pharmacy_timing2;
            var pharm_phone = input.pharmacy_phone;
            //create table and save data in the table 
            var pharm_data = new pharmacy_data({
                pharmacy_name: pharm_name,
                pharmacy_logo: filename,
                pharmacy_tagline: pharm_tagline,
                pharmacy_email: pharm_email,
                about_pharmacy: about_pharm,
                pharmacy_address: pharm_address,
                pharmacy_timing: pharm_timing,
                pharmacy_phone: pharm_phone,
            });
            // save the user
            // console.log(pharm_data);
            pharm_data.save(function(err, data) {

                if (err) {
                    console.log(err);
                    req.flash('error', 'Pharmacy data not inserted');
                    res.redirect('/pharmacy');

                } else {
                    req.flash('success', 'Successful Inserted Pharmacy data');
                    res.redirect('/pharmacy');
                }
            });
        }
    });

    //view edit page
    app.get('/edit_each_pharmacy/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var pharm_id = req.params.id;
         
            pharmacy_data.findOne({
                '_id': pharm_id
            }, function(err, data) {
                if (err)
                    console.log("Error Selecting : %s ", err);
               
                res.render('admin/edit_each_pharmacy', {
                    page_title: "Edit Pharmacy Data",
                    navigation: 'pharmacy',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                });
            });
        }
    });

    //view each pharmacy page
    app.get('/view_each_pharmacy/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var pharm_id = req.params.id;
       
            pharmacy_data.findOne({
                '_id': pharm_id
            }, function(err, data) {
                if (err)
                    console.log("Error Selecting : %s ", err);
                console.log(data);
                res.render('admin/view_each_pharmacy', {
                    page_title: "View Pharmacy Data",
                    navigation: 'pharmacy',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                });
            });
        }
    });

    //update hos data process
    // app.post('update_pharmacy_data', upload.uploadImage('pharmacy_logos', 'pharmacy_logo'), function(req, res, next) {
    //     var adminId =  globalConsTant.AdminSession.adminId;
    //     if (adminId == '') {
    //         res.redirect('/admin_login');
    //     } else {
    //     // var password;
    //     var input = JSON.parse(JSON.stringify(req.body));
    //     console.log(input);
    //     // return;
    //     var filename = (!req.files[0]) ? "" : req.files[0].filename; // keep as it is for image uploading
    //     if (filename == '')
    //         var filename = '';
    //     var pharm_id = input.pharmacy_id;
    //     var pharm_name = input.pharmacy_name;
    //     var pharm_tagline = input.pharmacy_tagline;
    //     var pharm_email = input.pharmacy_email;
    //     var about_pharm = input.about_pharmacy;
    //     var pharm_address = input.pharmacy_address;
    //     var pharm_timing = input.pharmacy_timing;
    //     var pharm_phone = input.pharmacy_phone;

    //     pharmacy_data.findOneAndUpdate({
    //                         _id: pharm_id
    //                     }, {
    //                         $set: {
    //                             pharmacy_name: pharm_name,
    //                             pharmacy_logo: filename,
    //                             pharmacy_tagline: pharm_tagline,
    //                             pharmacy_email: pharm_email,
    //                             about_pharmacy: about_pharm,
    //                             pharmacy_address: pharm_address,
    //                             pharmacy_timing: pharm_timing,
    //                             pharmacy_phone: pharm_phone,
    //                         }
    //                     }, {
    //                         'new': true
    //                     },function(err, data) {

    //             if (err) {
    //                 console.log(err);
    //                 req.flash('error', 'Opps!!!!......Pharmacy data not Updated');
    //                 res.redirect('/pharmacy');

    //             } else {
    //                 console.log(data);
    //                 req.flash('success', 'Successful updated Pharmacy data');
    //                 res.redirect('/pharmacy');
    //             }
    //         });
    //     }
    // });

    //update hos data process
    app.post('/update_pharmacy_data', upload.uploadImage('pharmacy_logo', imagePath), function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        var filename;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            // var password;
            var input = JSON.parse(JSON.stringify(req.body));
            // console.log(input);
            // return;
            var pharm_id = input.pharmacy_id;

            pharmacy_data.findOne({
                '_id': pharm_id
            }, function(err, data) {

                if (req.files == '') {
                    filename = data.pharmacy_logo;
                    console.log(" ok np");
                } else {
                    //filename = data.hospital_logo;
                    if (req.files.length > 0 || req.files != '') {
                        // console.log("1");
                        if (data.pharmacy_logo.length) {
                            // console.log("2");
                            if (data.pharmacy_logo != null || data.pharmacy_logo.length != 0) {
                                // console.log("3");
                                fs.unlink('./public/uploads/pharmacy_logos/' + data.pharmacy_logo);
                            }
                        }
                        filename = req.files[0].filename;
                    }
                }

            }).then(function() {
               
                var pharm_name = input.pharmacy_name;
                var pharm_tagline = input.pharmacy_tagline;
                var pharm_email = input.pharmacy_email;
                var about_pharm = input.about_pharmacy;
                var pharm_address = input.pharmacy_address;
                //var pharm_timing = input.pharmacy_timing;
                 var pharm_timing = input.pharmacy_timing1 + '-' + input.pharmacy_timing2;
                var pharm_phone = input.pharmacy_phone;

                pharmacy_data.findOneAndUpdate({
                    _id: pharm_id
                }, {
                    $set: {
                        pharmacy_name: pharm_name,
                        pharmacy_logo: filename,
                        pharmacy_tagline: pharm_tagline,
                        pharmacy_email: pharm_email,
                        about_pharmacy: about_pharm,
                        pharmacy_address: pharm_address,
                        pharmacy_timing: pharm_timing,
                        pharmacy_phone: pharm_phone,
                    }
                }, {
                    'new': true
                }, function(err, data) {

                    if (err) {
                        console.log(err);
                        req.flash('error', 'Opps!!!!......Pharmacy data not Updated');
                        res.redirect('/pharmacy');

                    } else {
                     
                        req.flash('success', 'Successful updated Pharmacy data');
                        res.redirect('/pharmacy');

                    }
                });
            })
        }
    });



    //to delete data
    app.post('/delete_pharm_data', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));

        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {

            var pharm_logo = input.setvalueimage;
            var pharm_id = input.setvalue;

            if (pharm_logo != '') {
                if (fs.existsSync('./public/uploads/pharmacy_logos/' + pharm_logo)) {
                    //Delete pharmacy_logos from folder
                    fs.unlink('./public/uploads/pharmacy_logos/' + pharm_logo);
                }
            }

            pharmacy_data.findOneAndRemove({
                    _id: pharm_id
                },
                function(err, data) {
                    if (err) {
                        console.log(err);
                        req.flash('error', 'Opps!!!!......Pharmacy data not Deleted');
                        res.redirect('/pharmacy');
                    } else {
                        
                        req.flash('success', 'Successful Deleted Pharmacy data');
                        res.redirect('/pharmacy');
                    }
                });
        }
    });
}