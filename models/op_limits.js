var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var LimitSchema = new Schema({
    caseLimit: {
        type: Number
    },
    followLimit: {
        type: Number
    }
});

LimitSchema.plugin(plugin);
module.exports = mongoose.model('Op_Limits', LimitSchema);