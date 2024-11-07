let socket = null;

const chatWindow = document.getElementById('chatWindow');
const messageInput = document.getElementById('messageInput');
const imageInput = document.getElementById('imageInput');

// 메시지 보낸 시간 저장 변수
let lastMessageTime = null;
let lastSenderId = null;
let currentMessageGroup = null;

function joinRoom(isAdminChat, roomId, senderId, senderNick, otherId, otherNick, otherthum, lastExitTime) {
    
    const port = isAdminChat ? 3002 : 3001; // 관리자와의 대화이면 3002 포트, 그렇지 않으면 3001 포트 사용
    console.log("joinRoom 함수 호출됨 - isAdminChat 값:", isAdminChat);

    // 기존 연결이 있다면 종료
    if (socket) {
        socket.disconnect();
    }

    // 새로운 포트로 소켓 연결 초기화
    socket = io(`http://localhost:${port}`);
    console.log(`소켓 연결 시도: http://localhost:${port}`);

    // 연결 성공 확인 로그
    socket.on('connect', () => {
        console.log(`소켓 연결 성공: ${socket.id} (포트: ${port})`);
    });

    // lastExitTime 유효성 검사
    const validExitTime = lastExitTime && !isNaN(new Date(lastExitTime).getTime()) 
        ? new Date(new Date(lastExitTime).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19)
        : null;

    // 서버에 채팅방 입장을 알림
    socket.emit('joinRoom', { roomId, senderId, senderNick, otherId, otherNick, otherthum, validExitTime });

    // 소켓 이벤트 설정
    setupSocketEvents();
}

// 소켓 이벤트 설정 함수
function setupSocketEvents() {
    // 서버로부터 메시지 수신 이벤트
    socket.on('message', (data) => {
        displayMessage(data);
    });

    // 서버로부터 연결 해제 이벤트 수신
    socket.on('disconnect', () => {
        console.log("서버와 연결이 끊어졌습니다.");
    });
}

// 메시지 전송 함수
function sendMessage() {
    const message = messageInput.value.trim();

    if (message) {
        // 서버로 메시지 전송
        socket.emit('chatMessage', 
                    { roomId, senderId, senderNick, otherId, otherNick, message });

        messageInput.value = '';
        messageInput.focus();
    }
}

// 사진 파일 선택 시 이벤트
imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('chat_image', file);
        formData.append('senderId', senderId);
        formData.append('senderNick', senderNick);
        formData.append('receiverId', otherId);
        formData.append('receiverNick', otherNick);

        // 서버로 파일 업로드
        fetch(`/chat/uploadImage/${roomId}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.imageUrl) {
                console.log("이미지 업로드 성공:", data.imageUrl);
            }
        })
        .catch(error => {
            console.error('사진 업로드 중 오류 발생:', error);
        });
    }
});

// 엔터키로 메시지 전송
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// 메시지를 화면에 출력하는 함수
function displayMessage(data) {
    const messageTime = new Date(data.time);
    const hours = messageTime.getHours();
    const minutes = messageTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const formattedHours = (hours % 12) || 12;
    const formattedTime = `${ampm} ${formattedHours}:${minutes}`;

    const isSameTimeAsLastMessage = lastMessageTime === formattedTime;
    const isSameSenderAsLastMessage = data.senderId === lastSenderId;

    // 새로운 메시지 그룹이 필요한지 확인
    if (!isSameTimeAsLastMessage || !isSameSenderAsLastMessage) {
        currentMessageGroup = document.createElement('div');
        currentMessageGroup.classList.add('message-container');

        const profileAndMessage = document.createElement('div');
        profileAndMessage.classList.add(data.senderId === senderId ? 'my-message-group' : 'other-message-group');

        // 상대방 메시지라면 프로필 사진과 닉네임 추가
        if (data.senderId !== senderId) {
            const profileContainer = document.createElement('div');
            profileContainer.classList.add('profile-container');

            const profileImage = document.createElement('img');
            profileImage.classList.add('chat-profile-image');
            profileImage.src = otherthum !== '' 
                ? `/${otherId}/${otherthum}` 
                : '/img/default_profile_thum.png';

            const nickname = document.createElement('span');
            nickname.classList.add('message-user');
            nickname.textContent = otherNick;

            profileContainer.appendChild(profileImage);
            profileContainer.appendChild(nickname);
            currentMessageGroup.appendChild(profileContainer);
        }

        currentMessageGroup.appendChild(profileAndMessage);
        chatWindow.appendChild(currentMessageGroup);

        lastMessageTime = formattedTime;
        lastSenderId = data.senderId;
    }

    // 이전 메시지 그룹에 있던 message-time 요소 제거
    const existingTimeElement = currentMessageGroup.querySelector('.message-time');
    if (existingTimeElement) {
        existingTimeElement.remove();
    }

    // 메시지 내용 추가
    const messageElement = document.createElement('div');
    messageElement.classList.add(data.senderId === senderId ? 'my-message' : 'other-message');

    // 메시지의 시간과 텍스트 순서 조정
    if (data.senderId === senderId) {
        messageElement.innerHTML = `
            <div class="message-time">${formattedTime}</div>
            <div class="message-text">${data.message}</div>
        `;
    } else {
        messageElement.innerHTML = `
            <div class="message-text">${data.message}</div>
            <div class="message-time">${formattedTime}</div>
        `;
    }

    // 이미지 메시지 처리
    if (data.message.includes('<img')) {
        messageElement.innerHTML = data.senderId === senderId
            ? `<div class="message-time">${formattedTime}</div>${data.message}`
            : `${data.message}<div class="message-time">${formattedTime}</div>`;

        const imgElement = messageElement.querySelector("img.chat-image");
        imgElement.addEventListener("load", () => {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        });

    }
    

    const messageGroup = currentMessageGroup.querySelector(data.senderId === senderId ? '.my-message-group' : '.other-message-group');
    messageGroup.appendChild(messageElement);

    // 마지막 message에 대해 inline-block 스타일 적용
    // const allMessages = messageGroup.querySelectorAll('.other-message, .my-message');
    // allMessages.forEach((msg) => msg.style.display = 'block');
    // if (allMessages.length > 0) {
    //     allMessages[allMessages.length - 1].style.display = 'inline-block';
    // }

    // 마지막 메시지에 시간 표시
    // const timeElement = document.createElement('div');
    // timeElement.classList.add('message-time');
    // timeElement.textContent = formattedTime;
    // messageGroup.appendChild(timeElement);

    // 텍스트 메시지의 경우 바로 스크롤 조정
    if (!data.message.includes('<img')) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
}

// 채팅방 나가기
function goBack() {
    location.href = '/chat/chatList';
}

// 채팅방 삭제
function deleteChat() {
    if (confirm("채팅방을 삭제하시겠습니까?")) {
        fetch(`/chat/delete/${roomId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert("채팅방이 삭제되었습니다.");
                window.location.href = "/chat/chatList";
            } else {
                alert("채팅방 삭제에 실패했습니다.");
            }
        })
        .catch(error => {
            console.error("채팅방 삭제 중 오류 발생:", error);
            alert("오류가 발생했습니다. 다시 시도해주세요.");
        });
    }
}

// $(document).ready(function() {
//     console.log('DOCUMENT READY!!');

//     initEvents();

// });

// function initEvents() {
//     console.log('initEvents()');

//     $(document).on('click', 'div.profile_thum_wrap a', function(){
//         console.log('profile_thum_wrap CLICKED!!');

//         $('#profile_modal_wrap').css('display', 'block');

//     });

//     $(document).on('click', '#profile_modal_wrap div.profile_thum_close a', function(){
//         console.log('profile_thum_close CLICKED!!');

//         $('#profile_modal_wrap').css('display', 'none');

//     });

// }

$(document).ready(function() {
    console.log('join READY!!');

    // joinRoom 함수를 여기서 호출
    joinRoom(isAdminChat, roomId, senderId, senderNick, otherId, otherNick, otherthum, lastExitTime);

    initEvents();
});