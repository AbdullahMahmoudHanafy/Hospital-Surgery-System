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

app.get("/devices", async (req, data) => {

    await pool.connect()

    await pool.query("select * from device", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {allDevices: res.rows});
        }
    })
})

app.get("/admins", async (req, data) => {
    await pool.connect()

    await pool.query("select * from admin", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {allAdmins: res.rows});
        }
    })
})

app.get("/appointments", async (req, data) => {
    await pool.connect()

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{allAppointments: appointments.rows});
        }
    })
})

app.get("/doctors", async (req, data) => {
    await pool.connect()

    await pool.query("select * from surgeon", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {allDoctors: res.rows});
        }
    })
})

app.get("/operations", async (req, data) => {
    await pool.connect()

    await pool.query("select * from operation", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./operations.ejs", {allOperations: res.rows});
        }
    })
})

app.get("/patients", async (req, data) => {
    await pool.connect()

    await pool.query("select * from patient", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {allPatients: res.rows});
        }
    })
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