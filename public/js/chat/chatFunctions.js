
// 채팅방 나가기
function goBack() {
    location.href = '/chat/chatList';
}

// 채팅방 삭제
function deleteChat() {
    if (confirm("채팅방을 삭제하시겠습니까?")) {
        const port = isAdminChat ? 3002 : 3001;
        const deleteUrl = `http://14.42.124.92:${port}${isAdminChat ? '/chat/chatA/delete' : '/chat/delete'}/${roomId}`;
        
        fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ U_ID: senderId })
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


function initEvents() {
    console.log('initEvents()');

    $(document).on('click', 'div.profile_thum_wrap a', function(){
        console.log('profile_thum_wrap CLICKED!!');

        $('#profile_modal_wrap').css('display', 'block');

    });

    $(document).on('click', '#profile_modal_wrap div.profile_thum_close a', function(){
        console.log('profile_thum_close CLICKED!!');

        $('#profile_modal_wrap').css('display', 'none');

    });

}

$(document).ready(function() {
    console.log('join READY!!');

    // joinRoom 함수를 여기서 호출
    joinRoom(isAdminChat, roomId, senderId, senderNick, otherId, otherNick, otherthum, lastExitTime);

    initEvents();
});

// 모달 관련 요소 선택
const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementsByClassName("close")[0];

// 채팅창 이미지 클릭 이벤트
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("chat-image")) { // 이미지가 클릭될 때
        modal.style.display = "flex"; // 모달 창 표시
        modalImage.src = event.target.src; // 클릭된 이미지의 src를 모달 이미지로 설정
    }
});

// 닫기 버튼 클릭 이벤트
closeModal.onclick = function() {
    modal.style.display = "none"; // 모달 창 숨기기
};

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};