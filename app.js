var mongoose     = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/myDiet',function(err,db){
    if(err)
    {
        console.log(err);
    }
});

var express = require('express');
var bodyParser = require('body-parser');

var comments = require('./models/Comments');
var mealProduct = require('./models/MealProduct');
var products = require('./models/Products');
var topics = require('./models/Topics');
var users = require('./models/Users');

var validator = require('./Validator/Validator');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var router = express.Router();
router.use('/', function(req, res, next){
    console.log("user send request");
    next();
});

// in the post function we ge all the parameter from the body using req.body and the name of the parameter
router.route('/AddUser').post(AddUser);
router.route('/AddTopic').post(AddTopic);
router.route('/AddCommentForTopic').post(AddCommentForTopic);
router.route('/AddMealProduct').post(AddMealProduct);
router.route('/SignIn').post(SignIn);
router.route('/AddProduct').post(AddProduct);

// update
router.route('/UpdateUserWeight').put(UpdateUserWeight);

router.route('/GetUser').get(GetUser);
router.route('/GetProducts').get(GetProduct);
router.route('/GetTopics').get(GetTopics);
router.route('/GetCommentsForTopic').get(GetGetCommentsForTopic);
router.route('/DeleteUser').get(DeleteUser);
router.route('/GetUserCalorieOfDate').get(GetUserCalorieOfDate);
router.route('/GetAllUsers').get(function (req,res) {
   users.find({},function (err, users) {
       res.json(users)
   })
});


app.use('/api', router);


app.listen('3000', function () {
    console.log('listening on port 3000!');
});


function GetUserCalorieOfDate(req, res) {
    console.log("In GetUserCalorieOfDate");
    if((req.query.id == undefined) || (req.query.date_from == undefined) || (req.query.date_to == undefined))
    {
        res.send('Iligal command missing data!');
    }
    else {
        validator.ValidateUserAndPreformAction(req.query.id, req, res , getAllUserCalorieOfDate);
    }
}


function getAllUserCalorieOfDate(req, res, user) {
    mealProduct.find({user_id : req.query.id , date : {$lt: new Date(req.query.date_to)}, date: {$gt: new Date(req.query.date_from)  } },function (err, allMeals) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else if (validator.EmptyResult(allMeals) ) {
            res.send("Not Found records in this dates!");
        }
        else {
            var totalCal = 0;
            for(var meal in allMeals){
                totalCal += allMeals[meal].total_calories;
            }
            totalCal =  "{ \"total_cal\" : " + totalCal + "}"
            allMeals.push( JSON.parse(totalCal));
            res.send(allMeals);
        }
    });
}

function DeleteUser(req, res){
    console.log("In Delete User");
    if(req.query.id == undefined)
    {
        res.send('Iligal command missing data!');
    }
    else {
        validator.ValidateUserAndPreformAction(req.query.id, req, res , removeAllUserData);
    }
}

function removeAllUserData(req , res ,user) {
    userId = req.query.id;
    comments.remove({_id: userId}, function (err) {
        if (!err) {
            console.log('All user comments deleted succesfully');
        }
        else {
            res.send("Err");
            console.log('Error...');
        }
    });

    comments.remove({topic_id: userId}, function (err) {
        if (!err) {
            console.log('All comments for user topics deleted succesfully');
        }
        else {
            res.send("Err");
            console.log('Error...');
        }
    });

    mealProduct.remove({_id: userId}, function (err) {
        if (!err) {
            console.log('All user mealProduct deleted succesfully');
        }
        else {
            res.send("Err");
            console.log('Error...');
        }
    });

    topics.remove({_id: userId}, function (err) {
        if (!err) {
            console.log('All user topics deleted succesfully');
        }
        else {
            res.send("Err");
            console.log('Error...');
        }
    });

    users.remove({_id: userId}, function (err) {
        if (!err) {
            console.log('All user data deleted succesfully');
            res.send('All user data deleted succesfully');
        }
        else {
            res.send("Err");
            console.log('Error...');
        }
    });
}

// in this function we get 2 params user and password and return the user ID in the response or error if not exist
//
function SignIn(req, res){
    console.log("In SignIn");
    if((req.body.Password == undefined) ||(req.body.mail == undefined)) {
        res.send("Iligal command missing data!");
    }
    else {
        users.find({mail : req.body.mail, Password : req.body.Password  }, function (err, currentUser) {
            console.log(currentUser);
            if (err) {
                console.log(err);
                res.send(err);
            }
            else if (validator.EmptyResult(currentUser) ) {
                res.send("User mail :" + req.body.mail + " password : " + req.body.Password + "  Not Found!");
            }
            else {
                res.json(currentUser);
            }
        });
    }
}

// in the function we ger the product ID and user ID in the URL and return the produt from the Products table and return the data or error if not exist
// we ned to check the user exist
function GetProduct(req, res) {
    console.log("In Get Product");
    if((req.query.id == undefined) || (req.query.product_name == undefined)) {
        res.send('Iligal command missing data!');
    }
    else{
        validator.ValidateUserAndPreformAction(req.query.id , req, res, GetProductsByName );
    }
}

function GetProductsByName(req, res, user) {
     products.find({product_name : new RegExp( req.query.product_name, 'i')}, function (err, result) {
         if (err) {
             console.log(err);
             res.send(err);
         }
         else {
             console.log(result);
                 if (validator.EmptyResult(result)) {
                 console.log("Product name: " + req.query.product_name + " not exist!");
                res.send("Product name: " + req.query.product_name + " not exist!");
             }
             else {
                 res.send(result);
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
        users.findOneAndUpdate({_id : req.query.id}, {current_weight : req.query.current_weight, last_wieght_date :  Date.now()  },
                {new :true}, function(err, user){
                console.log('in UpdateUserWeight callback found user: ' + user);
                if (err){
                    console.log(err);
                    res.send(err);
                }
                else if(user == null || validator.EmptyResult(user)) {
                    res.send('User not id:'  + req.query.id + ' Found')
                }
                else {
                    return res.send(user);
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
        validator.ValidateUserAndPreformAction(req.query.id , req, res, function (req , res , user){
               comments.find({topic_id : req.query.topic_id }).sort({date : -1}).exec(function (commentsErr, docs) {
                   console.log("In GetGetCommentsForTopic callback ");
                   if (commentsErr) {
                       console.log(commentsErr);
                       res.send(commentsErr);
                   }
                   else if (validator.EmptyResult(docs)) {
                       res.send('For selcted Topic comments not found!');
                   }
                   else {
                       console.log('all fine send back');
                      res.send(docs);
                   }
               });
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
        validator.ValidateUserAndPreformAction(req.query.id , req, res, function (req , res , user){
                topics.find({}).sort({date : -1}).limit(20).exec(function (commentsErr, docs) {
                    console.log("In Get Topics callback");
                    console.log(docs);
                    if (commentsErr) {
                        console.log(commentsErr);
                        res.send(commentsErr);
                    }
                    else {
                        res.send(docs);
                    }
                });
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
       validator.ValidateUserAndPreformAction(req.query.id , req, res, function (req , res , user) {res.json(user); });
   }
}

function AddProduct(req, res) {
    console.log("In Add Product");
    if (! validator.IsAllDataForAddPruductExist(req)) {
        res.send('Iligal command missing data!');
    }else {
        var ProductParam = new products();
        ProductParam.product_name = req.body.product_name;
        ProductParam.unit_measure_caption = req.body.unit_measure_caption;
        ProductParam.unit_measure = req.body.unit_measure;
        ProductParam.calorie_per_Unit_measure = req.body.calorie_per_Unit_measure;
        ProductParam.description = req.body.description;
        ProductParam.save(function (err) {
            if (err) {
                res.send(err);
            }
            else {
                res.send("product add");
            }
        });
    }
}


// in this function we get:
// User ID, product ID , amount and number of meal and we adding it to the mealProduct table
// need to calculate the calorie amout amount * calorie_per_Unit_measure from products table
function AddMealProduct(req, res) {
    console.log("In Add Meal Product");
    if(validator.IsAllDataForAddMealExist(req)){
        validator.ValidateUserAndPreformAction(req.body.user_id, req, res,
            function(req , res, user){

                var product_id = req.body.product_id;
                products.find({_id: product_id}, function (err, productdoc) {
                    if (err) {
                        res.send(err);
                    }
                    if (EmptyResult(productdoc)) {
                        res.send("product Not Found")
                    }
                    else {
                        console.log('adding new product meal to user id ' + req.body.user_id);
                        console.log(Object.keys(productdoc));
                        console.log(productdoc[0]);
                        var MealProductParams = new mealProduct();      // create a new instance of the mealProduct model
                        MealProductParams.date = Date.now();
                        var mealNumber = 1;
                        if (req.body.meal_number != undefined) {
                            mealNumber = req.body.meal_number
                        }
                        MealProductParams.meal_number = mealNumber;
                        MealProductParams.user_id = req.body.user_id;
                        MealProductParams.user_name = user.user_name;
                        MealProductParams.product_id = req.body.product_id;
                        MealProductParams.product_name = req.body.product_name;
                        MealProductParams.calorie_per_Unit_measure = productdoc[0].calorie_per_Unit_measure;
                        MealProductParams.unit_measure_caption = productdoc[0].unit_measure_caption;
                        MealProductParams.unit_measure =  productdoc[0].unit_measure;
                        MealProductParams.amount = req.body.amount;
                        MealProductParams.total_calories =(req.body.amount / productdoc[0].unit_measure) * productdoc[0].calorie_per_Unit_measure ;
                        MealProductParams.save(function (err) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                res.json({message: 'New product meal added'});
                            }
                        });
                    }
                });
            });
    } else {
        res.send("missing data Add meal failed!");
    }
}

// in this function we Topic ID, User ID and Text and adding it to the Comments need to insert date
function AddCommentForTopic(req, res) {
    console.log("In Add Comment For Topic");
    if (validator.IsAllDataForAddCommentForTopicExist(req)) {
        validator.ValidateUserAndPreformAction(req.body.user_id, req, res,
            function (req, res, user) {
                topics.find({_id: req.body.topic_id}, function (err, document) {
                    if (err) {
                        res.send(err);
                    }
                    else if (validator.EmptyResult(document)) {
                        res.send("Topic Id:" + req.body.topic_id + " Not Found");
                    }
                    else {
                        var commentsParams = new comments();
                        commentsParams.topic_id = req.body.topic_id;
                        commentsParams.user_id = req.body.user_id;
                        commentsParams.user_name = user.user_name;
                        commentsParams.comment_text = req.body.text;
                        commentsParams.date = Date.now();
                        commentsParams.save(function (err) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                res.json({message: 'New comment added'});
                            }
                        });
                    }
                });
            });
    } else {
        res.send("missing data Add meal failed!");
    }
}

//in this function we user ID and text and insert in to the topics
function AddTopic(req, res) {
    console.log("In Add Topic");
    if ((req.body.user_id != undefined) && (req.body.title != undefined) && (req.body.text != undefined)) {
        validator.ValidateUserAndPreformAction(req.body.user_id, req, res, function (req, res, user) {
                con
                var topicsParams = new topics();
                topicsParams.user_id = req.body.user_id;
                topicsParams.user_name = user.user_name;
                topicsParams.title = req.body.title;
                topicsParams.topic_text = req.body.text;
                topicsParams.date = Date.now();
                topicsParams.save(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        res.json({message: 'New topic added'});
                    }
                });
            });
    }
    else {
        res.send("missing data Add topic failed!");
           }

}
// in this function we get all the user data and check if not exis by user name or email and return the user id in the result
function AddUser(req, res) {
    console.log('In Add user');
    console.log((req.body));
    if(validator.IsAllDataForAddingUser(req)) {
        var newMail = req.body.mail;
        console.log('mail = ' + newMail);
        users.find({mail: newMail}).count(function (err, count) {
            if (err) {
                res.send(err);
            }
            else {// Add New User
                if (count == 0) {
                    console.log('mail = ' + newMail + ' not Found');

                    var UserParams = new users();      // create a new instance of the Stock model
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
                    UserParams.current_weight = req.body.start_weight;
                    UserParams.last_wieght_date = Date.now();
                    UserParams.height = req.body.height;
                    UserParams.sex = req.body.sex;
                    UserParams.age = req.body.age;
                    // save the stock and check for errors
                    UserParams.save(function (err) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            res.json({message: 'New User create!'});
                        }
                    });
                }
                else {// user Exist
                    console.log("Mail: " + newMail + " Already exists");
                    res.send({message: ' Mail: ' + newMail + ' Already exists'});
                }
            }
        });
    }
    else {
        res.send("missing data Add user failed!");
    }
}
