// require('dotenv').config();
// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// // const bodyParser = require('body-parser');
// const PORT = process.env.PORT;
// const app = express();
// const nodemailer = require('nodemailer');

// app.use(express.json());
// app.use((req, res, next) => {
//     console.log('Received request:', req.method, req.url, req.body);
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });
// // app.use(cors());
// // app.use(bodyParser.json());
// // app.use(bodyParser.urlencoded({extender: true}));
// // ALTER TABLE `ram_charity_db`.`ram_charity_db` 
// // RENAME TO  `ram_charity_db`.`donation_data` ;
// const db = mysql.createConnection({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_NAME
// });

// db.connect((err) => {
//     if(err) {
//         console.error('Error connecting  to Server:', err);
//         return;
//     }
//     console.log('Connected to MySQL Database.');
// });

// const transporter = nodemailer.createTransport({
//     service:'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//     }
// });


// app.post('/api/donate', (req, res) => {
//     const{firstName, lastName, phone, email, address} = req.body;
//     console.log('Form submitted!', req.body);
//     const sql = "INSERT INTO donation_data (first_name, last_name, phone_number, email, address) VALUES (?, ?, ?, ?, ?)";

//     db.query(sql, [firstName, lastName, phone, email, address], (err, result) => {
//         if(err) {
//             console.error(err);
//             return res.status(500).json({error: "Database Error"});
//               }

//         // console.log('Data saved to DB. Sending email...');
//         const idForUpdate = result.insertId; 
//         console.log('Data saved to DB with ID:', idForUpdate);

//         // 4. Define Email Options INSIDE the callback so it has access to the data
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: process.env.NOTIFICATION_EMAIL,
//             subject: `New Donation from ${firstName} ${lastName}`,
//             html: `
//                 <h3>New Donation Details Received</h3>
//                 <p><strong>Name:</strong> ${firstName} ${lastName}</p>
//                 <p><strong>Email:</strong> ${email}</p>
//                 <p><strong>Phone:</strong> ${phone}</p>
//                 <p><strong>Address:</strong> ${address}</p>
//                 <br>
//                 <p>This entry has been saved to the database (ID: ${result.insertId}).</p>
//             `
//         };

//         // 5. Send the mail
//        transporter.sendMail(mailOptions, (mailError, info) => {
//             if (mailError) {
//                 console.error('Email failed to send:', mailError);
//                 // We send a success response because data IS in the DB, even if email failed
//                 return res.status(200).json({ 
//                     message: "Data saved, but email failed to send", 
//                     id: idForUpdate,
//                     emailSent: 'False'
//                 });
//             }

//             console.log('Email sent successfully:', info.response);

//             // 6. Update the record to 'True' because email was sent
//             const sqlUpdate = "UPDATE donation_data SET is_email_sent = 'True' WHERE id = ?";
            
//             db.query(sqlUpdate, [idForUpdate], (updateErr) => {
//                 if (updateErr) {
//                     console.error('Failed to update email status:', updateErr);
//                 }
                
//                 res.status(200).json({ 
//                     message: "Data saved and email sent successfully", 
//                     id: idForUpdate,
//                     emailSent: 'True'
//                 });
//             });
//         });
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Server running on port: ${PORT}`);
// });

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Required for Vercel to talk to Render

const PORT = process.env.PORT || 3000;
const app = express();

// 1. Middleware
app.use(express.json());

// Enable CORS so your Vercel frontend can talk to this Render backend
app.use(cors({
    origin: '*', // In production, you can replace '*' with your actual Vercel URL
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware for debugging in Render
app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to ${req.url}`);
    next();
});

// 2. Database Connection (Updated for Aiven Cloud)
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    // Convert port to Number (Aiven usually uses 24536 or similar)
    port: Number(process.env.DATABASE_PORT), 
    // CRITICAL: Aiven requires SSL
    ssl: {
        rejectUnauthorized: false 
    },
    // Keep-alive settings to prevent "Connection Closed" errors
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

db.connect((err) => {
    if (err) {
        console.error('CRITICAL: Database connection failed:', err.message);
        return;
    }
    console.log('SUCCESS: Connected to Aiven Cloud Database (defaultdb).');
});

// 3. Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Ensure this is your 16-digit App Password
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000
});

// 4. Donation API Route
app.post('/api/donate', (req, res) => {
    const { firstName, lastName, phone, email, address } = req.body;
    
    console.log(`Processing donation for: ${firstName} ${lastName}`);

    const sqlInsert = "INSERT INTO donation_data (first_name, last_name, phone_number, email, address) VALUES (?, ?, ?, ?, ?)";

    db.query(sqlInsert, [firstName, lastName, phone, email, address], (err, result) => {
        if (err) {
            console.error("Database Insert Error:", err.message);
            return res.status(500).json({ success: false, error: "Database Error" });
        }

        const idForUpdate = result.insertId;
        console.log(`Data saved to DB. ID: ${idForUpdate}. Sending email...`);

        // Prepare Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL,
            subject: `New Donation from ${firstName} ${lastName}`,
            html: `
                <h3>New Donation Details Received</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Address:</strong> ${address}</p>
                <br>
                <p>This entry has been saved to the database (ID: ${idForUpdate}).</p>
            `
        };

        // Send Email
        transporter.sendMail(mailOptions, (mailError, info) => {
            if (mailError) {
                console.error('Email failed to send:', mailError.message);
                // Return success anyway since DB is updated, but notify UI email failed
                return res.status(200).json({ 
                    success: true,
                    message: "Data saved, but email failed", 
                    id: idForUpdate,
                    emailSent: 'False'
                });
            }

            console.log('Email sent successfully. Updating DB status...');

            // Update status to 'True'
            const sqlUpdate = "UPDATE donation_data SET is_email_sent = 'True' WHERE id = ?";
            
            db.query(sqlUpdate, [idForUpdate], (updateErr) => {
                if (updateErr) {
                    console.error('Failed to update email status in DB:', updateErr.message);
                } else {
                    console.log(`DB Status updated to 'True' for ID: ${idForUpdate}`);
                }
                
                res.status(200).json({ 
                    success: true,
                    message: "Data saved and email sent successfully", 
                    id: idForUpdate,
                    emailSent: 'True'
                });
            });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is live on port: ${PORT}`);
});