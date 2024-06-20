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

 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//       cb(null, path.join(__dirname, 'public/images/'));
//   },
//   filename: (req, file, cb) => {
//       cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));



function calculateAge(birthdate) {
  const birthDate = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust age if the current month and day are before the birth date
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }

  return age;
}


function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


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
    birthDate: formatDate("2003-05-18"),
    age: calculateAge("2003-05-18"),
    address: "الدقي",

  });
});

app.get("/appointments", (req, res) => {
  res.render("./appointments.ejs");
});

app.get("/doctors", (req, res) => {
  res.render("./doctorProfile.ejs", {
    errormessagedoctor: null,
    name: "احمد ابو الفتوح",
    email: "ahmed@example",
    id: "15142369874521",
    phone: "01523698741",
    birthdate:formatDate ("1978-03-03"),
    sex: "ذكر",
    address: "القاهرة",
    specialization: "جراحة العيون",
    age: calculateAge("1978-03-03"),
  });
});

app.get("/operations", (req, res) => {
  res.render("./operations.ejs");
});

app.get("/patients", (req, res) => {
  res.render("./patientProfile.ejs", {
    errormessagepatient: null,
    name: "ابراهيم الابيض",
    id: "123456789101213",
    phone: "01123456789",
    sex: "ذكر",
    address: "الدقي",
    birthdate: formatDate( "1974-05-24"),
    age: calculateAge("1974-05-24"),
  });
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
    birthDate = formatDate( req.body["birthDate"]),
    mobile = req.body["mobile"],
    address = req.body["address"],
    password = req.body["password"],
    age = calculateAge(birthDate),
    confirmPassword = req.body["confirmPassword"],
    image = "123",
    oldid = req.body["oldid"];
  await pool.connect();
  await pool.query(
    `select * from admin where nationalid='${req.body["id"]}'`,
    (err, respond) => {
      if (!err) {
        if (respond.rows.length === 1 && id != oldid) {
          pool.connect();
          pool.query(
            `select * from admin where nationalid ='${oldid}'`,
            (err2, respond2) => {
              res.render("adminProfile.ejs", {
                errormessageadmin: "هذا الرقم القومي مسجل بالفعل",
                name: respond2.rows[0].name,
                email: respond2.rows[0].email,
                id: respond2.rows[0].nationalid,
                mobile: respond2.rows[0].phone,
                sex: respond2.rows[0].sex,
                address: respond2.rows[0].address,
                birthDate: formatDate(respond2.rows[0].birthdate),
                age : calculateAge(formatDate(respond2.rows[0].birthdate))
              });
            }
          );
        } else if (req.body["password"] != req.body["confirmPassword"]) {
          pool.connect();
          pool.query(
            `select * from admin where nationalid ='${oldid}'`,
            (err2, respond2) => {
              res.render("adminProfile.ejs", {
                errormessageadmin: "كلمات المرور غير متطابقة",
                name: respond2.rows[0].name,
                email: respond2.rows[0].email,
                id: respond2.rows[0].nationalid,
                mobile: respond2.rows[0].phone,
                sex: respond2.rows[0].sex,
                address: respond2.rows[0].address,
                birthDate: formatDate(respond2.rows[0].birthdate),
                age : calculateAge(formatDate(respond2.rows[0].birthdate))

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
            [
              name,
              email,
              id,
              mobile,
              sex,
              birthDate,
              image,
              address,
              password,
              oldid,
            ],
            (err2, respond2) => {
              res.render("adminProfile.ejs", {
                errormessageadmin: null,
                name: name,
                email: email,
                id: id,
                mobile: mobile,
                sex: sex,
                birthDate: birthDate,
                address: address,
                age: calculateAge(birthDate)
              });
            }
          );
        }
      } else console.log(err);
    }
  );
});

app.post("/editPatient", async (req, res) => {
  let name = req.body["name"],
    id = req.body["nationalID"],
    birthdate = formatDate(req.body["birthDate"]),
    sex = req.body["sex"],
    image = "123",
    phone = req.body["mobile"],
    address = req.body["address"],
    age = calculateAge(birthdate),
    oldid = req.body["oldid"];
  await pool.connect();
  await pool.query(
    `SELECT * from patient WHERE nationalid = '${id}'`,
    (err, respond) => {
      if (!err) {
        if (respond.rows.length === 1 && id != oldid) {
          pool.connect();
          pool.query(
            `SELECT * FROM patient WHERE nationalid = '${oldid}'`,
            (err2, respond2) => {
              res.render("patientProfile.ejs", {
                errormessagepatient: "هذا الرقم القومي مسجل بالفعل",
                name: respond2.rows[0].name,
                id: respond2.rows[0].nationalid,
                birthdate: formatDate(respond2.rows[0].birthdate),
                sex: respond2.rows[0].sex,
                address: respond2.rows[0].address,
                phone: respond2.rows[0].phone,
                age : calculateAge(formatDate(respond2.rows[0].birthdate)),
              });
            }
          );
        } else {
          pool.connect();
          pool.query(
            "update patient SET name = $1, nationalid = $2, address = $3, phone = $4, sex = $5, image = $6, birthdate = $7 where nationalid = $8",

            [name, id, address, phone, sex, image, birthdate, oldid],
            (err2, respond2) => {
              res.render("patientProfile.ejs", {
                errormessagepatient: null,
                name: name,
                id: id,
                phone: phone,
                birthdate: birthdate,
                sex: sex,
                address: address,
                age: calculateAge(birthdate),
              });
            }
          );
        }
      } else console.log(err);
    }
  );
});

app.post("/editSurgeon", async (req, res) => {
  let name = req.body["name"],
    email = req.body["email"],
    phone = req.body["mobile"],
    birthdate = formatDate(req.body["birthDate"]),
    oldid = req.body["oldid"],
    sex = req.body["sex"],
    id = req.body["id"],
    image = "123",
    address = req.body["address"],
    specialization = req.body["special"];

  await pool.connect();
  await pool.query(
    `select * from surgeon where nationalid = '${id}'`,
    (err, respond) => {
      if (!err) {
        if (respond.rows.length === 1 && id != oldid) {
          pool.connect();
          pool.query(
            `select * from surgeon where nationalid ='${oldid}'`,
            (err2, respond2) => {
              res.render("doctorProfile.ejs", {
                errormessagedoctor: "هذا الرقم القومي مسجل بالفعل",
                name: respond2.rows[0].name,
                email: respond2.rows[0].email,
                id: respond2.rows[0].nationalid,
                phone: respond2.rows[0].phone,
                sex: respond2.rows[0].sex,
                address: respond2.rows[0].address,
                birthdate: formatDate(respond2.rows[0].birthdate),
                specialization: respond2.rows[0].speciality,
                age:calculateAge(formatDate(respond2.rows[0].birthdate)),
              });
            }
          );
        } else {
          pool.connect();
          pool.query(
            `update surgeon set name = $1 , nationalid = $2 ,email = $3 , phone = $4, sex = $5 , birthdate = $6 ,address =$7 , image = $8 , speciality = $9 where nationalid = $10`,
            [
              name,
              id,
              email,
              phone,
              sex,
              birthdate,
              address,
              image,
              specialization,
              oldid,
            ],

            (err2, respond2) => {
              res.render("doctorProfile.ejs", {
                errormessagedoctor: null,
                name: name,
                id: id,
                email: email,
                phone: phone,
                birthdate: birthdate,
                sex: sex,
                address: address,
                specialization: specialization,
                age: calculateAge(birthdate),
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
