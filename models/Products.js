var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Products = new Schema({
    product_name : String,
    unit_measure_caption: String,
    unit_measure : Number,
    calorie_per_Unit_measure : Number,
    description : String
});

Products.index({product_name : 1});
module.exports = mongoose.model('products', Products);

