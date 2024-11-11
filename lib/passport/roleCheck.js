function roleCheck(...allowedRoles) {
    return function(req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect('/admin/sign_in_form'); 
        }
        
        if (req.user && allowedRoles.includes(req.user.A_ROLE)) {
            return next(); 
        } else {
            return res.render('error/403', { message: '권한이 없습니다.' });
        }
    };
}

module.exports = roleCheck;
