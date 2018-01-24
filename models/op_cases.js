var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
const CONSTANTS = require('./../Constants/constant');
var plugin = require('mongoose-createdat-updatedat');

var CasesOpSchema = new Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User'
    },
    consultingPhysicion: {
        type: String
    },
    caseNo: {
        type: Number
    },
    primeryDiagnosisName: {
        type: String
    },
    diagnosisDescription: {
        type: String
    },
    physicainReviewer: {
        type: String
    },
    documents: [{
        type: String
    }],
    closedDate: {
        type: Date
    },
    receivedDate: {
        type: Date
    },
    completedDate: {
        type: Date
    },
    assignedDate: {
        type: Date
    },
    draftDate: {
        type: Date
    },
    unassignedDate: {
        type: Date
    },
    familyMemberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_FamilyHistory'
    },
    status: {
        type: String
        // 'default': CONSTANTS.DB.STATUS.UNASSIGNED
    },
    doctorstatus: {
        type: String
        // 'default': CONSTANTS.DB.STATUS.UNASSIGNED
    },
    isDraft: {
        type: Boolean,
        default: false
    },
    primeryDiagnos: {
        type: String
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    priceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Prices'
    },
    isPrimaryDiagnosis: {
        type: Boolean,
        default: false
    },
    paymentId: {
        type: String
    },
    priceType:{
        type: String
    },
    priceAmount:{
        type: Number
    },
    primaryAmount:{
        type: Number
    },
    paymentStatus: {
        type: String
    }
});

CasesOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Cases', CasesOpSchema);