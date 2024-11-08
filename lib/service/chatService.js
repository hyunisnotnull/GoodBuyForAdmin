const chatModel = require('../model/chatModel');
const { format, addHours } = require('date-fns');
const { ko } = require('date-fns/locale');
const DB = require('../db/db.js');

const chatService = {

    // 관리자 채팅방 생성 또는 조회
    createAdminChat: (req, res) => {
        const senderId = req.user.A_ID;
        const senderNick = req.user.U_NICK;
        chatModel.findAdminChat(senderId, (error, adminChat) => {
            if (error) return res.status(500).send("관리자 채팅방 조회 오류");

            if (!adminChat) {
                chatModel.createAdminChat(senderId, senderNick, (createError, newChatId) => {
                    if (createError) return res.status(500).send("관리자 채팅방 생성 오류");

                    res.render('chat/chat', { 
                        roomId: newChatId,
                        senderId,
                        senderNick,
                        otherId: 'admin',              
                        otherNick: 'Admin',            
                        otherthum: '/img/admin_profile.png',
                        lastExitTime: null,
                        loginedAdmin: req.user,
                        isAdminChat: true  
                    });
                });
            } else {
                res.render('chat/chat', { 
                    roomId: adminChat.roomId, 
                    senderId, 
                    senderNick, 
                    otherId: 'admin',              
                    otherNick: 'Admin',            
                    otherthum: '/img/admin_profile.png',
                    lastExitTime: null,
                    loginedAdmin: req.user,
                    isAdminChat: true  
                });
            }
        });
    },

    // 관리자 채팅방 목록
    adminChatList: (req, res) => {

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

        const roomId = req.params.roomId;

        chatModel.resetAdminUnreadCount(roomId, (error) => {
            if (error) console.error('읽지 않은 메시지 초기화 오류:', error);
        });

        chatModel.findAdminChatRoom(roomId, (error, roomDetails) => {
            if (error || !roomDetails.length) return res.status(500).send("관리자 채팅방 입장 오류");

            const room = roomDetails[0];
            res.render('chat/chat', { 
                roomId, 
                room, 
                loginedAdmin: req.user,
                isAdminChat: true
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

    getOrCreateAdminChat: (req, res) => {

        const userId = req.user.U_ID;
        const userNick = req.user.U_NICK;
        console.log('userId', req.user.U_ID);
    
        chatModel.findAdminChat(userId, (error, adminChat) => {
            if (error) {
                console.error('관리자 채팅방 조회 중 오류:', error);
                return res.status(500).send("관리자 채팅방을 불러오는데 문제가 발생했습니다.");
            }
    
            // 기존 채팅방이 없으면 새로 생성
            if (!adminChat) {
                chatModel.createAdminChat(userId, userNick, (createError, newChatId) => {
                    if (createError) {
                        console.error('관리자 채팅방 생성 중 오류:', createError);
                        return res.status(500).send("관리자 채팅방 생성에 문제가 발생했습니다.");
                    }
                    
                    res.render('chat/chat', {
                        roomId: newChatId,
                        senderId: userId,
                        senderNick: userNick,
                        otherId: 'admin',              
                        otherNick: 'Admin',            
                        otherthum: '/img/admin_profile.png',
                        lastExitTime: null,
                        loginedAdmin: req.user,
                        isAdminChat: true              // 관리자 채팅 여부 플래그
                    });
                });
            } else {
                // 기존 채팅방이 있는 경우, 시간 형식을 한국 시간으로 변환하여 렌더링
                // const lastMessageTimeKST = addHours(new Date(adminChat.lastExitTime), 9);
                // console.log(lastMessageTimeKST);
                // adminChat.lastExitTime = format(lastMessageTimeKST, 'a h:mm', { locale: ko });
    
                res.render('chat/chat', {
                    roomId: adminChat.roomId,
                    senderId: userId,
                    senderNick: userNick,
                    otherId: 'admin',
                    otherNick: 'Admin',
                    otherthum: '/img/admin_profile.png',
                    lastExitTime: adminChat.lastExitTime,
                    loginedAdmin: req.user,
                    isAdminChat: true
                });
            }
        });
    },

};

module.exports = chatService;
