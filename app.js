var mongoose     = require('mongoose')
mongoose.connect('mongodb://localhost:27017/myDiet',function(err,db){
    if(err)
    {
        console.log(err);
    }
});

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//usevar routes = require('./routes/index');
//var users = require('./routes/users');

var comments = require('./models/Comments');
var mealProduct = require('./models/MealProduct');
var products = require('./models/Products');
var topics = require('./models/Topics');
var users = require('./models/Users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', function(req, res, next){
    console.log("user send request");
    next();
});


//app.use('/users', users);

// this var is to hold all the Ids so when we insert new record to table we get it from here ann add to the next ID
var NextCommentsID = 1;
var NextMealProductID = 1;
var NextProductsID = 1;
var NextTopicsID = 1;
var NextUsersID = 1;


DoBeforeServerStart();

// in the post function we ge all the parameter from the body using req.body and the name of the parameter
app.route('/AddUser').post(AddUser);
app.route('/AddTopic').post(AddTopic);
app.route('/AddCommentForTopic').post(AddCommentForTopic);
app.route('/AddMealProduct').post(AddMealProduct);
app.route('/UpdateUserWeight').post(UpdateUserWeight);
app.route('/SignIn').post(SignIn);

// in the get function we ge all the parameter from the URL using req.query and the name of the parameter


// need to add get total calorie for date
app.route('/GetUser').get(GetUser);
app.route('/GetProduct').get(GetProduct);
app.route('/GetTopics').get(GetTopics);
app.route('/GetCommentsForTopic').get(GetGetCommentsForTopic);
app.route('/DeleteUser').get(DeleteUser);

function EmptyResult(obj) {
    return (Object.keys(obj).length === 0 );
}

function DeleteUser(req, res){

    console.log("In Delete User");
    if(req.query.id == undefined)
    {
        res.send('Iligal command missing data!');
    }
    else {
        users.findOne({_id : req.query.id}).count( function (err, count) {

            if (err) {
                console.log(err);
                res.send(err);
            }
            else if (count == 0) {
                res.send('User Not Found!');
            }
            else {

                removeAllUserData(res, req.query.id);
            }
        });
    }
}


function removeAllUserData(res , userId) {
    comments.remove({_id: userId}, function (err) {
        if (!err)
        {
            console.log('All user comments deleted succesfully');
        }
        else
        {
            res.send("Err");
            console.log('Error...');
        }
    });

    comments.remove({topic_id: userId}, function (err) {
        if (!err)
        {
            console.log('All comments for user topics deleted succesfully');
        }
        else
        {
            res.send("Err");
            console.log('Error...');
        }
    });

    mealProduct.remove({_id: userId}, function (err) {
        if (!err)
        {
            console.log('All user mealProduct deleted succesfully');
        }
        else
        {
            res.send("Err");
            console.log('Error...');
        }
    });

    topics.remove({_id: userId}, function (err) {
        if (!err)
        {
            console.log('All user topics deleted succesfully');
        }
        else
        {
            res.send("Err");
            console.log('Error...');
        }
    });
    users.remove({_id: userId}, function (err) {
        if (!err)
        {

            console.log('All user data deleted succesfully');
            res.send('All user data deleted succesfully');
        }
        else
        {
            res.send("Err");
            console.log('Error...');
        }
    });
}

// in this function we get 2 params user and password and return the user ID in the response or error if not exist
//
function SignIn(req, res){
    console.log("In SignIn");
    if((req.body.user_name == undefined) ||(req.body.mail == undefined))
    {
        res.send("Iligal command missing data!");
    }
    else {

        users.findOne({user_name : req.body.user_name ,mail : req.body.mail }, function (err, Result) {

            if (err) {
                console.log(err);
                res.send(err);
            }
            else if (EmptyResult(Result) ) {
                res.send("User name :" + user_name + " mail : " + req.body.mail + "  Not Found!");
            }
            else {
                res.json("_id: " + Result._id);
            }
        });
    }
}

// in the function we ger the product ID and user ID in the URL and return the produt from the Products table and return the data or error if not exist
// we ned to check the user exist
function GetProduct(req, res) {
    console.log("In Get Product");
    if((req.query.id == undefined) || (req.query.product_name == undefined))
    {
        res.send('Iligal command missing data!');
    }
    else{
        users.findOne({_id : req.query.id}).count( function (err, count) {

            if (err) {
                console.log(err);
                res.send(err);
            }
            else if (count == 0) {
                res.send('User Not Found!');
            }
            else {

                GetProductByName(res, req.query.product_name);
            }
        });
    }

}

function GetProductByName(res, productName) {
     products.find({"product_name" : productName}, function (err, result) {
         console.log(typeof (result));
         if (err) {
             console.log(err);
             res.send(err);
         }
         else {

             if (rEmptyResult(result)) {
                 console.log("Product name: " + productName + " not exist!");
                res.send("Product name: " + productName + " not exist!");
             }
             else {
                 res.toJSON(result);
             }
         }
     });
 }

// in this function we get 2 params user Id and new weight and update the record or error in user not exist
function UpdateUserWeight(req, res) {
    console.log("In Update User Weight");
    if((req.query.id == undefined) || (req.query.current_weight == undefined))
    {
        res.send('Iligal command missing data!');
    }
    else{
        users.findone({_id : req.query.id},  function (err, doc) {

            if (err) {
                console.log(err);
                res.send(err);
            }
            else if (EmptyResult(doc)) {
                res.send('User Not Found!');
            }
            else {
                doc.current_weight = req.query.current_weight;
                doc.last_wieght_date = new Date();
                doc.save();
                res.send('New Weight changed!');
            }
        });
    }
}

// in the function we get the topic ID and user ID the return all the comment for the topic from Comments table
function GetGetCommentsForTopic(req, res) {
    console.log("In Get Comments For Topics");
    if ((req.query.id == undefined) || (req.query.topic_id == undefined)) {
        res.send('Iligal command missing data!');
    }
    else {
        users.findOne({_id : req.query.id}).count( function (err, count) {

            if (err) {
                console.log(err);
                res.send(err);
            }
            else if (count == 0) {
                res.send('User Not Found!');
            }
            else {

               comments.find({"topic_id" : req.query.topic_id }).sort({date : -1}).exec(function (commentsErr, docs) {
                   if (err) {
                       console.log(err);
                       res.send(err);
                   }
                   else if (EmptyResult(docs)) {
                       res.send('For selcted Topic comments not found!');
                   }
                   else {
                      res.toJSON(docs)
                   }
               });
            }
        });
    }
}

// in this function we get user ID as parameter and return the top 20 last topics fronm Topics table
// need to check user exist
function GetTopics(req, res) {
    console.log("In Get Topics");
    if (req.query.id == undefined)  {
        res.send('Iligal command missing data!');
    }
    else {
        users.findOne({_id : req.query.id}).count( function (err, count) {

            if (err) {
                console.log(err);
                res.send(err);
            }
            else if (count == 0) {
                res.send('User Not Found!');
            }
            else {

                topics.find({}).sort({date : -1}).limit(20).exec(function (commentsErr, docs) {
                    if (err) {
                        console.log(err);
                        res.send(err);
                    }
                    else {
                        res.toJSON(docs)
                    }
                });
            }
        });
    }
}

// in this function we return all the data of the user by ID
// or error if not found
function GetUser(req, res) {
    console.log("In Get User");
   if(req.query.id == undefined) {
       res.send('Iligal command missing data!');
   }
   else {
       users.find({_id: req.query.id}, function (err, result) {
           console.log(typeof (result));
               if (err) {
                   res.send(err);
               }
               else{
                   if (EmptyResult(result)) {
                       res.send('User Not Exist!');
                   }
                   else {

                       res.json(result);
                   }
               }
           }
       );
   }
}
// in this function we get:
// User ID, product ID , amount and number of meal and we adding it to the mealProduct table
// need to calculate the calorie amout amount * calorie_per_Unit_measure from products table
function AddMealProduct(req, res) {
    console.log("In Add Meal Product");
    if(! IsAllDataForAddMealExist(req)){
        res.send("missing data Add meal failed!");
    }
    else {
        users.find({_id : req.body.user_id}, function (err, doc) {
            if (err) {
                res.send(err);
            }
            if (EmptyResult(doc)) {
                res.send("User Not Found")
            }
            else {
                products.find({_id: product_id}, function (err, productdoc) {
                    if (err) {
                        res.send(err);
                    }
                    if (EmptyResult(productdoc)) {
                        res.send("product Not Found")
                    }
                    else {
                        console.log('adding new product meal to user id ' + req.body.user_id);
                        var MealProductParams = new mealProduct();      // create a new instance of the mealProduct model
                        MealProductParams._id = NextMealProductID.toString();
                        NextMealProductID++;
                        MealProductParams.date = Date.now();
                        var mealNumber = 1;
                        if (req.body.meal_number != undefined) {
                            mealNumber = req.body.meal_number
                        }
                        MealProductParams.meal_number = mealNumber;
                        MealProductParams.user_id = req.body.user_id;
                        MealProductParams.user_name = doc.user_name;
                        MealProductParams.product_id = req.body.product_id;
                        MealProductParams.product_name = req.body.product_name;
                        MealProductParams.calorie_per_Unit_measure = productdoc.calorie_per_Unit_measure;
                        MealProductParams.amount = req.body.amount;
                        MealProductParams.total_calories = req.body.amount * productdoc.calorie_per_Unit_measure;
                        MealProductParams.save(function (err) {
                            if (err) {
                                NextMealProductID--;
                                res.send(err);
                            }

                            res.json({message: 'New product meal added'});
                        });
                    }
                });
            }
        });
    }
}

function IsAllDataForAddMealExist(req) {
    if((req.body.user_id == undefined)||( req.body.product_id == undefined)||( req.body.product_name == undefined) || (req.body.amount == undefined ))
    {
        return false;
    }
    return true;
}
// in this function we Topic ID, User ID and Text and adding it to the Comments need to insert date
function AddCommentForTopic(req, res) {
    console.log("In Add Comment For Topic");
    if (!IsAllDataForAddCommentForTopicExist(req)) {
        res.send("missing data Add meal failed!");
    }
    else {
        users.find({_id: req.body.user_id}, function (err, doc) {
            if (err) {
                res.send(err);
            }
            if (EmptyResult(doc)) {
                res.send("User Not Found")
            }
            else {
                topics.findOne({_id: req.body.topic_id}).count(function (err, count) {
                    if (err) {
                        res.send(err);
                    }
                    else if(count == 0){
                        res.send("Topic Id:" + req.body.topic_id + " Not Found");
                    }
                    else{
                        var commentsParams = new comments();
                        commentsParams._id  = NextCommentsID.toString();
                        NextCommentsID++;
                        commentsParams.topic_id = req.body.topic_id;
                        commentsParams.user_id = req.body.user_id;
                        commentsParams.user_name = doc.user_name;
                        commentsParams.comment_text = req.body.text;
                        commentsParams.date = Date.now();
                        commentsParams.save(function (err) {
                            if (err) {
                                NextCommentsID--;
                                res.send(err);
                            }

                            res.json({message: 'New comment added'});
                        });
                    }

                });
            }
        });

    }
}

function IsAllDataForAddCommentForTopicExist(req){
    if((req.body.user_id == undefined)||( req.body.topic_id == undefined)){
        return false;
    }
    return true;
}

//in this function we user ID and text and insert in to the topics
function AddTopic(req, res) {
    console.log("In Add Topic");
    if((req.body.user_id == undefined) || (req.body.title == undefined) || (req.body.text == undefined)){
        res.send("missing data Add topic failed!");
    }
    else {
        users.find({_id: req.body.user_id}, function (err, doc) {
            if (err) {
                res.send(err);
            }
            if (doc) {
                res.send("User Not Found")
            }
            else {
                var topicsParams = new topics();
                topicsParams._id = NextTopicsID.toString();
                NextTopicsID++;
                topicsParams.topic_id = req.body.topic_id;
                topicsParams.user_id = req.body.user_id;
                topicsParams.user_name = doc.user_name;
                topicsParams.title = req.body.title;
                topicsParams.topic_text = req.body.text;
                topicsParams.date = Date.now();
                topicsParams.save(function (err) {
                    if (err) {
                        NextTopicsID--;
                        res.send(err);
                    }

                    res.json({message: 'New topic added'});
                });


            }
        });
    }

}
// in this function we get all the user data and check if not exis by user name or email and return the user id in the result
function AddUser(req, res) {
    console.log('In Add user');
    if(! IsAllDataForAddingUser(req)) {
        res.send("missing data Add user failed!");
    }
    else {
        var newMail = req.body.mail;
        console.log('mail = ' + newMail);
        users.find({mail: newMail}).count(function (err, count) {
            if (err) {
                res.send(err);
            }
            // Add New User
            if (count == 0) {
                console.log('mail = ' + newMail + ' not Found');
                var UserParams = new users();      // create a new instance of the Stock model

                UserParams._id = NextUsersID.toString();
                NextUsersID++;
                UserParams.user_name = req.body.user_name;
                UserParams.mail = newMail;
                UserParams.Password = req.body.Password;
                UserParams.Address.street = req.body.Address.street;
                UserParams.Address.city = req.body.Address.city;
                UserParams.Address.state = req.body.Address.state;
                UserParams.Address.country = req.body.Address.country;
                UserParams.diet_start_date = Date.now();
                UserParams.target_calories_for_day = req.body.target_calories_for_day;
                UserParams.start_weight = req.body.start_weight;
                UserParams.target_weight = req.body.target_weight;
                UserParams.current_weight = req.body.current_weight;
                UserParams.last_wieght_date = Date.now();
                UserParams.height = req.body.height;
                UserParams.sex = req.body.sex;
                UserParams.age = req.body.age;

                // save the stock and check for errors
                UserParams.save(function (err) {
                    if (err) {
                        NextUsersID--;
                        res.send(err);
                    }

                    res.json({message: 'New User create!'});
                });
            }
            else // user Exist
            {
                console.log("Mail: " + newMail + " Already exists");
                res.send({message: ' Mail: ' + newMail + ' Already exists'});

            }
        });
    }
}

function IsAllDataForAddingUser(req) {
    if((req.body.user_name == undefined) || (req.body.mail == undefined) ||(req.body.Password == undefined) ||(req.body.Address.street == undefined) ||
    (req.body.Address.city == undefined) ||(req.bodyy.Address.state == undefined) ||(req.body.Address.country == undefined) ||(req.body.target_calories_for_day == undefined) ||
    (req.body.start_weight == undefined) ||(req.body.target_weight == undefined) ||(req.body.current_weight == undefined) ||(req.body.height == undefined) ||
    (req.body.sex == undefined) ||(req.body.age == undefined) ){

        return false;
    }
    return true;
}
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// TOOOOOOOOOOOOOOOOOOOOO DDOOOOOO
// 1. we need to fill the Products table on server load we need to add JSON with some pruduct and insert it to the table
// 2. on load sevice need to fix counters (IDs)
function  DoBeforeServerStart() {
    console.log('in DoBeforeServerStart');

}

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
