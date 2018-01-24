var express = require('express');
var config = require(appRoot + '/libs/config');
//var router = express.Router();
// var constant = require(appRoot + '/routes/constants');
var caseData = require(appRoot + '/models/op_cases');
var DoctorOpinion = require(appRoot + '/models/op_doctorOpinion');
var QAData = require(appRoot + '/models/op_caseQueryAnswers');
//console.log(caseData);
const path = require('path');
var fs = require("fs");
var ObjectId = require('mongoose').Types.ObjectId;


module.exports = function(app) {
    //show all Unassigned list
    app.get('/cases',function (req,res,next) {
        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
                caseData.find({'isDraft':false}).populate('userId').sort({'createdAt':-1}).then(function(data) {
                    // console.log("dashData"+data);
                    // return;
                    res.render('admin/cases', {
                    page_title: "All Cases",
                    navigation: 'cases',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    })

    //view each case:
    app.get('/view_each_case/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
        var case_id = req.params.id;
        
        caseData.findOne({'_id':case_id}).populate('userId').populate('familyMemberId').then(function(data) {
       
            DoctorOpinion.findOne({'caseId':case_id}).then(function(data1) {               
        
                QAData.findOne({'caseId':case_id}).then(function(data2) {               
            
                        if (data!= null){
                            res.render('admin/view_each_case', {
                                page_title: "View Case Data",
                                navigation: 'view_each_case',
                                data:data,
                                data1:data1,
                                adminFirstName : sess.adminFirstName,
                                data2:data2,
                            });
                        }
                    });
                });
            });
        }
    });

   
 }