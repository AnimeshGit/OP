var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var DiagnosisOpSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    symptoms: {
        type: String
    },
    patientStatus: {
        type: String
    },
    diagnosisStatus: {
        type: String
    }
});

DiagnosisOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Diagnosis', DiagnosisOpSchema);