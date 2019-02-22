var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs");

// 서버가 읽을 수 있도록 HTML의 위치를 정의
app.set('views', __dirname + '/views');

// 서버가 HTML 렌더링을 할 때, EJS엔진을 사용하도록 설정.
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(3000, function() {
    console.log("Express server has started on port 3000");
})

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({
    // secret : 쿠키를 임의로 변조하는 것을 방지하기 위한 sign 값. 원하는 값을 넣으면 //#endregion
    secret: '@#@$MYSIGN#@$#$',
    // resave : 세션을 언제나 저장할 지(변경되지 않아도)정하는 값. 
    // express-session documentation에서는 이 값을 false로 하는 것을 권장하고 필요에 따라 true로 설정
    resave: false,
    // saveUninitialized - uninitialized 세션이란 새로 생겼지만 변경되지 않은 세션.
    // Documentation에서 이 값을 true로 설정하는 것을 권정.
    saveUninitialized: true
}));

// SQLite 적용
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('expressDB.db');



var router = require("./router/main") (app, fs, db);

// 템플릿 엔진 : 템플릿을 읽어 엔진의 문법과 설정에 따라 파일을 HTML 형식으로 변환시키는 모듈
// EJS 템플릿 엔진
// 1. <%자바스크립트 코드%>
// 2. <%출력할 자바스크립트 객체%> -> router에서 받아올 수도 있음.