const fs = require('fs');
const eventModel = require('../model/eventModel');
const { calculatePagination, parsePageNumber, getPaginationData } = require('../pagination/paginationUtils');
const { formatDate } = require('../config/formatDate');
const cron = require('node-cron');
const { removeHtmlTags } = require('../config/cleanText');

// 스케줄을 관리할 객체
const scheduledTasks = {};

const eventService = {
    list: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        const pageQuery = req.query.page || 1;
        const currentPage = parsePageNumber(pageQuery);
        const itemsPerPage = 10; // 한 페이지당 이벤트 수

        const sortField = req.query.sort || 'E_NO';  // 기본값 E_NO (번호)
        const sortOrder = req.query.order || 'desc';  // 기본값 오름차순

        eventModel.getTotalEventCount((error, totalCount) => {
            if (error || totalCount === undefined || totalCount === null) {
                console.error(error);
                return res.render('event/list', { loginedAdmin: req.user, events: [], pagination: {} });
            }

            const { totalPages, offset } = calculatePagination(totalCount, itemsPerPage, currentPage);
            const paginationData = getPaginationData(currentPage, totalPages, '/event/list');

            eventModel.getEvents(offset, itemsPerPage, sortField, sortOrder, (error, events) => {
                if (error) {
                    console.error(error);
                    return res.render('event/list', { loginedAdmin: req.user, events: [], pagination: {} });
                }

                const formattedEvents = events.map(event => ({
                    ...event,
                    E_START_DATE: formatDate(event.E_START_DATE),
                    E_END_DATE: formatDate(event.E_END_DATE),
                    originalEndDate: event.E_END_DATE,
                }));

                res.render('event/list', {
                    loginedAdmin: req.user,
                    events: formattedEvents,
                    pagination: paginationData,
                    sortField, 
                    sortOrder
                });
            });
        });
    },

    registerEventForm: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }
        res.render('event/register_event_form', { loginedAdmin: req.user, eventId: null });
    },

    registerEventConfirm: (req, res) => {
        if (req.user === undefined) {
            return res.redirect('/admin/sign_in_form');
        }

        const post = req.body;
        post.description = removeHtmlTags(post.description);
        const imageFilenames = req.files.map(file => file.filename).join(', ');

        eventModel.createEvent(post, imageFilenames, (error, result) => {
            if (error) {
                console.error(error);
                return res.render('event/register_event_ng');
            }

            const newEventId = result.insertId;

            // 스케줄링 추가
            const endDate = new Date(post.endDate);
            const cronTime = `${endDate.getMinutes()} ${endDate.getHours()} ${endDate.getDate()} ${endDate.getMonth() + 1} *`;

            cron.schedule(cronTime, () => {
                eventModel.updateEventStatus(newEventId, 3, (error) => {
                    if (error) {
                        console.error(`비활성화 실패 : ${newEventId}:`, error);
                    } else {
                        console.log(`Event ${newEventId} 비활성화 성공`);
                    }
                });
            });
            console.log(cronTime);

            const eventDir = `c:\\goodbuyforadmin\\upload\\event_images\\${newEventId}\\`;
            if (!fs.existsSync(eventDir)) {
                fs.mkdirSync(eventDir, { recursive: true });
            }

            req.files.forEach(file => {
                const tempPath = `c:\\goodbuyforadmin\\upload\\event_images\\temp\\${file.filename}`;
                const newPath = `${eventDir}${file.filename}`;
                fs.renameSync(tempPath, newPath);
            });

            res.redirect('/event/list');
        });
    },

    modifyEventForm: (req, res) => {
        const eventId = req.params.id;

        eventModel.getEventById(eventId, (error, event) => {
            if (error || event.length === 0) {
                console.error(error);
                res.render('event/modify_event_ng');
            } else {
                res.render('event/modify_event_form', { loginedAdmin: req.user, event: event[0] });
            }
        });
    },

    modifyEventConfirm: (req, res) => {
        const eventId = req.params.id;
        const post = req.body;
        post.description = removeHtmlTags(post.description);

        eventModel.getEventById(eventId, (error, result) => {
            if (error || result.length === 0) {
                console.error(error);
                return res.render('event/modify_event_ng');
            }

            const existingImageFilenames = result[0].E_IMAGE;
            const newImageFilenames = req.files.length > 0 
                ? req.files.map(file => file.filename).join(', ') 
                : existingImageFilenames; 

            eventModel.updateEvent(post, newImageFilenames, eventId, (error) => {
                if (error) {
                    console.error(error);
                    res.render('event/modify_event_ng');
                } else {

                    if (scheduledTasks[eventId]) {
                        scheduledTasks[eventId].destroy(); // 기존 스케줄 제거
                        delete scheduledTasks[eventId]; // 맵에서도 제거
                    }
                    
                    // 새 종료일에 맞춰 스케줄링
                    const endDate = new Date(post.endDate);
                    const cronTime = `${endDate.getMinutes()} ${endDate.getHours()} ${endDate.getDate()} ${endDate.getMonth() + 1} *`;
                    
                    const task = cron.schedule(cronTime, () => {
                        eventModel.updateEventStatus(eventId, 3, (error) => {
                            if (error) {
                                console.error(`비활성화 실패 : ${eventId}:`, error);
                            } else {
                                console.log(`Event ${eventId} 비활성화 성공`);
                            }
                        });
                    });
                    
                    // 새로운 스케줄을 맵에 저장
                    scheduledTasks[eventId] = task;
                    console.log(task);

                    const eventDir = `c:\\goodbuyforadmin\\upload\\event_images\\${eventId}\\`;
                    if (!fs.existsSync(eventDir)) {
                        fs.mkdirSync(eventDir, { recursive: true });
                    }

                    req.files.forEach(file => {
                        const tempPath = `c:\\goodbuyforadmin\\upload\\event_images\\temp\\${file.filename}`;
                        const newPath = `${eventDir}${file.filename}`;
                        fs.renameSync(tempPath, newPath);
                    });

                    res.redirect('/event/list');
                }
            });
        });
    },

    eventStatus: (req, res) => {
        const eventId = req.params.id;

        eventModel.getEventById(eventId, (error, result) => {
            if (error || result.length === 0) {
                console.error(error);
                return res.render('event/update_status_ng');
            }

            const currentStatus = result[0].E_ACTIVE;
            const newStatus = currentStatus === 1 ? 2 : 1; // 1는 활성화, 2은 비활성화

            eventModel.updateEventStatus(eventId, newStatus, (error) => {
                if (error) {
                    console.error(error);
                    return res.render('event/update_status_ng');
                }
                res.redirect('/event/list');
            });
        });
    },

    deleteEventConfirm: (req, res) => {
        const eventId = req.body.eventId;

        eventModel.deleteEvent(eventId, (error) => {
            if (error) {
                console.error(error);
                res.render('event/delete_event_ng');
            } else {
                res.redirect('/event/list');
            }
        });
    },
};

module.exports = eventService;
