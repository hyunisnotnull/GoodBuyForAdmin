const chatService = require('../service/chatService');
const socketIO = require('socket.io');

let io;

// Socket.io 초기화 및 이벤트 처리
const initSocket = (server) => {
    io = socketIO(server, {
        cors: { origin: "*" },
        path: `/socket.io`
    });

    io.on('connection', (socket) => {
        console.log(`사용자 연결됨: ${socket.id}`);

        // 채팅방 입장 이벤트
        socket.on('joinRoom', ({ roomId, senderId, senderNick, otherId, otherNick, otherthum, validExitTime }) => {
            socket.join(roomId);
            console.log(`사용자 ${senderId}가 방 ${roomId}에 입장했습니다.`);

            // 이전 채팅 기록을 불러와 클라이언트로 전송
            chatService.getChatHistory(roomId, senderId, senderNick, otherId, otherNick, validExitTime)
                .then((chatHistory) => {
                    chatHistory.forEach((message) => {
                        socket.emit('message', message); // 개별 메시지 클라이언트로 전송
                    });
                })
                .catch((err) => {
                    console.error('채팅 기록 불러오기 오류:', err);
                });
        });

        // 채팅 메시지 수신 이벤트
        socket.on('chatMessage', async ({ roomId, senderId, senderNick, otherId, otherNick, message }) => {
            const chatMessage = { roomId, senderId, senderNick, otherId, otherNick, message, time: new Date() };

            // 메시지를 데이터베이스에 저장
            try {
                await chatService.saveMessage({ roomId, senderId, senderNick, otherId, otherNick, message });

            } catch (err) {
                console.error('메시지 저장 중 오류 발생:', err);

            }

            // 같은 방에 있는 다른 클라이언트들에게 메시지 전송
            io.to(roomId).emit('message', chatMessage);
        });

        // 사용자 연결 해제 처리
        socket.on('disconnect', () => {
            console.log('사용자 연결 해제됨:', socket.id);
        });
    });

};

const getIO = () => io;

module.exports = { initSocket, getIO };
