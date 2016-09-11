var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Comments = new Schema({
    topic_id : String,
    user_id : String,
    user_name : String,
    comment_text : String,
    date : Date
});

Comments.index({topic_id : 1});
module.exports = mongoose.model('comments', Comments);

