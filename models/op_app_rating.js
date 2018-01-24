var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var AppRatingSchema = new Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User'
    },
	rate_to_recommend_app:{
        type:Number,
        'default': 0
    },
	comments:{
        type:String
    }
});
AppRatingSchema.plugin(plugin);
module.exports = mongoose.model('Op_App_Rating',AppRatingSchema);