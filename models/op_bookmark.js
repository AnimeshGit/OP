var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var BookmarkOpSchema = new Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    bookmarkName: {
        type: String
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Blogs'
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Articles'
    },
    status: {
        type: String,
        default: 'ACTIVE'
    },
    bookmarkType: {
        type: String
    },
    medicationId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    subTitle: {
        type: String
    },
    image: {
        type: String
    },
    name: {
        type: String
    }
});

BookmarkOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Bookmarks', BookmarkOpSchema);