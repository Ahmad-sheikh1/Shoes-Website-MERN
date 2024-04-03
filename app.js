require("dotenv").config();
const express = require("express");
const app = express();
const RegistrationModel = require("./Mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const passport = require("passport");
const ShoesData = require("./ShoesDataDB");
const Pend_Order = require("./OrderDB");
const path = require("path")
const stripe = require('stripe')('sk_test_51OvsSeP47E7U0GK517TtyDvOccZNqJAIBwBJ0QVwCrLCsrBiaIpJd2ukrKazeBVswIlLywQV1JwaLv3QpwSW9Nbg00Ym4GG3hb');
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const googlemodel = require("./Googleuser");
const { log } = require("console");
let pendo;
let newproduct;
let newuser;


app.use(session({
    secret: "12345678987lkjhgfdszxfgui",
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static("./dist"))
passport.use(
    new GoogleStrategy({
        clientID: "371552543043-i1qds267utv8u12fert1qg7dridca8am.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"]
    },
        async (accessToken, refreshToken, profile, done) => {
            // console.log(profile, "profile");
            try {
                let user = await googlemodel.findOne({ googleid: profile.id })

                if (!user) {
                    user = new googlemodel({
                        googleid: profile.id,
                        email: profile.emails[0].value,
                        displayname: profile.displayname,
                        Image: profile.photos[0].value
                    })

                    await user.save()
                }

                return done(null, user)

            } catch (error) {
                return done(error, null)
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})


// setup google auth

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
);

app.get('/api/auth/google/callback',
    passport.authenticate('google',
        {
            successRedirect: "http://localhost:5173/Home",
            failureRedirect: 'http://localhost:5173/Login'
        })
);

app.get("/api/Google/Success", async (req, res) => {
    // console.log("hellllo", req.user);

    if (req.user) {
        res.status(200).json({ message: "user goggle login", user: req.user })
    }
    else {
        res.status(400).json({ message: "non authorized" })
    }

})

app.get("/api/Google/logout", (req, res, next) => {
    req.logOut(function (err) {
        if (err) return next(err)
        res.redirect("http://localhost:5173/Login")
    })
})

// Stripe Payment

app.post('/api/stripepayment', async (req, res) => {
    try {
        const products = req.body.map((product) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: product.productname,
                    images: [product.img]
                },
                unit_amount: product.price * 100 // Stripe expects price in cents
            },
            quantity: 1
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: products,
            mode: 'payment',
            success_url: 'http://localhost:5173/Home',
            cancel_url: 'http://localhost:5173/Cart'
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating Stripe session:', error);
        res.status(500).json({ error: 'Error creating Stripe session' });
    }
});

//  other REST API-S 

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
            console.log(pr);
            pendo = new Pend_Order({
                Name: pr.productname,
                Image: pr.img,
                Price: pr.price,
                Owner: pr.cartby
            })

            return pendo.save();
        })
    })
});


app.post("/api/getpendingorder", (req, res) => {
    console.log(req.body);
    Pend_Order.find({ Owner: req.body.user }).then((Pend_Order) => {
        res.json(Pend_Order);
    }).catch((err) => {
        console.log("pendo Data not get", err);
    })
});





app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(3000, () => {
    console.log(`Server is listening on port 3000`);
});