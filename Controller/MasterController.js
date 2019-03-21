var express = require('express');
var router = express.Router();
var sql = require("mssql");
var conn = require('../connection/connect')();

var routes = function(){

    router.route('/').get(function(req, res){
        conn.connect().then(function(){
            var sqlQuery = 'SELECT * FROM USER_MASTER';
            var sqlReq = new sql.Request(conn);
            sqlReq.query(sqlQuery).then(function(recordset){
                res.json(recordset.recordset);
                conn.close();                
            }).catch(function(err){
                conn.close();
                res.status(400).send('Error occured while processing your request.');
            });

        }).catch(function(err){
            conn.close();
            //res.status(400).send('Error occured while connecting to server.');
            res.status(400).send(err);
        });
    });

    return router;
};

module.exports =  routes;
