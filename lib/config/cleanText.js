function removeHtmlTags(input) {
    return input.replace(/<br\s*\/?>/gi, '\n')        // <br> 태그를 줄바꿈으로 변환
                .replace(/&nbsp;/gi, ' ')             // &nbsp;를 공백으로 대체
                .replace(/<[^>]+>/g, '')              // 모든 HTML 태그 제거
                .replace(/[\n\s]+/g, ' ')             // 여분의 공백과 줄바꿈을 하나의 공백으로 대체
                .trim();                              // 앞뒤 공백 제거
}

module.exports = { removeHtmlTags };