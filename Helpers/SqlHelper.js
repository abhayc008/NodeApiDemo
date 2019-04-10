var sqlDB = require('mssql');
var conn = require('../connection/connect')();

exports.executeSql = function(sql, callback){
    
    conn.connect().then(function(){
        var req = new sqlDB.Request(conn);
        req.query(sql).then(function(resultSet){
            conn.close();
            callback(null,resultSet);
        }).catch(function(error){
            console.log(error);
            callback(error);
        });
    }).catch(function(error){
        console.log(error);
        callback(error);
    });
};