const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open the SQLite database
const dbPath = path.join(__dirname, 'contactFormDB');
let db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to the SQLite database:', err.message);
    throw new Error('ERROR IN CONNECTING TO DB');
  }
  console.log('Connected to the SQLite Database.');
});

// Function to create the required tables
db.serialize(() => {
  // Create Users table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
  );`, (err) => {
    if (err) {
      console.error('Error creating Users table:', err.message);
    } else {
      console.log('Users table created or already exists.');
    }
  });

  // Create Contact table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS Contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fname TEXT,
    lname TEXT,
    email TEXT,
    mobile TEXT,
    category TEXT,
    comments TEXT
  );`, (err) => {
    if (err) {
      console.error('Error creating Contact table:', err.message);
    } else {
      console.log('Contact table created or already exists.');
    }
  });
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing the database:', err.message);
  }
  console.log('Database connection closed.');
});
