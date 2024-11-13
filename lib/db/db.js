const DBs = require('./dbs');

const DB = DBs.DB_PROD();
DB.connect();

module.exports = DB;