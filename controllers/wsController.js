
PDFParser = require("pdf2json");
const say = require('say');
var fs = require('fs');


var fileupload = require("express-fileupload");


const express = require('express');
const bodyParser = require('body-parser');



const User = require('../models/user');

const logs = require('../models/logs');

const config = require('../db/config');
var app = express();

app.use(bodyParser.json());
app.use(fileupload());

app.post("/pdftobase64", (req, res) => {
  let secret_key = req.query.secret_key
  let lang = req.query.lang
  let size = ((req.files['filetoupload'].size) / (1024 * 1024))
  User.find({}).where("secret_key").equals(secret_key).then((result) => {
    if (result.length == 0) {
      res.send("secret key invalid")
    } else {
      if (size > (512 / 1024) && result[0].role === "free") {
        res.status(400).send("Size need to be < 512Ko");
      } else {
        if (size > (1.5) && result[0].role === "premium") {
          res.status(400).send("Size need to be < 1.5MO");
        } else {
          let nbrRequest = result[0].nbrRequest + 1;
          let _id = result[0]._id;
          let speaker = (lang === "eng") ? "Zira" : "Hortense";
          console.log(speaker);
          User.findOneAndUpdate({ _id }, { $set: { nbrRequest } }).then((re) => {
            let file = new logs({
              idUser: _id,
              dateRequest: new Date(),
              requestType: "pdftobase64"
            })
            file.save().then(() => {

            })
            let name = (req.files['filetoupload'].name + "").split('.');
            let path = "uploadfiles/" + req.files['filetoupload'].name;

            fs.writeFileSync(path, req.files['filetoupload'].data);
            convert(path, speaker, name[0], res, "pdftobase64").then((r) => {

            });
          })
        }
      }
    }


  }).catch((err) => {

  })
});

app.post("/pdftowavfile", (req, res) => {
  let secret_key = req.query.secret_key
  let lang = req.query.lang
  let size = ((req.files['filetoupload'].size) / (1024 * 1024))

  User.find({}).where("secret_key").equals(secret_key).then((result) => {
    if (result.length == 0) {
      res.send("secret key invalid")
    } else {
      if (size > (512 / 1024) && result[0].role === "free") {
        res.status(400).send("Size need to be < 512Ko");
      } else {
        if (size > (1.5) && result[0].role === "premium") {
          res.status(400).send("Size need to be < 1.5MO");
        } else {
          let nbrRequest = result[0].nbrRequest + 1;
          let _id = result[0]._id;
          let speaker = (lang === "eng") ? "Zira" : "Hortense";
          User.findOneAndUpdate({ _id }, { $set: { nbrRequest } }).then((re) => {
            let file = new logs({
              idUser: _id,
              dateRequest: new Date(),
              requestType: "pdftowavfile"
            })
            file.save().then(() => {

            })
            let name = (req.files['filetoupload'].name + "").split('.');
            let path = "uploadfiles/" + req.files['filetoupload'].name;

            fs.writeFileSync(path, req.files['filetoupload'].data);
            convert(path, speaker, name[0], res, "pdftowav").then((r) => {

            });
          })
        }
      }
    }


  }, (err) => {

  })
});

async function convert(path, speaker, filename, res, type) {
  let data = [];
  let pdfParser = new PDFParser(this, 1);
  pdfParser.loadPDF(path);
  await pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
  await pdfParser.on("pdfParser_dataReady", pdfData => {
    let a = pdfParser.getRawTextContent();
    for (let i in a) {
      data.push(a[i]);
    }
    let text = "";
    for (let i in data) {
      if (data[i] !== "" || data[i] !== '-') {
        text += data[i]

      }
    }
    fs.unlinkSync(path);
    towav(text, speaker, filename, res, type);
  });
}

function towav(text, speaker, filename, res, type) {
  say.export(text, 'Microsoft ' + speaker + ' Desktop', 0.9, 'fileswav/' + filename + '.wav', (err) => {
    if (err) {
      return console.error(err)
    }
    if (type === "pdftowav") {
      res.download('fileswav/' + filename + '.wav');
    } else {
      let base64 = fs.readFileSync('fileswav/' + filename + '.wav').toString('base64');
      fs.unlinkSync('fileswav/' + filename + '.wav');
      res.send({ data: base64 })
    }
  })
}

module.exports = app;





//getText();

/*





async function getText() {
  let pdfParser = new PDFParser(this, 1);
  let res = "";
  let data = [];
  pdfParser.loadPDF("E:/Users/raoua/Downloads/Examen2018.pdf");
  pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
  await pdfParser.on("pdfParser_dataReady", pdfData => {
    let a = pdfParser.getRawTextContent();
    for (let i in a) {
      data.push(a[i]);
    }
    let text = "";
    let cpt = 0;
    for (let i in data) {
      if (data[i] !== "" || data[i] !== '-') {
        text += data[i]

      }
    }

    say.export("hello world", 'Microsoft Zira Desktop', null, 'hallo.wav', (err) => {
      if (err) {
        return console.error(err)
      }
      console.log('Text has been saved to hal.wav.')
    })
  });


}
*/
