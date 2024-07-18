const mysql = require('mysql2');
const exp = require('express');
var app = exp();
const session = require('express-session');
var parse = require('body-parser')
const path = require('path');
const multer = require('multer');
app.set('view engine', 'ejs');
app.use(exp.static(path.join(__dirname, 'public')));
app.use(parse.urlencoded({ extended: false }));
app.use(parse.json());
const http = require('http');
const upload = multer();
const { Console } = require('console');
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
//const upload = multer({ dest: 'uploads/'});
//sql connecton
var con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "rent"
});
con.connect((error) => {
    if (error) {
        console.error('faield');
        return;
    }
    console.log('connected');
});
// connectd

app.get('/', function (req, res) {
    res.render('pages/intro');
});
app.get('/int', function (req, res) {
    var logged = false;
    var show = false
    res.render('pages/home', { logged, show, loc: "" });
});
app.get('/owner', function (req, res) {
    var logged = false;
    res.render('pages/ownerhome', { logged });
});


// user login and signup
app.get('/login', function (req, res) {
    var logged = false;
    res.render('pages/login', { error: "", logged });
});
app.get('/signup', function (req, res) {
    var logged = false;
    res.render('pages/signup', { error: "", logged });
});
app.post('/signup', function (req, res) {
    const username = req.body.username;
    const email = req.body.mail;
    const mobile = req.body.mobile;
    const pass = req.body.password;
    const pass2 = req.body.password2;
    const sql = "select * from user where email=?";
    con.query(sql, [email], function (err, result) {
        if (result.length > 0) {
            res.render('pages/signup', { error: "Already Exist" });
        }
    });
    if (pass == pass2) {
        const query = "INSERT INTO user(username,email,mobile,password,password2)values('" + username + "','" + email + "','" + mobile + "','" + pass + "','" + pass2 + "')";
        con.query(query, function (err, result) {
            if (err) {
                throw err;
            }
            else {
                var logged = false;
                res.render('pages/login', { error: "Registered succesfully.....Login Now", logged });
                console.log("regusterd");
                console.log(mobile);
            }
        });
    }
    else {
        res.render('pages/signup', { error: "mismatched password" });
    }
});
app.post('/login', function (req, res) {
    const mail = req.body.email;
    const pass1 = req.body.password;
    var sql = 'SELECT * FROM user WHERE email=? AND password=?';
    con.query(sql, [mail, pass1], function (err, result) {
        if (err) throw err;
        if (result.length > 0) {

            const a = result[0];
            var name = a.username;
            req.session.username = result[0].email;
            req.session.user = result[0].mobile;
            var logged = true;
            var show = false
            res.render('pages/home', { logged, name, show, loc: "" });
        }
    });


});
// owner login and signup
app.get('/ologin', function (req, res) {
    var logged = false; 9
    res.render('pages/ologin', { error: "", logged });

});
app.get('/osignup', function (req, res) {
    var logged = false;
    res.render('pages/osignup', { error: "", logged })
});


app.post('/osignup', function (req, res) {
    const username = req.body.username;
    const email = req.body.mail;
    const mobile = req.body.mobile;
    const pass = req.body.password;
    const pass2 = req.body.password2;
    const sql = "SELECT * FROM owner WHERE email=?";
    con.query(sql, [email], function (err, result) {
        if ((result.length) > 0) {
            var logged = false;
            res.render('pages/osignup', { error: "Already Exist", logged });

            console.log(result.length);
        }
        else if (pass == pass2) {
            const query = "INSERT INTO owner(username,email,mobile,password,password2)values('" + username + "','" + email + "','" + mobile + "','" + pass + "','" + pass2 + "')";
            con.query(query, function (err, result) {
                if (err) {
                    throw err;
                }
                else {
                    var logged = false;
                    res.render('pages/ologin', { error: "Registered succesfully.....Login Now", logged });
                    console.log("regusterd");
                    console.log(email);
                }
            });
        }
        else {
            var logged = false;
            res.render('pages/osignup', { error: "mismatched password", logged });
        }
    });
});
app.post('/ologin', function (req, res) {
    const mail = req.body.email;
    const pass1 = req.body.password;
    var sql = 'SELECT * FROM owner WHERE email=? AND password=?';
    con.query(sql, [mail, pass1], function (err, result) {
        if (err) throw err;
        if (result.length > 0) {

            const a = result[0];
            var name = a.username;
            var logged = true;
            req.session.username = result[0].email;
            req.session.user = result[0].username;
            res.render('pages/ownerhome', { logged, name, loc: "" });
        }

        else {
            var logged = false;
            res.render("pages/ologin", { error: "Invalid email or Password", logged });

        }
    });

});
app.post('/dis', function (req, res) {
    const pin = req.body.pincode;
    const sql = "select * from houses where pincode=?";
    con.query(sql, [pin], function (err, result) {
        if (err) {
            throw err;

        }
        else {
            var show = true;
            var logged = true;
            var name = 'hii';
            res.render("pages/home", { house: result, name, logged, show });
        }
    })
});
app.get('/ownerhome', function (req, res) {
    var email = req.session.user;
    var logged = true;;
    res.render("pages/ownerhome", { name: email, logged })
})
app.get("/addpro", function (req, res) {
    var email = req.session.user;
    res.render("pages/addpro", { name: email, successMessage: false });
})
app.post('/addpro', upload.fields([
    { name: 'img1', maxCount: 1 },
    { name: 'img2', maxCount: 1 },
    { name: 'img3', maxCount: 1 }]), function (req, res) {
    var email = req.session.username;
    const housenam = req.body.housename;
    const houseno = req.body.houseno;
    const address = req.body.address;
    const pin = req.body.pincode;
    const type = req.body.type;
    const bach = req.body.bach === 'on' ? 1 : 0;
    const price = req.body.price;
    const link = req.body.Whatsapp;
    console.log(email, housenam, houseno, address, pin, bach, link);
    const img1 = req.files['img1'][0];
    const img2 = req.files['img2'][0];
    const img3 = req.files['img3'][0];
    const sql = "insert into houses (email,housename,houseno,address,pincode,type,bach,img1,img2,img3,link,price)values(?,?,?,?,?,?,?,?,?,?,?,?)";
    con.query(sql, [email, housenam, houseno, address, pin, type, bach, img1.buffer, img2.buffer, img3.buffer, link, price], function (err, result) {
        if (err) {
            throw err;
        }
        else {
            console.log("sucess");
            res.render('pages/addpro', { successMessage: 'property add succesfully', name: email });
        }
    });
});
app.get("/mypro", function (req, res) {
    var email = req.session.username;
    const sql = "select * from houses where email=?";
    con.query(sql, [email], function (err, result) {
        if (err) throw err;
        console.log(result.length);

        res.render('pages/mypro', { house: result, name: email });

    })
});
app.get("/house/:housename", function (req, res) {
    const housename = req.params.housename;
    const sql = "select * from houses where housename=?";
    con.query(sql, [housename], function (err, result) {
        if (err) {
            throw err;
        }
        else {
            var owner = result[0].email;
            const sql2 = "select * from owner where email=?";
            con.query(sql2, [owner], function (err, res2) {
                if (err) {
                    throw err;
                }
                else {
                    res.render("pages/info", { house: result[0], owner: res2[0] });
                }
            })
        }
    })
})
app.listen(8000);