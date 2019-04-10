var _express =  require("express");
var app = _express();
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');

///////////  START - use of Callback function ///////////
var fs = require('fs');
var data = fs.readFileSync('TEST.txt');

console.log(data.toString());
console.log('Blocking code called end');

fs.readFile('TEST.txt',function(err,data){
    if(err)
        return console.log(err);
     console.log(data.toString());
});
console.log('Non-Blocking code called end');
///////////  END - use of Callback function ///////////



var masterController = require('./Controller/MasterController')();

app.set('port',process.env.port||4300);
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

//app.use(bodyParser.urlencoded({ extended: true }));

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

app.use('/api/users',masterController);

app.get("/api/product",function(request,response)
{
    response.json({"Message":"Welcome to Node js"});
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listning on port '+app.get('port'));
});


