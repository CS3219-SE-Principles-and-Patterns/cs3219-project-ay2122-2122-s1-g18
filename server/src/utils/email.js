const nodemailer = require('nodemailer')

const sendEmail = (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.GMAIL_HOST,
      service: process.env.GMAIL_SERVICE,
      port: 587,
      secure: true,
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
      }
    })
    transporter.sendMail({
      from: process.env.GMAIL_USERNAME,
      to: email,
      subject: subject,
      text: text
    }).then(() => {
      console.info('Success: Verification Email Sent')
    }
    ).catch(() => {
      console.error('Failure: Verification Email Failed To Send')
    })
  } catch (err) {
    console.error('Failure: Verification Email Failed To Send')
    console.error(err)
  }
}

module.exports = sendEmail
