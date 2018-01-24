var express = require('express');
var bodyParser = require('body-parser');
var config = require(appRoot + '/libs/config');
// var router = express.Router();
// var constant = require(appRoot + '/routes/constants');
var prices_data = require(appRoot + '/models/op_prices');//table hospital data var

var upload = require(appRoot + '/libs/fileupload');
var imgurl = require(appRoot + '/Constants/constant');
var imagePath = "/public/uploads/hospital_logos";

const path = require('path');
var fs = require("fs");

module.exports = function(app) {
    //display all hospital list
    app.get('/prices', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            prices_data.find(function(err, data) {
                res.render('admin/prices', {
                    page_title: "All Prices",
                    navigation: 'prices',
                    adminFirstName : sess.adminFirstName,
                    data: data,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });

    //display add hospital page
    app.get('/add_prices', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId==undefined) {
            res.redirect('/admin_login');
        } else {
            res.render('admin/add_prices', {
                page_title: "All Prices",
                adminFirstName : sess.adminFirstName,
                navigation: 'add_prices'
            });
        }
    });

    //insert hos data process
    app.post('/insert_prices',function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId==undefined) {
            res.redirect('/admin_login');
        } else {
        // var password;
        var input = JSON.parse(JSON.stringify(req.body));
        console.log(input);
        // return;
        var op_price = new prices_data({
                priceName: input.price_name,
                priceDescription: input.price_desc,
                price: input.amount,
                 adminFirstName : sess.adminFirstName,
                type: input.pricetype
            });

        op_price.save(function(err, data) {

            if (err) {
                console.log(err);
                    res.render('admin/prices', {
                        page_title: "Prices List",
                        success: false,
                        adminFirstName : sess.adminFirstName,
                        msg: 'Prices data not inserted',
                        // data: data
                    });
                } else {
                    req.flash('success', 'Successful Inserted Prices data');
                    res.redirect('/prices');
                }
            });
        }
    });

    //view edit page
    app.get('/edit_each_price/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId==undefined) {
            res.redirect('/admin_login');
        } else {
        
        var price_id = req.params.id;
        
      
        prices_data.findOne({'_id':price_id},function(err, data) {
        if (err)
            console.log("Error Selecting : %s ", err);
       
            res.render('admin/edit_each_price', {
                page_title: "Edit Price Data",
                navigation: 'prices',
                adminFirstName : sess.adminFirstName,
                data:data,
            });
        });
    }
    });

    //update hos data process
    app.post('/update_price_data', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
         var filename;
        if (adminId==undefined) {
            res.redirect('/admin_login');
        } else {
        // var password;
        var input = JSON.parse(JSON.stringify(req.body));
        // return;
        var price_id = input.price_id;
    
        var priceName = input.price_name;
        var priceDescription = input.price_desc;
        var price = input.amount;
        var type = input.pricetype;

        prices_data.findOneAndUpdate({
                            _id: price_id
                        }, {
                            $set: {
                                'priceName': priceName,
                                'priceDescription': priceDescription,
                                'price': price,
                                'type': type
                            }
                        }, {
                            'new': true
                        },function(err, data) {

                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Price data not Updated');
                    res.redirect('/prices');
                   
                } else {
                    
                    req.flash('success', 'Successful updated Price data');
                    res.redirect('/prices');
                   
                }
            });  
        }
    });


 //view each hospital page
    app.get('/view_each_price/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId==undefined) {
            res.redirect('/admin_login');
        } else {
        var price_id = req.params.id;
        console.log(price_id);    
        prices_data.findOne({'_id':price_id},function(err, data) {
        if (err)
            console.log("Error Selecting : %s ", err);
            console.log(data);
            res.render('admin/view_each_price', {
                page_title: "View Price Data",
                navigation: 'prices',
                adminFirstName : sess.adminFirstName,
                data:data,
                // success: req.flash('success'),
                // error: req.flash('error')
            });
        });
    }
    });
//to delete data
    app.post('/delete_price_data', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId==undefined) {
            res.redirect('/admin_login');
        } else {
        
        var price_id = input.setvalue;

        prices_data.findOneAndRemove(
                                {_id: price_id},
                                function(err, data) {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Price data not Deleted');
                    res.redirect('/prices');
                } else {
                    console.log(data);
                    req.flash('success', 'Successful Deleted Price data');
                    res.redirect('/prices');
                }
            });
        }
    });

}
