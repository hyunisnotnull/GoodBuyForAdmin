const statModel = require('../model/statModel');

const statService = {
    stat: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        const age = req.query.age || 'all';
        const sex = req.query.sex || 'all';
        const rank = req.query.rank || 'all';

        console.log('age ::', age);
        console.log('sex ::', sex);
        console.log('rank ::', rank);

        // 필터 옵션을 위한 DB 쿼리
        statModel.getFilterOptions((error, filterData) => {
            if (error) {
                return res.status(500).json({ message: '필터 옵션 로딩 실패' });
            }

            // 카테고리별 판매 통계 데이터 가져오기
            statModel.getCategorySalesData(age, sex, rank, (error, data) => {
                if (error) {
                    return res.status(500).json({ message: '통계 조회 실패' });
                }
                console.log('Filtered Sales Data:', data);

                // 월별 거래량 데이터 가져오기
                statModel.getMonthlyTransactionData(age, sex, rank, (error, monthlyData) => {
                    if (error) {
                        return res.status(500).json({ message: '월별 거래량 조회 실패' });
                    }
                    console.log('Filtered monthly Data:', monthlyData);

                    // 지역별 등록 건수 데이터 가져오기
                    statModel.getRegionRegistrationData(age, sex, rank, (error, regionData) => {
                        if (error) {
                            return res.status(500).json({ message: '지역별 등록 건수 조회 실패' });
                        }
                        console.log('Filtered region Data:', regionData);

                        // JSON 요청에 대해 JSON 응답
                        if (req.headers.accept && req.headers.accept.includes('application/json')) {
                            return res.json({ salesData, filterData, monthlyData, regionData });
                        }

                        // 일반적인 HTML 렌더링
                        res.render('stat/stat_form', { 
                            loginedAdmin: req.user,
                            salesData: data,
                            filterData: filterData,
                            monthlyData: monthlyData,
                            regionData: regionData
                        });
                    });
                });
            });
        });
    },
};

module.exports = statService;
