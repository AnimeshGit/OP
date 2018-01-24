var express = require('express');
var config = require(appRoot + '/libs/config');
//var router = express.Router();
// var constant = require(appRoot + '/routes/constants');
var adminUser = require(appRoot + '/models/op_users');
var dependUsers = require(appRoot + '/models/op_familyhistory');
var caseData = require(appRoot + '/models/op_cases');
var bookmark_data = require(appRoot + '/models/op_bookmark');
var caseQueryAnswers_data = require(appRoot + '/models/op_caseQueryAnswers');
var _ = require('lodash');
const path = require('path');
var fs = require("fs");
var ObjectId = require('mongoose').Types.ObjectId;


module.exports = function(app) {
    //show all petients list     
    app.get('/patients', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
         if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            adminUser.find({'isDoctor':false}).sort({'createdAt':-1}).then(function(data) {
                data.forEach(function(op){
                    // console.log('photo' in op);
                    if ('photo' in op){
                        // console.log(op);
                    }else{
                        console.log("no");
                    }
                })
               
                // return;
                res.render('admin/patients', {
                    page_title: "Patients",
                    navigation: 'patients',
                    data: data,
                    adminFirstName : sess.adminFirstName,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });

    //view each patient page
    app.get('/view_each_patient/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var patient_id = req.params.id;
            // console.log(patient_id);    
            adminUser.findOne({'_id': patient_id}, function(err, data) {
                dependUsers.find({'userId': patient_id}, function(err, data1) {
                caseData.find({'userId': patient_id}, function(err, cases) {
                     bookmark_data.find({'userId': patient_id}, function(err, bookmarks) {
                    if (err)
                        console.log("Error Selecting : %s ", err);
                    
                    res.render('admin/view_each_patient', {
                        page_title: "View Patient's Data",
                        navigation: 'patients',
                        data: data,
                        data1: data1,
                        adminFirstName : sess.adminFirstName,
                        cases: cases,
                        bookmarks : bookmarks
                    });
                    });
                     });
                });
            });
        }
    });

    //to delete patient data
    app.post('/delete_patients', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var patient_img = input.setvalueimage;
            var patient_id = input.setvalue;
            // console.log(patient_id);
            // console.log(patient_img);
            // return;
            if (patient_img != '')
            {
                if (fs.existsSync('./public/uploads/users/' + patient_img))
                {
                    //Delete patient_img from folder
                    fs.unlink('./public/uploads/users/' + patient_img);
                }
            }
            // 
            adminUser.findOneAndRemove({_id: patient_id},function(err, data) {
                dependUsers.deleteMany({userId: patient_id},function(err, data) {
                    caseData.deleteMany({userId: patient_id},function(err, data) {
                        bookmark_data.deleteMany({userId: patient_id},function(err, data) {
                            caseQueryAnswers_data.deleteMany({userId: patient_id},function(err, data) {
                                if (err) {
                                    // console.log(err);
                                    req.flash('error', 'Opps!!!!......Patient data not Deleted');
                                    res.redirect('/patients');
                                } else {
                                    // console.log(data);
                                    req.flash('success', 'Successful Deleted Patient data');
                                    res.redirect('/patients');
                                }
                            });
                        });
                    });
                });
            });
        }
    });

    //view dependents per Id
    app.get('/dependents/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var patient_id = req.params.id;
            // var patient_id = ObjectId("595b619767b8ac1358f10bc5");
            // console.log(patient_id);
            dependUsers.find({
                'userId': patient_id
            }, function(err, data) {
                if (err) 
                    console.log("Error Selecting : %s ", err);
                
                res.render('admin/dependents', {
                    page_title: "View Dependents's List",
                    navigation: 'dependents',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });
    
    //view all dependents
    app.get('/dependents', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            dependUsers.find(function(err, data) {
                if (err)
                    console.log("Error Selecting : %s ", err);
          
                res.render('admin/dependents', {
                    page_title: "View Dependents's List",
                    navigation: 'dependents',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });

    //view each dependents per Id
    app.get('/view_each_dependent/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var dependent_id = req.params.id;
            // var patient_id = ObjectId("595b619767b8ac1358f10bc5");
            // console.log(dependent_id);
            dependUsers.findOne({
                '_id': dependent_id
            }, function(err, data) {
                if (err) 
                     console.log("Error Selecting : %s ", err);
                // console.log(data);
                // return;
                res.render('admin/view_each_dependant', {
                    page_title: "View Each Dependents",
                    navigation: 'dependents',
                    data: data,
                    adminFirstName : sess.adminFirstName,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });

    //to delete data
    app.post('/delete_each_dependent', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));
        var sess = req.session;
        var adminId = sess.adminId;
      if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
        
        var dependent_image = input.setvalueimage;
        var dependent_id = input.setvalue;

        // console.log(dependent_id);
        // console.log(dependent_image);
        // return;
        if (dependent_image != '')
        {
            if (fs.existsSync('./public/uploads/dependents/' + dependent_image))
            {
                //Delete dependent_image from folder
                fs.unlink('./public/uploads/dependents/' + dependent_image);
            }
        }
        
        dependUsers.findOneAndRemove(
                                {_id: dependent_id},
                                function(err, data) {
                if (err) {
                    // console.log(err);
                    req.flash('error', 'Opps!!!!......Dependents data not Deleted');
                    res.redirect('/dependents');
                } else {
                    // console.log(data);
                    req.flash('success', 'Successful Deleted Dependents data');
                    res.redirect('/dependents');
                }
            });
        }
    });
}