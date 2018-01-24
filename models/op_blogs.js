var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var BlogsOpSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        //ref: 'Op_User',
        //required: true
    },
    status: {
        type: String
    }
});

BlogsOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Blogs', BlogsOpSchema);