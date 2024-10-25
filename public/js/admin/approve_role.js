// ADMIN 승인 함수
function approveAdmin(adminId) {
    fetch('/admin/approve_admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: adminId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            fetchUpdatedAdmin(adminId);
        } else {
            alert('승인 실패: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// ADMIN 미승인 함수
function disapproveAdmin(adminId) {
    fetch('/admin/disapprove_admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: adminId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            fetchUpdatedAdmin(adminId);
        } else {
            alert('미승인 실패: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// 변경된 특정 ADMIN 함수
function fetchUpdatedAdmin(adminId) {
    fetch(`/admin/get_admin/${adminId}`, { 
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(admin => {
        console.log('Fetched Admin:', admin);
        if (admin.success) {
            updateAdminButtonAndRole(adminId, admin.admin.A_ROLE); 
        } else {
            console.error('관리자 정보를 가져오지 못했습니다.');
        }
    })
    .catch(error => console.error('Error fetching updated admin:', error));
}

// 재랜더링 함수
function updateAdminButtonAndRole(adminId, newRole) {
    const buttons = document.querySelectorAll(`button[onclick*="approveAdmin('${adminId}')"], button[onclick*="disapproveAdmin('${adminId}')"]`);

    buttons.forEach(button => {
        const row = button.closest('tr');
        if (row) {
            row.cells[6].innerText = newRole;

            button.innerHTML = newRole === 'ADMIN' ? '미승인' : '승인';
            button.setAttribute('onclick', newRole === 'ADMIN' ? `disapproveAdmin('${adminId}')` : `approveAdmin('${adminId}')`);
        }
    });
}

