document.addEventListener("DOMContentLoaded", function() {
    CKEDITOR.replace('description', {
        height: 300, 
        enterMode: CKEDITOR.ENTER_BR, 
        shiftEnterMode: CKEDITOR.ENTER_BR, 
        resize_enabled: false, 
        width: '100%', 
    });
    
    const startDateInput = document.querySelector('input[name="startDate"]');
    const endDateInput = document.querySelector('input[name="endDate"]');
    const form = document.querySelector('form');

    form.addEventListener('submit', function(event) {
        const now = new Date();
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        // 날짜 유효성 검사
        if (startDate < now) {
            alert("시작일은 현재 시간 이후여야 합니다.");
            event.preventDefault();
            return;
        }

        if (endDate < now) {
            alert("종료일은 현재 시간 이후여야 합니다.");
            event.preventDefault();
            return;
        }

        if (endDate <= startDate) {
            alert("종료일은 시작일보다 이후여야 합니다.");
            event.preventDefault();
            return;
        }
    });
});
