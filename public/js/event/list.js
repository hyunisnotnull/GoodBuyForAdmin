function confirmStatusChange(event, action) {
    const confirmation = confirm(`${action} 하시겠습니까?`);
    if (!confirmation) {
        event.preventDefault();
    } else {
        showAlert(`${action} 되었습니다.`);
    }
    return confirmation; 
}