var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Topics = new Schema({
    user_id : String,
    user_name : String,
    title  : String,
    topic_text   : String,
    date : Date
});

module.exports = mongoose.model('topics', Topics);

