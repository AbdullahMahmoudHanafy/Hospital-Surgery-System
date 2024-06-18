import express from "express";
import path from "path";
import multer from "multer";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pool from "./database.js";
import { log } from "console";
import { name } from "ejs";

const port = 3000;

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
  res.render("./homePage.ejs");
});

app.get("/homePage", (req, res) => {
  res.render("./homePage.ejs");
});

app.get("/devices", (req, res) => {
  res.render("./devices.ejs");
});

app.get("/admins", (req, res) => {
  res.render("./adminProfile.ejs", {
    errormessageadmin: null,
    name: "محمد احمد",
    email: "ma4910656@gmail.com",
    id: "30305182103098",
    mobile: "01116022617",
    sex: "ذكر",
    birthDate: "2003-05-18",
  });
});

app.get("/appointments", (req, res) => {
  res.render("./appointments.ejs");
});

app.get("/doctors", (req, res) => {
  res.render("./doctorProfile.ejs");
});

app.get("/operations", (req, res) => {
  res.render("./operations.ejs");
});

app.get("/patients", (req, res) => {
  res.render("./patientProfile.ejs");
});

app.post("/addAdmin", async (req, res) => {
  let name = req.body["name"],
    sex = req.body["sex"],
    bdate = req.body["birthDate"],
    email = req.body["email"],
    password = req.body["password"],
    repassword = req.body["repassword"],
    phone = req.body["phone"],
    address = req.body["address"],
    nationalID = req.body["nationalID"],
    image = "123";

  console.log(bdate);

  if (repassword == password) {
    await pool.connect();

    await pool.query(
      "insert into admin (name, email, nationalID, phone, address, password, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [name, email, nationalID, phone, address, password, sex, image, bdate],
      (err, res) => {
        if (err) console.log(err);
      }
    );
  } else {
  }
});

app.post("/editAdmin", async (req, res) => {
  let name = req.body["name"],
    id = req.body["id"],
    sex = req.body["sex"],
    email = req.body["email"],
    birthDate = req.body["birthDate"],
    mobile = req.body["mobile"],
    address = req.body["address"],
    password = req.body["password"],
    confirmPassword = req.body["confirmPassword"];
  let image = "123",
    oldid = req.body["oldid"];
  await pool.connect();
  await pool.query(
    `select * from admin where nationalid='${req.body["id"]}'`,
    (err, respond) => {
      if (!err) {
        if (respond.rows.length === 1) {
          pool.connect();
          pool.query(
            `select * from admin where nationalid ='${oldid}'`,
            (err2, respond2) => {
              res.render("adminProfile.ejs", {
                errormessageadmin: "this id has already been registered",
                name: respond2.name,
                email: respond2.email,
                id: respond2.id,
                mobile: respond2.phone,
                sex: respond2.sex,
                birthDate: respond2.birthDate,
              });
            }
          );
        } else if (req.body["password"] != req.body["confirmPassword"]) {
          pool.connect();
          pool.query(
            `select * from admin where nationalid ='${oldid}'`,
            (err2, respond2) => {
              res.render("adminProfile.ejs", {
                errormessageadmin: "the passwords do not match",
                name: respond2.name,
                email: respond2.email,
                id: respond2.id,
                mobile: respond2.phone,
                sex: respond2.sex,
                birthDate: respond2.birthDate,
              });
            }
          );
        } 
        // else if (req.body["id"].length() <= 1) {
        //   pool.connect();
        //   console.log(req.body["id"].length());
        //   pool.query(
        //     `select * from admin where nationalid ='${oldid}'`,
        //     (err2, respond2) => {
        //       res.render("adminProfile.ejs", {
        //         errormessageadmin: "invaild id",
        //         name: respond2.name,
        //         email: respond2.email,
        //         id: respond2.id,
        //         mobile: respond2.phone,
        //         sex: respond2.sex,
        //         birthDate: respond2.birthDate,
        //       });
        //     }
        //   );
        // } 
        else {
          pool.connect();
          pool.query(
            "UPDATE admin SET name = $1, email = $2, nationalid = $3, phone = $4, sex = $5, birthdate = $6, image = $7, address = $8, password = $9 WHERE nationalid = $10",
            [name, email, id, mobile, sex, birthDate, image,address,password,oldid],
            (err2, respond2) => {
              res.render("adminProfile.ejs", {
                errormessageadmin: null,
                name: name,
                email: email,
                id: id,
                mobile: mobile,
                sex: sex,
                birthDate: birthDate,
              });
            }
          );
        }
      } else console.log(err);
    }
  );
});

app.listen(port, (req, res) => {
  console.log(`server is running on port number ${port}`);
});
