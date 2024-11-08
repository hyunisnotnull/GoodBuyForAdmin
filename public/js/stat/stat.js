window.onload = function() {
    const ctx = document.getElementById('categorySalesChart').getContext('2d');
    const maxValue = Math.max(...salesData.map(item => item.product_count));  // 판매 수량 중 최대값을 찾음
    const suggestedMax = Math.ceil(maxValue / 5) * 5;  // 최대값을 5의 배수로 올림 (여유를 두기 위함)

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: salesData.map(item => item.category_name), // 카테고리 이름
            datasets: [{
                label: '상품 판매 건수',
                data: salesData.map(item => item.product_count), // 판매 수량
                backgroundColor: '#FF5733',
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return Number.isInteger(value) ? value : '';
                        }
                    },
                    suggestedMax: suggestedMax
                }
            }
        }
    });

    // 필터 옵션 변경
    const filterForm = document.querySelector('form');
    filterForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(filterForm);
        const queryString = new URLSearchParams(formData).toString();

        // 새로운 데이터 로드
        fetch(`/stat?${queryString}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json' 
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Fetched Data:', data); 
            // 차트 업데이트
            const maxValue = Math.max(...data.map(item => item.product_count));
            const suggestedMax = Math.ceil(maxValue / 5) * 5;  

            chart.data.labels = data.map(item => item.category_name);
            chart.data.datasets[0].data = data.map(item => item.product_count);
            chart.options.scales.y.suggestedMax = suggestedMax; 
            chart.update();
        })
        .catch(error => console.error('데이터 로딩 실패:', error));
    });
}
