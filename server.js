import express from 'express';
import path from 'path';
import multer from 'multer';
import { dirname } from "path";
import { fileURLToPath } from "url";
import  pool  from "./database.js"

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





app.post("/addAdmin", (req, res) => {
    let name = req.body["name"], sex = req.body["sex"]
    console.log(sex)
})



app.listen(port, (req, res) => {
    console.log(`server is running on port number ${port}`);
})