var express = require('express');
var config = require(appRoot + '/libs/config');

var adminUser = require(appRoot + '/models/op_users');

var upload = require(appRoot + '/libs/fileupload');
var imgurl = require(appRoot + '/Constants/constant');
var imagePath = "/public/uploads/users";
var practicePath = "/public/uploads/practice_photos";
var Rating = require(appRoot + '/models/op_rating');
var _ = require('lodash');

const path = require('path');
var fs = require("fs");
bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);


module.exports = function(app) {
    //show all Doctors list     
    app.get('/doctors', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            adminUser.find({'isDoctor': true}).sort({'createdAt':-1}).then(function(data) {
                res.render('admin/doctors', {
                    page_title: "Doctors List",
                    navigation: 'doctors',
                    data: data,
                    adminFirstName : sess.adminFirstName,
                    success: req.flash('success'),
                    error: req.flash('error')
                });
            });
        }
    });

    //add_doctors
    app.get('/add_doctors', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            res.render('admin/add_doctors', {
                page_title: "Doctors List",
                navigation: 'doctors',
                adminFirstName : sess.adminFirstName,
            });
        }
    });

    //insert doc data process
    app.post('/insert_doctors', upload.uploadImage('doctors_image', imagePath), function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
      
            req.body.doctors_password="12345";

            var filename = (!req.files[0]) ? "" : req.files[0].filename; // keep as it is for image uploading

            password = bcrypt.hashSync(req.body.doctors_password, salt);

            var doc_name = req.body.doctors_name;
            var doc_email = req.body.doctors_email;
            var doc_pass = password;
            var doc_phone = req.body.doctors_phone;
            var doc_dob = req.body.doctors_DOB
            var doc_age = req.body.age;
            var doc_gender = req.body.gender;
            var doc_region = req.body.region;

            var doc_spec = req.body.doctor_specialization;
            var doc_edu = req.body.doctors_education;
            var doc_add = req.body.doctors_address;
            var doc_loc = req.body.doctors_location;
            var doc_fees = req.body.doctors_fees;
            //var doc_hours = req.body.doctors_hours;
            var doc_hours = req.body.doctors_timing1 + '-' + req.body.doctors_timing2;
            var doc_days = req.body.days;
            var doc_abt = req.body.about_doctor;

            var Npi_Num = req.body.npi_number;
            var License_num = req.body.license_number;
            var Total_Pract_years = req.body.total_practice_years;

            var doc_certificate1 = req.body.m_b_certification.splice(req.body.m_b_certification.indexOf(""),1);
            var doc_work_history1 = req.body.work_history.splice(req.body.work_history.indexOf(""),1);
            var doc_award_accolades1 = req.body.awards_accolades.splice(req.body.awards_accolades.indexOf(""),1);

            var doc_practice_state = req.body.practice_state;
            // var doc_award_accolades = req.body.awards_accolades;

            var is_doc = true;

            //create table and save data in the table 
            var doc_data = new adminUser({
                fullname: doc_name,
                email: doc_email,
                password: doc_pass,
                phoneNumber: doc_phone,
                dateOfBirth: doc_dob,
                age: doc_age,
                gender: doc_gender,
                photo: filename,
                region: doc_region,

                doctor_specialization: doc_spec,
                doctor_education: doc_edu,
                address: doc_add,
                doctor_location: doc_loc,
                doctor_fees: doc_fees,
                workingHours: doc_hours,
                workingDays: doc_days,
                about_doctor: doc_abt,

                m_b_certification: req.body.m_b_certification,
                work_history: req.body.work_history,
                awards_accolades: req.body.awards_accolades,

                npi_number: Npi_Num,
                license_number: License_num,
                total_practice_years: Total_Pract_years,

                isDoctor: is_doc
            });
            // save the user
           
            doc_data.save(function(err, data) {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Doctors Data Not Inserted');
                    res.redirect('/doctors');
                } else {
                    req.flash('success', 'Successful Inserted Doctors data');
                    res.redirect('/doctors');
                }
            });
        }
    });


    //view each patient page
    app.get('/view_each_doctor/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var doctor_id = req.params.id;
            adminUser.findOne({
                '_id': doctor_id
            }, function(err, data) {
                if (err)
                {
                    console.log("view_each_doctor = > ", err);
                }
                else
                {
                    Rating.findOne({
                        'doctor_id': doctor_id
                    }, function(err, rating) {
                        console.log("===",rating);
                        res.render('admin/view_each_doctor', {
                        page_title: "View Doctor's Data",
                        navigation: 'doctors',
                        adminFirstName : sess.adminFirstName,
                        data: data,
                        rating: rating
                        });
                    });
                }                
            });
        }
    });

    //displying each edit page 
    app.get('/edit_each_doctor/:id', function(req, res, next) {
        var sess = req.session;
        var adminId = sess.adminId;
       if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var doc_id = req.params.id;
            adminUser.findOne({
                '_id': doc_id
            }, function(err, data) {
                if (err)
                    console.log("Error Selecting : %s ", err);
                res.render('admin/edit_each_doctor', {
                    page_title: "Edit Doctors Data",
                    navigation: 'doctors',
                    adminFirstName : sess.adminFirstName,
                    data: data
                });
            });
        }
    });

    app.post('/update_doctor', upload.uploadImage('doctors_image', imagePath), function(req, res, next) {

        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var input = JSON.parse(JSON.stringify(req.body));

            // var workingDays = req.body.days;

            // console.log("input"+input);
            var photo = input.setvalueimage;
            var doctor_id = input.doctorId;
            var totalHours = input.doctors_timing1 + '-' + input.doctors_timing2;
            
            if (photo != '') {
                if (fs.existsSync('./public/uploads/users/' + photo)) {
                    fs.unlink('./public/uploads/users/' + photo);
                }
            }
            adminUser.findOne({
                _id: doctor_id
            }, function(err, data) {
    
                delete req.body.doctor_id;

                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Doctors Data not Found');
                    res.redirect('/doctors');
                } else {
                    req.body.workingHours = totalHours;
                    req.body.password = bcrypt.hashSync("12345", salt);
                   

                    var doctorData = _.merge(data, req.body);                  
                  
                    doctorData.save(function(error, result) {
                        if (result) {
                       
                            req.flash('success', 'Successful Updated Doctors Data');
                            res.redirect('/doctors');
                        } else {
                            req.flash('error', 'Failed to update doctor data');
                            res.redirect('/doctors');
                        }
                    })

                }
            });
        }
    })

    //to delete data
    app.post('/delete_doctor', function(req, res, next) {
        var input = JSON.parse(JSON.stringify(req.body));

        var sess = req.session;
        var adminId = sess.adminId;
        if (adminId == undefined) {
            res.redirect('/admin_login');
        } else {
            var doctor_image = input.setvalueimage;
            var doctor_id = input.setvalue;
            // return;
            if (doctor_image != '') {
                if (fs.existsSync('./public/uploads/users/' + doctor_image)) {
                    //Delete hospital_logo from folder
                    fs.unlink('./public/uploads/users/' + doctor_image);
                }
            }
            adminUser.findOneAndRemove({
                _id: doctor_id
            }, function(err, data) {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Opps!!!!......Doctors Data not Deleted');
                    res.redirect('/doctors');
                } else {
                    req.flash('success', 'Successful Deleted Doctors Data');
                    res.redirect('/doctors');
                }
            });
        }
    });
}