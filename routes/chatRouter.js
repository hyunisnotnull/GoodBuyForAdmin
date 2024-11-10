const express = require('express');
const router = express.Router();
const chatService = require('../lib/service/chatService');
const uploads = require('../lib/upload/uploads');
const { getIO } = require('../lib/socket/socket');

// // 관리자와 채팅 생성
// router.get('/adminContact', (req, res) => {
//     console.log('/chat/adminContact/');
//     chatService.createAdminChat(req, res);
// });

// 관리자 채팅방 목록
router.get('/chatList', (req, res) => {
    console.log('/chat/chatList/');
    chatService.adminChatList(req, res);
});

// 목록에서 관리자 채팅방 입장
router.get('/chatA/:roomId', (req, res) => {
    const { roomId } = req.params;
    console.log(`/chat/chatA/:roomId/ - 요청된 roomId: ${roomId}`);
    chatService.enterAdminChatRoom(req, res);
});

// 메시지 전송
router.post('/chatA/:roomId/message', (req, res) => {
    console.log('/chat/chatA/:roomId/message');
    chatService.saveAdminMessage(req, res);
});

// 관리자용 채팅방 삭제
router.delete('/chatA/delete/:roomId', (req, res) => {
    console.log('/chat/delete/:roomId/');
    chatService.deleteAdminChatRoom(req, res);
});

// 관리자용 사진 업로드
router.post('/chatA/uploadImage/:roomId', uploads.UPLOAD_ADMIN_CHAT_IMAGE_MIDDLEWARE(), (req, res) => {
    console.log('/chat/chatA/uploadImage/:roomId/ - 파일 업로드 라우트 호출됨');
    
    console.log('파일 업로드 요청이 들어왔습니다.');
    console.log('파일:', req.file); // 업로드된 파일 정보 로그
    console.log('body:', req.body); // 요청 바디 정보 로그
    console.log('params:', req.params); // URL 매개변수 로그

    const { roomId } = req.params;
    const { senderId, senderNick, receiverId, receiverNick } = req.body;

    if (req.file) {
        const imagePath = `/uploads/admin_chat_images/${roomId}/${req.file.filename}`;

        chatService.saveMessageWithImage(roomId, senderId, senderNick, receiverId, receiverNick, imagePath, (err, messageId) => {
            if (err) {
                console.error('메시지 및 이미지 저장 중 오류 발생:', err);
                return res.status(500).json({ error: '메시지 및 이미지 저장에 실패했습니다.' });
            }

            res.json({ success: true, imageUrl: imagePath });

            const io = getIO();
            io.to(roomId).emit('message', {
                roomId,
                senderId,
                senderNick,
                otherId: receiverId,
                otherNick: receiverNick,
                message: `<img src="${imagePath}" class="chat-image">`,
                time: new Date(),
            });
        });
    } else {
        res.status(400).json({ error: '파일 업로드 실패' });
    }
});

module.exports = router;
