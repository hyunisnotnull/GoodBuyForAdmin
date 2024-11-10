const DB = require('../db/db.js');

const chatModel = {

    // 관리자 채팅방 조회
    findAdminChat: (userId, callback) => {
        const sql = `SELECT * FROM TBL_ADMIN_CHAT WHERE AC_USER_ID = ? AND AC_ACTIVE = 1`;
        DB.query(sql, [userId], callback);
    },

    // 관리자 채팅방 생성
    createAdminChat: (userId, userNick, callback) => {
        const sql = `INSERT INTO TBL_ADMIN_CHAT (AC_USER_ID, AC_USER_NICK) VALUES (?, ?)`;
        DB.query(sql, [userId, userNick], callback);
    },

    // 관리자 채팅방 목록
    findAdminChatRooms: (callback) => {
        const sql = `
            SELECT AC.*,
                U.U_PROFILE_THUM AS U_PROFILE_THUM
            FROM TBL_ADMIN_CHAT AS AC
            LEFT JOIN TBL_USER AS U 
            ON AC.AC_USER_ID = U.U_ID
            WHERE AC.AC_ACTIVE = 1
    `;
        DB.query(sql, callback);
    },

    // 관리자 채팅방 메시지 저장
    createAdminMessage: (messageData, callback) => {
        const sql = `
            INSERT INTO TBL_ADMIN_MESSAGE (AM_CHAT_AC_NO, AM_SENDER_ID, AM_SENDER_NICK, AM_CONTENT)
            VALUES (?, ?, ?, ?)
        `;
        const { roomId, senderId, senderNick, content } = messageData;
        DB.query(sql, [roomId, senderId, senderNick, content], callback);
    },

    saveChattings: (values, callback) => {

        const sql = `
            INSERT INTO TBL_ADMIN_MESSAGE 
            (AM_CHAT_AC_NO, AM_SENDER_ID, AM_SENDER_NICK, AM_CONTENT)
            VALUES (?, ?, ?, ?)
        `;

        DB.query(sql, values, callback);
        
    },

    updateChatStatus: (roomId, senderId, senderNick, callback) => {

        const sql = `UPDATE TBL_ADMIN_CHAT SET AC_ACTIVE = 1
                    WHERE AC_NO = ? AND AC_USER_ID = ? AND AC_USER_NICK = ?
        `;

        DB.query(sql, [roomId, senderId, senderNick], callback);

    },

    // 읽지 않은 메시지 카운트 초기화
    resetAdminUnreadCount: (roomId, callback) => {
        const sql = `UPDATE TBL_ADMIN_CHAT SET AC_UNREAD_COUNT = 0 WHERE AC_NO = ?`;
        DB.query(sql, [roomId], callback);
    },

    // 관리자 채팅 기록 조회
    findChatMessage: (roomId, senderId, senderNick, callback) => {

        const sql = `
            SELECT M.AM_SENDER_ID AS senderId,
               M.AM_SENDER_NICK AS senderNick,
               M.AM_CONTENT AS message,
               M.AM_TIME AS time    
            FROM TBL_ADMIN_MESSAGE M 
            WHERE M.AM_CHAT_AC_NO = ?
            ORDER BY M.AM_TIME ASC
        `;

        DB.query(sql, roomId, (error, results) => {
            if (error) {
                console.error('쿼리 실행 오류:', error);
            } else {
                console.log("관리자 쿼리 결과:", results); // 결과를 로그에 출력하여 실제 반환된 메시지를 확인
            }
            callback(error, results);
        });
        
    },

    // 관리자 채팅방 정보 조회
    findAdminChatRoom: (roomId, callback) => {
        const sql = `
            SELECT AC.*, 
                U.U_PROFILE_THUM AS U_PROFILE_THUM,
                U.U_NICK AS U_NICK
            FROM TBL_ADMIN_CHAT AS AC
            LEFT JOIN TBL_USER AS U 
            ON AC.AC_USER_ID = U.U_ID
            WHERE AC.AC_NO = ?
        `;
        DB.query(sql, [roomId], callback);
    },

    // 관리자 이미지 메시지 저장
    saveAdminChatImage: (messageId, imagePath, callback) => {
        const sql = `
            INSERT INTO TBL_CHAT_ADMIN_IMAGE (AI_MESSAGE_AM_NO, AI_FILE)
            VALUES (?, ?)
        `;
        DB.query(sql, [messageId, imagePath], callback);
    },

    // 관리자 채팅방 삭제
    exitAdminChatRoom: (roomId, userId, callback) => {
        const sql = `
            UPDATE TBL_ADMIN_CHAT 
            SET AC_ACTIVE = 0 
            WHERE AC_NO = ? AND AC_USER_ID = ?
        `;
        DB.query(sql, [roomId, userId], callback);
    },

}

module.exports = chatModel;