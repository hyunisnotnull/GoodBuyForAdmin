const DB = require('../db/db.js');

const reportModel = {
    getTotalReportCount: (callback) => {
        const sql = `SELECT COUNT(*) AS COUNT FROM TBL_REPORT`; 
        DB.query(sql, (error, results) => {
            if (error) return callback(error);
            callback(null, results[0].COUNT);
        });
    },

    getReports: (offset, limit, callback) => {
        const sql = `
            SELECT r.*, s.ST_NAME, p.P_NAME, u.U_NICK 
            FROM TBL_REPORT r
            LEFT JOIN TBL_STATE s ON r.R_STATE = s.ST_NO
            LEFT JOIN TBL_PRODUCT p ON r.R_P_NO = p.P_NO
            LEFT JOIN TBL_USER u ON r.R_U_NO = u.U_NO
            ORDER BY r.R_NO DESC
            LIMIT ?, ?
        `;
        DB.query(sql, [offset, limit], callback);
    },

    getReportById: (eventId, callback) => {
        const sql = 'SELECT * FROM TBL_REPORT WHERE R_NO = ?';
        DB.query(sql, [eventId], callback);
    },

    updateReportStatus: (eventId, newStatus, callback) => {
        const sql = `
            UPDATE TBL_REPORT 
            SET R_STATE = ?, R_MOD_DATE = NOW() 
            WHERE R_NO = ?
        `;
        DB.query(sql, [newStatus, eventId], callback);
    },
    
};

module.exports = reportModel;
