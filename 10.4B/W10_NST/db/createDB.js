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
  // Drop Users table if it exists
  db.run(`DROP TABLE IF EXISTS Users`, (err) => {
    if (err) {
      console.error('Error dropping Users table:', err.message);
    } else {
      console.log('Users table dropped (if existed).');

      // Create Users table
      db.run(`CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL
      );`, (err) => {
        if (err) {
          console.error('Error creating Users table:', err.message);
        } else {
          console.log('Users table created.');
        }
      });
    }
  });

  // Drop Contact table if it exists
  db.run(`DROP TABLE IF EXISTS Contact`, (err) => {
    if (err) {
      console.error('Error dropping Contact table:', err.message);
    } else {
      console.log('Contact table dropped (if existed).');

      // Create Contact table
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
          console.log('Contact table created.');
        }
      });
    }
  });

  // Drop Metadata table if it exists
  db.run(`DROP TABLE IF EXISTS Metadata`, (err) => {
    if (err) {
      console.error('Error dropping Metadata table:', err.message);
    } else {
      console.log('Metadata table dropped (if existed).');

      // Create Metadata table
      db.run(`CREATE TABLE IF NOT EXISTS Metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        category TEXT,
        date TEXT,
        description TEXT,
        misc TEXT
      );`, (err) => {
        if (err) {
          console.error('Error creating Metadata table:', err.message);
        } else {
          console.log('Metadata table created.');
        }

        // Close the database connection inside the last callback
        db.close((err) => {
          if (err) {
            console.error('Error closing the database:', err.message);
          }
          console.log('Database connection closed.');
        });
      });
    }
  });
});
