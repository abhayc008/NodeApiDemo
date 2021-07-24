var express = require("express");
var exphbs = require("express-handlebars");
var cors = require("cors");
var path = require("path");
var mongoose = require("mongoose");
var Role = require("./app/models/role.model");
var apiResponse = require("./app/helpers/apiResponse")
var appSettings = require("./app/config/auth.config");
var apiRoute = require("./app/routes/api/auth");



var app = express();

var corsOptions = {
    origin:"*",
};

// cors.apply();
app.use(cors(corsOptions));
app.use(express.json());  /* bodyParser.json() is deprecated */
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

const mongo_uri = appSettings.mongoUrl;

mongoose.connect(mongo_uri, { 
    // useNewUrlParser: true, 
    // useUnifiedTopology: true 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,

}).then(() => {
	//don't show the log when it is test
	
		console.log("Connected to %s", mongo_uri);
		console.log("App is running ... \n");
		console.log("Press CTRL + C to stop the process. \n");
	
})
	.catch(err => {
		console.error("App starting error:", err.message);
		process.exit(1);
	});
var db = mongoose.connection;

function initial() {
    Role.estimatedDocumentCount((err, count) => {
      if (!err && count === 0) {
        new Role({
          name: "user"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'user' to roles collection");
        });
  
        new Role({
          name: "moderator"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'moderator' to roles collection");
        });
  
        new Role({
          name: "admin"
        }).save(err => {
          if (err) {
            console.log("error", err);
          }
  
          console.log("added 'admin' to roles collection");
        });
      }
    });
  }

  initial();


app.set("views",path.join(__dirname,"/app/views/"));
app.engine('hbs', exphbs({ extname:"hbs",defaultLayout:"mainLayout" , layoutsDir:__dirname+"/app/views/layouts/" }));
app.set("view engine","hbs");

app.use(express.static(path.join(__dirname,"app/public")));

app.get('/',function (req, res) {
    res.render('pages/home')
    });

app.get('/api/login',function (req, res) {
    // res.render('pages/login',{layout: false})
    res.render('pages/login')
    });   

    app.get('/api/register',function (req, res) {
        res.render('pages/register')
        });     

app.use("/abc",(req,res)=>{
     res.json({ message: "Test Abc",Name:"abc" });
} );

app.use("/api/",apiRoute);

app.all("*",(req,res) =>{
    return apiResponse.notFoundResponse(res,"Page not found");
});

app.use((err,req,res) => {
    if(err.name == "UnauthorizedError")
    {
        return apiResponse.unauthorizedResponse(res, err.message);
    }
 
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {

  console.log(`Server is running on port ${PORT}.`);
});

