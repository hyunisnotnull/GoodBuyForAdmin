const statModel = require('../model/statModel');

const statService = {
    stat: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        res.render('stat/stat_form', { loginedAdmin: req.user });
    },
    

};

module.exports = statService;
