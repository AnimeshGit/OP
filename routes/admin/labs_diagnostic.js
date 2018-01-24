var express = require('express');
var config = require(appRoot + '/libs/config');

var lab_data = require(appRoot + '/models/op_labs');
var _ = require('lodash');
var config = require(appRoot + '/libs/config');
var imagePath = "/public/uploads/labs";
var upload = require(appRoot + '/libs/fileupload');
var MongoClient = require('mongodb').MongoClient;
const url = require(appRoot + '/libs/dbConfig');

const path = require('path');
var fs = require("fs");

module.exports=function (app) {

	// body...
	app.get('/labs_diagnostic', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            lab_data.find(function(err, data) {
                // console.log(data);
                res.render('admin/labs_diagnostic', {
                    page_title: "All labs_diagnostic",
                    navigation: 'labs_diagnostic',
                    data: data,
                    adminFirstName : sess.adminFirstName,
                    success: req.flash('success'),
                    error: req.flash('error')

                });
            });
        }
    });

    app.get('/add_labs', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            MongoClient.connect(url.mongoUrl, function(err, db) {
                if (err) {
                    return console.dir(err);
                } else {
                    var test_offered = db.collection('op_labServices');
                    test_offered.find().toArray(function(error, output) {
                    // console.log(output);

                    res.render('admin/add_labs', {
                        page_title: "Add Labs",
                        adminFirstName : sess.adminFirstName,
                        navigation: 'labs_diagnostic',
                        data:output
                    });
                })
                }
            })
        }
    });

    app.post('/insert_labs', upload.uploadImage('lab_logo',imagePath),function(req,res,next){
        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var input = JSON.parse(JSON.stringify(req.body));
            // console.log(input);
            // return;
            var filename = (!req.files[0]) ? "" : req.files[0].filename;
            // console.log(filename);
            // return;
            
            // console.log("counter is "+ input.ivalue);
            var arr = [];

            var testData = {
                'test_id':input.test,
                'test_price':input.pre_price
            }
            arr.push(testData);

            for (var i = 0; i <=input.ivalue; i++) {
                (function(j){
                    var newTest = 'test'+i;

                    if(j != 0){
                        var result ={
                            'test_id':input['test'+j],
                            'test_price':input['pre_price'+j]
                        }
                        arr.push(result);   
                    }
                })(i);
            };

            var op_labs = new lab_data({
                lab_name     : input.lab_name,
                lab_address  : input.lab_address,
                lab_logo     : filename,
                lab_headline : input.lab_headline,
                lab_timing   : input.laboratory_timing1 + "-" + input.laboratory_timing2,
                lab_email    : input.lab_email,
                lab_phone    : input.lab_phone,
                about_lab    : input.about_lab,
                tests:arr
            });

            op_labs.save(function(error,data){
                if(error)
                {
                    req.flash('error', 'Successful Inserted Laboratory data');
                    res.redirect('/labs_diagnostic');
                }else{
                    req.flash('success', 'Successful Inserted Laboratory data');
                    res.redirect('/labs_diagnostic');
                }
            })
        }
    })

    //displying each edit page 
    app.get('/edit_each_lab/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var lab_id = req.params.id;
            
            lab_data.findOne({'_id':lab_id},function(err, data) {
                console.log(data);
                // return;

                MongoClient.connect(url.mongoUrl, function(err, db) {
                    if (err) {
                        return console.dir(err);
                    } else {
                        var test_offered = db.collection('op_labServices');
                        test_offered.find().toArray(function(error, output) {
                            // console.log(output);
                            // return;

                            if (err)
                                console.log("Error Selecting : %s ", err);

                            res.render('admin/edit_each_lab', {
                                page_title: "Edit Laboratory Data",
                                navigation: 'labs_diagnostic',
                                success: req.flash('success'),
                                adminFirstName : sess.adminFirstName,
                                error: req.flash('error'),
                                data: data,
                                test_data: output

                            });
                        })
                    }
                })
            });
        }
    });

    //update hos data process
    app.post('/update_labs', upload.uploadImage('lab_logo', imagePath), function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        var originalName;
        var oldImage;
        var labData ;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
        var input = JSON.parse(JSON.stringify(req.body));
        var lab_id = input.lab_id;
    
        lab_data.findOne({'_id':lab_id},function(err, data) {
            oldImage = data.lab_logo;
            labData = data;
            if (req.files == '') {                        
                console.log(" ok no file");
            } else {
                    //oldImage = data.lab_logo;
                    if (req.files.length > 0 || req.files != '') {
                        if(data.lab_logo != null || data.lab_logo != undefined){
                           if(data.lab_logo.length){
                                if(data.lab_logo != null || data.lab_logo.length != 0){
                             
                                fs.unlink('./public/uploads/labs/' + data.lab_logo);
                            }
                        } 
                    }                
                    originalName = req.files[0].filename;
                    req.body.lab_logo = originalName;
                }
            }
        }).then(function(){  
           var testPrices = [];
           if(!Array.isArray(input.test_names) || !Array.isArray(input.pre_prices)) {         
                var insertTestPrice ={
                    'test_id':input.test_names,
                    'test_price':input.pre_prices
                };
            testPrices.push(insertTestPrice);
            }else{
            if(input.test_names.length >0){
             
                for(var i = 0; i < input.test_names.length; i++){
                (function(j){             
                var  insertTestPrice ;
                    for(var k = 0;k<input.pre_prices.length; k++){
                        (function(m){
                              insertTestPrice = {
                            'test_id':input.test_names[j],
                            'test_price':input.pre_prices[m]
                            }
                        })(j);
                    }
                    testPrices.push(insertTestPrice);  
                })(i);                               
             }
            }   
        }
            if(input.ivalue >0){
             
                for (var l = 0; l <=input.ivalue; l++) {
                (function(n){
                    var newTest = 'test'+l;

                    if(n != 0){
                        var result ={
                            'test_id':input['test'+n],
                            'test_price':input['pre_price'+n]
                        }
                        testPrices.push(result);   
                    }
                })(l);
               }
            }
            req.body.tests = testPrices;
            var updateLabData = _.merge(labData,req.body);
            
            updateLabData.save(function(error,updatedData){
                if(error){
                    console.log(error);
                        req.flash('error', 'Opps!!!!......Laboratory data not Updated');
                        res.redirect('/labs_diagnostic');
                }else{
           
                        req.flash('success', 'Successful Updated Laboratory Data');
                        res.redirect('/labs_diagnostic');
                    }
            })
             /*console.log(originalName);
             console.log(oldImage);
            // return;
            if(originalName != null || originalName != undefined){
                input.lab_logo = originalName;
                console.log(input.lab_logo);
            }else {
                input.lab_logo = oldImage;
                console.log(input.lab_logo);
            }*/

       /* lab_data.findOneAndUpdate({
                            _id: lab_id
                        }, {
                            $set: {
                                lab_name     : input.lab_name,
                                lab_address  : input.lab_address,
                                lab_logo     : input.lab_logo,
                                lab_headline : input.lab_headline,
                                lab_timing   : input.laboratory_timing,
                                lab_email    : input.lab_email,
                                lab_phone    : input.lab_phone,
                                about_lab    : input.about_lab,                  
                                    tests:testPrices
                            }
                        }, {
                            'new': true
                        },function(err, data) {

                    if (err) {
                        console.log(err);
                        req.flash('error', 'Opps!!!!......Laboratory data not Updated');
                        res.redirect('/labs_diagnostic');

                    } else {
                        console.log("final_data_Edit"+data);
                        req.flash('success', 'Successful Updated Laboratory Data');
                        res.redirect('/labs_diagnostic');

                    }
                });*/
            })    
        }
    });



    //view each Articles page
    app.get('/view_each_lab/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
        res.redirect('/admin_login');
        } else {
        var lab_id = req.params.id;
        
            lab_data.findOne({'_id':lab_id},function(err, data) {
                if (err)
                    console.log("Error Selecting : %s ", err);
                // console.log(data);
                res.render('admin/view_each_lab', {
                    page_title: "View Laboratory Data",
                    navigation: 'labs_diagnostic',
                    adminFirstName : sess.adminFirstName,
                    data:data,
                });
            });
        }
    });

    //to delete data
    app.post('/delete_lab_data', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));

        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {

            var lab_image = input.setvalueimage;
            var lab_id = input.setvalue;

        if (lab_image != '')
        {
            if (fs.existsSync('./public/uploads/labs/' + lab_image))
            {
                //Delete hospital_logo from folder
                fs.unlink('./public/uploads/labs/' + lab_image);
            }
        }
        
        lab_data.findOneAndRemove(
            {_id: lab_id},
            function(err, data) {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Laboratory Data not Deleted');
                    res.redirect('/labs_diagnostic');
                } else {
                    // console.log(data);
                    req.flash('success', 'Successful Deleted Laboratory Data');
                    res.redirect('/labs_diagnostic');
                }
            });
        }
    });

    //to delete each data
    app.post('/delete_each_test_data', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var labId = input.labId;;
            var test_id = input.setvalue;
        
        lab_data.update(
            {'_id': labId }, 
            { $pull: 
                { "tests" : 
                    { _id: test_id } 
                }
            },
            
            function(err, data) {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Test Data not Deleted');
                    res.redirect('/edit_each_lab/'+labId);
                } else {
                    console.log("deleted tests"+data);
                    req.flash('success', 'Successful Deleted Test Data');
                    res.redirect('/edit_each_lab/'+labId);
                }
            });
        }
    });

}