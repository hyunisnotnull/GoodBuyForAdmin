window.onload = function() {
    const charts = {
        categorySalesChart1: null,
        categorySalesChart2: null,
        categorySalesChart3: null
    };

    const colorPalette = [
        '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FF9633', '#FFC733', '#33FFDC', '#8D33FF', '#3380FF', '#FF3380',
        '#33FF96', '#FF5733', '#33FF57', '#5733FF', '#FFD633', '#C733FF', '#FF33A1', '#FF9633', '#FFC733', '#33FFDC',
        '#FF5733', '#57FF33', '#33A1FF', '#FF8C33', '#33FFC7', '#C7FF33', '#FF33F6', '#FF3357', '#33FF8C', '#FF5733',
        '#C733FF', '#FF9633', '#FFC733', '#3380FF', '#FF3380', '#33FF96', '#3357FF', '#FF5733', '#57FF33', '#33A1FF',
        '#FF33C7', '#8CFF33', '#C733FF', '#FF8C33', '#33FFC7', '#FF33A1', '#FF9633', '#FF3357', '#3380FF', '#33FF8C'
    ];

    // 차트 데이터를 가져와서 렌더링하는 함수
    function fetchAndRenderChart(chartId, queryString, chartType = 'bar') {
        if (charts[chartId]) {
            charts[chartId].destroy();
        }
        
        fetch(`/stat?${queryString}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            let labels, chartData, label, suggestedMax;

            if (chartId === 'categorySalesChart1') {
                labels = data.salesData.map(item => item.category_name);
                chartData = data.salesData.map(item => item.product_count);
                label = '상품 판매 건수';
                suggestedMax = Math.ceil(Math.max(...chartData) / 5) * 5;
            } else if (chartId === 'categorySalesChart2') {
                labels = data.monthlyData.map(item => item.month);
                chartData = data.monthlyData.map(item => item.transaction_count);
                label = '월별 거래량';
                suggestedMax = Math.ceil(Math.max(...chartData) / 5) * 5;
            } else if (chartId === 'categorySalesChart3') {
                labels = data.regionData.map(item => item.region);
                chartData = data.regionData.map(item => item.registration_count);
                label = '지역별 거래량';
                suggestedMax = Math.ceil(Math.max(...chartData) / 5) * 5;
            }

            const ctx = document.getElementById(chartId).getContext('2d');
            charts[chartId] = new Chart(ctx, {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: label,
                        data: chartData,
                        backgroundColor: chartType === 'pie' ? colorPalette : '#FF5733',
                    }]
                },
                options: {
                    responsive: true,
                    scales: chartType !== 'pie' ? { 
                        y: {
                            beginAtZero: true,
                            suggestedMax: suggestedMax,
                            ticks: {
                                callback: function(value) {
                                    return Number.isInteger(value) ? value : '';
                                }
                            }
                        }
                    } : {}
                }
            });
        })
        .catch(error => console.error('데이터 로딩 실패:', error));
    }

    // 차트 유형을 변경하는 함수
    function updateChartType(chartId, chartType) {
        const currentChart = charts[chartId];
        const canvas = document.getElementById(chartId);

        // 차트 유형에 따라 CSS 클래스를 적용
        if (chartType === 'pie') {
            canvas.classList.add('pie-chart');
        } else {
            canvas.classList.remove('pie-chart');
        }

        if (currentChart) {
            const labels = currentChart.data.labels;
            const data = currentChart.data.datasets[0].data;
            const label = currentChart.data.datasets[0].label;

            currentChart.destroy();

            const ctx = document.getElementById(chartId).getContext('2d');
            charts[chartId] = new Chart(ctx, {
                type: chartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: label,
                        data: data,
                        backgroundColor: chartType === 'pie' ? colorPalette : '#FF5733',
                    }]
                },
                options: {
                    responsive: true,
                    scales: chartType !== 'pie' ? {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return Number.isInteger(value) ? value : '';
                                }
                            }
                        }
                    } : {}
                }
            });
        }
    }

    // 엑셀 파일 다운로드
    function downloadChartData(chartId) {
        const chart = charts[chartId];
        if (!chart) {
            alert("차트를 찾을 수 없습니다.");
            return;
        }
    
        const labels = chart.data.labels;
        const data = chart.data.datasets[0].data;
        const labelTitle = chart.data.datasets[0].label;    

        const worksheetData = [
            ["항목", labelTitle], // 차트 데이터 제목
            ...labels.map((label, index) => [label, data[index]]) // 데이터를 행으로 추가
        ];
    
        // 워크시트 및 워크북 생성
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Chart Data");
    
        // 엑셀 파일로 다운로드
        XLSX.writeFile(workbook, `${chartId}_data.xlsx`);
    }

    // PDF 파일 다운로드
    function downloadChartAsPDF(chartId) {
        const chart = charts[chartId];
        if (!chart) {
            alert("차트를 찾을 수 없습니다.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 차트 이미지화
        const chartImage = chart.toBase64Image();

        // 차트 실제 크기
        const chartWidth = chart.width;
        const chartHeight = chart.height;

        const maxPdfWidth = 180; // PDF 최대 크기
        const aspectRatio = chartHeight / chartWidth; // 비율에 맞게 변경
        let pdfWidth = chartWidth;
        let pdfHeight = chartHeight;

        // 차트 크기가 PDF 최대 크기보다 크면 조정
        if (chartWidth > maxPdfWidth) {
            pdfWidth = maxPdfWidth;
            pdfHeight = pdfWidth * aspectRatio;
        }

        doc.addImage(chartImage, 'PNG', 10, 10, pdfWidth, pdfHeight);
        
        doc.save(`${chartId}_chart.pdf`);
    }

    // 기본 탭을 보여주는 함수
    showMainTab('tab1');

    // 모든 form에 이벤트 리스너 추가
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(form);
            const queryString = new URLSearchParams(formData).toString();
            const activeChartId = form.getAttribute('data-chart-id');
            const chartTypeSelect = form.parentElement.querySelector('select[name="chartType"]');
            const chartType = chartTypeSelect ? chartTypeSelect.value : 'bar';

            fetchAndRenderChart(activeChartId, queryString, chartType);
        });
    });

    // 탭 전환 시 차트를 표시하는 함수
    function showMainTab(tabId) {
        document.querySelectorAll('.main-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.main-tab-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`button[onclick="showMainTab('${tabId}')"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        const chartId = tabId.replace('tab', 'categorySalesChart');
        if (!charts[chartId]) {
            let queryString = '';
            fetchAndRenderChart(chartId, queryString);
        }
    }

    window.showMainTab = showMainTab;
    window.updateChartType = updateChartType;
    window.downloadChartData = downloadChartData;
    window.downloadChartAsPDF = downloadChartAsPDF;
};
