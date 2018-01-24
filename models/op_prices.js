var mongoose = require('./../libs/mongoose-connection')();
var Schema = mongoose.Schema;
var plugin = require('mongoose-createdat-updatedat');

var OpPriceSchema = new Schema({
    priceName: {
        type: String
    },
    priceDescription: {
        type: String
    },
    price: {
        type: String
    },
    color_class:{
        type: String
    },
    type:{
        type: String
    }
});

OpPriceSchema.plugin(plugin);

module.exports = mongoose.model('Op_Prices', OpPriceSchema);