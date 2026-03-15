import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientSecret: process.env.CLIENT_SECRET,
        clientId: process.env.CLIENT_ID,
        refreshToken: process.env.REFRESH_TOKEN
    }
});


// Verification logic
transporter.verify()
    .then(() => { console.log("Email transporter is ready to send emails"); })
    .catch((err) => { console.error("Email transporter verification failed:", err); });

export async function sendEmail(to, subject, html, text) {
    const mailoptions = {
        from: process.env.EMAIL_USER,
        to: to,  
        subject: subject,
        html: html,
        text: text
    };
    
    // Correct method is sendMail
    const details = await transporter.sendMail(mailoptions); 
    console.log("Email sent:", details);
}