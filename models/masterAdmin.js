var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var MasterSchema = new Schema({
    adminFirstName: {
        type: String,
        required: true
    },
    adminLastName: {
        type: String,
        required: true
    },
    adminEmail: {
        type: String,
        required: true
    },
    adminPassword: {
        type: String,
        required: true
    },
    is_approved:{
        type:Boolean,
        default:false
    }
});

MasterSchema.plugin(plugin);
module.exports = mongoose.model('MasterAdmin', MasterSchema);