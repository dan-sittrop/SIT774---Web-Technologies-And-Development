const sqlite3 = require('sqlite3').verbose();

// Open the database
let db = new sqlite3.Database('contactFormDB', (err) => {
    if (err) {
        console.error('Error opening the database:', err.message);
        return;
    }
    console.log('Connected to the SQLite Database.');
});

// Perform the SELECT operation
console.log('Display all DB content from all rows');

db.each('SELECT * FROM Users', function(err, row) {
    if (err) {
        console.log(err.message);
        return;
    }

    console.log(`[all] (${row.id}) Name: ${row.fname} ${row.lname}, Email: ${row.email}, Mobile: ${row.mobile}, Favourite: ${row.category}, Comment: ${row.comments}`);
}, function(err, count) {
    // This callback is called after all rows are processed
    if (err) {
        console.error(err.message);
    }
    console.log(`Processed ${count} rows`);

    // Close the database connection after all rows are processed
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            console.log('Closed the database connection.');
        }
    });
});
