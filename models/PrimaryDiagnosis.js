var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var PrimaryDiagnosys = new Schema({
    "Problem title": {
        type: String
    },
    "Physician Reviewer": {
        type: Number
    },
    "Physician Reviewer Description": {
        type: String
    },
    "Price": {
        type: Number
    },
    "Service Type": {
        type: String
    }
});

PrimaryDiagnosys.plugin(plugin);

module.exports = mongoose.model('PrimaryDiagnosys', PrimaryDiagnosys);