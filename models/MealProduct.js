var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MealProduct = new Schema({
    date : Date,
    meal_number : Number,
    user_id : String,
    user_name : String,
    product_id : String,
    product_name : String,
    unit_measure_caption: String,
    unit_measure : Number,
    calorie_per_Unit_measure : Number,
    amount : Number,
    total_calories : Number
});

module.exports = mongoose.model('meal_product', MealProduct);

