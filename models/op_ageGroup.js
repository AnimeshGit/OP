var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var AgeGroupOpSchema = new Schema({
    group: {
        type: String,
       /* default: '0-10', // if you want to set as default value*/
        enum:['0-10', '10-20', '20-30', '30-40','40-50','50-60','60-70','70-80','80-90','90-100']
    }
});

RegionOpSchema.plugin(plugin);

module.exports = mongoose.model('Op_AgeGroups', RegionOpSchema);