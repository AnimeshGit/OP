var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var LabOpSchema = new Schema({
    lab_name: {
        type: String
    },
    lab_address: {
        type: String
    },
    lab_logo: {
        type: String
    },
    lab_headline: {
        type: String
    },
    lab_timing: {
        type: String
    },
    lab_email: {
        type: String
    },
    lab_phone: {
        type: String
    },
    tests: [{
        test_name: String,
        test_price: Number
        }],
    about_lab: {
        type: String
    }
});

LabOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Labs', LabOpSchema);