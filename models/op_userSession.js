var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var SessionSchema = new Schema({
    apiName: {
        type: String
    },
    startTime: {
        type: Date
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    endTime: {
        type: Date
    }
})

SessionSchema.plugin(plugin);

module.exports = mongoose.model('Op_UserSession', SessionSchema);