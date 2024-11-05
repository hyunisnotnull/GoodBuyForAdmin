function rejectReport(reportId) {
    if (!confirm('정말 이 신고를 반려하시겠습니까?')) {
        return;  
    }

    fetch(`/report/report_check/${reportId}`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reject' })
    })
    .then(response => {
        if (response.ok) {
            alert('신고가 반려되었습니다.');
            window.location.reload();  
        } else {
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    });
}
