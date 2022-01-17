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

app.listen(8080, ()=>{
    console.log("Running")
})