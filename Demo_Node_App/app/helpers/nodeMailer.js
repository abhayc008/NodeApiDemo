const nodemailer =  require("nodemailer");
const config = require("../config/auth.config");

let transporter = nodemailer.createTransport({
    host:config.emailHost,
    port:config.emailPort,
    auth:{
        user:config.emailUser,
        pass: config.emailPass
    }
});

exports.sendEmail =(to , subject, body) =>{

    return transporter.sendMail({
        from: config.emailFrom,
        to:to,
        subject:subject,
        html : body
    },(err) =>{
        console.log("Error while sending email >" + err.message);
    })
};



