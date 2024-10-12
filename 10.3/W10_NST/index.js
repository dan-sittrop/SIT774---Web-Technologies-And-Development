const express = require('express');
const morgan = require('morgan');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const app = express();
const port = 3000;

// Middleware setup
app.use(morgan('common'));
app.use(express.urlencoded({ extended: false }));

// Session setup (before defining routes)
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if using HTTPS
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from the `public_html` directory
app.use(express.static('public_html'));

// SQLite database setup
const dbPath = path.join(__dirname, 'db', 'contactFormDB');
let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the SQLite database:', err.message);
    throw new Error('ERROR IN CONNECTING TO DB');
  }
  console.log('Connected to the SQLite Database.');
});

// Helper function to validate required fields
const validateFields = (fields) => {
  for (const field in fields) {
    if (!fields[field]) {
      return `${field} is required.`;
    }
  }
  return null;
};

// Generalized route handler for rendering common pages
const renderPage = (page, title) => {
  return (req, res) => {
    res.render(page, {
      title: title,
      username: req.session.username || null,
      email: req.session.email || null
    });
  };
};

// Routes for different pages
app.get('/home', renderPage('home', 'Home'));
app.get('/membership', renderPage('membership', 'Membership'));
app.get('/events', renderPage('events', 'Events'));
app.get('/blog', renderPage('blog', 'Blog'));
app.get('/contact', renderPage('contact', 'Contact'));

// Route to the login page
app.get('/login', renderPage('login', 'Login Page'));

// Route to the sign-up page
app.get('/signup', renderPage('signup', 'Sign Up'));

// Route to handle login form submission (POST)
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM Users WHERE email = ?`;
  db.get(sql, [email], (err, user) => {
    if (err) {
      return res.render('error', { message: 'Server error. Please try again.' });
    }

    if (!user) {
      return res.render('error', { message: 'No user found with that email.' });
    }

    // Compare the provided password with the stored password
    if (password === user.password) {
      // Store username in session
      req.session.username = user.username;
      req.session.email = user.email;

      return res.redirect('/home');
    } else {
      return res.render('error', { message: 'Incorrect password.' });
    }
  });
});

// Route to handle signup form submission (POST)
app.post('/signup', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  const errorMessage = validateFields({ username, email, password, confirmPassword });
  if (errorMessage) {
    return res.status(400).send(errorMessage);
  }

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match.');
  }

  // Insert user into the database
  const sql = `INSERT INTO Users (username, email, password) VALUES (?, ?, ?)`;

  db.run(sql, [username, email, password], function (err) {
    if (err) {
      console.error('Error inserting user into database:', err.message);
      return res.status(500).send('Failed to sign up user.');
    }

    // Redirect to login page after successful sign-up
    return res.redirect('/login');
  });
});

// Route to handle contact form submission (POST)
app.post('/contact', (req, res) => {
  const { fname, lname, email, mobile, category, comments } = req.body;

  const errorMessage = validateFields({ fname, lname, email, mobile, category, comments });
  if (errorMessage) {
    return res.status(400).send(errorMessage);
  }

  const sql = `INSERT INTO Contact (fname, lname, email, mobile, category, comments) VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [fname, lname, email, mobile, category, comments], function (err) {
    if (err) {
      console.error('Error inserting data into Contact table:', err.message);
      return res.status(500).send('Failed to add contact.');
    }

    // Render a thank-you page after successful contact form submission
    return res.render('contactSubmit', {
      title: 'Form Submitted',
      fname,
      lname,
      email,
      mobile,
      category,
      comments,
      username: req.session.username || null
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log(`Type Ctrl+C to shut down the web server`);
});
