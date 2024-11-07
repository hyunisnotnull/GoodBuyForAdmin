const DB = require('../db/db.js');

const chatModel = {

    checkChatRoomExist: (post, callback) => {
        const sql = `
            SELECT * FROM TBL_CHAT
            WHERE 
                ((CH_SENDER_ID = ? AND CH_RECEIVER_ID = ?)
                OR (CH_SENDER_ID = ? AND CH_RECEIVER_ID = ?))
                AND CH_PRODUCT_NO = ?
                AND CH_ACTIVE != 0
        `;
        const state = [post.my_id, post.u_id, post.u_id, post.my_id, post.p_no];
    
        DB.query(sql, state, (error, results) => {
            if (error) return callback(error, null);
    
            if (results.length > 0) {
                const room = results[0];
                const roomId = room.CH_NO;
    
                // CH_ACTIVE가 2 또는 3일 때 해당 사용자에 맞게 방을 활성화
                if ((room.CH_ACTIVE === 2 && post.my_id === room.CH_RECEIVER_ID)
                    || (room.CH_ACTIVE === 3 && post.my_id === room.CH_SENDER_ID)) {
    
                    const updateSql = `UPDATE TBL_CHAT SET CH_ACTIVE = 1 WHERE CH_NO = ?`;
                    DB.query(updateSql, [roomId], (updateError) => {
                        if (updateError) return callback(updateError, null);
                        room.CH_ACTIVE = 1; // 상태를 1로 업데이트 후 재사용
                        callback(null, results);
                    });
                } else {
                    callback(null, results); // 이미 활성화된 방이므로 그대로 반환
                }
            } else {
                callback(null, []); // 방이 없으므로 새 방 생성
            }
        });
    },
    

    findUserById: (oId, callback) => {

        const sql = `SELECT * FROM TBL_USER WHERE U_ID = ?`;
        
        DB.query(sql, [oId], callback);

    },

    createChatRoom: (post, callback) => {

        const sql = `INSERT INTO TBL_CHAT (CH_SENDER_ID, CH_SENDER_NICK, CH_RECEIVER_ID, CH_RECEIVER_NICK, CH_PRODUCT_NO)
                    VALUES (?, ?, ?, ?, ?)`;
        const state = [post.my_id, post.my_nick, post.u_id, post.u_nick, post.p_no];

        DB.query(sql, state, callback);

    },

    findChatRooms: (callback) => {

        const sql = `
            SELECT * FROM TBL_ADMIN_CHAT
            WHERE AC_ACTIVE != 0
        `;
        DB.query(sql, callback);

    },    

    findChatinfos: (roomId, callback) => {

        const sql = `SELECT * FROM TBL_CHAT WHERE CH_NO = ?`;
        
        DB.query(sql, [roomId], callback);

    },

    findChatMessage: (roomId, senderId, senderNick, otherId, otherNick, validExitTime, callback) => {

        const sql = `
            SELECT M.M_SENDER_ID AS senderId,
               M.M_SENDER_NICK AS senderNick,
               M.M_RECEIVER_ID AS otherId,
               M.M_RECEIVER_NICK AS otherNick,
               M.M_CONTENT AS message,
               M.M_TIME AS time
            FROM TBL_MESSAGE M 
            WHERE M.M_CHAT_CH_NO = ?
            ${validExitTime ? 'AND M.M_TIME > ?' : ''}
            ORDER BY M.M_TIME ASC
        `;

        const params = validExitTime ? [roomId, validExitTime] : [roomId];
        console.log("Executing SQL:", sql);
        console.log("With parameters:", params);
        DB.query(sql, params, (error, results) => {
            if (error) {
                console.error('쿼리 실행 오류:', error);
            } else {
                console.log("쿼리 결과:", results); // 결과를 로그에 출력하여 실제 반환된 메시지를 확인
            }
            callback(error, results);
        });
        
    },

    saveChattings: (values, callback) => {

        const sql = `INSERT INTO TBL_MESSAGE 
                    (M_CHAT_CH_NO, M_SENDER_ID, M_SENDER_NICK, M_RECEIVER_ID, M_RECEIVER_NICK, M_CONTENT)
                    VALUES (?, ?, ?, ?, ?, ?)
        `;

        DB.query(sql, values, callback);
        
    },

    updateChatStatus: (roomId, senderId, callback) => {

        const sql = `UPDATE TBL_CHAT SET CH_ACTIVE = 1
                    WHERE CH_NO = ? AND (CH_RECEIVER_ID = ? OR CH_SENDER_ID = ?)
        `;

        DB.query(sql, [roomId, senderId, senderId], callback);

    },


    resetUnreadCount: (roomId, callback) => {

        const sql = `UPDATE TBL_CHAT SET CH_UNREAD_COUNT = 0 WHERE CH_NO = ?`;
        DB.query(sql, [roomId], callback);

    },

    exitChatRoom: (roomId, userId, callback) => {

        const sql = `
            UPDATE TBL_CHAT
            SET CH_ACTIVE = CASE
                    WHEN CH_SENDER_ID = ? AND CH_ACTIVE = 1 THEN 3  -- SENDER가 나갈 때 RECEIVER만 보이게
                    WHEN CH_RECEIVER_ID = ? AND CH_ACTIVE = 1 THEN 2  -- RECEIVER가 나갈 때 SENDER만 보이게
                    WHEN CH_SENDER_ID = ? AND CH_ACTIVE = 2 THEN 0    -- RECEIVER가 이미 나간 상태에서 SENDER가 나가면 0
                    WHEN CH_RECEIVER_ID = ? AND CH_ACTIVE = 3 THEN 0  -- SENDER가 이미 나간 상태에서 RECEIVER가 나가면 0
                    ELSE CH_ACTIVE
                END,
                CH_SENDER_LAST_EXIT_TIME = CASE
                    WHEN CH_SENDER_ID = ? THEN NOW()                  
                    ELSE CH_SENDER_LAST_EXIT_TIME
                END,
                CH_RECEIVER_LAST_EXIT_TIME = CASE
                    WHEN CH_RECEIVER_ID = ? THEN NOW()                
                    ELSE CH_RECEIVER_LAST_EXIT_TIME
                END
            WHERE CH_NO = ?;
        `;
    
        DB.query(sql, [userId, userId, userId, userId, userId, userId, roomId], callback);
    },

    createMessage: (messageData, callback) => {
        const { roomId, senderId, senderNick, receiverId, receiverNick, content } = messageData;
        const query = `
            INSERT INTO TBL_MESSAGE (M_CHAT_CH_NO, M_SENDER_ID, M_SENDER_NICK, M_RECEIVER_ID, M_RECEIVER_NICK, M_CONTENT)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [roomId, senderId, senderNick, receiverId, receiverNick, content];
        DB.query(query, params, (err, result) => {
            if (err) return callback(err);
            callback(null, result.insertId); // 생성된 메시지의 ID(M_NO) 반환
        });
    },

    saveChatImage: (messageId, imagePath, callback) => {
        const query = `
            INSERT INTO TBL_CHAT_IMAGE (CI_MESSAGE_M_NO, CI_FILE)
            VALUES (?, ?)
        `;
        const params = [messageId, imagePath];
        DB.query(query, params, (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        });
    },

    findAdminChat: (userId, callback) => {
        const query = `
            SELECT AC_NO AS roomId FROM TBL_ADMIN_CHAT
            WHERE AC_USER_ID = ?
        `;
        
        DB.query(query, userId, (error, results) => {
            if (error) {
                console.error('관리자 채팅방 조회 오류:', error);
                return callback(error, null);
            }
            callback(null, results.length > 0 ? results[0] : null);
        });
    },

    createAdminChat: (userId, userNick, callback) => {
        const query = `
            INSERT INTO TBL_ADMIN_CHAT (AC_USER_ID, AC_USER_NICK)
            VALUES (?, ?)
        `;
        const params = [userId, userNick];
        DB.query(query, params, (error, result) => {
            if (error) {
                console.error('관리자 채팅방 생성 오류:', error);
                return callback(error, null);
            }
            callback(null, result.insertId);
        });
    }

}

module.exports = chatModel;