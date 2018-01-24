var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');
var blocks = require('./op_blogs');
var users = require('./op_users');

var BlogLikesOpSchema = new Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Blogs',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    }
});

BlogLikesOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Likes', BlogLikesOpSchema);