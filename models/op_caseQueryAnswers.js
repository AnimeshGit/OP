var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var CaseQueryAnswersOpSchema = new Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User'
    },
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Cases',
        required: true
    },
    queries: [{
        query: String,
        answer: String,
        queryTime:Date,
        answerTime:Date,
        amount:Number,
        paymentId:String,
        priceId:String,
        priceType:String
    }],
    doctorOpinionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_DoctorOpinion'
    }
});

CaseQueryAnswersOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_CaseQueriesAnswers', CaseQueryAnswersOpSchema);

