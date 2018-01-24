var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var HospitalsOpSchema = new Schema({
    hospital_name: {
        type: String
    },
    hospital_logo: {
        type: String
    },
    hospital_specialities: {
        type: String
    },
    hospital_timing: {
        type: String
    },
    hospital_email: {
        type: String
    },
    hospital_phone: {
        type: String
    },
    hospital_address: {
        type: String
    },
    about_hospital: {
        type: String
    }
});

HospitalsOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_Hospitals', HospitalsOpSchema);