import express from "express";
import path from "path";
import multer from "multer";
import { dirname } from "path";
import { fileURLToPath } from "url";
import  pool  from "./database.js"
import session from 'express-session';
import { type } from "os";
import { promisify } from 'util';

const query = promisify(pool.query).bind(pool);



const port = 3000;

const extensions = ['.jpeg','.png','.jpg']

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
    destination:function(req,file,cd){
        cd(null,path.join(__dirname,"public/images"));
    },
    filename: function(req,file,cd){
        cd(null,file.originalname);
    }
})


const upload = multer({storage})


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
      maxAge: 60 * 60 * 1000, // Session duration (in milliseconds)
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
                    image = res.rows[0]["image"]
    
                    req.session.user = {
                        userId, username, image
                    }

                    login.render("./homePage.ejs",
                        {
                            name: req.session.user["username"],
                            image: req.session.user["image"],
                            dataNumbers: dataNumbers,
                            show:  null, error: "",
                            errorMessage: "",
                            show1:  null,
                            show2:  null,
                            show3:  null,
                            show4:  null,
                            show5:  null,
                            show6:  null
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
            errorMessage: "",
            show1:  null,
            show2:  null,
            show3:  null,
            show4:  null,
            show5:  null,
            show6:  null
        })
})

app.get("/devices", async (req, data) => {

    await pool.query("select * from device", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devices",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/admins", async (req, data) => {

    await pool.query("select * from admin", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/appointments", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
        }
    })
})

app.get("/doctors", async (req, data) => {

    await pool.query("select * from surgeon", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctors",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/operations", async (req, data) => {

    await pool.query("select * from operation", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./operations.ejs", {selectElementValue:"/operations",allOperations: res.rows,show:null, editShow:null,editErrorMessage:null,savedCode:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/patients", async (req, data) => {

    await pool.query("select * from patient", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patients",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/currentAdminProfile", async (req, res) => {
    await pool.query(`select * from admin where nationalid = '${req.session.user["userId"]}'`, (err, adminUser) => {
        if(err)
            console.log(err)
        else {
            let name = adminUser.rows[0]["name"],
            id = req.session.user["userId"],
            email = adminUser.rows[0]["email"],
            mobile = adminUser.rows[0]["phone"],
            birthdate = adminUser.rows[0]["birthdate"].toLocaleDateString('en-GB'),
            sex = adminUser.rows[0]["sex"],
            address = adminUser.rows[0]["address"],
            image = adminUser.rows[0]["image"],
            age = calculateAge(formatDate(adminUser.rows[0]["birthdate"]
            ))

            res.render("./adminProfile.ejs", {name: name, adminName: name, id: id, email: email, address: address, mobile: mobile, birthDate: birthdate, sex: sex, address: address, age: age, image: image, adminImage: image,errormessageadmin: null,editShow: null})
        }
    })
})

app.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if(err)
            console.log(err)
        res.render("./loginPage.ejs",{loginError: ""});
    })
})





app.post("/addAdmin", upload.single("image"), async (req, respond) => {
    let name = req.body["name"],
    sex = req.body["sex"], 
    bdate = req.body["birthDate"], 
    email = req.body["email"], 
    password = req.body["password"],
    repassword = req.body["repassword"],
    phone = req.body["phone"],
    address = req.body["address"],
    nationalID = req.body["nationalID"]

    let image = "../images/" + req.file.originalname
    const fileExtension = path.extname(req.file.originalname);

    if(!extensions.includes(fileExtension)){
        let dataNumbers = await getNumbers()
        respond.render("./homePage.ejs",
            {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                errorMessage: "  png, jpeg الصورة غير صالحة ادخل ",
                show1:  null,
                show2:  null,
                show3:  "show",
                show4:  null,
                show5:  null,
                show6:  null
            })
    }

    else if(repassword == password)
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
                                errorMessage: "هذا الرقم القومي موجود بالفعل",
                                show1:  null,
                                show2:  null,
                                show3:  "show",
                                show4:  null,
                                show5:  null,
                                show6:  null
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
                                                errorMessage: "هذا البريد الالكتروني موجود بالفعل",
                                                show1:  null,
                                                show2:  null,
                                                show3:  "show",
                                                show4:  null,
                                                show5:  null,
                                                show6:  null
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
                                                            errorMessage: "",
                                                            show1:  null,
                                                            show2:  null,
                                                            show3:  null,
                                                            show4:  null,
                                                            show5:  null,
                                                            show6:  null
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
                errorMessage: "كلمات المرور غير متطابقة",
                show1:  null,
                show2:  null,
                show3:  "show",
                show4:  null,
                show5:  null,
                show6:  null
            })
    }
})

app.post("/addPatient", upload.single("image"), async(req,respond) => {
    let name = req.body["name"], 
    ID = req.body["ID"], 
    birthdate = req.body["birthDate"], 
    sex = req.body["sex"], 
    address = req.body["address"], 
    phone = req.body["phone"], 
    image = "../images/" + req.file.originalname
    const fileExtension = path.extname(req.file.originalname);

    if(!extensions.includes(fileExtension)){
            let dataNumbers = await getNumbers()
                respond.render("./homePage.ejs",
                    {
                        name: req.session.user["username"],
                        image: req.session.user["image"],
                        dataNumbers: dataNumbers,
                        show:  null, error: "",
                        errorMessage: "  png, jpeg الصورة غير صالحة ادخل ",
                        show1:  null,
                        show2:  "show",
                        show3:  null,
                        show4:  null,
                        show5:  null,
                        show6:  null
                    })
    }

    else await pool.query(`select * from patient where nationalid = '${ID}'`, async (err, res) => {
        if(res.rowCount != 0)
            {
                let dataNumbers = await getNumbers()
                respond.render("./homePage.ejs",
                    {
                        name: req.session.user["username"],
                        image: req.session.user["image"],
                        dataNumbers: dataNumbers,
                        show:  null, error: "",
                        errorMessage: "هذا الرقم القومي موجود بالفعل",
                        show1:  null,
                        show2:  "show",
                        show3:  null,
                        show4:  null,
                        show5:  null,
                        show6:  null
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
                            errorMessage: "",
                            show1:  null,
                            show2:  null,
                            show3:  null,
                            show4:  null,
                            show5:  null,
                            show6:  null
                        })
                }
            })
        }
    } )
})

app.post("/addSurgeon", upload.single("image"), async(req,respond) => {
    let name = req.body["name"], 
    ID = req.body["ID"], 
    birthdate = req.body["birthdate"], 
    sex = req.body["sex"], 
    address = req.body["address"], 
    phone = req.body["phone"], 
    email = req.body["email"],
    speciality = req.body["speciality"],
    image = "../images/" + req.file.originalname

    const fileExtension = path.extname(req.file.originalname);

    if(!extensions.includes(fileExtension)){
        let dataNumbers = await getNumbers()
        respond.render("./homePage.ejs",
            {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                errorMessage: "  png, jpeg الصورة غير صالحة ادخل ",
                show1:  null,
                show2:  null,
                show3:  "show",
                show4:  null,
                show5:  null,
                show6:  null
            })
    }

    else await pool.query(`select * from surgeon where nationalid = '${ID}' OR email = '${email}'`,async (err, res) => {
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
                        errorMessage: "",
                        show1:  null,
                        show2:  null,
                        show3:  null,
                        show4:  null,
                        show5:  null,
                        show6:  null
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
                errorMessage: "هذا الطبيب مسجل بالفعل",
                show1:  "show",
                show2:  null,
                show3:  null,
                show4:  null,
                show5:  null,
                show6:  null
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
    date = req.body["date"],
    productCode = req.body["productCode"]

    await pool.query(`select * from device where serialnumber = '${serial}'`, async (err, res) => {
        if(res.rows.length == 0)
            {    
            await pool.query("insert into device (name, serialnumber, price, warranty, status, company, date, productcode) values ($1, $2, $3, $4, $5, $6, $7, $8)",
                [name, serial, price, warranty, status, company, date, productCode], async (err, res) => {
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
                        errorMessage: "",
                        show1:  null,
                        show2:  null,
                        show3:  null,
                        show4:  null,
                        show5:  null,
                        show6:  null
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
                errorMessage: "هذا الجهاز مسجل بالفعل",
                show1:  null,
                show2:  null,
                show3:  null,
                show4:  null,
                show5:  "show",
                show6:  null
            })
        }
    })
})

app.post("/addOperation",async(req,res)=>{
    let name = req.body.name,
    price = req.body.price,
    duration = req.body.duration,
    roomnumber = req.body.roomnumber,
    usedDevices = req.body["multiValueField"],
    description = req.body.description;

    
    // if user entered one device typeof used devices will be string and the following algorithm use it as object so there must be a type casting
    if(typeof usedDevices == "string")
        usedDevices = [usedDevices];

    await pool.query("insert into operation (name, duration, price, roomnumber, description) values ($1, $2, $3, $4, $5) returning code",
        [name,duration,price,roomnumber,description], async(err, respond) => {
            let code = respond.rows[0]["code"]
            if(usedDevices != undefined){
            usedDevices.forEach(async (deviceproductcode)=>{
                            await pool.query("insert into useddevice (deviceproductcode, operationcode) values ($1, $2)",[deviceproductcode, code],async(err,devicesData)=>{
                            })
                        })}
            let dataNumbers = await getNumbers()
            res.render("./homePage.ejs", {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                errorMessage: "",
                show1:  null,
                show2:  null,
                show3:  null,
                show4:  null,
                show5:  null,
                show6:  null
            })
    })      
})

app.post("/addAppointment", async (req, respond) => {
    let patientID = req.body["patientID"],
    surgeonID = req.body["surgeonID"], 
    operationID = req.body["operationID"], 
    roomNumber = req.body["roomNumber"], 
    date = req.body["date"],
    time = req.body["time"]
    date = new Date(`${date}T${time}Z`)
    
    let startdate = new Date(date.getTime() - 60 * 60 * 1000)


    await pool.query(`select * from patient where nationalid = '${patientID}'`, async (err, resPatient) =>{
        if(resPatient.rows.length != 0){
            await pool.query(`select * from surgeon where nationalid = '${surgeonID}'`, async (err, resSurgeon) =>{
                if(resSurgeon.rows.length != 0){
                    await pool.query(`select roomnumber, duration from operation where code = '${operationID}'`, async (err, resOperation) =>{
                        if(resOperation.rows.length != 0){
                            let operationRoom = resOperation.rows[0]["roomnumber"]
                            let operationDuration = req.body["duration"]

                            let enddate = new Date(startdate.getTime() + (2 + Number(operationDuration)) * 60 * 60 * 1000)
                            if(roomNumber == operationRoom)
                                {
                                    await pool.query(`SELECT * FROM appointment WHERE roomnumber = $1 AND ((enddate > $2 AND enddate < $3) OR (startdate > $2 AND startdate < $3) OR (startdate < $2 AND enddate > $3));`, [operationRoom, startdate, enddate], async (err, timeRespond) => {
                                        if(timeRespond.rowCount > 0)
                                            {
                                                let dataNumbers = await getNumbers()
                                                respond.render("./homePage.ejs", {
                                                name: req.session.user["username"],
                                                image: req.session.user["image"],
                                                dataNumbers: dataNumbers,
                                                show:  null, error: "",
                                                errorMessage: "هذه الغرفة غير متاحة في هذا التوقيت",
                                                show1:  null,
                                                show2:  null,
                                                show3:  null,
                                                show4:  null,
                                                show5:  null,
                                                show6:  "show"
                                                })
                                            }else {
                                                await pool.query(`SELECT * FROM appointment WHERE surgeonid = $1 AND ((enddate > $2 AND enddate < $3) OR (startdate > $2 AND startdate < $3) OR (startdate < $2 AND enddate > $3));`, [surgeonID, startdate, enddate], async (err, surgeonTimeRespond) =>{
                                                    if (surgeonTimeRespond.rowCount > 0){
                                                        let dataNumbers = await getNumbers()
                                                            respond.render("./homePage.ejs", {
                                                            name: req.session.user["username"],
                                                            image: req.session.user["image"],
                                                            dataNumbers: dataNumbers,
                                                            show:  null, error: "",
                                                            errorMessage: "هذا الجراح لديه عملية في هذا التوقيت",
                                                            show1:  null,
                                                            show2:  null,
                                                            show3:  null,
                                                            show4:  null,
                                                            show5:  null,
                                                            show6:  "show"
                                                        })
                                                    }else {
                                                        await pool.query(`SELECT * FROM appointment WHERE patientid = $1 AND ((enddate > $2 AND enddate < $3) OR (startdate > $2 AND startdate < $3) OR (startdate < $2 AND enddate > $3));`, [patientID, startdate, enddate], async (err, patientTimeRespond) =>{
                                                            if(patientTimeRespond.rowCount > 0){
                                                                let dataNumbers = await getNumbers()
                                                                respond.render("./homePage.ejs", {
                                                                    name: req.session.user["username"],
                                                                    image: req.session.user["image"],
                                                                    dataNumbers: dataNumbers,
                                                                    show:  null, error: "",
                                                                    errorMessage: "هذا المريض لديه عملية في هذا التوقيت",
                                                                    show1:  null,
                                                                    show2:  null,
                                                                    show3:  null,
                                                                    show4:  null,
                                                                    show5:  null,
                                                                    show6:  "show"
                                                                })
                                                            }else {
                                                                await pool.query("select * from useddevice where operationcode = $1 and deviceproductcode not in (select DISTINCT deviceproductcode from device where status = $2)", [operationID, "نشط"], async (err, devicesAvailable) => {
                                                                    if(devicesAvailable.rowCount > 0){
                                                                        let dataNumbers = await getNumbers()
                                                                        respond.render("./homePage.ejs", {
                                                                            name: req.session.user["username"],
                                                                            image: req.session.user["image"],
                                                                            dataNumbers: dataNumbers,
                                                                            show:  null, error: "",
                                                                            errorMessage: "هذه العملية تتطلب جهازا غير متاح حاليا",
                                                                            show1:  null,
                                                                            show2:  null,
                                                                            show3:  null,
                                                                            show4:  null,
                                                                            show5:  null,
                                                                            show6:  "show"
                                                                        })
                                                                    }else {
                                                                        await pool.query("insert into appointment (patientid, surgeonid, operationid, roomnumber, date, time, startdate, enddate, duration) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                                                                            [patientID, surgeonID, operationID, roomNumber, date, time, startdate, enddate, operationDuration], async (err, res) =>{
                                                                                if(err)
                                                                                    console.log(err)
                                                                                else {
                                                                                    let dataNumbers = await getNumbers()
                                                                                    respond.render("./homePage.ejs", {
                                                                                        name: req.session.user["username"],
                                                                                        image: req.session.user["image"],
                                                                                        dataNumbers: dataNumbers,
                                                                                        show:  null, error: "",
                                                                                        errorMessage: "",
                                                                                        show1:  null,
                                                                                        show2:  null,
                                                                                        show3:  null,
                                                                                        show4:  null,
                                                                                        show5:  null,
                                                                                        show6:  null
                                                                                    })
                                                                                }
                                                                            })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                    })
                                }else{
                                    let dataNumbers = await getNumbers()
                                    respond.render("./homePage.ejs", {
                                        name: req.session.user["username"],
                                        image: req.session.user["image"],
                                        dataNumbers: dataNumbers,
                                        show:  null, error: "",
                                        errorMessage: "هذه العملية لا تتم في هذه الغرفة",
                                        show1:  null,
                                        show2:  null,
                                        show3:  null,
                                        show4:  null,
                                        show5:  null,
                                        show6:  "show"
                                    })
                                }
                        }else {
                            let dataNumbers = await getNumbers()
                            respond.render("./homePage.ejs", {
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                dataNumbers: dataNumbers,
                                show:  null, error: "",
                                errorMessage: "لا توجد عملية بهذا الكود",
                                show1:  null,
                                show2:  null,
                                show3:  null,
                                show4:  null,
                                show5:  null,
                                show6:  "show"
                            })
                        }
                    })
                }else {
                    let dataNumbers = await getNumbers()
                    respond.render("./homePage.ejs", {
                        name: req.session.user["username"],
                        image: req.session.user["image"],
                        dataNumbers: dataNumbers,
                        show:  null, error: "",
                        show1:  null, addSurgeonError: "",
                        errorMessage: "لا يوجد جراح بهذا الرقم القومي",
                        show1:  null,
                        show2:  null,
                        show3:  null,
                        show4:  null,
                        show5:  null,
                        show6:  "show"
                    })
                }
            })
        }else {
            let dataNumbers = await getNumbers()
            respond.render("./homePage.ejs", {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                errorMessage: "لا يوجد مريض بهذا الرقم القومي",
                show1:  null,
                show2:  null,
                show3:  null,
                show4:  null,
                show5:  null,
                show6:  "show"
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
        if(req.session.user["userId"] == id){
            req.session.destroy((err) => {
                if(err)
                    console.log(err)
                res.render("./loginPage.ejs",{loginError: ""});
            })
        }
        else{
        await pool.query("select * from admin", (err, respond) => {
            res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                allAdmins: respond.rows,show: null,savedID:null,savedEmail:null,showEdit:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    }
    })
})

app.post("/doctorsPageDelete",async(req,res)=>{
    let id = req.body.deletetionID
    await pool.query("delete from surgeon where nationalid = $1",[id], async(err, rp) => {
        await pool.query("select * from surgeon", (err, respond) => {
            res.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctors",
                allDoctors: respond.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    })
})

app.post("/patientsPageDelete",async(req,res)=>{
    let id = req.body.deletetionID
    await pool.query("delete from patient where nationalid = $1",[id], async(err, rp) => {
        await pool.query("select * from patient", (err, respond) => {
            res.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patients",allPatients: respond.rows,show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    })
})

app.post("/operationsPageDelete",async(req,res)=>{
    let code = req.body.deletetionCode
    await pool.query("delete from useddevice where operationcode = $1",[code],(err,respond)=>{
    })
    await pool.query("delete from operation where code = $1",[code], async(err, rp) => {
        await pool.query("select * from operation", (err, respond) => {
            res.render("./operations.ejs", {selectElementValue:"/operations",allOperations: respond.rows,show:null,editShow:null,editErrorMessage:null,savedCode:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    })
})

app.post("/devicesPageDelete",async(req,res)=>{
    let Serial = req.body.deletetionSerial
    await pool.query("delete from device where serialnumber = $1",[Serial], async(err, rp) => {
        await pool.query("select * from device", (err, respond) => {
            res.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devices",
                allDevices: respond.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], name: req.session.user["username"], image: req.session.user["image"]});
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
                res.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows,show:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  null, errorMessage: "", savedID: null});
            }
        })
    })
})

app.post("/adminsPageAdd", upload.single("image"), async(req,res)=>{
    let name = req.body["name"],
    sex = req.body["sex"], 
    bdate = req.body["birthDate"], 
    email = req.body["email"], 
    password = req.body["password"],
    repassword = req.body["repassword"],
    phone = req.body["phone"],
    address = req.body["address"],
    nationalID = req.body["nationalID"],
    image = "../images/" + req.file.originalname
    const fileExtension = path.extname(req.file.originalname);

if(!extensions.includes(fileExtension)){
    await pool.query("select * from admin", (err, data) => {
        res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
            allAdmins: data.rows, show: "show",savedID:null,savedEmail:null, showEdit:null, errorMessage :"  png, jpeg الصورة غير صالحة ادخل ",editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
    })
}

    else if(repassword != password){
        await pool.query("select * from admin", (err, data) => {
            res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                allAdmins: data.rows, show: "show",savedID:null,savedEmail:null, showEdit:null, errorMessage : "كلمات المرور غير متطابقة",editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    }
    else{
        await pool.query("select * from admin where nationalid = $1",[nationalID], async(err, data) => {
            if(data.rows.length != 0){
                await pool.query("select * from admin", async(err, newdata) => {
                    res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                        allAdmins: newdata.rows, show: "show", showEdit:null,savedID:null,savedEmail:null, errorMessage : "الرقم القومي مستخدم",editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
                })
                }
            else{
                await pool.query("select * from admin where email = $1",[email], async(err, emaildata) => {
                    if(emaildata.rows.length != 0){
                        await pool.query("select * from admin", async(err, newdata) => {
                            res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                                allAdmins: newdata.rows, show: "show",savedID:null,savedEmail:null, showEdit:null, errorMessage : "البريد الإلكتروني مستخدم",editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
                        })
                    }
                    else{
                    await pool.query("insert into admin (name, email, nationalid, phone, address, password, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    [name, email, nationalID, phone, address, password, sex, image, bdate], async(err, respond) => {
                        await pool.query("select * from admin", async(err, newdata) => {
                        res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                            allAdmins: newdata.rows, show:null,savedID:null,savedEmail:null, showEdit: null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
                    })
                    })}
                })
            }
        })
    }
})

app.post("/patientsPageAdd", upload.single("image"), async(req,res)=>{
    let name = req.body["name"],
    sex = req.body["sex"], 
    bdate = req.body["birthDate"], 
    phone = req.body["phone"],
    address = req.body["address"],
    nationalID = req.body["nationalID"],
    image = "../images/" + req.file.originalname
    const fileExtension = path.extname(req.file.originalname);

if(!extensions.includes(fileExtension)){
    await pool.query("select * from patient", async(err, newdata) => {
        res.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patients",selectElementValue:"/patients",allPatients: newdata.rows, show: "show", editShow:null,editErrorMessage:null,savedID : null,errorMessage : "  png, jpeg الصورة غير صالحة ادخل ", name: req.session.user["username"], image: req.session.user["image"]});
    })
}

    else await pool.query("select * from patient where nationalid = $1",[nationalID], async(err, data) => {
        if(data.rows.length != 0){
            await pool.query("select * from patient", async(err, newdata) => {
                res.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patients",selectElementValue:"/patients",allPatients: newdata.rows, show: "show", editShow:null,editErrorMessage:null,savedID : null,errorMessage : "الرقم القومي مستخدم", name: req.session.user["username"], image: req.session.user["image"]});
            })
            }
        else{
            await pool.query("insert into patient (name, nationalid, phone, address, sex, image, birthdate) values ($1, $2, $3, $4, $5, $6, $7)",
                [name, nationalID, phone, address, sex, image, bdate], async(err, respond) => {
                    if(err)
                        console.log(err)
                    await pool.query("select * from patient", async(err, newdata) => {
                    res.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patients",allPatients: newdata.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
                })
                })
        }
    })
})

app.post("/doctorsPageAdd", upload.single("image"), async(req,res)=>{
    let name = req.body["name"],
    sex = req.body["sex"], 
    bdate = req.body["birthDate"], 
    email = req.body["email"], 
    speciality = req.body["speciality"],
    phone = req.body["phone"],
    address = req.body["address"],
    nationalID = req.body["nationalID"],
    image = "../images/" + req.file.originalname
    const fileExtension = path.extname(req.file.originalname);
    if(!extensions.includes(fileExtension)){
        await pool.query("select * from surgeon", async(err, newdata) => {
            res.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctors",
                allDoctors: newdata.rows, show: "show",editShow:null,savedID:null,editErrorMessage:null, errorMessage : "  png, jpeg الصورة غير صالحة ادخل ", name: req.session.user["username"], image: req.session.user["image"]});
        })
    }
    

        else await pool.query("select * from surgeon where nationalid = $1",[nationalID], async(err, data) => {
            if(data.rows.length != 0){
                await pool.query("select * from surgeon", async(err, newdata) => {
                    res.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctors",
                        allDoctors: newdata.rows, show: "show",editShow:null,savedID:null,editErrorMessage:null, errorMessage : "الرقم القومي مستخدم", name: req.session.user["username"], image: req.session.user["image"]});
                })
                }
            else{
                await pool.query("select * from surgeon where email = $1",[email], async(err, emaildata) => {
                    if(emaildata.rows.length != 0){
                        await pool.query("select * from surgeon", async(err, newdata) => {
                            res.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctors",
                                allDoctors: newdata.rows, show: "show",editShow:null,savedID:null,editErrorMessage:null, errorMessage : "البريد الإلكتروني مستخدم", name: req.session.user["username"], image: req.session.user["image"]});
                        })
                    }
                    else
                    await pool.query("insert into surgeon (name, email, nationalid, phone, address, sex, image, birthdate, speciality) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                    [name, email, nationalID, phone, address, sex, image, bdate,speciality], async(err, respond) => {
                        await pool.query("select * from surgeon", async(err, newdata) => {
                        res.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctors",
                            allDoctors: newdata.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
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
    date = req.body.date,
    productCode = req.body.productCode

    await pool.query("select * from device where serialnumber = $1",[serial],async(err,data)=>{
        if(data.rows.length != 0){
            await pool.query("select * from device",(err,newdata)=>{
                res.render("./devices.ejs",{highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devices",
                    allDevices: newdata.rows,show: "show",editShow:null,editErrorMessage:null,savedCode : null, errorMessage : "الرقم التسلسلي مستخدم", name: req.session.user["username"], image: req.session.user["image"]})
            })
        }
        else{
            await pool.query("insert into device (name, serialnumber, company, status, warranty, price, date, productcode) values ($1, $2, $3, $4, $5, $6, $7, $8)",
                [name,serial,company,stat,warranty,price,date, productCode],async(err,respond)=>{
                    await pool.query("select * from device",(err,newdata)=>{
                        res.render("./devices.ejs",{highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devices",
                            allDevices:newdata.rows,show:null,editShow:null,editErrorMessage:null,savedCode : null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]})
                    })
                })
        }
    })
})

app.post("/operationsPageAdd",async(req,res)=>{
    let name = req.body.name,
    price = req.body.price,
    duration = req.body.duration,
    roomnumber = req.body.roomnumber,
    usedDevices = req.body["multiValueField"],
    description = req.body.description;
    // if user entered one device typeof used devices will be string and the following algorithm use it as object so there must be a type casting
    if(typeof usedDevices == "string")
        usedDevices = [usedDevices];

    await pool.query("insert into operation (name, duration, price, roomnumber, description) values ($1, $2, $3, $4, $5) returning code",
        [name,duration,price,roomnumber,description], async(err, respond) => {
            let code = respond.rows[0]["code"]
            if(usedDevices != undefined){
            usedDevices.forEach(async (deviceproductcode)=>{
                            await pool.query("insert into useddevice (deviceproductcode, operationcode) values ($1, $2)",[deviceproductcode, code],async(err,devicesData)=>{
                            })
                        })}
                        await pool.query("select * from operation",async (err, newdata) => {
                            res.render("./operations.ejs", {selectElementValue:"/operations",allOperations: newdata.rows,show:null,editShow:null,editErrorMessage:null,savedCode:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
                        })   
    })     
})

app.post("/appointmentPageAdd", async (req, respond) => {
    let patientID = req.body["patientID"],
    surgeonID = req.body["surgeonID"], 
    operationID = req.body["operationID"], 
    roomNumber = req.body["roomNumber"], 
    date = req.body["date"],
    time = req.body["time"]
    date = new Date(`${date}T${time}Z`)
    
    let startdate = new Date(date.getTime() - 60 * 60 * 1000)


    await pool.query(`select * from patient where nationalid = '${patientID}'`, async (err, resPatient) =>{
        if(resPatient.rows.length != 0){
            await pool.query(`select * from surgeon where nationalid = '${surgeonID}'`, async (err, resSurgeon) =>{
                if(resSurgeon.rows.length != 0){
                    await pool.query(`select roomnumber, duration from operation where code = '${operationID}'`, async (err, resOperation) =>{
                        if(resOperation.rows.length != 0){
                            let operationRoom = resOperation.rows[0]["roomnumber"]
                            let operationDuration = req.body["duration"]

                            let enddate = new Date(startdate.getTime() + (2 + Number(operationDuration)) * 60 * 60 * 1000)
                            if(roomNumber == operationRoom)
                                {
                                    await pool.query(`SELECT * FROM appointment WHERE roomnumber = $1 AND ((enddate > $2 AND enddate < $3) OR (startdate > $2 AND startdate < $3) OR (startdate < $2 AND enddate > $3));`, [operationRoom, startdate, enddate], async (err, timeRespond) => {
                                        if(timeRespond.rowCount > 0)
                                            {
                                                await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                    if(err)
                                                        console.log(err);
                                                    else {
                                                        respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  "show", errorMessage: "هذه الغرفة غير متاحة في هذا التوقيت", savedID: null});
                                                    }
                                                })
                                            }else {
                                                await pool.query(`SELECT * FROM appointment WHERE surgeonid = $1 AND ((enddate > $2 AND enddate < $3) OR (startdate > $2 AND startdate < $3) OR (startdate < $2 AND enddate > $3));`, [surgeonID, startdate, enddate], async (err, surgeonTimeRespond) =>{
                                                    if (surgeonTimeRespond.rowCount > 0){
                                                        await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                            if(err)
                                                                console.log(err);
                                                            else {
                                                                respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  "show", errorMessage: "هذا الجراح لديه عملية في هذا التوقيت", savedID: null});
                                                            }
                                                        })
                                                    }else {
                                                        await pool.query(`SELECT * FROM appointment WHERE patientid = $1 AND ((enddate > $2 AND enddate < $3) OR (startdate > $2 AND startdate < $3) OR (startdate < $2 AND enddate > $3));`, [patientID, startdate, enddate], async (err, patientTimeRespond) =>{
                                                            if(patientTimeRespond.rowCount > 0){
                                                                await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                                    if(err)
                                                                        console.log(err);
                                                                    else {
                                                                        respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  "show", errorMessage: "هذا المريض لديه عملية في هذا التوقيت", savedID: null});
                                                                    }
                                                                })
                                                            }else {
                                                                await pool.query("select * from useddevice where operationcode = $1 and deviceproductcode not in (select DISTINCT deviceproductcode from device where status = $2)", [operationID, "نشط"], async (err, devicesAvailable) => {
                                                                    if(devicesAvailable.rowCount > 0){
                                                                        await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                                            if(err)
                                                                                console.log(err);
                                                                            else {
                                                                                respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  "show", errorMessage: "هذه العملية تتطلب جهازا غير متاح حاليا", savedID: null});
                                                                            }
                                                                        })
                                                                    }else {
                                                                        await pool.query("insert into appointment (patientid, surgeonid, operationid, roomnumber, date, time, startdate, enddate, duration) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
                                                                            [patientID, surgeonID, operationID, roomNumber, date, time, startdate, enddate, operationDuration], async (err, res) =>{
                                                                                if(err)
                                                                                    console.log(err)
                                                                                else {
                                                                                    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                                                        if(err)
                                                                                            console.log(err);
                                                                                        else {
                                                                                            respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  null, errorMessage: "", savedID: null});
                                                                                        }
                                                                                    })
                                                                                }
                                                                            })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                    })
                                }else{
                                    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                        if(err)
                                            console.log(err);
                                        else {
                                            respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  "show", errorMessage: "هذه العملية لا تتم في هذه الغرفة", savedID: null});
                                        }
                                    })
                                }
                        }else {
                            await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                if(err)
                                    console.log(err);
                                else {
                                    respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  "show", errorMessage: "لا توجد عملية بهذا الكود", savedID: null});
                                }
                            })
                        }
                    })
                }else {
                    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                        if(err)
                            console.log(err);
                        else {
                            respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  "show", errorMessage: "لا يوجد جراح بهذا الرقم القومي", savedID: null});
                        }
                    })
                }
            })
        }else {
            await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                if(err)
                    console.log(err);
                else {
                    respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show:  "show", errorMessage: "لا يوجد مريض بهذا الرقم القومي", savedID: null});
                }
            })
        }
    })
    
})

app.post("/editAdmin", upload.single("image"), async (req, res) => {
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
        image = "../images/" + req.file.originalname,
        oldid = req.body["oldid"],
        oldEmail = req.body["oldEmail"];
        const fileExtension = path.extname(req.file.originalname);
    
    if(!extensions.includes(fileExtension)){
        await pool.query(
            `select * from admin where nationalid ='${oldid}'`,
            (err2, respond2) => {
                res.render("adminProfile.ejs", {
                    name: req.session.user["username"],
                    image: req.session.user["image"],
                    errormessageadmin: "  png, jpeg الصورة غير صالحة ادخل ",
                    adminName: respond2.rows[0].name,
                    email: respond2.rows[0].email,
                    id: respond2.rows[0].nationalid,
                    mobile: respond2.rows[0].phone,
                    sex: respond2.rows[0].sex,
                    birthDate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                    age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                    address:respond2.rows[0].address,
                    editShow: "show",
                    adminImage: respond2.rows[0].image
                });
            }
        );
    }
    else await pool.query(
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
                                errormessageadmin: "الرقم القومي مستخدم",
                                adminName: respond2.rows[0].name,
                                email: respond2.rows[0].email,
                                id: respond2.rows[0].nationalid,
                                mobile: respond2.rows[0].phone,
                                sex: respond2.rows[0].sex,
                                birthDate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                                address:respond2.rows[0].address,
                                editShow: "show",
                                adminImage: image
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
                                errormessageadmin: "كلمات المرور غير متطابقة",
                                adminName: respond2.rows[0].name,
                                email: respond2.rows[0].email,
                                id: respond2.rows[0].nationalid,
                                mobile: respond2.rows[0].phone,
                                sex: respond2.rows[0].sex,
                                birthDate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                                address:respond2.rows[0].address,
                                editShow: "show",
                                adminImage: image
                            });
                        }
                    );
                }
                else {
                    await pool.query("select * from admin where email = $1",[email], async(err,emailData)=>{
                        if(emailData.rows.length != 0 && email != oldEmail){
                            await pool.query(
                                `select * from admin where nationalid ='${oldid}'`,
                                (err2, respond2) => {
                                    res.render("adminProfile.ejs", {
                                        name: req.session.user["username"],
                                        image: req.session.user["image"],
                                        errormessageadmin: "البريد الإلكتروني مستخدم",
                                        adminName: respond2.rows[0].name,
                                        adminImage: respond2.rows[0].image,
                                        email: respond2.rows[0].email,
                                        id: respond2.rows[0].nationalid,
                                        mobile: respond2.rows[0].phone,
                                        sex: respond2.rows[0].sex,
                                        birthDate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                        age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                                        address:respond2.rows[0].address,
                                        editShow: "show",
                                        adminImage: image
                                    });
                                }
                            );
                        }
                        else{
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
                                async (err2, respond2) => {
                                    if(req.session.user["userId"] == oldid){
                                        req.session.destroy((err) => {
                                            if(err)
                                                console.log(err)
                                            res.render("./loginPage.ejs",{loginError: ""});
                                        })
                                    }
                                    else{
                                    res.render("adminProfile.ejs", {
                                        name: req.session.user["username"],
                                        image: req.session.user["image"],
                                        errormessageadmin: null,
                                        adminName: name,
                                        adminImage: image,
                                        email: email,
                                        id: id,
                                        mobile: mobile,
                                        sex: sex,
                                        birthDate: birthDate,
                                        age: calculateAge(birthDate),
                                        address:address,
                                        editShow: null
                                    });}
                                }
                            );
                        }
                    })
                }
            } else console.log(err);
        }
    );
});

app.post("/editPatient", upload.single("image"), async (req, res) => {
    let name = req.body["name"],
        id = req.body["nationalID"],
        birthdate = req.body["birthDate"],
        sex = req.body["sex"],
        image = "../images/" + req.file.originalname,
        phone = req.body["mobile"],
        address = req.body["address"],
        age = calculateAge(birthdate),
        oldid = req.body["oldid"];
        const fileExtension = path.extname(req.file.originalname);
    
    if(!extensions.includes(fileExtension)){
        await pool.query("select * from medicalhistory where patientid = $1", [id], async (err, historyData) => {
            await pool.query(
                `SELECT * FROM patient WHERE nationalid = '${oldid}'`,
                (err2, respond2) => {
                    res.render("patientProfile.ejs", {
                        historyData: historyData.rows,
                        editShow: "show",
                        name: req.session.user["username"],
                        image: req.session.user["image"],
                        errormessagepatient: "  png, jpeg الصورة غير صالحة ادخل ",
                        patientName: respond2.rows[0].name,
                        patientImage: respond2.rows[0].image,
                        id: respond2.rows[0].nationalid,
                        birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                        sex: respond2.rows[0].sex,
                        phone: respond2.rows[0].phone,
                        age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                        address:respond2.rows[0].address, historyErrorMessage: "", showHistory: null
                    });
                }
            );
        })
    }


    else await pool.query(
        `SELECT * from patient WHERE nationalid = '${id}'`,
        async (err, respond) => {
            if (!err) {
                if (respond.rows.length === 1 && id != oldid) {
                    await pool.query("select * from medicalhistory where patientid = $1", [id], async (err, historyData) => {
                        await pool.query(
                            `SELECT * FROM patient WHERE nationalid = '${oldid}'`,
                            (err2, respond2) => {
                                res.render("patientProfile.ejs", {
                                    historyData: historyData.rows,
                                    editShow: "show",
                                    name: req.session.user["username"],
                                    image: req.session.user["image"],
                                    errormessagepatient: "الرقم القومي مستخدم",
                                    patientName: respond2.rows[0].name,
                                    patientImage: respond2.rows[0].image,
                                    id: respond2.rows[0].nationalid,
                                    birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                    sex: respond2.rows[0].sex,
                                    phone: respond2.rows[0].phone,
                                    age: calculateAge(respond2.rows[0].birthdate.toLocaleDateString('en-GB')),
                                    address:respond2.rows[0].address, historyErrorMessage: "", showHistory: null
                                });
                            }
                        );
                    })
                } else {
                    await pool.query("update medicalhistory set patientid = $1, patientname = $2 where patientid = $3 returning *", [id, name, oldid], async (err, historyData) => {
                        await pool.query(
                            "update patient SET name = $1, nationalid = $2, address = $3, phone = $4, sex = $5, image = $6, birthdate = $7 where nationalid = $8",
    
                            [name, id, address, phone, sex, image, birthdate, oldid],
                            (err2, respond2) => {
                                res.render("patientProfile.ejs", {
                                    historyData: historyData.rows,
                                    name: req.session.user["username"],
                                    image: req.session.user["image"],
                                    errormessagepatient: null,
                                    patientName: name,
                                    patientImage: image,
                                    id: id,
                                    phone: phone,
                                    birthdate: birthdate,
                                    sex: sex,
                                    age: calculateAge(birthdate),
                                    address:address,
                                    editShow: null, historyErrorMessage: "", showHistory: null
                                });
                            }
                        );
                    })
                }
            } else console.log(err);
        }
    );
});

app.post("/editSurgeon", upload.single("image"), async (req, res) => {
    let name = req.body["name"],
        email = req.body["email"],
        phone = req.body["mobile"],
        birthdate = req.body["birthDate"],
        oldid = req.body["oldid"],
        sex = req.body["sex"],
        id = req.body["id"],
        image = "../images/" + req.file.originalname,
        address = req.body["address"],
        specialization = req.body["special"];
        const fileExtension = path.extname(req.file.originalname);
    
    if(!extensions.includes(fileExtension)){
        await pool.query("select * from medicalhistory where patientid = $1", [id], async (err, historyData) => {
            await pool.query(
                `select * from surgeon where nationalid ='${id}'`,
                (err2, respond2) => {
                    res.render("doctorProfile.ejs", {
                        historyData: historyData.rows,
                        name: req.session.user["username"],
                        image: req.session.user["image"],
                        errormessagedoctor: "  png, jpeg الصورة غير صالحة ادخل ",
                        doctorName: respond2.rows[0].name,
                        doctorImage: respond2.rows[0].image,
                        email: respond2.rows[0].email,
                        id: respond2.rows[0].nationalid,
                        phone: respond2.rows[0].phone,
                        sex: respond2.rows[0].sex,
                        birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                        specialization: respond2.rows[0].speciality,
                        age: calculateAge(formatDate(respond2.rows[0].birthdate)),
                        address:respond2.rows[0].address,
                        editShow:"show", historyErrorMessage: "", showHistory: null
                    });
                }
            );
        })
    }

    else await pool.query(
        `select * from surgeon where nationalid = '${id}'`,
        async (err, respond) => {
            if (!err) {
                if (respond.rows.length === 1 && id != oldid) {
                    await pool.query("select * from medicalhistory where surgeonid = $1", [id], async (err, historyData) => {
                        await pool.query(
                            `select * from surgeon where nationalid ='${id}'`,
                            (err2, respond2) => {
                                res.render("doctorProfile.ejs", {
                                    historyData: historyData.rows,
                                    name: req.session.user["username"],
                                    image: req.session.user["image"],
                                    errormessagedoctor: "الرقم القومي مستخدم",
                                    doctorName: respond2.rows[0].name,
                                    doctorImage: respond2.rows[0].image,
                                    email: respond2.rows[0].email,
                                    id: respond2.rows[0].nationalid,
                                    phone: respond2.rows[0].phone,
                                    sex: respond2.rows[0].sex,
                                    birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                    specialization: respond2.rows[0].speciality,
                                    age: calculateAge(formatDate(respond2.rows[0].birthdate)),
                                    address:respond2.rows[0].address,
                                    editShow:"show", historyErrorMessage: "", showHistory: null
                                });
                            }
                        );
                    })
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

                        async (err2, respond2) => {
                            await pool.query("update medicalhistory set surgeonid = $1, surgeonname = $2 where surgeonid = $3 returning *", [id, name, oldid], async (err, historyData) => {
                                await pool.query(
                                    `select * from surgeon where nationalid ='${id}'`,
                                    (err2, respond2) => {
                                        res.render("doctorProfile.ejs", {
                                            historyData: historyData.rows,
                                            name: req.session.user["username"],
                                            image: req.session.user["image"],
                                            errormessagedoctor: null,
                                            doctorName: respond2.rows[0].name,
                                            doctorImage: respond2.rows[0].image,
                                            email: respond2.rows[0].email,
                                            id: respond2.rows[0].nationalid,
                                            phone: respond2.rows[0].phone,
                                            sex: respond2.rows[0].sex,
                                            birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                            specialization: respond2.rows[0].speciality,
                                            age: calculateAge(formatDate(respond2.rows[0].birthdate)),
                                            address:respond2.rows[0].address,
                                            editShow:null, historyErrorMessage: "", showHistory: null
                                        });
                                    }
                                );
                            })
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
                name: req.session.user["username"],
                image: req.session.user["image"],
                errormessageadmin: null,
                adminName: respond2.rows[0].name,
                adminImage: respond2.rows[0].image,
                email: respond2.rows[0].email,
                id: respond2.rows[0].nationalid,
                mobile: respond2.rows[0].phone,
                sex: respond2.rows[0].sex,
                birthDate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                age: calculateAge(formatDate(respond2.rows[0].birthdate)),
                address : respond2.rows[0].address,
                editShow:null
            }); 
    })
})

app.post("/previewDoctorProfile",async(req,res)=>{
    let id = req.body.hiddenPreviewID
    await pool.query("select * from medicalhistory where surgeonid = $1", [id], async (err, historyData) => {
        await pool.query(
            `select * from surgeon where nationalid ='${id}'`,
            (err2, respond2) => {
                res.render("doctorProfile.ejs", {
                    historyData: historyData.rows,
                    name: req.session.user["username"],
                    image: req.session.user["image"],
                    errormessagedoctor: null,
                    doctorName: respond2.rows[0].name,
                    doctorImage: respond2.rows[0].image,
                    email: respond2.rows[0].email,
                    id: respond2.rows[0].nationalid,
                    phone: respond2.rows[0].phone,
                    sex: respond2.rows[0].sex,
                    birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                    specialization: respond2.rows[0].speciality,
                    age: calculateAge(formatDate(respond2.rows[0].birthdate)),
                    address:respond2.rows[0].address,
                    editShow:null, historyErrorMessage: "", showHistory: null
                });
            }
        );
    })
})

app.post("/previewPatientProfile",async(req,res)=>{
    let id = req.body.hiddenPreviewID
    await pool.query("select * from medicalhistory where patientid = $1", [id], async (err, historyData) => {
        await pool.query(
            `SELECT * FROM patient WHERE nationalid = '${id}'`,
            (err2, respond2) => {
                res.render("patientProfile.ejs", {
                    historyData: historyData.rows,
                    name: req.session.user["username"],
                    image: req.session.user["image"],
                    errormessagepatient: null,
                    patientName: respond2.rows[0].name,
                    patientImage: respond2.rows[0].image,
                    id: respond2.rows[0].nationalid,
                    birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                    sex: respond2.rows[0].sex,
                    phone: respond2.rows[0].phone,
                    age: calculateAge(formatDate(respond2.rows[0]["birthdate"])),
                    address:respond2.rows[0].address,
                    editShow:null, historyErrorMessage: "", showHistory: null
                });
            }
        );
    })
})

app.post("/previewOperationProfile",async(req,res)=>{
    let code = req.body.hiddenOperationCode
    await pool.query("select * from useddevice where operationcode = $1",[code],async (err,usedDevicesRespond)=>{
        let usedDevicesArray;
        if(usedDevicesRespond.rows.length != 0){
        let array = []
        usedDevicesRespond.rows.forEach((dev)=>{
            array.push(dev["deviceproductcode"])    
        })
        usedDevicesArray = array.join(', ')
        }
        else {
            usedDevicesArray = "لا يوجد"
        }
        await pool.query(
            `SELECT * FROM operation WHERE code = '${code}'`,
            (err2, respond2) => {
                res.render("operationProfile.ejs", {
                    name: req.session.user["username"],
                    image: req.session.user["image"],
                    errormessagepatient: "this id has already been registered",
                    operationName: respond2.rows[0].name,
                    operationCode: respond2.rows[0].code,
                    operationPrice: respond2.rows[0].price,
                    operationDuration: respond2.rows[0].duration,
                    roomNumber: respond2.rows[0].roomnumber,
                    operationDescription: respond2.rows[0].description,
                    address:respond2.rows[0].address,
                    editErrorMessage:null,
                    editShow:null,
                    allUsedDevices: usedDevicesArray
                });
            }
        );
    })
})

app.post("/adminsPageEdit", upload.single("image"), async(req,res)=>{
    let name = req.body["name"],
        id = req.body["id"],
        sex = req.body["sex"],
        email = req.body["email"],
        birthDate = req.body["birthDate"],
        mobile = req.body["mobile"],
        address = req.body["address"],
        password = req.body["password"],
        confirmPassword = req.body["confirmPassword"],
        image = "../images/" + req.file.originalname,
        oldid = req.body["oldID"],
        oldEmail = req.body["oldEmail"];
        const fileExtension = path.extname(req.file.originalname);

    if(!extensions.includes(fileExtension)){
        await pool.query("select * from admin", async(err, newdata) => {
            res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                allAdmins: newdata.rows,savedID:oldid,savedEmail:oldEmail, show:null, showEdit: "show", errorMessage : null,editErrorMessage:"  png, jpeg الصورة غير صالحة ادخل ", name: req.session.user["username"], image: req.session.user["image"]});
        })
    }



    else await pool.query(
        `select * from admin where nationalid='${req.body["id"]}'`,
        async (err, respond) => {
            if (!err) {
                if (respond.rows.length == 1 && id != oldid) {
                    await pool.query("select * from admin", async(err, newdata) => {
                        res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                            allAdmins: newdata.rows,savedID:oldid,savedEmail:oldEmail, show:null, showEdit: "show", errorMessage : null,editErrorMessage:"الرقم القومي مستخدم", name: req.session.user["username"], image: req.session.user["image"]});
                    })
                } else if (req.body["password"] != req.body["confirmPassword"]) {
                    await pool.query("select * from admin", async(err, newdata) => {
                        res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                            allAdmins: newdata.rows,savedID:oldid,savedEmail:oldEmail, show:null, showEdit: "show", errorMessage : null,editErrorMessage:"كلمات المرور غير متطابقة", name: req.session.user["username"], image: req.session.user["image"]});
                    })
                }
                else {
                    await pool.query("select * from admin where email = $1",[email], async(err,emailData)=>{
                        if(emailData.rows.length != 0 && email != oldEmail){
                            await pool.query("select * from admin", async(err, newdata) => {
                                res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                                    allAdmins: newdata.rows, show:null,savedID:oldid,savedEmail:oldEmail, showEdit: "show", errorMessage : null,editErrorMessage:"البريد الالكتروني مستخدم", name: req.session.user["username"], image: req.session.user["image"]});
                            })
                        }
                        else{
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
                                async(err2, respond2) => {
                                    if(req.session.user["userId"] == oldid){
                                        req.session.destroy((err) => {
                                            if(err)
                                                console.log(err)
                                            res.render("./loginPage.ejs",{loginError: ""});
                                        })
                                    }
                                    else{
                                    await pool.query("select * from admin", async(err, newdata) => {
                                        res.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/admins",
                                            allAdmins: newdata.rows,savedID:null,savedEmail:null, show:null, showEdit: null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
                                    })}
                                }
                            );
                        }
                    })
                    
                }
            } else console.log(err);
        }
    );
})

app.post("/doctorsPageEdit", upload.single("image"), async(req,res)=>{
    let name = req.body["name"],
        email = req.body["email"],
        phone = req.body["mobile"],
        birthdate = req.body["birthDate"],
        oldid = req.body["oldID"],
        sex = req.body["sex"],
        id = req.body["id"],
        image = "../images/" + req.file.originalname,
        address = req.body["address"],
        specialization = req.body["special"];
        const fileExtension = path.extname(req.file.originalname);
    
    if(!extensions.includes(fileExtension)){
        await pool.query("select * from surgeon", async(err, newdata) => {
            res.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctors",
                allDoctors: newdata.rows, show: null,editShow:"show",savedID:oldid,editErrorMessage:"  png, jpeg الصورة غير صالحة ادخل ", errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        })
    }
    else await pool.query("select * from surgeon where nationalid = $1",[id],async(err,respond)=>{
        if(respond.rows.length == 1 && id != oldid){
            await pool.query("select * from surgeon", async(err, newdata) => {
                res.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctors",
                    allDoctors: newdata.rows, show: null,editShow:"show",savedID:oldid,editErrorMessage:"الرقم القومي مستخدم", errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
            })
        }
        else{
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

                    async(err2, respond2) => {
                        await pool.query("update medicalhistory set surgeonid = $1, surgeonname = $2 where surgeonid = $3", [id, name, oldid], async (err, historyRespond) => {
                            await pool.query("select * from surgeon", async(err, newdata) => {
                                res.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctors",
                                allDoctors: newdata.rows, show: null,savedID:null,editShow:null,editErrorMessage:null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
                            })  
                        })
                    }
                );
            }
    })
})

app.post("/patientsPageEdit", upload.single("image"), async(req,res)=>{
    let name = req.body["name"],
        id = req.body["nationalID"],
        birthdate = req.body["birthDate"],
        sex = req.body["sex"],
        image = "../images/" + req.file.originalname,
        phone = req.body["mobile"],
        address = req.body["address"],
        age = calculateAge(birthdate),
        oldid = req.body["oldID"];
        const fileExtension = path.extname(req.file.originalname);
    
    if(!extensions.includes(fileExtension)){
        await pool.query("select * from patient", async(err, newdata) => {
            res.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patients",allPatients: newdata.rows, show: null, errorMessage : null,editShow:"show",editErrorMessage:"  png, jpeg الصورة غير صالحة ادخل ",savedID : oldid, name: req.session.user["username"], image: req.session.user["image"]});
        })
    }

    else await pool.query("select * from patient where nationalid = $1",[id],async (err,respond)=>{
        if(respond.rows.length == 1 && id != oldid){
            await pool.query("select * from patient", async(err, newdata) => {
                res.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patients",allPatients: newdata.rows, show: null, errorMessage : null,editShow:"show",editErrorMessage:"الرقم القومي مستخدم",savedID : oldid, name: req.session.user["username"], image: req.session.user["image"]});
            })
        }
        else{
            await pool.query(
                "update patient SET name = $1, nationalid = $2, address = $3, phone = $4, sex = $5, image = $6, birthdate = $7 where nationalid = $8",

                [name, id, address, phone, sex, image, birthdate, oldid],
                async (err2, respond2) => {
                    await pool.query("update medicalhistory set patientid = $1, patientname = $2 where patientid = $3", [id, name, oldid], async (err, historyRespond) => {
                        await pool.query("select * from patient", async(err, newdata) => {
                            res.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patients",allPatients: newdata.rows, show: null, errorMessage : null,editShow:null,editErrorMessage:null,savedID : null, name: req.session.user["username"], image: req.session.user["image"]});
                        })
                    })
                }
            );
        }

    })
})

app.post("/devicesPageEdit",async (req,res)=>{
    let name = req.body.equipmentName,
    serial = req.body.serialNumber,
    price = req.body.price,
    warranty = req.body.warranty,
    stat = req.body.status,
    company = req.body.company,
    date = req.body.productionDate,
    oldSerial = req.body.oldSerial,
    productCode = req.body.productCode
    await pool.query("select * from device where serialnumber = $1",[serial],async(err,respond)=>{
        if(respond.rows.length == 1 && serial != oldSerial){
            await pool.query("select * from device",(err,newdata)=>{
                res.render("./devices.ejs",{highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devices",
                    allDevices: newdata.rows,show: null,editShow:"show",editErrorMessage:"الرقم التسلسلي مستخدم",savedCode : oldSerial, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]})
            })
        }
        else{
            await pool.query("update device set name = $1, serialnumber = $2, company = $3, warranty = $4, price = $5, date = $6, status = $7, productcode = $9 where serialnumber = $8",
                [name,serial,company,warranty,price,date,stat,oldSerial, productCode],async (err,respond2)=>{
                    if(err) console.log(err)
                    await pool.query("select * from device",(err,newdata)=>{
                        res.render("./devices.ejs",{highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devices",
                            allDevices: newdata.rows,show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]})
                    })      
                })
        }

    })
})

app.post("/operationsPageEdit",async (req,res)=>{
    let name = req.body.operationName,
    price = req.body.price,
    duration = req.body.duration,
    roomnumber = req.body.roomNumber,
    usedDevices = req.body["multiValueField"],
    description = req.body.description,
    oldCode = req.body.oldCode;

    if(typeof usedDevices == "string")
        usedDevices = [usedDevices];
    if(usedDevices != undefined){
    await pool.query("delete from useddevice where operationcode = $1",[oldCode],(err,respond)=>{
        usedDevices.forEach(async (deviceproductcode)=>{
            await pool.query("insert into useddevice (deviceproductcode, operationcode) values ($1, $2)",[deviceproductcode, oldCode],async(err,devicesData)=>{
            })
        })
    })}

    await pool.query("update operation set name = $1, duration = $2, price = $3, roomnumber = $4, description = $5 where code = $6 "
        ,[name,duration,price,roomnumber,description,oldCode],async (err,respond)=>{
            await pool.query("select * from operation",async (err, newdata) => {
                res.render("./operations.ejs", {selectElementValue:"/operations",allOperations: newdata.rows,show:null,editShow:null,editErrorMessage:null,savedCode:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
            })   
        })
})

app.post("/appointmentsPageEdit", async (req, respond) => {
    let patientID = req.body["patientID"],
    surgeonID = req.body["surgeonID"], 
    operationID = req.body["operationID"], 
    roomNumber = req.body["roomNumber"], 
    date = req.body["date"],
    time = req.body["time"],
    oldId = req.body["oldID"]

    date = new Date(`${date}T${time}Z`)
    
    let startdate = new Date(date.getTime() - 60 * 60 * 1000)


    await pool.query(`select * from patient where nationalid = '${patientID}'`, async (err, resPatient) =>{
        if(resPatient.rows.length != 0){
            await pool.query(`select * from surgeon where nationalid = '${surgeonID}'`, async (err, resSurgeon) =>{
                if(resSurgeon.rows.length != 0){
                    await pool.query(`select roomnumber from operation where code = '${operationID}'`, async (err, resOperation) =>{
                        if(resOperation.rows.length != 0){
                            let operationRoom = resOperation.rows[0]["roomnumber"]
                            let operationDuration = req.body["duration"]

                            let enddate = new Date(startdate.getTime() + (2 + Number(operationDuration)) * 60 * 60 * 1000)
                            if(roomNumber == operationRoom)
                                {
                                    await pool.query(`SELECT * FROM appointment WHERE roomnumber = $1 AND ((enddate > $2 AND enddate < $3) OR (startdate > $2 AND startdate < $3) OR (startdate < $2 AND enddate > $3));`, [operationRoom, startdate, enddate], async (err, timeRespond) => {
                                        if(timeRespond.rowCount > 0)
                                            {
                                                await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                    if(err)
                                                        console.log(err);
                                                    else {
                                                        respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  "show", editErrorMessage: "هذا التوقيت غير مناسب", show: null, errorMessage: "", savedID: oldId});
                                                    }
                                                })
                                            }else {
                                                await pool.query(`SELECT * FROM appointment WHERE surgeonid = $1 AND ((enddate > $2 AND enddate < $3) OR (startdate > $2 AND startdate < $3) OR (startdate < $2 AND enddate > $3));`, [surgeonID, startdate, enddate], async (err, surgeonTimeRespond) =>{
                                                    if (surgeonTimeRespond.rowCount > 0){
                                                        await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                            if(err)
                                                                console.log(err);
                                                            else {
                                                                respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  "show", editErrorMessage: "هذا الجراح لديه عملية في هذا التوقيت", show: null, errorMessage: "", savedID: oldId});
                                                            }
                                                        })
                                                    }else {
                                                        await pool.query(`SELECT * FROM appointment WHERE patientid = $1 AND ((enddate > $2 AND enddate < $3) OR (startdate > $2 AND startdate < $3) OR (startdate < $2 AND enddate > $3));`, [patientID, startdate, enddate], async (err, patientTimeRespond) =>{
                                                            if(patientTimeRespond.rowCount > 0){
                                                                await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                                    if(err)
                                                                        console.log(err);
                                                                    else {
                                                                        respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  "show", editErrorMessage: "هذا المريض لديه عملية في هذا التوقيت", show: null, errorMessage: "", savedID: oldId});
                                                                    }
                                                                })
                                                            }else {
                                                                await pool.query("select * from useddevice where operationcode = $1 and deviceproductcode not in (select DISTINCT deviceproductcode from device where status = $2)", [operationID, "نشط"], async (err, devicesAvailable) => {
                                                                    if(devicesAvailable.rowCount > 0){
                                                                        await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                                            if(err)
                                                                                console.log(err);
                                                                            else {
                                                                                respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  "show", editErrorMessage: "هذه العملية تتطلب جهاز غير متاح حاليا", show: null, errorMessage: "", savedID: oldId});
                                                                            }
                                                                        })
                                                                    }else {
                                                                        await pool.query("update appointment set patientid = $1, surgeonid = $2, operationid = $3, date = $4, roomnumber = $5, time = $6, startdate = $7, enddate = $8 duration = $10 where appointmentid = $9 "
                                                                            ,[patientID,surgeonID,operationID,date,roomNumber,time,startdate, enddate, oldId, operationDuration],async (err,res)=>{
                                                                                await pool.query("select * from operation",async (err, newdata) => {
                                                                                    if(err)
                                                                                        console.log(err)
                                                                                    else {
                                                                                        await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                                                                            if(err)
                                                                                                console.log(err);
                                                                                            else {
                                                                                                respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })   
                                                                            })    
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                    })
                                }else{
                                    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                        if(err)
                                            console.log(err);
                                        else {
                                            respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  "show", editErrorMessage: "هذه العملية لا تتم في هذه الغرفة", show: null, errorMessage: "", savedID: oldId});
                                        }
                                    })
                                }
                        }else {
                            await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                                if(err)
                                    console.log(err);
                                else {
                                    respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  "show", editErrorMessage: "لا توجد عملية بهذا الكود", show: null, errorMessage: "", savedID: oldId});
                                }
                            })
                        }
                    })
                }else {
                    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                        if(err)
                            console.log(err);
                        else {
                            respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  "show", editErrorMessage: "لا يوجد جراح بهذا الرقم القومي", show: null, errorMessage: "", savedID: oldId});
                        }
                    })
                }
            })
        }else {
            await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code", async (err, appointments) => {
                if(err)
                    console.log(err);
                else {
                    respond.render("./appointments.ejs",{selectElementValue:"/appointments",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  "show", editErrorMessage: "لا يوجد مريض بهذا الرقم القومي", show: null, errorMessage: "", savedID: oldId});
                }
            })
        }
    })
    
})

app.post("/adminProfileDelete",async (req,res)=>{
    let oldid = req.body.oldid;
    await pool.query("delete from admin where nationalid = $1",[oldid], async(err, rp) => {
        if(req.session.user["userId"] == oldid){
            req.session.destroy((err) => {
                if(err)
                    console.log(err)
                res.render("./loginPage.ejs",{loginError: ""});
            })
        }
        else{
        let dataNumbers = await getNumbers()
        res.render("./homePage.ejs",
            {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                errorMessage: "",
                show1:  null,
                show2:  null,
                show3:  null,
                show4:  null,
                show5:  null,
                show6:  null
            })}
    })
})

app.post("/patientProfileDelete",async (req,res)=>{
    let oldid = req.body.oldid;
    await pool.query("delete from patient where nationalid = $1",[oldid], async(err, rp) => {
        let dataNumbers = await getNumbers()
        res.render("./homePage.ejs",
            {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                errorMessage: "",
                show1:  null,
                show2:  null,
                show3:  null,
                show4:  null,
                show5:  null,
                show6:  null
            })
    })
})

app.post("/doctorProfileDelete",async (req,res)=>{
    let oldid = req.body.oldid;
    await pool.query("delete from surgeon where nationalid = $1",[oldid], async(err, rp) => {
        let dataNumbers = await getNumbers()
        res.render("./homePage.ejs",
            {
                name: req.session.user["username"],
                image: req.session.user["image"],
                dataNumbers: dataNumbers,
                show:  null, error: "",
                errorMessage: "",
                show1:  null,
                show2:  null,
                show3:  null,
                show4:  null,
                show5:  null,
                show6:  null
            })
    })
})

app.post("/operationProfileDelete",async (req,res)=>{
    let oldCode = req.body.oldCode;
     await pool.query("delete from useddevice where operationcode = $1",[oldCode],async (err,respond)=>{
        await pool.query("delete from operation where code = $1",[oldCode], async(err, rp) => {
            let dataNumbers = await getNumbers()
            res.render("./homePage.ejs",
                {
                    name: req.session.user["username"],
                    image: req.session.user["image"],
                    dataNumbers: dataNumbers,
                    show:  null, error: "",
                    errorMessage: "",
                    show1:  null,
                    show2:  null,
                    show3:  null,
                    show4:  null,
                    show5:  null,
                    show6:  null
                })
        })
    })
})

app.post("/operationProfileEdit", async (req, res) => {
    let { operationName: name, price, duration, roomNumber: roomnumber, multiValueField: usedDevices, description, oldCode } = req.body;

    if (typeof usedDevices === "string") {
        usedDevices = [usedDevices];
    }

    try {
        // Delete old devices
        await query("DELETE FROM useddevice WHERE operationcode = $1", [oldCode]);

        // Insert new devices
        if (usedDevices !== undefined) {
            for (const deviceproductcode of usedDevices) {
                await query("INSERT INTO useddevice (deviceproductcode, operationcode) VALUES ($1, $2)", [deviceproductcode, oldCode]);
            }
        }

        // Update operation details
        await query("UPDATE operation SET name = $1, duration = $2, price = $3, roomnumber = $4, description = $5 WHERE code = $6", [name, duration, price, roomnumber, description, oldCode]);

        // Fetch updated devices
        const usedDevicesResult = await query("SELECT * FROM useddevice WHERE operationcode = $1", [oldCode]);

        let usedDevicesArray;
        if (usedDevicesResult.rows.length !== 0) {
            usedDevicesArray = usedDevicesResult.rows.map(dev => dev.deviceproductcode).join(', ');
        } else {
            usedDevicesArray = "لا يوجد";
        }

        // Fetch operation details
        const operationResult = await query("SELECT * FROM operation WHERE code = $1", [oldCode]);

        // Render the response
        res.render("operationProfile.ejs", {
            name: req.session.user.username,
            image: req.session.user.image,
            errormessagepatient: "this id has already been registered",
            operationName: operationResult.rows[0].name,
            operationCode: operationResult.rows[0].code,
            operationPrice: operationResult.rows[0].price,
            operationDuration: operationResult.rows[0].duration,
            roomNumber: operationResult.rows[0].roomnumber,
            operationDescription: operationResult.rows[0].description,
            address: operationResult.rows[0].address,
            editErrorMessage: null,
            editShow: null,
            allUsedDevices: usedDevicesArray
        });
    } catch (error) {
        console.error("Error during operation profile edit:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/addHistoryPatientPage", async (req, respond) => {
    let operationCode = req.body["operationcode"],
    patientName = req.body["name"],
    patientId = req.body["patientid"],
    surgeonId = req.body["surgeonid"],
    date = req.body["date"]
    await pool.query("select * from surgeon where nationalid = $1", [surgeonId], async (err, surgeonRespond) => {
        if(err)
            console.log(err)
        else {
            if(surgeonRespond.rowCount != 0){
                let surgeonName = surgeonRespond.rows[0]["name"]
                await pool.query("select * from operation where code = $1", [operationCode], async (err, operationRespond) =>{
                    if(err)
                        console.log(err)
                    else {
                        if(operationRespond.rowCount != 0)
                            {
                                let operationName = operationRespond.rows[0]["name"]
                                await pool.query("insert into medicalhistory (patientname, patientid, surgeonname, surgeonid, operationcode, operationname, date) values ($1, $2, $3, $4, $5, $6, $7)",
                                    [patientName, patientId, surgeonName, surgeonId, operationCode, operationName, date], async (err, res) => {
                                        if(err)
                                            console.log(err)
                                        else {
                                            await pool.query("select * from medicalhistory where patientid = $1", [patientId], async (err, historyData) => {
                                                await pool.query(
                                                    `SELECT * FROM patient WHERE nationalid = '${patientId}'`,
                                                    (err2, respond2) => {
                                                        respond.render("patientProfile.ejs", {
                                                            historyData: historyData.rows,
                                                            name: req.session.user["username"],
                                                            image: req.session.user["image"],
                                                            errormessagepatient: null,
                                                            patientName: respond2.rows[0].name,
                                                            patientImage: respond2.rows[0].image,
                                                            id: respond2.rows[0].nationalid,
                                                            birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                                            sex: respond2.rows[0].sex,
                                                            phone: respond2.rows[0].phone,
                                                            age: calculateAge(formatDate(respond2.rows[0]["birthdate"])),
                                                            address:respond2.rows[0].address,
                                                            editShow:null, historyErrorMessage: "", showHistory: null
                                                        });
                                                    }
                                                );
                                            })
                                        }
                                    }
                                )
                            }else {
                                await pool.query("select * from medicalhistory where patientid = $1", [patientId], async (err, historyData) => {
                                    await pool.query(
                                        `SELECT * FROM patient WHERE nationalid = '${patientId}'`,
                                        (err2, respond2) => {
                                            respond.render("patientProfile.ejs", {
                                                historyData: historyData.rows,
                                                name: req.session.user["username"],
                                                image: req.session.user["image"],
                                                errormessagepatient: null,
                                                patientName: respond2.rows[0].name,
                                                patientImage: respond2.rows[0].image,
                                                id: respond2.rows[0].nationalid,
                                                birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                                sex: respond2.rows[0].sex,
                                                phone: respond2.rows[0].phone,
                                                age: calculateAge(formatDate(respond2.rows[0]["birthdate"])),
                                                address:respond2.rows[0].address,
                                                editShow:null, historyErrorMessage: "لا توجد عملية بهذا الكود", showHistory: "show"
                                            });
                                        }
                                    );
                                })
                            }
                    }
                })
            }else {
                await pool.query("select * from medicalhistory where patientid = $1", [patientId], async (err, historyData) => {
                    await pool.query(
                        `SELECT * FROM patient WHERE nationalid = '${patientId}'`,
                        (err2, respond2) => {
                            respond.render("patientProfile.ejs", {
                                historyData:historyData.rows,
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                errormessagepatient: null,
                                patientName: respond2.rows[0].name,
                                patientImage: respond2.rows[0].image,
                                id: respond2.rows[0].nationalid,
                                birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                sex: respond2.rows[0].sex,
                                phone: respond2.rows[0].phone,
                                age: calculateAge(formatDate(respond2.rows[0]["birthdate"])),
                                address:respond2.rows[0].address,
                                editShow:null, historyErrorMessage: "لا يوجد جراح بهذا الرقم القومي", showHistory: "show"
                            });
                        }
                    );
                })
            }
        }
    })
})


app.post("/addHistorySurgeonPage", async (req, respond) => {
    let operationCode = req.body["operationcode"],
    surgeonName = req.body["name"],
    patientId = req.body["patientid"],
    surgeonId = req.body["surgeonid"],
    date = req.body["date"]
    await pool.query("select * from patient where nationalid = $1", [patientId], async (err, patientRespond) => {
        if(err)
            console.log(err)
        else {
            if(patientRespond.rowCount != 0){
                let patientName = patientRespond.rows[0]["name"]
                await pool.query("select * from operation where code = $1", [operationCode], async (err, operationRespond) =>{
                    if(err)
                        console.log(err)
                    else {
                        if(operationRespond.rowCount != 0)
                            {
                                let operationName = operationRespond.rows[0]["name"]
                                await pool.query("insert into medicalhistory (patientname, patientid, surgeonname, surgeonid, operationcode, operationname, date) values ($1, $2, $3, $4, $5, $6, $7)",
                                    [patientName, patientId, surgeonName, surgeonId, operationCode, operationName, date], async (err, res) => {
                                        if(err)
                                            console.log(err)
                                        else {
                                            await pool.query("select * from medicalhistory where surgeonid = $1", [surgeonId], async (err, historyData) => {
                                                await pool.query(
                                                    `select * from surgeon where nationalid ='${surgeonId}'`,
                                                    (err2, respond2) => {
                                                        respond.render("doctorProfile.ejs", {
                                                            historyData: historyData.rows,
                                                            name: req.session.user["username"],
                                                            image: req.session.user["image"],
                                                            errormessagedoctor: null,
                                                            doctorName: respond2.rows[0].name,
                                                            doctorImage: respond2.rows[0].image,
                                                            email: respond2.rows[0].email,
                                                            id: respond2.rows[0].nationalid,
                                                            phone: respond2.rows[0].phone,
                                                            sex: respond2.rows[0].sex,
                                                            birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                                            specialization: respond2.rows[0].speciality,
                                                            age: calculateAge(formatDate(respond2.rows[0].birthdate)),
                                                            address:respond2.rows[0].address,
                                                            editShow:null, historyErrorMessage: "", showHistory: null
                                                        });
                                                    }
                                                );
                                            })
                                        }
                                    }
                                )
                            }else {
                                await pool.query("select * from medicalhistory where surgeonid = $1", [surgeonId], async (err, historyData) => {
                                    await pool.query(
                                        `select * from surgeon where nationalid ='${surgeonId}'`,
                                        (err2, respond2) => {
                                            respond.render("doctorProfile.ejs", {
                                                historyData: historyData.rows,
                                                name: req.session.user["username"],
                                                image: req.session.user["image"],
                                                errormessagedoctor: null,
                                                doctorName: respond2.rows[0].name,
                                                doctorImage: respond2.rows[0].image,
                                                email: respond2.rows[0].email,
                                                id: respond2.rows[0].nationalid,
                                                phone: respond2.rows[0].phone,
                                                sex: respond2.rows[0].sex,
                                                birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                                specialization: respond2.rows[0].speciality,
                                                age: calculateAge(formatDate(respond2.rows[0].birthdate)),
                                                address:respond2.rows[0].address,
                                                editShow:null, historyErrorMessage: "لا توجد عملية بهذا الكود", showHistory: null
                                            });
                                        }
                                    );
                                })
                            }
                    }
                })
            }else {
                await pool.query("select * from medicalhistory where surgeonid = $1", [surgeonId], async (err, historyData) => {
                    await pool.query(
                        `select * from surgeon where nationalid ='${surgeonId}'`,
                        (err2, respond2) => {
                            respond.render("doctorProfile.ejs", {
                                historyData: historyData.rows,
                                name: req.session.user["username"],
                                image: req.session.user["image"],
                                errormessagedoctor: null,
                                doctorName: respond2.rows[0].name,
                                doctorImage: respond2.rows[0].image,
                                email: respond2.rows[0].email,
                                id: respond2.rows[0].nationalid,
                                phone: respond2.rows[0].phone,
                                sex: respond2.rows[0].sex,
                                birthdate: respond2.rows[0].birthdate.toLocaleDateString('en-GB'),
                                specialization: respond2.rows[0].speciality,
                                age: calculateAge(formatDate(respond2.rows[0].birthdate)),
                                address:respond2.rows[0].address,
                                editShow:null, historyErrorMessage: "لا يوجد مريض بهذا الرقم القومي", showHistory: null
                            });
                        }
                    );
                })
            }
        }
    })
})

app.get("/malePatients", async (req, data) => {

    await pool.query("select * from patient where sex = 'ذكر'", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",currentPage:"AndMale",selectElementValue:"/patients",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/femalePatients", async (req, data) => {

    await pool.query("select * from patient where sex = 'أنثى'", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",currentPage:"AndFemale",selectElementValue:"/patients",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/patientsSortedASCByAge", async (req, data) => {

    await pool.query("select * from patient ORDER BY birthdate DESC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patientsSortedASCByAge",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})


app.get("/patientsSortedDESCByAge", async (req, data) => {

    await pool.query("select * from patient ORDER BY birthdate ASC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patientsSortedDESCByAge",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/patientsSortedASCByName", async (req, data) => {

    await pool.query("select * from patient ORDER BY name ASC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patientsSortedASCByName",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/patientsSortedDESCByName", async (req, data) => {

    await pool.query("select * from patient ORDER BY name DESC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/patientsSortedDESCByName",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/patientsSortedASCByAgeAndFemale", async (req, data) => {

    await pool.query("select * from patient where sex = 'أنثى' ORDER BY birthdate DESC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/patientsSortedASCByAgeAndFemale",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})


app.get("/patientsSortedDESCByAgeAndFemale", async (req, data) => {

    await pool.query("select * from patient where sex = 'أنثى' ORDER BY birthdate ASC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/patientsSortedDESCByAgeAndFemale",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/patientsSortedASCByNameAndFemale", async (req, data) => {

    await pool.query("select * from patient where sex = 'أنثى' ORDER BY name ASC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/patientsSortedASCByNameAndFemale",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/patientsSortedDESCByNameAndFemale", async (req, data) => {

    await pool.query("select * from patient where sex = 'أنثى' ORDER BY name DESC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/patientsSortedDESCByNameAndFemale",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})


app.get("/patientsSortedASCByAgeAndMale", async (req, data) => {

    await pool.query("select * from patient where sex = 'ذكر' ORDER BY birthdate DESC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/patientsSortedASCByAgeAndMale",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})


app.get("/patientsSortedDESCByAgeAndMale", async (req, data) => {

    await pool.query("select * from patient where sex = 'ذكر' ORDER BY birthdate ASC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/patientsSortedDESCByAgeAndMale",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})



app.get("/patientsSortedASCByNameAndMale", async (req, data) => {

    await pool.query("select * from patient where sex = 'ذكر' ORDER BY name ASC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/patientsSortedASCByNameAndMale",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/patientsSortedDESCByNameAndMale", async (req, data) => {

    await pool.query("select * from patient where sex = 'ذكر' ORDER BY name DESC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./patients.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/patientsSortedDESCByNameAndMale",allPatients: res.rows, show: null,editShow:null,editErrorMessage:null,savedID : null, errorMessage : null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/operationsSBNA", async (req, data) => {

    await pool.query("select * from operation order by name asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./operations.ejs", {selectElementValue:"/operationsSBNA",allOperations: res.rows,show:null, editShow:null,editErrorMessage:null,savedCode:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/operationsSBND", async (req, data) => {

    await pool.query("select * from operation order by name desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./operations.ejs", {selectElementValue:"/operationsSBND",allOperations: res.rows,show:null, editShow:null,editErrorMessage:null,savedCode:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/operationsSBRNA", async (req, data) => {

    await pool.query("select * from operation order by roomnumber asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./operations.ejs", {selectElementValue:"/operationsSBRNA",allOperations: res.rows,show:null, editShow:null,editErrorMessage:null,savedCode:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/operationsSBRND", async (req, data) => {

    await pool.query("select * from operation order by roomnumber desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./operations.ejs", {selectElementValue:"/operationsSBRND",allOperations: res.rows,show:null, editShow:null,editErrorMessage:null,savedCode:null,errorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/appointmentsSBPNA", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code ORDER BY P.name ASC", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{selectElementValue:"/appointmentsSBPNA",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
        }
    })
})


app.get("/appointmentsSBPND", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code ORDER BY P.name DESC", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{selectElementValue:"/appointmentsSBPND",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
        }
    })
})

app.get("/appointmentsSBSNA", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code ORDER BY surgeonname ASC", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{selectElementValue:"/appointmentsSBSNA",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
        }
    })
})

app.get("/appointmentsSBSND", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code ORDER BY surgeonname DESC", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{selectElementValue:"/appointmentsSBSND",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
        }
    })
})

app.get("/appointmentsSBANA", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code ORDER BY A.appointmentid ASC", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{selectElementValue:"/appointmentsSBANA",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
        }
    })
})

app.get("/appointmentsSBAND", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code ORDER BY A.appointmentid DESC", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{selectElementValue:"/appointmentsSBAND",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
        }
    })
})

app.get("/appointmentsSBDA", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code ORDER BY A.startdate ASC", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{selectElementValue:"/appointmentsSBDA",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
        }
    })
})

app.get("/appointmentsSBDD", async (req, data) => {

    await pool.query("select P.name as patientname, D.name as surgeonname, O.name as operationname, O.duration as operationduration, A.* from appointment A join surgeon D on A.surgeonid = D.nationalid join patient P on A.patientid = P.nationalid join operation O on A.operationid = O.code ORDER BY A.startdate DESC", async (err, appointments) => {
        if(err)
            console.log(err);
        else {
            data.render("./appointments.ejs",{selectElementValue:"/appointmentsSBDD",allAppointments: appointments.rows, name: req.session.user["username"], image: req.session.user["image"], editShow:  null, editErrorMessage: "", show: null, errorMessage: "", savedID: null});
        }
    })
})

app.get("/maleDoctors", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'ذكر'", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/doctors",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})



app.get("/femaleDoctors", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'أنثى'", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/doctors",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBNA", async (req, data) => {

    await pool.query("select * from surgeon order by name asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctorsSBNA",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBND", async (req, data) => {

    await pool.query("select * from surgeon order by name desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctorsSBND",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBAA", async (req, data) => {

    await pool.query("select * from surgeon order by birthdate desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctorsSBAA",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBAD", async (req, data) => {

    await pool.query("select * from surgeon order by birthdate asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/doctorsSBAD",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})


app.get("/doctorsSBNAAndMale", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'ذكر' order by name asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/doctorsSBNAAndMale",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBNDAndMale", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'ذكر' order by name desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/doctorsSBNDAndMale",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBAAAndMale", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'ذكر' order by birthdate desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/doctorsSBAAAndMale",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBADAndMale", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'ذكر' order by birthdate asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/doctorsSBADAndMale",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBNAAndFemale", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'أنثى' order by name asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/doctorsSBNAAndFemale",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBNDAndFemale", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'أنثى' order by name desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/doctorsSBNDAndFemale",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBAAAndFemale", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'أنثى' order by birthdate desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/doctorsSBAAAndFemale",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/doctorsSBADAndFemale", async (req, data) => {

    await pool.query("select * from surgeon where sex = 'أنثى' order by birthdate asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./doctors.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/doctorsSBADAndFemale",
                allDoctors: res.rows, show: null,editShow:null,savedID:null,editErrorMessage:null, errorMessage : null,name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})


app.get("/maleAdmins", async (req, data) => {

    await pool.query("select * from admin where sex = 'ذكر'", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/admins",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})



app.get("/femaleAdmins", async (req, data) => {

    await pool.query("select * from admin where sex = 'أنثى'", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/admins",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBNA", async (req, data) => {

    await pool.query("select * from admin order by name asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/AdminsSBNA",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBND", async (req, data) => {

    await pool.query("select * from admin order by name desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/AdminsSBND",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBAA", async (req, data) => {

    await pool.query("select * from admin order by birthdate desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/AdminsSBAA",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBAD", async (req, data) => {

    await pool.query("select * from admin order by birthdate asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/AdminsSBAD",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})


app.get("/AdminsSBNAAndMale", async (req, data) => {

    await pool.query("select * from admin where sex = 'ذكر' order by name asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/AdminsSBNAAndMale",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBNDAndMale", async (req, data) => {

    await pool.query("select * from admin where sex = 'ذكر' order by name desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/AdminsSBNDAndMale",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBAAAndMale", async (req, data) => {

    await pool.query("select * from admin where sex = 'ذكر' order by birthdate desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/AdminsSBAAAndMale",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBADAndMale", async (req, data) => {

    await pool.query("select * from admin where sex = 'ذكر' order by birthdate asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndMale",selectElementValue:"/AdminsSBADAndMale",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBNAAndFemale", async (req, data) => {

    await pool.query("select * from admin where sex = 'أنثى' order by name asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/AdminsSBNAAndFemale",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBNDAndFemale", async (req, data) => {

    await pool.query("select * from admin where sex = 'أنثى' order by name desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/AdminsSBNDAndFemale",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBAAAndFemale", async (req, data) => {

    await pool.query("select * from admin where sex = 'أنثى' order by birthdate desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/AdminsSBAAAndFemale",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})

app.get("/AdminsSBADAndFemale", async (req, data) => {

    await pool.query("select * from admin where sex = 'أنثى' order by birthdate asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./admins.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndFemale",selectElementValue:"/AdminsSBADAndFemale",
                allAdmins: res.rows, show: null,showEdit:null,savedID:null,savedEmail:null, errorMessage : null,editErrorMessage:null, name: req.session.user["username"], image: req.session.user["image"]});
        }
    })
})


app.get("/activeDevices", async (req, data) => {

    await pool.query("select * from device where status = 'نشط'", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devices",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})



app.get("/inactiveDevices", async (req, data) => {

    await pool.query("select * from device where status = 'معطل'", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devices",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBDA", async (req, data) => {

    await pool.query("select * from device order by date asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBDA",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBDD", async (req, data) => {

    await pool.query("select * from device order by date desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBDD",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBNA", async (req, data) => {

    await pool.query("select * from device order by name ASC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBNA",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBND", async (req, data) => {

    await pool.query("select * from device order by name DESC", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBND",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBCA", async (req, data) => {

    await pool.query("select * from device order by company asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBCA",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBCD", async (req, data) => {

    await pool.query("select * from device order by company desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBCD",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBPA", async (req, data) => {

    await pool.query("select * from device order by price asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBPA",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBPD", async (req, data) => {

    await pool.query("select * from device order by price desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBPD",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBWA", async (req, data) => {

    await pool.query("select * from device order by warranty asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBWA",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBWD", async (req, data) => {

    await pool.query("select * from device order by warranty desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:"highlight",highlitedFirst:null,highlitedSecond:null,currentPage:null,selectElementValue:"/devicesSBWD",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBDAAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by date asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBDAAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBDDAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by date desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBDDAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBNAAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by name asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBNAAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBNDAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by name desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBNDAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBCAAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by company asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBCAAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBCDAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by company desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBCDAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBPAAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by price asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBPAAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBPDAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by price desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBPDAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBWAAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by warranty asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBWAAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBWDAndInactive", async (req, data) => {

    await pool.query("select * from device where status = 'معطل' order by warranty desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:null,highlitedSecond:"highlight",currentPage:"AndInactive",selectElementValue:"/devicesSBWDAndInactive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})


app.get("/devicesSBDAAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by date asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBDAAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBDDAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by date desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBDDAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBNAAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by name asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBNAAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBNDAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by name desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBNDAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBCAAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by company asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBCAAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBCDAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by company desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBCDAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBPAAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by price asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBPAAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBPDAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by price desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBPDAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBWAAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by warranty asc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBWAAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})

app.get("/devicesSBWDAndActive", async (req, data) => {

    await pool.query("select * from device where status = 'نشط' order by warranty desc", (err, res) => {
        if(err)
            console.log(err);
        else {
            data.render("./devices.ejs", {highlitedAll:null,highlitedFirst:"highlight",highlitedSecond:null,currentPage:"AndActive",selectElementValue:"/devicesSBWDAndActive",
                allDevices: res.rows, show: null,editShow:null,editErrorMessage:null,savedCode : null, errorMessage : null, name:req.session.user["username"], image:req.session.user["image"]});
        }
    })
})




app.listen(port, (req, res) => {
  console.log(`server is running on port number ${port}`);
});
