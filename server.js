const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extender: true}));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mumbai@3010',
    database: 'ram_charity_db'
});

db.connect((err) => {
    if(err) {
        console.error('Error connecting  to Server:', err);
        return;
    }
    console.log('Connected to MySQL Database.');
});

app.post('/api/donate', (req, res) => {
    const{first_name, last_name, phone, email, address} = req.body;

    const sql = "INSERT INTO ram_charity_db (first_name, last_name, phone, email, address) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [first_name, last_name, phone, email, address], (err, result) => {
        if(err) {
            console.error(err);
            return res.status(500).json({error: "Database Error"});
        }
        res.status(200).json({message: "Data saved successfully", id: result.insertId});
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});