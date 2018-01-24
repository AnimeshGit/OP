var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');
const CONSTANTS = require(appRoot + '/Constants/constant');

var FamilyHistoryOpSchema = new Schema({
    fullname: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    age: {
        type: String
    },
    region: {
        type: String
    },
    gender: {
        type: String
    },
    allergies: {
        type: String
    },
    currentMedication: {
        type: String
    },
    medicalConditions: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    relationship: {
        type: String
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    caseStatus: {
        type: String,
        default: CONSTANTS.DB.STATUS.UNASSIGNED
    },
    photo: {
        type: String
    }
    /*,
        consultingPhysician: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Op_User'
        }*/
});

FamilyHistoryOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_FamilyHistory', FamilyHistoryOpSchema);