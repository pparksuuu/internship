module.exports = function(app, fs, db) 
{
// SQLite
// To test, open this URL in your browser:
//   http://localhost:3000/users
app.get('/users', function (req, res) {
    db.all('SELECT * FROM test_db', (err, rows) => {
        // console.log(rows);
        const allUsernames = rows.map(e => e.name);
        // console.log(allUsernames);
        res.send(allUsernames); // Client에게 이름 보내줌
    });
});

// GET profile data for a user
// 
app.get('/users/:userid', function(req,res) {
    const nameToLookup = req.params.userid; // matches ':userid' above

    db.all(
        //SQL query
        'SELECT * FROM test_db WHERE name=$name',
        // parameters to pass into SQL query:
        {
            $name: nameToLookup
        },
        // callback function to run when the quert finishes:
        (err, rows) =>  {
            console.log(rows);
            if (rows.length > 0) {
                res.send(rows[0]);
            } else {
                res.send({}); //failed,
            }
        }
    );
});

    app.get('/', function (req,res) {
        var sess = req.session;
        
        res.render('index', {
            // JSON데이터를 render 메소드의 두번째 인자로 전달함으로서 페이지에서 데이터 사용 가능
            title: "MY HOMEPAGE",
            length: 5,
            name: sess.name,
            username: sess.username
        })
    });

    app.get("/list", function (req,res) {
        fs.readFile(__dirname + "/../data/" + "user.json", 'utf8', function (err, data) {
            console.log(data);
            res.end(data);
        });
    });

    app.get('/getUser/:username', function(req,res) {
        fs.readFile(__dirname + "/../data/user.json", 'utf8', function (err, data) {
           var users = JSON.parse(data);
           res.json(users[req.params.username]); 
        });
    });

    app.post('/addUser/:username', function(req, res) {
        var result = {  };
        var username = req.params.username;

        // CHECK REQ VALIDITY
        if (!req.body["password"] || !req.body["name"]) {
            result["success"] = 0;
            result["error"] = "invalid request";
            res.json(result);
            return;
        } 

        // LOAD DATA & CHECK DUPLICATION
        fs.readFile(__dirname + "/../data/user.json", 'utf8', function (err, data) {
            var users = JSON.parse(data);
            if (users[username]) {
                //DUPLICATION FOUND
                result["success"] = 0;
                result["error"] = "duplicate";
                res.json(result);
                return;
            }

            // ADD TO DATA
            users[username] = req.body;

            // SAVE DATA
            fs.writeFile(__dirname + "/../data/user.json",
                JSON.stringify(users, null, '\t'), "utf8", function(err, data) {
                    result = {"success": 1};
                    res.json(result);
                })
        })
    });

    app.put('/updateUser/:username', function(req,res) {
        var result = {  };
        var username = req.params.username;

        //CHECK REQ BALIDITY
        if(!req.body["password"] || !req.body["name"]) {
            result["success"] = 0;
            result["error"] = "invalid request";
            res.json(result);
            return;
        }

        //LOAD DATA
        fs.readFile(__dirname + "/../data/user.json", 'utf8', function(err, data) {
            var users = JSON.parse(data);
            // ADD MODIFY DATA
            users[username] = req.body;

            // SAVE DATA
            fs.writeFile(__dirname + "/../data/user.json",
                JSON.stringify(users, null, '\t'), "utf8", function(err, data) {
                    result = {"success" : 1};
                    res.json(result);
                }
            )
        })
    });

    app.delete('/deleteUser/:username', function(req,res) {
       var result = {  };
       //LOAD DATA
       fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data) {
           var users = JSON.parse(data);

           // IF NOT FOUND
           if(!users[req.params.username]) {
               result["success"] = 0;
               result["error"] = "not found";
               res.json(result);
               return;
           }

           delete users[req.params.username];
           fs.writeFile(__dirname + "/../data/user.json" ,
            JSON.stringify(users, null, '\t'), "utf8", function(err, data) {
                result["success"] = 1;
                res.json(result);
                return;
            })
       }) 
    });

    // LOGIN API
    app.get('/login/:username/:password', function(req,res) {
        var sess;
        sess = req.session;

        fs.readFile(__dirname + "/../data/user.json", "utf8", function (err, data) {
            var users = JSON.parse(data);
            var username = req.params.username;
            var password = req.params.password;
            var result = {};
            if (!users[username]) {
                // USERNAME NOT FOUND
                result["success"] = 0;
                result["error"] = "not found";
                res.json(result);
                return;
            }

            if (users[username]["password"] == password) {
                result["success"] = 1;
                sess.username = username;
                sess.name = users[username]["name"];
                res.json(result);
            } else {
                result["success"] = 0;
                result["error"] = "incorrect";
                res.json(result);
            }
        }) 
    });

    // LOGOUT API
    app.get('/logout', function(req, res) {
        sess = req.session;
        if (sess.username) {
            req.session.destroy(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/');
                }
            })
        } else {
            res.redirect('/');
        }
    })
}