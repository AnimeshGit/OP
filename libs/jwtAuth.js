var config = require('./config.js');
var jwt = require('jsonwebtoken');
var Promise = require("promise");
var userToken = require(appRoot + '/models/op_token');

module.exports = {
    checkAuth: function(req, err) {
        var token = req;
        return new Promise(function(resolve, reject) {
            // decode token
            if (token) {
                // verifies secret and checks exp
                //var secret = new Buffer(config.secret, "base64").toString();
                //var abcd = jwt.verify(token, secret);
                //console.log("secret" + config.secret);
                jwt.verify(token, config.secret, function(err, decoded) {
                    if (err) {
                        reject(err);
                    } else {
                        //console.log("here is user id " + JSON.stringify(decoded));
                        var userId = decoded.id;
                        userToken.findOne({
                            userId: decoded.id
                        }).then(function(userTokenDetails) {
                            //console.log("=>"+userTokenDetails);
                            if (userTokenDetails.token == token) {
                                var response = {
                                    success: true,
                                    message: 'User Authenticated',
                                    userId: userTokenDetails.userId
                                };
                                resolve(response);
                            } else {
                                console.log("JWT Token miss match => " + err);                               
                                reject(err);
                            }
                        }).catch(function(error){
                            console.log("Error in JWT checkAuth => " + err);                               
                                reject(err);
                        });
                    }
                });
            } else {
                console.log(err);
                reject(err);
            }
        });
    }
};