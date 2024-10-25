document.addEventListener("DOMContentLoaded", function() {
    const startDateInput = document.querySelector('input[name="startDate"]');
    const endDateInput = document.querySelector('input[name="endDate"]');
    const form = document.querySelector('form');

    form.addEventListener('submit', function(event) {
        const now = new Date();
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);

        // 현재 시간보다 과거 날짜 등록 방지
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

        // 종료일이 시작일보다 이전인지 체크
        if (endDate <= startDate) {
            alert("종료일은 시작일보다 이후여야 합니다.");
            event.preventDefault();
            return;
        }
    });
});