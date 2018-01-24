var express = require('express');
var config = require(appRoot + '/libs/config');
var fetch = require('node-fetch');
//var router = express.Router();
// var constant = require(appRoot + '/routes/constants');
// var adminUser = require(appRoot + '/models/op_users');
var groupArray = require('group-array');
var Bookmark = require(appRoot + '/models/op_bookmark');

module.exports = function(app) {

    app.get('/medications', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {

            var headers = {
                //  "Content-Type": "application/json; charset=utf-8",
                "Authorization": "api_key jalksjdflqouweroiu0312749872bh234asfh"
            };

            fetch('http://opcontent.mssphotos.com/api/problemmedslist', {
                    method: 'GET',
                    headers: headers
                })
                .then(function(res) {
                    return res.json();
                }).then(function(json) {
                    // console.log(json.result);
                    // var data = json.result.medicationlist;
                    var result = groupArray(json.result.medicationlist, 'category');
                    var keys = [];
                    var values = [];
                    for (var k in result) {
                        keys.push(k);
                        //values.push(result[k]);
                    }
                    //console.log(result['Anesthetic agents']);
                    var data = {
                        'keys': keys,
                        //'values': values,
                        'result': JSON.stringify(result, null).replace(/\\[n|r]/g, "")
                    };
                    // console.log(data.result);
                    res.render('admin/medications', {
                        page_title: "Medications",
                        adminFirstName : sess.adminFirstName,
                        navigation: 'medications',
                        data: data,

                        // success: req.flash('success'),
                        // error: req.flash('error')
                    });
                });
        }
    });


    // each problem by id
    app.get('/each_medication_id/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var medication_id = req.params.id;
            var userNames = [];
            var headers = {
                //  "Content-Type": "application/json; charset=utf-8",
                "Authorization": "api_key 8efe01aec4381525c7a9f3d2e397d5fbce79c32cda5f19838fb330f363aea314"
            };

            fetch('http://opcontent.mssphotos.com/api/medication/' + medication_id, {
                    method: 'GET',
                    headers: headers
                })
                .then(function(res) {
                    // console.log("///////"+JSON.stringify(res));
                    return res.json();
                }).then(function(json) {
                    Bookmark.find({
                        'medicationId': medication_id
                    }).populate('userId').then(function(userData) {
                        if (userData != null) {
                            userData.forEach(function(userInfo) {
                                userNames.push(userInfo.userId.fullname);
                            })
                        }
                    }).then(function() {
                        var output = {
                            'info': json.result.medication,
                            'userNames': userNames
                        }

                        //console.log("///////" + userNames);
                        res.render('admin/medication_subcategories', {
                            page_title: "Medications Sub_Categories",
                            navigation: 'medications',
                            adminFirstName : sess.adminFirstName,
                            data: output,
                            // success: req.flash('success'),
                            // error: req.flash('error')
                        });
                    })
                });
        }
    });
}