function roleCheck(...allowedRoles) {
    return function(req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect('/admin/sign_in_form'); 
        }
        
        if (req.user && allowedRoles.includes(req.user.A_ROLE)) {
            return next(); 
        } else {
            return res.status(403).send('Access denied'); 
        }
    };
}

module.exports = roleCheck;
