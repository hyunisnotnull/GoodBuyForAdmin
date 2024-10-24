const express = require('express');
const router = express.Router();
const adminService = require('../lib/service/adminService');
const uploads = require('../lib/upload/uploads');

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

router.get('/userlist', (req, res) => {
    console.log('/admin/userlist');
    adminService.userlist(req, res);

});

module.exports = router;