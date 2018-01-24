var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var PaymentOpSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_User',
        required: true
    },
    paymentType: {
        type: String,
        required: true
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String
    },
    paymentDate: {
        type: Date,
        required: true
    },
    caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Op_Cases',
        required: true
    }
});

PaymentOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Payment', PaymentOpSchema);