// const express = require('express')
// const app = express()
// const PORT = 4000


// app.get('/home', (req, res) => {
//   res.status(200).json('Welcome, your app is working well');
// })


// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

// // Export the Express API
// module.exports = app


const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const PORT = 4000

const app = express();
app.use(cors());
app.use(bodyParser.json());

require('dotenv').config();

// Define the path for the uploads directory
// const uploadDir = path.join(__dirname, 'uploads');

// Check if the directory exists, and if not, create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp'); // Use the temporary directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
const uploadDir = path.join('/tmp', 'uploads');
// Configure your Hostinger SMTP credentials here
// const transporter = nodemailer.createTransport({
//     host: 'smtp.hostinger.com',
//     port: 465,
//     secure: true,
//     auth: {
//         user: 'career@spotcommglobal.com',
//         pass: 'Career123456789.'
//     }
// });
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
 
    },
});
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP error:', error);
    } else {
        console.log('SMTP connection verified:', success);
    }
});
app.get('/home', (req, res) => {
    res.status(200).json('Welcome, your app is working well');
})

app.post('/send-email', upload.single('cv'), (req, res) => {
    const { fullName, email, contact, jobTitle, linkedIn } = req.body;
    const cv = req.file;

    console.log('Request body:', req.body);
    console.log('File uploaded:', req.file);

    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).send('No file uploaded');
    }

    const mailOptions = {
        from: 'career@spotcommglobal.com',
        to: 'career@spotcommglobal.com',
        subject: `New Job Application for ${jobTitle || 'Job Position'}`,
        text: `
            Full Name: ${fullName || 'Not provided'}
            Email: ${email || 'Not provided'}
            Contact: ${contact || 'Not provided'}
             LinkedIn: ${linkedIn || 'Not provided'}
            Job Applied: ${jobTitle || 'Not specified'}
            CV: Attached file
        `,
        attachments: [
            {
                filename: cv.originalname,
                path: cv.path,  // Access the file's path directly from multer's output
            },
        ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).send('Error sending email');
        }
        res.status(200).send('Email sent successfully');
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Export the Express API
module.exports = app