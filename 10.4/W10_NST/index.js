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


// Define a specific /contact route
app.get('/contact', (req, res) => {
  // Render the 'contact' view with all the necessary data
  const { event, date, category } = req.query;

  // Set a default value for titlePublication
  let titlePublication = 'Contact Form';

  if (category === 'publications') {
    titlePublication = 'Download Article';
  }
  else if(category === 'membership') {
    titlePublication = 'Submit Membership Request';
  }
  else if (category === 'events') {
    titlePublication = 'Event Registration Request';
  }

  res.render('contact', {
      title: 'Contact',
      username: req.session.username || null,
      email: req.session.email || null,
      message: event || null,
      date: date || null,
      category: category || null,
      titlePublication // Dynamic variable from query string
  });
});


// Generalized route handler for rendering common pages
const renderPage = (page, title) => {
  return (req, res) => {
    res.render(page, {
      title: title,
      username: req.session.username || null,
      email: req.session.email || null,
      articleTitle: req.query.variable || null
    });
  };
};

// Routes for different pages
app.get('/home', renderPage('home', 'Home'));
app.get('/membership', renderPage('membership', 'Membership'));
app.get('/events', renderPage('events', 'Events'));
app.get('/blog', renderPage('blog', 'Blog'));


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

app.post('/register', (req, res) => {
  const date1 = req.query.date1; // Access `date1` from query parameters
  const event1 = req.query.event1;
  const misc = req.query.misc;
  const category = req.query.category;
  const username = req.session.username;

  // Your database insertion logic here...
  db.run(`INSERT INTO Metadata (username, category, date, description, misc) VALUES (?, ?, ?, ?, ?)`, [username, category, date1, event1, misc], function (err) {
    if (err) {
      console.error('Error inserting article content into database:', err.message);
      res.status(500).json({ error: 'Failed to save article content' });
    } else {
      console.log('Article content saved with ID:', this.lastID);
      console.log(event1, date1); // Log both values
    }
  });

  // Fetch and display all records from the Metadata table
  db.all(`SELECT * FROM Metadata`, (err, rows) => {
    if (err) {
      console.error('Error fetching metadata from database:', err.message);
    } else {
      console.log('All Metadata:', rows);
    }
  });

  // Redirect based on hidden field
  res.redirect(`/contact?event=${encodeURIComponent(event1)}&date=${encodeURIComponent(date1)}&category=${encodeURIComponent(category)}&misc=${encodeURIComponent(misc)}`);
});


app.get('/user-metadata', (req, res) => {
  const username = req.session.username; // Retrieve the username from the session
  const category = req.query.category || 'events'; // Get category from the query parameter, default to 'events' if not provided

  // Query to filter by username and category
  db.all(`SELECT * FROM Metadata WHERE username = ? AND category = ?`, [username, category], (err, rows) => {
      if (err) {
          console.error('Error retrieving metadata:', err.message);
          res.status(500).json({ error: 'Server error' });
      } else {
          // Return the rows as JSON
          res.json(rows);
      }
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Web server running at: http://localhost:${port}`);
  console.log(`Type Ctrl+C to shut down the web server`);
});
