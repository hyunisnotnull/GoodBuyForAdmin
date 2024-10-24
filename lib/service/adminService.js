const adminModel = require('../model/adminModel');
const fs = require('fs');

const adminService = {
    signupForm: (req, res) => {
        res.render('admin/sign_up_form', { loginedAdmin: req.user });
    },

    signupConfirm: (req, res) => {
        const post = req.body;

        adminModel.checkAdminExists(post.a_id, post.a_mail, (error, result) => {
            if (error || result[0].CNT > 0) {
                res.render('admin/sign_up_ng');
            } else {
                adminModel.createAdmin(post, req.file, (error) => {
                    if (error) {
                        if (req.file) {
                            fs.unlink(`c:\\goodbuyforadmin\\upload\\profile_thums\\${post.a_id}\\${req.file.filename}`, () => {});
                        }
                        res.render('admin/sign_up_ng');
                    } else {
                        res.render('admin/sign_up_ok');
                    }
                });
            }
        });
    },

    signinForm: (req, res) => {
        res.render('admin/sign_in_form', { loginedAdmin: req.user, errMsg: req.query.errMsg });
    },

    modifyForm: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        adminModel.getAdmin(req.user.A_NO, (error, admin) => {
            res.render('admin/modify_form', { loginedAdmin: req.user, admin: admin[0] });
        });
    },

    modifyConfirm: (req, res) => {
        const post = req.body;

        adminModel.updateAdmin(post, req.file, (error) => {
            if (error) {
                res.render('admin/modify_ng');
            } else {
                adminModel.getAdmin(post.a_no, (error, admin) => {
                    req.user = admin[0];
                    res.render('admin/modify_ok');
                });
            }
        });
    },

    signoutConfirm: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/');
        });
    },

    deleteConfirm: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        adminModel.deleteAdmin(req.user.A_NO, (error) => {
            if (error) {
                res.render('admin/delete_ng');
            } else {
                req.session.destroy(() => {
                    res.render('admin/delete_ok');
                });
            }
        });
    },

    userlist: (req, res) => {

        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }
        
        adminModel.getUsers((error, users) => {
            if (error) {
                console.error(error);
                res.render('admin/userlist', { loginedAdmin: req.user, users: [] });
            } else {
                res.render('admin/userlist', { loginedAdmin: req.user, users: users });
            }
        });
    },

};

module.exports = adminService;
