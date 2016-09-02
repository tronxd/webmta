var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Product = new Schema({
    _id   : String,
    product_name : String,
    unit_measure : String,
    calorie_per_Unit_measure : Number,
    description : String
});

module.exports = mongoose.model('product', Product);

