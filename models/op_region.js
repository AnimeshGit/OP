var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var RegionOpSchema = new Schema({
    regionName: {
        type: String,
        required: true
    }
});

RegionOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Regions', RegionOpSchema);