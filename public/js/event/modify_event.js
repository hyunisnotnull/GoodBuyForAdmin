document.addEventListener("DOMContentLoaded", function() {
    CKEDITOR.replace('description', {
        height: 300, 
        enterMode: CKEDITOR.ENTER_BR, 
        shiftEnterMode: CKEDITOR.ENTER_BR, 
        resize_enabled: false, 
        width: '100%', 
    });
    
    const endDateInput = document.querySelector('input[name="endDate"]');
    const form = document.querySelector('form');

    form.addEventListener('submit', function(event) {
        const now = new Date();
        const endDate = new Date(endDateInput.value);

        // 종료일이 현재 시간보다 과거인지 체크
        if (endDate < now) {
            alert("종료일은 현재 시간 이후여야 합니다.");
            event.preventDefault();
            return;
        }

        // 종료일이 시작일보다 이전인지 체크
        if (endDate <= startDate) {
            alert("종료일은 시작일보다 이후여야 합니다.");
            event.preventDefault();
            return;
        }
        
    });
});