var express = require('express');
var bodyParser = require('body-parser');
var config = require(appRoot + '/libs/config');
// var router = express.Router();
// var constant = require(appRoot + '/routes/constants');
var hospital_data = require(appRoot + '/models/op_hospitals');//table hospital data var

var upload = require(appRoot + '/libs/fileupload');
var imgurl = require(appRoot + '/Constants/constant');
var imagePath = "/public/uploads/hospital_logos";

const path = require('path');
var fs = require("fs");

module.exports = function(app) {
    //display all hospital list
    app.get('/hospitals', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            hospital_data.find(function(err, data) {
                res.render('admin/hospitals', {
                    page_title: "All Hospitals",
                    navigation: 'hospitals',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });

    //display add hospital page
    app.get('/add_hospitals', function(req, res, next) {
       var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            res.render('admin/add_hospitals', {
                page_title: "All Hospitals",
                adminFirstName : sess.adminFirstName,
                navigation: 'hospitals',
            });
        }
    });

    //insert hos data process
    app.post('/insert_hospitals', upload.uploadImage('hospital_logo', imagePath), function(req, res, next) {
       var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
        var input = JSON.parse(JSON.stringify(req.body));
        var filename = (!req.files[0]) ? "" : req.files[0].filename; // keep as it is for image 
        var hos_name = input.hospital_name;
        var hos_address = input.hospital_address;
        var hos_specialities = input.hospital_specialities;
        var hos_email = input.hospital_email;
        var about_hos = input.about_hospital;
        var hos_timing = input.hospital_timing1 +'-'+ input.hospital_timing2;
        var hos_phone = input.hospital_phone;
        //create table and save data in the table 
        var hos_data = new hospital_data({
            hospital_name: hos_name,
            hospital_address: hos_address,
            hospital_logo: filename,
            hospital_specialities: hos_specialities,
            hospital_email: hos_email,
            about_hospital: about_hos,
            hospital_timing: hos_timing,
            hospital_phone: hos_phone,
        });
        // save the user
        // console.log(hos_data);
        hos_data.save(function(err, data) {

            if (err) {
                console.log(err);
                    res.render('admin/hospitals', {
                        page_title: "Hospitals List",
                        success: false,
                        msg: 'Hospital data not inserted',
                        // data: data
                    });
                } else {
                    req.flash('success', 'Successful Inserted Hospital data');
                    res.redirect('/hospitals');
                }
            });
        }
    });

    //view each hospital page
    app.get('/view_each_hospital/:id', function(req, res, next) {
       var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
        var hos_id = req.params.id;
        // console.log(hos_id);    
        hospital_data.findOne({'_id':hos_id},function(err, data) {
        if (err)
            console.log("Error Selecting : %s ", err);
            // console.log(data);
            res.render('admin/view_each_hospital', {
                page_title: "View Hospitals Data",
                navigation: 'hospitals',
                adminFirstName : sess.adminFirstName,
                data:data,
            });
        });
    }
    });

    //view edit page
    app.get('/edit_each_hospital/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
        var hos_id = req.params.id;
        // console.log(hos_id);    
        hospital_data.findOne({'_id':hos_id},function(err, data) {
        if (err)
            console.log("Error Selecting : %s ", err);
        console.log(data);
            res.render('admin/edit_each_hospital', {
                page_title: "Edit Hospitals Data",
                navigation: 'hospitals',
                adminFirstName : sess.adminFirstName,
                data:data,
            });
        });
    }
    });

    //update hos data process
    app.post('/update_hospital_data', upload.uploadImage('hospital_logo', imagePath), function(req, res, next) {
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
        var hos_id = input.hospital_id;

        hospital_data.findOne({'_id':hos_id},function(err, data) {
            
            if (req.files == '') {
                filename = data.hospital_logo;
            console.log(" ok np");
            } else {
                //filename = data.hospital_logo;
                if (req.files.length > 0 || req.files != '') {
                    // console.log("1");
                    if(data.hospital_logo.length){
                        // console.log("2");
                        if(data.hospital_logo != null || data.hospital_logo.length != 0){
                            // console.log("3");
                            fs.unlink('./public/uploads/hospital_logos/' + data.hospital_logo);
                        }
                    }
                    filename = req.files[0].filename;
                }
            }
                
        }).then(function(){
           
        var hos_name = input.hospital_name;
        var hos_address = input.hospital_address;
        var hos_specialities = input.hospital_specialities;
        var hos_email = input.hospital_email;
        var about_hos = input.about_hospital;
        var hos_timing = input.hospital_timing1 +'-'+ input.hospital_timing2;
        var hos_phone = input.hospital_phone;

        hospital_data.findOneAndUpdate({
                            _id: hos_id
                        }, {
                            $set: {
                                hospital_name: hos_name,
                                hospital_specialities: hos_specialities,
                                hospital_email: hos_email,
                                hospital_address: hos_address,
                                about_hospital: about_hos,
                                hospital_timing: hos_timing,
                                hospital_phone: hos_phone,
                                hospital_logo: filename
                            }
                        }, {
                            'new': true
                        },function(err, data) {

                    if (err) {
                        console.log(err);
                        req.flash('error', 'Opps!!!!......Hospital data not Updated');
                        res.redirect('/hospitals');
                       
                    } else {
                   
                        req.flash('success', 'Successful updated Hospital data');
                        res.redirect('/hospitals');
                       
                    }
                });
            })    
        }
    });

    //to delete data
    app.post('/delete_hos_data', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));
 
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
        
        var hospital_logo = input.setvalueimage;
        var hos_id = input.setvalue;

        if (hospital_logo != '')
        {
            if (fs.existsSync('./public/uploads/hospital_logos/' + hospital_logo))
            {
                //Delete hospital_logo from folder
                fs.unlink('./public/uploads/hospital_logos/' + hospital_logo);
            }
        }
        
        hospital_data.findOneAndRemove(
                                {_id: hos_id},
                                function(err, data) {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Hospital data not Deleted');
                    res.redirect('/hospitals');
                } else {
                    // console.log(data);
                    req.flash('success', 'Successful Deleted Hospital data');
                    res.redirect('/hospitals');
                }
            });
        }
    });

}

/*
completed single crud operation
*/