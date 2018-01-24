var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var TermsConditionOpSchema = new Schema({
    description: {
        type: String,
        required: true
    }
});

TermsConditionOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_TermsConditions', TermsConditionOpSchema);