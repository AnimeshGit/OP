var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var CommentOpSchema = new Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Blogs',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    replies: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Op_User'
        },
        replyToComment: String,
        date: Date
    }]
});

CommentOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Comments', CommentOpSchema);