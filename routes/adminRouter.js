const express = require('express');
const router = express.Router();
const adminService = require('../lib/service/adminService');
const uploads = require('../lib/upload/uploads');
const roleCheck = require('../lib/passport/roleCheck');

router.get('/sign_up_form', (req, res) => {
    console.log('/admin/sign_up_form');
    adminService.signupForm(req, res);

});

router.post('/sign_up_confirm', uploads.UPLOAD_PROFILE_MIDDLEWARE(), (req, res) => {
    console.log('/admin/sign_up_form');
    adminService.signupConfirm(req, res);

});

router.get('/sign_in_form', (req, res) => {
    console.log('/admin/sign_in_form');
    adminService.signinForm(req, res);

});

router.get('/modify_form', (req, res) => {
    console.log('/admin/modify_form');
    adminService.modifyForm(req, res);

});

router.post('/modify_confirm', uploads.UPLOAD_PROFILE_MIDDLEWARE(), (req, res) => {
    console.log('/admin/modify_confirm');
    adminService.modifyConfirm(req, res);

});

router.get('/sign_out_confirm', (req, res) => {
    console.log('/admin/sign_out_confirm');
    adminService.signoutConfirm(req, res);

});

router.get('/delete_confirm', (req, res) => {
    console.log('/admin/delete_confirm');
    adminService.deleteConfirm(req, res);

});

// USER LIST START
router.get('/userlist', roleCheck('ADMIN', 'SUPER_ADMIN'), (req, res) => {
    console.log('/admin/userlist');
    adminService.userlist(req, res);

});

router.post('/update_user', roleCheck('ADMIN', 'SUPER_ADMIN'), (req, res) => {
    console.log('/admin/update_user');
    adminService.updateUser(req, res); 
});

// SUPER ADMIN START
router.get('/adminlist', roleCheck('SUPER_ADMIN'), (req, res) => {
    console.log('/admin/adminlist');
    adminService.adminlist(req, res);

});

// 승인 처리
router.post('/approve_admin', roleCheck('SUPER_ADMIN'), (req, res) => {
    console.log('/admin/approve_admin');
    adminService.approveAdmin(req, res);
});

// 미승인 처리
router.post('/disapprove_admin', roleCheck('SUPER_ADMIN'), (req, res) => {
    console.log('/admin/disapprove_admin');
    adminService.disapproveAdmin(req, res);
});

// 특정 관리자 정보
router.get('/get_admin/:id', (req, res) => {
    console.log('/admin/get_admin');
    adminService.getAdminById(req, res);
});

module.exports = router;