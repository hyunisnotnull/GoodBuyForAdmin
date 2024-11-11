const chatModel = require('../model/chatModel');
const { format, addHours } = require('date-fns');
const { ko } = require('date-fns/locale');

const chatService = {

    // 관리자 채팅방 생성 또는 조회
    createAdminChat: (req, res) => {

        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }
        
        const senderId = req.user.U_ID;
        const senderNick = req.user.U_NICK;

        //채팅방 조회
        chatModel.findAdminChat(senderId, (error, adminChat) => {
            if (error) return res.status(500).send("관리자 채팅방 조회 오류");

            // 채팅방 없음
            if (adminChat.length === 0) {
                chatModel.createAdminChat(senderId, senderNick, (createError, result) => {
                    if (createError) return res.status(500).send("관리자 채팅방 생성 오류");

                    const newChatId = result.insertId;
                    console.log("새로운 관리자 채팅방 생성:", newChatId);

                    res.render('chat/chatA', { 
                        roomId: newChatId,
                        otherId: 'admin',              
                        otherNick: 'Admin',            
                        otherthum: '/img/admin_profile.png',
                        loginedUser: req.user,
                        lastExitTime: null,
                        isAdminChat: true  
                    });
                });
            } else {
                console.log("기존 관리자 채팅방 조회됨:", adminChat);

                res.render('chat/chatA', { 
                    roomId: adminChat[0].AC_NO, 
                    otherId: 'admin',              
                    otherNick: 'Admin',            
                    otherthum: '/img/admin_profile.png',
                    loginedUser: req.user,
                    lastExitTime: null,
                    isAdminChat: true  
                });
            }
        });
    },

    // 관리자 채팅방 목록
    adminChatList: (req, res) => {

        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        chatModel.findAdminChatRooms((error, chattingRooms) => {

            if (error) return res.status(500).send("관리자 채팅방 목록 조회 오류");

            // 시간 형식을 변환
            chattingRooms = chattingRooms.map(room => {
                // UTC 시간을 한국 시간(KST)으로 변환 (UTC+9 시간 추가)
                const messageTimeKST = addHours(new Date(room.AC_TIME), 9);
                room.lastMessageTime = format(messageTimeKST, 'a h:mm', { locale: ko }); // '오후 5:30' 형식
                return room;
            });

            res.render('chat/chatList', { loginedAdmin: req.user, chattingRooms });
            console.log('관리자 chattingRooms', chattingRooms);
        });
    },

    // 관리자 채팅방 입장
    enterAdminChatRoom: (req, res) => {

        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        const roomId = req.params.roomId;

        chatModel.resetAdminUnreadCount(roomId, (error) => {
            if (error) console.error('읽지 않은 메시지 초기화 오류:', error);
        });

        chatModel.findAdminChatRoom(roomId, (error, roomDetails) => {
            if (error || !roomDetails.length) return res.status(500).send("관리자 채팅방 입장 오류");

            const room = roomDetails[0];
            res.render('chat/chatA', { 
                roomId, 
                room, 
                loginedAdmin: req.user,
            });
            console.log('123123123312123', roomId, room);
        });
    },

    // 관리자 메시지 저장
    saveAdminMessage: ({ roomId, senderId, senderNick, message }) => {

        return new Promise((resolve, reject) => {
            const values = [roomId, senderId, senderNick, message];
            
            chatModel.saveChattings(values, (error, result) => {
                if (error) {
                    console.error('메시지 저장 중 오류 발생:', error);
                    return reject(error);
                }

                // CH_ACTIVE 상태 업데이트
                chatModel.updateChatStatus(roomId, senderId, senderNick, (updateError) => {
                    if (updateError) {
                        console.error('채팅방 상태 업데이트 중 오류 발생:', updateError);
                        return reject(updateError);
                    }
                    
                    resolve(result);
                });
            });
        });
    },

    // 관리자 채팅 기록 조회
    getAdminChatHistory: (roomId, senderId, senderNick) => {
        return new Promise((resolve, reject) => {
            
            chatModel.findChatMessage(roomId, senderId, senderNick, (error, results) => {
                if (error) {
                    console.error('채팅 기록을 불러오는 중 오류 발생:', error);
                    reject(error); // 오류 발생 시 Promise reject
                } else {
                    resolve(results); // 채팅 기록을 반환
                }
            });
        });
    },

    // 관리자 메시지와 이미지를 함께 저장하는 함수
    saveMessageWithImage: (roomId, senderId, senderNick, receiverId, receiverNick, imagePath, callback) => {
        const messageData = {
            roomId,
            senderId,
            senderNick,
            receiverId,
            receiverNick,
            content: `<img src="${imagePath}" class="chat-image">`,
        };

        chatModel.createAdminMessage(messageData, (error, result) => {
            if (error) return callback(error);

            const messageId = result.insertId;

            chatModel.saveAdminChatImage(messageId, imagePath, (imageErr) => {
                if (imageErr) return callback(imageErr);
                callback(null, messageId);
            });
        });
    },

    // 관리자용 채팅방 삭제
    deleteAdminChatRoom: (req, res) => {
        const roomId = req.params.roomId;
        const userId = req.body.U_ID;
        console.log('deleteAdminChatRoom 함수 호출됨');
        console.log('userId:', req.body.U_ID);
        console.log('roomId:', req.params.roomId);

        chatModel.exitAdminChatRoom(roomId, userId, (error, result) => {
            if (error) return res.status(500).json({ message: "채팅방 삭제 오류" });
            res.status(200).json({ message: "채팅방이 삭제되었습니다." });
        });
    }

};

module.exports = chatService;
