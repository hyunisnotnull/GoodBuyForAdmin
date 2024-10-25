function formatDate(dateString) {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return '유효하지 않은 날짜';
    }

    // 요일 구하기
    const dayOfWeekOptions = { weekday: 'long' };
    const dayOfWeek = date.toLocaleString('ko-KR', dayOfWeekOptions);
    
    // 요일을 한글의 약자로 변환
    const dayMap = {
        '일요일': '(일)',
        '월요일': '(월)',
        '화요일': '(화)',
        '수요일': '(수)',
        '목요일': '(목)',
        '금요일': '(금)',
        '토요일': '(토)'
    };

    const shortDayOfWeek = dayMap[dayOfWeek];

    // 날짜와 시간 포맷팅
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${shortDayOfWeek} ${hours}시 ${minutes}분`;
}

module.exports = { formatDate };
