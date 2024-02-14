const mongoose = require("mongoose");

let Pending_Order = mongoose.Schema({
    Name: String,
    Image: String,
    Price: String
});

const Pend_Order = mongoose.model("Pending Orders", Pending_Order);

module.exports = Pend_Order;