const PushNotifications = new require('node-pushnotifications');
var objMysql = require(appRoot + '/database.js');
var constants = require(appRoot + '/controller/constants.js');
var scorecardModel = require(appRoot + '/model/scorecardModel.js');
const settings = {
    gcm: {
        id: 'AAAA-Ik-Xlo:APA91bFAGT_yykTU_KSYTjAg-qX6wl9RdiX7K9wTPEBY6yyH85Pxng21UfpC4TcCq1nXBVyj6w05tSrSQ1I1kwJK0QBNrxKHoweCqTLq0EOJ_oMvnlmcp5klp_m6fgrPmEciOG3sa8Fd' //  AIzaSyD0AEM7qMpbCWWxcHEOql-K1KQS7QCkLYo' //AIzaSyCuOM4XLfWR8Hq5nsxaUfJXTOrb48mNQj8
    },
    apn: {
        token: {
            key: appRoot+'/ios_push_notification/key.p12',  // optionally: fs.readFileSync('./certs/key.p8') 
            keyId: 'bendthebar123456',//
            teamId: 'EFGH',
        }
    },
    adm: {
        client_id: null,
        client_secret: null
    },
    wns: {
        client_id: null,
        client_secret: null,
        notificationMethod: 'sendTileSquareBlock'
    }
};
const push = new PushNotifications(settings);

exports.send_notification = function (req, res) {
    // Single destination 
    const registrationIds = 'eWwuslywE5k:APA91bGSnbuhV-8u9Pge0fjBI_RC9gjfikFddBSqEPCmw_pVavTCeXjzluu3KnGbK1uacqkuq2eLtlHCcnzOV2Q3WYau_m8ooVVZgciYtBNdDI_aqaAHWawxjWxRQVHQcgJAo4FZS4P6';
    const data = {
        title: 'Bend the Bar', // REQUIRED 
        body: 'Hi alex...testing notification', // REQUIRED 
        custom: {
            sender: 'twohourbefore',
        },
        priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high' 
        retries: 1 // gcm, apn 
    };
 
    // You can use it in node callback style 
    push.send(registrationIds, data, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            //console.log(result);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({status: '1',statusinfo:result}));
            return;
        }
    });
};

exports.giveOpinion = function (req, res) {
    // Single destination 
    const registrationIds = 'eWwuslywE5k:APA91bGSnbuhV-8u9Pge0fjBI_RC9gjfikFddBSqEPCmw_pVavTCeXjzluu3KnGbK1uacqkuq2eLtlHCcnzOV2Q3WYau_m8ooVVZgciYtBNdDI_aqaAHWawxjWxRQVHQcgJAo4FZS4P6';
    const data = {
        title: 'Bend the Bar', // REQUIRED 
        body: 'Hi alex...testing notification', // REQUIRED 
        custom: {
            sender: 'twohourbefore',
        },
        priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high' 
        retries: 1 // gcm, apn 
    };
 
    // You can use it in node callback style 
    push.send(registrationIds, data, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            //console.log(result);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({status: '1',statusinfo:result}));
            return;
        }
    });
};

