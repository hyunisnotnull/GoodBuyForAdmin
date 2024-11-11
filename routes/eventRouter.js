const express = require('express');
const router = express.Router();
const eventService = require('../lib/service/eventService');
const uploads = require('../lib/upload/uploads');
const roleCheck = require('../lib/passport/roleCheck');

// 이벤트 목록 페이지
router.get('/list', roleCheck('ADMIN', 'SUPER_ADMIN'), (req, res) => {
    console.log('/event/list');
    eventService.list(req, res);
});

// 이벤트 등록 폼
router.get('/register_event_form', roleCheck('ADMIN', 'SUPER_ADMIN'), (req, res) => {
    console.log('/event/register_event_form');
    eventService.registerEventForm(req, res);
});

// 이벤트 등록 처리
router.post('/register_event_confirm', roleCheck('ADMIN', 'SUPER_ADMIN'), uploads.UPLOAD_EVENT_IMAGES_MIDDLEWARE(), (req, res) => {
    console.log('/event/register_event_confirm');
    eventService.registerEventConfirm(req, res);
});

// 이벤트 수정 폼
router.get('/modify_event_form/:id', roleCheck('ADMIN', 'SUPER_ADMIN'), (req, res) => {
    console.log('/event/modify_event_form');
    eventService.modifyEventForm(req, res);
});

// 이벤트 수정 처리
router.post('/modify_event_confirm/:id', roleCheck('ADMIN', 'SUPER_ADMIN'), uploads.UPLOAD_EVENT_IMAGES_MIDDLEWARE(), (req, res) => {
    console.log('/event/modify_event_confirm');
    eventService.modifyEventConfirm(req, res);
});

// 이벤트 상태 변경 처리
router.post('/event_status/:id', roleCheck('ADMIN', 'SUPER_ADMIN'), (req, res) => {
    console.log('/event/event_status');
    eventService.eventStatus(req, res);
});

// 이벤트 삭제 처리
router.post('/delete_event_confirm', roleCheck('ADMIN', 'SUPER_ADMIN'), (req, res) => {
    console.log('/event/delete_event_confirm');
    eventService.deleteEventConfirm(req, res);
});

module.exports = router;
