require("dotenv").config();
const mongoose = require("mongoose");

process.env.DB
const DB = "mongodb+srv://AhmadSh:raheel999@cluster0.1o1wb3p.mongodb.net/ShoeStoreDataBase";
mongoose.connect(DB).then(() => {
    console.log("Successfull connect to DB");
}).catch((err) => {
    console.log("not connect to DB due to", err);
})

let RegistrationSchema = mongoose.Schema({
    FirstName: String,
    LastName: String,
    Email: String,
    Password: String,
});




// Create the RegistrationModel
const RegistrationModel = mongoose.model("RegistrationData", RegistrationSchema);
module.exports = RegistrationModel 
