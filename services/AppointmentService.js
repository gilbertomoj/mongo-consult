var appointment = require("./../models/Appointment");
var mongoose = require("mongoose");
var AppointmentFactory = require("./../factories/AppointmentFactory");
const Appo = mongoose.model("appointment", appointment)
var mailer = require("nodemailer")
class AppointmentService{

    async Create(name, email, description, cpf, date, time){
        var newAppo = await Appo.create({
            name,
            email,
            description,
            cpf,
            date,
            time,
            finished: false,
            notified: false
        });
        
        try {
            await newAppo.save();
            return true;
        } catch (err) {
            console.log(err)
            return false;
        }
    }

    async GetAll(showFinished){
        if(showFinished){
            return await Appo.find();
        }else{
            var appos = await Appo.find({'finished': false})
            var appointments = [];

            appos.forEach(appointment =>{

                if(appointment.date != undefined){
                    appointments.push(AppointmentFactory.Build(appointment))
                }
            })

            return appointments
        }
    }

    async GetById(id){
        try {
            var event = await Appo.findOne({'_id': id})
            return event
        } catch (error) {
            console.log(error)
            return undefined
        }

    }

    async Finish(id){
        try {
            await Appo.findByIdAndUpdate(id, {finished: true})
            return true 
        } catch (error) {
            console.log(error)
            return false
        }
    }

    async Search(query){
        try {
            const appos = await Appo.find().or([{email: query}, {cpf: query}])
            return appos
        } catch (error) {
            console.log(error)
            return [];
        }
        
    }

    async SendNotification(){
        const appos = await this.GetAll(false);
        var transporter = mailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "add4288bb70423",
              pass: "ac8ff3db8242a1"
            }
        })
        appos.forEach(async app => {

            const date = app.start.getTime();
            const hour = 1000 * 60 * 60;
            const gap = date - Date.now();

            if(gap <= hour){
            
                if(!app.notified){

                    await Appo.findByIdAndUpdate(app.id, {notified: true});

                    transporter.sendMail({
                        from: "Gilberto Medeiros <gibamedeirosgc@gmail.com>",
                        to: app.email,
                        subject: "Sua consulta vai acontecer em breve",
                        text: "Consulta agora"
                    }).then(()=>{
                        console.log("OK")
                    }).catch(err => {
                        console.log(err)
                    })

                }

            }

        })
    }
}

module.exports = new AppointmentService();