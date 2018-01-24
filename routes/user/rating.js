var express = require('express');
var router = express.Router();

var Rating = require(appRoot + '/models/op_rating');
var AppRating = require(appRoot + '/models/op_app_rating');

var jwtAuth = require(appRoot + '/libs/jwtAuth');
var config = require(appRoot + '/libs/config');
var math = require("mathjs");
var case_email = require(appRoot + '/message.json'); 
var UserSession = require(appRoot + '/models/op_userSession');
const CONSTANTS = require(appRoot + '/Constants/constant');

router.post('/rate_on_it',	function(req,res,next) {
	var token = req.headers['accesstoken'];
	jwtAuth.checkAuth(token).then(function(result) {
		// var user_id = req.body.user_id;
		var patient_id = req.body.patient_id;
		var doctor_id = req.body.doctor_id;
		var rate_for_doctor = req.body.rate_for_doctor;
		// var rate_to_recommend_app = req.body.rate_to_recommend_app;
		var comments = req.body.comments;

            Rating.update({
                'doctor_id':doctor_id
            },{$set:
                {
                    "patient_id":patient_id,
                    "rate_for_doctor":rate_for_doctor,
                    "comments":comments
                }
            },{upsert: true}).then(function(RateData) {
                console.log("RatingData->"+RateData);
                
                // AppRating.update({
                //     'user_id':patient_id
                // },{$set:
                //     {
                //         "rate_to_recommend_app":rate_to_recommend_app
                //     }
                // },{upsert:true}).then(function(AppRateData) {
                               
                        var userSession = new UserSession({
                            'userId': patient_id,
                            'apiName': "User Rate the Doctor"
                        });
                        // var text = comments;
                        var subject = case_email.case_feedback.case_feedback_title;
                        // var text = case_email.case_feedback.case_feedback_body;
                        //     text += '\n\n'+comments;
                        
                        var mail_receiver = CONSTANTS.contactEmail;
                        
                        // config.sendMail(mail_receiver.toLowerCase(), text, subject).then(function(result, error) {
                        //     if (error) {
                        //         console.log(error);
                        //     }
                        // });

                        //----------email template code--------
                        // var feedback_mail = {
                        //     to : mail_receiver.toLowerCase(),
                        //     subject :  subject,
                        //     template : 'feedback_mail.ejs',
                        //     content : {
                        //             // first_name : patient_name,
                        //             case_no : case_no
                        //         }
                        // };
                        // config.sendEmailTemplate(feedback_mail);
                        //---------------

                        userSession.save(function(er, db) {
                        res.json({
                                success: true,
                                msg: "Patient Rated Doctor Successfully",
                                data: RateData
                                // data2: AppRateData
                            });
                            return;
                        });
                    // }).catch(function(error) {
        	        //     res.json({
        	        //         'success': false,
        	        //         'msg': "Something went wrong while giving Rating for App"
        	        //     });
        	        //     return;
        	        // })
                }).catch(function(error) {
                    console.log(error);
                    res.json({
                        'success': false,
                        'msg': "Something went wrong while giving Rating for Doctor"
                    });
                    return;
                })
    }).catch(function(error) {
		res.json({
			success:false,
			msg:"Authentication failed"
		});
		return;
	})
})

router.post('/getRating', function(req, res, next) {
    var token = req.headers['accesstoken'];
    jwtAuth.checkAuth(token).then(function(result) {
        Rating.find({
            'doctor_id': req.body.doctor_id
        }).then(function(RatingInfo) {
            if (RatingInfo != null) {
            	var ratingCount = RatingInfo.length;
            	console.log("ratingCount"+ratingCount);
                
                for (var i = 0; i < RatingInfo.length; i++) {
            		var addition = math.add(RatingInfo[i]);
                    console.log("addition"+addition);
            	};

                var userSession = new UserSession({
                    'userId': caseInfo.userId,
                    'apiName': "User viewed his case"
                });
                userSession.save(function(er, db) {
                    if (er) {
                        res.json({
                            'success': false,
                            'msg': "failed to add user session data"
                        })
                    }
                })
                res.json({
                    success: true,
                    msg: "Doctors RatingInfo fetched successfully",
                    data: caseInfo
                });
                return;
            } else {
                res.json({
                    success: false,
                    msg: "Please enter valid Doctor Id"
                });
                return;
            }
        }).catch(function(error) {
            res.json({
                success: false,
                msg: "Failed to fetched RatingInfo"
            });
            return;
        })
    }).catch(function(error) {
        res.json({
            success: false,
            msg: "Authentication Failed"
        });
        return;
    })
})

module.exports = router;
