var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var ArticlesOpSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    state: {
        type: String
    },
    type: {
        type: String
    },
    image: {
        type: String
        // required: true
    },
    authorName: {
        type: String,
        required: true
    },
    postedDate: {
        type: Date,
        required: true
    },
    content: {
        type: String
        // required: true
    },
    likes: {
        type: Number
        // required: true
    },
    status: {
        type: String
    },
    userIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_users'
    }]    
});

ArticlesOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Articles', ArticlesOpSchema);