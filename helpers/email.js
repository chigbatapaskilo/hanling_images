const nodemailer=require('nodemailer');
require('dotenv').config();

const sendMail=async(option)=>{
    const transport=await nodemailer.createTransport({
        secure:true,
        service:process.env.SERVICE,
        auth:{
            user:process.env.MAIL_ID,
            pass:process.env.MAIL_PASSWORD
        }

    })
    let mailoption={
        from:process.env.MAIL_ID,
        to:option.email,
        subject:option.subject,
        html:option.html
    }
    await  transport.sendMail(mailoption)
}
module.exports=sendMail