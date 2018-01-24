var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var SearchSchema = new Schema({
    name: {
        type: String
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Blogs'
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Articles'
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
    },
    medicationId: {
        type: mongoose.Schema.Types.ObjectId
    },
    count: {
        type: Number
    },
    searchType: {
        type: String
    },
    image: {
        type: String
    }
})

SearchSchema.plugin(plugin);

module.exports = mongoose.model('Op_Search', SearchSchema);