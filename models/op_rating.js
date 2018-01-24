var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var RatingSchema = new Schema({
    doctor_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User'
    },
    patient_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User'
    },
	rate_for_doctor:{
        type:Number,
        'default': 0
    },
	comments:{
        type:String
    }
});
RatingSchema.plugin(plugin);
module.exports = mongoose.model('Op_Rating',RatingSchema);