let sqlite3 = require('sqlite3').verbose();
// file database
let db = new sqlite3.Database('myMembersDB');

// Insert a new member into the Members table
let sql = `INSERT INTO Members (fname, sname, email, numcaps, favourite, comment) 
           VALUES (?, ?, ?, ?, ?, ?)`;

let newMember = ['John', 'Doe', 'john.doe@example.com', '10', 'Beret', 'Loves wearing berets'];

// Run the SQL query to insert the new member
db.run(sql, newMember, function(err) {
    if (err) {
        return console.error('Error inserting data:', err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing the database:', err.message);
    }
    console.log('Closed the database connection.');
});
