var express = require('express');
var router = express.Router();
var mongoXlsx = require('mongo-xlsx');
var obj = appRoot + '/primary_diag_new.xlsx';
var UserSession = require(appRoot + '/models/op_userSession');
var MongoClient = require('mongodb').MongoClient;
const url = require(appRoot + '/libs/dbConfig');
var jwtAuth = require(appRoot + '/libs/jwtAuth');

/*
Input Parameter : List_of_PrimaryDiagnosis_Services_1.xlsx
Description : Parse all the data from file and insert into the database
*/
router.get('/test', function(req, res, next) {
    var model = null;
    mongoXlsx.xlsx2MongoData(obj, model, function(err, mongoData) {
        MongoClient.connect(url.mongoUrl, function(err, db) {
            if (err) {
                return console.dir("=="+err);
            } else {
                console.log(mongoData);
                mongoData.forEach(function(data) {
                    var count = 0;
                    data.forEach(function(output) {
                        db.collection('PrimaryDiagnosisNew1').insert(output, function(err, op) {
                            if (err) {
                                console.log("errrrrrrrr======>"+err);
                                res.send(err);
                                
                            } else {
                                count = count + 1;
                            }
                            if (count == data.length) {
                                res.send("added successfully");
                                
                            }
                        })
                    })

                })
            }
        });
    });
})

/* 
Description : Get all the primery diagnosis
*/
router.post('/getAllPrimeryDiagnosis', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        MongoClient.connect(url.mongoUrl, function(err, db) {
            if (err) {
                return console.dir(err);
            } else {
                var collection = db.collection('PrimaryDiagnosisNew1');
                collection.find().toArray(function(error, output) {
                    if (output.length > 0) {
                        var arr = [];
                        var count = 0;
                        output.forEach(function(data) {
                            var newData = {
                                '_id': data['_id'],
                                'problem_title': data['Problem title'],
                                'physician_reviewer': data['Physician Reviewer'],
                                'physicain_reviewer_Description': data['Physicain Reviewer Description'],
                                // 'service_type': data['Service Type'],
                                'price': data['price']

                            };
                            arr.push(newData);
                            count = count + 1;
                            if (output.length == count) {
                                var userSession = new UserSession({
                                    'userId': result.userId,
                                    'apiName': "User viewed all primery diagnosis"
                                });
                                userSession.save(function(er, db) {
                                    if (er) {
                                        res.json({
                                            'success': false,
                                            'msg': "failed to add user session data"
                                        });
                                        return;
                                    } else {
                                        res.json({
                                            'success': true,
                                            'msg': "Featched all Primary Diagnosis successfully",
                                            'data': arr
                                        });
                                        return;
                                    }
                                })
                            }
                        })
                    } else {
                        res.json({
                            'success': false,
                            'msg': "Somthing went wrong while fetching primary Diagnosis"
                        });
                        return;
                    }
                })
            }
        });
    }).catch(function(error) {
        res.json({
            'success': false,
            'msg': "Authentication failed"
        });
        return;
    })
})

module.exports = router;