function confirmStatusChange(event, action, isExpired) {
    console.log("Button clicked"); // 확인용 로그
    isExpired = (isExpired === 'true');

    if (isExpired) {
        alert("종료된 이벤트는 상태 변경이 불가능합니다.");
        event.preventDefault();
        return false;
    }

    const confirmation = confirm(`${action} 하시겠습니까?`);
    if (!confirmation) {
        event.preventDefault();
    }
    
    return confirmation; 
}
