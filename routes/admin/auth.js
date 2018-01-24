/*
 * GET home page.
 */

var constant = require('./constants.js');
var objMysql = require(appRoot+'/database.js');

exports.index = function(req, res){
res.render('index', {page_title: "Login Page", user_email: sess.email, 
	success: req.flash('success'),
	error: req.flash('error'), 
	base_url: constant.base_url});
    
};

exports.login = function (req, res) {                                 
      res.redirect('/api_user');	                           
};