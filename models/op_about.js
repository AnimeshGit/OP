var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var AboutOpSchema = new Schema({
    description: {
        type: String,
        required: true
    }
});

AboutOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_About', AboutOpSchema);