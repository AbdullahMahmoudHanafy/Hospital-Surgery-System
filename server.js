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
    res.render("./homePage.ejs");
})

app.get("/homePage", (req, res) => {
    res.render("./homePage.ejs");

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

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
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





app.post("/addAdmin", async (req, respond) => {
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

        await pool.query(`select * from admin where nationalid = '${nationalID}' OR email='${email}'`, (err, res) => {
            if(res.rows.length == 0){
                pool.query("insert into admin (name, email, nationalid, phone, address, password, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    [name, email, nationalID, phone, address, password, sex, image, bdate], (err, res) => {
                        if(err)
                            console.log(err)
                    }
                )
                respond.render("./adminProfile.ejs");
            }

            else{
                //the admin already exists 
                console.log("the admin already exists")
            }   
    }) 
    }
    else {
        //the repassword doesn't match the password 
        console.log("the repassword doesn't match the password")
    }
})


//malak

app.post("/addPatient", async(req,respond) => {
    let name = req.body["name"], 
    ID = req.body["ID"], 
    birthdate = req.body["birthdate"], 
    sex = req.body["sex"], 
    address = req.body["address"], 
    phone = req.body["phone"], 
    image = "123"

    await pool.connect();

    await pool.query(`select * from patient where nationalid = '${ID}'`, (err, res) => {
        if(res.rows.length == 0){
            pool.query("insert into patient (name, nationalid, birthdate, sex, address, phone, image) values ($1, $2, $3, $4, $5, $6, $7)", 
                [name, ID, birthdate, sex, address, phone, image], (err, res) => {
                    if(err)
                        console.log(err)
            })
            respond.render("./patientProfile.ejs" )
        }
        else{
            //the patient already exists
            console.log("patient already exists")
        } 
    })
})

app.post("/addSurgeon", async(req,respond) => {
    let name = req.body["name"], 
    ID = req.body["ID"], 
    birthdate = req.body["birthdate"], 
    sex = req.body["sex"], 
    address = req.body["address"], 
    phone = req.body["phone"], 
    email = req.body["email"],
    speciality = req.body["speciality"],
    image = "123"

    await pool.connect();

    await pool.query(`select * from surgeon where nationalid = '${ID}' OR email = '${email}'`, (err, res) => {
        if(res.rows.length == 0)
            {
            pool.query("insert into surgeon (name, nationalid, birthdate, sex, address, phone, email, speciality, image) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                [name, ID, birthdate, sex, address, phone, email, speciality, image], (err, res) => {
            if(err)
                console.log(err)
            })
            respond.render("./doctorProfile.ejs" )
            }
        else{
            //the surgeon already exixts 
            console.log("the surgeon already exists")
        }
    } )
})

app.post("/addDevice", async (req, respond) => {
    let name = req.body["name"],
    serial = req.body["serial"], 
    price = req.body["price"], 
    warranty = req.body["warranty"], 
    status = req.body["status"],
    company = req.body["company"],
    date = req.body["date"]

    await pool.connect();

    await pool.query(`select * from device where serial = '${serial}'`, (err, res) => {
        if(res.rows.length == 0)
            {    
            pool.query("insert into device (name, serial, price, warranty, status, company, date) values ($1, $2, $3, $4, $5, $6, $7)",
                [name, serial, price, warranty, status, company, date], (err, res) => {
                    if(err)
                        console.log(err)
                    }
                )
            respond.render("./homePage.ejs")
            }
        else{
            //the device already exists 
            console.log("the device already exists")
        }
    })
})

app.post("/addAppointment", async (req, respond) => {
    let patientID = req.body["patientID"],
    surgeonID = req.body["surgeonID"], 
    operationID = req.body["operationID"], 
    roomNumber = req.body["roomNumber"], 
    date = req.body["date"],
    time = req.body["time"]

    await pool.connect();
    await pool.query(`select * from patient where nationalid = '${patientID}'`, (err, resp) => {
        if(resp.rows.length != 0)
            {pool.query(`select * from surgeon where nationalid = '${surgeonID}'`, (err, ress) => {
                if(ress.rows.length != 0){
                    pool.query(`select * from operation where code = '${operationID}'`, (err, reso) => {
                        if(reso.rows.length != 0){
                            pool.query("insert into appointment (patientid, surgeonid, operationid, roomnumber, date, time) values ($1, $2, $3, $4, $5, $6)",
                                [patientID, surgeonID, operationID, roomNumber, date, time], (err, res) => {
                                    if(err)
                                        console.log(err)
                                }
                            )
                            respond.render("./homePage.ejs")
                        }
                        else{
                            //"this operation doesn't exist"
                            console.log("this operation doesn't exist")
                        }
                    })
                }
                else{
                    //"this surgeon doesn't exist"
                    console.log("this surgeon doesn't exist")
                }
            })
        }
        else{ 
            //"this patient doesn't exist"
            console.log("this patient doesn't exist")
        }
    })
})

app.listen(port, (req, res) => {
    console.log(`server is running on port number ${port}`);
})