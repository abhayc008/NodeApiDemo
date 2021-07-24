const UserModel  =  require("../models/user.model");
const config =  require("../config/auth.config");
const Role  = require("../models/role.model");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const emailer =  require("../helpers/nodeMailer");

exports.register=[
    // Validate fields.
            body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
            .isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
            body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
                .isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
            body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
                .isEmail().withMessage("Email must be a valid email address.").custom((value) => {
                    return UserModel.findOne({email : value}).then((user) => {
                        if (user) {
                            return Promise.reject("E-mail already in use");
                        }
                    });
                }),
            body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater.")
            .matches(/\d/).withMessage('must contain a number'),
    
    // Sanitize fields.
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),          
     
    // Process request after validation and sanitization.

    (req,res) => {
        try{
            // Extract the validation errors from a request.
			const errors = validationResult(req);

            if(!errors.isEmpty()){
                // Display sanitized values/errors messages.
				//return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                console.log(errors);
                console.log(errors.array());
                res.render('pages/register',{user:req.body, errors : errors.array()});
            }
            else{

                //hash input password
				bcrypt.hash(req.body.password,config.salt,function(err, hash) {
					// generate OTP for confirmation
					let otp = utility.randomNumber(4);
					// Create User object with escaped and trimmed data
					var user = new UserModel(
						{
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							email: req.body.email,
							password: hash,
							confirmOTP: otp
						}
					);
                    


                    // Save user.
                    console.log(req.body);
                    console.log(user);
                    user.save(function (err) {
                            console.log(err);
							if (err) { 
                                console.log("Save Err >" + err);
                                res.render('pages/register',{user:req.body, errors : [{msg:err.Message}]});
                                return;
                            }

                            Role.findOne({ name: "user" }, (err, role) => {
                                if (err) {
                                    res.render('pages/register',{user:req.body, errors : [{msg:err.Message}]});
                                  return;
                                }
                        
                                user.role = [role._id];
                                user.save(err => {
                                  if (err) {
                                    res.render('pages/register',{user:req.body, errors : [{msg:err.Message}]});
                                    return;
                                  }
                                  
                                  emailer.sendEmail(user.email,"OTP for login","Hi, OTP for login is " + user.confirmOTP);
                                    let otpModel={
                                        email : user.email
                                    };
                                    res.render('pages/confirmOTP',{user: otpModel , errors : []});
                                    return;
                                });
                              });
						});
                });
                }
            
        }
        catch(err){
            console.log("Final Err >" + err);
            return apiResponse.errorResponse(res, err);
        }
    }
];

exports.verifyOTP=[
    
    (req,res) => {
        try{
            UserModel.findOne({email:req.body.email,confirmOTP : req.body.confirmOTP }, (err, user) => {
                if(!err){

                    if (!user) {
                        res.render('pages/confirmOTP',{user:req.body, errors : [{msg:err.Message}]});
                                    return;
                      }
                      
                      res.status(200).send({
                        id: user._id,
                        username: user.username,
                        email: user.email
                      });
                }
                else
                {
                    res.status(500).send({ message: err });
                    return;
                   // TO DO : Display Error on Login Page
                }
            }).lean();
        }
        catch(err){
            console.log("Login Catch error > " + err);
            res.status(500).send({ message: err });
                    return;
        }
    }
];

exports.login=[
        
    (req,res) => {
        try{
            UserModel.findOne({email:req.body.email}, (err, user) => {
                if(!err){

                    console.log("Login user > " + user);

                    if (!user) {
                        //return res.status(404).send({ message: "User Not found." });
                        var errors= [
                            {
                              value: req.body.email,
                              msg: 'User Not found.',
                              param: 'email',
                              location: 'body'
                            }
                          ]   
                        return res.render('pages/login',{user:req.body, errors : errors});
                      }

                    //bcrypt.hash(req.body.password,config.salt,function(err, hash) {  
                    bcrypt.compare(req.body.password, user.password, function(err, isMatch) {                         

                    //   console.log("hashpassword : "  + hash);
                    //   console.log("user.password : "  + user.password);

                    //   console.log("Login compareSync  ");
                    //   var passwordIsValid = bcrypt.compare(
                    //     hash,
                    //     user.password
                    //   );

                      if (!isMatch) {
                        // return res.status(401).send({
                        //   accessToken: null,
                        //   message: "Invalid Password!"
                        // });
                       var errors= [
                            {
                              value: req.body.email,
                              msg: 'Invalid Username or Password',
                              param: 'email',
                              location: 'body'
                            }
                          ]   
                        return res.render('pages/login',{user:req.body, errors : errors});
                      }

                      console.log("Login token sign  ");

                      Role.findOne({ _id: user.role }, (err, role) => {
                        if (err) {
                            res.status(500).send({ message: err });
                    return;
                        }


                      var token = jwt.sign({ id: user.id,role: role.name}, config.secret, {
                        expiresIn: 86400 // 24 hours
                      });

                      res.status(200).send({user : user,
                        role:role.name,
                        accessToken: token
                      });
                    });
                });
                }
                else
                {
                    res.status(500).send({ message: err });
                    return;
                   // TO DO : Display Error on Login Page
                }
            }).lean();
        }
        catch(err){
            console.log("Login Catch error > " + err);
            res.status(500).send({ message: err });
                    return;
        }
    }

];

exports.changePassword=(req,res) =>{

};

exports.list=[

    (req,res) => {
        try{
            UserModel.find({}, (err, users) => {
                if(!err){
                   // console.log(users);
                    res.render("pages/userList", {userList : users});
                }
                else
                {
                   console.log("Error in retriving User list :" + err.Message);
                }
            }).lean();
        }
        catch(err){
            res.render("/list", {errMSG : err.Message});
        }

    }
];

exports.getUser=[

    (req,res) => {
        try{
            console.log(req.params);
            console.log(req.params._id);
            //UserModel.findOne({_id:req.params._id}, (err, user) => {
            UserModel.findOne({email:req.params._id}, (err, user) => {
                if(!err){
                    console.log(user);
                    res.render("pages/editUser", {user:user});
                }
                else
                {
                    res.redirect("pages/userList");
                   //console.log("Error in retriving User list :" + err.Message);
                }
            }).lean();
        }
        catch(err){
            res.render("/list", {errMSG : err.Message});
        }
    }
];

exports.deleteUser=[

    (req,res) => {
        try{
            console.log("a > " + req.params);
            console.log("b > " +req.params._id);
            console.log("c > " +req.params.id);
            
            UserModel.findByIdAndDelete(req.params._id, (err, user) => {
                if(!err){
                   res.redirect("/api/auth/list");
                }
                else
                {
                   console.log("Error in deleting this record" + err.Message);
                }
            }).lean();
        }
        catch(err){
            res.render("/list", {errMSG : err.Message});
        }
    }
];

exports.updateUser=[

    body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
    .isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
    body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
        .isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),


     // Sanitize fields.
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
    
    (req,res) => {
        try{
            // Extract the validation errors from a request.
			const errors = validationResult(req);

            if(!errors.isEmpty()){
                // Display sanitized values/errors messages.
				//return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
                console.log(errors);
                console.log(errors.array());
                res.render('pages/editUser',{user:req.body, errors : errors.array()});
            }
            else{

               var user = new UserModel(
						{
							firstName: req.body.firstName,
							lastName: req.body.lastName,
							email: req.body.email,
							password: req.body.password,
							confirmOTP: req.body.confirmOTP, 
                            _id:req.body._id
						}
					);

                    // Save user.
                    console.log(req.body);
                    console.log(user);
                    let userData = {
								firstName: user.firstName,
								lastName: user.lastName,
								email: user.email
							}; 
                    user.updateOne({ $set:userData },function (err) { 
                            console.log(err);
							if (err) { 
                                console.log("Save Err >" + err);
                                return apiResponse.errorResponse(res, err); 
                            }
							res.redirect("/api/auth/list");
							//return apiResponse.successResponseWithData(res,"User Updataion Success.", userData);
						});
                }
            
        }
        catch(err){
            console.log("Final Err >" + err);
            return apiResponse.errorResponse(res, err);
        }
    }
];