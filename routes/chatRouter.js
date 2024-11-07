const express = require('express');
const router = express.Router();
const chatService = require('../lib/service/chatService');
const uploads = require('../lib/upload/uploads');
const { getIO } = require('../lib/socket/socket');

// 관리자와 채팅 생성
router.get('/adminContact', (req, res) => {
    console.log('/admin/adminContact/');
    chatService.createAdminChat(req, res);
});

// 관리자 채팅방 목록
router.get('/chatList', (req, res) => {
    console.log('/admin/chatList/');
    chatService.adminChatList(req, res);
});

// 목록에서 관리자 채팅방 입장
router.get('/chat/:roomId', (req, res) => {
    console.log('/admin/chat/:roomId/');
    chatService.enterAdminChatRoom(req, res);
});

// 메시지 전송
router.post('/chat/:roomId/message', (req, res) => {
    console.log('/admin/chat/:roomId/message');
    chatService.saveAdminMessage(req, res);
});

// 관리자와 채팅 생성
// router.get('/adminContact', (req, res) => {
//     console.log('/chat/adminContact/');
//     chatService.getOrCreateAdminChat(req, res);
// });


module.exports = router;
