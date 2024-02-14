const mongoose = require("mongoose");

let ShoesSchema = mongoose.Schema({
    productname: String,
    mindetail: String,
    catagory: String,
    price: String,
    qunty: String,
    img: String ,
    imgT: String ,
    imgTh: String 
});

const ShoesData = mongoose.model("ShoesData", ShoesSchema);

module.exports = ShoesData;