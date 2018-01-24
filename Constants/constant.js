'use strict';

var keys = {
	'DB': {
		'STATUS': {
			'INPROGRESS'  : 'inprogress',
			'ASSIGNED'	  : 'assigned',
			'UNASSIGNED'  : 'unassigned',
			'COMPLETED'	  : 'completed',
		}
	},
	'baseUrl':'http://localhost:8000/',
	'ASSETS':'baseUrl/assets/',
	'contactEmail': 'contact@opinionplus.com',
	'imageUrl':'uploads/'
	// 'AdminSession' : {
	// 				'adminId' 		: '',
	// 				'adminEmail' 	: '',
	// 				'adminFirstName': '',
	// 				'adminLastName': '',
	// 			}
};

module.exports = keys;