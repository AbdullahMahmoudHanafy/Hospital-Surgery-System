import express from 'express';
import path from 'path';
import multer from 'multer';
import { dirname } from "path";
import { fileURLToPath } from "url";
import  pool  from "./database.js"
import { log } from 'console';
import { get } from 'http';

const port = 3000;

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));


app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "Public")));

app.get("/", (req, res) => {
    res.render("./loginPage.ejs",{loginError: ""});
})

app.post("/loginAdmin", async (req, login) => {
    let email = req.body["email"], password = req.body["password"]
    
    await pool.connect()
    
    await pool.query("select password from admin where email = $1", [email], async (err, res) => {
        if(err){
            console.log(err)
        }else {
            if(res.rowCount == 0)
                login.render("./loginPage.ejs", {loginError: "البريد الالكتروني خاطئ"})
            else if(res.rows[0]["password"] != password)
                login.render("./loginPage.ejs", {loginError: "كلمة المرور خاطئة"})
            else {
                let dataNumbers = await getNumbers()
                login.render("./homePage.ejs", {dataNumbers: dataNumbers})
            }
        }
    })
})

app.get("/homePage", async (req, res) => {
    let dataNumbers = await getNumbers()
    res.render("./homePage.ejs",{dataNumbers: dataNumbers});
})

app.get("/devices", async (req, data) => {


    await pool.query("select * from device", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {allDevices: res.rows, show: null, errorMessage : null});
        }
    })

})

app.get("/admins", async (req, data) => {

    await pool.query("select * from admin", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {allAdmins: res.rows, show: null, errorMessage : null});
        }
    })
})

app.get("/appointments", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{allAppointments: appointments.rows});
        }
    })
})

app.get("/doctors", async (req, data) => {

    await pool.query("select * from surgeon", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {allDoctors: res.rows, show: null, errorMessage : null});
        }
    })
})

app.get("/operations", async (req, data) => {

    await pool.query("select * from operation", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./operations.ejs", {allOperations: res.rows,show:null,errorMessage:null});
        }
    })
})

app.get("/patients", async (req, data) => {

    await pool.query("select * from patient", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {allPatients: res.rows, show: null, errorMessage : null});
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

async function getNumbers (req, res){
    let dataNumbers = ["", "", "", "", "", ""]


    await pool.query("select count(nationalid) from admin").then(res => {
        dataNumbers[0] = res.rows[0]["count"]
    })

    await pool.query("select count(nationalid) from surgeon").then(res => {
        dataNumbers[1] = res.rows[0]["count"]
    })

    await pool.query("select count(nationalid) from patient").then(res => {
        dataNumbers[2] = res.rows[0]["count"]
    })

    await pool.query("select count(serialnumber) from device").then(res => {
        dataNumbers[3] = res.rows[0]["count"]
    })

    await pool.query("select count(code) from operation").then(res => {
        dataNumbers[4] = res.rows[0]["count"]
    })

    await pool.query("select count(appointmentid) from appointment").then(res => {
        dataNumbers[5] = res.rows[0]["count"]
    })

    return dataNumbers
}


app.post("/adminsPageDeleteAdmin",async(req,res)=>{
    let id = req.body.deletetionID
    await pool.query("delete from admin where nationalid = $1",[id], async(err, rp) => {
        await pool.query("select * from admin", (err, respond) => {
            res.render("./admins.ejs", {allAdmins: respond.rows,show: null, errorMessage : null});
        })
    })
})

app.post("/doctorsPageDelete",async(req,res)=>{
    let id = req.body.deletetionID
    await pool.query("delete from surgeon where nationalid = $1",[id], async(err, rp) => {
        await pool.query("select * from surgeon", (err, respond) => {
            res.render("./doctors.ejs", {allDoctors: respond.rows, show: null, errorMessage : null});
        })
    })
})

app.post("/patientsPageDelete",async(req,res)=>{
    let id = req.body.deletetionID
    await pool.query("delete from patient where nationalid = $1",[id], async(err, rp) => {
        await pool.query("select * from patient", (err, respond) => {
            res.render("./patients.ejs", {allPatients: respond.rows,show: null, errorMessage : null});
        })
    })
})

app.post("/operationsPageDelete",async(req,res)=>{
    let code = req.body.deletetionCode
    await pool.query("delete from operation where code = $1",[code], async(err, rp) => {
        await pool.query("select * from operation", (err, respond) => {
            res.render("./operations.ejs", {allOperations: respond.rows,show:null,errorMessage:null});
        })
    })
})

app.post("/devicesPageDelete",async(req,res)=>{
    let Serial = req.body.deletetionSerial
    await pool.query("delete from device where serialnumber = $1",[Serial], async(err, rp) => {
        await pool.query("select * from device", (err, respond) => {
            res.render("./devices.ejs", {allDevices: respond.rows, show: null, errorMessage : null});
        })
    })
})

app.post("/appointmentsPageDelete",async(req,res)=>{
    let id = req.body.deletetionID
    await pool.query("delete from appointment where appointmentid = $1",[id], async(err, rp) => {
        await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
            if(err)
                console.log(err);
            else {
                res.render("./appointments.ejs",{allAppointments: appointments.rows,show:null,errorMessage:null});
            }
        })
    })
})

app.post("/adminsPageAdd",async(req,res)=>{
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

    if(repassword != password){
        await pool.query("select * from admin", (err, data) => {
            res.render("./admins.ejs", {allAdmins: data.rows, show: "show", errorMessage : "كلمات المرور غير متطابقة"});
        })
    }
    else{
        await pool.query("select * from admin where nationalid = $1",[nationalID], async(err, data) => {
            if(data.rows.length != 0){
                await pool.query("select * from admin", async(err, newdata) => {
                    res.render("./admins.ejs", {allAdmins: newdata.rows, show: "show", errorMessage : "الرقم القومي مستخدم"});
                })
                }
            else{
                await pool.query("select * from admin where email = $1",[email], async(err, emaildata) => {
                    if(emaildata.rows.length != 0){
                        await pool.query("select * from admin", async(err, newdata) => {
                            res.render("./admins.ejs", {allAdmins: newdata.rows, show: "show", errorMessage : "البريد الإلكتروني مستخدم"});
                        })
                    }
                    else
                    await pool.query("insert into admin (name, email, nationalid, phone, address, password, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    [name, email, nationalID, phone, address, password, sex, image, bdate], async(err, respond) => {
                        await pool.query("select * from admin", async(err, newdata) => {
                        res.render("./admins.ejs", {allAdmins: newdata.rows, show: null, errorMessage : null});
                    })
                    })
                })
            }
        })
    }
})

app.post("/patientsPageAdd",async(req,res)=>{
    let name = req.body["name"],
    sex = req.body["sex"], 
    bdate = req.body["birthDate"], 
    phone = req.body["phone"],
    address = req.body["address"],
    nationalID = req.body["nationalID"],
    image = "123"

    await pool.query("select * from patient where nationalid = $1",[nationalID], async(err, data) => {
        if(data.rows.length != 0){
            await pool.query("select * from patient", async(err, newdata) => {
                res.render("./patients.ejs", {allPatients: newdata.rows, show: "show", errorMessage : "الرقم القومي مستخدم"});
            })
            }
        else{
            await pool.query("insert into patient (name, nationalid, phone, address, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7)",
                [name, nationalID, phone, address, sex, image, bdate], async(err, respond) => {
                    if(err)
                        console.log(err)
                    await pool.query("select * from patient", async(err, newdata) => {
                    res.render("./patients.ejs", {allPatients: newdata.rows, show: null, errorMessage : null});
                })
                })
        }
    })
})


app.post("/doctorsPageAdd",async(req,res)=>{
    let name = req.body["name"],
    sex = req.body["sex"], 
    bdate = req.body["birthDate"], 
    email = req.body["email"], 
    speciality = req.body["speciality"],
    phone = req.body["phone"],
    address = req.body["address"],
    nationalID = req.body["nationalID"],
    image = "123"

        await pool.query("select * from surgeon where nationalid = $1",[nationalID], async(err, data) => {
            if(data.rows.length != 0){
                await pool.query("select * from surgeon", async(err, newdata) => {
                    res.render("./doctors.ejs", {allDoctors: newdata.rows, show: "show", errorMessage : "الرقم القومي مستخدم"});
                })
                }
            else{
                await pool.query("select * from surgeon where email = $1",[email], async(err, emaildata) => {
                    if(emaildata.rows.length != 0){
                        await pool.query("select * from surgeon", async(err, newdata) => {
                            res.render("./doctors.ejs", {allDoctors: newdata.rows, show: "show", errorMessage : "البريد الإلكتروني مستخدم"});
                        })
                    }
                    else
                    await pool.query("insert into surgeon (name, email, nationalid, phone, address, sex, image, birthdate, speciality) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    [name, email, nationalID, phone, address, sex, image, bdate,speciality], async(err, respond) => {
                        await pool.query("select * from surgeon", async(err, newdata) => {
                        res.render("./doctors.ejs", {allDoctors: newdata.rows, show: null, errorMessage : null});
                    })
                    })
                })
            }
        })
})

app.post("/devicesPageAdd",async(req,res)=>{
    let name = req.body.name,
    serial = req.body.serial,
    price = req.body.price,
    warranty = req.body.warranty,
    stat = req.body.status,
    company = req.body.company,
    date = req.body.date;

    await pool.query("select * from device where serialnumber = $1",[serial],async(err,data)=>{
        if(data.rows.length != 0){
            await pool.query("select * from device",(req,newdata)=>{
                res.render("./devices.ejs",{allDevices: newdata.rows,show: "show", errorMessage : "الرقم التسلسلي مستخدم"})
            })
        }
        else{
            await pool.query("insert into device (name, serialnumber, company, status, warranty, price, date) values ($1, $2, $3, $4, $5, $6, $7)",
                [name,serial,company,stat,warranty,price,date],async(err,respond)=>{
                    await pool.query("select * from device",(err,newdata)=>{
                        res.render("devices.ejs",{allDevices:newdata.rows,show:null,errorMessage:null})
                    })
                })
        }
    })
})

app.post("/operationsPageAdd",async(req,res)=>{
    let name = req.body.name,
    code = req.body.code,
    price = req.body.price,
    duration = req.body.duration,
    roomnumber = req.body.roomnumber,
    usedDevices = req.body["multiValueField"],
    description = req.body.description;
    let missedDevice = false;
    // if user entered one device typeof used devices will be string and the following algorithm use it as object so there must be a type casting
    if(typeof usedDevices == "string")
        usedDevices = [usedDevices];
    await pool.query("select * from operation where code = $1",[code],async(err,data)=>{
        if(data.rows.length != 0){
            await pool.query("select * from operation",(req,newdata)=>{
                res.render("./operations.ejs",{allOperations: newdata.rows,show: "show", errorMessage : "كود العملية مستخدم"})
            })}
        else{ 
            usedDevices.forEach(async (deviceSerialNumber)=>{
                await pool.query("insert into useddevice (deviceserial, operationcode) values ($1, $2)",[deviceSerialNumber, code],async(err,devicesData)=>{
                })
            })

            await pool.query("insert into operation (name, code, duration, price, roomnumber, description) values ($1, $2, $3, $4, $5, $6)",
                [name,code,duration,price,roomnumber,description], async(err, respond) => {
                    await pool.query("select * from operation",async (err, newdata) => {
                        res.render("./operations.ejs", {allOperations: newdata.rows,show:null,errorMessage:null});
                    })   
            })      
            }
    })
})


app.listen(port, (req, res) => {
    console.log(`server is running on port number ${port}`);
})