var sqlDB = require('mssql');
var conn = require('../connection/connect')();

exports.executeSql = function(sql, callback){
    
    conn.connect().then(function(){
        var req = new sqlDB.Request(conn);
        req.query(sql).then(function(resultSet){
            conn.close();
            callback(resultSet);
        }).catch(function(error){
            console.log(error);
            callback(null,error);
        });
    }).catch(function(error){
        console.log(error);
        callback(null,error);
    });
};