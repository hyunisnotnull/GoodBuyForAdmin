// 모달 열기
function openEditModal(button) {
    const userId = button.getAttribute('data-id');
    const userPoint = button.getAttribute('data-point');
    const userPenalty = button.getAttribute('data-penalty');

    document.getElementById('userId').value = userId;
    document.getElementById('userPoint').value = userPoint;
    document.getElementById('userPenalty').value = userPenalty;
    document.getElementById('editModal').style.display = 'flex';
}

// 모달 닫기
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none'; 
}

// init
window.onload = function() {
    document.getElementById('editForm').onsubmit = function(event) {
        event.preventDefault();

        const userId = document.getElementById('userId').value;
        const userPoint = document.getElementById('userPoint').value;
        const userPenalty = document.getElementById('userPenalty').value;

        // AJAX 요청 보내기
        fetch('/admin/update_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: userId,
                point: userPoint,
                penalty: userPenalty
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('수정 완료');
                updateTable(userId, userPoint, userPenalty, data.grade); // 등급도 업데이트
                closeEditModal();
            } else {
                alert('수정 실패: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('서버와의 연결 오류');
        });
    };
};

// 테이블 업데이트 함수
function updateTable(userId, userPoint, userPenalty, newGrade) {
    const rows = document.querySelectorAll('.userlist_wrap tbody tr');

    rows.forEach(row => {
        const idCell = row.querySelector('td:first-child');
        if (idCell.textContent === userId) {

            const gradeCell = row.querySelector('td:nth-child(7)');
            switch (newGrade) {
                case 7: gradeCell.textContent = 'DIAMOND'; break;
                case 6: gradeCell.textContent = 'PLATINUM'; break;
                case 5: gradeCell.textContent = 'GOLD'; break;
                case 4: gradeCell.textContent = 'SILVER'; break;
                case 3: gradeCell.textContent = 'BRONZE'; break;
                case 2: gradeCell.textContent = 'IRON'; break;
                default: gradeCell.textContent = 'STOP';
            }

            row.querySelector('td:nth-child(8)').textContent = userPoint; // 포인트 업데이트
            row.querySelector('td:nth-child(9)').textContent = userPenalty; // 패널티 업데이트

            const editButton = row.querySelector('button');
            editButton.setAttribute('data-point', userPoint);
            editButton.setAttribute('data-penalty', userPenalty);
        }
    });
}




