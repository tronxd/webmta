var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Users = new Schema({
    user_name : String,
    mail : String,
    Password : String,
    Address : {
        street : String,
        city: String,
        state: String,
        country: String
    },
    diet_start_date   : Date,
    target_calories_for_day : Number,
    start_weight : Number,
    target_weight : Number,
    current_weight: Number,
    last_wieght_date : Date,
    height: Number,
    sex: String,
    age: Number

});

Users.index({ mail:1 , Password : 1 });
module.exports = mongoose.model('users', Users);
