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

        statModel.getCategorySalesData(age, sex, rank, (error, data) => {
            if (error) {
                return res.status(500).json({ message: '통계 조회 실패' });
            }
            console.log('Filtered Sales Data:', data);

            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.json(data); 
            }
            
            res.render('stat/stat_form', { 
                loginedAdmin: req.user,
                salesData: data
            });
        });
    },
    

};

module.exports = statService;
