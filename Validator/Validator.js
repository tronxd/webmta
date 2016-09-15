/**
 * Created by user on 14/09/2016.
 */
var users = require("../models/Users");


function ValidateUserAndPreformAction(id, req, res, resultCallbackFunction) {
    console.log('in ValidateUserAndPreformAction sended id ' +  id);
    users.find({_id: id}, function (err, selectedUser) {
        if (err) {

            if (err.name == "CastError" && err.kind == "ObjectId") {
                res.send("the id sent in the input is in illegal format please Sign In again to get the corrct id in the correct format.\nThanks.");
            }
            else {
                res.send(err);
            }
        }
        else {
            if (EmptyResult(selectedUser)) {
                res.send("User Not Found")
            }
            else {

                if (resultCallbackFunction) {
                    resultCallbackFunction(req, res, selectedUser);
                }
            }
        }
    });
}

function IsAllDataForAddingUser(req) {
    if((req.body.user_name == undefined) || (req.body.mail == undefined) ||(req.body.Password == undefined) ||(req.body.Address.street == undefined) ||
        (req.body.Address.city == undefined) ||(req.body.Address.state == undefined) ||(req.body.Address.country == undefined) ||(req.body.target_calories_for_day == undefined) ||
        (req.body.start_weight == undefined) ||(req.body.target_weight == undefined) ||(req.body.height == undefined) ||
        (req.body.sex == undefined) ||(req.body.age == undefined) ){

        return false;
    }

    return true;
}

function IsAllDataForAddCommentForTopicExist(req){
    if((req.body.user_id == undefined)||( req.body.topic_id == undefined)){
        return false;
    }
    return true;
}

function IsAllDataForAddMealExist(req) {
    if((req.body.user_id == undefined)||( req.body.product_id == undefined)||( req.body.product_name == undefined) || (req.body.amount == undefined ))
    {
        return false;
    }
    return true;
}

function IsAllDataForAddPruductExist(req) {
    if( ( req.body.product_name == undefined) || (req.body.unit_measure_caption == undefined )||
        (req.body.unit_measure == undefined )|| (req.body.calorie_per_Unit_measure == undefined )||
        (req.body.description == undefined ))
    {
        return false;
    }
    return true;
}

function EmptyResult(obj) {
    console.log('in EmptyResult type: ' + typeof(obj) );
    return (Object.keys(obj).length === 0 );
}


module.exports =
{
    EmptyResult : EmptyResult,
    IsAllDataForAddPruductExist : IsAllDataForAddPruductExist,
    IsAllDataForAddMealExist : IsAllDataForAddMealExist,
    IsAllDataForAddCommentForTopicExist : IsAllDataForAddCommentForTopicExist,
    IsAllDataForAddingUser : IsAllDataForAddingUser,
    ValidateUserAndPreformAction : ValidateUserAndPreformAction
}