
PDFParser = require("pdf2json");
const say = require('say')
var fs = require('fs');
var ms = require('mediaserver');
var fileupload = require("express-fileupload");


const express = require('express');
const bodyParser = require('body-parser');

const bcryt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const logs = require('../models/logs');
const Files = require("../models/file");
const Creditdetails = require('../models/creditcardsDetails');
const Contact = require("../models/contact");

const config = require('./../db/config');
var app = express();

app.use(bodyParser.json());
app.use(fileupload());

app.post("/contactAdd", (req, res) => {
  data = new Contact({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    description: req.body.description,
  })
  data.save().then((result) => {
    res.status(200).send();
  }).catch((error) => {

  })
})

app.post("/inscription", (req, res) => {
  req.body._password = bcryt.hashSync(req.body._password, 12);
  let secretkey = bcryt.hashSync(req.body._prenom + "user", 5);
  let maxReq = 0;
  if (req.body._type === "free") {
    maxReq = 200
  }
  else {
    maxReq = 2000
  }
  data = new User({
    nom: req.body._nom,
    prenom: req.body._prenom,
    email: req.body._email,
    password: req.body._password,
    role: req.body._type,
    secret_key: secretkey,
    maxrequest: maxReq
  });
  data.save().then(() => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send({
      mesg: "Erreur : " + err
    });
  });

})

app.post("/addCardDetails", (req, res) => {
  let idUser = req.body.idUser;
  let data = new Creditdetails({
    idUser: idUser,
    nameCard: req.body.name,
    creditnumber: req.body.creditnumber,
    cvvNumber: req.body.cvvNumber,
    monthExpr: req.body.monthExpr,
    yearExpr: req.body.yearExpr
  })
  data.save().then((result) => {
    res.status(200).send("ok");
  }).catch((error) => {

  })
})

app.post("/connexion", (req, res) => {
  let email = req.body._email;
  let password = req.body._password;
  User.findOne({ email }).then((user) => {
    if (!user) {
      res.status(404).send({
        msg: "Email Incorrect !"
      })
    } else {
      if (!bcryt.compareSync(password, user.password)) {
        res.status(404).send({ msg: "Wrong Password !  " });
      }
      let token = jwt.sign({ idUser: user._id, role: user.role }, "hazem").toString();
      let status = true
      let _id = user._id;
      let dateConnexion = Date.now()
      User.findOneAndUpdate({ _id }, { $set: { status, dateConnexion } }).then((res) => {
      }).catch((err) => { });
      res.status(200).send({ token });
    }

  }).catch((err) => {
    console.log(err)
    res.status(404).send({
      mesg: "Erreur : " + err
    });
  })
});

app.post("/deconnexion", (req, res) => {
  try {
    let token = req.headers['authorization'];
    const _id = jwt.verify(token, "hazem").idUser;
    let status = false;
    let dateDeconexion = new Date();
    User.findOneAndUpdate({ _id }, { $set: { status, dateDeconexion } }).then((result) => {
      if (result.length != 0) {
        res.status(200).send();
      }
    }).catch((error) => {
      res.status(400).send(error);
    })
  } catch (err) {

  }

})

app.post("/deleteFile", (req, res) => {
  try {
    let token = req.headers['authorization'];
    const _id = jwt.verify(token, "hazem").idUser;
    const role = jwt.verify(token, "hazem").role;
    const paths = req.body.paths;
    if (role === "premium") {
      console.log("in")
      deleteFiles(res, paths);

    } else {
      res.status(403).send("Not Authorazied ! ");
    }

  } catch (error) {
    res.status(404).send(error);
  }
})


app.get("/infoService", (req, res) => {
  try {
    let token = req.headers['authorization'];
    const _id = jwt.verify(token, "hazem").idUser;
    User.findById({ _id }).then((ress) => {
      let idUser = _id;
      let requestType = "pdftobase64"
      if (ress.role === "free" || ress.role === "premium") {
        logs.find({ idUser, requestType }).then((result) => {
          let data = [];
          for (let i in result) {
            data.push(result[i]);
          }
          res.status(200).send({ logs: data, secretkey: ress.secret_key, nom: ress.nom, prenom: ress.prenom, nbrReq: ress.nbrRequest, restReq: (ress.maxrequest - ress.nbrRequest) })
        })
      }
    }).catch((err) => {
      res.status(400).send(err);
    })
  } catch (err) {
    res.status(400).send(err);
  }

});

app.get("/infoConvert", (req, res) => {
  try {
    let token = req.headers['authorization'];
    const _id = jwt.verify(token, "hazem").idUser;
    User.findById({ _id }).then((ress) => {
      let idUser = _id;
      let requestType = 'pdftowavfile';
      logs.find({ idUser, requestType }).then((result) => {
        let data = [];
        let cpt = 0;
        for (let i in result) {
          data.push(result[i]);
          cpt++;
        }
        res.status(200).send({ logs: data, total: cpt })
      })

    }).catch((err) => {
      res.status(400).send(err);
    })
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/listefiles", (req, res) => {
  try {
    let token = req.headers['authorization'];
    const _id = jwt.verify(token, "hazem").idUser;
    let idUser = _id;
    Files.find({ idUser }).then((result) => {
      let Data = [];
      let cpt = 0;
      let totalSize = 0;
      User.findOne({ _id }).then((resut) => {
        totalSize = resut.totalFileSize;
        if (resut.length != 0) {
          for (let i in result) {
            cpt++;
            Data.push(result[i]);
          }
          res.status(200).send({ total: cpt, data: Data, totalSize: totalSize.toFixed(2) + "/1024 MO" });
        } else {
          res.status(400).send("Error ")
        }
      }).catch((error) => {
        res.status(400).send("Error " + error)
      })


    })
  } catch (err) {
    res.status(400).send("error");
  }
})
app.get("/streamwav", (req, res) => {
  try {
    let token = req.query.auth
    const role = jwt.verify(token, "hazem").role;
    if (role === "premium") {
      let file = req.query.file
      ms.pipe(req, res, file);
    }
  } catch (err) {
    res.status(400).send(err);
  }
})

app.post("/uploadfile", (req, res) => {
  try {
    let token = req.headers['authorization'];
    const data = jwt.verify(token, "hazem");
    const role = data.role;
    const _id = data.idUser;
    let size = (req.files['file'].size) / (1024 * 1024);
    if (role === "premium" && size < 1.5) {
      User.findOne({ _id }).then((resul) => {
        let totalFileSize = size + resul.totalFileSize;
        User.findOneAndUpdate({ _id }, { $set: { totalFileSize } }).then((resull) => {
          if (resull.totalFileSize + size < 1024) {
            let lang = req.headers['language'];
            let speaker = (lang === "English") ? "Zira" : "Hortense";
            fs.writeFileSync("uploadfiles/" + req.files['file'].name, req.files['file'].data);
            let name = (req.files['file'].name + "").split('.');
            convert("uploadfiles/" + req.files['file'].name, speaker, name[0]).then((res) => {
              let file = new logs({
                idUser: _id,
                dateRequest: new Date(),
                requestType: "pdftowavfile"
              })
              file.save().then(() => {
                let data = new Files({
                  path: 'fileswav/' + name[0] + '.wav',
                  idUser: _id,
                  dateConvert: new Date(),
                  size: size
                })
                data.save().then(() => {

                }).catch((err) => {
                  res.status(400).send({
                    mesg: "Erreur : " + err
                  });
                });
              })
            });
          } else {
            res.send({
              mesg: "Error , Storage is Full  "
            });
          }

        })

      })


    } else {
      res.status(400).send({
        mesg: "Error , check Your file size ( Need to be < 1.5MO) "
      });
    }
  } catch (err) {
    res.status(400).send({
      mesg: "Error , " + err
    });
  }
})
async function convert(name, speaker, filename) {
  let data = [];
  let pdfParser = new PDFParser(this, 1);
  pdfParser.loadPDF(name);
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
    fs.unlinkSync(name);
    towav(text, speaker, filename);

  });
}
function towav(text, speaker, filename) {
  say.export(text, 'Microsoft ' + speaker + ' Desktop', 0.9, 'fileswav/' + filename + '.wav', (err) => {
    if (err) {
      return console.error(err)
    }

  })
}

async function deleteFiles(res, files) {
  for (let i in files) {
    let _id = files[i];
    console.log(_id)
    await Files.findOneAndRemove({ _id }).then((result) => {
      let path = result.path;
      let size = result.size;
      let idUser = result.idUser
      console.log(size)
      User.find({ _id: idUser }).then((ress) => {
        let totalFileSize = ress[0].totalFileSize - size;
        User.findOneAndUpdate({ _id: idUser }, { $set: { totalFileSize } }).then((ress) => {
          console.log(ress)
          fs.unlinkSync(path);
        }).catch((errr) => {


        })
      })

    })
    res.status(200).send("okay deleted");
  }
}
module.exports = app;