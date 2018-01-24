var express = require('express');
var config = require(appRoot + '/libs/config');
//var router = express.Router();
// var constant = require(appRoot + '/routes/constants');
var fetch = require('node-fetch');
var md = require("markdown").markdown;
//var marked = require('marked');
var groupArray = require('group-array');
// var adminUser = require(appRoot + '/models/op_users');

module.exports = function(app) {

    app.get('/problems', function(req, res, next) {
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
                    //var data = json.result.problemslist;
                    var result = groupArray(json.result.problemslist, 'category');
                    //console.log(result);
                    var keys = [];
                    var values = [];
                    for (var k in result) {
                        keys.push(k);
                        //values.push(result[k]);
                    }
                    var data = {
                        'keys': keys,
                        //'values': values,
                        'result': JSON.stringify(result).replace(/'/g, "\\'")
                    };
                    // var data2 = json.result.problemslist.display_name;
                    //console.log(data.values[0].length);
                    res.render('admin/problems', {
                        page_title: "Problems Categories",
                        navigation: 'problems',
                        adminFirstName : sess.adminFirstName,
                        data: data,

                        // success: req.flash('success'),
                        // error: req.flash('error')
                    });

                });
        }
    });


    // each problem by id
    app.get('/each_problem_id/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == '') {
            res.redirect('/admin_login');
        } else {
            var problem_id = req.params.id;
            // console.log("****************" + problem_id);
            // return;

            var headers = {
                //  "Content-Type": "application/json; charset=utf-8",
                "Authorization": "api_key 8efe01aec4381525c7a9f3d2e397d5fbce79c32cda5f19838fb330f363aea314"
            };

            fetch('http://opcontent.mssphotos.com/api/problemcontentengbyid/' + problem_id, {
                    method: 'GET',
                    headers: headers
                })
                .then(function(res) {
                    // console.log("///////"+JSON.stringify(res));
                    return res.json();
                }).then(function(json) {
                    // console.log(json);
                    // return;
                    var data = json.result.problemcontent;
                    // var tree = md.parse(data);
                    // console.log(data.ghost_json_data[0].markdown);
                    //console.log(arr);
                   // return;
                    res.render('admin/problems_subcategories', {
                        page_title: "Problems Sub_Categories",
                        navigation: 'problems',
                        adminFirstName : sess.adminFirstName,
                        data: data,
                        // success: req.flash('success'),
                        // error: req.flash('error')
                    });

                });
        }
    });



    // app.get('/problems_sub_cat', function(req, res, next) {
    //     /*var sess = req.session;
    //     console.log(sess.admin_id);
    //     if (sess.admin_id != undefined && sess.admin_id != '') {
    //         res.redirect('/admin/dashboard');
    //     } else {*/
    //     res.render('admin/problems_sub_cat', {
    //         page_title: "Problems Sub Categories ",
    //         navigation: 'problems_sub_cat',

    //         // success: req.flash('success'),
    //         // error: req.flash('error')
    //     });
    //     // }
    // });

}