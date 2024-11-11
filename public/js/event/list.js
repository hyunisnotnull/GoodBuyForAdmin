function confirmStatusChange(event, action, isExpired) {
    console.log("Button clicked");
    isExpired = (isExpired === 'true');

    if (isExpired) {
        alert("종료된 이벤트는 상태 변경이 불가능합니다.");
        event.preventDefault();
        return false;
    }

    const confirmation = confirm(`${action} 하시겠습니까?`);
    if (!confirmation) {
        event.preventDefault();
        return false;
    }
    
    return true;
}

function deleteConfirm() {
    console.log("deleteConfirm() clicked");

    return confirm("정말로 삭제하시겠습니까?");
}