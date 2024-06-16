import express from 'express';
import path from 'path';
import multer from 'multer';
import { dirname } from "path";
import { fileURLToPath } from "url";

const port = 3000;

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
    res.render("./homePage.ejs",);
})




app.listen(port, (req, res) => {
    console.log(`server is running on port number ${port}`);
})