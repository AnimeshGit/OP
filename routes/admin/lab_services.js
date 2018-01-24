var express = require('express');
var router = express.Router();
// var mongoXlsx = require('mongo-xlsx');
var obj = appRoot + '/lab_services.txt';

var MongoClient = require('mongodb').MongoClient;

const url = require(appRoot + '/libs/dbConfig');
var jwtAuth = require(appRoot + '/libs/jwtAuth');

router.get('/lab_serv', function(req, res, next) {
    var model = null;
    mongoXlsx.xlsx2MongoData(obj, model, function(err, mongoData) {
        MongoClient.connect(url.mongoUrl, function(err, db) {
            if (err) {
                return console.dir(err);
            } else {
                mongoData.forEach(function(data) {
                    var count = 0;
                    data.forEach(function(output) {
                        db.collection('PrimaryDiagnosis').insert(output, function(err, op) {
                            if (err) {
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
