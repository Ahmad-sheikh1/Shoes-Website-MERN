const express = require("express");
const app = express();
const RegistrationModel = require("./Mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const ShoesData = require("./ShoesDataDB");
const Pend_Order = require("./OrderDB");
const path = require("path")
let pendo;
let newproduct;

let newuser;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static("./dist"))



app.post("/api/Register", (req, res) => {
    console.log(req.body);
    // res.send("success")
    newuser = new RegistrationModel({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        Email: req.body.Email,
        Password: req.body.Password
    });

    newuser.save();
});

app.post("/api/Login", async (req, res) => {
    let loggedUser = await RegistrationModel.findOne({ Email: req.body.Email, Password: req.body.Password })

    if (loggedUser) {
        jwt.sign({ Email: req.body.Email, Password: req.body.Password }, 'thk ha samhaj gaya', { expiresIn: '2d' }, (err, token) => {
            res.json({
                token,
                loggedUser
            })
        });
    } else {
        res.json({ message: "user not found" })
    }
});

app.post("/api/check-token", (req, res) => {
    console.log(req.body.token);
    try {
        const decodedToken = jwt.verify(req.body.token, "thk ha samhaj gaya", function (err, data) {
            // console.log(data);
            const user = RegistrationModel.find({ Email: data.Email, Password: data.Password });
            res.json(user._conditions)
        });
    }
    catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.post("/api/ShoesData", (req, res) => {
    try {
        // console.log(req.body);
        req.body.map((pro) => {
            newproduct = new ShoesData({
                productname: pro.productname,
                mindetail: pro.mindetail,
                catagory: pro.catagory,
                price: pro.price,
                qunty: pro.qunty,
                img: pro.img,
                imgT: pro.img,
                imgTh: pro.img
            });
            return newproduct.save();
            // return console.log(pro);

        })
        // newproduct.save();


    }
    catch (err) {
        console.log("datanahigira", err);
    }
});

app.post("/api/getshoesdata", (req, res) => {
    ShoesData.find().then((ShoesData) => {
        res.json(ShoesData);    
    }).catch((err) => {
        console.log("Data not get", err);
    })
});

app.post("/api/PendingOrders", (req, res) => {
    req.body.map((pro) => {
        pro.map((pr) => {
            // console.log(pr);
            pendo = new Pend_Order({
                Name: pr.productname,
                Image: pr.img,
                Price: pr.price
            })

            return pendo.save();
        })
    })
});


app.post("/api/getpendingorder", (req, res) => {
    Pend_Order.find().then((Pend_Order) => {
        res.json(Pend_Order);
    }).catch((err) => {
        console.log("pendo Data not get", err);
    })
});





app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname,"dist","index.html"));
});

app.listen(5000, () => {
    console.log("Server is listening on port 5000");
});