const DB = require('../db/db.js');

const eventModel = {
    getTotalEventCount: (callback) => {
        const sql = `SELECT COUNT(*) AS COUNT FROM TBL_EVENT`; 
        DB.query(sql, (error, results) => {
            if (error) return callback(error);
            callback(null, results[0].COUNT);
        });
    },

    getEvents: (offset, limit, callback) => {
        const sql = `
            SELECT e.*, a.AC_NAME 
            FROM TBL_EVENT e
            LEFT JOIN TBL_ACTIVE a ON e.E_ACTIVE = a.AC_NO
            ORDER BY e.E_NO DESC
            LIMIT ?, ?
        `;
        DB.query(sql, [offset, limit], callback);
    },

    createEvent: (post, imageFilenames, callback) => {
        const sql = `
            INSERT INTO TBL_EVENT (E_TITLE, E_IMAGE, E_URL, E_DESC, E_START_DATE, E_END_DATE)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const state = [post.title, imageFilenames, post.url, post.description, post.startDate, post.endDate];
        DB.query(sql, state, callback);
    },

    getEventById: (eventId, callback) => {
        const sql = 'SELECT * FROM TBL_EVENT WHERE E_NO = ?';
        DB.query(sql, [eventId], callback);
    },

    updateEvent: (post, newImageFilenames, eventId, callback) => {
        const sql = `
            UPDATE TBL_EVENT 
            SET E_TITLE = ?, E_IMAGE = ?, E_DESC = ?, E_START_DATE = ?, E_END_DATE = ?, E_MOD_DATE = NOW() 
            WHERE E_NO = ?
        `;
        const state = [post.title, newImageFilenames, post.description, post.startDate, post.endDate, eventId];
        DB.query(sql, state, callback);
    },

    updateEventStatus: (eventId, newStatus, callback) => {
        const sql = `
            UPDATE TBL_EVENT 
            SET E_ACTIVE = ?, E_MOD_DATE = NOW() 
            WHERE E_NO = ?
        `;
        DB.query(sql, [newStatus, eventId], callback);
    },

    deleteEvent: (eventId, callback) => {
        const sql = `DELETE FROM TBL_EVENT WHERE E_NO = ?`;
        DB.query(sql, [eventId], callback);
    },
};

module.exports = eventModel;
