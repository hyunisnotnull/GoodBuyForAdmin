let mysql = require('mysql');
require('dotenv').config();

const DBs = {
    DB_LOCAL: () => {
        return mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE, 
        });
    },

    DB_DEV: () => {
        return mysql.createConnection({       
            host: process.env.DB_HOST_DEV,
            user: process.env.DB_USER_DEV,
            password: process.env.DB_PASSWORD_DEV,
            database: process.env.DB_DATABASE_DEV, 
        });
    },

    DB_PROD: () => {
        return mysql.createConnection({
            host: process.env.DB_HOST_PROD,
            user: process.env.DB_USER_PROD,
            password: process.env.DB_PASSWORD_PROD,
            database: process.env.DB_DATABASE_PROD, 
        });
    },
}

module.exports = DBs;