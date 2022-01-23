const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const AppointmentService = require("./services/AppointmentService")

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/scheduling", {useNewUrlParser: true, useUnifiedTopology: true})

app.get("/", (req,res)=>{
    res.render("index")
})

app.get("/cadastro", (req,res)=>{
    res.render("create")
})

app.post("/create",async (req, res)=>{
    const {name, email, description, cpf, date, time, finished} = req.body;
    const status = await AppointmentService.Create(
        name,
        email,
        description,
        cpf,
        date,
        time,
        finished
    )

    if(status){
        res.redirect("/") 
    }else{
        res.send("Algo está errado")
    }
    
})

app.get("/getcalendar", async (req,res) => {
    
    var appointments = await AppointmentService.GetAll(false);

    res.json(appointments);
})

app.get("/event/:id", async (req, res)=>{
    const id = req.params.id;
    var appointment = await AppointmentService.GetById(id)
    if( appointment){
        console.log(appointment)
        res.render("event", {appo : appointment})
    }else{
        res.send("error")
    }
})

app.post("/finish", async (req, res)=>{
    const { id } = req.body;
    var result = await AppointmentService.Finish(id);

    res.redirect("/")
})

app.get("/list", async (req, res)=>{

    // await AppointmentService.Search("gm@gmail.com");

    const appos = await AppointmentService.GetAll(true);
    res.render("list", {appos})
})

app.get("/searchresult", async (req, res)=>{
    const appos = await AppointmentService.Search(req.query.search)
    res.render("list",{appos});
})
app.listen(8080, ()=>{
    console.log("Running in http://localhost:8080/")
})