var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var PatientHistoryOpSchema = new Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_CaseQueriesAnswers',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Payment',
        required: true
    }
});

PatientHistoryOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_PatientHistory', PatientHistoryOpSchema);