var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('expressDB.db');

db.serialize(function() {
    // create a new database table :
    db.run("CREATE TABLE test_db (name TEXT, password TEXT)");

    // insert 3 rows of data:
    db.run("INSERT INTO test_db VALUES('suhyeon', '1234')");
    db.run("INSERT INTO test_db VALUES('suhyeon2', '12345')");
    db.run("INSERT INTO test_db VALUES('suhyeon3', '123456')");

    console.log('successfully created the test_db table in expressDB.db');

    // print then out to confirm their contents:
    db.each("SELECT * FROM test_db", (err, row) => {
        console.log(row.name + " : " + row.password);
    });
});

db.close();