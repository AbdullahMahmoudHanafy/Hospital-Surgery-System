import express from "express";
import path from "path";
import multer from "multer";
import { dirname } from "path";
import { fileURLToPath } from "url";
import  pool  from "./database.js"
import session from 'express-session';

const port = 3000;

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));


app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

await pool.connect()

function calculateAge(birthdate) {
  const birthDate = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust age if the current month and day are before the birth date
//   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//   }

  return age;
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}



app.use(session({
    secret: 'secret_key', // Change this to a strong secret
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 60 * 30 * 1000, // Session duration (in milliseconds)
    },
}));

app.get("/", (req, res) => {
    res.render("./loginPage.ejs",{loginError: ""});
})

app.post("/loginAdmin", async (req, login) => {
    let email = req.body["email"], password = req.body["password"]
    
    await pool.query("select * from admin where email = $1", [email], async (err, res) => {
        if(err){
            console.log(err)
        }else {
            if(res.rowCount == 0)
                login.render("./loginPage.ejs", {loginError: "البريد الالكتروني خاطئ"})
            else if(res.rows[0]["password"] != password)
                login.render("./loginPage.ejs", {loginError: "كلمة المرور خاطئة"})
            else {

                let dataNumbers = await getNumbers()
                let userId = res.rows[0]["nationalid"],
                    username = res.rows[0]["name"],
                    profileImage = res.rows[0]["image"]
    
                    req.session.user = {
                        userId, username, profileImage
                    }

                    login.render("./homePage.ejs",
                        {
                            name: req.session.user["username"],
                            image: req.session.user["image"],
                            dataNumbers: dataNumbers,
                            show:  null, error: "",
                            show1:  null, addSurgeonError: "",
                            show2:  null, addPatientError: "",
                            show3:  null, addAdminError: "",
                            show4:  null, addOperationError: "",
                            show5:  null, addDeviceError: "",
                            show6:  null, addAppointmentError: ""
                        }
                    )
            }
        }
    })
})

app.get("/homePage", async (req, res) => {
    let dataNumbers = await getNumbers()
    res.render("./homePage.ejs",
        {
            name: req.session.user["username"],
            image: req.session.user["image"],
            dataNumbers: dataNumbers,
            show:  null, error: "",
            show1:  null, addSurgeonError: "",
            show2:  null, addPatientError: "",
            show3:  null, addAdminError: "",
            show4:  null, addOperationError: "",
            show5:  null, addDeviceError: "",
            show6:  null, addAppointmentError: ""
        })
})

app.get("/devices", async (req, data) => {

    await pool.query("select * from device", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {allDevices: res.rows, show: null, errorMessage : null, name:req.session.user["username"]});
        }
    })
})

app.get("/admins", async (req, data) => {

    await pool.query("select * from admin", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {allAdmins: res.rows, show: null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/appointments", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctors", async (req, data) => {

    await pool.query("select * from surgeon", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {allDoctors: res.rows, show: null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/operations", async (req, data) => {

    await pool.query("select * from operation", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./operations.ejs", {allOperations: res.rows,show:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/patients", async (req, data) => {

    await pool.query("select * from patient", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {allPatients: res.rows, show: null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/currentAdminProfile", async (req, res) => {
    await pool.query(`select * from admin where nationalid = '${req.session.user["userId"]}'`, (err, adminUser) => {
        if(err)
            console.log(err)
        else {
            let name = req.session.user["username"],
            id = req.session.user["userId"],
            email = adminUser.rows[0]["email"],
            mobile = adminUser.rows[0]["phone"],
            birthdate = adminUser.rows[0]["birthdate"].toLocaleDateString('en-GB'),
            sex = adminUser.rows[0]["sex"],
            address = adminUser.rows[0]["address"],
            age = calculateAge(formatDate(adminUser.rows[0]["birthdate"]))

            res.render("./adminProfile.ejs", {name: name, adminName: name, id: id, email: email, address: address, mobile: mobile, birthDate: birthdate, sex: sex, address: address, age: age, image: req.session.user["image"],errormessageadmin: ""})
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

        await pool.query(`select * from admin where nationalid = '${nationalID}'`, async (err, res) => {
            if(err)
                console.log(err)
            else {
                if(res.rowCount > 0)
                    {
                        let dataNumbers = await getNumbers()
                        respond.render("./homePage.ejs",
                            {
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                dataNumbers: dataNumbers,
                                show:  null, error: "",
                                show1:  null, addSurgeonError: "",
                                show2:  null, addPatientError: "",
                                show3:  "show", addAdminError: "هذا الرقم القومي موجود بالفعل",
                                show4:  null, addOperationError: "",
                                show5:  null, addDeviceError: "",
                                show6:  null, addAppointmentError: ""
                            })
                    }
                    else{
                        await pool.query(`select * from admin where email = '${email}'`, async (err, res) => {
                            if(err)
                                console.log(err)
                            else {
                                if(res.rowCount > 0)
                                    {
                                        let dataNumbers = await getNumbers()
                                        respond.render("./homePage.ejs",
                                            {
                                                name: req.session.user["username"],
                                                image: req.session.user["image"],
                                                dataNumbers: dataNumbers,
                                                show:  null, error: "",
                                                show1:  null, addSurgeonError: "",
                                                show2:  null, addPatientError: "",
                                                show3:  "show", addAdminError: "هذا البريد الالكتروني موجود بالفعل",
                                                show4:  null, addOperationError: "",
                                                show5:  null, addDeviceError: "",
                                                show6:  null, addAppointmentError: ""
                                            })
                                    }else{
                                        await pool.query("insert into admin (name, email, nationalID, phone, address, password, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                                            [name, email, nationalID, phone, address, password, sex, image, bdate], async (err, res) => {
                                                if(err)
                                                    console.log(err)
                                                else {
                                                    let dataNumbers = await getNumbers()
                                                    respond.render("./homePage.ejs",
                                                        {
                                                            name: req.session.user["username"],
                                                            image: req.session.user["image"],
                                                            dataNumbers: dataNumbers,
                                                            show:  null, error: "",
                                                            show1:  null, addSurgeonError: "",
                                                            show2:  null, addPatientError: "",
                                                            show3:  null, addAdminError: "",
                                                            show4:  null, addOperationError: "",
                                                            show5:  null, addDeviceError: "",
                                                            show6:  null, addAppointmentError: ""
                                                        })
                                                }
                                            }
                                        )
                                    }
                            }
                        })
                    }
            }
        })
    }
    else {
        let dataNumbers = await getNumbers()
        respond.render("./homePage.ejs",
            {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                show1:  null, addSurgeonError: "",
                show2:  null, addPatientError: "",
                show3:  "show", addAdminError: "كلمة المرور غير متطابقة",
                show4:  null, addOperationError: "",
                show5:  null, addDeviceError: "",
                show6:  null, addAppointmentError: ""
            })
    }
})

app.post("/addPatient", async(req,respond) => {
    let name = req.body["name"], 
    ID = req.body["ID"], 
    birthdate = req.body["birthDate"], 
    sex = req.body["sex"], 
    address = req.body["address"], 
    phone = req.body["phone"], 
    image = "123"

    await pool.query(`select * from patient where nationalid = '${ID}'`, async (err, res) => {
        if(res.rowCount != 0)
            {
                let dataNumbers = await getNumbers()
                respond.render("./homePage.ejs",
                    {
                        name: req.session.user["username"],
                        image: req.session.user["image"],
                        dataNumbers: dataNumbers,
                        show:  null, error: "",
                        show1:  null, addSurgeonError: "",
                        show2:  "show", addPatientError: "هذا الرقم القومي موجود بالفعل",
                        show3:  null, addAdminError: "",
                        show4:  null, addOperationError: "",
                        show5:  null, addDeviceError: "",
                        show6:  null, addAppointmentError: ""
                    })
            }
        else{
            pool.query("insert into patient (name,  nationalid, birthdate, sex, address, phone, image) values ($1, $2, $3, $4, $5, $6, $7)",[name, ID, birthdate, sex, address, phone, image], async (err, res) => {
                if(err)
                    console.log(err)
                else {
                    let dataNumbers = await getNumbers()
                    respond.render("./homePage.ejs",
                        {
                            name: req.session.user["username"],
                            image: req.session.user["image"],
                            dataNumbers: dataNumbers,
                            show:  null, error: "",
                            show1:  null, addSurgeonError: "",
                            show2:  null, addPatientError: "",
                            show3:  null, addAdminError: "",
                            show4:  null, addOperationError: "",
                            show5:  null, addDeviceError: "",
                            show6:  null, addAppointmentError: ""
                        })
                }
            })
        }
    } )
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

    await pool.query(`select * from surgeon where nationalid = '${ID}' OR email = '${email}'`,async (err, res) => {
        if(res.rows.length == 0)
            {
                pool.query("insert into surgeon (name, nationalid, birthdate, sex, address, phone, email, speciality, image) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    [name, ID, birthdate, sex, address, phone, email, speciality, image], (err, res) => {
                        if(err)
                        console.log(err)
                    })
                    let dataNumbers = await getNumbers()
                    respond.render("./homePage.ejs", {
                        name: req.session.user["username"],
                        image: req.session.user["image"],
                        dataNumbers: dataNumbers,
                        show:  null, error: "",
                        show1:  null, addSurgeonError: "",
                        show2:  null, addPatientError: "",
                        show3:  null, addAdminError: "",
                        show4:  null, addOperationError: "",
                        show5:  null, addDeviceError: "",
                        show6:  null, addAppointmentError: ""
                    })
            }
        else{
            //the surgeon already exixts 
            let dataNumbers = await getNumbers()
            respond.render("./homePage.ejs", {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                show1:  "show", addSurgeonError: "هذا الطبيب مسجل بالفعل",
                show2:  null, addPatientError: "",
                show3:  null, addAdminError: "",
                show4:  null, addOperationError: "",
                show5:  null, addDeviceError: "",
                show6:  null, addAppointmentError: ""
            })
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

    await pool.query(`select * from device where serialnumber = '${serial}'`, async (err, res) => {
        if(res.rows.length == 0)
            {    
            await pool.query("insert into device (name, serialnumber, price, warranty, status, company, date) values ($1, $2, $3, $4, $5, $6, $7)",
                [name, serial, price, warranty, status, company, date], async (err, res) => {
                    if(err)
                        console.log(err)
                    }
                )
                let dataNumbers = await getNumbers()
                    respond.render("./homePage.ejs", {
                        name: req.session.user["username"],
                        image: req.session.user["image"],
                        dataNumbers: dataNumbers,
                        show:  null, error: "",
                        show1:  null, addSurgeonError: "",
                        show2:  null, addPatientError: "",
                        show3:  null, addAdminError: "",
                        show4:  null, addOperationError: "",
                        show5:  null, addDeviceError: "",
                        show6:  null, addAppointmentError: ""
                    })
            }
        else{
            //the device already exists
            let dataNumbers = await getNumbers()
            respond.render("./homePage.ejs", {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                show1:  null, addSurgeonError: "",
                show2:  null, addPatientError: "",
                show3:  null, addAdminError: "",
                show4:  null, addOperationError: "",
                show5:  "show", addDeviceError: "هذا الجهاز مسجل بالفعل",
                show6:  null, addAppointmentError: ""
            })
        }
    })
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
            res.render("./admins.ejs", {allAdmins: respond.rows,show: null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    })
})

app.post("/doctorsPageDelete",async(req,res)=>{
    let id = req.body.deletetionID
    await pool.query("delete from surgeon where nationalid = $1",[id], async(err, rp) => {
        await pool.query("select * from surgeon", (err, respond) => {
            res.render("./doctors.ejs", {allDoctors: respond.rows, show: null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    })
})

app.post("/patientsPageDelete",async(req,res)=>{
    let id = req.body.deletetionID
    await pool.query("delete from patient where nationalid = $1",[id], async(err, rp) => {
        await pool.query("select * from patient", (err, respond) => {
            res.render("./patients.ejs", {allPatients: respond.rows,show: null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    })
})

app.post("/operationsPageDelete",async(req,res)=>{
    let code = req.body.deletetionCode
    await pool.query("delete from operation where code = $1",[code], async(err, rp) => {
        await pool.query("select * from operation", (err, respond) => {
            res.render("./operations.ejs", {allOperations: respond.rows,show:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    })
})

app.post("/devicesPageDelete",async(req,res)=>{
    let Serial = req.body.deletetionSerial
    await pool.query("delete from device where serialnumber = $1",[Serial], async(err, rp) => {
        await pool.query("select * from device", (err, respond) => {
            res.render("./devices.ejs", {allDevices: respond.rows, show: null, errorMessage : null, name:req.session.user["username"], name: req.session.user["username"], image: req.session.user["image"]});
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
                res.render("./appointments.ejs",{allAppointments: appointments.rows,show:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
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
            res.render("./admins.ejs", {allAdmins: data.rows, show: "show", errorMessage : "كلمات المرور غير متطابقة",editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    }
    else{
        await pool.query("select * from admin where nationalid = $1",[nationalID], async(err, data) => {
            if(data.rows.length != 0){
                await pool.query("select * from admin", async(err, newdata) => {
                    res.render("./admins.ejs", {allAdmins: newdata.rows, show: "show", errorMessage : "الرقم القومي مستخدم",editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
                })
                }
            else{
                await pool.query("select * from admin where email = $1",[email], async(err, emaildata) => {
                    if(emaildata.rows.length != 0){
                        await pool.query("select * from admin", async(err, newdata) => {
                            res.render("./admins.ejs", {allAdmins: newdata.rows, show: "show", errorMessage : "البريد الإلكتروني مستخدم",editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
                        })
                    }
                    else
                    await pool.query("insert into admin (name, email, nationalid, phone, address, password, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    [name, email, nationalID, phone, address, password, sex, image, bdate], async(err, respond) => {
                        await pool.query("select * from admin", async(err, newdata) => {
                        res.render("./admins.ejs", {allAdmins: newdata.rows, show: null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
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
                res.render("./patients.ejs", {allPatients: newdata.rows, show: "show", errorMessage : "الرقم القومي مستخدم", name: req.session.user["username"], image: req.session.user["image"]});
            })
            }
        else{
            await pool.query("insert into patient (name, nationalid, phone, address, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7)",
                [name, nationalID, phone, address, sex, image, bdate], async(err, respond) => {
                    if(err)
                        console.log(err)
                    await pool.query("select * from patient", async(err, newdata) => {
                    res.render("./patients.ejs", {allPatients: newdata.rows, show: null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
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
                    res.render("./doctors.ejs", {allDoctors: newdata.rows, show: "show", errorMessage : "الرقم القومي مستخدم", name: req.session.user["username"], image: req.session.user["image"]});
                })
                }
            else{
                await pool.query("select * from surgeon where email = $1",[email], async(err, emaildata) => {
                    if(emaildata.rows.length != 0){
                        await pool.query("select * from surgeon", async(err, newdata) => {
                            res.render("./doctors.ejs", {allDoctors: newdata.rows, show: "show", errorMessage : "البريد الإلكتروني مستخدم", name: req.session.user["username"], image: req.session.user["image"]});
                        })
                    }
                    else
                    await pool.query("insert into surgeon (name, email, nationalid, phone, address, sex, image, birthdate, speciality) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    [name, email, nationalID, phone, address, sex, image, bdate,speciality], async(err, respond) => {
                        await pool.query("select * from surgeon", async(err, newdata) => {
                        res.render("./doctors.ejs", {allDoctors: newdata.rows, show: null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
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
                res.render("./devices.ejs",{allDevices: newdata.rows,show: "show", errorMessage : "الرقم التسلسلي مستخدم", name: req.session.user["username"], image: req.session.user["image"]})
            })
        }
        else{
            await pool.query("insert into device (name, serialnumber, company, status, warranty, price, date) values ($1, $2, $3, $4, $5, $6, $7)",
                [name,serial,company,stat,warranty,price,date],async(err,respond)=>{
                    await pool.query("select * from device",(err,newdata)=>{
                        res.render("devices.ejs",{allDevices:newdata.rows,show:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]})
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
                res.render("./operations.ejs",{allOperations: newdata.rows,show: "show", errorMessage : "كود العملية مستخدم", name: req.session.user["username"], image: req.session.user["image"]})
            })}
        else{ 
            usedDevices.forEach(async (deviceSerialNumber)=>{
                await pool.query("insert into useddevice (deviceserial, operationcode) values ($1, $2)",[deviceSerialNumber, code],async(err,devicesData)=>{
                })
            })

            await pool.query("insert into operation (name, code, duration, price, roomnumber, description) values ($1, $2, $3, $4, $5, $6)",
                [name,code,duration,price,roomnumber,description], async(err, respond) => {
                    await pool.query("select * from operation",async (err, newdata) => {
                        res.render("./operations.ejs", {allOperations: newdata.rows,show:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
                    })   
            })      
            }
    })
})

app.post("/editAdmin", async (req, res) => {
    let name = req.body["name"],
        id = req.body["id"],
        sex = req.body["sex"],
        email = req.body["email"],
        birthDate = req.body["birthDate"],
        mobile = req.body["mobile"],
        address = req.body["address"],
        password = req.body["password"],
        age = calculateAge(birthDate),
        confirmPassword = req.body["confirmPassword"],
        image = "123",
        oldid = req.body["oldid"];
    await pool.query(
        `select * from admin where nationalid='${req.body["id"]}'`,
        async (err, respond) => {
            if (!err) {
                if (respond.rows.length === 1 && id != oldid) {
                    await pool.query(
                        `select * from admin where nationalid ='${oldid}'`,
                        (err2, respond2) => {
                            res.render("adminProfile.ejs", {
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                errormessageadmin: "this id has already been registered",
                                name: respond2.rows[0].name,
                                email: respond2.rows[0].email,
                                id: respond2.rows[0].nationalid,
                                mobile: respond2.rows[0].phone,
                                sex: respond2.rows[0].sex,
                                birthDate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB'))
                            });
                        }
                    );
                } else if (req.body["password"] != req.body["confirmPassword"]) {
                    await pool.query(
                        `select * from admin where nationalid ='${oldid}'`,
                        (err2, respond2) => {
                            res.render("adminProfile.ejs", {
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                errormessageadmin: "the passwords do not match",
                                name: respond2.rows[0].name,
                                email: respond2.rows[0].email,
                                id: respond2.rows[0].nationalid,
                                mobile: respond2.rows[0].phone,
                                sex: respond2.rows[0].sex,
                                birthDate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB'))

                            });
                        }
                    );
                }
                else {
                    await pool.query(
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
        birthdate = req.body["birthDate"],
        sex = req.body["sex"],
        image = "123",
        phone = req.body["mobile"],
        address = req.body["address"],
        age = calculateAge(birthdate),
        oldid = req.body["oldid"];
    await pool.query(
        `SELECT * from patient WHERE nationalid = '${id}'`,
        async (err, respond) => {
            if (!err) {
                if (respond.rows.length === 1 && id != oldid) {
                    await pool.query(
                        `SELECT * FROM patient WHERE nationalid = '${oldid}'`,
                        (err2, respond2) => {
                            res.render("patientProfile.ejs", {
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                errormessagepatient: "this id has already been registered",
                                name: respond2.rows[0].name,
                                id: respond2.rows[0].nationalid,
                                birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                sex: respond2.rows[0].sex,
                                phone: respond2.rows[0].phone,
                                age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                            });
                        }
                    );
                } else {
                    await pool.query(
                        "update patient SET name = $1, nationalid = $2, address = $3, phone = $4, sex = $5, image = $6, birthdate = $7 where nationalid = $8",

                        [name, id, address, phone, sex, image, birthdate, oldid],
                        (err2, respond2) => {
                            res.render("patientProfile.ejs", {
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                errormessagepatient: null,
                                name: name,
                                id: id,
                                phone: phone,
                                birthdate: birthdate,
                                sex: sex,
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
        birthdate = req.body["birthDate"],
        oldid = req.body["oldid"],
        sex = req.body["sex"],
        id = req.body["id"],
        image = "123",
        address = req.body["address"],
        specialization = req.body["special"];

    await pool.query(
        `select * from surgeon where nationalid = '${id}'`,
        async (err, respond) => {
            if (!err) {
                if (respond.rows.length === 1 && id != oldid) {
                    await pool.query(
                        `select * from surgeon where nationalid ='${oldid}'`,
                        (err2, respond2) => {
                            res.render("doctorProfile.ejs", {
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                errormessagedoctor: "this id has already been registered",
                                name: respond2.rows[0].name,
                                email: respond2.rows[0].email,
                                id: respond2.rows[0].nationalid,
                                phone: respond2.rows[0].phone,
                                sex: respond2.rows[0].sex,
                                birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                specialization: respond2.rows[0].speciality,
                                age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                            });
                        }
                    );
                } else {
                    await pool.query(
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
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                errormessagedoctor: null,
                                name: name,
                                id: id,
                                email: email,
                                phone: phone,
                                birthdate: birthdate,
                                sex: sex,
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

app.post("/previewAdminProfile",async(req,res)=>{
    let id = req.body.hiddenPreviewID
    await pool.query("select * from admin where nationalid = $1",[id],(err,respond2)=>{
        res.render("adminProfile.ejs", {
                adminName: req.session.user["username"],
                image: req.session.user["image"],
                errormessageadmin: "this id has already been registered",
                name: respond2.rows[0].name,
                email: respond2.rows[0].email,
                id: respond2.rows[0].nationalid,
                mobile: respond2.rows[0].phone,
                sex: respond2.rows[0].sex,
                birthDate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                address : respond2.rows[0].address
            }); 
    })
})

app.post("/previewDoctorProfile",async(req,res)=>{
    let id = req.body.hiddenPreviewID
    await pool.query(
        `select * from surgeon where nationalid ='${id}'`,
        (err2, respond2) => {
            res.render("doctorProfile.ejs", {
                name: req.session.user["username"],
                image: req.session.user["image"],
                errormessagedoctor: "this id has already been registered",
                name: respond2.rows[0].name,
                email: respond2.rows[0].email,
                id: respond2.rows[0].nationalid,
                phone: respond2.rows[0].phone,
                sex: respond2.rows[0].sex,
                birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                specialization: respond2.rows[0].speciality,
                age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                address:respond2.rows[0].address
            });
        }
    );
})



app.listen(port, (req, res) => {
  console.log(`server is running on port number ${port}`);
});
