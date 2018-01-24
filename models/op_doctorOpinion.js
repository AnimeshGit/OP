var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var DoctorOpinionOpSchema = new Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Cases',
        required: true
    },
    opinionSummery: {
        type: String,
        required: true
    },
    furtherStudies: {
        type: String,
        required: true
    },
    therapaticSuggestions: {
        type: String,
        required: true
    },
    recommendedSpecialists: {
        type: String,
        required: true
    },
    consultingPhysicion: {
        type: String
    }
});

DoctorOpinionOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_DoctorOpinion', DoctorOpinionOpSchema);