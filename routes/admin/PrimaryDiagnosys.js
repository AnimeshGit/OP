var express = require('express');
var config = require(appRoot + '/libs/config');

var PrimaryDiagnosysData = require(appRoot + '/models/PrimaryDiagnosis');

var config = require(appRoot + '/libs/config');
// var imagePath = "/public/uploads/articles";
// var upload = require(appRoot + '/libs/fileupload');
var MongoClient = require('mongodb').MongoClient;
const url = require(appRoot + '/libs/dbConfig');

const path = require('path');
var fs = require("fs");

module.exports = function(app) {
    
    app.get('/PrimaryDiagnosys', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
        res.redirect('/admin_login');
        } else {
             MongoClient.connect(url.mongoUrl, function(err, db) {
                if (err) {
                    return console.dir(err);
                } else {
                    var PriDiagData = db.collection('PrimaryDiagnosisNew1');
                    PriDiagData.find().toArray(function(error, output) {
                        // console.log(output);
                        res.render('admin/PrimaryDiagnosys', {
                            page_title: "All Primary Diagnosis",
                            navigation: 'PrimaryDiagnosys',
                            data: output,
                            adminFirstName : sess.adminFirstName,
                            success: req.flash('success'),
                            error: req.flash('error')
                        });
                    })
                }
            });
        }
    });
    
    // app.get('/add_primary_diagnosys', function(req,res,next) {
    //     var adminId=globalConsTant.AdminSession.adminId;
    //     if (adminId=='') {
    //         res.redirect('/admin_login');
    //     } else{
    //         res.
    //     };
    //     // body...
    // })
    
    // app.post('/insert_primary_diagnosys',function(req,res,next){
    //     var adminId = globalConsTant.AdminSession.adminId;
    //     if (adminId=='') {
    //         res.redirect('/admin_login');
    //     }else{
    //         var doc_name = req.body.doctors_name;
    //         var doc_email = req.body.doctors_email;
    //         var doc_pass = password;
    //         var doc_phone = req.body.doctors_phone;
    //         var doc_dob = req.body.doctors_DOB
    //         var doc_age = req.body.age;
    //         var doc_gender = req.body.gender;
    //         var doc_region = req.body.region;            
    //     }
    // })






}
