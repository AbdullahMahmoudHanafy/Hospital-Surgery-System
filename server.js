import express from 'express';
import path from 'path';
import multer from 'multer';
import { dirname } from "path";
import { fileURLToPath } from "url";
import  pool  from "./database.js"
import { log } from 'console';

const port = 3000;

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
    res.render("./homePage.ejs",);
})

app.get("/homePage", (req, res) => {
    res.render("./homePage.ejs",);
})

app.get("/devices", (req, res) => {
    res.render("./devices.ejs");
})

app.get("/admins", (req, res) => {
    res.render("./admins.ejs");
})

app.get("/appointments", (req, res) => {
    res.render("./appointments.ejs");
})

app.get("/doctors", (req, res) => {
    res.render("./doctors.ejs");
})

app.get("/operations", (req, res) => {
    res.render("./operations.ejs");
})

app.get("/patients", (req, res) => {
    res.render("./patients.ejs");
})





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
    image = "123"

    console.log(bdate)

    if(repassword == password)
    {
        await pool.connect();
        
        await pool.query("insert into admin (name, email, nationalID, phone, address, password, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            [name, email, nationalID, phone, address, password, sex, image, bdate], (err, res) => {
                if(err)
                    console.log(err)
            }
        )
    }
    else {

    }
})



app.listen(port, (req, res) => {
    console.log(`server is running on port number ${port}`);
})