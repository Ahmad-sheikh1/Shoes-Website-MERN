const mongoose = require("mongoose");

let Google_User_Schema = mongoose.Schema({
    googleid : String,
    displayname : String,
    email:String,
    Image : String
});

const Google_User_Model = mongoose.model("Google Auth Users", Google_User_Schema);

module.exports = Google_User_Model;