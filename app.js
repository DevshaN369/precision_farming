const express = require("express");
const app = express();
var mysql = require("mysql");
var path=require('path')
const multer = require('multer');
var sql = "";
var bodyParser = require("body-parser");
app.use(express.json());
var cors = require('cors');
const { PORT, DB_HOST, DB_NAME, DB_PASSWORD, DB_USER, DB_PORT } = require("./config");
app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/xampp/htdocs/img_uploads/area_imgs/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });
// File upload configuration
// var db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "precision_farming",
// });
var db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password:DB_PASSWORD,
  port:DB_PORT,
  database: DB_NAME,
});
db.connect(function (err) {
  if (err) throw err;
  console.log("mysql db Connected!");
  // Database creation
  sql = "CREATE DATABASE IF NOT EXISTS precision_farming";
  db.query(sql, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Database created");
    }
  });
  // Database table creation
  sql =
    "CREATE TABLE IF NOT EXISTS land_segment (id INT AUTO_INCREMENT PRIMARY KEY, Area VARCHAR(255), Image VARCHAR(255))";
  db.query(sql, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Table created");
    }
  });
});
app.get("/", (req, res) => {
  res.json("get method is working");
});

app.post("/login", (req, res) => {
  var {
    dates,
    email_id,
    password,
    name,
    phone,
    location,
    lattitude,
    longitude,
    user_id,
  } = req.body;
  sql =
    "INSERT INTO agri_login (dates,email_id,password,name,phone,location,lattitude,longitude,user_id) VALUES ?";
  var values = [
    [
      dates,
      email_id,
      password,
      name,
      phone,
      location,
      lattitude,
      longitude,
      user_id,
    ],
  ];
  db.query(sql, [values], (err, res) => {
    if (err) console.log(err);
    console.log("login successfully !");
  });
  res.json({status:'Success',message:"Login Successfully !"})
// console.log(dates,email_id,password,name,phone,location,lattitude,longitude,user_id);
});
// app.post('/upload', upload.single('image'), (req, res) => {
//   console.log(req.body);
//   const imagePath = req.file.path;
//   const img_org=imagePath.slice("28")
//   // File path where the image is stored
//   const query = 'INSERT INTO images (path) VALUES (?)';
//   db.query(query, [img_org], (err, result) => {
//     if (err) {
//       console.error('Error inserting image path:', err);
//       res.status(500).send('Error uploading image');
//     } else {
//       res.send('Image uploaded successfully');
//     }
//   });
// });
app.post("/add_farmarea",upload.single('image'), (req, res) => {
  const imagePath = req.file.path;
  const img_org=imagePath.slice("28")
  var { dates, farm_id, area_id, coordinates, area, remarks } = req.body;
  sql =
    "INSERT INTO agri_farm_area (dates,farm_id,area_id,coordinates,img,area,remarks) VALUES ?";
  var values = [[dates, farm_id, area_id, coordinates,img_org, area, remarks]];
  db.query(sql, [values], (err, res) => {
    if (err) console.log(err);
    console.log("farm area added successfully !");
  });
});
app.get("/get_farmarea",(req,res)=>{
  sql="SELECT * FROM agri_farm_area"
  db.query(sql,(err,result)=>{
    if(err)console.log('error',err)
    console.log('farm_area successfully get');
    res.json(result);
  })
})
app.post("/add_agrifarm", (req, res) => {
  var { dates, farm_id, user_id, image, remarks } = req.body;
  sql = "INSERT INTO agri_farm (dates,farm_id,user_id,image,remarks) VALUES ?";
  var values = [[dates, farm_id, user_id, image, remarks]];
  db.query(sql, [values], (err, res) => {
    if (err) console.log(err);
    console.log("agrifarm added successfully !");
  });
});
app.post("/add_agridevices", (req, res) => {
  var { dates, area_id, device_id, device_type, remarks } = req.body;
  sql =
    "INSERT INTO agri_devices (dates,area_id,device_id,device_type,remarks) VALUES ?";
  var values = [[dates, area_id, device_id, device_type, remarks]];
  db.query(sql, [values], (err, res) => {
    if (err) console.log(err);
    console.log("agri_devices added successfully !");
  });
});
app.post("/add_agritransaction", (req, res) => {
  var { dates, email_id, farm_id, area_id, crop_id, status } = req.body;
  sql =
    "INSERT INTO agri_transaction (dates,email_id,farm_id,area_id,crop_id,status) VALUES ?";
  var values = [[dates, email_id, farm_id, area_id, crop_id, status]];
  db.query(sql, [values], (err, res) => {
    if (err) console.log(err);
    console.log("agri_transaction added successfully !");
  });
});


// --------------------------------pricision farming details get--------------------------
app.get('/api/PF/GetFarmDetails/:user_id',(req,res)=>{
  const user_id=req.params.user_id
  sql="SELECT * FROM agri_farm WHERE user_id="+user_id
  db.query(sql,(err,result)=>{
    if(err)console.log(err)
    res.json({message:"successfully get agri farm details",status:200,data:result})
  })
})

app.get('/api/PF/GetFarmAreaDetails/:farm_id',(req,res)=>{
  const farm_id=req.params.farm_id
  sql="SELECT * FROM agri_farm_area WHERE farm_id="+farm_id.slice(8)
  db.query(sql,(err,result)=>{
    if(err)console.log(err)
    res.json({message:"successfully get agri area details",status:200,data:result})
  })
})
// -----------------------------------------------GEt Crop Details--------------------------------
app.get('/api/PF/GetFarmCrops',(req,res)=>{
  sql="SELECT * FROM agri_crop_lookup"
  db.query(sql,(err,result)=>{
    if(err)console.log(err)
    res.json({message:"Successfully get agri crops",status:200,data:result})
  })
})
// -----------------------------------------------Add Crop Details--------------------------------
app.post("/api/PF/InsertFarmCrop", (req, res) => {
  var {dates,email,crop_id,crop_name,crop_type,crop_img,harvest_start,harvest_end,harvest_repeat,remarks1,remarks2,remarks3,added_by,newcrop_id } = req.body;
  sql =
    "INSERT INTO agri_crop_userlookup (dates,email,crop_id,crop_name,crop_type,crop_img,harvest_start,harvest_end,harvest_repeat,remarks1,remarks2,remarks3,added_by,newcrop_id) VALUES ?";
  var values = [[ dates,email,crop_id,crop_name,crop_type,crop_img,harvest_start,harvest_end,harvest_repeat,remarks1,remarks2,remarks3,added_by,newcrop_id],];
  db.query(sql, [values], (err, res) => {
    if (err) console.log(err);
    console.log("agri_crop_userlookup added successfully !");
  });
});
// -----------------------------------------------Add agri_transaction--------------------------------
app.post('/api/PF/InsertAgriTransaction',(req,res)=>{
  var {dates, email_id, farm_id, area_id, crop_id,goods_id,date_remarks,remarks,type, status}=req.body
  var values = [[dates, email_id, farm_id, area_id, crop_id,goods_id,date_remarks,remarks,type, status]]
  sql="INSERT INTO agri_transaction (dates, email_id, farm_id, area_id, crop_id,goods_id,date_remarks,remarks,type, status) VALUES ?"
  db.query(sql,[values],(err,result)=>{
    if(err)console.log(err);
    res.json({message:"Successfully inserted agri trans",status:200,})
  })
})
app.post('/api/PF/InsertAgriGoods',(req,res)=>{
  var {dates, farm_id, area_id, goods_id, crop_id, status}=req.body
  var values=[[dates, farm_id, area_id, goods_id, crop_id, status]]
  sql="INSERT INTO agri_goods (dates, farm_id, area_id, goods_id, crop_id, status) VALUES ?"
  db.query(sql,[values],(err,result)=>{
    if(err)console.log(err)
    res.json({message:"Successfully inserted agri transactions",status:200,})
  })
})
// -------------------------get dashboard sidebar details--------------
app.get('/api/PF/GetAgriCrop/:area_id',(req,res)=>{
  const area_id=req.params.area_id
  sql=`select ag.dates,ag.area_id,ag.goods_id,acl.crop_id,acl.crop_name,acl.crop_img  from  agri_goods as ag LEFT JOIN agri_crop_lookup as acl on acl.crop_id = ag.crop_id Where ag.area_id ='${area_id}' AND ag.status=1`
  console.log(sql);
  db.query(sql,(err,result)=>{
    if(err)console.log(err);
    res.json({message:"Successfully get agri crops details",status:200,data:result})
    

  })
})
// --------------------------------------------agri goods update --------------------------------
app.post('/api/PF/UpdateAgriGoods/:crop_id',(req,res)=>{
  const crop_id=req.params.crop_id
  sql=`UPDATE agri_goods SET status=0 WHERE crop_id=${crop_id}`
  db.query(sql,(err,result)=>{
    if(err)console.log(err);
    return res.json({message:"Successfully Updated Goods Status"})
  })
})
// -------------------------------------------- get agri device data and device transaction data --------------------------------
app.get('/api/PF/GetAgriDevice/:area_id',(req,res)=>{
  const area_id=String(req.params.area_id)
  sql=`SELECT * FROM agri_devices WHERE area_id="${area_id}"`
  db.query(sql,(err,result)=>{
    if(err)console.log(err);
    res.json({message:"Successfully get device details",status:200,data:result})

  })
})
app.get('/api/PF/GetAgriTransaction_Goods/:goods_id',(req,res)=>{
  const goods_id=req.params.goods_id
  sql=`SELECT * FROM agri_transaction WHERE goods_id="${goods_id}"`
  db.query(sql,(err,result)=>{
  res.json({message:"Successfully GetAgriTransaction_Goods details",status:200,data:result})
  })
})
app.get('/api/PF/GetAgriDeviceTransactions',(req,res)=>{
  const { startDate, endDate,device_id } = req.query;
  sql=`SELECT * FROM agri_device_transaction WHERE dates BETWEEN "${startDate}" AND "${endDate}" AND device_id="${device_id}" AND type=2`
  db.query(sql,(err,result)=>{
    if(err)console.log(err);
  res.json({message:"Successfully GetAgriDeviceTransaction details",status:200,data:result})

  })
})
// --------------------------------------------end ----------------------------------
app.listen(PORT, () => {
  console.log("server is up and running");
});
