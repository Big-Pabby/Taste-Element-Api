const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001

app.use(bodyParser.json());
app.use(cors());

const db = knex({
    client: 'pg',
    connection: {
        connectionString : process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
        // host : '127.0.0.1',
        // user : 'postgres',
        // password : '',
        // database : 'Taste-Element-Database'
    }
});

app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await db.select('*').from('users').where('email', '=', email);
        if(user) {
            const isValid = await bcrypt.compare(password, user[0].hashpassword);
            if(isValid) {
                const {hashpassword, ...data} = await user[0]
                res.status(200).json(data)
            } else {
                res.status(400).json('Invalid Email or Password')
            }
        }
    } catch {
        res.status(500).json('Invalid Email or Password')
    }
})

app.post('/register', async (req, res) => {
    try {
        const {name, email, password,} = req.body;
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(salt)
        console.log(hashedPassword)
        await db('users').insert({
            username: name,
            email: email,
            hashpassword: hashedPassword,
            joined: new Date().toDateString()
        }).returning('*').then(user => {
            res.status(200).json("Registration was successful")
        }).catch(err => {
            console.log(err)
            res.status(400).json("Registration failed email already exist")
        })
    } catch {
        res.status(500).send()
    }
})

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`);
})