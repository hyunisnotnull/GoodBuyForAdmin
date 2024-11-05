const DB = require('../db/db.js');

const reportModel = {
    getTotalReportCount: (callback) => {
        const sql = `SELECT COUNT(*) AS COUNT FROM TBL_REPORT`; 
        DB.query(sql, (error, results) => {
            if (error) return callback(error);
            callback(null, results[0].COUNT);
        });
    },

    getReports: (offset, limit, sortField, sortOrder, callback) => {
        if (sortField === 'R_NO') {
            sortField = 'R_NO';  // 글 No별 SORT
        }

        if (sortField === 'R_CHECK') {
            sortField = 'R_CHECK';  // 신고 상태별 SORT
        }

        const sql = `
            SELECT r.*, s.ST_NAME, p.P_NAME, u.U_NICK, p.P_STATE, p.P_NO
            FROM TBL_REPORT r
            LEFT JOIN TBL_CHECK c ON r.R_CHECK = c.CK_NO
            LEFT JOIN TBL_PRODUCT p ON r.R_P_NO = p.P_NO
            LEFT JOIN TBL_STATE s ON p.P_STATE = s.ST_NO
            LEFT JOIN TBL_USER u ON r.R_U_NO = u.U_NO
            ORDER BY ${sortField} ${sortOrder}
            LIMIT ?, ?
        `;
        DB.query(sql, [offset, limit], callback);
    },

    getReportById: (eventId, callback) => {
        const sql = 'SELECT * FROM TBL_REPORT WHERE R_NO = ?';
        DB.query(sql, [eventId], callback);
    },

    updateReportCheck: (eventId, newStatus, callback) => {
        const sql = `
            UPDATE TBL_REPORT 
            SET R_CHECK = ?, R_MOD_DATE = NOW() 
            WHERE R_NO = ?
        `;
        DB.query(sql, [newStatus, eventId], callback);
    },

    updateProductState: (productId, newState, callback) => {
        const sql = `
            UPDATE TBL_PRODUCT 
            SET P_STATE = ? 
            WHERE P_NO = ?
        `;
        DB.query(sql, [newState, productId], callback);
    },
    
};

module.exports = reportModel;
