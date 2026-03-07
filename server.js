require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
// const cors = require('cors');
// const bodyParser = require('body-parser');
const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    console.log('Received request:', req.method, req.url, req.body);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extender: true}));
// ALTER TABLE `ram_charity_db`.`ram_charity_db` 
// RENAME TO  `ram_charity_db`.`donation_data` ;
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

db.connect((err) => {
    if(err) {
        console.error('Error connecting  to Server:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
});

app.post('/api/donate', (req, res) => {
    const{firstName, lastName, phone, email, address} = req.body;
    console.log('Form submitted!', req.body);
    const sql = "INSERT INTO donation_data (first_name, last_name, phone_number, email, address) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [firstName, lastName, phone, email, address], (err, result) => {
        if(err) {
            console.error(err);
            return res.status(500).json({error: "Database Error"});
        }
        res.status(200).json({message: "Data saved successfully", id: result.insertId});
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});