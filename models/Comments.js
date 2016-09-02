var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Comments = new Schema({
    _id   : String,
    topic_id : String,
    user_id : String,
    user_name : String,
    comment_text : String,
    date : Date
});

module.exports = mongoose.model('comments', Comments);

