const mongoose = require("mongoose");

let Pending_Order = mongoose.Schema({
    Name: String,
    Image: String,
    Price: String,
    Owner: String
});

const Pend_Order = mongoose.model("Pending Orders", Pending_Order);

// async function deleteAllDocuments() {
//     await Pend_Order.deleteMany({})
// }


module.exports = Pend_Order;