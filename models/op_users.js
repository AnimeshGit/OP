var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

// set up a mongoose model
var UserSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    otp_code: {
        type: Number
    },
    phoneNumber: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },
    age: {
        type: String
    },
    gender: {
        type: String
    },
    photo: {
        type: String
    },
    practice_photos :[{
        type: String
    }],
    isDoctor: {
        type: Boolean,
        required: true,
        'default': false
    },
    doctor_specialization: {
        type: String
    },
    doctor_education: {
        type: String
    },
    about_doctor: {
        type: String
    },
    doctor_location: {
        type: String
    },
    rating:{
        type: Number,
        'default': 0
    },
    doctor_fees: {
        type: Number
    },
    workingHours: {
        type: String
    },
    workingDays: [{
        type: String
    }],
    doctor_address: {
        type: String
    },
    oneTimePassword: {
        type: Boolean,
        default: false
    },
    allergies: {
        type: String
    },
    address: {
        type: String
    },
    currentMedication: {
        type: String
    },
    medicalConditions: {
        type: String
    },
    region: {
        type: String
    },
    facebookId: {
        type: String
    },
    practice_address: {
        type: String
    },
    npi_number: {
        type: String
    },
    license_number:{
        type: String
    },
    total_practice_years:{
        type: Number
    },
    m_b_certification: {
        type: [String]
    },
    work_history: {
        type: [String]
    },
    awards_accolades: {
        type: [String]
    },
    googleId: {
        type: String
    },
    primaryAmount:{
        type:String
    },
    priceAmount:{
        type: String
    },
    priceType:{
        type: String
    },
    practice_state:{
        type:String
    },
    deviceTokens: [{
        device_type: String,
        device_token: String
    }],
    practice_country:{
        type: String
    },
    confirm_email:{
        type: Boolean,
        default: false       
    }
});

UserSchema.plugin(plugin);
module.exports = mongoose.model('Op_User', UserSchema);