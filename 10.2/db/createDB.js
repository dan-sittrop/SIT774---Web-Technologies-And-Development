let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('myMembersDB'); // File Database

db.serialize(function() {
    // Create the Members table if it doesn't already exist
    db.run("CREATE TABLE IF NOT EXISTS Members (id INTEGER PRIMARY KEY AUTOINCREMENT, fname TEXT, lname TEXT, email TEXT, mobile TEXT, caps TEXT, style TEXT, comments TEXT)");

    // Delete all records from the Members table
    db.run("DELETE FROM Members");
}); 

db.close((err) => {
    if (err) {
        console.error('Error closing the database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});



/*
// Or you can select 'specific' fields from a data row
console.log("Display only the name and option fields from all rows of the DB");
db.each("SELECT name, option FROM User", function(err, row) {
    console.log("[subset] Name: " + row.name + "   Option: " + row.option);
});
*/
