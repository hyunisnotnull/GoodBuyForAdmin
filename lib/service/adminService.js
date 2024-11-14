const adminModel = require('../model/adminModel');
const fs = require('fs');
const { getGrade } = require('../config/gradeConfig');
const { calculatePagination, parsePageNumber, getPaginationData } = require('../pagination/paginationUtils');

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
        console.log('req.user.A_ROLE :: ', req.user.A_ROLE);
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
    
        const pageQuery = req.query.page || 1;
        const currentPage = parsePageNumber(pageQuery);
        const itemsPerPage = 5; // 한 페이지당 사용자 수
    
        adminModel.getTotalUsersCount((error, totalCount) => {
            if (error || totalCount === undefined || totalCount === null) {
                console.error(error);
                return res.render('admin/userlist', { loginedAdmin: req.user, users: [], pagination: {} });
            }
    
            const { totalPages, offset } = calculatePagination(totalCount, itemsPerPage, currentPage);
            const paginationData = getPaginationData(currentPage, totalPages, '/admin/userlist');
    
            adminModel.getUsers(offset, itemsPerPage, (error, users) => {
                if (error) {
                    console.error(error);
                    return res.render('admin/userlist', { loginedAdmin: req.user, users: [], pagination: {} });
                }
    
                res.render('admin/userlist', {
                    loginedAdmin: req.user,
                    users,
                    pagination: paginationData
                });
            });
        });
    },

    updateUser: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }
    
        const { id, point, penalty } = req.body;
    
        if (point < 0 || penalty < 0) {
            return res.json({ success: false, message: '포인트와 패널티는 음수가 될 수 없습니다.' });
        }

        const newGrade = getGrade(point);

        console.log("Points:", point);
        console.log("Calculated grade:", newGrade);  // newGrade 확인
    
        adminModel.updateUser(id, point, penalty, (error) => {
            if (error) {
                return res.json({ success: false, message: '사용자 수정 실패' });
            }
    
            // 패널티에 따라 정지일을 늘리기
            if (penalty >= 3) {
                const banStartDate = new Date();
                const banEndDate = new Date();
    
                const additionalDays = Math.floor(penalty / 3);
                banEndDate.setDate(banEndDate.getDate() + additionalDays);
    
                adminModel.updateBanStatus(id, banStartDate, banEndDate, (banError) => {
                    if (banError) {
                        return res.json({ success: false, message: '정지 상태 업데이트 실패' });
                    }
    
                    return res.json({ success: true, message: `정지 상태로 변경되었습니다. 정지일: ${additionalDays}일` });
                });
            } else {
                // 패널티가 3점 미만일 경우 사용자 상태를 원래대로 복원
                adminModel.reactivateUser(id, (reactivateError) => {
                    if (reactivateError) {
                        return res.json({ success: false, message: '사용자 상태 복원 실패' });
                    }
    
                    adminModel.updateGrade(id, newGrade, (gradeError) => {
                        console.log("Calculated grade: ", newGrade);
                        if (gradeError) {
                            return res.json({ success: false, message: '등급 업데이트 실패' });
                        }
                        res.json({ success: true, grade: newGrade });
                    });
                });
            }
        });
    },

    adminlist: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }
    
        const pageQuery = req.query.page || 1;
        const currentPage = parsePageNumber(pageQuery);
        const itemsPerPage = 5; // 한 페이지당 관리자 수
    
        adminModel.getTotalAdminsCount((error, totalCount) => {
            if (error || totalCount === undefined || totalCount === null) {
                console.error(error);
                return res.render('admin/adminlist', { loginedAdmin: req.user, admins: [], pagination: {} });
            }
    
            const { totalPages, offset } = calculatePagination(totalCount, itemsPerPage, currentPage);
            const paginationData = getPaginationData(currentPage, totalPages, '/admin/adminlist');
    
            adminModel.getAdmins(offset, itemsPerPage, (error, admins) => {
                if (error) {
                    console.error(error);
                    return res.render('admin/adminlist', { loginedAdmin: req.user, admins: [], pagination: {} });
                }
    
                res.render('admin/adminlist', {
                    loginedAdmin: req.user,
                    admins,
                    pagination: paginationData
                });
            });
        });
    },

    approveAdmin: (req, res) => {
        const adminId = req.body.id; 
    
        adminModel.approveAdmin(adminId, (error) => {
            if (error) {
                return res.status(500).json({ success: false, message: '관리자 승인 실패' });
            }
            res.json({ success: true, message: '관리자가 승인되었습니다.' });
        });
    },
    
    disapproveAdmin: (req, res) => {
        const adminId = req.body.id; 
    
        adminModel.disapproveAdmin(adminId, (error) => {
            if (error) {
                return res.status(500).json({ success: false, message: '관리자 미승인 실패' });
            }
            res.json({ success: true, message: '관리자가 미승인 처리되었습니다.' });
        });
    },

    getAdminById: (req, res) => {
        const adminId = req.params.id; 
    
        adminModel.getAdminById(adminId, (error, admin) => {
            if (error) {
                return res.status(500).json({ success: false, message: '관리자 정보를 가져오는 데 실패했습니다.' });
            }
            if (!admin || admin.length === 0) {
                return res.status(404).json({ success: false, message: '관리자를 찾을 수 없습니다.' });
            }
            res.json({ success: true, admin: admin[0] });
        });
    },
    

};

module.exports = adminService;
