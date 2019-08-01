
const express = require('express');
const bodyParser = require('body-parser');
var builder = require('xmlbuilder');
const fs = require("fs");
const bcryt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const logs = require("../models/logs");
const config = require('./../db/config');
var app = express();

app.use(bodyParser.json());




app.post("/statUser", (req, res) => {
    try {
        let token = req.headers['authorization'];
        const _id = jwt.verify(token, "hazem").idUser;
        const role = jwt.verify(token, "hazem").role;
        if (role === "admin") {
            User.find({}).where("role").ne("admin").then((result) => {
                let Data = [];
                let price = 0;
                for (let i in result) {
                    let data = {
                        nom: result[i].nom,
                        prenom: result[i].prenom,
                        email: result[i].email,
                        role: result[i].role,
                        status: result[i].status,
                        lastConn: result[i].dateConnexion
                    }
                    if (result[i].role === "premium") {
                        price += 19;
                    }
                    Data.push(data);
                }
                res.status(200).send({ data: Data, total: Data.length, totalearning: price });
            }).catch((erro) => {

            })
        }
    } catch (error) {

    }


});

app.post("/statrequests", (req, res) => {
    let token = req.headers['authorization'];
    const _id = jwt.verify(token, "hazem").idUser;
    const role = jwt.verify(token, "hazem").role;
    if (role === "admin") {
        logs.find({}).then((result) => {
            let cpt = 0;
            let cpt2 = 0;
            for (let i in result) {
                if (result[i].requestType === "pdftowavfile") {
                    cpt++;
                } else {
                    cpt2++;
                }
            }
            res.status(200).send({ totalRequestFree: cpt2, totalRequestPremium: cpt })
        }, (error) => {

        })
    }

})

app.post("/statWS", (req, res) => {
    let token = req.headers['authorization'];
    const _id = jwt.verify(token, "hazem").idUser;
    const role = jwt.verify(token, "hazem").role;
    try {
        User.find({}).where("role").ne("admin").then((result) => {
            getTotalWS(res, result);
        })
    } catch (error) {

    }
})

app.post("/statConv", (req, res) => {
    let token = req.headers['authorization'];
    const _id = jwt.verify(token, "hazem").idUser;
    const role = jwt.verify(token, "hazem").role;
    try {
        User.find({}).where("role").ne("admin").then((result) => {
            getTotalConvertisseur(res, result);
        })
    } catch (error) {

    }
})

app.get("/morestatWS", (req, res) => {
    try {
        let token = req.headers['authorization'];
        const _id = jwt.verify(token, "hazem").idUser;
        const role = jwt.verify(token, "hazem").role;
        logs.find({}).where("requestType").equals("pdftobase64").then((result) => {
            let statWS = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (let i in result) {
                let m = result[i].dateRequest.getMonth();
                statWS[m]++;
            }
            res.status(200).send(statWS);
        })
    } catch (error) {

    }
})
app.get("/downloadrapport", (req, res) => {
    
})
app.get("/morestatConv", (req, res) => {
    let token = req.headers['authorization'];
    const _id = jwt.verify(token, "hazem").idUser;
    const role = jwt.verify(token, "hazem").role;
    try {
        logs.find({}).where("requestType").equals("pdftowavfile").then((result) => {
            let statconv = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (let i in result) {
                let m = result[i].dateRequest.getMonth();
                statconv[m]++;
            }
            res.status(200).send(statconv);
        })
    } catch (error) {

    }

})
app.get("/getFile", (req, res) => {
    let AllData = JSON.parse(req.headers["data"]);
    let type = req.headers['type'];
    switch (type) {
        case 'dashbord': {
            let data = AllData.data;
            let reqs = AllData.req;
            let totalreq = AllData.totalreq;
            let totalearn = AllData.totalearn;
            let totaluser = AllData.totaluser
            var root = builder.create("dataRapport");
            const GeneraldataUsers = root.ele("GeneraldataUsers")
            GeneraldataUsers.ele("nbrUsers", "", totaluser).end();
            GeneraldataUsers.ele("totalearn", "", totalearn).end();
            GeneraldataUsers.ele("totalreq", "", totalreq).end();
            var userDetails = root.ele("userDetails");

            for (let i in data) {
                let userData = userDetails.ele("userData");
                userData.ele("name", "", data[i].nom).end();
                userData.ele("prenom", "", data[i].prenom).end();
                userData.ele("email", "", data[i].email).end();
                userData.ele("role", "", data[i].role).end();
                userData.ele("lastConnexion", "", data[i].lastConn).end();
            }
            var reqq = root.ele("RequestPerService");
            reqq.ele("requestsConv", "", reqs[0]).end();
            reqq.ele("requestWS", "", reqs[1]);
            let finalDoc = root.end();
            fs.writeFileSync("RapportDashbord.xml", finalDoc);
            

        }
        case 'statsWS': {

        }
        case 'statsConv': {

        }
    }
})
app.get("/fileget",(req,res)=>{
    const streamfile=fs.createReadStream("C:/Users/raoua/Desktop/FormationProj/Back-end/hello.txt");
    res.attachment("Rapport.xml")

    streamfile.pipe(res);

})
async function getTotalWS(res, result) {
    let data = [];
    for (let i in result) {
        let idUser = result[i]._id;
        await logs.find({ idUser }).where("requestType").equals("pdftobase64").then((resul) => {
            let obj = { user: result[i].nom + " " + result[i].prenom, total: resul.length, logs: resul }
            data.push(obj)
        })
    }
    res.status(200).send(data);
}

async function getTotalConvertisseur(res, result) {
    let data = [];
    for (let i in result) {
        let idUser = result[i]._id;
        await logs.find({ idUser }).where("requestType").equals("pdftowavfile").then((resul) => {
            let obj = { user: result[i].nom + " " + result[i].prenom, total: resul.length, logs: resul }
            data.push(obj)
        })
    }
    res.status(200).send(data);
}


module.exports = app;




