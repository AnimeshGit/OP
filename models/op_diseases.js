var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var DiseasesOpSchema = new Schema({
    diagnosisName: {
        type: String,
        required: true
    }
});

DiseasesOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Diseases', DiseasesOpSchema);