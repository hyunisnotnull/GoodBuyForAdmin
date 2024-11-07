const DB = require('../db/db.js');

const statModel = {
    getReportById: (eventId, callback) => {
        const sql = 'SELECT * FROM TBL_REPORT WHERE R_NO = ?';
        DB.query(sql, [eventId], callback);
    },
    
};

module.exports = statModel;
