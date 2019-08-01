const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const user = require('./controllers/userController');
const admin=require('./controllers/adminController');
const ws=require('./controllers/wsController');

var app = express();
var port = "3200";

app.use(bodyParser.json());
app.use(cors());


app.use("/user",user);
app.use("/admin",admin);
app.use("/v1",ws);

app.get("/", (req, res) => {
    res.send({
        message: "<h1>Welcome to the Server </h1>"
    });
});

app.listen(port, () => {
    console.log("server started on port 3200");
});

