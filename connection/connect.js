var sql = require("mssql");
var connect = function()
{
    var conn = new sql.ConnectionPool({
        user: 'sa',
        password: 'pass123!@#',
        server: 'DESKTOP-9ON3GB8',
        database: 'TEST_ANGULAR'
    });
 
    return conn;
};

module.exports = connect;