const DB = require('../db/db.js');
const bcrypt = require('bcrypt');

const adminModel = {
    checkAdminExists: (a_id, a_mail, callback) => {
        const sql = `SELECT COUNT(*) AS CNT FROM TBL_ADMIN WHERE A_ID = ? OR A_MAIL = ?`;
        DB.query(sql, [a_id, a_mail], callback);
    },

    createAdmin: (post, file, callback) => {
        const sql = `
            INSERT INTO TBL_ADMIN(A_ID, A_PW, A_MAIL, A_PHONE ${file ? ', A_PROFILE_THUM' : ''}) 
            VALUES(?, ?, ?, ? ${file ? ', ?' : ''})
        `;
        const state = [
            post.a_id,
            bcrypt.hashSync(post.a_pw, 10),
            post.a_mail,
            post.a_phone
        ];

        if (file) {
            state.push(file.filename);
        }

        DB.query(sql, state, callback);
    },

    updateAdmin: (post, file, callback) => {
        let sql = `
            UPDATE TBL_ADMIN SET 
                A_MAIL = ?, 
                A_PHONE = ?, 
                ${post.cover_profile_thum_delete === 'on' ? 'A_PROFILE_THUM = ?, ' : ''}
                A_MOD_DATE = NOW() 
            WHERE 
                A_NO = ?
        `;
        const state = [post.a_mail, post.a_phone];

        if (post.a_pw && post.a_pw.trim() !== '') {
            state.unshift(bcrypt.hashSync(post.a_pw, 10));
            sql = sql.replace('UPDATE TBL_ADMIN SET', 'UPDATE TBL_ADMIN SET A_PW = ?,');
        } else {
            sql = sql.replace('UPDATE TBL_ADMIN SET', 'UPDATE TBL_ADMIN SET A_PW = A_PW,');
        }

        if (post.cover_profile_thum_delete === 'on') {
            if (file) {
                state.push(file.filename);
            } else {
                state.push('');
            }
        }

        state.push(post.a_no);

        DB.query(sql, state, callback);
    },

    deleteAdmin: (a_no, callback) => {
        const sql = `DELETE FROM TBL_ADMIN WHERE A_NO = ?`;
        DB.query(sql, [a_no], callback);
    },

    getAdmin: (a_no, callback) => {
        const sql = `SELECT * FROM TBL_ADMIN WHERE A_NO = ?`;
        DB.query(sql, [a_no], callback);
    }
};

module.exports = adminModel;
