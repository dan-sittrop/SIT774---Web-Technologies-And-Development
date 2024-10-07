const express = require('express');
const morgan = require('morgan');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware setup
app.use(morgan('common'));
app.use(express.urlencoded({ extended: false }));

// SQLite database setup
const dbPath = path.join(__dirname, 'db', 'myMembersDB');
let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the SQLite database:', err.message);
        throw new Error('ERROR IN CONNECTING TO DB');
    }
    console.log('Connected to the SQLite Database.');
});

// Delete all records from the Members table
db.run("DELETE FROM Members");

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Route to render the form
app.get('/', (req, res, next) => {
    res.render('index', { title: 'dkin Cap Membership' });
});


app.get('/members', (req, res, next) => {
    const sql = "SELECT * FROM Members";  // SQL query to get all members

    // Run the query
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error retrieving data from the database:', err.message);
            const errorStatus = err.status || 500;
            return res.status(errorStatus).send(`ERROR(${errorStatus}): ${err.toString()}`);
        }

        // Render the 'members' view, passing the members data
        res.render('members', {
            title: 'List of Members',
            members: rows  // Pass the rows (members data) to the view
        });
    });
});

// Route to handle form submission
app.post('/submitmembership', (req, res, next) => {
    const { firstname: fname, surname: lname, email, mobileNumber: mobile, inputNumCaps: caps, capstyle: style, comments } = req.body;

    // Initialize an array to hold validation error messages
    let errorList = [];

    // Regular expressions for validating email and mobile formats
    const emailRegex = /^[a-zA-Z0-9._%+-]+@deakin\.edu\.au$/;
    const mobileRegex = /^[0-9]{10}$/;

    // Helper function to check for empty or undefined fields
    const checkEmpty = (value, field, message) => {
        if (!value) {
            errorList.push({ message, field });
        }
    };

    // Validate form fields
    checkEmpty(fname, 'firstname', 'Missing First Name?');
    checkEmpty(lname, 'surname', 'Missing Surname?');
    checkEmpty(caps, 'inputNumCaps', 'Number of Caps not selected?');
    checkEmpty(style, 'capstyle', 'Cap Style not selected?');
    checkEmpty(comments, 'comments', 'Missing Comment?');

    // Validate email and mobile using regex patterns
    if (!emailRegex.test(email)) {
        errorList.push({ message: 'Missing or Invalid Email?', field: 'email' });
    }

    if (!mobileRegex.test(mobile)) {
        errorList.push({ message: 'Missing or Invalid Mobile?', field: 'mobile' });
    }

    // If there are validation errors, render the 'invalid-form' template
    if (errorList.length > 0) {
        return res.render('invalid-form', {
            title: 'Incorrect Input',
            errorList
        });
    }

    // If no validation errors, insert data into the database
    db.serialize(() => {
        db.run("CREATE TABLE IF NOT EXISTS Members (id INTEGER PRIMARY KEY AUTOINCREMENT, fname TEXT, lname TEXT, email TEXT, mobile TEXT, caps TEXT, style TEXT, comments TEXT)");

        const sql = `INSERT INTO Members (fname, lname, email, mobile, caps, style, comments) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, [fname, lname, email, mobile, caps, style, comments], function (err) {
            if (err) {
                console.error('Error inserting data into Members table:', err.message);
                return res.status(500).send('Failed to add member.');
            }

            // Render the 'thankyou' template after successful insertion
            res.render('thankyou', {
                title: 'Form Submitted',
                fname: fname,
                lname: lname,
                email: email,
                mobile: mobile,
                caps: caps,
                style: style,
                comments: comments
            });
        });
    });
});

// 404 Error Handler
app.use((req, res, next) => {
    res.status(404).send('<h3>404 Error</h3><p>Sorry, the resource you are looking for was not found.</p>');
});

// 500 Error Handler - Server Error
app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    res.status(errorStatus).send(`ERROR(${errorStatus}): ${err.toString()}`);
});

// Start the server
app.listen(port, () => {
    console.log(`Web server running at: http://localhost:${port}`);
    console.log('Type Ctrl+C to shut down the web server');
});
