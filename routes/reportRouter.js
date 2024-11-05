const express = require('express');
const router = express.Router();
const reportService = require('../lib/service/reportService');

// 신고 목록 페이지
router.get('/list', (req, res) => {
    console.log('/report/list');
    reportService.list(req, res);
});

// 신고 상태 변경 처리
router.post('/report_check/:id', (req, res) => {
    console.log('/report/report_check');
    reportService.reportCheck(req, res);
});

module.exports = router;
