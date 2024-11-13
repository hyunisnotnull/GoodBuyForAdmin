const DBs = require('./dbs');

const DB = DBs.DB_LOCAL();
DB.connect();

module.exports = DB;