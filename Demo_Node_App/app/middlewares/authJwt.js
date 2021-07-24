const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const User = require("../models/user.model");
const Role = require("../models/role.model"); 

verifyToken = (req,res,next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
      }

    jwt.verify(token,config.secret,(err, decode) => {
        if(err){
            return res.status(401).send({ message: "Unauthorized!" });
        }

        req.userId = decoded.id;
        req.role = decoded.role;

        next();
    }); 

};

isAdmin = (req,res,next) => {

    if (!req.role) {
        return res.status(403).send({ message: "No Role Assigned!" });
      }

    if (req.role === "admin") {
        next();
        return;
    };

    res.status(403).send({ message: "Require Admin Role!" });
    return;
};

isModerator  = (req,res,next) => {

    if (!req.role) {
        return res.status(403).send({ message: "No Role Assigned!" });
      }   

    if (req.role === "moderator") {
        next();
        return;
    };

    res.status(403).send({ message: "Require moderator Role!" });
    return;
};

const  authJWT ={
    verifyToken,
    isAdmin,
    isModerator
};

module.exports = authJWT;