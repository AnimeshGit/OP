var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var PharmacyOpSchema = new Schema({
    pharmacy_name: {
        type: String
    },
    pharmacy_logo: {
        type: String
    },
    pharmacy_tagline: {
        type: String
    },
    pharmacy_timing: {
        type: String
    },
    pharmacy_email: {
        type: String
    },
    pharmacy_phone: {
        type: String
    },
    pharmacy_address: {
        type: String
    },
    about_pharmacy: {
        type: String
    }
});

PharmacyOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Pharmacy', PharmacyOpSchema);