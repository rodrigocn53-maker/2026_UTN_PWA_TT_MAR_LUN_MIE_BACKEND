import nodemailer from 'nodemailer'
import ENVIRONMENT from './environment.config.js'

const mailerTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: ENVIRONMENT.MAIL_USER,
        pass: ENVIRONMENT.MAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
})

export default mailerTransporter